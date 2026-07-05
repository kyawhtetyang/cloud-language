import { Dispatch, MutableRefObject, SetStateAction } from 'react';
import {
  AppMode,
  DEFAULT_PROGRESS_INDEX,
  getLessonUnitId,
  getPlayableLessonText,
  LearnLanguage,
  PROFILE_NAME_KEY,
  SidebarTab,
} from '../config/appConfig';
import { LessonData } from '../types';
import { buildLessonReferenceKey } from '../utils/lessonReference';
import { SpeakEntry } from './useTrackPlayback';
import { RepeatMode } from './useUnitNavigation';

type UseAppActionsArgs = {
  mode: AppMode;
  learnLanguage: LearnLanguage;
  lessons: LessonData[];
  orderedUnitIndexes: number[];
  isReading: boolean;
  activeSpeakingLessonIndex: number | null;
  lastPlayAnchorLessonIndexRef: MutableRefObject<number | null>;
  unitPlaybackStartedAtRef: MutableRefObject<number | null>;
  continueTrackPlaybackIfNeeded: () => void;
  stopActivePlayback: () => Promise<void>;
  playEntriesSequentially: (entries: SpeakEntry[]) => Promise<boolean>;
  playSingleEntry: (entry: SpeakEntry) => Promise<void>;
  setTrackPlaybackEnabled: (enabled: boolean) => void;
  interruptPlaybackImmediately: () => void;
  resetUnitPlaybackAnchor: () => void;
  setIsLogoutModalOpen: Dispatch<SetStateAction<boolean>>;
  setProfileName: Dispatch<SetStateAction<string>>;
  setProfileInput: (value: string) => void;
  setMode: Dispatch<SetStateAction<AppMode>>;
  setCurrentIndex: Dispatch<SetStateAction<number>>;
  setLearnStep: Dispatch<SetStateAction<number>>;
  setCompletedUnitKeys: Dispatch<SetStateAction<Set<string>>>;
  setLibrarySelectedAlbumKey: Dispatch<SetStateAction<string | null>>;
  setPendingAutoPlayUnitKey: Dispatch<SetStateAction<string | null>>;
  setRepeatMode: Dispatch<SetStateAction<RepeatMode>>;
  setSidebarTab: Dispatch<SetStateAction<SidebarTab>>;
  setIsSidebarOpen: Dispatch<SetStateAction<boolean>>;
  setRandomOrderVersion: Dispatch<SetStateAction<number>>;
  setIsRandomLessonOrderEnabled: Dispatch<SetStateAction<boolean>>;
  currentLevel: number;
  currentUnit: number;
  logReviewEvent?: (eventType: string, metadata?: Record<string, unknown>) => void;
};

type UseAppActionsResult = {
  getCurrentUnitSpeakEntries: (startFromLessonIndex?: number | null) => SpeakEntry[];
  handlePlaySingleLesson: (lesson: LessonData, lessonIndex: number) => void;
  handleReadCurrentBatch: () => Promise<void>;
  handleLogoutConfirm: () => Promise<void>;
  handleToggleShuffle: () => void;
  handleToggleRepeat: () => void;
};

export function useAppActions({
  mode,
  learnLanguage,
  lessons,
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
}: UseAppActionsArgs): UseAppActionsResult {
  const getCurrentUnitSpeakEntries = (startFromLessonIndex?: number | null): SpeakEntry[] => {
    const entries = orderedUnitIndexes
      .map((lessonIndex) => {
        const lesson = lessons[lessonIndex];
        if (!lesson) return null;
        const speakTextValue = getPlayableLessonText(lesson, learnLanguage);
        if (!speakTextValue) return null;
        return {
          text: speakTextValue,
          unitId: getLessonUnitId(lesson),
          audioUrl: lesson.audioPath,
          lessonIndex,
        };
      })
      .filter((entry): entry is SpeakEntry => entry !== null);

    if (typeof startFromLessonIndex !== 'number') {
      return entries;
    }

    const startPosition = entries.findIndex((entry) => entry.lessonIndex === startFromLessonIndex);
    if (startPosition < 0) {
      return entries;
    }
    return entries.slice(startPosition);
  };

  const handlePlaySingleLesson = (lesson: LessonData, lessonIndex: number) => {
    const speakValue = getPlayableLessonText(lesson, learnLanguage);
    if (!speakValue) return;
    logReviewEvent?.('sentence_play', {
      lessonKey: buildLessonReferenceKey(lesson),
      sentenceText: speakValue,
      lessonIndex,
      mode,
    });
    void playSingleEntry({
      text: speakValue,
      unitId: getLessonUnitId(lesson),
      audioUrl: lesson.audioPath,
      lessonIndex,
    });
  };

  const handleReadCurrentBatch = async () => {
    if (mode !== 'learn') return;

    if (isReading || activeSpeakingLessonIndex !== null) {
      await stopActivePlayback();
      return;
    }

    setTrackPlaybackEnabled(true);
    unitPlaybackStartedAtRef.current = Date.now();
    const texts = getCurrentUnitSpeakEntries(lastPlayAnchorLessonIndexRef.current);
    if (texts.length === 0) {
      continueTrackPlaybackIfNeeded();
      return;
    }
    logReviewEvent?.('batch_play', {
      entryCount: texts.length,
      startLessonIndex: texts[0]?.lessonIndex ?? null,
      currentLevel,
      currentUnit,
      mode,
    });
    const finished = await playEntriesSequentially(texts);
    if (!finished) return;
    continueTrackPlaybackIfNeeded();
  };

  const handleLogoutConfirm = async () => {
    setIsLogoutModalOpen(false);
    if (isReading || activeSpeakingLessonIndex !== null) {
      await stopActivePlayback();
    } else {
      interruptPlaybackImmediately();
    }
    setTrackPlaybackEnabled(false);
    resetUnitPlaybackAnchor();

    try {
      localStorage.removeItem(PROFILE_NAME_KEY);
    } catch {
      // Keep logout resilient if storage is unavailable.
    }

    setProfileName('');
    setProfileInput('');
    setMode('learn');
    setCurrentIndex(DEFAULT_PROGRESS_INDEX);
    setLearnStep(0);
    setCompletedUnitKeys(new Set());
    setLibrarySelectedAlbumKey(null);
    setPendingAutoPlayUnitKey(null);
    setRepeatMode('off');
    setSidebarTab('profile');
    setIsSidebarOpen(false);
    setRandomOrderVersion((prev) => prev + 1);
  };

  const handleToggleShuffle = () => {
    const wasPlaying = isReading || activeSpeakingLessonIndex !== null;
    if (wasPlaying) {
      interruptPlaybackImmediately();
    }

    setIsRandomLessonOrderEnabled((prev) => !prev);
    setRandomOrderVersion((prev) => prev + 1);

    if (wasPlaying && mode === 'learn') {
      setLearnStep(0);
      setPendingAutoPlayUnitKey(`${currentLevel}:${currentUnit}`);
    }
  };

  const handleToggleRepeat = () => {
    setRepeatMode((prev) => {
      const next = prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off';
      logReviewEvent?.('repeat_mode_change', {
        previousMode: prev,
        nextMode: next,
        currentLevel,
        currentUnit,
      });
      return next;
    });
  };

  return {
    getCurrentUnitSpeakEntries,
    handlePlaySingleLesson,
    handleReadCurrentBatch,
    handleLogoutConfirm,
    handleToggleShuffle,
    handleToggleRepeat,
  };
}

