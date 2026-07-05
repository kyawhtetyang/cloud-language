import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useLessonData } from './useLessonData';
import { LessonData } from '../types';

const offlineMocks = vi.hoisted(() => ({
  readDownloadedLessonsByLanguage: vi.fn(async () => [] as LessonData[]),
}));

vi.mock('../offline/offlineStore', () => ({
  readDownloadedLessonsByLanguage: offlineMocks.readDownloadedLessonsByLanguage,
}));

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (error: unknown) => void;
};

function createDeferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function createResponse(data: LessonData[]): Response {
  return {
    ok: true,
    json: async () => data,
  } as Response;
}

function createLesson(overrides: Partial<LessonData>): LessonData {
  return {
    level: 1,
    unit: 1,
    topic: 'Topic',
    english: 'Default sentence',
    burmese: 'ဘာသာပြန်',
    pronunciation: 'default',
    ...overrides,
  };
}

describe('useLessonData', () => {
  beforeEach(() => {
    offlineMocks.readDownloadedLessonsByLanguage.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('ignores stale request completion after language changes', async () => {
    const oldEnglishRequest = createDeferred<Response>();
    const chineseRequest = createDeferred<Response>();
    const chineseReferenceRequest = createDeferred<Response>();

    const fetchMock = vi.fn<
      (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
    >();
    fetchMock
      .mockImplementationOnce(() => oldEnglishRequest.promise)
      .mockImplementationOnce(() => chineseRequest.promise)
      .mockImplementationOnce(() => chineseReferenceRequest.promise);
    vi.stubGlobal('fetch', fetchMock);

    const { result, rerender } = renderHook(
      ({ language }: { language: string }) => useLessonData('/api', language, 'Failed to load'),
      { initialProps: { language: 'english' } },
    );

    rerender({ language: 'chinese' });

    const chineseLearnLessons = [
      createLesson({
        english: '请问。',
        burmese: 'ခဏလောက်မေးပါရစေ။',
        pronunciation: 'qing wen',
      }),
    ];
    const chineseEnglishReference = [
      createLesson({
        english: 'Excuse me.',
        burmese: 'ခဏလောက်ပါ။',
        pronunciation: 'ik-skyooz mee',
      }),
    ];
    const staleEnglishLessons = [
      createLesson({
        english: 'Excuse me.',
        burmese: 'ခဏလောက်ပါ။',
        pronunciation: 'ik-skyooz mee',
      }),
    ];

    chineseRequest.resolve(createResponse(chineseLearnLessons));
    chineseReferenceRequest.resolve(createResponse(chineseEnglishReference));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.lessons[0]?.english).toBe('请问。');
      expect(result.current.englishReferenceLessons[0]?.english).toBe('Excuse me.');
    });

    oldEnglishRequest.resolve(createResponse(staleEnglishLessons));

    await waitFor(() => {
      expect(result.current.lessons[0]?.english).toBe('请问。');
      expect(result.current.englishReferenceLessons[0]?.english).toBe('Excuse me.');
    });
  });
});

