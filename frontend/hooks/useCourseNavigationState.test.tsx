import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useCourseNavigationState } from './useCourseNavigationState';
import { LessonData } from '../types';

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

describe('useCourseNavigationState', () => {
  it('derives stage range, unique unit starts, and playable unit keys', () => {
    const lessons: LessonData[] = [
      buildLesson({ level: 1, unit: 1, stage: 'A1', english: 'A1 U1 sentence 1' }),
      buildLesson({ level: 1, unit: 1, stage: 'A1', english: '' }),
      buildLesson({ level: 1, unit: 2, stage: 'A1', english: '   ' }),
      buildLesson({ level: 4, unit: 1, stage: 'A2', english: 'A2 U1 sentence 1' }),
      buildLesson({ level: 4, unit: 2, stage: 'A2', english: 'A2 U2 sentence 1' }),
    ];

    const { result } = renderHook(() =>
      useCourseNavigationState({
        lessons,
        learnLanguage: 'english',
        currentIndex: 4,
        currentLevel: 4,
        sectionStart: 3,
      }),
    );

    expect(result.current.currentStageCode).toBe('A2');
    expect(result.current.currentStageRange).toEqual({ start: 3, end: 4 });
    expect(result.current.orderedCourseUnitStartIndexes).toEqual([0, 2, 3, 4]);
    expect(Array.from(result.current.playableCourseUnitKeys).sort()).toEqual(['1:1', '4:1', '4:2']);
  });

  it('falls back cleanly when lessons are empty', () => {
    const { result } = renderHook(() =>
      useCourseNavigationState({
        lessons: [],
        learnLanguage: 'english',
        currentIndex: 0,
        currentLevel: 10,
        sectionStart: 0,
      }),
    );

    expect(result.current.currentStageCode).toBe('B2');
    expect(result.current.currentStageRange).toEqual({ start: 0, end: 0 });
    expect(result.current.orderedCourseUnitStartIndexes).toEqual([]);
    expect(result.current.playableCourseUnitKeys.size).toBe(0);
  });
});

