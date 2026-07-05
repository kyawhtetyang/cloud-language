import { useEffect, useState } from 'react';
import { LessonData } from '../types';
import { readDownloadedLessonsByLanguage } from '../offline/offlineStore';

const LESSON_FETCH_TIMEOUT_MS = 25000;

async function fetchWithTimeout(
  url: string,
  timeoutMs: number,
  upstreamSignal?: AbortSignal,
): Promise<Response> {
  const controller = new AbortController();
  const onUpstreamAbort = () => controller.abort();
  if (upstreamSignal?.aborted) {
    controller.abort();
  } else {
    upstreamSignal?.addEventListener('abort', onUpstreamAbort, { once: true });
  }
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    window.clearTimeout(timeoutId);
    upstreamSignal?.removeEventListener('abort', onUpstreamAbort);
  }
}

function isAbortError(error: unknown): boolean {
  return (
    error instanceof DOMException
      ? error.name === 'AbortError'
      : Boolean(error && typeof error === 'object' && 'name' in error && (error as { name?: string }).name === 'AbortError')
  );
}

type UseLessonDataResult = {
  lessons: LessonData[];
  englishReferenceLessons: LessonData[];
  loading: boolean;
  errorMessage: string | null;
};

type LessonQueryFilters = {
  sourceLabel?: string | null;
  collectionLabel?: string | null;
  contentType?: string | null;
};

export function useLessonData(
  apiBaseUrl: string,
  lessonLanguage: string,
  lessonsLoadFailedMessage: string,
  enabled = true,
  filters?: LessonQueryFilters,
): UseLessonDataResult {
  const [lessons, setLessons] = useState<LessonData[]>([]);
  const [englishReferenceLessons, setEnglishReferenceLessons] = useState<LessonData[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setLessons([]);
      setEnglishReferenceLessons([]);
      setLoading(false);
      setErrorMessage(null);
      return;
    }

    let isActive = true;
    const requestController = new AbortController();
    const lessonsUrl = new URL(`${apiBaseUrl}/api/lessons`, window.location.origin);
    lessonsUrl.searchParams.set('language', lessonLanguage);
    if (filters?.sourceLabel) lessonsUrl.searchParams.set('sourceLabel', filters.sourceLabel);
    if (filters?.collectionLabel) lessonsUrl.searchParams.set('collectionLabel', filters.collectionLabel);
    if (filters?.contentType) lessonsUrl.searchParams.set('contentType', filters.contentType);

    const fetchEnglishReferenceLessons = async () => {
      if (lessonLanguage === 'english') return;
      try {
        const englishResponse = await fetchWithTimeout(
          `${apiBaseUrl}/api/lessons?language=english`,
          LESSON_FETCH_TIMEOUT_MS,
          requestController.signal,
        );
        if (!englishResponse.ok) throw new Error(`API responded with ${englishResponse.status}`);
        const englishLessons = (await englishResponse.json()) as LessonData[];
        if (!isActive) return;
        if (Array.isArray(englishLessons) && englishLessons.length > 0) {
          setEnglishReferenceLessons(englishLessons);
        }
      } catch (englishFetchError) {
        if (isAbortError(englishFetchError)) return;
        console.warn(
          'Failed to load english reference lessons. Using selected language lessons as fallback.',
          englishFetchError,
        );
      }
    };

    const fetchData = async () => {
      try {
        if (!isActive) return;
        setLoading(true);
        setErrorMessage(null);
        const response = await fetchWithTimeout(
          lessonsUrl.toString(),
          LESSON_FETCH_TIMEOUT_MS,
          requestController.signal,
        );
        if (!response.ok) throw new Error(`API responded with ${response.status}`);

        const data = (await response.json()) as LessonData[];
        if (!Array.isArray(data) || data.length === 0) throw new Error('No lessons returned from API');

        if (!isActive) return;
        setLessons(data);
        setEnglishReferenceLessons(data);
        setLoading(false);
        void fetchEnglishReferenceLessons();
      } catch (error) {
        if (isAbortError(error)) return;
        console.error('Error loading lessons from API, trying offline packs:', error);
        const [offlineLearnLessons, offlineEnglishLessons] = await Promise.all([
          readDownloadedLessonsByLanguage(lessonLanguage),
          readDownloadedLessonsByLanguage('english'),
        ]);

        if (!isActive) return;
        if (offlineLearnLessons.length > 0) {
          setLessons(offlineLearnLessons);
          setEnglishReferenceLessons(
            offlineEnglishLessons.length > 0 ? offlineEnglishLessons : offlineLearnLessons,
          );
          setErrorMessage(null);
          setLoading(false);
          return;
        }

        setErrorMessage(lessonsLoadFailedMessage);
        setLoading(false);
      } finally {
        if (!isActive) return;
      }
    };

    void fetchData();
    return () => {
      isActive = false;
      requestController.abort();
    };
  }, [
    apiBaseUrl,
    enabled,
    filters?.collectionLabel,
    filters?.contentType,
    filters?.sourceLabel,
    lessonLanguage,
    lessonsLoadFailedMessage,
  ]);

  return { lessons, englishReferenceLessons, loading, errorMessage };
}

