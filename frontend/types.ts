
export interface LessonData {
  groupId?: string;
  unitId?: number;
  orderIndex?: number;
  level: number;
  unit: number;
  stage?: string;
  topic: string;
  speaker?: string | null;
  burmese: string;
  english: string;
  pronunciation: string;
  audioPath?: string;
  sourceLabel?: string;
  collectionLabel?: string;
  contentType?: string;
  displayTitle?: string;
  displayMeta?: string;
  trackId?: string;
  levelScheme?: string;
  levelCode?: string;
  levelOrder?: number;
  framework?: string;
  frameworkLevel?: string;
  frameworkUnit?: number;
  translations?: Record<string, string>;
}

export interface ProgressState {
  currentIndex: number;
  completedCount: number;
}

export interface LessonHighlight {
  id: string;
  profileStorageId: string;
  learnLanguage: string;
  lessonKey: string;
  lessonText: string;
  selectedText: string;
  createdAt: string;
}

