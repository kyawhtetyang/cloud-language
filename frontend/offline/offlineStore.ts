import { LessonData } from '../types';
import { getLessonOrderIndex, getLessonUnitId } from '../config/appConfig';

const DB_NAME = 'cloudlanguage_offline';
const DB_VERSION = 1;
const LESSON_PACKS_STORE = 'lesson_packs';
const DOWNLOAD_STATE_STORE = 'download_state';
const SYNC_QUEUE_STORE = 'sync_queue';

type LessonPackRecord = {
  id: string;
  language: string;
  level: number;
  unit: number;
  version: string;
  lessons: LessonData[];
  updatedAt: string;
};

type DownloadStateRecord = {
  id: string;
  language: string;
  level: number;
  unit: number;
  downloadedAt: string;
};

type SyncQueueStatus = 'pending' | 'processing' | 'failed' | 'done';

type SyncQueueRecord = {
  id?: number;
  type: 'progress_update';
  profileName: string;
  profileSecret?: string;
  bearerToken?: string;
  payload: Record<string, unknown>;
  clientUpdatedAt: string;
  status: SyncQueueStatus;
  attemptCount: number;
  nextAttemptAt: number;
  createdAt: number;
  lastError?: string;
};

function canUseIndexedDb(): boolean {
  return typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';
}

function buildLessonPackId(language: string, level: number, unit: number): string {
  return `${language}:${level}:${unit}`;
}

function openDb(): Promise<IDBDatabase | null> {
  if (!canUseIndexedDb()) return Promise.resolve(null);

  return new Promise((resolve) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(LESSON_PACKS_STORE)) {
        const lessonPacks = db.createObjectStore(LESSON_PACKS_STORE, { keyPath: 'id' });
        lessonPacks.createIndex('by_language', 'language', { unique: false });
      }
      if (!db.objectStoreNames.contains(DOWNLOAD_STATE_STORE)) {
        const downloadState = db.createObjectStore(DOWNLOAD_STATE_STORE, { keyPath: 'id' });
        downloadState.createIndex('by_language', 'language', { unique: false });
      }
      if (!db.objectStoreNames.contains(SYNC_QUEUE_STORE)) {
        const syncQueue = db.createObjectStore(SYNC_QUEUE_STORE, { keyPath: 'id', autoIncrement: true });
        syncQueue.createIndex('by_status_next_attempt', ['status', 'nextAttemptAt'], { unique: false });
        syncQueue.createIndex('by_profile_type_status', ['profileName', 'type', 'status'], { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
    request.onblocked = () => resolve(null);
  });
}

export async function saveLessonPack(
  language: string,
  level: number,
  unit: number,
  lessons: LessonData[],
  version = 'v1',
): Promise<void> {
  const db = await openDb();
  if (!db || lessons.length === 0) return;

  await new Promise<void>((resolve) => {
    const tx = db.transaction([LESSON_PACKS_STORE, DOWNLOAD_STATE_STORE], 'readwrite');
    const lessonStore = tx.objectStore(LESSON_PACKS_STORE);
    const downloadStore = tx.objectStore(DOWNLOAD_STATE_STORE);
    const id = buildLessonPackId(language, level, unit);
    const nowIso = new Date().toISOString();

    const lessonRecord: LessonPackRecord = {
      id,
      language,
      level,
      unit,
      version,
      lessons,
      updatedAt: nowIso,
    };
    const downloadRecord: DownloadStateRecord = {
      id,
      language,
      level,
      unit,
      downloadedAt: nowIso,
    };

    lessonStore.put(lessonRecord);
    downloadStore.put(downloadRecord);
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
    tx.onabort = () => resolve();
  });
}

export async function removeLessonPack(language: string, level: number, unit: number): Promise<void> {
  const db = await openDb();
  if (!db) return;

  await new Promise<void>((resolve) => {
    const tx = db.transaction([LESSON_PACKS_STORE, DOWNLOAD_STATE_STORE], 'readwrite');
    const lessonStore = tx.objectStore(LESSON_PACKS_STORE);
    const downloadStore = tx.objectStore(DOWNLOAD_STATE_STORE);
    const id = buildLessonPackId(language, level, unit);

    lessonStore.delete(id);
    downloadStore.delete(id);

    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
    tx.onabort = () => resolve();
  });
}

export async function readDownloadedLessonsByLanguage(language: string): Promise<LessonData[]> {
  const db = await openDb();
  if (!db) return [];

  return new Promise((resolve) => {
    const tx = db.transaction(LESSON_PACKS_STORE, 'readonly');
    const store = tx.objectStore(LESSON_PACKS_STORE);
    const index = store.index('by_language');
    const request = index.getAll(IDBKeyRange.only(language));

    request.onsuccess = () => {
      const rows = (request.result as LessonPackRecord[]) || [];
      const lessons = rows
        .sort((a, b) => a.level - b.level || a.unit - b.unit)
        .flatMap((row) => row.lessons);
      lessons.sort((a, b) => getLessonOrderIndex(a) - getLessonOrderIndex(b) || getLessonUnitId(a) - getLessonUnitId(b));
      resolve(lessons);
    };
    request.onerror = () => resolve([]);
  });
}

export async function readDownloadedUnitKeys(language: string): Promise<Set<string>> {
  const db = await openDb();
  if (!db) return new Set();

  return new Promise((resolve) => {
    const tx = db.transaction(DOWNLOAD_STATE_STORE, 'readonly');
    const store = tx.objectStore(DOWNLOAD_STATE_STORE);
    const index = store.index('by_language');
    const request = index.getAll(IDBKeyRange.only(language));

    request.onsuccess = () => {
      const rows = (request.result as DownloadStateRecord[]) || [];
      resolve(new Set(rows.map((row) => `${row.level}:${row.unit}`)));
    };
    request.onerror = () => resolve(new Set());
  });
}

async function replacePendingProgressUpdate(
  db: IDBDatabase,
  profileName: string,
  nextPayload: SyncQueueRecord,
): Promise<void> {
  await new Promise<void>((resolve) => {
    const tx = db.transaction(SYNC_QUEUE_STORE, 'readwrite');
    const store = tx.objectStore(SYNC_QUEUE_STORE);
    const index = store.index('by_profile_type_status');

    const statuses: SyncQueueStatus[] = ['pending', 'failed'];
    let pendingRequests = statuses.length;
    const idsToDelete: number[] = [];

    const completeIfDone = () => {
      pendingRequests -= 1;
      if (pendingRequests > 0) return;
      for (const id of idsToDelete) {
        store.delete(id);
      }
      store.add(nextPayload);
    };

    for (const status of statuses) {
      const req = index.getAll([profileName, 'progress_update', status]);
      req.onsuccess = () => {
        const rows = (req.result as SyncQueueRecord[]) || [];
        for (const row of rows) {
          if (typeof row.id === 'number') idsToDelete.push(row.id);
        }
        completeIfDone();
      };
      req.onerror = () => completeIfDone();
    }

    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
    tx.onabort = () => resolve();
  });
}

export async function enqueueProgressUpdate(
  profileName: string,
  payload: Record<string, unknown>,
  clientUpdatedAt: string,
  profileSecret?: string,
  bearerToken?: string,
): Promise<void> {
  const db = await openDb();
  if (!db) {
    throw new Error('indexeddb_unavailable');
  }

  const item: SyncQueueRecord = {
    type: 'progress_update',
    profileName,
    profileSecret,
    bearerToken,
    payload,
    clientUpdatedAt,
    status: 'pending',
    attemptCount: 0,
    nextAttemptAt: Date.now(),
    createdAt: Date.now(),
  };

  await replacePendingProgressUpdate(db, profileName, item);
}

async function getDueQueueItems(db: IDBDatabase, limit = 20): Promise<SyncQueueRecord[]> {
  return new Promise((resolve) => {
    const tx = db.transaction(SYNC_QUEUE_STORE, 'readonly');
    const store = tx.objectStore(SYNC_QUEUE_STORE);
    const request = store.getAll();

    request.onsuccess = () => {
      const now = Date.now();
      const rows = (request.result as SyncQueueRecord[]) || [];
      const due = rows
        .filter((row) => (row.status === 'pending' || row.status === 'failed') && row.nextAttemptAt <= now)
        .sort((a, b) => a.createdAt - b.createdAt)
        .slice(0, limit);
      resolve(due);
    };
    request.onerror = () => resolve([]);
  });
}

async function updateQueueRecord(db: IDBDatabase, row: SyncQueueRecord): Promise<void> {
  await new Promise<void>((resolve) => {
    const tx = db.transaction(SYNC_QUEUE_STORE, 'readwrite');
    tx.objectStore(SYNC_QUEUE_STORE).put(row);
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
    tx.onabort = () => resolve();
  });
}

export async function resetProcessingQueueItems(): Promise<void> {
  const db = await openDb();
  if (!db) return;

  await new Promise<void>((resolve) => {
    const tx = db.transaction(SYNC_QUEUE_STORE, 'readwrite');
    const store = tx.objectStore(SYNC_QUEUE_STORE);
    const request = store.getAll();

    request.onsuccess = () => {
      const rows = (request.result as SyncQueueRecord[]) || [];
      for (const row of rows) {
        if (row.status === 'processing') {
          row.status = 'pending';
          row.nextAttemptAt = Date.now();
          store.put(row);
        }
      }
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
    tx.onabort = () => resolve();
  });
}

export async function flushProgressQueue(apiBaseUrl: string): Promise<void> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return;
  const db = await openDb();
  if (!db) return;

  const dueItems = await getDueQueueItems(db, 20);
  for (const item of dueItems) {
    if (typeof item.id !== 'number') continue;

    item.status = 'processing';
    await updateQueueRecord(db, item);

    try {
      const response = await fetch(`${apiBaseUrl}/api/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(item.bearerToken ? { Authorization: `Bearer ${item.bearerToken}` } : {}),
          ...(item.profileSecret ? { 'X-Profile-Secret': item.profileSecret } : {}),
        },
        body: JSON.stringify({
          ...item.payload,
          profileName: item.profileName,
          clientUpdatedAt: item.clientUpdatedAt,
        }),
      });
      if (!response.ok) {
        throw new Error(`sync_failed_${response.status}`);
      }

      item.status = 'done';
      item.lastError = undefined;
      await updateQueueRecord(db, item);
    } catch (error) {
      const nextAttemptCount = item.attemptCount + 1;
      const delayMs = Math.min(60_000, 1_000 * (2 ** Math.min(nextAttemptCount, 6)));
      item.status = 'failed';
      item.attemptCount = nextAttemptCount;
      item.nextAttemptAt = Date.now() + delayMs;
      item.lastError = error instanceof Error ? error.message : 'sync_error';
      await updateQueueRecord(db, item);
    }
  }
}

