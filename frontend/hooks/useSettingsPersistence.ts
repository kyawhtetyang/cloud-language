import { useEffect } from 'react';
import {
  AppTheme,
  CourseFramework,
  DefaultLanguage,
  LearnLanguage,
  UiLockLanguage,
  VoiceProvider,
} from '../config/appConfig';
import { persistSyncedSettingsToStorage } from '../config/settingsSync';

type UseSettingsPersistenceParams = {
  profileStorageId: string;
  enabled?: boolean;
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
};

export function useSettingsPersistence({
  profileStorageId,
  enabled = true,
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
}: UseSettingsPersistenceParams) {
  useEffect(() => {
    if (!enabled || !profileStorageId) return;
    persistSyncedSettingsToStorage({
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
    }, profileStorageId);
  }, [
    profileStorageId,
    enabled,
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
  ]);
}

