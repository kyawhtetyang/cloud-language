import React from 'react';
import type { DefaultLanguage } from '../../../config/appConfig';
import { getAppText } from '../../../config/appI18n';
import { localizeLibraryTopic } from '../../../config/libraryI18n';
import type { AlbumUnitEntry } from './libraryTypes';
import { LIBRARY_UI_TOKENS } from './libraryUiTokens';

type UnitRowProps = {
  entry: AlbumUnitEntry;
  albumKey: string | null;
  unitPrefixLabel: string;
  displayUnitCode?: string;
  thumbnailUrl?: string | null;
  hideUnitCode?: boolean;
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
  defaultLanguage: DefaultLanguage;
  activeUnitKey?: string;
  isCompleted: boolean;
  badgeDefaultClass: string;
  badgeActiveClass: string;
  badgeCompletedClass: string;
  accentClass: string;
  actionButtonMode?: 'open' | 'menu';
  onPlayUnit?: (level: number, unit: number, albumKey?: string | null) => void;
  onOpenUnit: (level: number, unit: number, albumKey?: string | null) => void;
  onOpenActionMenu?: (
    level: number,
    unit: number,
    albumKey?: string | null,
    anchorRect?: DOMRect | null,
  ) => void;
};

function formatUnitCode(level: number, unit: number): string {
  return `${Math.max(1, level)}.${Math.max(1, unit)}`;
}

export const UnitRow: React.FC<UnitRowProps> = ({
  entry,
  albumKey,
  unitPrefixLabel,
  displayUnitCode,
  thumbnailUrl,
  hideUnitCode = false,
  isBookmarked = false,
  onToggleBookmark,
  defaultLanguage,
  activeUnitKey,
  isCompleted,
  badgeDefaultClass,
  badgeActiveClass,
  badgeCompletedClass,
  accentClass,
  actionButtonMode = 'open',
  onPlayUnit,
  onOpenUnit,
  onOpenActionMenu,
}) => {
  const libraryText = getAppText(defaultLanguage).library;
  const unitKey = `${entry.level}:${entry.unit}`;
  const isActive = activeUnitKey === unitKey;
  const visibleUnitCode = displayUnitCode || formatUnitCode(entry.level, entry.unit);
  const showsThumbnail = Boolean(thumbnailUrl);
  const showsUnitCode = !hideUnitCode;
  const badgeClass = isActive
    ? badgeActiveClass
    : isCompleted
      ? badgeCompletedClass
      : badgeDefaultClass;

  return (
    <div
      onClick={() => onPlayUnit?.(entry.level, entry.unit, albumKey)}
      onKeyDown={(event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        onPlayUnit?.(entry.level, entry.unit, albumKey);
      }}
      role="button"
      tabIndex={0}
      className={`${LIBRARY_UI_TOKENS.unitRowBase} ${
        isActive
          ? `${LIBRARY_UI_TOKENS.unitRowActive} ${LIBRARY_UI_TOKENS.unitRowActiveSurface}`
          : `bg-transparent ${LIBRARY_UI_TOKENS.unitRowHoverSurface}`
      }`}
    >
      <div className={`grid h-full w-full grid-cols-[auto,minmax(0,1fr),44px] items-center gap-2 px-2`}>
        <div className={`flex items-center justify-start pl-1 ${showsThumbnail ? 'gap-3' : ''}`}>
          {showsThumbnail ? (
            <div className="group relative h-10 w-10 overflow-hidden rounded-xl bg-[linear-gradient(135deg,var(--portfolio-bg),var(--portfolio-surface-muted),var(--portfolio-surface))]">
              <img
                src={thumbnailUrl || ''}
                alt=""
                aria-hidden="true"
                loading="lazy"
                className="h-full w-full object-cover object-center"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="white" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          ) : null}
          {showsUnitCode ? (
            <div
              className={`inline-flex min-w-[44px] items-center justify-start text-left text-[13px] font-semibold tabular-nums ${badgeClass}`}
            >
              <span
                aria-label={
                  isCompleted
                    ? libraryText.completedUnitAriaLabel
                    : `${unitPrefixLabel} ${visibleUnitCode}`
                }
              >
                {isCompleted ? (
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
                    <path
                      d="M20 7L10 17l-6-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  visibleUnitCode
                )}
              </span>
            </div>
          ) : null}
        </div>
        <div className="min-w-0 flex-1 pr-1">
          <p className={`truncate whitespace-nowrap text-[15px] font-semibold leading-tight ${isActive ? 'text-brand' : 'text-[var(--portfolio-text)]'}`}>
            {localizeLibraryTopic(entry.topic, defaultLanguage)}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {onToggleBookmark ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onToggleBookmark();
              }}
              className={`${LIBRARY_UI_TOKENS.unitOpenButton} ${
                isBookmarked ? 'bg-brand/15 text-brand' : accentClass
              }`}
              aria-label={libraryText.bookmarkTrackLabel}
              title={libraryText.bookmarkTrackLabel}
            >
              {isBookmarked ? (
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                  <path d="M12 21s-6.4-4.35-9.1-7.1C.6 11.6.6 7.9 3 5.7c2.1-2 5.4-1.7 7.2.3L12 7.8l1.8-1.8c1.8-2 5.1-2.3 7.2-.3c2.4 2.2 2.4 5.9.1 8.2C18.4 16.65 12 21 12 21z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              )}
            </button>
          ) : null}
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              if (actionButtonMode === 'menu') {
                onOpenActionMenu?.(
                  entry.level,
                  entry.unit,
                  albumKey,
                  event.currentTarget.getBoundingClientRect(),
                );
                return;
              }
              onOpenUnit(entry.level, entry.unit, albumKey);
            }}
            className={`${LIBRARY_UI_TOKENS.unitOpenButton} ${
              isActive
                ? 'bg-[var(--surface-default)] text-brand'
                : accentClass
            }`}
            aria-label={
              actionButtonMode === 'menu'
                ? `More actions ${visibleUnitCode}`
                : `${libraryText.openLessonAriaPrefix} ${visibleUnitCode}`
            }
            title={actionButtonMode === 'menu' ? 'More actions' : libraryText.openLessonTitle}
          >
            {actionButtonMode === 'menu' ? (
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="currentColor"
                aria-hidden="true"
              >
                <circle cx="6" cy="12" r="1.8" />
                <circle cx="12" cy="12" r="1.8" />
                <circle cx="18" cy="12" r="1.8" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 6l6 6-6 6" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

