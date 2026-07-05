import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { LESSON_HIGHLIGHTS_KEY } from '../config/appConfig';
import { LessonData } from '../types';
import { buildLessonReferenceKey } from '../utils/lessonReference';
import { useLessonHighlights } from './useLessonHighlights';

const PROFILE_STORAGE_ID = 'tester';
const LEARN_LANGUAGE = 'english';
const STORAGE_KEY = `${LESSON_HIGHLIGHTS_KEY}:${PROFILE_STORAGE_ID}:${LEARN_LANGUAGE}`;

function buildLesson(overrides: Partial<LessonData> = {}): LessonData {
  return {
    level: 1,
    unit: 1,
    topic: 'Greetings',
    english: 'Hello there',
    burmese: 'မင်္ဂလာပါ',
    pronunciation: 'mingalaba',
    ...overrides,
  };
}

describe('useLessonHighlights', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('keeps multiple saved selections for the same lesson', () => {
    const lesson = buildLesson();
    const lessonKey = buildLessonReferenceKey(lesson);

    const { result } = renderHook(() => useLessonHighlights({
      apiBaseUrl: '',
      profileName: '',
      profileStorageId: PROFILE_STORAGE_ID,
      learnLanguage: LEARN_LANGUAGE,
    }));

    act(() => {
      result.current.saveHighlightSelection(lesson, 'Hello');
      result.current.saveHighlightSelection(lesson, 'there');
    });

    const phrases = result.current.highlightPhrasesByLessonKey.get(lessonKey) ?? [];
    expect(phrases).toContain('Hello');
    expect(phrases).toContain('there');
    expect(result.current.highlights).toHaveLength(2);

    const persisted = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    expect(persisted).toHaveLength(2);
  });

  it('deduplicates re-saving the same selected phrase in the same lesson', () => {
    const lesson = buildLesson();

    const { result } = renderHook(() => useLessonHighlights({
      apiBaseUrl: '',
      profileName: '',
      profileStorageId: PROFILE_STORAGE_ID,
      learnLanguage: LEARN_LANGUAGE,
    }));

    act(() => {
      result.current.saveHighlightSelection(lesson, 'Hello');
      result.current.saveHighlightSelection(lesson, '  hello  ');
    });

    expect(result.current.highlights).toHaveLength(1);
  });
});

