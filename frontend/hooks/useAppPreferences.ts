import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import {
  CourseFramework,
  AppTheme,
  DefaultLanguage,
  LearnLanguage,
  UiLockLanguage,
  VoiceProvider,
} from '../config/appConfig';
import { readSyncedSettingsFromStorage } from '../config/settingsSync';

type UseAppPreferencesResult = {
  isPronunciationEnabled: boolean;
  setIsPronunciationEnabled: Dispatch<SetStateAction<boolean>>;
  isLearningLanguageVisible: boolean;
  setIsLearningLanguageVisible: Dispatch<SetStateAction<boolean>>;
  isTranslationVisible: boolean;
  setIsTranslationVisible: Dispatch<SetStateAction<boolean>>;
  learnLanguage: LearnLanguage;
  setLearnLanguage: Dispatch<SetStateAction<LearnLanguage>>;
  defaultLanguage: DefaultLanguage;
  setDefaultLanguage: Dispatch<SetStateAction<DefaultLanguage>>;
  uiLockLanguage: UiLockLanguage;
  setUiLockLanguage: Dispatch<SetStateAction<UiLockLanguage>>;
  courseFramework: CourseFramework;
  setCourseFramework: Dispatch<SetStateAction<CourseFramework>>;
  textScalePercent: number;
  setTextScalePercent: Dispatch<SetStateAction<number>>;
  isBoldTextEnabled: boolean;
  setIsBoldTextEnabled: Dispatch<SetStateAction<boolean>>;
  isAutoScrollEnabled: boolean;
  setIsAutoScrollEnabled: Dispatch<SetStateAction<boolean>>;
  isRandomLessonOrderEnabled: boolean;
  setIsRandomLessonOrderEnabled: Dispatch<SetStateAction<boolean>>;
  isReviewQuestionsRemoved: boolean;
  setIsReviewQuestionsRemoved: Dispatch<SetStateAction<boolean>>;
  appTheme: AppTheme;
  setAppTheme: Dispatch<SetStateAction<AppTheme>>;
  voiceProvider: VoiceProvider;
  setVoiceProvider: Dispatch<SetStateAction<VoiceProvider>>;
  hasHydratedSettings: boolean;
};

export function useAppPreferences(profileStorageId: string): UseAppPreferencesResult {
  const initialSettingsRef = useRef(readSyncedSettingsFromStorage(profileStorageId));
  const initialSettings = initialSettingsRef.current;
  const [hasHydratedSettings, setHasHydratedSettings] = useState(false);
  const [isPronunciationEnabled, setIsPronunciationEnabled] = useState<boolean>(initialSettings.isPronunciationEnabled);
  const [isLearningLanguageVisible, setIsLearningLanguageVisible] = useState<boolean>(initialSettings.isLearningLanguageVisible);
  const [isTranslationVisible, setIsTranslationVisible] = useState<boolean>(initialSettings.isTranslationVisible);
  const [learnLanguage, setLearnLanguage] = useState<LearnLanguage>(initialSettings.learnLanguage);
  const [defaultLanguage, setDefaultLanguage] = useState<DefaultLanguage>(initialSettings.defaultLanguage);
  const [uiLockLanguage, setUiLockLanguage] = useState<UiLockLanguage>(initialSettings.uiLockLanguage);
  const [courseFramework, setCourseFramework] = useState<CourseFramework>(initialSettings.courseFramework);
  const [textScalePercent, setTextScalePercent] = useState<number>(initialSettings.textScalePercent);
  const [isBoldTextEnabled, setIsBoldTextEnabled] = useState<boolean>(initialSettings.isBoldTextEnabled);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState<boolean>(initialSettings.isAutoScrollEnabled);
  const [isRandomLessonOrderEnabled, setIsRandomLessonOrderEnabled] = useState<boolean>(initialSettings.isRandomLessonOrderEnabled);
  const [isReviewQuestionsRemoved, setIsReviewQuestionsRemoved] = useState<boolean>(initialSettings.isReviewQuestionsRemoved);
  const [appTheme, setAppTheme] = useState<AppTheme>(initialSettings.appTheme);
  const [voiceProvider, setVoiceProvider] = useState<VoiceProvider>(initialSettings.voiceProvider);

  useEffect(() => {
    if (!profileStorageId) {
      setHasHydratedSettings(false);
      return;
    }
    const next = readSyncedSettingsFromStorage(profileStorageId);
    setLearnLanguage(next.learnLanguage);
    setDefaultLanguage(next.defaultLanguage);
    setUiLockLanguage(next.uiLockLanguage);
    setCourseFramework(next.courseFramework);
    setIsPronunciationEnabled(next.isPronunciationEnabled);
    setIsLearningLanguageVisible(next.isLearningLanguageVisible);
    setIsTranslationVisible(next.isTranslationVisible);
    setTextScalePercent(next.textScalePercent);
    setIsBoldTextEnabled(next.isBoldTextEnabled);
    setIsAutoScrollEnabled(next.isAutoScrollEnabled);
    setIsRandomLessonOrderEnabled(next.isRandomLessonOrderEnabled);
    setIsReviewQuestionsRemoved(next.isReviewQuestionsRemoved);
    setAppTheme(next.appTheme);
    setVoiceProvider(next.voiceProvider);
    setHasHydratedSettings(true);
  }, [profileStorageId]);

  return {
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
  };
}

