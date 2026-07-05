import { useMemo } from 'react';
import {
  getLessonOrderIndex,
  getLessonUnitId,
  getPlayableLessonText,
  LearnLanguage,
  resolveStageCode,
} from '../config/appConfig';
import { LessonData } from '../types';

type UseCourseNavigationStateParams = {
  lessons: LessonData[];
  learnLanguage: LearnLanguage;
  currentIndex: number;
  currentLevel: number;
  sectionStart: number;
};

type UseCourseNavigationStateResult = {
  currentStageCode: string;
  currentStageRange: { start: number; end: number };
  orderedCourseUnitStartIndexes: number[];
  playableCourseUnitKeys: Set<string>;
};

export function useCourseNavigationState({
  lessons,
  learnLanguage,
  currentIndex,
  currentLevel,
  sectionStart,
}: UseCourseNavigationStateParams): UseCourseNavigationStateResult {
  const currentStageCode = useMemo(() => {
    const anchor = lessons[sectionStart] ?? lessons[currentIndex];
    if (!anchor) return resolveStageCode(currentLevel);
    return resolveStageCode(getLessonOrderIndex(anchor), anchor.stage);
  }, [currentIndex, currentLevel, lessons, sectionStart]);

  const currentStageRange = useMemo(() => {
    const indexes = lessons.reduce<number[]>((acc, lesson, idx) => {
      const stageCode = resolveStageCode(getLessonOrderIndex(lesson), lesson.stage);
      if (stageCode === currentStageCode) {
        acc.push(idx);
      }
      return acc;
    }, []);
    if (indexes.length === 0) {
      return { start: 0, end: Math.max(0, lessons.length - 1) };
    }
    return { start: indexes[0], end: indexes[indexes.length - 1] };
  }, [currentStageCode, lessons]);

  const orderedCourseUnitStartIndexes = useMemo(() => {
    const seen = new Set<string>();
    const starts: number[] = [];
    lessons.forEach((lesson, index) => {
      const key = `${getLessonOrderIndex(lesson)}:${getLessonUnitId(lesson)}`;
      if (seen.has(key)) return;
      seen.add(key);
      starts.push(index);
    });
    return starts;
  }, [lessons]);

  const playableCourseUnitKeys = useMemo(() => {
    const playable = new Set<string>();
    lessons.forEach((lesson) => {
      const speakTextValue = getPlayableLessonText(lesson, learnLanguage);
      if (!speakTextValue) return;
      playable.add(`${getLessonOrderIndex(lesson)}:${getLessonUnitId(lesson)}`);
    });
    return playable;
  }, [learnLanguage, lessons]);

  return {
    currentStageCode,
    currentStageRange,
    orderedCourseUnitStartIndexes,
    playableCourseUnitKeys,
  };
}

