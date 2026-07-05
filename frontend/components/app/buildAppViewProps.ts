import {
  AppMode,
  AppTheme,
  buildStageUnitsFromLessons,
  CourseFramework,
  DefaultLanguage,
  getLibrarySchemeSortPriority,
  getLessonOrderIndex,
  getLessonUnitId,
  LibraryViewMode,
  LearnLanguage,
  UiLockLanguage,
  resolveLessonLearningSourceText,
  SidebarTab,
  VoiceProvider,
} from '../../config/appConfig';
import { getAppText } from '../../config/appI18n';
import { localizeLibraryTopic } from '../../config/libraryI18n';
import { buildUnitBookmarkKey, isLegacyUnitBookmarkKey, parseUnitBookmarkKey } from '../../config/bookmarkKeys';
import { LessonData } from '../../types';
import type { AlbumCollectionSection, AlbumUnitEntry } from '../views/library/libraryTypes';
import { getGroupCoverUrl } from '../views/library/useLibraryCollections';
import type { ProfileBookShelf } from '../views/ProfileView';

type LessonEntry = {
  lesson: LessonData;
  lessonIndex: number;
};

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

type BuildAppViewPropsArgs = {
  defaultLanguage: DefaultLanguage;
  selectedDefaultLanguage: DefaultLanguage;
  currentIndex: number;
  lessons: LessonData[];
  libraryIndexSections: AlbumCollectionSection[];
  currentLevel: number;
  currentUnit: number;
  mode: AppMode;
  completedUnitKeys: Set<string>;
  sidebarTab: SidebarTab;
  isLeaveCompletedUnitModalOpen: boolean;
  leaveCompletedUnitModalTitle: string;
  leaveCompletedUnitConfirmMessage: string;
  leaveCompletedUnitCancelLabel: string;
  leaveCompletedUnitConfirmLabel: string;
  onLeaveCompletedUnitCancel: () => void;
  onLeaveCompletedUnitConfirm: () => void;
  isLogoutModalOpen: boolean;
  onCloseLogoutModal: () => void;
  onConfirmLogoutModal: () => void;
  profileName: string;
  profileInput: string;
  profileError: string | null;
  hasProfileWhitespace: boolean;
  isProfileInputValid: boolean;
  currentCourseCode: string;
  activeProfileBookShelf: ProfileBookShelf;
  onProfileBookShelfChange: (shelf: ProfileBookShelf) => void;
  onProfileInputChange: (value: string) => void;
  onApplyProfileName: () => void;
  onOpenProfileAlbumLibrary: () => void;
  onOpenSettings: () => void;
  onRequestLogout: () => void;
  learnLanguage: LearnLanguage;
  onSelectUnit: (level: number, unit: number, albumKey?: string | null) => void;
  onReadAlbum: (units: Array<{ level: number; unit: number }>, albumKey?: string | null) => void;
  onPlayBookmarkedUnit?: (level: number, unit: number, albumKey?: string | null) => void;
  onOpenBookmarkedUnit?: (level: number, unit: number, albumKey?: string | null) => void;
  selectedAlbumKey: string | null;
  libraryViewMode: LibraryViewMode;
  onSelectedAlbumKeyChange: (key: string | null) => void;
  downloadedUnitKeys: Set<string>;
  bookmarkedUnitKeys: Set<string>;
  bookmarkedAlbumKeys: Set<string>;
  onDownloadUnit: (level: number, unit: number) => void;
  onRemoveUnitDownload: (level: number, unit: number) => void;
  isUnitDownloading: (level: number, unit: number) => boolean;
  onToggleUnitBookmark: (level: number, unit: number, albumKey?: string | null) => void;
  onToggleAlbumBookmark: (albumKey: string) => void;
  isPronunciationEnabled: boolean;
  isLearningLanguageVisible: boolean;
  isTranslationVisible: boolean;
  isBoldTextEnabled: boolean;
  isAutoScrollEnabled: boolean;
  textScalePercent: number;
  appTheme: AppTheme;
  voiceProvider: VoiceProvider;
  onDefaultLanguageChange: (value: DefaultLanguage) => void;
  uiLockLanguage: UiLockLanguage;
  onUiLockLanguageChange: (value: UiLockLanguage) => void;
  courseFramework: CourseFramework;
  onLearnLanguageChange: (value: LearnLanguage) => void;
  onCourseFrameworkChange: (value: CourseFramework) => void;
  onTogglePronunciation: () => void;
  onToggleLearningLanguageVisibility: () => void;
  onToggleTranslationVisibility: () => void;
  onToggleBoldText: () => void;
  onToggleAutoScroll: () => void;
  onDecreaseTextSize: () => void;
  onIncreaseTextSize: () => void;
  onAppThemeChange: (value: AppTheme) => void;
  onVoiceProviderChange: (value: VoiceProvider) => void;
  onBackToProfile: () => void;
  learnStepCount: number;
  currentBatchEntries: LessonEntry[];
  lessonBatchGroups: LessonEntry[][];
  learnStep: number;
  isReading: boolean;
  onSelectLessonStep: (step: number) => void | Promise<void>;
  englishReferenceByKey: Map<string, string>;
  activeSpeakingLessonIndex: number | null;
  onPlayLesson: (lesson: LessonData, lessonIndex: number) => void;
  savedHighlightPhrasesByLessonKey: Map<string, string[]>;
  onSaveLessonHighlight: (lesson: LessonData, selectedText: string) => boolean;
  onClearLessonHighlight: (lesson: LessonData) => boolean;
  repeatMode: 'off' | 'all' | 'one';
  isNextDisabled: boolean;
  sectionEnd: number;
  currentStageRange: { start: number; end: number };
  orderedUnitIndexes: number[];
  isRandomLessonOrderEnabled: boolean;
  isMobileBottomBarsVisible: boolean;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onPrevious: () => void;
  onReadCurrentBatch: () => void;
  onNext: () => void;
  onBackToLibrary: () => void;
  onMobileTabChange: (tab: SidebarTab) => void;
};

function buildCollectionKey(levelScheme: string | undefined, levelCode: string | undefined, collectionLabel: string): string {
  const normalizedSource = (levelCode || collectionLabel).toLowerCase().replace(/\s+/g, '-');
  return `${levelScheme || 'custom'}-${normalizedSource}`;
}

function stableHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = ((hash << 5) - hash + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function getProfileAlbumCoverUrl(collectionLabel: string): string | null {
  const normalized = String(collectionLabel || '').trim();
  if (!normalized) return null;
  const groupIndex = stableHash(normalized) % 32;
  return getGroupCoverUrl(groupIndex, normalized);
}

function formatUnitCode(level: number, unit: number): string {
  return `${Math.max(1, level)}.${Math.max(1, unit)}`;
}

function formatAlbumRange(unitEntries: Array<{ level: number; unit: number }>): string {
  if (unitEntries.length === 0) return '';
  const sorted = [...unitEntries].sort((a, b) => (a.level - b.level) || (a.unit - b.unit));
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  if (first.level === last.level && first.unit === last.unit) {
    return formatUnitCode(first.level, first.unit);
  }
  return `${formatUnitCode(first.level, first.unit)}-${formatUnitCode(last.level, last.unit)}`;
}

function normalizeToken(value: string | undefined): string {
  return String(value || '')
    .trim()
    .toUpperCase()
    .replace(/[\s_-]+/g, ' ');
}

function isCurrentCourseAlbum(
  currentCourseCode: string,
  collectionLabel: string,
  levelCode: string | undefined,
): boolean {
  const normalizedCourse = normalizeToken(currentCourseCode);
  if (!normalizedCourse) return false;

  const normalizedLevelCode = normalizeToken(levelCode);
  if (normalizedLevelCode && normalizedLevelCode === normalizedCourse) return true;

  const normalizedLabel = normalizeToken(collectionLabel);
  if (!normalizedLabel) return false;
  return normalizedLabel === normalizedCourse || normalizedLabel.includes(normalizedCourse);
}

function resolveProfileTrackStage(stage: string | undefined): AlbumUnitEntry['stage'] {
  const normalized = String(stage || '').toUpperCase();
  if (normalized === 'A2' || normalized === 'B1' || normalized === 'B2') {
    return normalized;
  }
  return 'A1';
}

function buildProfileAlbumCards({
  lessons,
  libraryIndexSections,
  bookmarkedUnitKeys,
  bookmarkedAlbumKeys,
  currentCourseCode,
  collectionFallbackPrefix,
  unitSingularLabel,
  unitPluralLabel,
  defaultLanguage,
  onOpenAlbumLesson,
}: {
  lessons: LessonData[];
  libraryIndexSections: AlbumCollectionSection[];
  bookmarkedUnitKeys: Set<string>;
  bookmarkedAlbumKeys: Set<string>;
  currentCourseCode: string;
  collectionFallbackPrefix: string;
  unitSingularLabel: string;
  unitPluralLabel: string;
  defaultLanguage: DefaultLanguage;
  onOpenAlbumLesson: (albumKey: string) => void;
}): ProfileAlbumCard[] {
  if (libraryIndexSections.length > 0) {
    const cards: ProfileAlbumCard[] = [];

    for (const section of libraryIndexSections) {
      for (const group of section.groups || []) {
        const units = Array.isArray(group.units) ? group.units : [];
        const unitEntries = units.map((entry) => ({ level: entry.level, unit: entry.unit }));
        const totalUnits = unitEntries.length;
        if (totalUnits === 0) continue;

        const unitWord = totalUnits === 1 ? unitSingularLabel : unitPluralLabel;
        const bookmarkedUnitCount = unitEntries.reduce(
          (count, entry) => count + (bookmarkedUnitKeys.has(buildUnitBookmarkKey(entry.level, entry.unit, group.key)) ? 1 : 0),
          0,
        );
        const rangeLabel = formatAlbumRange(unitEntries);
        const progressLabel = `${bookmarkedUnitCount}/${totalUnits} ${unitWord}`;
        const sectionLabel = String(section.label || '').trim();
        const title = (String(group.displayTitle || '').trim()
          || localizeLibraryTopic(group.firstTopicConcise || group.sourceLabel || sectionLabel, defaultLanguage)
        ).trim();
        const metaBase = String(group.displayMeta || '').trim() || sectionLabel;
        const meta = rangeLabel
          ? `${metaBase} · ${rangeLabel} · ${progressLabel}`
          : `${metaBase} · ${progressLabel}`;
        const coverUrl = group.coverUrl
          || getGroupCoverUrl(group.groupIndex || 0, group.firstTopicConcise || group.sourceLabel || sectionLabel);

        cards.push({
          key: group.key,
          title,
          meta,
          coverUrl,
          totalUnitCount: totalUnits,
          bookmarkedUnitCount,
          isCurrentCourse: isCurrentCourseAlbum(currentCourseCode, sectionLabel, section.levelCode),
          isBookmarked: bookmarkedAlbumKeys.has(group.key),
          onOpen: () => onOpenAlbumLesson(group.key),
        });
      }
    }

    return cards
      .sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }));
  }

  const byAlbum = new Map<
    string,
    {
      key: string;
      title: string;
      metaBase: string;
      coverUrl: string | null;
      unitEntries: Array<{ level: number; unit: number }>;
      units: Set<string>;
      bookmarkedUnitsCount: number;
      levelScheme?: string;
      levelCode?: string;
      levelOrder?: number;
      sectionLabel: string;
    }
  >();

  for (const lesson of lessons) {
    const level = getLessonOrderIndex(lesson);
    const unit = getLessonUnitId(lesson);
    const collectionLabel = (lesson.collectionLabel || '').trim() || `${collectionFallbackPrefix} ${level}`;
    const levelScheme = String(lesson.levelScheme || '').trim().toLowerCase() || undefined;
    const levelCode = String(lesson.levelCode || '').trim().toUpperCase() || undefined;
    const levelOrder = typeof lesson.levelOrder === 'number' ? lesson.levelOrder : undefined;
    const collectionKey = buildCollectionKey(levelScheme, levelCode, collectionLabel);
    const sourceLabel = String(lesson.sourceLabel || '').trim() || collectionLabel;
    const albumKey = `${collectionKey}::${sourceLabel.toLowerCase()}`;
    const unitKey = buildUnitBookmarkKey(level, unit, albumKey);

    if (!byAlbum.has(albumKey)) {
      byAlbum.set(albumKey, {
        key: albumKey,
        title: localizeLibraryTopic(sourceLabel, defaultLanguage),
        metaBase: collectionLabel,
        coverUrl: getProfileAlbumCoverUrl(sourceLabel),
        unitEntries: [],
        units: new Set<string>(),
        bookmarkedUnitsCount: 0,
        levelScheme,
        levelCode,
        levelOrder,
        sectionLabel: collectionLabel,
      });
    }

    const album = byAlbum.get(albumKey)!;
    if (!album.units.has(unitKey)) {
      album.units.add(unitKey);
      album.unitEntries.push({ level, unit });
      if (bookmarkedUnitKeys.has(unitKey)) {
        album.bookmarkedUnitsCount += 1;
      }
    }
  }

  return Array.from(byAlbum.values())
    .sort((a, b) => {
      const priorityDiff =
        getLibrarySchemeSortPriority(a.levelScheme) - getLibrarySchemeSortPriority(b.levelScheme);
      if (priorityDiff !== 0) return priorityDiff;

      const orderA = typeof a.levelOrder === 'number' ? a.levelOrder : Number.POSITIVE_INFINITY;
      const orderB = typeof b.levelOrder === 'number' ? b.levelOrder : Number.POSITIVE_INFINITY;
      if (orderA !== orderB) return orderA - orderB;

      return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
    })
    .map((album) => {
      const totalUnits = album.units.size;
      const unitWord = totalUnits === 1 ? unitSingularLabel : unitPluralLabel;
      const rangeLabel = formatAlbumRange(album.unitEntries);
      const progressLabel = `${album.bookmarkedUnitsCount}/${totalUnits} ${unitWord}`;
      const meta = rangeLabel ? `${album.metaBase} · ${rangeLabel} · ${progressLabel}` : `${album.metaBase} · ${progressLabel}`;
      return {
        key: album.key,
        title: album.title,
        meta,
        coverUrl: album.coverUrl,
        totalUnitCount: totalUnits,
        bookmarkedUnitCount: album.bookmarkedUnitsCount,
        isCurrentCourse: isCurrentCourseAlbum(currentCourseCode, album.sectionLabel, album.levelCode),
        isBookmarked: bookmarkedAlbumKeys.has(album.key),
        onOpen: () => onOpenAlbumLesson(album.key),
      };
    });
}

function buildProfileBookmarkedLessonRows({
  lessons,
  libraryIndexSections,
  bookmarkedUnitKeys,
  completedUnitKeys,
  collectionFallbackPrefix,
  onPlayUnit,
  onOpenUnit,
  onToggleBookmark,
}: {
  lessons: LessonData[];
  libraryIndexSections: AlbumCollectionSection[];
  bookmarkedUnitKeys: Set<string>;
  completedUnitKeys: Set<string>;
  collectionFallbackPrefix: string;
  onPlayUnit: (level: number, unit: number, albumKey?: string | null) => void;
  onOpenUnit: (level: number, unit: number, albumKey?: string | null) => void;
  onToggleBookmark: (level: number, unit: number, albumKey?: string | null) => void;
}): ProfileBookmarkedLessonRow[] {
  const unitEntryByAlbumAndUnit = new Map<string, AlbumUnitEntry>();
  const fallbackAlbumKeyByLegacyUnitKey = new Map<string, string>();
  const fallbackEntryByLegacyUnitKey = new Map<string, AlbumUnitEntry>();

  for (const section of libraryIndexSections) {
    for (const group of section.groups || []) {
      for (const entry of group.units || []) {
        const libraryUnitKey = `${entry.level}:${entry.unit}`;
        const mapKey = buildUnitBookmarkKey(entry.level, entry.unit, group.key);
        if (!unitEntryByAlbumAndUnit.has(mapKey)) {
          unitEntryByAlbumAndUnit.set(mapKey, entry);
        }
        if (!fallbackAlbumKeyByLegacyUnitKey.has(libraryUnitKey)) {
          fallbackAlbumKeyByLegacyUnitKey.set(libraryUnitKey, group.key);
        }
        if (!fallbackEntryByLegacyUnitKey.has(libraryUnitKey)) {
          fallbackEntryByLegacyUnitKey.set(libraryUnitKey, entry);
        }
      }
    }
  }

  const rows: ProfileBookmarkedLessonRow[] = [];
  const seenRowKeys = new Set<string>();

  const ensureFallbackEntryForLegacyKey = (legacyKey: string) => {
    if (!isLegacyUnitBookmarkKey(legacyKey)) return null;
    const match = legacyKey.match(/^(\d+):(\d+)$/);
    if (!match) return null;
    const level = Number(match[1]);
    const unit = Number(match[2]);
    const resolvedAlbumKey = fallbackAlbumKeyByLegacyUnitKey.get(legacyKey) || null;
    const effectiveBookmarkKey = buildUnitBookmarkKey(level, unit, resolvedAlbumKey);
    const entry = unitEntryByAlbumAndUnit.get(effectiveBookmarkKey) || null;
    return entry
      ? { entry, albumKey: resolvedAlbumKey, bookmarkKey: effectiveBookmarkKey }
      : null;
  };

  for (const bookmarkKey of bookmarkedUnitKeys) {
    const parsed = parseUnitBookmarkKey(bookmarkKey);
    if (parsed) {
      const unitKey = buildUnitBookmarkKey(parsed.level, parsed.unit, parsed.albumKey);
      const fallbackLegacyUnitKey = `${parsed.level}:${parsed.unit}`;
      const fallbackAlbumKey = fallbackAlbumKeyByLegacyUnitKey.get(fallbackLegacyUnitKey) || null;
      const repairedUnitKey = buildUnitBookmarkKey(parsed.level, parsed.unit, fallbackAlbumKey);
      const entry = unitEntryByAlbumAndUnit.get(unitKey)
        || (fallbackAlbumKey ? unitEntryByAlbumAndUnit.get(repairedUnitKey) : null)
        || fallbackEntryByLegacyUnitKey.get(fallbackLegacyUnitKey)
        || null;
      if (!entry) continue;
      const resolvedAlbumKey = unitEntryByAlbumAndUnit.has(unitKey)
        ? parsed.albumKey
        : fallbackAlbumKey;
      const rowKey = resolvedAlbumKey
        ? buildUnitBookmarkKey(parsed.level, parsed.unit, resolvedAlbumKey)
        : fallbackLegacyUnitKey;
      if (seenRowKeys.has(rowKey)) continue;
      seenRowKeys.add(rowKey);

      const completedKey = fallbackLegacyUnitKey;
      rows.push({
        key: rowKey,
        albumKey: resolvedAlbumKey,
        entry,
        isCompleted: completedUnitKeys.has(completedKey),
        isBookmarked: true,
        onPlay: () => onPlayUnit(parsed.level, parsed.unit, resolvedAlbumKey),
        onOpen: () => onOpenUnit(parsed.level, parsed.unit, resolvedAlbumKey),
        onToggleBookmark: () => onToggleBookmark(parsed.level, parsed.unit, resolvedAlbumKey),
      });
      continue;
    }

    const legacyResolved = ensureFallbackEntryForLegacyKey(bookmarkKey);
    if (legacyResolved) {
      const { entry, albumKey, bookmarkKey: effectiveBookmarkKey } = legacyResolved;
      const match = bookmarkKey.match(/^(\d+):(\d+)$/);
      const level = Number(match?.[1] || 1);
      const unit = Number(match?.[2] || 1);
      if (seenRowKeys.has(effectiveBookmarkKey)) continue;
      seenRowKeys.add(effectiveBookmarkKey);
      rows.push({
        key: effectiveBookmarkKey,
        albumKey,
        entry,
        isCompleted: completedUnitKeys.has(bookmarkKey),
        isBookmarked: true,
        onPlay: () => onPlayUnit(level, unit, albumKey),
        onOpen: () => onOpenUnit(level, unit, albumKey),
        onToggleBookmark: () => onToggleBookmark(level, unit, albumKey),
      });
    }
  }

  if (rows.length > 0) {
    rows.sort((a, b) => {
      if ((a.albumKey || '') !== (b.albumKey || '')) {
        return String(a.albumKey || '').localeCompare(String(b.albumKey || ''), undefined, { sensitivity: 'base' });
      }
      if (a.entry.level !== b.entry.level) return a.entry.level - b.entry.level;
      return a.entry.unit - b.entry.unit;
    });
    return rows;
  }

  const legacyRows: ProfileBookmarkedLessonRow[] = [];
  for (const lesson of lessons) {
    const level = getLessonOrderIndex(lesson);
    const unit = getLessonUnitId(lesson);
    const legacyKey = `${level}:${unit}`;
    if (!bookmarkedUnitKeys.has(legacyKey)) continue;

    const collectionLabel = (lesson.collectionLabel || '').trim() || `${collectionFallbackPrefix} ${level}`;
    const levelScheme = String(lesson.levelScheme || '').trim().toLowerCase() || undefined;
    const levelCode = String(lesson.levelCode || '').trim().toUpperCase() || undefined;
    const albumKey = buildCollectionKey(levelScheme, levelCode, collectionLabel);
    if (seenRowKeys.has(legacyKey)) continue;
    seenRowKeys.add(legacyKey);

    legacyRows.push({
      key: legacyKey,
      albumKey,
      entry: {
        stage: resolveProfileTrackStage(lesson.stage),
        level,
        unit,
        topic: lesson.topic,
      },
      isCompleted: completedUnitKeys.has(legacyKey),
      isBookmarked: true,
      onPlay: () => onPlayUnit(level, unit, albumKey),
      onOpen: () => onOpenUnit(level, unit, albumKey),
      onToggleBookmark: () => onToggleBookmark(level, unit, albumKey),
    });
  }

  return legacyRows;
}

export function buildAppViewProps({
  defaultLanguage,
  selectedDefaultLanguage,
  currentIndex,
  lessons,
  libraryIndexSections,
  currentLevel,
  currentUnit,
  mode,
  completedUnitKeys,
  sidebarTab,
  isLeaveCompletedUnitModalOpen,
  leaveCompletedUnitModalTitle,
  leaveCompletedUnitConfirmMessage,
  leaveCompletedUnitCancelLabel,
  leaveCompletedUnitConfirmLabel,
  onLeaveCompletedUnitCancel,
  onLeaveCompletedUnitConfirm,
  isLogoutModalOpen,
  onCloseLogoutModal,
  onConfirmLogoutModal,
  profileName,
  profileInput,
  profileError,
  hasProfileWhitespace,
  isProfileInputValid,
  currentCourseCode,
  activeProfileBookShelf,
  onProfileBookShelfChange,
  onProfileInputChange,
  onApplyProfileName,
  onOpenProfileAlbumLibrary,
  onOpenSettings,
  onRequestLogout,
  learnLanguage,
  onSelectUnit,
  onReadAlbum,
  onPlayBookmarkedUnit,
  onOpenBookmarkedUnit,
  selectedAlbumKey,
  libraryViewMode,
  onSelectedAlbumKeyChange,
  downloadedUnitKeys,
  bookmarkedUnitKeys,
  bookmarkedAlbumKeys,
  onDownloadUnit,
  onRemoveUnitDownload,
  isUnitDownloading,
  onToggleUnitBookmark,
  onToggleAlbumBookmark,
  isPronunciationEnabled,
  isLearningLanguageVisible,
  isTranslationVisible,
  isBoldTextEnabled,
  isAutoScrollEnabled,
  textScalePercent,
  appTheme,
  voiceProvider,
  onDefaultLanguageChange,
  uiLockLanguage,
  onUiLockLanguageChange,
  courseFramework,
  onLearnLanguageChange,
  onCourseFrameworkChange,
  onTogglePronunciation,
  onToggleLearningLanguageVisibility,
  onToggleTranslationVisibility,
  onToggleBoldText,
  onToggleAutoScroll,
  onDecreaseTextSize,
  onIncreaseTextSize,
  onAppThemeChange,
  onVoiceProviderChange,
  onBackToProfile,
  learnStepCount,
  currentBatchEntries,
  lessonBatchGroups,
  learnStep,
  isReading,
  onSelectLessonStep,
  englishReferenceByKey,
  activeSpeakingLessonIndex,
  onPlayLesson,
  savedHighlightPhrasesByLessonKey,
  onSaveLessonHighlight,
  onClearLessonHighlight,
  repeatMode,
  isNextDisabled,
  sectionEnd,
  currentStageRange,
  orderedUnitIndexes,
  isRandomLessonOrderEnabled,
  isMobileBottomBarsVisible,
  onToggleShuffle,
  onToggleRepeat,
  onPrevious,
  onReadCurrentBatch,
  onNext,
  onBackToLibrary,
  onMobileTabChange,
}: BuildAppViewPropsArgs) {
  const appText = getAppText(defaultLanguage);
  const totalLessonsCount = lessons.length;
  const completedLessonsCount = Math.min(currentIndex + 1, totalLessonsCount);
  const overallProgressPercent = totalLessonsCount > 0
    ? Math.round((completedLessonsCount / totalLessonsCount) * 100)
    : 0;
  const activeUnitKey = `${currentLevel}:${currentUnit}`;
  const stageUnits = buildStageUnitsFromLessons(lessons).sort((a, b) => a.level - b.level || a.unit - b.unit);
  const completedLibraryKeys =
    mode === 'completed'
      ? new Set(stageUnits.map((item) => `${item.level}:${item.unit}`))
      : completedUnitKeys;
  const isLibraryView = sidebarTab === 'library';
  const isProfileView = sidebarTab === 'profile';
  const isLessonView = sidebarTab === 'lesson';
  const isSettingsView = sidebarTab === 'settings';
  const showLessonActions = isLessonView;
  const activeOrCurrentLesson = (
    typeof activeSpeakingLessonIndex === 'number'
      ? lessons[activeSpeakingLessonIndex]
      : null
  ) || currentBatchEntries[0]?.lesson || lessons[currentIndex] || null;
  const showLibraryMiniPlayer = (isLibraryView && Boolean(activeOrCurrentLesson))
    || (isProfileView && Boolean(activeOrCurrentLesson));
  const activeOrCurrentUnitCode = activeOrCurrentLesson
    ? `${Math.max(1, getLessonOrderIndex(activeOrCurrentLesson))}.${Math.max(1, getLessonUnitId(activeOrCurrentLesson))}`
    : '';
  const miniPlayerTrackTitle = activeOrCurrentLesson
    ? resolveLessonLearningSourceText({
      lessonEnglish: activeOrCurrentLesson.english,
      lessonPronunciation: activeOrCurrentLesson.pronunciation,
      lessonTranslations: activeOrCurrentLesson.translations,
      learnLanguage,
    })
    : '';
  const miniPlayerTrackMeta = activeOrCurrentLesson
    ? `${activeOrCurrentUnitCode} · ${localizeLibraryTopic(activeOrCurrentLesson.topic, defaultLanguage)}`
    : '';
  const profileAlbumCards = buildProfileAlbumCards({
    lessons,
    libraryIndexSections,
    bookmarkedUnitKeys,
    bookmarkedAlbumKeys,
    currentCourseCode,
    collectionFallbackPrefix: appText.library.collectionFallbackPrefix,
    unitSingularLabel: appText.library.unitSingularLabel,
    unitPluralLabel: appText.library.unitPluralLabel,
    defaultLanguage,
    onOpenAlbumLesson: (albumKey) => {
      onOpenProfileAlbumLibrary();
      onSelectedAlbumKeyChange(albumKey);
    },
  });
  const profileBookmarkedLessonRows = buildProfileBookmarkedLessonRows({
    lessons,
    libraryIndexSections,
    bookmarkedUnitKeys,
    completedUnitKeys: completedLibraryKeys,
    collectionFallbackPrefix: appText.library.collectionFallbackPrefix,
    onPlayUnit: (level, unit, albumKey) => {
      if (onPlayBookmarkedUnit) {
        onPlayBookmarkedUnit(level, unit, albumKey);
        return;
      }
      onReadAlbum([{ level, unit }], albumKey);
    },
    onOpenUnit: (level, unit, albumKey) => {
      if (onOpenBookmarkedUnit) {
        onOpenBookmarkedUnit(level, unit, albumKey);
        return;
      }
      onSelectUnit(level, unit, albumKey);
    },
    onToggleBookmark: (level, unit, albumKey) => {
      onToggleUnitBookmark(level, unit, albumKey);
    },
  });
  const bookmarkedAlbumsCount = profileAlbumCards.filter((card) => card.isBookmarked).length;
  const bookmarkedLessonsCount = profileBookmarkedLessonRows.length;
  const isReadDisabled = mode !== 'learn' || orderedUnitIndexes.length === 0;
  const isPreviousDisabled = mode !== 'learn' || isNextDisabled;
  const computedIsNextDisabled = isNextDisabled || (mode === 'learn' && repeatMode === 'off' && sectionEnd >= currentStageRange.end);
  return {
    isLibraryView,
    isLessonView,
    isProfileView,
    isSettingsView,
    showLessonActions,
    showLibraryMiniPlayer,
    leaveCompletedUnitModalProps: {
      isOpen: isLeaveCompletedUnitModalOpen,
      title: leaveCompletedUnitModalTitle,
      message: leaveCompletedUnitConfirmMessage,
      cancelLabel: leaveCompletedUnitCancelLabel,
      confirmLabel: leaveCompletedUnitConfirmLabel,
      closeAriaLabel: appText.navigation.closeAriaLabel,
      onCancel: onLeaveCompletedUnitCancel,
      onConfirm: onLeaveCompletedUnitConfirm,
    },
    logoutModalProps: {
      isOpen: isLogoutModalOpen,
      title: appText.logoutModal.title,
      message: appText.logoutModal.message,
      cancelLabel: appText.logoutModal.cancelLabel,
      confirmLabel: appText.logoutModal.confirmLabel,
      closeAriaLabel: appText.navigation.closeAriaLabel,
      onCancel: onCloseLogoutModal,
      onConfirm: onConfirmLogoutModal,
    },
    profileViewProps: {
      profileName,
      progressPercent: overallProgressPercent,
      progressLabel: `${completedLessonsCount}/${totalLessonsCount}`,
      profileText: appText.profile,
      currentCourseCode: currentCourseCode || appText.profile.courseNotAvailableLabel,
      bookmarkedAlbumsCount,
      bookmarkedLessonsCount,
      bookmarkedLessonRows: profileBookmarkedLessonRows,
      defaultLanguage,
      unitPrefixLabel: appText.lesson.unitPrefix,
      activeUnitKey,
      albumCards: profileAlbumCards,
      activeBookShelf: activeProfileBookShelf,
      onBookShelfChange: onProfileBookShelfChange,
      onOpenSettings,
    },
    libraryViewProps: {
      lessons,
      defaultLanguage,
      learnLanguage,
      appTheme,
      onSelectUnit,
      onReadAlbum,
      selectedAlbumKey,
      viewMode: libraryViewMode,
      onSelectedAlbumKeyChange,
      completedUnitKeys: completedLibraryKeys,
      activeUnitKey,
      downloadedUnitKeys,
      bookmarkedUnitKeys,
      bookmarkedAlbumKeys,
      onDownloadUnit,
      onRemoveUnitDownload,
      isUnitDownloading,
      onToggleUnitBookmark,
      onToggleAlbumBookmark,
    },
    settingsViewProps: {
      settingsText: appText.settings,
      profileText: appText.profile,
      defaultLanguage: selectedDefaultLanguage,
      learnLanguage,
      uiLockLanguage,
      courseFramework,
      isPronunciationEnabled,
      isLearningLanguageVisible,
      isTranslationVisible,
      isBoldTextEnabled,
      isAutoScrollEnabled,
      textScalePercent,
      canDecreaseTextSize: textScalePercent > 90,
      canIncreaseTextSize: textScalePercent < 120,
      appTheme,
      voiceProvider,
      profileInput,
      profileError,
      hasProfileWhitespace,
      isProfileInputValid,
      onDefaultLanguageChange,
      onUiLockLanguageChange,
      onLearnLanguageChange,
      onCourseFrameworkChange,
      onTogglePronunciation,
      onToggleLearningLanguageVisibility,
      onToggleTranslationVisibility,
      onToggleBoldText,
      onToggleAutoScroll,
      onDecreaseTextSize,
      onIncreaseTextSize,
      onAppThemeChange,
      onVoiceProviderChange,
      onProfileInputChange,
      onApplyProfileName,
      onRequestLogout,
      onBackToProfile,
    },
    lessonViewProps: {
      onBackToLibrary,
      progressLabel: `${Math.min(learnStepCount, learnStep + 1)}/${learnStepCount}`,
      currentIndex,
      currentBatchEntries,
      allBatchGroups: lessonBatchGroups,
      isRevisionView: false,
      currentStep: learnStep,
      isReading,
      onSelectStep: onSelectLessonStep,
      englishReferenceByKey,
      defaultLanguage,
      translationLanguage: selectedDefaultLanguage,
      isPronunciationEnabled,
      isLearningLanguageVisible,
      isTranslationVisible,
      isBoldTextEnabled,
      isAutoScrollEnabled,
      textScalePercent,
      learnLanguage,
      activeSpeakingLessonIndex,
      onPlayLesson,
      savedHighlightPhrasesByLessonKey,
      onSaveLessonHighlight,
      onClearLessonHighlight,
    },
    lessonActionFooterProps: {
      lessonText: appText.lesson,
      mode,
      isNextDisabled: computedIsNextDisabled,
      isPreviousDisabled,
      isReadDisabled,
      isReading,
      isShuffleEnabled: isRandomLessonOrderEnabled,
      repeatMode,
      isVisible: isMobileBottomBarsVisible,
      onToggleShuffle,
      onToggleRepeat,
      onPrevious,
      onRead: onReadCurrentBatch,
      onNext,
    },
    libraryMiniPlayerProps: {
      lessonText: appText.lesson,
      trackTitle: miniPlayerTrackTitle,
      trackMeta: miniPlayerTrackMeta,
      isPlaying: isReading,
      isVisible: isMobileBottomBarsVisible,
      isPreviousDisabled,
      isPlayDisabled: isReadDisabled,
      isNextDisabled: computedIsNextDisabled,
      onPrevious,
      onPlay: onReadCurrentBatch,
      onNext,
      onOpenPlayer: () => onMobileTabChange('lesson'),
    },
    mobileBottomNavProps: {
      navText: appText.navigation,
      activeTab: sidebarTab === 'settings' ? 'profile' : sidebarTab,
      isVisible: isMobileBottomBarsVisible,
      onTabChange: onMobileTabChange,
    },
    appStateText: appText.appState,
  };
}

