from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path

SUPPORTED_LANGUAGE_CODES = ("burmese", "english", "chinese", "vietnamese", "thai")
SUPPORTED_UI_LOCK_LANGUAGE_CODES = ("off", *SUPPORTED_LANGUAGE_CODES)
SUPPORTED_COURSE_FRAMEWORK_CODES = ("cefr", "hsk")
SUPPORTED_APP_THEME_CODES = ("light", "dark")
SUPPORTED_VOICE_PROVIDER_CODES = ("default", "apple_siri")
FRAMEWORK_LANGUAGE_ALLOWLIST = {
    "cefr": SUPPORTED_LANGUAGE_CODES,
    "hsk": SUPPORTED_LANGUAGE_CODES,
}

# Lessons/content framework language configuration.
LESSON_PRIMARY_MARKDOWN_LANGUAGE_CODES = ("english", "chinese")
HSK_LANGUAGE_CODES = ("hsk1", "hsk2", "hsk3", "hsk4", "hsk5", "hsk6")
HSK_COLLECTION_LANGUAGE_CODE = "hsk_chinese"
HSK_BASE_LANGUAGE_CODE = "chinese"
LESSON_FRAMEWORK_CODES = ("cefr", "hsk", "jlpt", "custom")
CEFR_STAGE_LABELS = (
    "Beginner (A1)",
    "Pre-Intermediate (A2)",
    "Intermediate (B1)",
    "Upper-Intermediate (B2)",
)
CEFR_LEVEL_ORDER = {
    "A1": 1,
    "A2": 2,
    "B1": 3,
    "B2": 4,
    "C1": 5,
    "C2": 6,
}


def resolve_non_conflicting_learn_language(default_language: str, learn_language: str) -> str:
    if learn_language != default_language:
        return learn_language
    fallback = next((code for code in SUPPORTED_LANGUAGE_CODES if code != default_language), learn_language)
    return fallback


def is_framework_allowed_for_learn_language(framework: str, learn_language: str) -> bool:
    allowed_languages = FRAMEWORK_LANGUAGE_ALLOWLIST.get(framework)
    if not allowed_languages:
        return False
    return learn_language in allowed_languages


def coerce_framework_for_learn_language(framework: str, learn_language: str) -> str:
    if is_framework_allowed_for_learn_language(framework, learn_language):
        return framework
    fallback_framework = "cefr"
    if is_framework_allowed_for_learn_language(fallback_framework, learn_language):
        return fallback_framework
    for candidate in SUPPORTED_COURSE_FRAMEWORK_CODES:
        if is_framework_allowed_for_learn_language(candidate, learn_language):
            return candidate
    return framework


def _to_bool(value: str | None, fallback: bool = False) -> bool:
    if value is None:
        return fallback
    normalized = value.strip().lower()
    if normalized == "true":
        return True
    if normalized == "false":
        return False
    return fallback


def _to_int(value: str | None, fallback: int) -> int:
    if value is None:
        return fallback
    try:
        return int(value)
    except ValueError:
        return fallback


def _load_dotenv(dotenv_path: Path) -> None:
    if not dotenv_path.is_file():
        return
    for raw_line in dotenv_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        os.environ.setdefault(key, value)


def _repo_root() -> Path:
    return Path(__file__).resolve().parents[2]


def _backend_fastapi_root() -> Path:
    return Path(__file__).resolve().parents[1]


def _resolve_data_dir(raw_value: str | None) -> Path:
    repo_root = _repo_root()
    if raw_value and raw_value.strip():
        candidate = Path(raw_value.strip()).expanduser()
        if not candidate.is_absolute():
            # Resolve relative DATA_DIR from backend_fastapi root (where .env lives).
            candidate = _backend_fastapi_root() / candidate
        return candidate

    preferred = repo_root / "data"
    legacy = repo_root / "backend" / "data"
    if preferred.exists() or not legacy.exists():
        return preferred
    return legacy


class Settings:
    def __init__(self) -> None:
        dotenv_path = Path.cwd() / ".env"
        _load_dotenv(dotenv_path)

        self.port = _to_int(os.getenv("PORT"), 4000)
        self.database_url = os.getenv("DATABASE_URL", "")
        self.pgssl = _to_bool(os.getenv("PGSSL"), False)
        self.frontend_origin = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")
        self.default_language = (os.getenv("DEFAULT_LANGUAGE", "english").strip().lower() or "english")
        self.storage_mode = os.getenv("STORAGE_MODE", "db")
        self.data_dir = _resolve_data_dir(os.getenv("DATA_DIR"))
        self.supabase_url = os.getenv("SUPABASE_URL", "").strip().rstrip("/")
        self.supabase_anon_key = os.getenv("SUPABASE_ANON_KEY", "").strip()
        self.supabase_jwt_secret = os.getenv("SUPABASE_JWT_SECRET", "").strip()
        configured_issuer = os.getenv("SUPABASE_JWT_ISSUER", "").strip()
        self.supabase_jwt_issuer = configured_issuer or (f"{self.supabase_url}/auth/v1" if self.supabase_url else "")
        self.supabase_jwt_audience = os.getenv("SUPABASE_JWT_AUDIENCE", "authenticated").strip()
        self.profile_secret_pepper = os.getenv("PROFILE_SECRET_PEPPER", "")
        self.profile_secret_min_length = _to_int(os.getenv("PROFILE_SECRET_MIN_LENGTH"), 24)
        self.profile_auth_max_failures = _to_int(os.getenv("PROFILE_AUTH_MAX_FAILURES"), 8)
        self.profile_auth_window_seconds = _to_int(os.getenv("PROFILE_AUTH_WINDOW_SECONDS"), 300)
        self.profile_auth_block_seconds = _to_int(os.getenv("PROFILE_AUTH_BLOCK_SECONDS"), 900)
        self.text_scale_percent_min = 90
        self.text_scale_percent_max = 120

    @property
    def frontend_origin_list(self) -> list[str]:
        return [value.strip() for value in self.frontend_origin.split(",") if value.strip()]


DEFAULT_PROGRESS = {
    "currentIndex": 0,
    "unlockedLevel": 1,
    "streak": 0,
    "learnLanguage": "english",
    "defaultLanguage": "burmese",
    "uiLockLanguage": "english",
    "courseFramework": "cefr",
    "isPronunciationEnabled": False,
    "isLearningLanguageVisible": True,
    "isTranslationVisible": True,
    "textScalePercent": 100,
    "isBoldTextEnabled": False,
    "isAutoScrollEnabled": True,
    "isRandomLessonOrderEnabled": False,
    "isReviewQuestionsRemoved": False,
    "appTheme": "light",
    "voiceProvider": "default",
}


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()

