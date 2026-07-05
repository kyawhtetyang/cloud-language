import React, { useEffect, useRef, useState } from 'react';
import { useProfileProgress } from './hooks/useProfileProgress';
import { useAppNavigation } from './hooks/useAppNavigation';
import { useAppPreferences } from './hooks/useAppPreferences';
import { useLessonUnitState } from './hooks/useLessonUnitState';
import { useLessonBatchGroups } from './hooks/useLessonBatchGroups';
import { useAppContentState } from './hooks/useAppContentState';
import { useCourseNavigationState } from './hooks/useCourseNavigationState';
import { useAppProfileSettingsSync } from './hooks/useAppProfileSettingsSync';
import { useAppTheme } from './hooks/useAppTheme';
import { useLessonHighlights } from './hooks/useLessonHighlights';
import { useReviewEventLogger } from './hooks/useReviewEventLogger';
import { useTrackPlayback } from './hooks/useTrackPlayback';
import { useAppActions } from './hooks/useAppActions';
import { useAppLifecycle } from './hooks/useAppLifecycle';
import { useAppViewProps } from './hooks/useAppViewProps';
import { useUnitLeaveGuards } from './hooks/useUnitLeaveGuards';
import { RepeatMode, useUnitNavigation } from './hooks/useUnitNavigation';
import { useAppInteractionHandlers } from './hooks/useAppInteractionHandlers';
import { useLibraryIndexData } from './hooks/useLibraryIndexData';
import { AppDialogs } from './components/app/AppDialogs';
import { AppMainContent } from './components/app/AppMainContent';
import { AppBottomBars } from './components/app/AppBottomBars';
import type { ProfileBookShelf } from './components/views/ProfileView';
import {
  AppMode,
  coerceLessonLineVisibility,
  coerceFrameworkForLearnLanguage,
  DEFAULT_LIBRARY_VIEW_MODE,
  DEFAULT_PROGRESS_INDEX,
  DEFAULT_STREAK,
  DEFAULT_UNLOCKED_LEVEL,
  getLessonOrderIndex,
  getLessonUnitId,
  resolveLessonContentLanguage,
  LibraryViewMode,
  PROFILE_NAME_KEY,
  SidebarTab,
  toProfileStorageId,
} from './config/appConfig';
import { AppSidebar } from './components/layout/AppSidebar';
import {
  LessonsUnavailableView,
  LoadingView,
  WelcomeView,
} from './components/views/AppStateViews';
import { VIEW_TOOLBAR_TITLE_CLASS } from './components/views/viewShared';
import { getAppText } from './config/appI18n';
import { localizeLibraryTopic } from './config/libraryI18n';
import type { AlbumCollectionSection } from './components/views/library/libraryTypes';
import type { LessonData } from './types';
import {
  readBookmarkedAlbumKeys,
  readBookmarkedUnitKeys,
  writeBookmarkedAlbumKeys,
  writeBookmarkedUnitKeys,
} from './config/bookmarkStorage';

function resolveHskLevelLanguage(levelCode: string | undefined): string | null {
  const match = String(levelCode || '').match(/HSK\s*(\d+)/i);
  if (!match) return null;
  return `hsk${match[1]}`;
}

function findSectionGroup(sections: AlbumCollectionSection[], albumKey: string | null) {
  if (!albumKey) return null;
  for (const section of sections) {
    if (section.key === albumKey) {
      return { section, group: section.groups[0] || null };
    }
    const found = section.groups.find((group) => group.key === albumKey);
    if (found) {
      return { section, group: found };
    }
  }
  return null;
}

type ActiveBookResumeState = {
  albumKey: string;
  contentLanguage: string;
  sourceLabel: string;
  collectionLabel: string;
};

type PendingBookmarkedUnitAction = {
  level: number;
  unit: number;
  albumKey: string | null;
  action: 'play' | 'open';
};

function getActiveBookResumeStorageKey(
  profileStorageId: string,
  courseFramework: string,
  learnLanguage: string,
): string {
  const profileKey = profileStorageId.trim() || 'guest';
  return `lingo_burmese_active_book:${profileKey}:${courseFramework}:${learnLanguage}`;
}

function readActiveBookResumeState(storageKey: string): ActiveBookResumeState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ActiveBookResumeState>;
    if (
      typeof parsed.albumKey === 'string'
      && typeof parsed.contentLanguage === 'string'
      && typeof parsed.sourceLabel === 'string'
      && typeof parsed.collectionLabel === 'string'
    ) {
      return {
        albumKey: parsed.albumKey,
        contentLanguage: parsed.contentLanguage,
        sourceLabel: parsed.sourceLabel,
        collectionLabel: parsed.collectionLabel,
      };
    }
  } catch {
    return null;
  }
  return null;
}

function writeActiveBookResumeState(storageKey: string, value: ActiveBookResumeState) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(value));
  } catch {
    // ignore storage failures in restricted environments
  }
}

const LIBRARY_BOOT_PLACEHOLDER_LESSONS: LessonData[] = [
  {
    level: 1,
    unit: 1,
    topic: 'Library',
    burmese: '',
    english: 'Library',
    pronunciation: 'Library',
    framework: 'cefr',
    frameworkLevel: 'A1',
    frameworkUnit: 1,
    levelScheme: 'cefr',
    levelCode: 'A1',
    levelOrder: 1,
    collectionLabel: 'Library',
    sourceLabel: 'Library',
    groupId: 'beginner',
    unitId: 1,
    orderIndex: 1,
  },
];

const App: React.FC = () => {
  const lastLibraryTabTapAtRef = useRef(0);
  const {
    profileName,
    profileInput,
    profileError,
    hasProfileWhitespace,
    isProfileInputValid,
    setProfileName,
    setProfileInput,
    applyProfileName,
  } = useProfileProgress(PROFILE_NAME_KEY);
  const [currentIndex, setCurrentIndex] = useState(DEFAULT_PROGRESS_INDEX);
  const [mode, setMode] = useState<AppMode>('learn');
  const [unlockedLevel, setUnlockedLevel] = useState(DEFAULT_UNLOCKED_LEVEL);
  const [streak, setStreak] = useState(DEFAULT_STREAK);
  const {
    isSidebarOpen,
    sidebarTab,
    setIsSidebarOpen,
    setSidebarTab,
    closeSidebar,
    selectTab,
    reloadApp,
  } = useAppNavigation();
  const profileStorageId = profileName ? toProfileStorageId(profileName) : '';
  const {
    isPronunciationEnabled,
    setIsPronunciationEnabled,
    isLearningLanguageVisible,
    setIsLearningLanguageVisible,
    isTranslationVisible,
    setIsTranslationVisible,
    learnLanguage,
    setLearnLanguage,
    defaultLanguage,
    setDefaultLanguage,
    uiLockLanguage,
    setUiLockLanguage,
    courseFramework,
    setCourseFramework,
    textScalePercent,
    setTextScalePercent,
    isBoldTextEnabled,
    setIsBoldTextEnabled,
    isAutoScrollEnabled,
    setIsAutoScrollEnabled,
    isRandomLessonOrderEnabled,
    setIsRandomLessonOrderEnabled,
    isReviewQuestionsRemoved,
    setIsReviewQuestionsRemoved,
    appTheme,
    setAppTheme,
    voiceProvider,
    setVoiceProvider,
    hasHydratedSettings,
  } = useAppPreferences(profileStorageId);
  const effectiveUiLanguage = uiLockLanguage === 'off' ? defaultLanguage : uiLockLanguage;
  const [learnStep, setLearnStep] = useState(0);
  const [completedUnitKeys, setCompletedUnitKeys] = useState<Set<string>>(new Set());
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [pendingAutoPlayUnitKey, setPendingAutoPlayUnitKey] = useState<string | null>(null);

  const [librarySelectedAlbumKey, setLibrarySelectedAlbumKey] = useState<string | null>(null);
  const [libraryViewMode, setLibraryViewMode] = useState<LibraryViewMode>(DEFAULT_LIBRARY_VIEW_MODE);
  const [bookmarkedUnitKeys, setBookmarkedUnitKeys] = useState<Set<string>>(
    () => readBookmarkedUnitKeys(profileStorageId),
  );
  const [bookmarkedAlbumKeys, setBookmarkedAlbumKeys] = useState<Set<string>>(
    () => readBookmarkedAlbumKeys(profileStorageId),
  );
  const [randomOrderVersion, setRandomOrderVersion] = useState(0);
  const [activeLessonContentLanguage, setActiveLessonContentLanguage] = useState<string | null>(null);
  const [activeLibrarySourceLabel, setActiveLibrarySourceLabel] = useState<string | null>(null);
  const [activeLibraryCollectionLabel, setActiveLibraryCollectionLabel] = useState<string | null>(null);
  const [hasBootstrappedBook, setHasBootstrappedBook] = useState(false);
  const [pendingBookmarkedUnitAction, setPendingBookmarkedUnitAction] = useState<PendingBookmarkedUnitAction | null>(null);
  const [activeProfileBookShelf, setActiveProfileBookShelf] = useState<ProfileBookShelf>('current_course');

  useEffect(() => {
    setBookmarkedUnitKeys(readBookmarkedUnitKeys(profileStorageId));
    setBookmarkedAlbumKeys(readBookmarkedAlbumKeys(profileStorageId));
  }, [profileStorageId]);

  useEffect(() => {
    writeBookmarkedUnitKeys(profileStorageId, bookmarkedUnitKeys);
  }, [bookmarkedUnitKeys, profileStorageId]);

  useEffect(() => {
    writeBookmarkedAlbumKeys(profileStorageId, bookmarkedAlbumKeys);
  }, [bookmarkedAlbumKeys, profileStorageId]);

  useEffect(() => {
    const normalizedFramework = coerceFrameworkForLearnLanguage(courseFramework, learnLanguage);
    if (normalizedFramework !== courseFramework) {
      setCourseFramework(normalizedFramework);
    }
  }, [courseFramework, learnLanguage, setCourseFramework]);

  useEffect(() => {
    setActiveLessonContentLanguage(null);
    setActiveLibrarySourceLabel(null);
    setActiveLibraryCollectionLabel(null);
    setLibrarySelectedAlbumKey(null);
    setHasBootstrappedBook(false);
    setPendingBookmarkedUnitAction(null);
  }, [courseFramework, learnLanguage, profileStorageId]);

  const activeBookResumeStorageKey = getActiveBookResumeStorageKey(
    profileStorageId,
    courseFramework,
    learnLanguage,
  );

  useEffect(() => {
    const normalized = coerceLessonLineVisibility(isPronunciationEnabled, isLearningLanguageVisible);
    if (normalized.isPronunciationEnabled !== isPronunciationEnabled) {
      setIsPronunciationEnabled(normalized.isPronunciationEnabled);
    }
    if (normalized.isLearningLanguageVisible !== isLearningLanguageVisible) {
      setIsLearningLanguageVisible(normalized.isLearningLanguageVisible);
    }
  }, [
    isPronunciationEnabled,
    isLearningLanguageVisible,
    setIsPronunciationEnabled,
    setIsLearningLanguageVisible,
  ]);

  const {
    apiBaseUrl,
    lessons,
    loading,
    errorMessage,
    downloadedUnitKeys,
    downloadUnitPack,
    removeUnitPack,
    isUnitDownloading,
    totalLevels,
    englishReferenceByKey,
    leaveCompletedUnitModalTitle,
    leaveCompletedUnitConfirmMessage,
    leaveCompletedUnitCancelLabel,
    leaveCompletedUnitConfirmLabel,
  } = useAppContentState({
    learnLanguage,
    courseFramework,
    defaultLanguage: effectiveUiLanguage,
    lessonContentLanguageOverride: activeLessonContentLanguage,
    lessonQueryFilters: {
      sourceLabel: activeLibrarySourceLabel,
      collectionLabel: activeLibraryCollectionLabel,
    },
    enabled: Boolean(activeLessonContentLanguage),
  });
  const {
    lessons: catalogLessons,
    englishReferenceByKey: catalogEnglishReferenceByKey,
    totalLevels: catalogTotalLevels,
  } = useAppContentState({
    learnLanguage,
    courseFramework,
    defaultLanguage: effectiveUiLanguage,
    lessonContentLanguageOverride: resolveLessonContentLanguage(learnLanguage, courseFramework),
    enabled: Boolean(profileName),
  });
  const isLibraryBootMode = !activeLessonContentLanguage;
  const appText = getAppText(effectiveUiLanguage);
  const welcomeText = appText.welcome;
  const shouldLoadLibraryIndex = Boolean(profileName);
  const {
    sections: libraryIndexSections,
    loading: libraryIndexLoading,
    errorMessage: libraryIndexErrorMessage,
  } = useLibraryIndexData(
    apiBaseUrl,
    courseFramework === 'hsk' ? 'hsk_chinese' : learnLanguage,
    appText.appState.lessonsLoadFailedMessage,
    shouldLoadLibraryIndex,
  );
  const hasCatalogLessons = catalogLessons.length > 0;
  const runtimeLessons = hasCatalogLessons
    ? catalogLessons
    : (isLibraryBootMode ? LIBRARY_BOOT_PLACEHOLDER_LESSONS : lessons);
  const runtimeTotalLevels = hasCatalogLessons ? catalogTotalLevels : (isLibraryBootMode ? 1 : totalLevels);
  const runtimeEnglishReferenceByKey = hasCatalogLessons ? catalogEnglishReferenceByKey : englishReferenceByKey;
  const viewPropsLessons = runtimeLessons;
  const { logReviewEvent } = useReviewEventLogger({
    apiBaseUrl,
    profileName,
    profileStorageId,
    learnLanguage,
  });
  const { highlightPhrasesByLessonKey, saveHighlightSelection, clearHighlightSelection } = useLessonHighlights({
    apiBaseUrl,
    profileName,
    profileStorageId,
    learnLanguage,
    logReviewEvent,
  });
  const { markHydrationStale } = useAppProfileSettingsSync({
    apiBaseUrl,
    lessons: runtimeLessons,
    profileName,
    profileStorageId,
    mode,
    currentIndex,
    unlockedLevel,
    streak,
    totalLevels: runtimeTotalLevels,
    hasHydratedSettings,
    learnLanguage,
    defaultLanguage,
    uiLockLanguage,
    courseFramework,
    isPronunciationEnabled,
    isLearningLanguageVisible,
    isTranslationVisible,
    textScalePercent,
    isBoldTextEnabled,
    isAutoScrollEnabled,
    isRandomLessonOrderEnabled,
    isReviewQuestionsRemoved,
    appTheme,
    voiceProvider,
    setCurrentIndex,
    setUnlockedLevel,
    setStreak,
    setLearnLanguage,
    setDefaultLanguage,
    setUiLockLanguage,
    setCourseFramework,
    setIsPronunciationEnabled,
    setIsLearningLanguageVisible,
    setIsTranslationVisible,
    setTextScalePercent,
    setIsBoldTextEnabled,
    setIsAutoScrollEnabled,
    setIsRandomLessonOrderEnabled,
    setIsReviewQuestionsRemoved,
    setAppTheme,
    setVoiceProvider,
  });
  const {
    currentLevel,
    currentUnit,
    currentCourseCode,
    orderedUnitIndexes,
    sectionStart,
    sectionEnd,
    sectionTotal,
    currentBatchEntries,
  } = useLessonUnitState({
    lessons: runtimeLessons,
    mode,
    currentIndex,
    learnStep,
    isRandomLessonOrderEnabled,
    randomOrderVersion,
  });
  const {
    currentStageCode,
    currentStageRange,
    orderedCourseUnitStartIndexes,
    playableCourseUnitKeys,
  } = useCourseNavigationState({
    lessons: runtimeLessons,
    learnLanguage,
    currentIndex,
    currentLevel,
    sectionStart,
  });
  const lessonBatchGroups = useLessonBatchGroups({
    lessons: runtimeLessons,
    orderedUnitIndexes,
    sectionTotal,
  });
  const {
    isReading,
    activeSpeakingLessonIndex,
    isTrackPlaybackRef,
    lastPlayAnchorLessonIndexRef,
    unitPlaybackStartedAtRef,
    setTrackPlaybackEnabled,
    stopActivePlayback,
    interruptPlaybackImmediately,
    playEntriesSequentially,
    playSingleEntry,
    resetUnitPlaybackAnchor,
  } = useTrackPlayback({
    mode,
    learnLanguage,
    voiceProvider,
  });

  useAppTheme(appTheme);

  const {
    isNextDisabled,
    continueTrackPlaybackIfNeeded,
    handleNext,
    handlePrevious,
    navigateToLibraryUnit,
  } = useUnitNavigation({
    mode,
    repeatMode,
    lessons: runtimeLessons,
    totalLevels: runtimeTotalLevels,
    sectionStart,
    sectionEnd,
    currentStageCode,
    currentStageRange,
    orderedUnitIndexes,
    orderedCourseUnitStartIndexes,
    playableCourseUnitKeys,
    activeSpeakingLessonIndex,
    isTrackPlaybackRef,
    lastPlayAnchorLessonIndexRef,
    unitPlaybackStartedAtRef,
    stopActivePlayback,
    setTrackPlaybackEnabled,
    resetUnitPlaybackAnchor,
    setMode,
    setCurrentIndex,
    setLearnStep,
    setUnlockedLevel,
    setPendingAutoPlayUnitKey,
    setRandomOrderVersion,
    setLibrarySelectedAlbumKey,
    setSidebarTab,
    setIsSidebarOpen,
  });

  const {
    getCurrentUnitSpeakEntries,
    handlePlaySingleLesson,
    handleReadCurrentBatch,
    handleLogoutConfirm,
    handleToggleShuffle,
    handleToggleRepeat,
  } = useAppActions({
    mode,
    learnLanguage,
    lessons: runtimeLessons,
    orderedUnitIndexes,
    isReading,
    activeSpeakingLessonIndex,
    lastPlayAnchorLessonIndexRef,
    unitPlaybackStartedAtRef,
    continueTrackPlaybackIfNeeded,
    stopActivePlayback,
    playEntriesSequentially,
    playSingleEntry,
    setTrackPlaybackEnabled,
    interruptPlaybackImmediately,
    resetUnitPlaybackAnchor,
    setIsLogoutModalOpen,
    setProfileName,
    setProfileInput,
    setMode,
    setCurrentIndex,
    setLearnStep,
    setCompletedUnitKeys,
    setLibrarySelectedAlbumKey,
    setPendingAutoPlayUnitKey,
    setRepeatMode,
    setSidebarTab,
    setIsSidebarOpen,
    setRandomOrderVersion,
    setIsRandomLessonOrderEnabled,
    currentLevel,
    currentUnit,
    logReviewEvent,
  });
  const {
    learnStepCount,
    isMobileBottomBarsVisible,
    handleApplyProfileName,
    handleSelectLessonStep,
    handleReadLibraryAlbum,
    handleRestartCourse,
  } = useAppLifecycle({
    defaultLanguage: effectiveUiLanguage,
    learnLanguage,
    mode,
    sidebarTab,
    currentLevel,
    currentUnit,
    sectionStart,
    sectionTotal,
    lessons: runtimeLessons,
    totalLevels: runtimeTotalLevels,
    orderedUnitIndexes,
    pendingAutoPlayUnitKey,
    isReading,
    activeSpeakingLessonIndex,
    continueTrackPlaybackIfNeeded,
    getCurrentUnitSpeakEntries,
    playEntriesSequentially,
    stopActivePlayback,
    setTrackPlaybackEnabled,
    resetUnitPlaybackAnchor,
    applyProfileName,
    markHydrationStale,
    setMode,
    setSidebarTab,
    setIsSidebarOpen,
    setRandomOrderVersion,
    setPendingAutoPlayUnitKey,
    setCurrentIndex,
    setLearnStep,
    setUnlockedLevel,
    setLibrarySelectedAlbumKey,
  });

  const {
    isLeaveCompletedUnitModalOpen,
    goToLibraryUnit,
    handleLeaveCompletedUnitCancel,
    handleLeaveCompletedUnitConfirm,
  } = useUnitLeaveGuards({
    mode,
    currentLevel,
    currentUnit,
    learnStep,
    learnStepCount,
    completedUnitKeys,
    navigateToLibraryUnit,
    setSidebarTab,
    setIsSidebarOpen,
  });
  const {
    handleMobileTabChange,
    handleOpenProfileAlbumLibrary,
    handleToggleUnitBookmark,
    handleToggleAlbumBookmark,
    handleLearnLanguageChangeWithStop,
    handleVoiceProviderChangeWithStop,
    handleCourseFrameworkChangeWithStop,
    handleReadForActiveTab,
  } = useAppInteractionHandlers({
    lastLibraryTabTapAtRef,
    sidebarTab,
    isReading,
    activeSpeakingLessonIndex,
    setLibraryViewMode,
    setLibrarySelectedAlbumKey,
    setSidebarTab,
    setIsSidebarOpen,
    setBookmarkedUnitKeys,
    setBookmarkedAlbumKeys,
    setTrackPlaybackEnabled,
    resetUnitPlaybackAnchor,
    stopActivePlayback,
    selectTab,
    learnLanguage,
    setLearnLanguage,
    voiceProvider,
    setVoiceProvider,
    courseFramework,
    setCourseFramework,
    handleReadCurrentBatch,
  });
  const handleBackToLibraryContext = () => {
    setSidebarTab('library');
    setIsSidebarOpen(false);
  };
  const handleAppTabChange = (tab: SidebarTab) => {
    if (
      tab === 'library'
      && Boolean(activeLessonContentLanguage)
      && sidebarTab === 'library'
      && !librarySelectedAlbumKey
    ) {
      setActiveLessonContentLanguage(null);
      setActiveLibrarySourceLabel(null);
      setActiveLibraryCollectionLabel(null);
      setLibrarySelectedAlbumKey(null);
      setIsSidebarOpen(false);
      return;
    }
    handleMobileTabChange(tab);
  };

  const applyLibraryAlbumContext = (albumKey: string | null, nextSidebarTab?: SidebarTab) => {
    const found = findSectionGroup(libraryIndexSections, albumKey);
    if (!found || !albumKey) return false;
    const nextLanguage = courseFramework === 'hsk'
      ? resolveHskLevelLanguage(found.group?.levelCode || found.section?.levelCode)
      : learnLanguage;
    const nextSourceLabel = found.group?.sourceLabel || null;
    const nextCollectionLabel = found.group?.collectionLabel || found.section?.label || null;
    if (!nextLanguage || !nextSourceLabel || !nextCollectionLabel) return false;
    setLibrarySelectedAlbumKey(albumKey);
    setActiveLessonContentLanguage(nextLanguage);
    setActiveLibrarySourceLabel(nextSourceLabel);
    setActiveLibraryCollectionLabel(nextCollectionLabel);
    writeActiveBookResumeState(activeBookResumeStorageKey, {
      albumKey,
      contentLanguage: nextLanguage,
      sourceLabel: nextSourceLabel,
      collectionLabel: nextCollectionLabel,
    });
    setHasBootstrappedBook(true);
    if (nextSidebarTab) {
      setSidebarTab(nextSidebarTab);
    }
    setIsSidebarOpen(false);
    return true;
  };

  const isAlbumContextLoaded = (albumKey?: string | null) => {
    if (!albumKey || isLibraryBootMode) return false;
    const found = findSectionGroup(libraryIndexSections, albumKey);
    if (!found) return false;

    const expectedLanguage = courseFramework === 'hsk'
      ? resolveHskLevelLanguage(found.group?.levelCode || found.section?.levelCode)
      : learnLanguage;
    const expectedSourceLabel = found.group?.sourceLabel || null;
    const expectedCollectionLabel = found.group?.collectionLabel || found.section?.label || null;

    return Boolean(
      expectedLanguage
      && expectedSourceLabel
      && expectedCollectionLabel
      && activeLessonContentLanguage === expectedLanguage
      && activeLibrarySourceLabel === expectedSourceLabel
      && activeLibraryCollectionLabel === expectedCollectionLabel
    );
  };

  const prepareForBookmarkedUnitContextSwitch = () => {
    setTrackPlaybackEnabled(false);
    resetUnitPlaybackAnchor();
    if (isReading || activeSpeakingLessonIndex !== null) {
      void stopActivePlayback();
    }
  };

  const handleOpenLibraryAlbum = (albumKey: string | null) => {
    applyLibraryAlbumContext(albumKey, 'library');
  };

  const handleBookmarkedUnitPlay = (level: number, unit: number, albumKey?: string | null) => {
    setActiveProfileBookShelf('bookmarked_lessons');
    if (hasCatalogLessons) {
      void handleReadLibraryAlbum([{ level, unit }]);
      return;
    }
    if (albumKey && !isAlbumContextLoaded(albumKey)) {
      prepareForBookmarkedUnitContextSwitch();
      if (applyLibraryAlbumContext(albumKey)) {
        setPendingBookmarkedUnitAction({ level, unit, albumKey, action: 'play' });
        return;
      }
    }
    void handleReadLibraryAlbum([{ level, unit }], albumKey);
  };

  const handleBookmarkedUnitOpen = (level: number, unit: number, albumKey?: string | null) => {
    setActiveProfileBookShelf('bookmarked_lessons');
    if (hasCatalogLessons) {
      goToLibraryUnit(level, unit);
      return;
    }
    if (albumKey && !isAlbumContextLoaded(albumKey)) {
      prepareForBookmarkedUnitContextSwitch();
      if (applyLibraryAlbumContext(albumKey)) {
        setPendingBookmarkedUnitAction({ level, unit, albumKey, action: 'open' });
        return;
      }
    }
    goToLibraryUnit(level, unit, albumKey);
  };

  useEffect(() => {
    if (!isLibraryBootMode) return;
    if (libraryIndexLoading) return;
    if (libraryIndexSections.length === 0) return;
    if (hasBootstrappedBook) return;

    const resumeState = readActiveBookResumeState(activeBookResumeStorageKey);
    const firstGroup = libraryIndexSections[0]?.groups[0];
    const nextAlbumKey = resumeState?.albumKey || firstGroup?.key || null;

    const found = findSectionGroup(libraryIndexSections, nextAlbumKey);
    const fallbackGroup = !found ? firstGroup : null;
    const resolvedGroup = found?.group || fallbackGroup || null;
    const resolvedSection = found?.section || (fallbackGroup ? libraryIndexSections[0] : null);
    const nextLanguage = resumeState?.contentLanguage
      || (courseFramework === 'hsk'
        ? resolveHskLevelLanguage(resolvedGroup?.levelCode || resolvedSection?.levelCode)
        : learnLanguage);
    const nextSourceLabel = resumeState?.sourceLabel || resolvedGroup?.sourceLabel || null;
    const nextCollectionLabel = resumeState?.collectionLabel || resolvedGroup?.collectionLabel || resolvedSection?.label || null;

    if (!nextLanguage || !nextSourceLabel || !nextCollectionLabel) return;

    setActiveLessonContentLanguage(nextLanguage);
    setActiveLibrarySourceLabel(nextSourceLabel);
    setActiveLibraryCollectionLabel(nextCollectionLabel);
    writeActiveBookResumeState(activeBookResumeStorageKey, {
      albumKey: nextAlbumKey || 'unknown',
      contentLanguage: nextLanguage,
      sourceLabel: nextSourceLabel,
      collectionLabel: nextCollectionLabel,
    });
    setHasBootstrappedBook(true);
  }, [
    activeBookResumeStorageKey,
    courseFramework,
    hasBootstrappedBook,
    isLibraryBootMode,
    learnLanguage,
    libraryIndexLoading,
    libraryIndexSections,
    sidebarTab,
  ]);

  useEffect(() => {
    if (!pendingBookmarkedUnitAction) return;
    if (isLibraryBootMode || loading) return;
    if (!isAlbumContextLoaded(pendingBookmarkedUnitAction.albumKey)) return;

    const targetExists = lessons.some(
      (lesson) => (
        getLessonOrderIndex(lesson) === Math.max(1, pendingBookmarkedUnitAction.level)
        && getLessonUnitId(lesson) === Math.max(1, pendingBookmarkedUnitAction.unit)
      ),
    );

    if (!targetExists) {
      setPendingBookmarkedUnitAction(null);
      return;
    }

    const { level, unit, albumKey, action } = pendingBookmarkedUnitAction;
    setPendingBookmarkedUnitAction(null);

    if (action === 'play') {
      void handleReadLibraryAlbum([{ level, unit }], albumKey);
      return;
    }

    goToLibraryUnit(level, unit, albumKey);
  }, [
    goToLibraryUnit,
    handleReadLibraryAlbum,
    isAlbumContextLoaded,
    isLibraryBootMode,
    lessons,
    loading,
    pendingBookmarkedUnitAction,
  ]);

  if (!profileName) {
    return (
      <WelcomeView
        welcomeText={welcomeText}
        profileInput={profileInput}
        profileError={profileError}
        hasProfileWhitespace={hasProfileWhitespace}
        isProfileInputValid={isProfileInputValid}
        onProfileInputChange={setProfileInput}
        onApplyProfileName={handleApplyProfileName}
      />
    );
  }

  if (isLibraryBootMode) {
    if (libraryIndexLoading) {
      return <LoadingView label={appText.appState.loadingLessonsLabel} />;
    }

    if (libraryIndexErrorMessage || libraryIndexSections.length === 0) {
      return (
        <LessonsUnavailableView
          appStateText={appText.appState}
          errorMessage={libraryIndexErrorMessage}
          apiBaseUrl={apiBaseUrl}
        />
      );
    }
  } else {
    if (loading) {
      return <LoadingView label={appText.appState.loadingLessonsLabel} />;
    }

    if (errorMessage || lessons.length === 0) {
      return (
        <LessonsUnavailableView
          appStateText={appText.appState}
          errorMessage={errorMessage}
          apiBaseUrl={apiBaseUrl}
        />
      );
    }
  }

  const handleSelectedAlbumKeyChange = (albumKey: string | null) => {
    if (!albumKey) {
      setLibrarySelectedAlbumKey(null);
      return;
    }

    if (libraryIndexSections.length === 0) {
      setLibrarySelectedAlbumKey(albumKey);
      return;
    }

    handleOpenLibraryAlbum(albumKey);
  };

  const {
    isLibraryView,
    isLessonView,
    isProfileView,
    isSettingsView,
    showLessonActions,
    showLibraryMiniPlayer,
    leaveCompletedUnitModalProps,
    logoutModalProps,
    profileViewProps,
    libraryViewProps,
    settingsViewProps,
    lessonViewProps,
    lessonActionFooterProps,
    libraryMiniPlayerProps,
    mobileBottomNavProps,
    appStateText,
  } = useAppViewProps({
    defaultLanguage: effectiveUiLanguage,
    selectedDefaultLanguage: defaultLanguage,
    currentIndex,
    lessons: viewPropsLessons,
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
    handleLeaveCompletedUnitCancel,
    handleLeaveCompletedUnitConfirm,
    isLogoutModalOpen,
    setIsLogoutModalOpen,
    handleLogoutConfirm,
    profileName,
    profileInput,
    profileError,
    hasProfileWhitespace,
    isProfileInputValid,
    currentCourseCode,
    activeProfileBookShelf,
    onProfileBookShelfChange: setActiveProfileBookShelf,
    setProfileInput,
    handleApplyProfileName,
    handleOpenProfileAlbumLibrary,
    setSidebarTab,
    setIsSidebarOpen,
    learnLanguage,
    courseFramework,
    goToLibraryUnit,
    handleReadLibraryAlbum,
    handlePlayBookmarkedUnit: handleBookmarkedUnitPlay,
    handleOpenBookmarkedUnit: handleBookmarkedUnitOpen,
    librarySelectedAlbumKey,
    libraryViewMode,
    setLibrarySelectedAlbumKey: handleSelectedAlbumKeyChange,
    downloadedUnitKeys,
    bookmarkedUnitKeys,
    bookmarkedAlbumKeys,
    downloadUnitPack,
    removeUnitPack,
    isUnitDownloading,
    onToggleUnitBookmark: handleToggleUnitBookmark,
    onToggleAlbumBookmark: handleToggleAlbumBookmark,
    isPronunciationEnabled,
    isLearningLanguageVisible,
    isTranslationVisible,
    isBoldTextEnabled,
    isAutoScrollEnabled,
    textScalePercent,
    appTheme,
    voiceProvider,
    setDefaultLanguage,
    uiLockLanguage,
    setUiLockLanguage,
    setLearnLanguage: handleLearnLanguageChangeWithStop,
    setCourseFramework: handleCourseFrameworkChangeWithStop,
    setIsPronunciationEnabled,
    setIsLearningLanguageVisible,
    setIsTranslationVisible,
    setIsBoldTextEnabled,
    setIsAutoScrollEnabled,
    setTextScalePercent,
    setAppTheme,
    setVoiceProvider: handleVoiceProviderChangeWithStop,
    learnStepCount,
    currentBatchEntries,
    lessonBatchGroups,
    learnStep,
    isReading,
    handleSelectLessonStep,
    englishReferenceByKey: runtimeEnglishReferenceByKey,
    activeSpeakingLessonIndex,
    handlePlaySingleLesson,
    highlightPhrasesByLessonKey,
    saveHighlightSelection,
    clearHighlightSelection,
    repeatMode,
    isNextDisabled,
    sectionEnd,
    currentStageRange,
    orderedUnitIndexes,
    isRandomLessonOrderEnabled,
    isMobileBottomBarsVisible,
    handleToggleShuffle,
    handleToggleRepeat,
    handlePrevious,
    handleReadCurrentBatch: handleReadForActiveTab,
    handleNext,
    handleBackToLibrary: handleBackToLibraryContext,
    selectTab: handleMobileTabChange,
  });
  const resolvedLibraryViewProps =
    (isLibraryView && libraryIndexSections.length > 0)
      ? { ...libraryViewProps, sectionsOverride: libraryIndexSections }
      : libraryViewProps;
  const mobileBottomPaddingClass = showLibraryMiniPlayer ? 'pb-56' : 'pb-36';
  const desktopBottomPaddingClass = 'md:pb-32';
  const isPortfolioShell =
    isLibraryView || isLessonView || isProfileView || isSettingsView;
  const isBookTheme = isPortfolioShell;
  const isBookDarkTheme = isPortfolioShell && appTheme === 'dark';
  const leadLesson = currentBatchEntries[0]?.lesson;
  const lessonTopicTitle = leadLesson?.topic
    ? localizeLibraryTopic(leadLesson.topic, effectiveUiLanguage)
    : `${appText.lesson.unitPrefix} ${currentUnit}`;
  const lessonUnitCode = `${Math.max(1, currentLevel)}.${Math.max(1, currentUnit)}`;
  const showShellHeader = isPortfolioShell;
  const shellHeaderTitle = isLessonView
    ? `${lessonUnitCode} ${lessonTopicTitle}`
    : isProfileView
      ? appText.navigation.profileLabel
      : isSettingsView
        ? appText.navigation.settingsLabel
        : appText.navigation.libraryLabel;
  const shellHeaderMeta = '';
  const mobileNavTabs: SidebarTab[] = ['library', 'lesson', 'profile'];

  return (
    <div className={`min-h-screen md:flex ${isBookTheme ? 'portfolio-shell-bg' : 'bg-app-radial'}`}>
      <AppDialogs
        leaveCompletedUnitModalProps={leaveCompletedUnitModalProps}
        logoutModalProps={logoutModalProps}
        isSidebarOpen={isSidebarOpen}
        closeSidebarAriaLabel={appText.navigation.closeAriaLabel}
        onDismissSidebarOverlay={() => setIsSidebarOpen(false)}
      />

      <AppSidebar
        navText={appText.navigation}
        isSidebarOpen={isSidebarOpen}
        sidebarTab={sidebarTab}
        onClose={closeSidebar}
        onSelectTab={handleAppTabChange}
        onReload={reloadApp}
        isBookTheme={isBookTheme}
        isBookDarkTheme={isBookDarkTheme}
      />

      <div className={`flex-1 flex flex-col min-h-screen ${mobileBottomPaddingClass} md:ml-20 lg:ml-64 ${desktopBottomPaddingClass}`}>
        {showShellHeader && (
          <header className="portfolio-shell-header fixed top-0 left-0 right-0 z-40 flex h-12 items-center justify-between gap-3 border-b px-4 md:left-20 lg:left-64 md:h-14 md:px-6">
            <div className="flex items-center gap-3">
              {isLibraryView && librarySelectedAlbumKey && (
                <button
                  type="button"
                  onClick={() => setLibrarySelectedAlbumKey(null)}
                  aria-label={appText.library.backToAlbumsAriaLabel}
                  className="portfolio-soft-icon-button inline-flex h-9 w-9 items-center justify-center rounded-full text-lg font-black leading-none transition-colors"
                >
                  <span aria-hidden="true">‹</span>
                </button>
              )}
              {isLessonView && (
                <button
                  type="button"
                  onClick={handleBackToLibraryContext}
                  aria-label={appText.lesson.backToLibraryAriaLabel}
                  className="portfolio-soft-icon-button inline-flex h-9 w-9 items-center justify-center rounded-full text-lg font-black leading-none transition-colors"
                >
                  <span aria-hidden="true">‹</span>
                </button>
              )}
              <div className="min-w-0">
                {!isLessonView && shellHeaderMeta ? (
                  <p className="truncate text-[11px] font-semibold tracking-wide text-[var(--portfolio-text-secondary)]">
                    {shellHeaderMeta}
                  </p>
                ) : null}
                <h2 className={`${VIEW_TOOLBAR_TITLE_CLASS} truncate`}>
                  {shellHeaderTitle}
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isLessonView && (
                <span className="shrink-0 text-xs font-semibold tracking-wide text-[var(--portfolio-text-secondary)]">
                  {lessonViewProps.progressLabel}
                </span>
              )}
              <button
                type="button"
                onClick={() => setAppTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
                aria-label={isBookDarkTheme ? 'Switch to light mode' : 'Switch to dark mode'}
                title={isBookDarkTheme ? 'Switch to light mode' : 'Switch to dark mode'}
                className="portfolio-soft-icon-button inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors"
              >
                {isBookDarkTheme ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v2m0 14v2m9-9h-2M5 12H3m14.95-6.95-1.41 1.41M7.46 16.54l-1.41 1.41m0-11.31 1.41 1.41m10.08 10.08 1.41 1.41M12 7a5 5 0 100 10 5 5 0 000-10z" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />
                  </svg>
                )}
              </button>
            </div>
          </header>
        )}
        <AppMainContent
          isProfileView={isProfileView}
          isLibraryView={isLibraryView}
          isLessonView={isLessonView}
          isSettingsView={isSettingsView}
          mode={mode}
          profileViewProps={profileViewProps}
          libraryViewProps={resolvedLibraryViewProps}
          settingsViewProps={settingsViewProps}
          lessonViewProps={lessonViewProps}
          appStateText={appStateText}
          onCompletedRestart={handleRestartCourse}
        />

        <AppBottomBars
          showLessonActions={showLessonActions}
          showLibraryMiniPlayer={showLibraryMiniPlayer}
          lessonActionFooterProps={lessonActionFooterProps}
          libraryMiniPlayerProps={libraryMiniPlayerProps}
          mobileBottomNavProps={{ ...mobileBottomNavProps, onTabChange: handleAppTabChange, navTabs: mobileNavTabs, isBookTheme, isBookDarkTheme }}
        />
      </div>
    </div>
  );
};

export default App;

