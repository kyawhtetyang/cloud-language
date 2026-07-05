import { Dispatch, SetStateAction, useEffect, useMemo, useRef, useState } from 'react';
import {
  AppMode,
  DEFAULT_PROGRESS_INDEX,
  DefaultLanguage,
  getLessonOrderIndex,
  getLessonUnitId,
  getPlayableLessonText,
  LearnLanguage,
  LESSONS_PER_BATCH,
  SidebarTab,
} from '../config/appConfig';
import { LessonData } from '../types';
import { SpeakEntry } from './useTrackPlayback';

type UnitTarget = {
  level: number;
  unit: number;
};

type UseAppLifecycleParams = {
  defaultLanguage: DefaultLanguage;
  learnLanguage: LearnLanguage;
  mode: AppMode;
  sidebarTab: SidebarTab;
  currentLevel: number;
  currentUnit: number;
  sectionStart: number;
  sectionTotal: number;
  lessons: LessonData[];
  totalLevels: number;
  orderedUnitIndexes: number[];
  pendingAutoPlayUnitKey: string | null;
  isReading: boolean;
  activeSpeakingLessonIndex: number | null;
  continueTrackPlaybackIfNeeded: () => void;
  getCurrentUnitSpeakEntries: (startFromLessonIndex?: number | null) => SpeakEntry[];
  playEntriesSequentially: (entries: SpeakEntry[]) => Promise<boolean>;
  stopActivePlayback: () => Promise<void>;
  setTrackPlaybackEnabled: (enabled: boolean) => void;
  resetUnitPlaybackAnchor: () => void;
  applyProfileName: (onApplied?: (nextName: string) => void) => void;
  markHydrationStale: () => void;
  setMode: Dispatch<SetStateAction<AppMode>>;
  setSidebarTab: Dispatch<SetStateAction<SidebarTab>>;
  setIsSidebarOpen: Dispatch<SetStateAction<boolean>>;
  setRandomOrderVersion: Dispatch<SetStateAction<number>>;
  setPendingAutoPlayUnitKey: Dispatch<SetStateAction<string | null>>;
  setCurrentIndex: Dispatch<SetStateAction<number>>;
  setLearnStep: Dispatch<SetStateAction<number>>;
  setUnlockedLevel: Dispatch<SetStateAction<number>>;
  setLibrarySelectedAlbumKey: Dispatch<SetStateAction<string | null>>;
};

type UseAppLifecycleResult = {
  learnStepCount: number;
  isMobileBottomBarsVisible: boolean;
  handleApplyProfileName: () => void;
  handleSelectLessonStep: (step: number) => Promise<void>;
  handleReadLibraryAlbum: (units: UnitTarget[], albumKey?: string | null) => Promise<void>;
  handleRestartCourse: () => void;
};

export function useAppLifecycle({
  defaultLanguage,
  learnLanguage,
  mode,
  sidebarTab,
  currentLevel,
  currentUnit,
  sectionStart,
  sectionTotal,
  lessons,
  totalLevels,
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
}: UseAppLifecycleParams): UseAppLifecycleResult {
  const [isMobileBottomBarsVisible, setIsMobileBottomBarsVisible] = useState(true);
  const lastUnitKeyRef = useRef<string>('');
  const lastScrollYRef = useRef(0);
  const scrollTickingRef = useRef(false);

  const learnStepCount = useMemo(
    () => Math.max(1, Math.ceil(sectionTotal / LESSONS_PER_BATCH)),
    [sectionTotal],
  );

  const handleApplyProfileName = () => {
    if (typeof document !== 'undefined') {
      const activeElement = document.activeElement;
      if (
        activeElement instanceof HTMLElement
        && ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeElement.tagName)
      ) {
        activeElement.blur();
      }
    }

    applyProfileName(() => {
      markHydrationStale();
      setMode('learn');
      setSidebarTab('lesson');
      setRandomOrderVersion((prev) => prev + 1);
      setIsSidebarOpen(false);
    });
  };

  useEffect(() => {
    const unitKey = `${currentLevel}:${currentUnit}`;
    if (lastUnitKeyRef.current === unitKey) return;
    lastUnitKeyRef.current = unitKey;
    resetUnitPlaybackAnchor();
  }, [currentLevel, currentUnit, resetUnitPlaybackAnchor]);

  useEffect(() => {
    const languageClassMap = {
      burmese: 'lang-burmese',
      chinese: 'lang-chinese',
      thai: 'lang-thai',
      vietnamese: 'lang-vietnamese',
    } as const;

    Object.values(languageClassMap).forEach((className) => {
      document.body.classList.remove(className);
    });

    const activeLanguageClasses = new Set(
      [defaultLanguage, learnLanguage]
        .map((language) => languageClassMap[language as keyof typeof languageClassMap])
        .filter(Boolean),
    );

    activeLanguageClasses.forEach((className) => {
      document.body.classList.add(className);
    });

    document.documentElement.lang =
      defaultLanguage === 'burmese'
        ? 'my'
        : defaultLanguage === 'thai'
          ? 'th'
        : defaultLanguage === 'vietnamese'
          ? 'vi'
          : defaultLanguage === 'chinese'
            ? 'zh'
        : 'en';
  }, [defaultLanguage, learnLanguage]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isMobileViewport = () => window.matchMedia('(max-width: 767px)').matches;
    lastScrollYRef.current = window.scrollY || 0;

    const onScroll = () => {
      if (scrollTickingRef.current) return;
      const currentScrollY = window.scrollY || 0;
      scrollTickingRef.current = true;
      window.requestAnimationFrame(() => {
        if (!isMobileViewport()) {
          setIsMobileBottomBarsVisible(true);
          lastScrollYRef.current = currentScrollY;
          scrollTickingRef.current = false;
          return;
        }

        if (sidebarTab !== 'lesson') {
          setIsMobileBottomBarsVisible(true);
          lastScrollYRef.current = currentScrollY;
          scrollTickingRef.current = false;
          return;
        }

        const delta = currentScrollY - lastScrollYRef.current;
        if (currentScrollY <= 12 || delta < -8) {
          setIsMobileBottomBarsVisible(true);
        } else if (delta > 8) {
          setIsMobileBottomBarsVisible(false);
        }

        lastScrollYRef.current = currentScrollY;
        scrollTickingRef.current = false;
      });
    };

    const onResize = () => {
      if (!isMobileViewport()) {
        setIsMobileBottomBarsVisible(true);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [sidebarTab]);

  useEffect(() => {
    setIsMobileBottomBarsVisible(true);
  }, [mode, sidebarTab]);

  useEffect(() => {
    if (!pendingAutoPlayUnitKey) return;
    if (mode !== 'learn') return;
    if (sidebarTab !== 'lesson' && sidebarTab !== 'library') return;
    if (orderedUnitIndexes.length === 0) return;

    const activeUnitKeyNow = `${currentLevel}:${currentUnit}`;
    if (activeUnitKeyNow !== pendingAutoPlayUnitKey) return;

    setPendingAutoPlayUnitKey(null);
    void (async () => {
      const texts = getCurrentUnitSpeakEntries();
      if (texts.length === 0) {
        continueTrackPlaybackIfNeeded();
        return;
      }
      const finished = await playEntriesSequentially(texts);
      if (!finished) return;
      continueTrackPlaybackIfNeeded();
    })();
  }, [
    continueTrackPlaybackIfNeeded,
    currentLevel,
    currentUnit,
    getCurrentUnitSpeakEntries,
    mode,
    orderedUnitIndexes.length,
    pendingAutoPlayUnitKey,
    playEntriesSequentially,
    setPendingAutoPlayUnitKey,
    sidebarTab,
  ]);

  const handleSelectLessonStep = async (step: number) => {
    if (mode !== 'learn') return;
    setTrackPlaybackEnabled(false);
    const safeStep = Math.max(0, Math.min(learnStepCount - 1, step));
    if (isReading || activeSpeakingLessonIndex !== null) {
      await stopActivePlayback();
    }
    setLearnStep(safeStep);
    const nextOffset = safeStep * LESSONS_PER_BATCH;
    setCurrentIndex(orderedUnitIndexes[nextOffset] ?? sectionStart);
  };

  const handleReadLibraryAlbum = async (
    units: UnitTarget[],
    albumKey?: string | null,
  ) => {
    if (mode !== 'learn') return;
    if (units.length === 0) return;
    setTrackPlaybackEnabled(false);

    const firstUnit = units[0];
    const safeLevel = Math.min(Math.max(firstUnit.level, 1), totalLevels);
    const safeUnit = Math.max(1, firstUnit.unit);
    const target = lessons.findIndex(
      (lesson) => getLessonOrderIndex(lesson) === safeLevel && getLessonUnitId(lesson) === safeUnit,
    );
    if (target < 0) return;

    if (albumKey !== undefined) {
      setLibrarySelectedAlbumKey(albumKey);
    }
    setCurrentIndex(target);
    setLearnStep(0);
    setUnlockedLevel((prev) => Math.max(prev, safeLevel));

    if (isReading || activeSpeakingLessonIndex !== null) {
      await stopActivePlayback();
    }

    const unitKeySet = new Set(units.map((item) => `${Math.max(1, item.level)}:${Math.max(1, item.unit)}`));
    const texts = lessons.flatMap((lesson, lessonIndex) => {
      const key = `${getLessonOrderIndex(lesson)}:${getLessonUnitId(lesson)}`;
      const speakTextValue = getPlayableLessonText(lesson, learnLanguage);
      if (!unitKeySet.has(key) || !speakTextValue) return [];
      return [{
        text: speakTextValue,
        unitId: getLessonUnitId(lesson),
        audioUrl: lesson.audioPath,
        lessonIndex,
      }];
    });

    if (texts.length === 0) return;
    await playEntriesSequentially(texts);
  };

  const handleRestartCourse = () => {
    setMode('learn');
    setCurrentIndex(DEFAULT_PROGRESS_INDEX);
    setLearnStep(0);
    setRandomOrderVersion((prev) => prev + 1);
    setIsSidebarOpen(false);
  };

  return {
    learnStepCount,
    isMobileBottomBarsVisible,
    handleApplyProfileName,
    handleSelectLessonStep,
    handleReadLibraryAlbum,
    handleRestartCourse,
  };
}

