import { useMemo } from 'react';
import { LessonData } from '../types';
import {
  AppMode,
  getLevelTitle,
  getLessonOrderIndex,
  getLessonUnitId,
  LESSONS_PER_BATCH,
} from '../config/appConfig';
import { resolveCurrentCourseCode } from '../utils/courseCode';

type UseLessonUnitStateParams = {
  lessons: LessonData[];
  mode: AppMode;
  currentIndex: number;
  learnStep: number;
  isRandomLessonOrderEnabled: boolean;
  randomOrderVersion: number;
};

export type LessonBatchEntry = {
  lesson: LessonData;
  lessonIndex: number;
};

export type UseLessonUnitStateResult = {
  currentLevel: number;
  currentUnit: number;
  currentCourseCode: string;
  currentLevelTitle: string;
  levelIndexes: number[];
  orderedUnitIndexes: number[];
  sectionStart: number;
  sectionEnd: number;
  sectionTotal: number;
  currentBatchEntries: LessonBatchEntry[];
};

export function useLessonUnitState({
  lessons,
  mode,
  currentIndex,
  learnStep,
  isRandomLessonOrderEnabled,
  randomOrderVersion,
}: UseLessonUnitStateParams): UseLessonUnitStateResult {
  const activeLevelIndex = Math.min(currentIndex, Math.max(lessons.length - 1, 0));
  const fallbackLevel = lessons[0] ? getLessonOrderIndex(lessons[0]) : 1;
  const currentLevel = lessons[activeLevelIndex] ? getLessonOrderIndex(lessons[activeLevelIndex]) : fallbackLevel;
  const currentUnit = lessons[activeLevelIndex] ? getLessonUnitId(lessons[activeLevelIndex]) : 1;
  const currentCourseCode = resolveCurrentCourseCode(lessons, activeLevelIndex);

  const levelIndexes = useMemo(
    () =>
      lessons.reduce<number[]>((acc, lesson, idx) => {
        if (getLessonOrderIndex(lesson) === currentLevel && getLessonUnitId(lesson) === currentUnit) acc.push(idx);
        return acc;
      }, []),
    [currentLevel, currentUnit, lessons],
  );

  const orderedUnitIndexes = useMemo(() => {
    if (!isRandomLessonOrderEnabled || levelIndexes.length <= 1) {
      return levelIndexes;
    }
    const shuffled = [...levelIndexes];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, [isRandomLessonOrderEnabled, levelIndexes, randomOrderVersion]);

  const sectionStart = levelIndexes.length > 0 ? Math.min(...levelIndexes) : Math.max(0, activeLevelIndex);
  const sectionEnd = levelIndexes.length > 0 ? Math.max(...levelIndexes) : Math.max(0, activeLevelIndex);
  const sectionTotal = Math.max(1, orderedUnitIndexes.length);
  const batchStartOffset = mode === 'learn' ? learnStep * LESSONS_PER_BATCH : 0;
  const currentBatchEntries =
    mode === 'learn'
      ? Array.from({ length: LESSONS_PER_BATCH }, (_, idx) => {
          const orderedIndex = batchStartOffset + idx;
          const lessonIndex = orderedUnitIndexes[orderedIndex];
          if (typeof lessonIndex !== 'number') return null;
          const lesson = lessons[lessonIndex];
          return lesson ? { lesson, lessonIndex } : null;
        }).filter((entry): entry is LessonBatchEntry => Boolean(entry))
      : [];
  return {
    currentLevel,
    currentUnit,
    currentCourseCode,
    currentLevelTitle: getLevelTitle(currentLevel),
    levelIndexes,
    orderedUnitIndexes,
    sectionStart,
    sectionEnd,
    sectionTotal,
    currentBatchEntries,
  };
}

