import React, { useEffect, useMemo, useState } from 'react';
import type { AppTheme, DefaultLanguage, LearnLanguage, LibraryViewMode } from '../../config/appConfig';
import { DEFAULT_LIBRARY_VIEW_MODE } from '../../config/appConfig';
import { getAppText } from '../../config/appI18n';
import { localizeCollectionLabel, localizeLibraryTopic } from '../../config/libraryI18n';
import { useSwipeBack } from '../../hooks/useSwipeBack';
import { AlbumDetail } from './library/AlbumDetail';
import { LIBRARY_STATE_STYLE } from './library/libraryUiTokens';
import { useLibraryCollections } from './library/useLibraryCollections';
import type { AlbumCollectionSection, AlbumGroup } from './library/libraryTypes';
import type { LessonData } from '../../types';
import { buildUnitBookmarkKey } from '../../config/bookmarkKeys';

type BookShelfFilter = 'all' | string;

type BookCard = {
  section: AlbumCollectionSection;
  group: AlbumGroup;
};

export type LibraryViewProps = {
  lessons: LessonData[];
  sectionsOverride?: AlbumCollectionSection[];
  defaultLanguage: DefaultLanguage;
  learnLanguage: LearnLanguage;
  onSelectUnit: (level: number, unit: number, albumKey?: string | null) => void;
  onReadAlbum?: (units: Array<{ level: number; unit: number }>, albumKey?: string | null) => void;
  selectedAlbumKey?: string | null;
  viewMode?: LibraryViewMode;
  onSelectedAlbumKeyChange?: (key: string | null) => void;
  completedUnitKeys?: Set<string>;
  activeUnitKey?: string;
  downloadedUnitKeys?: Set<string>;
  bookmarkedUnitKeys?: Set<string>;
  bookmarkedAlbumKeys?: Set<string>;
  isUnitDownloading?: (level: number, unit: number) => boolean;
  onDownloadUnit?: (level: number, unit: number) => Promise<void> | void;
  onRemoveUnitDownload?: (level: number, unit: number) => Promise<void> | void;
  onToggleUnitBookmark?: (level: number, unit: number, albumKey?: string | null) => void;
  onToggleAlbumBookmark?: (albumKey: string) => void;
  appTheme?: AppTheme;
};

function shortenLabel(text: string, max = 52): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trim()}...`;
}

type HskAlbumLabelParts = {
  title: string;
  meta: string;
  category: string | null;
  isCourse: boolean;
};

function parseHskAlbumLabel(sourceLabel: string, collectionLabel: string): HskAlbumLabelParts {
  const collection = collectionLabel.trim() || 'HSK';
  const normalized = sourceLabel.replace(/^HSK\s*\d+\s*/i, '').trim();
  const tokens = normalized.split(/\s+/).filter(Boolean);
  const firstToken = tokens[0] || '';
  const upperFirst = firstToken.toUpperCase();

  if (upperFirst === 'COURSE') {
    const roman = tokens[1] || '';
    return {
      title: roman ? `Book ${roman}` : 'Course',
      meta: `${collection} · Course`,
      category: 'Course',
      isCourse: true,
    };
  }

  const category = firstToken
    ? `${firstToken.slice(0, 1).toUpperCase()}${firstToken.slice(1).toLowerCase()}`
    : null;
  const remainder = tokens.slice(1).join(' ').trim();
  return {
    title: remainder || normalized || sourceLabel,
    meta: category ? `${collection} · ${category}` : collection,
    category,
    isCourse: false,
  };
}

function getAlbumDisplayTitle(group: AlbumGroup, defaultLanguage: DefaultLanguage): string {
  if ((group.displayTitle || '').trim()) return String(group.displayTitle).trim();
  if ((group.levelScheme || '').toLowerCase() !== 'hsk') {
    return localizeLibraryTopic(group.firstTopicConcise, defaultLanguage);
  }
  const localized = localizeLibraryTopic(group.firstTopicConcise, defaultLanguage);
  const collectionLabel = localizeCollectionLabel(
    group.collectionLabel,
    defaultLanguage,
    group.levelScheme,
    group.levelCode,
  );
  return parseHskAlbumLabel(localized, collectionLabel).title;
}

function formatCefrAlbumMeta(group: AlbumGroup, defaultLanguage: DefaultLanguage): string {
  const levelLabel = String(group.levelCode || '').trim().toUpperCase();
  if (levelLabel) return `${levelLabel} · Course`;
  const collectionLabel = localizeCollectionLabel(
    group.collectionLabel,
    defaultLanguage,
    group.levelScheme,
    group.levelCode,
  );
  const compactLevelLabel = collectionLabel.replace(/^CEFR\s+/i, '').trim() || collectionLabel;
  return `${compactLevelLabel} · Course`;
}

function getSectionFilterLabel(section: AlbumCollectionSection, defaultLanguage: DefaultLanguage): string {
  if ((section.levelScheme || '').toLowerCase() === 'cefr' && section.levelCode) {
    return section.levelCode;
  }
  return localizeCollectionLabel(
    section.label,
    defaultLanguage,
    section.levelScheme,
    section.levelCode,
  );
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  lessons,
  sectionsOverride,
  defaultLanguage,
  learnLanguage,
  onSelectUnit,
  onReadAlbum,
  selectedAlbumKey,
  viewMode = DEFAULT_LIBRARY_VIEW_MODE,
  onSelectedAlbumKeyChange,
  completedUnitKeys,
  activeUnitKey,
  downloadedUnitKeys,
  bookmarkedUnitKeys,
  bookmarkedAlbumKeys,
  onToggleUnitBookmark,
  onToggleAlbumBookmark,
}) => {
  const [internalSelectedAlbumKey, setInternalSelectedAlbumKey] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<BookShelfFilter>('all');

  const activeSelectedAlbumKey = selectedAlbumKey === undefined ? internalSelectedAlbumKey : selectedAlbumKey;
  const setSelectedAlbumKey = (key: string | null) => {
    if (onSelectedAlbumKeyChange) {
      onSelectedAlbumKeyChange(key);
      return;
    }
    setInternalSelectedAlbumKey(key);
  };

  const appText = getAppText(defaultLanguage);
  const libraryText = appText.library;

  const {
    filteredCollectionSections,
    hasFilteredResults,
    selectedAlbum,
    selectedAlbumCollectionKey,
  } = useLibraryCollections({
    lessons,
    defaultLanguage,
    learnLanguage,
    viewMode,
    downloadedUnitKeys,
    selectedAlbumKey: activeSelectedAlbumKey,
    libraryQuery: '',
    collectionFallbackPrefix: libraryText.collectionFallbackPrefix,
    untitledSourceLabel: libraryText.untitledSourceLabel,
  });

  const resolvedCollectionSections = sectionsOverride ?? filteredCollectionSections;
  const resolvedHasFilteredResults = sectionsOverride ? sectionsOverride.length > 0 : hasFilteredResults;
  const resolvedSelectedAlbumResult = useMemo(() => {
    if (!sectionsOverride) {
      return {
        album: selectedAlbum,
        collectionKey: selectedAlbumCollectionKey,
      };
    }

    if (!activeSelectedAlbumKey) {
      return {
        album: null as AlbumGroup | null,
        collectionKey: null as string | null,
      };
    }

    for (const section of sectionsOverride) {
      if (section.key === activeSelectedAlbumKey) {
        return {
          album: section.groups[0] || null,
          collectionKey: section.key,
        };
      }
      const found = section.groups.find((group) => group.key === activeSelectedAlbumKey);
      if (found) {
        return {
          album: found,
          collectionKey: section.key,
        };
      }
    }

    return {
      album: null as AlbumGroup | null,
      collectionKey: null as string | null,
    };
  }, [activeSelectedAlbumKey, sectionsOverride, selectedAlbum, selectedAlbumCollectionKey]);

  const filterOptions = useMemo(
    () => [
      {
        key: 'all',
        label: appText.lesson.highlightAllLabel,
      },
      ...resolvedCollectionSections.map((section) => ({
        key: section.key,
        label: getSectionFilterLabel(section, defaultLanguage),
      })),
    ],
    [appText.lesson.highlightAllLabel, defaultLanguage, resolvedCollectionSections],
  );

  useEffect(() => {
    if (activeFilter === 'all') return;
    if (filterOptions.some((option) => option.key === activeFilter)) return;
    setActiveFilter('all');
  }, [activeFilter, filterOptions]);

  const visibleSections = useMemo(
    () =>
      activeFilter === 'all'
        ? resolvedCollectionSections
        : resolvedCollectionSections.filter((section) => section.key === activeFilter),
    [activeFilter, resolvedCollectionSections],
  );

  const bookCards = useMemo<BookCard[]>(
    () =>
      visibleSections.flatMap((section) =>
        section.groups.map((group) => ({
          section,
          group,
        })),
      ),
    [visibleSections],
  );

  const selectedAlbumValue = resolvedSelectedAlbumResult.album;
  const selectedAlbumBookmarkKey = selectedAlbumValue?.key ?? null;
  const selectedAlbumPlaybackKey = selectedAlbumValue?.key ?? activeSelectedAlbumKey ?? null;

  const albumSwipeBackHandlers = useSwipeBack(
    selectedAlbumValue ? () => setSelectedAlbumKey(null) : null,
  );

  const formatUnitCode = (level: number, unit: number): string => (
    `${Math.max(1, level)}.${Math.max(1, unit)}`
  );

  const formatAlbumMeta = (group: AlbumGroup): string => {
    if ((group.displayMeta || '').trim()) return String(group.displayMeta).trim();
    if ((group.levelScheme || '').toLowerCase() === 'hsk') {
      const localizedSourceLabel = localizeLibraryTopic(group.firstTopicConcise, defaultLanguage);
      const collectionLabel = localizeCollectionLabel(
        group.collectionLabel,
        defaultLanguage,
        group.levelScheme,
        group.levelCode,
      );
      return parseHskAlbumLabel(localizedSourceLabel, collectionLabel).meta;
    }
    if ((group.levelScheme || '').toLowerCase() === 'cefr') {
      return formatCefrAlbumMeta(group, defaultLanguage);
    }
    if (group.units.length > 0) {
      const first = group.units[0];
      const last = group.units[group.units.length - 1];
      return `${formatUnitCode(first.level, first.unit)}-${formatUnitCode(last.level, last.unit)}`;
    }
    const unitWord = group.units.length === 1 ? libraryText.unitSingularLabel : libraryText.unitPluralLabel;
    return `${group.stage} · G${group.groupIndex + 1} (${group.units.length} ${unitWord})`;
  };

  const isUnitBookmarked = (level: number, unit: number): boolean => (
    Boolean(bookmarkedUnitKeys?.has(buildUnitBookmarkKey(level, unit, selectedAlbumPlaybackKey)))
  );

  const isAlbumBookmarked = Boolean(selectedAlbumBookmarkKey && bookmarkedAlbumKeys?.has(selectedAlbumBookmarkKey));

  if (selectedAlbumValue) {
    return (
      <AlbumDetail
        album={selectedAlbumValue}
        albumKey={selectedAlbumPlaybackKey}
        albumTitle={shortenLabel(getAlbumDisplayTitle(selectedAlbumValue, defaultLanguage), 58)}
        playAllLabel={libraryText.playAllLabel}
        unitPrefixLabel={appText.lesson.unitPrefix}
        defaultLanguage={defaultLanguage}
        activeUnitKey={activeUnitKey}
        completedUnitKeys={completedUnitKeys}
        accentClass="text-[var(--text-muted)]"
        badgeDefaultClass={LIBRARY_STATE_STYLE.badgeDefault}
        badgeActiveClass={LIBRARY_STATE_STYLE.badgeActive}
        badgeCompletedClass={LIBRARY_STATE_STYLE.badgeCompleted}
        onPlayAlbum={onReadAlbum}
        onPlayUnit={(level, unit, albumKey) => onReadAlbum?.([{ level, unit }], albumKey)}
        onOpenUnit={onSelectUnit}
        isUnitBookmarked={isUnitBookmarked}
        onToggleUnitBookmark={(level, unit) => onToggleUnitBookmark?.(level, unit, selectedAlbumPlaybackKey)}
        isAlbumBookmarked={isAlbumBookmarked}
        onToggleAlbumBookmark={() => {
          if (!selectedAlbumBookmarkKey) return;
          onToggleAlbumBookmark?.(selectedAlbumBookmarkKey);
        }}
        formatAlbumMeta={formatAlbumMeta}
        onTouchStart={albumSwipeBackHandlers.onTouchStart}
        onTouchMove={albumSwipeBackHandlers.onTouchMove}
        onTouchEnd={albumSwipeBackHandlers.onTouchEnd}
        onTouchCancel={albumSwipeBackHandlers.onTouchCancel}
      />
    );
  }

  return (
    <div className="space-y-8 pt-16 pb-20 md:pt-20">
      <section>
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setActiveFilter(option.key)}
                className={`portfolio-chip ${
                  activeFilter === option.key
                    ? 'portfolio-chip-active'
                    : 'portfolio-chip-idle'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {!resolvedHasFilteredResults ? (
          <div className="py-16 text-center">
            <p className="portfolio-empty-state font-medium">{libraryText.noAlbumsMatch}</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-x-4 gap-y-6 sm:gap-x-5 md:grid-cols-5 lg:grid-cols-6">
            {bookCards.map(({ group }) => (
              <button
                key={group.key}
                type="button"
                onClick={() => setSelectedAlbumKey(group.key)}
                aria-label={`${libraryText.openGroupAriaPrefix} ${group.groupIndex + 1}`}
                className="group mx-auto w-full max-w-[170px] text-left sm:max-w-[180px]"
              >
                <div className="portfolio-card-surface aspect-square overflow-hidden rounded-2xl group-hover:-translate-y-0.5">
                  <img
                    src={group.coverUrl}
                    alt={getAlbumDisplayTitle(group, defaultLanguage)}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </div>
                <div className="mt-2 text-center">
                  <h4 className="portfolio-caption-title truncate text-sm font-medium leading-tight">
                    {shortenLabel(getAlbumDisplayTitle(group, defaultLanguage), 32)}
                  </h4>
                  <p className="portfolio-caption-meta truncate text-xs">
                    {shortenLabel(
                      formatAlbumMeta(group),
                      36,
                    )}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

