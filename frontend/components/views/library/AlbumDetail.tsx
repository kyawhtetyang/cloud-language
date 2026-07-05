import React from 'react';
import type { DefaultLanguage } from '../../../config/appConfig';
import { getAppText } from '../../../config/appI18n';
import type { AlbumGroup } from './libraryTypes';
import { LIBRARY_UI_TOKENS } from './libraryUiTokens';
import { UnitRow } from './UnitRow';
import { BUTTON_UI } from '../../../config/buttonUi';

type AlbumDetailProps = {
  album: AlbumGroup;
  albumKey: string | null;
  albumTitle: string;
  playAllLabel: string;
  unitPrefixLabel: string;
  defaultLanguage: DefaultLanguage;
  activeUnitKey?: string;
  completedUnitKeys?: Set<string>;
  accentClass: string;
  badgeDefaultClass: string;
  badgeActiveClass: string;
  badgeCompletedClass: string;
  onPlayAlbum?: (units: Array<{ level: number; unit: number }>, albumKey?: string | null) => void;
  onPlayUnit?: (level: number, unit: number, albumKey?: string | null) => void;
  onOpenUnit: (level: number, unit: number, albumKey?: string | null) => void;
  isUnitBookmarked?: (level: number, unit: number) => boolean;
  onToggleUnitBookmark?: (level: number, unit: number) => void;
  isAlbumBookmarked?: boolean;
  onToggleAlbumBookmark?: () => void;
  formatAlbumMeta: (group: AlbumGroup) => string;
  onTouchStart: React.TouchEventHandler<HTMLElement>;
  onTouchMove: React.TouchEventHandler<HTMLElement>;
  onTouchEnd: React.TouchEventHandler<HTMLElement>;
  onTouchCancel: React.TouchEventHandler<HTMLElement>;
};

export const AlbumDetail: React.FC<AlbumDetailProps> = ({
  album,
  albumKey,
  albumTitle,
  playAllLabel,
  unitPrefixLabel,
  defaultLanguage,
  activeUnitKey,
  completedUnitKeys,
  accentClass,
  badgeDefaultClass,
  badgeActiveClass,
  badgeCompletedClass,
  onPlayAlbum,
  onPlayUnit,
  onOpenUnit,
  isUnitBookmarked,
  onToggleUnitBookmark,
  isAlbumBookmarked = false,
  onToggleAlbumBookmark,
  formatAlbumMeta,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onTouchCancel,
}) => {
  const libraryText = getAppText(defaultLanguage).library;

  const hskDisplayPrefix = (() => {
    if ((album.levelScheme || '').toLowerCase() !== 'hsk') return null;
    const normalized = String(album.sourceLabel || '').replace(/^HSK\s*\d+\s*/i, '').trim();
    if (/^Course\b/i.test(normalized)) return null;
    const match = String(album.levelCode || '').match(/HSK\s*(\d+)/i);
    return match ? match[1] : null;
  })();

  return (
    <div
      className="w-full pt-16 md:pt-20"
      data-testid="album-detail-view"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchCancel}
    >
      <div className={`overflow-hidden ${LIBRARY_UI_TOKENS.sectionWrap}`}>
        <div className="portfolio-panel-subtle rounded-3xl px-4 py-3.5 md:px-5">
          <div className="flex items-center gap-3">
            <div className="relative aspect-[3/4] w-24 shrink-0 overflow-hidden rounded-xl border border-[var(--border-subtle)]">
              <div className="absolute inset-y-0 left-0 z-10 w-2 bg-black/12" aria-hidden="true" />
              <img
                src={album.coverUrl}
                alt=""
                aria-hidden="true"
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover object-center"
              />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-extrabold leading-tight text-[var(--portfolio-text)]">{albumTitle}</h3>
              <p className="mt-1 text-sm font-semibold text-[var(--portfolio-text-secondary)]">{formatAlbumMeta(album)}</p>
              <div className="mt-1.5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    onPlayAlbum?.(
                      album.units.map((entry) => ({ level: entry.level, unit: entry.unit })),
                      albumKey,
                    )
                  }
                  className={LIBRARY_UI_TOKENS.iconButton}
                  aria-label={playAllLabel}
                  title={playAllLabel}
                >
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 7.5v9l7-4.5z" fill="currentColor" stroke="none" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={onToggleAlbumBookmark}
                  className={isAlbumBookmarked
                    ? `${BUTTON_UI.iconCircleButtonBase} ${BUTTON_UI.iconCircleButtonActive}`
                    : LIBRARY_UI_TOKENS.iconButton}
                  aria-label={libraryText.bookmarkAlbumLabel}
                  title={libraryText.bookmarkAlbumLabel}
                >
                  {isAlbumBookmarked ? (
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                      <path d="M6 3h12v18l-6-4-6 4z" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M6 3h12v18l-6-4-6 4z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          {album.units.map((entry) => (
            <UnitRow
              key={`${entry.stage}-${entry.level}-${entry.unit}`}
              entry={entry}
              albumKey={albumKey}
              unitPrefixLabel={unitPrefixLabel}
              displayUnitCode={hskDisplayPrefix ? `${hskDisplayPrefix}.${album.units.findIndex((candidate) => candidate.level === entry.level && candidate.unit === entry.unit) + 1}` : undefined}
              defaultLanguage={defaultLanguage}
              activeUnitKey={activeUnitKey}
              isCompleted={completedUnitKeys?.has(`${entry.level}:${entry.unit}`) ?? false}
              isBookmarked={Boolean(isUnitBookmarked?.(entry.level, entry.unit))}
              onToggleBookmark={() => onToggleUnitBookmark?.(entry.level, entry.unit)}
              badgeDefaultClass={badgeDefaultClass}
              badgeActiveClass={badgeActiveClass}
              badgeCompletedClass={badgeCompletedClass}
              accentClass={accentClass}
              actionButtonMode="open"
              onPlayUnit={onPlayUnit}
              onOpenUnit={onOpenUnit}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

