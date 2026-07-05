from __future__ import annotations

from typing import Literal

from pydantic import BaseModel

from .config import DEFAULT_PROGRESS


class HealthResponse(BaseModel):
    status: Literal["ok"] = "ok"
    storageMode: str


class LessonRecord(BaseModel):
    level: int
    unit: int
    topic: str
    speaker: str | None = None
    english: str
    burmese: str
    pronunciation: str
    audioPath: str | None = None
    groupId: str
    unitId: int
    orderIndex: int
    sourceLabel: str | None = None
    collectionLabel: str | None = None
    contentType: str | None = None
    displayTitle: str | None = None
    displayMeta: str | None = None
    trackId: str | None = None
    levelScheme: str | None = None
    levelCode: str | None = None
    levelOrder: int | None = None
    framework: str | None = None
    frameworkLevel: str | None = None
    frameworkUnit: int | None = None
    translations: dict[str, str] | None = None


class ProgressState(BaseModel):
    currentIndex: int = DEFAULT_PROGRESS["currentIndex"]
    unlockedLevel: int = DEFAULT_PROGRESS["unlockedLevel"]
    streak: int = DEFAULT_PROGRESS["streak"]
    learnLanguage: str = DEFAULT_PROGRESS["learnLanguage"]
    defaultLanguage: str = DEFAULT_PROGRESS["defaultLanguage"]
    uiLockLanguage: str = DEFAULT_PROGRESS["uiLockLanguage"]
    courseFramework: str = DEFAULT_PROGRESS["courseFramework"]
    isPronunciationEnabled: bool = DEFAULT_PROGRESS["isPronunciationEnabled"]
    isLearningLanguageVisible: bool = DEFAULT_PROGRESS["isLearningLanguageVisible"]
    isTranslationVisible: bool = DEFAULT_PROGRESS["isTranslationVisible"]
    textScalePercent: int = DEFAULT_PROGRESS["textScalePercent"]
    isBoldTextEnabled: bool = DEFAULT_PROGRESS["isBoldTextEnabled"]
    isAutoScrollEnabled: bool = DEFAULT_PROGRESS["isAutoScrollEnabled"]
    isRandomLessonOrderEnabled: bool = DEFAULT_PROGRESS["isRandomLessonOrderEnabled"]
    isReviewQuestionsRemoved: bool = DEFAULT_PROGRESS["isReviewQuestionsRemoved"]
    appTheme: str = DEFAULT_PROGRESS["appTheme"]
    voiceProvider: str = DEFAULT_PROGRESS["voiceProvider"]


class ProgressUpdateResponse(BaseModel):
    ok: Literal[True] = True
    progress: ProgressState


class MessageResponse(BaseModel):
    message: str


class ProgressUnavailableResponse(MessageResponse):
    fallback: ProgressState | None = None


class HighlightRecord(BaseModel):
    id: str
    profileName: str
    learnLanguage: str
    lessonKey: str
    lessonText: str
    selectedText: str
    createdAt: str


class HighlightUpsertResponse(BaseModel):
    ok: Literal[True] = True
    highlight: HighlightRecord


class OkResponse(BaseModel):
    ok: Literal[True] = True

