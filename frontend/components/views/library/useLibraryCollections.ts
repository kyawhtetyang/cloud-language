import { useMemo } from 'react';
import { LessonData } from '../../../types';
import {
  DefaultLanguage,
  getLibrarySchemeSortPriority,
  getLessonOrderIndex,
  getLessonUnitId,
  LibraryViewMode,
  LearnLanguage,
  StageCode,
} from '../../../config/appConfig';
import { localizeLibraryTopic, localizeLibraryTopicConcise } from '../../../config/libraryI18n';
import type { AlbumCollectionSection, AlbumGroup } from './libraryTypes';

type UseLibraryCollectionsArgs = {
  lessons: LessonData[];
  defaultLanguage: DefaultLanguage;
  learnLanguage: LearnLanguage;
  viewMode: LibraryViewMode;
  downloadedUnitKeys?: Set<string>;
  selectedAlbumKey: string | null;
  libraryQuery: string;
  collectionFallbackPrefix: string;
  untitledSourceLabel: string;
};

export function buildLibraryUnitKey(level: number, unit: number): string {
  return `${level}:${unit}`;
}

function stableHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = ((hash << 5) - hash + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

const REAL_PHOTO_POOL = [
  '/tmp-fiction/fiction__crossroads_of_love-BczEk45w.jpg',
  '/tmp-fiction/fiction__explore_new_journey-0J4biTxh.jpg',
  '/tmp-fiction/fiction__first_taste_of_traveling-BqsZIo8k.jpg',
  '/tmp-fiction/fiction__great_holiday-BrXs_r9O.jpg',
  '/tmp-fiction/fiction__living_on_the_edge-Cpsv_GOO.jpg',
  '/tmp-fiction/fiction__nostalgic_moment-LjcyPuSk.jpg',
  '/tmp-fiction/fiction__old_friends_reunion-B60-du-d.jpg',
  '/tmp-fiction/fiction__pages_written_in_silence-D9uifYtA.jpg',
  '/tmp-fiction/fiction__she_married_yesterday-bax0EFOI.jpg',
  '/tmp-fiction/fiction__the_mysterious_girl-DKCMc_6W.jpg',
  '/tmp-fiction/fiction__the_trail_along_village-BGKEWX-U.jpg',
  '/tmp-fiction/fiction__the_very_first_love-BUARG_cn.jpg',
  '/tmp-fiction/fiction__unexpected_moment-JLDEb7fJ.jpg',
  '/tmp-fiction/fiction__vietnam_solo_traveling-fewZ_-2y.jpg',
  '/tmp-fiction/fiction__village_cafe_diaries-D2E2yIWx.jpg',
  '/tmp-fiction/fiction__why_are_we_here-Bm1Qh0RS.jpg',
];

const PHOTO_CATEGORY_POOL: Record<string, string[]> = {
  commerce: REAL_PHOTO_POOL.slice(0, 4),
  family: REAL_PHOTO_POOL.slice(4, 7),
  daily: REAL_PHOTO_POOL.slice(7, 10),
  map: REAL_PHOTO_POOL.slice(10, 12),
  work: REAL_PHOTO_POOL.slice(12, 14),
  debate: REAL_PHOTO_POOL.slice(14, 16),
};

function getTopicPhotoUrl(topic: string, seed: string): string {
  const lower = topic.toLowerCase();
  let category: keyof typeof PHOTO_CATEGORY_POOL | null = null;
  if (/buy|sell|price|payment|discount|return|exchange|market/.test(lower)) {
    category = 'commerce';
  } else if (/family|friends/.test(lower)) {
    category = 'family';
  } else if (/time|date|daily|weekend|future|past/.test(lower)) {
    category = 'daily';
  } else if (/directions|map/.test(lower)) {
    category = 'map';
  } else if (/meeting|presentation|negotiation|executive|q&a/.test(lower)) {
    category = 'work';
  } else if (/debate|argument|opinions|discussion|viewpoints/.test(lower)) {
    category = 'debate';
  }
  const pool = category ? PHOTO_CATEGORY_POOL[category] : REAL_PHOTO_POOL;
  const pick = stableHash(seed) % pool.length;
  return pool[pick];
}

export function getGroupCoverUrl(
  groupIndex: number,
  topic: string,
): string {
  return getTopicPhotoUrl(topic, `group:${groupIndex + 1}`);
}

function getConciseTopicTitle(rawTopic: string, defaultLanguage: DefaultLanguage): string {
  return localizeLibraryTopicConcise(rawTopic, defaultLanguage);
}

function getDisplayAlbumTitle(rawTitle: string, defaultLanguage: DefaultLanguage): string {
  return localizeLibraryTopic(rawTitle, defaultLanguage);
}

export function useLibraryCollections({
  lessons,
  defaultLanguage,
  viewMode,
  downloadedUnitKeys,
  selectedAlbumKey,
  libraryQuery,
  collectionFallbackPrefix,
  untitledSourceLabel,
}: UseLibraryCollectionsArgs) {
  const collectionSections = useMemo<AlbumCollectionSection[]>(() => {
    const byCollection = new Map<
      string,
      {
        sourceOrder: string[];
        bySource: Map<string, AlbumGroup['units']>;
        sourceMeta: Map<
          string,
          {
            contentType?: string;
            displayTitle?: string;
            displayMeta?: string;
          }
        >;
        levelScheme?: string;
        levelCode?: string;
        levelOrder?: number;
      }
    >();

    for (const lesson of lessons) {
      const level = getLessonOrderIndex(lesson);
      const unit = getLessonUnitId(lesson);
      const collectionLabel = (lesson.collectionLabel || '').trim() || `${collectionFallbackPrefix} ${level}`;
      const sourceLabel = (lesson.sourceLabel || '').trim() || untitledSourceLabel;
      const levelScheme = String(lesson.levelScheme || '').trim().toLowerCase() || undefined;
      const levelCode = String(lesson.levelCode || '').trim().toUpperCase() || undefined;
      const levelOrder = typeof lesson.levelOrder === 'number' ? lesson.levelOrder : undefined;

      if (!byCollection.has(collectionLabel)) {
        byCollection.set(collectionLabel, {
          sourceOrder: [],
          bySource: new Map(),
          sourceMeta: new Map(),
          levelScheme,
          levelCode,
          levelOrder,
        });
      }

      const collection = byCollection.get(collectionLabel)!;
      if (!collection.levelScheme && levelScheme) collection.levelScheme = levelScheme;
      if (!collection.levelCode && levelCode) collection.levelCode = levelCode;
      if (typeof collection.levelOrder !== 'number' && typeof levelOrder === 'number') {
        collection.levelOrder = levelOrder;
      }

      if (!collection.bySource.has(sourceLabel)) {
        collection.bySource.set(sourceLabel, []);
        collection.sourceOrder.push(sourceLabel);
        collection.sourceMeta.set(sourceLabel, {
          contentType: String(lesson.contentType || '').trim() || undefined,
          displayTitle: String(lesson.displayTitle || '').trim() || undefined,
          displayMeta: String(lesson.displayMeta || '').trim() || undefined,
        });
      }

      const units = collection.bySource.get(sourceLabel)!;
      if (!units.some((entry) => entry.level === level && entry.unit === unit)) {
        units.push({
          stage: 'A1',
          level,
          unit,
          topic: lesson.topic,
        });
      }
    }

    const collectionEntries = Array.from(byCollection.entries()).sort(([labelA, metaA], [labelB, metaB]) => {
      const priorityDiff =
        getLibrarySchemeSortPriority(metaA.levelScheme) - getLibrarySchemeSortPriority(metaB.levelScheme);
      if (priorityDiff !== 0) return priorityDiff;

      const orderA = typeof metaA.levelOrder === 'number' ? metaA.levelOrder : Number.POSITIVE_INFINITY;
      const orderB = typeof metaB.levelOrder === 'number' ? metaB.levelOrder : Number.POSITIVE_INFINITY;
      if (orderA !== orderB) return orderA - orderB;

      return labelA.localeCompare(labelB, undefined, { sensitivity: 'base' });
    });

    return collectionEntries.map(([collectionLabel, collection]) => {
      const groups = collection.sourceOrder.map((sourceLabel, groupIndex) => {
        const units = collection.bySource.get(sourceLabel) || [];
        const sourceMeta = collection.sourceMeta.get(sourceLabel) || {};
        units.sort((a, b) => (a.level - b.level) || (a.unit - b.unit));
        return {
          key: `collection-${collectionLabel}-group-${groupIndex}`,
          stage: 'A1' as StageCode,
          groupIndex,
          units,
          firstTopicConcise: sourceLabel,
          sourceLabel,
          collectionLabel,
          contentType: sourceMeta.contentType,
          displayTitle: sourceMeta.displayTitle,
          displayMeta: sourceMeta.displayMeta,
          levelScheme: collection.levelScheme,
          levelCode: collection.levelCode,
          coverUrl: getGroupCoverUrl(groupIndex, sourceLabel),
        };
      });

      return {
        key: `${collection.levelScheme || 'custom'}-${(collection.levelCode || collectionLabel).toLowerCase().replace(/\s+/g, '-')}`,
        label: collectionLabel,
        levelScheme: collection.levelScheme,
        levelCode: collection.levelCode,
        levelOrder: collection.levelOrder,
        groups,
      };
    });
  }, [collectionFallbackPrefix, lessons, untitledSourceLabel]);

  const libraryModeSections = useMemo<AlbumCollectionSection[]>(() => {
    if (viewMode !== 'downloaded') return collectionSections;
    return collectionSections
      .map((section) => ({
        ...section,
        groups: section.groups
          .map((group) => ({
            ...group,
            units: group.units.filter((entry) => downloadedUnitKeys?.has(buildLibraryUnitKey(entry.level, entry.unit))),
          }))
          .filter((group) => group.units.length > 0),
      }))
      .filter((section) => section.groups.length > 0);
  }, [collectionSections, downloadedUnitKeys, viewMode]);

  const selectedAlbumResult = useMemo(() => {
    if (!selectedAlbumKey) {
      return {
        album: null as AlbumGroup | null,
        collectionKey: null as string | null,
      };
    }

    for (const section of libraryModeSections) {
      if (section.key === selectedAlbumKey) {
        return {
          album: section.groups[0] || null,
          collectionKey: section.key,
        };
      }
      const found = section.groups.find((group) => group.key === selectedAlbumKey);
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
  }, [libraryModeSections, selectedAlbumKey]);

  const normalizedLibraryQuery = libraryQuery.trim().toLowerCase();
  const filteredCollectionSections = useMemo(() => {
    if (!normalizedLibraryQuery) return libraryModeSections;
    return libraryModeSections
      .map((section) => ({
        ...section,
        groups: section.groups.filter((group) => {
          const localizedGroupTitle = getDisplayAlbumTitle(group.firstTopicConcise, defaultLanguage).toLowerCase();
          if (group.firstTopicConcise.toLowerCase().includes(normalizedLibraryQuery)) return true;
          if (localizedGroupTitle.includes(normalizedLibraryQuery)) return true;
          return group.units.some((unitEntry) => {
            const conciseTopic = getConciseTopicTitle(unitEntry.topic, defaultLanguage).toLowerCase();
            const localizedTopic = localizeLibraryTopic(unitEntry.topic, defaultLanguage).toLowerCase();
            return conciseTopic.includes(normalizedLibraryQuery) || localizedTopic.includes(normalizedLibraryQuery);
          });
        }),
      }))
      .filter((section) => section.groups.length > 0);
  }, [defaultLanguage, libraryModeSections, normalizedLibraryQuery]);

  return {
    filteredCollectionSections,
    hasFilteredResults: filteredCollectionSections.length > 0,
    selectedAlbum: selectedAlbumResult.album,
    selectedAlbumCollectionKey: selectedAlbumResult.collectionKey,
  };
}

