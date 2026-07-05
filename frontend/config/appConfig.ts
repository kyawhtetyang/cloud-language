export const LEARN_QUESTIONS_PER_UNIT = 10;
export const QUICK_REVIEW_CHECKPOINTS: number[] = [2, 4, 6, 8, 10];
export const QUICK_REVIEW_COUNT = QUICK_REVIEW_CHECKPOINTS.length;
export const TOTAL_XP_PER_COURSE = QUICK_REVIEW_COUNT;
export const PASS_SCORE = 4;

export const PROFILE_NAME_KEY = 'lingo_burmese_profile_name';
export const PROGRESS_KEY = 'lingo_burmese_progress';
export const UNLOCKED_LEVEL_KEY = 'lingo_burmese_unlocked_level';
export const STREAK_KEY = 'lingo_burmese_streak';
export const PRONUNCIATION_ENABLED_KEY = 'lingo_burmese_pronunciation_enabled';
export const LEARNING_LANGUAGE_VISIBLE_KEY = 'lingo_burmese_learning_language_visible';
export const TRANSLATION_VISIBLE_KEY = 'lingo_burmese_translation_visible';
export const LEARN_LANGUAGE_KEY = 'lingo_burmese_learn_language';
export const DEFAULT_LANGUAGE_KEY = 'lingo_burmese_default_language';
export const UI_LOCK_LANGUAGE_KEY = 'lingo_burmese_ui_lock_language';
export const TEXT_SCALE_PERCENT_KEY = 'lingo_burmese_text_scale_percent';
export const BOLD_TEXT_ENABLED_KEY = 'lingo_burmese_bold_text_enabled';
export const RANDOM_LESSON_ORDER_ENABLED_KEY = 'lingo_burmese_random_lesson_order_enabled';
export const REMOVE_REVIEW_QUESTIONS_ENABLED_KEY = 'lingo_burmese_remove_review_questions_enabled';
export const AUTO_SCROLL_ENABLED_KEY = 'lingo_burmese_auto_scroll_enabled';
export const RELOAD_TO_LESSON_KEY = 'lingo_burmese_reload_to_lesson';
export const APP_THEME_KEY = 'lingo_burmese_app_theme';
export const VOICE_PROVIDER_KEY = 'lingo_burmese_voice_provider';
export const LESSON_HIGHLIGHTS_KEY = 'lingo_burmese_lesson_highlights';
export const COURSE_FRAMEWORK_KEY = 'lingo_burmese_course_framework';
export const PROFILE_AUTH_SECRET_KEY = 'lingo_burmese_profile_secret';
export const SUPABASE_SESSION_KEY = 'lingo_burmese_supabase_session';

export const LESSONS_PER_BATCH = 3;
export const MATCH_PAIRS_PER_REVIEW = 3;
export const UNITS_PER_ALBUM = 10;

export const LEVEL_METADATA = [
  {
    level: 1,
    title: 'Sound & Survival Speech',
    stage: 'A1',
  },
  {
    level: 2,
    title: 'Basic Daily Speech',
    stage: 'A1',
  },
  {
    level: 3,
    title: 'Guided Conversation',
    stage: 'A1',
  },
  {
    level: 4,
    title: 'Narrating Events',
    stage: 'A2',
  },
  {
    level: 5,
    title: 'Functional Interaction',
    stage: 'A2',
  },
  {
    level: 6,
    title: 'Structured Responses',
    stage: 'A2',
  },
  {
    level: 7,
    title: 'Expanding Fluency',
    stage: 'B1',
  },
  {
    level: 8,
    title: 'Discussion Skills',
    stage: 'B1',
  },
  {
    level: 9,
    title: 'Persuasive Speaking',
    stage: 'B1',
  },
  {
    level: 10,
    title: 'Advanced Fluency',
    stage: 'B2',
  },
  {
    level: 11,
    title: 'Analytical Discussion',
    stage: 'B2',
  },
  {
    level: 12,
    title: 'Professional Speaking Mastery',
    stage: 'B2',
  },
] as const;

export const STAGE_ORDER = ['A1', 'A2', 'B1', 'B2'] as const;
export type StageCode = (typeof STAGE_ORDER)[number];
export const STAGE_META = {
  A1: {
    label: 'Beginner (A1)',
    levelCardClass: 'btn-selected-flat border-0',
    topicCardClass: 'border-[#dbe8cb] bg-white/85 hover:border-[#9ad56a]',
    badgeClass: 'bg-brand-soft text-brand',
    titleClass: 'text-white',
  },
  A2: {
    label: 'Pre-Intermediate (A2)',
    levelCardClass: 'btn-selected-flat border-0',
    topicCardClass: 'border-[#f5d564] bg-white/90 hover:border-[#eab308]',
    badgeClass: 'bg-brand-soft text-brand',
    titleClass: 'text-white',
  },
  B1: {
    label: 'Intermediate (B1)',
    levelCardClass: 'btn-selected-flat border-0',
    topicCardClass: 'border-[#bfdbfe] bg-white/90 hover:border-[#60a5fa]',
    badgeClass: 'bg-brand-soft text-brand',
    titleClass: 'text-white',
  },
  B2: {
    label: 'Upper-Intermediate (B2)',
    levelCardClass: 'btn-selected-flat border-0',
    topicCardClass: 'border-[#f9a8d4] bg-white/90 hover:border-[#ec4899]',
    badgeClass: 'bg-brand-soft text-brand',
    titleClass: 'text-white',
  },
} as const;

export type AppMode = 'learn' | 'completed';
export type SidebarTab = 'profile' | 'library' | 'lesson' | 'settings';
export const LIBRARY_VIEW_MODES = ['all', 'downloaded'] as const;
export type LibraryViewMode = (typeof LIBRARY_VIEW_MODES)[number];
export const DEFAULT_LIBRARY_VIEW_MODE: LibraryViewMode = 'all';
export const LANGUAGE_OPTIONS = [
  { code: 'burmese', label: 'Burmese' },
  { code: 'english', label: 'English' },
  { code: 'chinese', label: 'Chinese' },
  { code: 'vietnamese', label: 'Vietnamese' },
  { code: 'thai', label: 'Thai' },
] as const;
export type LanguageCode = (typeof LANGUAGE_OPTIONS)[number]['code'];

export const LEARN_LANGUAGE_OPTIONS = LANGUAGE_OPTIONS;
export type LearnLanguage = LanguageCode;

export const COURSE_FRAMEWORK_OPTIONS = [
  { code: 'cefr', label: 'CEFR' },
  { code: 'hsk', label: 'HSK' },
] as const;
export type CourseFramework = (typeof COURSE_FRAMEWORK_OPTIONS)[number]['code'];

export const LIBRARY_SCHEME_SORT_PRIORITY: Record<string, number> = {
  cefr: 10,
  hsk: 20,
  jlpt: 30,
  custom: 40,
};

export function getLibrarySchemeSortPriority(levelScheme: string | undefined): number {
  const normalizedScheme = String(levelScheme || '').trim().toLowerCase();
  return LIBRARY_SCHEME_SORT_PRIORITY[normalizedScheme] ?? 50;
}

export const FRAMEWORK_LANGUAGE_ALLOWLIST: Record<CourseFramework, ReadonlyArray<LearnLanguage>> = {
  cefr: ['burmese', 'english', 'chinese', 'vietnamese', 'thai'],
  hsk: ['burmese', 'english', 'chinese', 'vietnamese', 'thai'],
};

const FRAMEWORK_CONTENT_LANGUAGE: Record<CourseFramework, 'learnLanguage' | 'hsk_chinese'> = {
  cefr: 'learnLanguage',
  hsk: 'hsk_chinese',
};

export const DEFAULT_LANGUAGE_OPTIONS = LANGUAGE_OPTIONS;
export type DefaultLanguage = LanguageCode;

export const UI_LOCK_LANGUAGE_OPTIONS = [
  { code: 'off', label: 'Off' },
  ...LANGUAGE_OPTIONS,
] as const;
export type UiLockLanguage = (typeof UI_LOCK_LANGUAGE_OPTIONS)[number]['code'];

export const APP_THEME_OPTIONS = [
  { code: 'light', label: 'Light Mode' },
  { code: 'dark', label: 'Dark Mode' },
] as const;
export type AppTheme = (typeof APP_THEME_OPTIONS)[number]['code'];


export const VOICE_PROVIDER_OPTIONS = [
  { code: 'default', label: 'Default' },
  { code: 'apple_siri', label: 'Apple (Siri)' },
] as const;
export type VoiceProvider = (typeof VOICE_PROVIDER_OPTIONS)[number]['code'];

export const TEXT_SCALE_PERCENT_MIN = 90;
export const TEXT_SCALE_PERCENT_MAX = 120;
export const DEFAULT_TEXT_SCALE_PERCENT = 100;
export const DEFAULT_UNLOCKED_LEVEL = 1;
export const DEFAULT_STREAK = 0;
export const DEFAULT_PROGRESS_INDEX = 0;

export const APP_DEFAULTS = {
  learnLanguage: 'english' as LearnLanguage,
  defaultLanguage: 'burmese' as DefaultLanguage,
  uiLockLanguage: 'english' as UiLockLanguage,
  courseFramework: 'cefr' as CourseFramework,
  isPronunciationEnabled: false,
  isLearningLanguageVisible: true,
  isTranslationVisible: true,
  textScalePercent: DEFAULT_TEXT_SCALE_PERCENT,
  isBoldTextEnabled: false,
  isAutoScrollEnabled: true,
  isRandomLessonOrderEnabled: false,
  isReviewQuestionsRemoved: false,
  appTheme: 'light' as AppTheme,
  voiceProvider: 'default' as VoiceProvider,
};

export type ReviewResult = {
  correct: number;
  total: number;
  passed: boolean;
};

export function clampTextScale(value: number): number {
  return Math.min(TEXT_SCALE_PERCENT_MAX, Math.max(TEXT_SCALE_PERCENT_MIN, value));
}

export function isLearnLanguage(value: unknown): value is LearnLanguage {
  if (typeof value !== 'string') return false;
  return LEARN_LANGUAGE_OPTIONS.some((option) => option.code === value);
}

export function isCourseFramework(value: unknown): value is CourseFramework {
  if (typeof value !== 'string') return false;
  return COURSE_FRAMEWORK_OPTIONS.some((option) => option.code === value);
}

export function isFrameworkAllowedForLearnLanguage(
  framework: CourseFramework,
  learnLanguage: LearnLanguage,
): boolean {
  const allowedLanguages = FRAMEWORK_LANGUAGE_ALLOWLIST[framework];
  return allowedLanguages.includes(learnLanguage);
}

export function coerceFrameworkForLearnLanguage(
  framework: CourseFramework,
  learnLanguage: LearnLanguage,
): CourseFramework {
  if (isFrameworkAllowedForLearnLanguage(framework, learnLanguage)) {
    return framework;
  }
  const fallbackFramework = 'cefr' as const;
  if (isFrameworkAllowedForLearnLanguage(fallbackFramework, learnLanguage)) {
    return fallbackFramework;
  }
  const firstSupportedFramework = COURSE_FRAMEWORK_OPTIONS.find((option) =>
    isFrameworkAllowedForLearnLanguage(option.code, learnLanguage),
  );
  return firstSupportedFramework?.code ?? framework;
}

export function resolveLessonContentLanguage(
  learnLanguage: LearnLanguage,
  courseFramework: CourseFramework,
): string {
  const normalizedFramework = coerceFrameworkForLearnLanguage(courseFramework, learnLanguage);
  const mappedContentLanguage = FRAMEWORK_CONTENT_LANGUAGE[normalizedFramework];
  return mappedContentLanguage === 'learnLanguage' ? learnLanguage : mappedContentLanguage;
}

export function resolveNonConflictingLearnLanguage(
  defaultLanguage: DefaultLanguage,
  currentLearnLanguage: LearnLanguage,
): LearnLanguage {
  if (currentLearnLanguage !== defaultLanguage) return currentLearnLanguage;
  const fallback = LEARN_LANGUAGE_OPTIONS.find((option) => option.code !== defaultLanguage);
  return fallback ? fallback.code : currentLearnLanguage;
}

export function coerceLessonLineVisibility(
  isPronunciationEnabled: boolean,
  isLearningLanguageVisible: boolean,
): { isPronunciationEnabled: boolean; isLearningLanguageVisible: boolean } {
  if (!isPronunciationEnabled && !isLearningLanguageVisible) {
    return {
      isPronunciationEnabled,
      isLearningLanguageVisible: true,
    };
  }
  return { isPronunciationEnabled, isLearningLanguageVisible };
}

export function isDefaultLanguage(value: unknown): value is DefaultLanguage {
  if (typeof value !== 'string') return false;
  return DEFAULT_LANGUAGE_OPTIONS.some((option) => option.code === value);
}

export function isUiLockLanguage(value: unknown): value is UiLockLanguage {
  if (typeof value !== 'string') return false;
  return UI_LOCK_LANGUAGE_OPTIONS.some((option) => option.code === value);
}

export function isAppTheme(value: unknown): value is AppTheme {
  if (typeof value !== 'string') return false;
  return APP_THEME_OPTIONS.some((option) => option.code === value);
}


export function isVoiceProvider(value: unknown): value is VoiceProvider {
  if (typeof value !== 'string') return false;
  return VOICE_PROVIDER_OPTIONS.some((option) => option.code === value);
}

export type CoreLessonRef = {
  groupId?: string;
  unitId?: number;
  orderIndex?: number;
  level: number;
  unit: number;
};

export type PlayableLessonTextRef = {
  english?: string | null;
  pronunciation?: string | null;
  translations?: Record<string, string> | null;
};

export function getPlayableLessonText(
  lesson: PlayableLessonTextRef,
  learnLanguage?: LearnLanguage,
): string {
  if (learnLanguage) {
    return resolveLessonLearningSourceText({
      lessonEnglish: lesson.english,
      lessonPronunciation: lesson.pronunciation,
      lessonTranslations: lesson.translations,
      learnLanguage,
    });
  }
  if (typeof lesson.english !== 'string') return '';
  return lesson.english.trim();
}

type TranslationTextInput = {
  lessonEnglish?: string | null;
  lessonBurmese?: string | null;
  lessonTranslations?: Record<string, string> | null;
  defaultLanguage: DefaultLanguage;
  learnLanguage: LearnLanguage;
  englishReferenceText?: string | null;
};

function normalizeTranslationLocale(rawLocale: string): string {
  const normalized = String(rawLocale || '').trim().toLowerCase().replace(/-/g, '_');
  if (normalized === 'en' || normalized === 'eng' || normalized === 'english') return 'english';
  if (normalized === 'th' || normalized === 'tha' || normalized === 'thai' || normalized === 'thailand') return 'thai';
  if (normalized === 'vi' || normalized === 'vie' || normalized === 'vietnamese') return 'vietnamese';
  if (
    normalized === 'my'
    || normalized === 'mm'
    || normalized === 'bm'
    || normalized === 'burmese'
    || normalized === 'myanmar'
  ) {
    return 'burmese';
  }
  return normalized;
}

function resolveMappedTranslation(
  translations: Record<string, string> | null | undefined,
  locale: string,
): string {
  if (!translations) return '';
  const entries = Object.entries(translations);
  if (entries.length === 0) return '';

  for (const [rawKey, rawValue] of entries) {
    if (normalizeTranslationLocale(rawKey) !== locale) continue;
    if (typeof rawValue !== 'string') continue;
    const trimmed = rawValue.trim();
    if (trimmed) return trimmed;
  }
  return '';
}

type LearningTextInput = {
  lessonEnglish?: string | null;
  lessonPronunciation?: string | null;
  lessonTranslations?: Record<string, string> | null;
  learnLanguage: LearnLanguage;
};

type LessonLanguageTextConfig = {
  sourceKeys: string[];
  pronunciationKeys: string[];
};

const LESSON_LANGUAGE_TEXT_CONFIG: Record<LearnLanguage, LessonLanguageTextConfig> = {
  english: {
    sourceKeys: ['english'],
    pronunciationKeys: ['en_py', 'english_py'],
  },
  chinese: {
    sourceKeys: ['ch', 'zh'],
    pronunciationKeys: ['ch_py', 'zh_py', 'pinyin'],
  },
  vietnamese: {
    sourceKeys: ['vietnamese', 'vi'],
    pronunciationKeys: ['vi_py', 'vietnamese_py'],
  },
  thai: {
    sourceKeys: ['thai', 'th'],
    pronunciationKeys: ['th_py', 'thai_py'],
  },
  burmese: {
    sourceKeys: ['burmese', 'my'],
    pronunciationKeys: ['my_py', 'burmese_py'],
  },
};

function firstNonEmpty(...values: Array<string | null | undefined>): string {
  for (const rawValue of values) {
    const text = String(rawValue || '').trim();
    if (text) return text;
  }
  return '';
}

function resolveMappedTranslationByKeys(
  translations: Record<string, string> | null | undefined,
  keys: string[],
): string {
  return firstNonEmpty(...keys.map((key) => resolveMappedTranslation(translations, key)));
}

export function resolveLessonLearningSourceText({
  lessonEnglish,
  lessonTranslations,
  learnLanguage,
}: LearningTextInput): string {
  const sourceFallback = String(lessonEnglish || '').trim();
  const config = LESSON_LANGUAGE_TEXT_CONFIG[learnLanguage];
  const mappedSource = resolveMappedTranslationByKeys(lessonTranslations, config.sourceKeys);
  if (mappedSource) return mappedSource;
  return sourceFallback;
}

export function resolveLessonLearningPronunciationText({
  lessonPronunciation,
  lessonTranslations,
  learnLanguage,
}: LearningTextInput): string {
  const pronunciationFallback = String(lessonPronunciation || '').trim();
  const config = LESSON_LANGUAGE_TEXT_CONFIG[learnLanguage];
  const mappedPronunciation = resolveMappedTranslationByKeys(lessonTranslations, config.pronunciationKeys);
  if (mappedPronunciation) return mappedPronunciation;
  return pronunciationFallback;
}

export function hasLessonLearningPronunciation({
  lessonEnglish,
  lessonPronunciation,
  lessonTranslations,
  learnLanguage,
}: LearningTextInput): boolean {
  const pronunciationFallback = String(lessonPronunciation || '').trim();
  const sourceFallback = String(lessonEnglish || '').trim();
  const config = LESSON_LANGUAGE_TEXT_CONFIG[learnLanguage];
  const mappedPronunciation = resolveMappedTranslationByKeys(lessonTranslations, config.pronunciationKeys);
  if (mappedPronunciation) return true;

  if (!pronunciationFallback) return false;
  const mappedSource = resolveMappedTranslationByKeys(lessonTranslations, config.sourceKeys);
  const compareSource = firstNonEmpty(mappedSource, sourceFallback);
  if (!compareSource) return true;
  return pronunciationFallback.toLocaleLowerCase() !== compareSource.toLocaleLowerCase();
}

export function resolveLessonTranslationText({
  lessonEnglish,
  lessonBurmese,
  lessonTranslations,
  defaultLanguage,
  learnLanguage,
  englishReferenceText,
}: TranslationTextInput): string {
  void learnLanguage;
  const sourceLine = typeof lessonEnglish === 'string' ? lessonEnglish.trim() : '';
  const translationLine = typeof lessonBurmese === 'string' ? lessonBurmese.trim() : '';
  const englishReference = typeof englishReferenceText === 'string' ? englishReferenceText.trim() : '';
  const localeMappedTranslation = resolveMappedTranslation(lessonTranslations, defaultLanguage);
  if (localeMappedTranslation) {
    return localeMappedTranslation;
  }

  if (defaultLanguage === 'burmese') {
    return translationLine || sourceLine;
  }

  return englishReference || translationLine || sourceLine;
}

export function getLessonUnitId(lesson: CoreLessonRef): number {
  if (Number.isInteger(lesson.unitId) && (lesson.unitId as number) > 0) {
    return lesson.unitId as number;
  }
  return Math.max(1, lesson.unit);
}

export function getLessonOrderIndex(lesson: CoreLessonRef): number {
  if (Number.isInteger(lesson.orderIndex) && (lesson.orderIndex as number) > 0) {
    return lesson.orderIndex as number;
  }
  return Math.max(1, lesson.level);
}

type LessonStageInput = {
  groupId?: string;
  unitId?: number;
  orderIndex?: number;
  level: number;
  unit: number;
  topic?: string;
  stage?: string;
};

export type StageUnitRef = {
  stage: StageCode;
  stageUnitNumber: number;
  level: number;
  unit: number;
  topic: string;
};

const LEVEL_STAGE_LOOKUP = new Map<number, StageCode>(
  LEVEL_METADATA.map((item) => [item.level, item.stage]),
);

export function isStageCode(value: string | null | undefined): value is StageCode {
  return value === 'A1' || value === 'A2' || value === 'B1' || value === 'B2';
}

export function resolveStageCode(level: number, stage?: string): StageCode {
  if (stage && isStageCode(stage)) return stage;
  return LEVEL_STAGE_LOOKUP.get(level) || 'A1';
}

export function buildStageUnitsFromLessons(lessons: LessonStageInput[]): StageUnitRef[] {
  const byStage = new Map<StageCode, StageUnitRef[]>();

  for (const stage of STAGE_ORDER) {
    byStage.set(stage, []);
  }

  const seen = new Set<string>();

  for (const lesson of lessons) {
    const lessonOrder = getLessonOrderIndex(lesson);
    const lessonUnit = getLessonUnitId(lesson);
    const stage = resolveStageCode(lessonOrder, lesson.stage);
    const key = `${stage}:${lessonOrder}:${lessonUnit}`;
    if (seen.has(key)) continue;
    seen.add(key);
    byStage.get(stage)?.push({
      stage,
      stageUnitNumber: 0,
      level: lessonOrder,
      unit: lessonUnit,
      topic: lesson.topic || '',
    });
  }

  const stageUnits: StageUnitRef[] = [];
  for (const stage of STAGE_ORDER) {
    const sorted = (byStage.get(stage) || []).sort(
      (a, b) => a.level - b.level || a.unit - b.unit,
    );
    sorted.forEach((item, index) => {
      stageUnits.push({
        ...item,
        stageUnitNumber: index + 1,
      });
    });
  }

  return stageUnits;
}

export function getLevelTitle(level: number): string {
  const row = LEVEL_METADATA.find((item) => item.level === level);
  return row?.title || `Unit ${level}`;
}

export function toProfileStorageId(name: string): string {
  return (
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '') || 'user'
  );
}

