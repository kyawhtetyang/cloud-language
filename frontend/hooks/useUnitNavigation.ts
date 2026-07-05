import { Dispatch, MutableRefObject, SetStateAction, useRef, useState } from 'react';
import {
  AppMode,
  getLessonOrderIndex,
  getLessonUnitId,
  resolveStageCode,
  SidebarTab,
} from '../config/appConfig';
import { PREVIOUS_TRACK_SEEK_THRESHOLD_MS } from '../config/interactionConfig';
import { LessonData } from '../types';

export type RepeatMode = 'off' | 'all' | 'one';

type UseUnitNavigationParams = {
  mode: AppMode;
  repeatMode: RepeatMode;
  lessons: LessonData[];
  totalLevels: number;
  sectionStart: number;
  sectionEnd: number;
  currentStageCode: string;
  currentStageRange: { start: number; end: number };
  orderedUnitIndexes: number[];
  orderedCourseUnitStartIndexes: number[];
  playableCourseUnitKeys: Set<string>;
  activeSpeakingLessonIndex: number | null;
  isTrackPlaybackRef: MutableRefObject<boolean>;
  lastPlayAnchorLessonIndexRef: MutableRefObject<number | null>;
  unitPlaybackStartedAtRef: MutableRefObject<number | null>;
  stopActivePlayback: () => Promise<void>;
  setTrackPlaybackEnabled: (enabled: boolean) => void;
  resetUnitPlaybackAnchor: () => void;
  setMode: Dispatch<SetStateAction<AppMode>>;
  setCurrentIndex: Dispatch<SetStateAction<number>>;
  setLearnStep: Dispatch<SetStateAction<number>>;
  setUnlockedLevel: Dispatch<SetStateAction<number>>;
  setPendingAutoPlayUnitKey: Dispatch<SetStateAction<string | null>>;
  setRandomOrderVersion: Dispatch<SetStateAction<number>>;
  setLibrarySelectedAlbumKey: Dispatch<SetStateAction<string | null>>;
  setSidebarTab: Dispatch<SetStateAction<SidebarTab>>;
  setIsSidebarOpen: Dispatch<SetStateAction<boolean>>;
};

type UseUnitNavigationResult = {
  isNextDisabled: boolean;
  continueTrackPlaybackIfNeeded: () => void;
  handleNext: () => Promise<void>;
  handlePrevious: () => Promise<void>;
  navigateToLibraryUnit: (level: number, unit: number, albumKey?: string | null) => Promise<void>;
};

export function useUnitNavigation({
  mode,
  repeatMode,
  lessons,
  totalLevels,
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
}: UseUnitNavigationParams): UseUnitNavigationResult {
  const [isNextDisabled, setIsNextDisabled] = useState(false);
  const isUnitNavigationLockedRef = useRef(false);

  const runWithUnitNavigationLock = async (
    task: () => Promise<void> | void,
  ): Promise<void> => {
    if (isUnitNavigationLockedRef.current) return;
    isUnitNavigationLockedRef.current = true;
    setIsNextDisabled(true);
    try {
      await task();
    } finally {
      isUnitNavigationLockedRef.current = false;
      setIsNextDisabled(false);
    }
  };

  const resolveUnitStartFromAnchor = (anchorIndex: number): number | null => {
    const anchorLesson = lessons[anchorIndex];
    if (!anchorLesson) return null;
    const targetLevel = getLessonOrderIndex(anchorLesson);
    const targetUnit = getLessonUnitId(anchorLesson);
    const unitStart = lessons.findIndex(
      (lesson) => getLessonOrderIndex(lesson) === targetLevel && getLessonUnitId(lesson) === targetUnit,
    );
    return unitStart >= 0 ? unitStart : null;
  };

  const resolveCurrentUnitStart = (): number | null => resolveUnitStartFromAnchor(sectionStart);

  const resolvePreviousUnitStartWithinStage = (): number | null => {
    let previousAnchor = sectionStart - 1;
    const isBeforeCurrentStage =
      previousAnchor < 0
      || resolveStageCode(getLessonOrderIndex(lessons[previousAnchor]), lessons[previousAnchor]?.stage) !== currentStageCode;

    if (isBeforeCurrentStage) {
      if (repeatMode === 'all') {
        previousAnchor = currentStageRange.end;
      } else {
        return null;
      }
    }

    if (previousAnchor < 0) return null;
    return resolveUnitStartFromAnchor(previousAnchor);
  };

  const shouldPreviousJumpToPreviousUnit = (): boolean => {
    const firstLessonIndex = orderedUnitIndexes[0];
    if (typeof firstLessonIndex !== 'number') return true;

    const currentPositionLessonIndex = typeof activeSpeakingLessonIndex === 'number'
      ? activeSpeakingLessonIndex
      : lastPlayAnchorLessonIndexRef.current;
    const isOnFirstSentence = currentPositionLessonIndex === firstLessonIndex;
    const isKnownCurrentUnitPosition =
      typeof currentPositionLessonIndex === 'number'
      && orderedUnitIndexes.includes(currentPositionLessonIndex);
    const elapsedMs = unitPlaybackStartedAtRef.current === null
      ? 0
      : Math.max(0, Date.now() - unitPlaybackStartedAtRef.current);
    const isWithinSeekThreshold = elapsedMs <= PREVIOUS_TRACK_SEEK_THRESHOLD_MS;

    return (isOnFirstSentence || !isKnownCurrentUnitPosition) && isWithinSeekThreshold;
  };

  const queueAutoPlayForUnitStart = (unitStart: number): void => {
    const lesson = lessons[unitStart];
    if (!lesson) return;

    const targetLevel = getLessonOrderIndex(lesson);
    const targetUnit = getLessonUnitId(lesson);
    resetUnitPlaybackAnchor();

    setMode('learn');
    setCurrentIndex(unitStart);
    setLearnStep(0);
    setUnlockedLevel((prev) => Math.max(prev, targetLevel));
    setPendingAutoPlayUnitKey(`${targetLevel}:${targetUnit}`);
    setRandomOrderVersion((prev) => prev + 1);
  };

  const resolveNextUnitStartForTrackPlayback = (): number | null => {
    const currentUnitStart = resolveUnitStartFromAnchor(sectionStart);
    if (currentUnitStart === null) return null;
    const currentLesson = lessons[currentUnitStart];
    if (!currentLesson) return null;
    const currentUnitKey = `${getLessonOrderIndex(currentLesson)}:${getLessonUnitId(currentLesson)}`;

    if (repeatMode === 'one') {
      return playableCourseUnitKeys.has(currentUnitKey) ? currentUnitStart : null;
    }

    const currentUnitPosition = orderedCourseUnitStartIndexes.findIndex((index) => {
      const lesson = lessons[index];
      if (!lesson) return false;
      return `${getLessonOrderIndex(lesson)}:${getLessonUnitId(lesson)}` === currentUnitKey;
    });
    if (currentUnitPosition < 0) return null;

    const findPlayableStart = (indexes: number[]): number | null => {
      for (const startIndex of indexes) {
        const lesson = lessons[startIndex];
        if (!lesson) continue;
        const unitKey = `${getLessonOrderIndex(lesson)}:${getLessonUnitId(lesson)}`;
        if (playableCourseUnitKeys.has(unitKey)) {
          return startIndex;
        }
      }
      return null;
    };

    const forwardCandidates = orderedCourseUnitStartIndexes.slice(currentUnitPosition + 1);
    const forwardMatch = findPlayableStart(forwardCandidates);
    if (forwardMatch !== null) return forwardMatch;

    if (repeatMode === 'all') {
      const wrapCandidates = orderedCourseUnitStartIndexes.slice(0, currentUnitPosition + 1);
      return findPlayableStart(wrapCandidates);
    }

    return null;
  };

  const continueTrackPlaybackIfNeeded = (): void => {
    if (!isTrackPlaybackRef.current) return;
    const targetUnitStart = resolveNextUnitStartForTrackPlayback();
    if (targetUnitStart === null) {
      setTrackPlaybackEnabled(false);
      return;
    }
    queueAutoPlayForUnitStart(targetUnitStart);
  };

  const handleNext = async () => {
    if (mode !== 'learn') return;
    await runWithUnitNavigationLock(async () => {
      await stopActivePlayback();

      let targetUnitStart: number | null = null;
      if (repeatMode === 'one') {
        targetUnitStart = resolveUnitStartFromAnchor(sectionStart);
      } else {
        const nextAnchor = sectionEnd + 1;
        const isBeyondCurrentStage =
          nextAnchor >= lessons.length
          || resolveStageCode(getLessonOrderIndex(lessons[nextAnchor]), lessons[nextAnchor]?.stage) !== currentStageCode;

        if (isBeyondCurrentStage) {
          if (repeatMode === 'all') {
            targetUnitStart = resolveUnitStartFromAnchor(currentStageRange.start);
          }
        } else {
          targetUnitStart = resolveUnitStartFromAnchor(nextAnchor);
        }
      }

      if (targetUnitStart !== null) {
        queueAutoPlayForUnitStart(targetUnitStart);
      }
    });
  };

  const handlePrevious = async () => {
    if (mode !== 'learn') return;
    await runWithUnitNavigationLock(async () => {
      const shouldJumpToPreviousUnit =
        repeatMode !== 'one' && shouldPreviousJumpToPreviousUnit();

      await stopActivePlayback();

      let targetUnitStart: number | null = null;
      if (repeatMode === 'one') {
        targetUnitStart = resolveCurrentUnitStart();
      } else {
        if (shouldJumpToPreviousUnit) {
          targetUnitStart = resolvePreviousUnitStartWithinStage();
        }
        if (targetUnitStart === null) {
          targetUnitStart = resolveCurrentUnitStart();
        }
      }

      if (targetUnitStart !== null) {
        queueAutoPlayForUnitStart(targetUnitStart);
      }
    });
  };

  const navigateToLibraryUnit = async (level: number, unit: number, albumKey?: string | null) => {
    await runWithUnitNavigationLock(async () => {
      const safeLevel = Math.min(Math.max(level, 1), totalLevels);
      const safeUnit = Math.max(1, unit);
      const target = lessons.findIndex(
        (lesson) => getLessonOrderIndex(lesson) === safeLevel && getLessonUnitId(lesson) === safeUnit,
      );
      if (target < 0) return;

      await stopActivePlayback();
      resetUnitPlaybackAnchor();

      if (albumKey !== undefined) {
        setLibrarySelectedAlbumKey(albumKey);
      }
      setMode('learn');
      setCurrentIndex(target);
      setUnlockedLevel((prev) => Math.max(prev, safeLevel));
      setSidebarTab('lesson');
      setLearnStep(0);
      setPendingAutoPlayUnitKey(`${safeLevel}:${safeUnit}`);
      setRandomOrderVersion((prev) => prev + 1);
      setIsSidebarOpen(false);
    });
  };

  return {
    isNextDisabled,
    continueTrackPlaybackIfNeeded,
    handleNext,
    handlePrevious,
    navigateToLibraryUnit,
  };
}

