export const UNIT_BOOKMARK_SEPARATOR = '::' as const;

export function normalizeAlbumKeyForUnitBookmark(albumKey?: string | null): string {
  const trimmed = String(albumKey || '').trim();
  return trimmed.length > 0 ? trimmed : 'unknown';
}

export function buildUnitBookmarkKey(
  level: number,
  unit: number,
  albumKey?: string | null,
): string {
  const normalizedLevel = Math.max(1, Math.floor(level));
  const normalizedUnit = Math.max(1, Math.floor(unit));
  return `${normalizeAlbumKeyForUnitBookmark(albumKey)}${UNIT_BOOKMARK_SEPARATOR}${normalizedLevel}:${normalizedUnit}`;
}

export function parseUnitBookmarkKey(
  key: string,
): { albumKey: string; level: number; unit: number } | null {
  const raw = String(key || '').trim();
  if (!raw) return null;

  const match = raw.match(/^(.*)::(\d+):(\d+)$/);
  if (!match) return null;

  const albumKey = match[1].trim();
  const level = Number(match[2]);
  const unit = Number(match[3]);
  if (!Number.isFinite(level) || !Number.isFinite(unit) || level <= 0 || unit <= 0) return null;

  return { albumKey, level, unit };
}

export function isLegacyUnitBookmarkKey(key: string): boolean {
  return /^(\d+):(\d+)$/.test(String(key || '').trim());
}

