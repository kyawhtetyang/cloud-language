import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PROGRESS_KEY, STREAK_KEY, UNLOCKED_LEVEL_KEY } from '../config/appConfig';
import { LessonData } from '../types';

const hookMocks = vi.hoisted(() => ({
  useProfileProgressSyncMock: vi.fn(),
  useSettingsPersistenceMock: vi.fn(),
  markHydrationStaleMock: vi.fn(),
}));

vi.mock('./useProfileProgressSync', () => ({
  useProfileProgressSync: hookMocks.useProfileProgressSyncMock,
}));

vi.mock('./useSettingsPersistence', () => ({
  useSettingsPersistence: hookMocks.useSettingsPersistenceMock,
}));

import { useAppProfileSettingsSync } from './useAppProfileSettingsSync';

const lessons: LessonData[] = [
  {
    level: 1,
    unit: 1,
    topic: 'Topic',
    english: 'Hello',
    burmese: 'မင်္ဂလာပါ',
    pronunciation: 'mingalaba',
  },
];

function buildBaseParams() {
  return {
    apiBaseUrl: 'http://localhost:4000',
    lessons,
    profileName: 'tester',
    profileStorageId: 'tester',
    mode: 'learn' as const,
    currentIndex: 2,
    unlockedLevel: 3,
    streak: 4,
    totalLevels: 12,
    hasHydratedSettings: true,
    learnLanguage: 'english' as const,
    defaultLanguage: 'vietnamese' as const,
    uiLockLanguage: 'off' as const,
    courseFramework: 'cefr' as const,
    isPronunciationEnabled: true,
    isLearningLanguageVisible: true,
    isTranslationVisible: true,
    textScalePercent: 110,
    isBoldTextEnabled: true,
    isAutoScrollEnabled: false,
    isRandomLessonOrderEnabled: true,
    isReviewQuestionsRemoved: false,
    appTheme: 'light' as const,
    voiceProvider: 'default' as const,
    setCurrentIndex: vi.fn(),
    setUnlockedLevel: vi.fn(),
    setStreak: vi.fn(),
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
}

describe('useAppProfileSettingsSync', () => {
  beforeEach(() => {
    hookMocks.useProfileProgressSyncMock.mockReset();
    hookMocks.useSettingsPersistenceMock.mockReset();
    hookMocks.markHydrationStaleMock.mockReset();
    hookMocks.useProfileProgressSyncMock.mockReturnValue({
      markHydrationStale: hookMocks.markHydrationStaleMock,
    });
  });

  it('wires profile sync keys and settings persistence enablement', () => {
    const params = buildBaseParams();
    const { result } = renderHook(() => useAppProfileSettingsSync(params));

    expect(hookMocks.useProfileProgressSyncMock).toHaveBeenCalledTimes(1);
    expect(hookMocks.useProfileProgressSyncMock).toHaveBeenCalledWith(
      expect.objectContaining({
        profileName: 'tester',
        progressStorageKey: `${PROGRESS_KEY}:tester`,
        unlockedStorageKey: `${UNLOCKED_LEVEL_KEY}:tester`,
        streakStorageKey: `${STREAK_KEY}:tester`,
      }),
    );
    expect(hookMocks.useSettingsPersistenceMock).toHaveBeenCalledWith(
      expect.objectContaining({
        profileStorageId: 'tester',
        enabled: true,
      }),
    );

    act(() => {
      result.current.markHydrationStale();
    });
    expect(hookMocks.markHydrationStaleMock).toHaveBeenCalledTimes(1);
  });

  it('uses default keys and disables settings persistence when profile is missing', () => {
    const params = {
      ...buildBaseParams(),
      profileName: '',
      profileStorageId: '',
      hasHydratedSettings: true,
    };

    renderHook(() => useAppProfileSettingsSync(params));

    expect(hookMocks.useProfileProgressSyncMock).toHaveBeenCalledWith(
      expect.objectContaining({
        profileName: '',
        progressStorageKey: PROGRESS_KEY,
        unlockedStorageKey: UNLOCKED_LEVEL_KEY,
        streakStorageKey: STREAK_KEY,
      }),
    );
    expect(hookMocks.useSettingsPersistenceMock).toHaveBeenCalledWith(
      expect.objectContaining({
        profileStorageId: '',
        enabled: false,
      }),
    );
  });
});

