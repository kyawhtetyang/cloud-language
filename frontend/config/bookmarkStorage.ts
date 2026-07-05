const BOOKMARKED_UNIT_KEYS_STORAGE_KEY = 'lingo_burmese_bookmarked_unit_keys';
const BOOKMARKED_ALBUM_KEYS_STORAGE_KEY = 'lingo_burmese_bookmarked_album_keys';

function toScopedKey(baseKey: string, profileStorageId: string): string {
  return `${baseKey}:${profileStorageId}`;
}

function readStringArray(storageKey: string): string[] {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === 'string') : [];
  } catch {
    return [];
  }
}

function writeStringArray(storageKey: string, values: Iterable<string>): void {
  try {
    localStorage.setItem(storageKey, JSON.stringify(Array.from(values)));
  } catch {
    // Ignore storage failures in restricted environments.
  }
}

export function readBookmarkedUnitKeys(profileStorageId: string): Set<string> {
  if (!profileStorageId) return new Set<string>();
  return new Set(readStringArray(toScopedKey(BOOKMARKED_UNIT_KEYS_STORAGE_KEY, profileStorageId)));
}

export function writeBookmarkedUnitKeys(profileStorageId: string, values: Iterable<string>): void {
  if (!profileStorageId) return;
  writeStringArray(toScopedKey(BOOKMARKED_UNIT_KEYS_STORAGE_KEY, profileStorageId), values);
}

export function readBookmarkedAlbumKeys(profileStorageId: string): Set<string> {
  if (!profileStorageId) return new Set<string>();
  return new Set(readStringArray(toScopedKey(BOOKMARKED_ALBUM_KEYS_STORAGE_KEY, profileStorageId)));
}

export function writeBookmarkedAlbumKeys(profileStorageId: string, values: Iterable<string>): void {
  if (!profileStorageId) return;
  writeStringArray(toScopedKey(BOOKMARKED_ALBUM_KEYS_STORAGE_KEY, profileStorageId), values);
}

