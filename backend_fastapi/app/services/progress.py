from __future__ import annotations

from typing import Any

from ..config import (
    coerce_framework_for_learn_language,
    DEFAULT_PROGRESS,
    resolve_non_conflicting_learn_language,
    SUPPORTED_APP_THEME_CODES,
    SUPPORTED_COURSE_FRAMEWORK_CODES,
    SUPPORTED_LANGUAGE_CODES,
    SUPPORTED_UI_LOCK_LANGUAGE_CODES,
    SUPPORTED_VOICE_PROVIDER_CODES,
    Settings,
)
from .lessons import get_supported_languages, normalize_language

SUPPORTED_DEFAULT_LANGUAGES = set(SUPPORTED_LANGUAGE_CODES)
SUPPORTED_UI_LOCK_LANGUAGES = set(SUPPORTED_UI_LOCK_LANGUAGE_CODES)
SUPPORTED_COURSE_FRAMEWORKS = set(SUPPORTED_COURSE_FRAMEWORK_CODES)
SUPPORTED_APP_THEMES = set(SUPPORTED_APP_THEME_CODES)
SUPPORTED_VOICE_PROVIDERS = set(SUPPORTED_VOICE_PROVIDER_CODES)


class ProgressStorageUnavailable(Exception):
    pass


def _to_boolean(value: Any, fallback: bool = False) -> bool:
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        lower = value.lower()
        if lower == "true":
            return True
        if lower == "false":
            return False
    return fallback


def _to_int(value: Any, fallback: int = 0) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return fallback


def _to_string(value: Any, fallback: str = "") -> str:
    if not isinstance(value, str):
        return fallback
    return value.strip().lower()


def _coerce_lesson_line_visibility(
    is_pronunciation_enabled: bool,
    is_learning_language_visible: bool,
) -> tuple[bool, bool]:
    if not is_pronunciation_enabled and not is_learning_language_visible:
        return is_pronunciation_enabled, True
    return is_pronunciation_enabled, is_learning_language_visible


def normalize_profile_name(value: Any) -> str:
    if not isinstance(value, str):
        return ""
    return value.strip()


def normalize_progress_input(payload: dict[str, Any], settings: Settings) -> dict[str, Any]:
    supported_languages = get_supported_languages(settings.default_language)
    normalized_default_language = _to_string(payload.get("defaultLanguage"), DEFAULT_PROGRESS["defaultLanguage"])
    if normalized_default_language not in SUPPORTED_DEFAULT_LANGUAGES:
        normalized_default_language = DEFAULT_PROGRESS["defaultLanguage"]
    normalized_learn_language = normalize_language(
        payload.get("learnLanguage"),
        settings.default_language,
        supported_languages,
    )
    normalized_learn_language = resolve_non_conflicting_learn_language(
        normalized_default_language,
        normalized_learn_language,
    )
    normalized_ui_lock_language = _to_string(payload.get("uiLockLanguage"), DEFAULT_PROGRESS["uiLockLanguage"])
    if normalized_ui_lock_language not in SUPPORTED_UI_LOCK_LANGUAGES:
        normalized_ui_lock_language = DEFAULT_PROGRESS["uiLockLanguage"]
    normalized_course_framework = _to_string(payload.get("courseFramework"), DEFAULT_PROGRESS["courseFramework"])
    if normalized_course_framework not in SUPPORTED_COURSE_FRAMEWORKS:
        normalized_course_framework = DEFAULT_PROGRESS["courseFramework"]
    normalized_course_framework = coerce_framework_for_learn_language(
        normalized_course_framework,
        normalized_learn_language,
    )
    is_pronunciation_enabled = _to_boolean(
        payload.get("isPronunciationEnabled"),
        DEFAULT_PROGRESS["isPronunciationEnabled"],
    )
    is_learning_language_visible = _to_boolean(
        payload.get("isLearningLanguageVisible"),
        DEFAULT_PROGRESS["isLearningLanguageVisible"],
    )
    (
        normalized_pronunciation_enabled,
        normalized_learning_language_visible,
    ) = _coerce_lesson_line_visibility(is_pronunciation_enabled, is_learning_language_visible)
    normalized_app_theme = _to_string(payload.get("appTheme"), DEFAULT_PROGRESS["appTheme"])
    if normalized_app_theme not in SUPPORTED_APP_THEMES:
        normalized_app_theme = DEFAULT_PROGRESS["appTheme"]
    normalized_voice_provider = _to_string(payload.get("voiceProvider"), DEFAULT_PROGRESS["voiceProvider"])
    if normalized_voice_provider == "google":
        normalized_voice_provider = "apple_siri"
    if normalized_voice_provider not in SUPPORTED_VOICE_PROVIDERS:
        normalized_voice_provider = DEFAULT_PROGRESS["voiceProvider"]

    return {
        "currentIndex": max(
            DEFAULT_PROGRESS["currentIndex"],
            _to_int(payload.get("currentIndex"), DEFAULT_PROGRESS["currentIndex"]),
        ),
        "unlockedLevel": max(
            DEFAULT_PROGRESS["unlockedLevel"],
            _to_int(payload.get("unlockedLevel"), DEFAULT_PROGRESS["unlockedLevel"]),
        ),
        "streak": max(
            DEFAULT_PROGRESS["streak"],
            _to_int(payload.get("streak"), DEFAULT_PROGRESS["streak"]),
        ),
        "learnLanguage": normalized_learn_language,
        "defaultLanguage": normalized_default_language,
        "uiLockLanguage": normalized_ui_lock_language,
        "courseFramework": normalized_course_framework,
        "isPronunciationEnabled": normalized_pronunciation_enabled,
        "isLearningLanguageVisible": normalized_learning_language_visible,
        "isTranslationVisible": _to_boolean(
            payload.get("isTranslationVisible"),
            DEFAULT_PROGRESS["isTranslationVisible"],
        ),
        "textScalePercent": min(
            settings.text_scale_percent_max,
            max(
                settings.text_scale_percent_min,
                _to_int(payload.get("textScalePercent"), DEFAULT_PROGRESS["textScalePercent"]),
            ),
        ),
        "isBoldTextEnabled": _to_boolean(payload.get("isBoldTextEnabled"), DEFAULT_PROGRESS["isBoldTextEnabled"]),
        "isAutoScrollEnabled": _to_boolean(
            payload.get("isAutoScrollEnabled"),
            DEFAULT_PROGRESS["isAutoScrollEnabled"],
        ),
        "isRandomLessonOrderEnabled": _to_boolean(
            payload.get("isRandomLessonOrderEnabled"),
            DEFAULT_PROGRESS["isRandomLessonOrderEnabled"],
        ),
        "isReviewQuestionsRemoved": _to_boolean(
            payload.get("isReviewQuestionsRemoved"),
            DEFAULT_PROGRESS["isReviewQuestionsRemoved"],
        ),
        "appTheme": normalized_app_theme,
        "voiceProvider": normalized_voice_provider,
    }


def _connect(settings: Settings):
    if not settings.database_url:
        raise ProgressStorageUnavailable("DATABASE_URL is not configured.")
    try:
        import psycopg
        from psycopg.rows import dict_row
    except Exception as exc:
        raise ProgressStorageUnavailable("psycopg is not available.") from exc

    sslmode = "require" if settings.pgssl else "prefer"
    return psycopg.connect(settings.database_url, row_factory=dict_row, sslmode=sslmode)


def ensure_progress_table(settings: Settings) -> None:
    create_sql = f"""
    CREATE TABLE IF NOT EXISTS user_progress (
      profile_name TEXT PRIMARY KEY,
      current_index INTEGER NOT NULL DEFAULT {DEFAULT_PROGRESS["currentIndex"]},
      unlocked_level INTEGER NOT NULL DEFAULT {DEFAULT_PROGRESS["unlockedLevel"]},
      streak INTEGER NOT NULL DEFAULT {DEFAULT_PROGRESS["streak"]},
      learn_language TEXT NOT NULL DEFAULT '{DEFAULT_PROGRESS["learnLanguage"]}',
      default_language TEXT NOT NULL DEFAULT '{DEFAULT_PROGRESS["defaultLanguage"]}',
      ui_lock_language TEXT NOT NULL DEFAULT '{DEFAULT_PROGRESS["uiLockLanguage"]}',
      course_framework TEXT NOT NULL DEFAULT '{DEFAULT_PROGRESS["courseFramework"]}',
      pronunciation_enabled BOOLEAN NOT NULL DEFAULT {str(DEFAULT_PROGRESS["isPronunciationEnabled"]).lower()},
      learning_language_visible BOOLEAN NOT NULL DEFAULT {str(DEFAULT_PROGRESS["isLearningLanguageVisible"]).lower()},
      translation_visible BOOLEAN NOT NULL DEFAULT {str(DEFAULT_PROGRESS["isTranslationVisible"]).lower()},
      text_scale_percent INTEGER NOT NULL DEFAULT {DEFAULT_PROGRESS["textScalePercent"]},
      bold_text_enabled BOOLEAN NOT NULL DEFAULT {str(DEFAULT_PROGRESS["isBoldTextEnabled"]).lower()},
      auto_scroll_enabled BOOLEAN NOT NULL DEFAULT {str(DEFAULT_PROGRESS["isAutoScrollEnabled"]).lower()},
      random_lesson_order_enabled BOOLEAN NOT NULL DEFAULT {str(DEFAULT_PROGRESS["isRandomLessonOrderEnabled"]).lower()},
      review_questions_removed BOOLEAN NOT NULL DEFAULT {str(DEFAULT_PROGRESS["isReviewQuestionsRemoved"]).lower()},
      app_theme TEXT NOT NULL DEFAULT '{DEFAULT_PROGRESS["appTheme"]}',
      voice_provider TEXT NOT NULL DEFAULT '{DEFAULT_PROGRESS["voiceProvider"]}',
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
    """
    alter_sql = f"""
    ALTER TABLE user_progress
      ADD COLUMN IF NOT EXISTS text_scale_percent INTEGER NOT NULL DEFAULT {DEFAULT_PROGRESS["textScalePercent"]},
      ADD COLUMN IF NOT EXISTS bold_text_enabled BOOLEAN NOT NULL DEFAULT {str(DEFAULT_PROGRESS["isBoldTextEnabled"]).lower()},
      ADD COLUMN IF NOT EXISTS ui_lock_language TEXT NOT NULL DEFAULT '{DEFAULT_PROGRESS["uiLockLanguage"]}',
      ADD COLUMN IF NOT EXISTS course_framework TEXT NOT NULL DEFAULT '{DEFAULT_PROGRESS["courseFramework"]}',
      ADD COLUMN IF NOT EXISTS learning_language_visible BOOLEAN NOT NULL DEFAULT {str(DEFAULT_PROGRESS["isLearningLanguageVisible"]).lower()},
      ADD COLUMN IF NOT EXISTS translation_visible BOOLEAN NOT NULL DEFAULT {str(DEFAULT_PROGRESS["isTranslationVisible"]).lower()},
      ADD COLUMN IF NOT EXISTS auto_scroll_enabled BOOLEAN NOT NULL DEFAULT {str(DEFAULT_PROGRESS["isAutoScrollEnabled"]).lower()},
      ADD COLUMN IF NOT EXISTS random_lesson_order_enabled BOOLEAN NOT NULL DEFAULT {str(DEFAULT_PROGRESS["isRandomLessonOrderEnabled"]).lower()},
      ADD COLUMN IF NOT EXISTS review_questions_removed BOOLEAN NOT NULL DEFAULT {str(DEFAULT_PROGRESS["isReviewQuestionsRemoved"]).lower()},
      ADD COLUMN IF NOT EXISTS app_theme TEXT NOT NULL DEFAULT '{DEFAULT_PROGRESS["appTheme"]}',
      ADD COLUMN IF NOT EXISTS voice_provider TEXT NOT NULL DEFAULT '{DEFAULT_PROGRESS["voiceProvider"]}'
    """

    try:
        with _connect(settings) as conn:
            with conn.cursor() as cur:
                cur.execute(create_sql)
                cur.execute(alter_sql)
            conn.commit()
    except Exception as exc:
        raise ProgressStorageUnavailable("Failed to initialize progress table.") from exc


def read_progress_from_db(profile_name: str, settings: Settings) -> dict[str, Any] | None:
    ensure_progress_table(settings)
    try:
        with _connect(settings) as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT
                      current_index,
                      unlocked_level,
                      streak,
                      learn_language,
                      default_language,
                      ui_lock_language,
                      course_framework,
                      pronunciation_enabled,
                      learning_language_visible,
                      translation_visible,
                      text_scale_percent,
                      bold_text_enabled,
                      auto_scroll_enabled,
                      random_lesson_order_enabled,
                      review_questions_removed,
                      app_theme,
                      voice_provider
                    FROM user_progress
                    WHERE profile_name = %s
                    """,
                    (profile_name,),
                )
                row = cur.fetchone()
    except Exception as exc:
        raise ProgressStorageUnavailable("Failed to read progress.") from exc

    if not row:
        return None
    return {
        "currentIndex": row["current_index"],
        "unlockedLevel": row["unlocked_level"],
        "streak": row["streak"],
        "learnLanguage": row["learn_language"],
        "defaultLanguage": row["default_language"],
        "uiLockLanguage": row["ui_lock_language"],
        "courseFramework": row["course_framework"],
        "isPronunciationEnabled": row["pronunciation_enabled"],
        "isLearningLanguageVisible": row["learning_language_visible"],
        "isTranslationVisible": row["translation_visible"],
        "textScalePercent": row["text_scale_percent"],
        "isBoldTextEnabled": row["bold_text_enabled"],
        "isAutoScrollEnabled": row["auto_scroll_enabled"],
        "isRandomLessonOrderEnabled": row["random_lesson_order_enabled"],
        "isReviewQuestionsRemoved": row["review_questions_removed"],
        "appTheme": row["app_theme"],
        "voiceProvider": row["voice_provider"],
    }


def write_progress_to_db(profile_name: str, progress_input: dict[str, Any], settings: Settings) -> dict[str, Any]:
    ensure_progress_table(settings)
    progress = normalize_progress_input(progress_input, settings)
    try:
        with _connect(settings) as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO user_progress (
                      profile_name,
                      current_index,
                      unlocked_level,
                      streak,
                      learn_language,
                      default_language,
                      ui_lock_language,
                      course_framework,
                      pronunciation_enabled,
                      learning_language_visible,
                      translation_visible,
                      text_scale_percent,
                      bold_text_enabled,
                      auto_scroll_enabled,
                      random_lesson_order_enabled,
                      review_questions_removed,
                      app_theme,
                      voice_provider,
                      updated_at
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
                    ON CONFLICT (profile_name)
                    DO UPDATE SET
                      current_index = EXCLUDED.current_index,
                      unlocked_level = EXCLUDED.unlocked_level,
                      streak = EXCLUDED.streak,
                      learn_language = EXCLUDED.learn_language,
                      default_language = EXCLUDED.default_language,
                      ui_lock_language = EXCLUDED.ui_lock_language,
                      course_framework = EXCLUDED.course_framework,
                      pronunciation_enabled = EXCLUDED.pronunciation_enabled,
                      learning_language_visible = EXCLUDED.learning_language_visible,
                      translation_visible = EXCLUDED.translation_visible,
                      text_scale_percent = EXCLUDED.text_scale_percent,
                      bold_text_enabled = EXCLUDED.bold_text_enabled,
                      auto_scroll_enabled = EXCLUDED.auto_scroll_enabled,
                      random_lesson_order_enabled = EXCLUDED.random_lesson_order_enabled,
                      review_questions_removed = EXCLUDED.review_questions_removed,
                      app_theme = EXCLUDED.app_theme,
                      voice_provider = EXCLUDED.voice_provider,
                      updated_at = NOW()
                    """,
                    (
                        profile_name,
                        progress["currentIndex"],
                        progress["unlockedLevel"],
                        progress["streak"],
                        progress["learnLanguage"],
                        progress["defaultLanguage"],
                        progress["uiLockLanguage"],
                        progress["courseFramework"],
                        progress["isPronunciationEnabled"],
                        progress["isLearningLanguageVisible"],
                        progress["isTranslationVisible"],
                        progress["textScalePercent"],
                        progress["isBoldTextEnabled"],
                        progress["isAutoScrollEnabled"],
                        progress["isRandomLessonOrderEnabled"],
                        progress["isReviewQuestionsRemoved"],
                        progress["appTheme"],
                        progress["voiceProvider"],
                    ),
                )
            conn.commit()
    except Exception as exc:
        raise ProgressStorageUnavailable("Failed to write progress.") from exc
    return progress

