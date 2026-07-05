import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  applyRemoteSyncedSettings,
  buildSyncedSettingsPayload,
  persistSyncedSettingsToStorage,
  readSyncedSettingsFromStorage,
} from './settingsSync';

describe('settingsSync', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('reads defaults when nothing is stored', () => {
    expect(readSyncedSettingsFromStorage()).toEqual({
      learnLanguage: 'english',
      defaultLanguage: 'burmese',
      uiLockLanguage: 'english',
      courseFramework: 'cefr',
      isPronunciationEnabled: false,
      isLearningLanguageVisible: true,
      isTranslationVisible: true,
      textScalePercent: 100,
      isBoldTextEnabled: false,
      isAutoScrollEnabled: true,
      isRandomLessonOrderEnabled: false,
      isReviewQuestionsRemoved: false,
      appTheme: 'light',
      voiceProvider: 'default',
    });
  });

  it('persists and reads all synced settings consistently', () => {
    const settings = {
      learnLanguage: 'chinese' as const,
      defaultLanguage: 'english' as const,
      uiLockLanguage: 'english' as const,
      courseFramework: 'hsk' as const,
      isPronunciationEnabled: true,
      isLearningLanguageVisible: true,
      isTranslationVisible: true,
      textScalePercent: 115,
      isBoldTextEnabled: true,
      isAutoScrollEnabled: false,
      isRandomLessonOrderEnabled: true,
      isReviewQuestionsRemoved: true,
      appTheme: 'dark' as const,
      voiceProvider: 'apple_siri' as const,
    };

    persistSyncedSettingsToStorage(settings);
    expect(readSyncedSettingsFromStorage()).toEqual(settings);
    expect(buildSyncedSettingsPayload(settings)).toEqual(settings);
  });

  it('uses profile-scoped settings with fallback to legacy global keys', () => {
    const legacyGlobal = {
      learnLanguage: 'english' as const,
      defaultLanguage: 'burmese' as const,
      uiLockLanguage: 'off' as const,
      courseFramework: 'cefr' as const,
      isPronunciationEnabled: false,
      isLearningLanguageVisible: true,
      isTranslationVisible: true,
      textScalePercent: 100,
      isBoldTextEnabled: false,
      isAutoScrollEnabled: true,
      isRandomLessonOrderEnabled: false,
      isReviewQuestionsRemoved: false,
      appTheme: 'light' as const,
      voiceProvider: 'default' as const,
    };
    const profileSettings = {
      learnLanguage: 'chinese' as const,
      defaultLanguage: 'english' as const,
      uiLockLanguage: 'english' as const,
      courseFramework: 'hsk' as const,
      isPronunciationEnabled: true,
      isLearningLanguageVisible: true,
      isTranslationVisible: true,
      textScalePercent: 115,
      isBoldTextEnabled: true,
      isAutoScrollEnabled: false,
      isRandomLessonOrderEnabled: true,
      isReviewQuestionsRemoved: true,
      appTheme: 'dark' as const,
      voiceProvider: 'apple_siri' as const,
    };

    persistSyncedSettingsToStorage(legacyGlobal);
    expect(readSyncedSettingsFromStorage('tester')).toEqual(legacyGlobal);

    persistSyncedSettingsToStorage(profileSettings, 'tester');
    expect(readSyncedSettingsFromStorage('tester')).toEqual(profileSettings);
    expect(readSyncedSettingsFromStorage()).toEqual(legacyGlobal);
  });

  it('applies only valid remote values to setters', () => {
    const setters = {
      setLearnLanguage: vi.fn(),
      setDefaultLanguage: vi.fn(),
      setUiLockLanguage: vi.fn(),
      setCourseFramework: vi.fn(),
      setIsPronunciationEnabled: vi.fn(),
      setIsLearningLanguageVisible: vi.fn(),
      setIsTranslationVisible: vi.fn(),
      setTextScalePercent: vi.fn(),
      setIsBoldTextEnabled: vi.fn(),
      setIsAutoScrollEnabled: vi.fn(),
      setIsRandomLessonOrderEnabled: vi.fn(),
      setIsReviewQuestionsRemoved: vi.fn(),
      setAppTheme: vi.fn(),
      setVoiceProvider: vi.fn(),
    };

    applyRemoteSyncedSettings(
      {
        learnLanguage: 'chinese',
        defaultLanguage: 'vietnamese',
        uiLockLanguage: 'thai',
        courseFramework: 'hsk',
        isPronunciationEnabled: true,
        isLearningLanguageVisible: true,
        isTranslationVisible: false,
        textScalePercent: 999,
        isBoldTextEnabled: true,
        isAutoScrollEnabled: false,
        isRandomLessonOrderEnabled: true,
        isReviewQuestionsRemoved: true,
        appTheme: 'legacy_theme',
        voiceProvider: 'google',
      },
      setters,
    );

    expect(setters.setLearnLanguage).toHaveBeenCalledWith('chinese');
    expect(setters.setDefaultLanguage).toHaveBeenCalledWith('vietnamese');
    expect(setters.setUiLockLanguage).toHaveBeenCalledWith('thai');
    expect(setters.setCourseFramework).toHaveBeenCalledWith('hsk');
    expect(setters.setIsPronunciationEnabled).toHaveBeenCalledWith(true);
    expect(setters.setIsLearningLanguageVisible).toHaveBeenCalledWith(true);
    expect(setters.setIsTranslationVisible).toHaveBeenCalledWith(false);
    expect(setters.setTextScalePercent).toHaveBeenCalledWith(120);
    expect(setters.setIsBoldTextEnabled).toHaveBeenCalledWith(true);
    expect(setters.setIsAutoScrollEnabled).toHaveBeenCalledWith(false);
    expect(setters.setIsRandomLessonOrderEnabled).toHaveBeenCalledWith(true);
    expect(setters.setIsReviewQuestionsRemoved).toHaveBeenCalledWith(true);
    expect(setters.setAppTheme).not.toHaveBeenCalled();
    expect(setters.setVoiceProvider).toHaveBeenCalledWith('apple_siri');
  });

  it('coerces storage settings so learning language stays visible if pronunciation is off', () => {
    localStorage.setItem('lingo_burmese_pronunciation_enabled', 'false');
    localStorage.setItem('lingo_burmese_learning_language_visible', 'false');

    const settings = readSyncedSettingsFromStorage();
    expect(settings.isPronunciationEnabled).toBe(false);
    expect(settings.isLearningLanguageVisible).toBe(true);
  });

  it('coerces storage settings when default and learning languages conflict', () => {
    localStorage.setItem('lingo_burmese_default_language', 'english');
    localStorage.setItem('lingo_burmese_learn_language', 'english');
    localStorage.setItem('lingo_burmese_course_framework', 'hsk');

    const settings = readSyncedSettingsFromStorage();
    expect(settings.defaultLanguage).toBe('english');
    expect(settings.learnLanguage).toBe('burmese');
    expect(settings.courseFramework).toBe('hsk');
  });

  it('coerces remote sync when default language update conflicts with current learning language', () => {
    const setters = {
      setLearnLanguage: vi.fn(),
      setDefaultLanguage: vi.fn(),
      setUiLockLanguage: vi.fn(),
      setCourseFramework: vi.fn(),
      setIsPronunciationEnabled: vi.fn(),
      setIsLearningLanguageVisible: vi.fn(),
      setIsTranslationVisible: vi.fn(),
      setTextScalePercent: vi.fn(),
      setIsBoldTextEnabled: vi.fn(),
      setIsAutoScrollEnabled: vi.fn(),
      setIsRandomLessonOrderEnabled: vi.fn(),
      setIsReviewQuestionsRemoved: vi.fn(),
      setAppTheme: vi.fn(),
      setVoiceProvider: vi.fn(),
    };

    applyRemoteSyncedSettings(
      { defaultLanguage: 'english' },
      setters,
      {
        defaultLanguage: 'burmese',
        learnLanguage: 'english',
        courseFramework: 'hsk',
      },
    );

    expect(setters.setDefaultLanguage).toHaveBeenCalledWith('english');
    expect(setters.setLearnLanguage).toHaveBeenCalledWith('burmese');
  });
});

