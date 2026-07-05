import { Dispatch, SetStateAction } from 'react';
import {
  APP_DEFAULTS,
  AUTO_SCROLL_ENABLED_KEY,
  APP_THEME_KEY,
  AppTheme,
  BOLD_TEXT_ENABLED_KEY,
  clampTextScale,
  coerceFrameworkForLearnLanguage,
  coerceLessonLineVisibility,
  COURSE_FRAMEWORK_KEY,
  CourseFramework,
  DEFAULT_LANGUAGE_KEY,
  DefaultLanguage,
  isUiLockLanguage,
  isCourseFramework,
  isDefaultLanguage,
  isLearnLanguage,
  LEARN_LANGUAGE_KEY,
  LearnLanguage,
  LEARNING_LANGUAGE_VISIBLE_KEY,
  PRONUNCIATION_ENABLED_KEY,
  RANDOM_LESSON_ORDER_ENABLED_KEY,
  REMOVE_REVIEW_QUESTIONS_ENABLED_KEY,
  TEXT_SCALE_PERCENT_KEY,
  TRANSLATION_VISIBLE_KEY,
  VOICE_PROVIDER_KEY,
  VoiceProvider,
  UI_LOCK_LANGUAGE_KEY,
  UiLockLanguage,
  isVoiceProvider,
  resolveNonConflictingLearnLanguage,
} from './appConfig';

export type SyncedAppSettings = {
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

export type SyncedAppSettingsSetters = {
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

const DEFAULT_SYNCED_SETTINGS: SyncedAppSettings = {
  ...APP_DEFAULTS,
};

type SyncedLanguageSettings = Pick<SyncedAppSettings, 'learnLanguage' | 'defaultLanguage' | 'courseFramework'>;

function toScopedKey(baseKey: string, profileStorageId: string): string {
  return `${baseKey}:${profileStorageId}`;
}

function safeRead(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeWrite(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // localStorage can fail in private mode or restricted environments.
  }
}

function parseLearnLanguage(value: string | null): LearnLanguage {
  return isLearnLanguage(value) ? value : APP_DEFAULTS.learnLanguage;
}

function parseDefaultLanguage(value: string | null): DefaultLanguage {
  return isDefaultLanguage(value) ? value : APP_DEFAULTS.defaultLanguage;
}

function parseCourseFramework(value: string | null): CourseFramework {
  return isCourseFramework(value) ? value : APP_DEFAULTS.courseFramework;
}

function parseUiLockLanguage(value: string | null): UiLockLanguage {
  return isUiLockLanguage(value) ? value : APP_DEFAULTS.uiLockLanguage;
}

function parseBoolean(value: string | null): boolean {
  return value === 'true';
}

function parseBooleanWithFallback(value: string | null, fallback: boolean): boolean {
  if (value === null) return fallback;
  return parseBoolean(value);
}

function parseTextScale(value: string | null): number {
  return clampTextScale(Number(value || DEFAULT_SYNCED_SETTINGS.textScalePercent));
}

function coerceAppTheme(value: unknown): AppTheme | null {
  if (value === 'light') return 'light';
  if (value === 'dark') return 'dark';
  return null;
}

function parseAppTheme(value: string | null): AppTheme {
  return coerceAppTheme(value) ?? APP_DEFAULTS.appTheme;
}


function parseVoiceProvider(value: string | null): VoiceProvider {
  if (value === 'google') return 'apple_siri';
  return isVoiceProvider(value) ? value : APP_DEFAULTS.voiceProvider;
}

function readWithFallback(baseKey: string, profileStorageId?: string): string | null {
  if (!profileStorageId) {
    return safeRead(baseKey);
  }
  const scoped = safeRead(toScopedKey(baseKey, profileStorageId));
  if (scoped !== null) return scoped;
  return safeRead(baseKey);
}

function normalizeLanguageSettings(settings: SyncedLanguageSettings): SyncedLanguageSettings {
  const normalizedLearnLanguage = resolveNonConflictingLearnLanguage(
    settings.defaultLanguage,
    settings.learnLanguage,
  );
  const normalizedCourseFramework = coerceFrameworkForLearnLanguage(
    settings.courseFramework,
    normalizedLearnLanguage,
  );
  return {
    defaultLanguage: settings.defaultLanguage,
    learnLanguage: normalizedLearnLanguage,
    courseFramework: normalizedCourseFramework,
  };
}

function normalizeSyncedSettings(settings: SyncedAppSettings): SyncedAppSettings {
  const languageSettings = normalizeLanguageSettings(settings);
  const visibility = coerceLessonLineVisibility(
    settings.isPronunciationEnabled,
    settings.isLearningLanguageVisible,
  );
  return {
    ...settings,
    ...languageSettings,
    isPronunciationEnabled: visibility.isPronunciationEnabled,
    isLearningLanguageVisible: visibility.isLearningLanguageVisible,
  };
}

export function readSyncedSettingsFromStorage(profileStorageId?: string): SyncedAppSettings {
  const isPronunciationEnabled = parseBooleanWithFallback(
    readWithFallback(PRONUNCIATION_ENABLED_KEY, profileStorageId),
    APP_DEFAULTS.isPronunciationEnabled,
  );
  const isLearningLanguageVisible = parseBooleanWithFallback(
    readWithFallback(LEARNING_LANGUAGE_VISIBLE_KEY, profileStorageId),
    APP_DEFAULTS.isLearningLanguageVisible,
  );
  const { isPronunciationEnabled: normalizedPronunciation, isLearningLanguageVisible: normalizedLearningLanguage } =
    coerceLessonLineVisibility(isPronunciationEnabled, isLearningLanguageVisible);
  const parsed: SyncedAppSettings = {
    learnLanguage: parseLearnLanguage(readWithFallback(LEARN_LANGUAGE_KEY, profileStorageId)),
    defaultLanguage: parseDefaultLanguage(readWithFallback(DEFAULT_LANGUAGE_KEY, profileStorageId)),
    uiLockLanguage: parseUiLockLanguage(readWithFallback(UI_LOCK_LANGUAGE_KEY, profileStorageId)),
    courseFramework: parseCourseFramework(readWithFallback(COURSE_FRAMEWORK_KEY, profileStorageId)),
    isPronunciationEnabled: normalizedPronunciation,
    isLearningLanguageVisible: normalizedLearningLanguage,
    isTranslationVisible: parseBooleanWithFallback(
      readWithFallback(TRANSLATION_VISIBLE_KEY, profileStorageId),
      APP_DEFAULTS.isTranslationVisible,
    ),
    textScalePercent: parseTextScale(readWithFallback(TEXT_SCALE_PERCENT_KEY, profileStorageId)),
    isBoldTextEnabled: parseBoolean(readWithFallback(BOLD_TEXT_ENABLED_KEY, profileStorageId)),
    isAutoScrollEnabled: parseBooleanWithFallback(
      readWithFallback(AUTO_SCROLL_ENABLED_KEY, profileStorageId),
      APP_DEFAULTS.isAutoScrollEnabled,
    ),
    isRandomLessonOrderEnabled: parseBoolean(readWithFallback(RANDOM_LESSON_ORDER_ENABLED_KEY, profileStorageId)),
    isReviewQuestionsRemoved: parseBoolean(readWithFallback(REMOVE_REVIEW_QUESTIONS_ENABLED_KEY, profileStorageId)),
    appTheme: parseAppTheme(readWithFallback(APP_THEME_KEY, profileStorageId)),
    voiceProvider: parseVoiceProvider(readWithFallback(VOICE_PROVIDER_KEY, profileStorageId)),
  };
  return normalizeSyncedSettings(parsed);
}

export function persistSyncedSettingsToStorage(
  settings: SyncedAppSettings,
  profileStorageId?: string,
): void {
  const normalized = normalizeSyncedSettings(settings);
  const resolveKey = (baseKey: string) =>
    profileStorageId ? toScopedKey(baseKey, profileStorageId) : baseKey;
  safeWrite(resolveKey(LEARN_LANGUAGE_KEY), normalized.learnLanguage);
  safeWrite(resolveKey(DEFAULT_LANGUAGE_KEY), normalized.defaultLanguage);
  safeWrite(resolveKey(UI_LOCK_LANGUAGE_KEY), normalized.uiLockLanguage);
  safeWrite(resolveKey(COURSE_FRAMEWORK_KEY), normalized.courseFramework);
  safeWrite(resolveKey(PRONUNCIATION_ENABLED_KEY), String(normalized.isPronunciationEnabled));
  safeWrite(resolveKey(LEARNING_LANGUAGE_VISIBLE_KEY), String(normalized.isLearningLanguageVisible));
  safeWrite(resolveKey(TRANSLATION_VISIBLE_KEY), String(normalized.isTranslationVisible));
  safeWrite(resolveKey(TEXT_SCALE_PERCENT_KEY), String(normalized.textScalePercent));
  safeWrite(resolveKey(BOLD_TEXT_ENABLED_KEY), String(normalized.isBoldTextEnabled));
  safeWrite(resolveKey(AUTO_SCROLL_ENABLED_KEY), String(normalized.isAutoScrollEnabled));
  safeWrite(resolveKey(RANDOM_LESSON_ORDER_ENABLED_KEY), String(normalized.isRandomLessonOrderEnabled));
  safeWrite(resolveKey(REMOVE_REVIEW_QUESTIONS_ENABLED_KEY), String(normalized.isReviewQuestionsRemoved));
  safeWrite(resolveKey(APP_THEME_KEY), normalized.appTheme);
  safeWrite(resolveKey(VOICE_PROVIDER_KEY), normalized.voiceProvider);
}

export function buildSyncedSettingsPayload(settings: SyncedAppSettings): SyncedAppSettings {
  return normalizeSyncedSettings(settings);
}

export function applyRemoteSyncedSettings(
  remote: Record<string, unknown>,
  setters: SyncedAppSettingsSetters,
  currentSettings?: Partial<SyncedLanguageSettings>,
): void {
  const currentDefaultLanguage = isDefaultLanguage(currentSettings?.defaultLanguage)
    ? currentSettings.defaultLanguage
    : APP_DEFAULTS.defaultLanguage;
  const currentLearnLanguage = isLearnLanguage(currentSettings?.learnLanguage)
    ? currentSettings.learnLanguage
    : APP_DEFAULTS.learnLanguage;
  const currentCourseFramework = isCourseFramework(currentSettings?.courseFramework)
    ? currentSettings.courseFramework
    : APP_DEFAULTS.courseFramework;

  const nextDefaultLanguage = isDefaultLanguage(remote.defaultLanguage)
    ? remote.defaultLanguage
    : currentDefaultLanguage;
  const nextLearnLanguageRaw = isLearnLanguage(remote.learnLanguage)
    ? remote.learnLanguage
    : currentLearnLanguage;
  const nextCourseFrameworkRaw = isCourseFramework(remote.courseFramework)
    ? remote.courseFramework
    : currentCourseFramework;
  const normalizedLanguageSettings = normalizeLanguageSettings({
    defaultLanguage: nextDefaultLanguage,
    learnLanguage: nextLearnLanguageRaw,
    courseFramework: nextCourseFrameworkRaw,
  });

  if (normalizedLanguageSettings.defaultLanguage !== currentDefaultLanguage) {
    setters.setDefaultLanguage(normalizedLanguageSettings.defaultLanguage);
  }
  if (normalizedLanguageSettings.learnLanguage !== currentLearnLanguage) {
    setters.setLearnLanguage(normalizedLanguageSettings.learnLanguage);
  }
  if (normalizedLanguageSettings.courseFramework !== currentCourseFramework) {
    setters.setCourseFramework(normalizedLanguageSettings.courseFramework);
  }
  if (isUiLockLanguage(remote.uiLockLanguage)) {
    setters.setUiLockLanguage(remote.uiLockLanguage);
  }
  if (typeof remote.isPronunciationEnabled === 'boolean') {
    setters.setIsPronunciationEnabled(remote.isPronunciationEnabled);
  }
  if (typeof remote.isLearningLanguageVisible === 'boolean') {
    setters.setIsLearningLanguageVisible(remote.isLearningLanguageVisible);
  }
  if (typeof remote.isTranslationVisible === 'boolean') {
    setters.setIsTranslationVisible(remote.isTranslationVisible);
  }
  if (typeof remote.textScalePercent === 'number') {
    setters.setTextScalePercent(clampTextScale(remote.textScalePercent));
  }
  if (typeof remote.isBoldTextEnabled === 'boolean') {
    setters.setIsBoldTextEnabled(remote.isBoldTextEnabled);
  }
  if (typeof remote.isAutoScrollEnabled === 'boolean') {
    setters.setIsAutoScrollEnabled(remote.isAutoScrollEnabled);
  }
  if (typeof remote.isRandomLessonOrderEnabled === 'boolean') {
    setters.setIsRandomLessonOrderEnabled(remote.isRandomLessonOrderEnabled);
  }
  if (typeof remote.isReviewQuestionsRemoved === 'boolean') {
    setters.setIsReviewQuestionsRemoved(remote.isReviewQuestionsRemoved);
  }
  const remoteTheme = coerceAppTheme(remote.appTheme);
  if (remoteTheme) {
    setters.setAppTheme(remoteTheme);
  }
  if (remote.voiceProvider === 'google') {
    setters.setVoiceProvider('apple_siri');
  } else if (isVoiceProvider(remote.voiceProvider)) {
    setters.setVoiceProvider(remote.voiceProvider);
  }
}

