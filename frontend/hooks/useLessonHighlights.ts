import { useCallback, useEffect, useMemo, useState } from 'react';
import { LEARN_LANGUAGE_OPTIONS, LESSON_HIGHLIGHTS_KEY, LearnLanguage } from '../config/appConfig';
import { LessonHighlight, LessonData } from '../types';
import { buildLessonReferenceKey } from '../utils/lessonReference';
import { buildProfileAuthHeaders } from '../utils/profileAuth';

const GUEST_PROFILE_STORAGE_ID = 'guest';

function getStorageKey(profileStorageId: string, learnLanguage: LearnLanguage): string {
  const normalizedProfileStorageId = profileStorageId?.trim() || GUEST_PROFILE_STORAGE_ID;
  return `${LESSON_HIGHLIGHTS_KEY}:${normalizedProfileStorageId}:${learnLanguage}`;
}

function normalizeSelectionText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function getHighlightPhraseKey(selectedText: string): string {
  return normalizeSelectionText(selectedText).toLocaleLowerCase();
}

function getHighlightMergeKey(lessonKey: string, selectedText: string): string {
  return `${lessonKey}::${getHighlightPhraseKey(selectedText)}`;
}

function getCreatedAtTimestamp(value: string): number {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function isLessonHighlight(value: unknown): value is LessonHighlight {
  if (!value || typeof value !== 'object') return false;
  const entry = value as Partial<LessonHighlight>;
  return (
    typeof entry.id === 'string'
    && typeof entry.profileStorageId === 'string'
    && typeof entry.learnLanguage === 'string'
    && typeof entry.lessonKey === 'string'
    && typeof entry.lessonText === 'string'
    && typeof entry.selectedText === 'string'
    && typeof entry.createdAt === 'string'
  );
}

function readHighlightsFromStorage(storageKey: string): LessonHighlight[] {
  try {
    const rawValue = localStorage.getItem(storageKey);
    if (!rawValue) return [];
    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isLessonHighlight);
  } catch {
    return [];
  }
}

function writeHighlightsToStorage(storageKey: string, highlights: LessonHighlight[]): void {
  try {
    localStorage.setItem(storageKey, JSON.stringify(highlights));
  } catch {
    // localStorage can fail in private mode or restricted environments.
  }
}

function normalizeRemoteHighlight(
  entry: unknown,
  profileId: string,
  learnLanguage: LearnLanguage,
): LessonHighlight | null {
  if (!entry || typeof entry !== 'object') return null;
  const raw = entry as Record<string, unknown>;
  const lessonKey = typeof raw.lessonKey === 'string' ? raw.lessonKey.trim() : '';
  const lessonText = typeof raw.lessonText === 'string' ? raw.lessonText : '';
  const selectedText = typeof raw.selectedText === 'string' ? normalizeSelectionText(raw.selectedText) : '';
  const createdAt = typeof raw.createdAt === 'string' && raw.createdAt.trim()
    ? raw.createdAt
    : new Date().toISOString();
  if (!lessonKey || !selectedText) return null;
  const id = typeof raw.id === 'string' && raw.id.trim()
    ? raw.id
    : `${profileId}:${learnLanguage}:${getHighlightMergeKey(lessonKey, selectedText)}`;
  return {
    id,
    profileStorageId: profileId,
    learnLanguage,
    lessonKey,
    lessonText,
    selectedText,
    createdAt,
  };
}

function mergeHighlights(localHighlights: LessonHighlight[], remoteHighlights: LessonHighlight[]): LessonHighlight[] {
  const mergedByKey = new Map<string, LessonHighlight>();
  for (const item of [...localHighlights, ...remoteHighlights]) {
    const mergeKey = getHighlightMergeKey(item.lessonKey, item.selectedText);
    const current = mergedByKey.get(mergeKey);
    if (!current) {
      mergedByKey.set(mergeKey, item);
      continue;
    }
    const currentCreatedAt = getCreatedAtTimestamp(current.createdAt);
    const nextCreatedAt = getCreatedAtTimestamp(item.createdAt);
    if (nextCreatedAt >= currentCreatedAt) {
      mergedByKey.set(mergeKey, item);
    }
  }
  return Array.from(mergedByKey.values()).sort(
    (a, b) => getCreatedAtTimestamp(b.createdAt) - getCreatedAtTimestamp(a.createdAt),
  );
}

type UseLessonHighlightsParams = {
  apiBaseUrl: string;
  profileName: string;
  profileStorageId: string;
  learnLanguage: LearnLanguage;
  logReviewEvent?: (eventType: string, metadata?: Record<string, unknown>) => void;
};

export function useLessonHighlights({
  apiBaseUrl,
  profileName,
  profileStorageId,
  learnLanguage,
  logReviewEvent,
}: UseLessonHighlightsParams) {
  const [highlights, setHighlights] = useState<LessonHighlight[]>([]);
  const storageKey = useMemo(() => getStorageKey(profileStorageId, learnLanguage), [learnLanguage, profileStorageId]);

  useEffect(() => {
    const localHighlights = readHighlightsFromStorage(storageKey);
    setHighlights(localHighlights);

    const normalizedProfileName = profileName.trim();
    if (!normalizedProfileName) return;

    let cancelled = false;
    const controller = new AbortController();
    const profileId = profileStorageId?.trim() || GUEST_PROFILE_STORAGE_ID;

    const hydrateRemoteHighlights = async () => {
      try {
        const response = await fetch(
          `${apiBaseUrl}/api/highlights?profileName=${encodeURIComponent(normalizedProfileName)}&learnLanguage=${encodeURIComponent(learnLanguage)}`,
          {
            signal: controller.signal,
            headers: {
              ...buildProfileAuthHeaders(profileId),
            },
          },
        );
        if (!response.ok) return;
        const payload = await response.json();
        if (!Array.isArray(payload)) return;
        const remoteHighlights = payload
          .map((entry) => normalizeRemoteHighlight(entry, profileId, learnLanguage))
          .filter((entry): entry is LessonHighlight => entry !== null);
        if (cancelled) return;
        setHighlights((prev) => {
          const merged = mergeHighlights(prev, remoteHighlights);
          writeHighlightsToStorage(storageKey, merged);
          return merged;
        });
      } catch {
        // Remote sync is optional; local storage remains source of truth.
      }
    };

    void hydrateRemoteHighlights();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [apiBaseUrl, learnLanguage, profileName, profileStorageId, storageKey]);

  const saveHighlightSelection = useCallback((lesson: LessonData, rawSelectedText: string): boolean => {
    const selectedText = normalizeSelectionText(rawSelectedText);
    if (!selectedText) return false;
    if (!LEARN_LANGUAGE_OPTIONS.some((option) => option.code === learnLanguage)) return false;

    const lessonKey = buildLessonReferenceKey(lesson);
    const profileId = profileStorageId?.trim() || GUEST_PROFILE_STORAGE_ID;
    const mergeKey = getHighlightMergeKey(lessonKey, selectedText);
    const nextEntry: LessonHighlight = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      profileStorageId: profileId,
      learnLanguage,
      lessonKey,
      lessonText: lesson.english,
      selectedText,
      createdAt: new Date().toISOString(),
    };

    let didSave = false;
    setHighlights((prev) => {
      const next = [
        nextEntry,
        ...prev.filter((entry) => getHighlightMergeKey(entry.lessonKey, entry.selectedText) !== mergeKey),
      ];
      writeHighlightsToStorage(storageKey, next);
      return next;
    });
    didSave = true;

    if (didSave) {
      const normalizedProfileName = profileName.trim();
      if (normalizedProfileName) {
        void fetch(`${apiBaseUrl}/api/highlights`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...buildProfileAuthHeaders(profileId),
          },
          body: JSON.stringify({
            profileName: normalizedProfileName,
            learnLanguage,
            lessonKey,
            lessonText: lesson.english,
            selectedText,
            createdAt: nextEntry.createdAt,
          }),
        }).catch(() => {
          // Highlight sync is best effort; local storage remains source of truth.
        });
      }
      logReviewEvent?.('highlight_saved', {
        lessonKey,
        selectedText,
      });
    }

    return didSave;
  }, [apiBaseUrl, learnLanguage, logReviewEvent, profileName, profileStorageId, storageKey]);

  const clearHighlightSelection = useCallback((lesson: LessonData): boolean => {
    const lessonKey = buildLessonReferenceKey(lesson);
    const profileId = profileStorageId?.trim() || GUEST_PROFILE_STORAGE_ID;
    const hadExisting = highlights.some((entry) => entry.lessonKey === lessonKey);
    setHighlights((prev) => {
      const next = prev.filter((entry) => entry.lessonKey !== lessonKey);
      if (next.length === prev.length) return prev;
      writeHighlightsToStorage(storageKey, next);
      return next;
    });
    if (hadExisting) {
      const normalizedProfileName = profileName.trim();
      if (normalizedProfileName) {
        void fetch(
          `${apiBaseUrl}/api/highlights?profileName=${encodeURIComponent(normalizedProfileName)}&learnLanguage=${encodeURIComponent(learnLanguage)}&lessonKey=${encodeURIComponent(lessonKey)}`,
          {
            method: 'DELETE',
            headers: {
              ...buildProfileAuthHeaders(profileId),
            },
          },
        ).catch(() => {
          // Highlight sync is best effort; local storage remains source of truth.
        });
      }
      logReviewEvent?.('highlight_cleared', {
        lessonKey,
      });
    }
    return hadExisting;
  }, [apiBaseUrl, highlights, learnLanguage, logReviewEvent, profileName, profileStorageId, storageKey]);

  const highlightCountByLessonKey = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of highlights) {
      counts.set(item.lessonKey, (counts.get(item.lessonKey) ?? 0) + 1);
    }
    return counts;
  }, [highlights]);

  const highlightPhrasesByLessonKey = useMemo(() => {
    const phraseSetByLessonKey = new Map<string, Set<string>>();
    for (const item of highlights) {
      const normalizedPhrase = normalizeSelectionText(item.selectedText);
      if (!normalizedPhrase) continue;
      if (!phraseSetByLessonKey.has(item.lessonKey)) {
        phraseSetByLessonKey.set(item.lessonKey, new Set<string>());
      }
      phraseSetByLessonKey.get(item.lessonKey)?.add(normalizedPhrase);
    }

    const phrasesByLessonKey = new Map<string, string[]>();
    phraseSetByLessonKey.forEach((phraseSet, lessonKey) => {
      const sortedPhrases = Array.from(phraseSet).sort((a, b) => b.length - a.length);
      phrasesByLessonKey.set(lessonKey, sortedPhrases);
    });
    return phrasesByLessonKey;
  }, [highlights]);

  return {
    highlights,
    highlightCountByLessonKey,
    highlightPhrasesByLessonKey,
    saveHighlightSelection,
    clearHighlightSelection,
  };
}

