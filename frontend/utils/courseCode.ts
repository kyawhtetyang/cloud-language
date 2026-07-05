type CourseCodeLessonRef = {
  framework?: string;
  frameworkLevel?: string;
  frameworkUnit?: number;
};

function normalizeText(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/\s+/g, ' ');
}

export function resolveCurrentCourseCode(
  lessons: CourseCodeLessonRef[],
  activeLessonIndex: number,
): string {
  const activeLesson = lessons[activeLessonIndex];
  const framework = normalizeText(activeLesson?.framework).toLowerCase();
  const frameworkLevel = normalizeText(activeLesson?.frameworkLevel);
  const frameworkUnit = activeLesson?.frameworkUnit;
  if (!framework || !frameworkLevel) return '';
  if (!Number.isInteger(frameworkUnit) || (frameworkUnit as number) < 1) return '';
  return `${frameworkLevel} Unit ${frameworkUnit}`;
}

