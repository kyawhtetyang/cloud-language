import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LessonData } from '../types';
import { buildLessonReferenceKey } from '../utils/lessonReference';
import { getAppText } from '../config/appI18n';

const hookMocks = vi.hoisted(() => ({
  useLessonDataMock: vi.fn(),
  useOfflineLessonPacksMock: vi.fn(),
  downloadUnitPackMock: vi.fn(async () => {}),
  removeUnitPackMock: vi.fn(async () => {}),
  isUnitDownloadingMock: vi.fn(() => false),
}));

vi.mock('./useLessonData', () => ({
  useLessonData: hookMocks.useLessonDataMock,
}));

vi.mock('./useOfflineLessonPacks', () => ({
  useOfflineLessonPacks: hookMocks.useOfflineLessonPacksMock,
}));

import { useAppContentState } from './useAppContentState';

function buildLesson(overrides: Partial<LessonData>): LessonData {
  return {
    level: 1,
    unit: 1,
    topic: 'Topic',
    english: 'Hello',
    burmese: 'မင်္ဂလာပါ',
    pronunciation: 'mingalaba',
    ...overrides,
  };
}

describe('useAppContentState', () => {
  beforeEach(() => {
    hookMocks.useLessonDataMock.mockReset();
    hookMocks.useOfflineLessonPacksMock.mockReset();
    hookMocks.downloadUnitPackMock.mockClear();
    hookMocks.removeUnitPackMock.mockClear();
    hookMocks.isUnitDownloadingMock.mockClear();
  });

  it('normalizes api url and composes derived content data', () => {
    const lessons = [
      buildLesson({ level: 1, unit: 1 }),
      buildLesson({ level: 2, unit: 1, orderIndex: 5 }),
    ];
    const englishReferenceLessons = [
      buildLesson({ level: 1, unit: 1, topic: 'Greeting', burmese: 'မင်္ဂလာပါ', english: 'Hello' }),
      buildLesson({ level: 2, unit: 1, topic: 'Thanks', burmese: 'ကျေးဇူးတင်ပါတယ်', english: 'Thanks' }),
    ];
    const downloadedUnitKeys = new Set<string>(['1:1']);

    hookMocks.useLessonDataMock.mockReturnValue({
      lessons,
      englishReferenceLessons,
      loading: false,
      errorMessage: null,
    });
    hookMocks.useOfflineLessonPacksMock.mockReturnValue({
      downloadedUnitKeys,
      downloadUnitPack: hookMocks.downloadUnitPackMock,
      removeUnitPack: hookMocks.removeUnitPackMock,
      isUnitDownloading: hookMocks.isUnitDownloadingMock,
    });

    const { result } = renderHook(() =>
      useAppContentState({
        learnLanguage: 'english',
        courseFramework: 'cefr',
        defaultLanguage: 'vietnamese',
      }),
    );

    const [apiBaseUrlArg, languageArg] = hookMocks.useLessonDataMock.mock.calls[0];
    expect(typeof apiBaseUrlArg).toBe('string');
    expect(languageArg).toBe('english');
    expect(result.current.apiBaseUrl).toBe(apiBaseUrlArg);
    expect(hookMocks.useOfflineLessonPacksMock).toHaveBeenCalledWith('english', lessons);
    expect(result.current.totalLevels).toBe(5);
    expect(result.current.downloadedUnitKeys).toBe(downloadedUnitKeys);
    expect(result.current.downloadUnitPack).toBe(hookMocks.downloadUnitPackMock);
    expect(result.current.removeUnitPack).toBe(hookMocks.removeUnitPackMock);
    expect(result.current.isUnitDownloading).toBe(hookMocks.isUnitDownloadingMock);
    expect(
      result.current.englishReferenceByKey.get(buildLessonReferenceKey(englishReferenceLessons[0])),
    ).toBe('Hello');
    expect(
      result.current.englishReferenceByKey.get(buildLessonReferenceKey(englishReferenceLessons[1])),
    ).toBe('Thanks');
    expect(result.current.leaveCompletedUnitModalTitle).toBe('Hoàn thành bài học này trước?');
  });

  it('falls back to empty base url when env is /api', () => {
    (import.meta as ImportMeta & { env: Record<string, string | undefined> }).env.VITE_API_BASE_URL = '/api';

    hookMocks.useLessonDataMock.mockReturnValue({
      lessons: [],
      englishReferenceLessons: [],
      loading: false,
      errorMessage: null,
    });
    hookMocks.useOfflineLessonPacksMock.mockReturnValue({
      downloadedUnitKeys: new Set<string>(),
      downloadUnitPack: hookMocks.downloadUnitPackMock,
      removeUnitPack: hookMocks.removeUnitPackMock,
      isUnitDownloading: hookMocks.isUnitDownloadingMock,
    });

    renderHook(() =>
      useAppContentState({
        learnLanguage: 'english',
        courseFramework: 'cefr',
        defaultLanguage: 'english',
      }),
    );

    expect(hookMocks.useLessonDataMock).toHaveBeenCalledWith(
      '',
      'english',
      getAppText('english').appState.lessonsLoadFailedMessage,
    );
  });

  it('maps chinese+hsk framework to hsk_chinese backend lesson language', () => {
    hookMocks.useLessonDataMock.mockReturnValue({
      lessons: [],
      englishReferenceLessons: [],
      loading: false,
      errorMessage: null,
    });
    hookMocks.useOfflineLessonPacksMock.mockReturnValue({
      downloadedUnitKeys: new Set<string>(),
      downloadUnitPack: hookMocks.downloadUnitPackMock,
      removeUnitPack: hookMocks.removeUnitPackMock,
      isUnitDownloading: hookMocks.isUnitDownloadingMock,
    });

    renderHook(() =>
      useAppContentState({
        learnLanguage: 'chinese',
        courseFramework: 'hsk',
        defaultLanguage: 'english',
      }),
    );

    expect(hookMocks.useLessonDataMock).toHaveBeenCalledWith(
      '',
      'hsk_chinese',
      getAppText('english').appState.lessonsLoadFailedMessage,
    );
  });

  it('maps thai+hsk framework to hsk_chinese backend lesson language', () => {
    hookMocks.useLessonDataMock.mockReturnValue({
      lessons: [],
      englishReferenceLessons: [],
      loading: false,
      errorMessage: null,
    });
    hookMocks.useOfflineLessonPacksMock.mockReturnValue({
      downloadedUnitKeys: new Set<string>(),
      downloadUnitPack: hookMocks.downloadUnitPackMock,
      removeUnitPack: hookMocks.removeUnitPackMock,
      isUnitDownloading: hookMocks.isUnitDownloadingMock,
    });

    renderHook(() =>
      useAppContentState({
        learnLanguage: 'thai',
        courseFramework: 'hsk',
        defaultLanguage: 'english',
      }),
    );

    expect(hookMocks.useLessonDataMock).toHaveBeenCalledWith(
      '',
      'hsk_chinese',
      getAppText('english').appState.lessonsLoadFailedMessage,
    );
  });
});

