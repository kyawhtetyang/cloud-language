import { Dispatch, SetStateAction } from 'react';
import {
  AppMode,
  AppTheme,
  CourseFramework,
  DefaultLanguage,
  LearnLanguage,
  UiLockLanguage,
  PROGRESS_KEY,
  STREAK_KEY,
  VoiceProvider,
  UNLOCKED_LEVEL_KEY,
} from '../config/appConfig';
import { LessonData } from '../types';
import { useProfileProgressSync } from './useProfileProgressSync';
import { useSettingsPersistence } from './useSettingsPersistence';

type UseAppProfileSettingsSyncParams = {
  apiBaseUrl: string;
  lessons: LessonData[];
  profileName: string;
  profileStorageId: string;
  mode: AppMode;
  currentIndex: number;
  unlockedLevel: number;
  streak: number;
  totalLevels: number;
  hasHydratedSettings: boolean;
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

type UseAppProfileSettingsSyncResult = {
  markHydrationStale: () => void;
};

export function useAppProfileSettingsSync({
  apiBaseUrl,
  lessons,
  profileName,
  profileStorageId,
  mode,
  currentIndex,
  unlockedLevel,
  streak,
  totalLevels,
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
}: UseAppProfileSettingsSyncParams): UseAppProfileSettingsSyncResult {
  const progressStorageKey = profileStorageId ? `${PROGRESS_KEY}:${profileStorageId}` : PROGRESS_KEY;
  const unlockedStorageKey = profileStorageId ? `${UNLOCKED_LEVEL_KEY}:${profileStorageId}` : UNLOCKED_LEVEL_KEY;
  const streakStorageKey = profileStorageId ? `${STREAK_KEY}:${profileStorageId}` : STREAK_KEY;

  const { markHydrationStale } = useProfileProgressSync({
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
  });

  useSettingsPersistence({
    profileStorageId,
    enabled: Boolean(profileName) && hasHydratedSettings,
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
  });

  return { markHydrationStale };
}

