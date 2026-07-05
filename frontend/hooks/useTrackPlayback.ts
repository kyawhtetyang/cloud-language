import { MutableRefObject, useEffect, useRef, useState } from 'react';
import { AppMode, LearnLanguage, VoiceProvider } from '../config/appConfig';
import { cancelSpeech, speakText } from '../components/AudioButton';
import {
  SPEECH_IDLE_POLL_INTERVAL_MS,
  SPEECH_IDLE_TIMEOUT_MS,
} from '../config/interactionConfig';

export type SpeakEntry = {
  text: string;
  unitId: number;
  audioUrl: string | undefined;
  lessonIndex: number;
};

type UseTrackPlaybackParams = {
  mode: AppMode;
  learnLanguage: LearnLanguage;
  voiceProvider: VoiceProvider;
};

type UseTrackPlaybackResult = {
  isReading: boolean;
  activeSpeakingLessonIndex: number | null;
  isTrackPlaybackRef: MutableRefObject<boolean>;
  lastPlayAnchorLessonIndexRef: MutableRefObject<number | null>;
  unitPlaybackStartedAtRef: MutableRefObject<number | null>;
  setTrackPlaybackEnabled: (enabled: boolean) => void;
  stopActivePlayback: () => Promise<void>;
  interruptPlaybackImmediately: () => void;
  playEntriesSequentially: (entries: SpeakEntry[]) => Promise<boolean>;
  playSingleEntry: (entry: SpeakEntry) => Promise<void>;
  resetUnitPlaybackAnchor: () => void;
};

export function useTrackPlayback({
  mode,
  learnLanguage,
  voiceProvider,
}: UseTrackPlaybackParams): UseTrackPlaybackResult {
  const [isReading, setIsReading] = useState(false);
  const [activeSpeakingLessonIndex, setActiveSpeakingLessonIndex] = useState<number | null>(null);
  const readSessionRef = useRef(0);
  const isTrackPlaybackRef = useRef(false);
  const lastPlayAnchorLessonIndexRef = useRef<number | null>(null);
  const unitPlaybackStartedAtRef = useRef<number | null>(null);
  const playbackTokenRef = useRef(0);

  const bumpPlaybackToken = (): number => {
    playbackTokenRef.current += 1;
    return playbackTokenRef.current;
  };

  const isPlaybackTokenCurrent = (token: number): boolean => playbackTokenRef.current === token;

  const waitForSpeechIdle = async (timeoutMs = SPEECH_IDLE_TIMEOUT_MS): Promise<void> => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const synth = window.speechSynthesis;
    const startedAt = Date.now();
    while (Date.now() - startedAt < timeoutMs) {
      if (!synth.speaking && !synth.pending) return;
      await new Promise((resolve) => window.setTimeout(resolve, SPEECH_IDLE_POLL_INTERVAL_MS));
    }
  };

  const interruptPlaybackImmediately = () => {
    isTrackPlaybackRef.current = false;
    readSessionRef.current += 1;
    bumpPlaybackToken();
    setIsReading(false);
    setActiveSpeakingLessonIndex(null);
    cancelSpeech();
  };

  const stopActivePlayback = async (): Promise<void> => {
    interruptPlaybackImmediately();
    await waitForSpeechIdle();
  };

  const playEntriesSequentially = async (entries: SpeakEntry[]): Promise<boolean> => {
    if (mode !== 'learn' || entries.length === 0) return false;
    const sessionId = readSessionRef.current + 1;
    const playbackToken = bumpPlaybackToken();
    readSessionRef.current = sessionId;
    unitPlaybackStartedAtRef.current = Date.now();
    setIsReading(true);
    setActiveSpeakingLessonIndex(null);
    cancelSpeech();
    await waitForSpeechIdle();

    for (const entry of entries) {
      if (readSessionRef.current !== sessionId) break;
      if (isPlaybackTokenCurrent(playbackToken)) {
        lastPlayAnchorLessonIndexRef.current = entry.lessonIndex;
        setActiveSpeakingLessonIndex(entry.lessonIndex);
      }
      await speakText(entry.text, {
        learnLanguage,
        unitId: entry.unitId,
        audioUrl: entry.audioUrl,
        voiceProvider,
        onStart: () => {
          if (readSessionRef.current === sessionId && isPlaybackTokenCurrent(playbackToken)) {
            lastPlayAnchorLessonIndexRef.current = entry.lessonIndex;
            setActiveSpeakingLessonIndex(entry.lessonIndex);
          }
        },
        onEnd: () => {
          if (readSessionRef.current === sessionId && isPlaybackTokenCurrent(playbackToken)) {
            setActiveSpeakingLessonIndex(null);
          }
        },
      });
    }

    if (readSessionRef.current === sessionId && isPlaybackTokenCurrent(playbackToken)) {
      setIsReading(false);
      setActiveSpeakingLessonIndex(null);
      return true;
    }
    return false;
  };

  const playSingleEntry = async (entry: SpeakEntry): Promise<void> => {
    isTrackPlaybackRef.current = false;
    readSessionRef.current += 1;
    const sessionId = readSessionRef.current;
    const playbackToken = bumpPlaybackToken();
    unitPlaybackStartedAtRef.current = Date.now();
    setIsReading(false);
    lastPlayAnchorLessonIndexRef.current = entry.lessonIndex;
    setActiveSpeakingLessonIndex(entry.lessonIndex);
    cancelSpeech();
    await waitForSpeechIdle();

    if (!entry.text || readSessionRef.current !== sessionId || !isPlaybackTokenCurrent(playbackToken)) {
      return;
    }

    lastPlayAnchorLessonIndexRef.current = entry.lessonIndex;
    setActiveSpeakingLessonIndex(entry.lessonIndex);
    await speakText(entry.text, {
      learnLanguage,
      unitId: entry.unitId,
      audioUrl: entry.audioUrl,
      voiceProvider,
      onStart: () => {
        if (readSessionRef.current === sessionId && isPlaybackTokenCurrent(playbackToken)) {
          lastPlayAnchorLessonIndexRef.current = entry.lessonIndex;
          setActiveSpeakingLessonIndex(entry.lessonIndex);
        }
      },
      onEnd: () => {
        if (readSessionRef.current === sessionId && isPlaybackTokenCurrent(playbackToken)) {
          setActiveSpeakingLessonIndex(null);
        }
      },
    });

    if (readSessionRef.current === sessionId && isPlaybackTokenCurrent(playbackToken)) {
      setActiveSpeakingLessonIndex(null);
    }
  };

  const setTrackPlaybackEnabled = (enabled: boolean) => {
    isTrackPlaybackRef.current = enabled;
  };

  const resetUnitPlaybackAnchor = () => {
    unitPlaybackStartedAtRef.current = null;
    lastPlayAnchorLessonIndexRef.current = null;
  };

  useEffect(() => {
    if (mode !== 'learn' && (isReading || activeSpeakingLessonIndex !== null)) {
      isTrackPlaybackRef.current = false;
      readSessionRef.current += 1;
      bumpPlaybackToken();
      setIsReading(false);
      setActiveSpeakingLessonIndex(null);
      cancelSpeech();
    }
  }, [activeSpeakingLessonIndex, isReading, mode]);

  return {
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
  };
}

