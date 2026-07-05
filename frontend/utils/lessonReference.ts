import { getLessonOrderIndex, getLessonUnitId } from '../config/appConfig';
import { LessonData } from '../types';

function normalizeKeyPart(value: string | undefined): string {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\|/g, '¦');
}

export function buildLessonReferenceKey(
  lesson: Pick<LessonData, 'groupId' | 'unitId' | 'orderIndex' | 'level' | 'unit' | 'topic' | 'burmese' | 'english'>,
): string {
  const topic = normalizeKeyPart(lesson.topic);
  const burmese = normalizeKeyPart(lesson.burmese);
  const english = normalizeKeyPart(lesson.english);
  return `${getLessonOrderIndex(lesson)}|${getLessonUnitId(lesson)}|${topic}|${burmese}|${english}`;
}



