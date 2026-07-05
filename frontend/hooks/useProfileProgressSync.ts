import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from 'react';
import { LessonData, ProgressState } from '../types';
import {
  AppTheme,
  AppMode,
  CourseFramework,
  DEFAULT_PROGRESS_INDEX,
  DEFAULT_STREAK,
  DEFAULT_UNLOCKED_LEVEL,
  DefaultLanguage,
  getLessonOrderIndex,
  LearnLanguage,
  UiLockLanguage,
  VoiceProvider,
  PROGRESS_KEY,
  STREAK_KEY,
  UNLOCKED_LEVEL_KEY,
} from '../config/appConfig';
import { applyRemoteSyncedSettings, buildSyncedSettingsPayload } from '../config/settingsSync';
import {
  enqueueProgressUpdate,
  flushProgressQueue,
  resetProcessingQueueItems,
} from '../offline/offlineStore';
import { buildProfileAuthHeaders } from '../utils/profileAuth';

const PROGRESS_SYNC_DEBOUNCE_MS = 600;

type UseProfileProgressSyncParams = {
  apiBaseUrl: string;
  lessons: LessonData[];
  profileName: string;
  profileStorageId: string;
  mode: AppMode;
  currentIndex: number;
  unlockedLevel: number;
  streak: number;
  learnLanguage: LearnLanguage;
  defaultLanguage: DefaultLanguage;
  uiLockLanguage: UiLockLanguage;
  courseFramework: CourseFramework;
  isPronunciationEnabled: boolean;
  isLearningLanguageVisible: boolean;
  isTranslationVisible: boolean;
  textScalePercent: number;
  isBoldTextEnabled: boolean;
  isAutoScrollEnabled: boolean;
  isRandomLessonOrderEnabled: boolean;
  isReviewQuestionsRemoved: boolean;
  appTheme: AppTheme;
  voiceProvider: VoiceProvider;
  totalLevels: number;
  progressStorageKey: string;
  unlockedStorageKey: string;
  streakStorageKey: string;
  setCurrentIndex: Dispatch<SetStateAction<number>>;
  setUnlockedLevel: Dispatch<SetStateAction<number>>;
  setStreak: Dispatch<SetStateAction<number>>;
  setLearnLanguage: Dispatch<SetStateAction<LearnLanguage>>;
  setDefaultLanguage: Dispatch<SetStateAction<DefaultLanguage>>;
  setUiLockLanguage: Dispatch<SetStateAction<UiLockLanguage>>;
  setCourseFramework: Dispatch<SetStateAction<CourseFramework>>;
  setIsPronunciationEnabled: Dispatch<SetStateAction<boolean>>;
  setIsLearningLanguageVisible: Dispatch<SetStateAction<boolean>>;
  setIsTranslationVisible: Dispatch<SetStateAction<boolean>>;
  setTextScalePercent: Dispatch<SetStateAction<number>>;
  setIsBoldTextEnabled: Dispatch<SetStateAction<boolean>>;
  setIsAutoScrollEnabled: Dispatch<SetStateAction<boolean>>;
  setIsRandomLessonOrderEnabled: Dispatch<SetStateAction<boolean>>;
  setIsReviewQuestionsRemoved: Dispatch<SetStateAction<boolean>>;
  setAppTheme: Dispatch<SetStateAction<AppTheme>>;
  setVoiceProvider: Dispatch<SetStateAction<VoiceProvider>>;
};

export function useProfileProgressSync({
  apiBaseUrl,
  lessons,
  profileName,
  profileStorageId,
  mode,
  currentIndex,
  unlockedLevel,
  streak,
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
  totalLevels,
  progressStorageKey,
  unlockedStorageKey,
  streakStorageKey,
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
}: UseProfileProgressSyncParams) {
  const [hasHydratedProfile, setHasHydratedProfile] = useState(false);
  const isFlushingQueueRef = useRef(false);

  const markHydrationStale = useCallback(() => {
    setHasHydratedProfile(false);
  }, []);

  const flushSyncQueueSafely = useCallback(async () => {
    if (isFlushingQueueRef.current) return;
    isFlushingQueueRef.current = true;
    try {
      await flushProgressQueue(apiBaseUrl);
    } finally {
      isFlushingQueueRef.current = false;
    }
  }, [apiBaseUrl]);

  useEffect(() => {
    if (lessons.length === 0 || !profileName || hasHydratedProfile) return;
    let cancelled = false;

    const hydrateProfileProgress = async () => {
      let restoredIndex = 0;
      try {
        const saved = localStorage.getItem(progressStorageKey) || localStorage.getItem(PROGRESS_KEY);
        restoredIndex = saved ? (JSON.parse(saved) as ProgressState).currentIndex : DEFAULT_PROGRESS_INDEX;
      } catch {
        restoredIndex = DEFAULT_PROGRESS_INDEX;
      }
      const safeLocalIndex = Math.min(Math.max(restoredIndex, 0), lessons.length - 1);

      const savedUnlocked = Number(
        localStorage.getItem(unlockedStorageKey)
        || localStorage.getItem(UNLOCKED_LEVEL_KEY)
        || DEFAULT_UNLOCKED_LEVEL,
      );
      const inferredUnlocked = lessons[safeLocalIndex]
        ? getLessonOrderIndex(lessons[safeLocalIndex])
        : DEFAULT_UNLOCKED_LEVEL;
      const safeLocalUnlocked = Math.min(
        totalLevels,
        Math.max(savedUnlocked, inferredUnlocked, DEFAULT_UNLOCKED_LEVEL),
      );
      const safeLocalStreak = Math.max(
        DEFAULT_STREAK,
        Number(localStorage.getItem(streakStorageKey) || localStorage.getItem(STREAK_KEY) || DEFAULT_STREAK),
      );

      if (cancelled) return;
      setCurrentIndex(safeLocalIndex);
      setUnlockedLevel(safeLocalUnlocked);
      setStreak(safeLocalStreak);

      try {
        const authHeaders = buildProfileAuthHeaders(profileStorageId);
        const response = await fetch(
          `${apiBaseUrl}/api/progress?profileName=${encodeURIComponent(profileName)}`,
          {
            headers: authHeaders,
          },
        );
        if (response.ok) {
          const remote = await response.json();
          const remoteIndex = Math.min(
            Math.max(DEFAULT_PROGRESS_INDEX, Number(remote.currentIndex) || DEFAULT_PROGRESS_INDEX),
            lessons.length - 1,
          );
          const remoteUnlocked = Math.min(
            totalLevels,
            Math.max(DEFAULT_UNLOCKED_LEVEL, Number(remote.unlockedLevel) || DEFAULT_UNLOCKED_LEVEL),
          );
          const remoteStreak = Math.max(DEFAULT_STREAK, Number(remote.streak) || DEFAULT_STREAK);
          if (cancelled) return;
          setCurrentIndex(remoteIndex);
          setUnlockedLevel(remoteUnlocked);
          setStreak(remoteStreak);
          applyRemoteSyncedSettings(remote as Record<string, unknown>, {
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
          }, {
            learnLanguage,
            defaultLanguage,
            courseFramework,
          });
        }
      } catch {
        // DB sync is optional; localStorage remains the fallback.
      } finally {
        if (!cancelled) setHasHydratedProfile(true);
      }
    };

    hydrateProfileProgress();
    return () => {
      cancelled = true;
    };
  }, [
    apiBaseUrl,
    hasHydratedProfile,
    lessons,
    profileName,
    progressStorageKey,
    setCurrentIndex,
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
    setLearnLanguage,
    setStreak,
    setUnlockedLevel,
    streakStorageKey,
    totalLevels,
    unlockedStorageKey,
    profileStorageId,
  ]);

  useEffect(() => {
    if (profileName) {
      setHasHydratedProfile(false);
    }
  }, [profileName]);

  useEffect(() => {
    if (!profileName) return;

    void resetProcessingQueueItems().then(() => flushSyncQueueSafely());

    const handleOnline = () => {
      void flushSyncQueueSafely();
    };
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [flushSyncQueueSafely, profileName]);

  useEffect(() => {
    if (lessons.length > 0 && profileName) {
      const state: ProgressState = {
        currentIndex,
        completedCount: currentIndex,
      };
      localStorage.setItem(progressStorageKey, JSON.stringify(state));
    }
  }, [currentIndex, lessons.length, mode, profileName, progressStorageKey]);

  useEffect(() => {
    if (lessons.length > 0 && profileName) {
      localStorage.setItem(unlockedStorageKey, String(unlockedLevel));
    }
  }, [lessons.length, profileName, unlockedLevel, unlockedStorageKey]);

  useEffect(() => {
    if (lessons.length > 0 && profileName) {
      localStorage.setItem(streakStorageKey, String(streak));
    }
  }, [lessons.length, profileName, streak, streakStorageKey]);

  useEffect(() => {
    if (!profileName || lessons.length === 0 || !hasHydratedProfile) return;
    const authHeaders = buildProfileAuthHeaders(profileStorageId);
    const profileSecret = authHeaders['X-Profile-Secret'];
    const bearerToken = typeof authHeaders.Authorization === 'string'
      ? authHeaders.Authorization.replace(/^Bearer\s+/i, '').trim()
      : '';

    const payload = {
      profileName,
      currentIndex,
      unlockedLevel,
      streak,
      ...buildSyncedSettingsPayload({
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
      }),
    };

    const timeoutId = window.setTimeout(() => {
      const clientUpdatedAt = new Date().toISOString();
      void enqueueProgressUpdate(profileName, payload, clientUpdatedAt, profileSecret, bearerToken)
        .then(() => flushSyncQueueSafely())
        .catch(() => {
          // Fallback to direct sync when queue storage is unavailable (e.g. blocked IndexedDB).
          void fetch(`${apiBaseUrl}/api/progress`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              ...authHeaders,
            },
            body: JSON.stringify({
              ...payload,
              clientUpdatedAt,
            }),
          }).catch(() => {
            // DB sync is optional; localStorage remains the fallback.
          });
        });
    }, PROGRESS_SYNC_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    apiBaseUrl,
    currentIndex,
    defaultLanguage,
    uiLockLanguage,
    courseFramework,
    hasHydratedProfile,
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
    learnLanguage,
    lessons.length,
    profileName,
    profileStorageId,
    streak,
    unlockedLevel,
    flushSyncQueueSafely,
  ]);

  return { markHydrationStale };
}

