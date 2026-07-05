import { useMemo } from 'react';
import { LESSONS_PER_BATCH } from '../config/appConfig';
import { LessonData } from '../types';
import { LessonBatchEntry } from './useLessonUnitState';

type UseLessonBatchGroupsParams = {
  lessons: LessonData[];
  orderedUnitIndexes: number[];
  sectionTotal: number;
};

export function useLessonBatchGroups({
  lessons,
  orderedUnitIndexes,
  sectionTotal,
}: UseLessonBatchGroupsParams): LessonBatchEntry[][] {
  return useMemo(
    () =>
      Array.from({ length: Math.max(1, Math.ceil(sectionTotal / LESSONS_PER_BATCH)) }, (_, step) =>
        Array.from({ length: LESSONS_PER_BATCH }, (_, idx) => {
          const orderedIndex = (step * LESSONS_PER_BATCH) + idx;
          const lessonIndex = orderedUnitIndexes[orderedIndex];
          if (typeof lessonIndex !== 'number') return null;
          const lesson = lessons[lessonIndex];
          return lesson ? { lesson, lessonIndex } : null;
        }).filter((entry): entry is LessonBatchEntry => Boolean(entry)),
      ),
    [lessons, orderedUnitIndexes, sectionTotal],
  );
}

