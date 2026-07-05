import React from 'react';
import type { DefaultLanguage } from '../../config/appConfig';
import { AppTextPack } from '../../config/appI18n';
import type { AlbumUnitEntry } from './library/libraryTypes';
import { LIBRARY_STATE_STYLE } from './library/libraryUiTokens';
import { UnitRow } from './library/UnitRow';

export type ProfileBookShelf = 'current_course' | 'bookmarked_albums' | 'bookmarked_lessons';

type ProfileAlbumCard = {
  key: string;
  title: string;
  meta: string;
  coverUrl: string | null;
  totalUnitCount: number;
  bookmarkedUnitCount: number;
  isCurrentCourse: boolean;
  isBookmarked: boolean;
  onOpen: () => void;
};

type ProfileBookmarkedLessonRow = {
  key: string;
  albumKey: string | null;
  entry: AlbumUnitEntry;
  isCompleted: boolean;
  isBookmarked: boolean;
  onPlay: () => void;
  onOpen: () => void;
  onToggleBookmark: () => void;
};

type ProfileViewProps = {
  profileName: string;
  progressPercent: number;
  progressLabel: string;
  profileText: AppTextPack['profile'];
  defaultLanguage: DefaultLanguage;
  unitPrefixLabel: string;
  activeUnitKey?: string;
  currentCourseCode: string;
  bookmarkedAlbumsCount?: number;
  bookmarkedLessonsCount?: number;
  bookmarkedLessonRows?: ProfileBookmarkedLessonRow[];
  albumCards?: ProfileAlbumCard[];
  activeBookShelf: ProfileBookShelf;
  onBookShelfChange: (shelf: ProfileBookShelf) => void;
  onOpenSettings: () => void;
};

export const ProfileView: React.FC<ProfileViewProps> = ({
  profileName,
  progressPercent,
  progressLabel,
  profileText,
  defaultLanguage,
  unitPrefixLabel,
  activeUnitKey,
  currentCourseCode,
  bookmarkedAlbumsCount = 0,
  bookmarkedLessonsCount = 0,
  bookmarkedLessonRows = [],
  albumCards = [],
  activeBookShelf,
  onBookShelfChange,
  onOpenSettings,
}) => {
  const normalizedProgress = Number.isFinite(progressPercent)
    ? Math.min(100, Math.max(0, progressPercent))
    : 0;
  const visualProgress = normalizedProgress > 0 ? normalizedProgress : 2;
  const currentCourseAlbumCards = albumCards.filter((card) => card.isCurrentCourse);
  const bookmarkedAlbumCards = albumCards.filter((card) => card.isBookmarked);
  const visibleAlbumCards = activeBookShelf === 'current_course' ? currentCourseAlbumCards : bookmarkedAlbumCards;
  const albumCoverByKey = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const card of albumCards) {
      if (card.coverUrl) {
        map.set(card.key, card.coverUrl);
      }
    }
    return map;
  }, [albumCards]);
  const getShelfChipClass = (isActive: boolean): string => (
    `portfolio-chip ${
      isActive
        ? 'portfolio-chip-active'
        : 'portfolio-chip-idle'
    }`
  );

  return (
    <div className="w-full space-y-6 pt-16 md:pt-20">
      <section>
        <div className="portfolio-panel rounded-3xl px-4 py-5 md:px-5 md:py-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[var(--portfolio-border-strong)] bg-[var(--portfolio-surface-muted)] text-xl font-bold text-[var(--portfolio-text)]">
                {profileName.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <p className="portfolio-kicker">{profileText.accountSectionLabel}</p>
                <h2 className="portfolio-page-title">{profileText.welcomeBackTitle}</h2>
                <p className="portfolio-body-text font-semibold">{profileName}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenSettings}
              className="portfolio-soft-icon-button rounded-full p-2 transition-colors"
              aria-label={profileText.openSettingsAriaLabel}
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10.4 2.8h3.2l.5 2.3c.4.1.8.3 1.2.5l2.2-1.1 2.2 2.2-1.1 2.2c.2.4.3.8.5 1.2l2.3.5v3.2l-2.3.5c-.1.4-.3.8-.5 1.2l1.1 2.2-2.2 2.2-2.2-1.1c-.4.2-.8.3-1.2.5l-.5 2.3h-3.2l-.5-2.3c-.4-.1-.8-.3-1.2-.5l-2.2 1.1-2.2-2.2 1.1-2.2c-.2-.4-.3-.8-.5-1.2l-2.3-.5v-3.2l2.3-.5c.1-.4.3-.8.5-1.2l-1.1-2.2 2.2-2.2 2.2 1.1c.4-.2.8-.3 1.2-.5z" />
                <circle cx="12" cy="12" r="3.2" />
              </svg>
            </button>
          </div>
          <div className="mt-4 border-t border-[var(--portfolio-border-soft)] pt-4">
            <div className="portfolio-meta-text flex items-center justify-between">
              <span>{progressLabel}</span>
              <span>{normalizedProgress}%</span>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full border border-[color:color-mix(in_srgb,var(--portfolio-accent)_20%,transparent)] bg-[color:color-mix(in_srgb,var(--portfolio-accent)_10%,var(--portfolio-surface))]">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${visualProgress}%`,
                  minWidth: '10px',
                  opacity: 1,
                  background:
                    'linear-gradient(90deg, var(--dark-accent-primary, var(--color-brand)), var(--dark-accent-primary, var(--color-brand-dark)))',
                }}
              />
            </div>
          </div>
        </div>
      </section>

      <section>
        <div>
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onBookShelfChange('current_course')}
              aria-label={profileText.currentCourseLabel}
              title={`${profileText.currentCourseLabel}: ${currentCourseCode}`}
              className={getShelfChipClass(activeBookShelf === 'current_course')}
            >
              {profileText.currentCourseLabel}
            </button>
            <button
              type="button"
              onClick={() => onBookShelfChange('bookmarked_albums')}
              aria-label={profileText.downloadedLessonsLabel}
              title={`${profileText.downloadedLessonsLabel}: ${Math.max(0, bookmarkedAlbumsCount).toLocaleString()}`}
              className={getShelfChipClass(activeBookShelf === 'bookmarked_albums')}
            >
              {profileText.downloadedLessonsLabel}
            </button>
            <button
              type="button"
              onClick={() => onBookShelfChange('bookmarked_lessons')}
              aria-label={profileText.downloadedUnitsTracksLabel}
              title={`${profileText.downloadedUnitsTracksLabel}: ${Math.max(0, bookmarkedLessonsCount).toLocaleString()}`}
              className={getShelfChipClass(activeBookShelf === 'bookmarked_lessons')}
            >
              {profileText.downloadedUnitsTracksLabel}
            </button>
          </div>

          {activeBookShelf === 'bookmarked_lessons' ? (
            bookmarkedLessonRows.length > 0 ? (
              <div className="space-y-2">
                {bookmarkedLessonRows.map((track) => (
                  <UnitRow
                    key={track.key}
                    entry={track.entry}
                    albumKey={track.albumKey}
                    unitPrefixLabel={unitPrefixLabel}
                    defaultLanguage={defaultLanguage}
                    activeUnitKey={activeUnitKey}
                    isCompleted={track.isCompleted}
                    isBookmarked={track.isBookmarked}
                    onToggleBookmark={track.onToggleBookmark}
                    badgeDefaultClass={LIBRARY_STATE_STYLE.badgeDefault}
                    badgeActiveClass={LIBRARY_STATE_STYLE.badgeActive}
                    badgeCompletedClass={LIBRARY_STATE_STYLE.badgeCompleted}
                    accentClass="text-[var(--text-muted)]"
                    actionButtonMode="open"
                    thumbnailUrl={track.albumKey ? (albumCoverByKey.get(track.albumKey) ?? null) : null}
                    hideUnitCode
                    onPlayUnit={() => track.onPlay()}
                    onOpenUnit={() => track.onOpen()}
                  />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <p className="portfolio-empty-state font-medium">{profileText.downloadedUnitsTracksLabel}: 0</p>
              </div>
            )
          ) : visibleAlbumCards.length > 0 ? (
            <div className="grid grid-cols-3 gap-x-4 gap-y-5 md:grid-cols-5 lg:grid-cols-6 sm:gap-x-5">
              {visibleAlbumCards.map((card) => (
                <button
                  key={card.key}
                  type="button"
                  onClick={card.onOpen}
                  aria-label={`${card.title} ${card.meta}`}
                  className="group mx-auto w-full max-w-[170px] text-left sm:max-w-[180px]"
                >
                  <div className="portfolio-card-surface aspect-square overflow-hidden rounded-2xl">
                    {card.coverUrl ? (
                      <img
                        src={card.coverUrl}
                        alt=""
                        aria-hidden="true"
                        loading="lazy"
                        className="h-full w-full object-cover object-center"
                      />
                    ) : (
                      <div aria-hidden="true" className="h-full w-full bg-[linear-gradient(135deg,var(--portfolio-bg),var(--portfolio-surface-muted),var(--portfolio-surface))]" />
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <p className="portfolio-caption-title truncate text-sm font-medium leading-tight">{card.title}</p>
                    <p className="portfolio-caption-meta truncate text-xs">{card.meta}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <p className="portfolio-empty-state font-medium">
                {activeBookShelf === 'bookmarked_albums'
                  ? `${profileText.downloadedLessonsLabel}: 0`
                  : `${profileText.currentCourseLabel}: 0`}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

