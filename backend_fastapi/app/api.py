from __future__ import annotations

import logging
from typing import Any

from fastapi import APIRouter, Header, Query
from fastapi.responses import JSONResponse

from .config import DEFAULT_PROGRESS, get_settings
from .models import (
    HealthResponse,
    HighlightRecord,
    HighlightUpsertResponse,
    LessonRecord,
    MessageResponse,
    OkResponse,
    ProgressState,
    ProgressUnavailableResponse,
    ProgressUpdateResponse,
)
from .services.lessons import (
    build_library_index,
    get_lessons,
)
from .services.progress import (
    ProgressStorageUnavailable,
    normalize_progress_input,
    normalize_profile_name,
    read_progress_from_db,
    write_progress_to_db,
)
from .services.profile_auth import (
    ProfileAuthStorageUnavailable,
    clear_profile_auth_failures,
    get_profile_auth_lock_seconds,
    hash_profile_secret,
    normalize_profile_secret,
    profile_secret_matches,
    record_profile_auth_failure,
    read_profile_secret_hash,
    upsert_profile_secret_hash,
)
from .services.supabase_auth import (
    SupabaseAuthorizationError,
    authenticate_supabase_bearer,
)
from .services.user_activity import (
    ActivityStorageUnavailable,
    delete_highlight_from_db,
    normalize_activity_language,
    normalize_highlight_input,
    normalize_review_event_input,
    read_highlights_from_db,
    upsert_highlight_to_db,
    write_review_event_to_db,
)

router = APIRouter(prefix="/api", tags=["api"])
logger = logging.getLogger(__name__)
_PROGRESS_JSON_STORE: dict[str, dict[str, Any]] = {}
_HIGHLIGHTS_JSON_STORE: dict[str, dict[str, dict[str, Any]]] = {}
_REVIEW_EVENTS_JSON_STORE: list[dict[str, Any]] = []
_PROFILE_SECRET_JSON_STORE: dict[str, str] = {}


def _is_json_progress_mode(storage_mode: str | None) -> bool:
    return str(storage_mode or "").strip().lower() == "json"


def _highlight_store_key(profile_name: str, learn_language: str) -> str:
    return f"{profile_name}:{learn_language}"


def _supabase_profile_name(user_id: str) -> str:
    return f"supabase:{user_id}"


class ProfileAuthorizationError(Exception):
    def __init__(self, status_code: int, message: str, *, retry_after_seconds: int | None = None) -> None:
        super().__init__(message)
        self.status_code = status_code
        self.message = message
        self.retry_after_seconds = retry_after_seconds


def _profile_auth_error_response(error: ProfileAuthorizationError):
    headers: dict[str, str] | None = None
    if error.retry_after_seconds is not None:
        headers = {"Retry-After": str(max(1, error.retry_after_seconds))}
    return JSONResponse(
        status_code=error.status_code,
        content=MessageResponse(message=error.message).model_dump(),
        headers=headers,
    )


def _authorize_profile_access(
    profile_name: str,
    profile_secret_input: str | None,
    settings,
    *,
    allow_create: bool,
) -> None:
    profile_secret = normalize_profile_secret(profile_secret_input)
    if not profile_secret:
        raise ProfileAuthorizationError(401, "X-Profile-Secret header is required")

    min_secret_length = max(8, int(settings.profile_secret_min_length or 24))
    if len(profile_secret) < min_secret_length:
        raise ProfileAuthorizationError(
            400,
            f"X-Profile-Secret must be at least {min_secret_length} characters",
        )

    if _is_json_progress_mode(settings.storage_mode):
        existing_hash = _PROFILE_SECRET_JSON_STORE.get(profile_name)
        if existing_hash is None:
            if allow_create:
                _PROFILE_SECRET_JSON_STORE[profile_name] = hash_profile_secret(profile_secret, settings)
                clear_profile_auth_failures(profile_name)
                return
            raise ProfileAuthorizationError(404, "Profile not found")
        lock_seconds = get_profile_auth_lock_seconds(profile_name, settings)
        if lock_seconds > 0:
            raise ProfileAuthorizationError(
                429,
                "Too many failed profile secret attempts. Try again later.",
                retry_after_seconds=lock_seconds,
            )
        if not profile_secret_matches(profile_secret, existing_hash, settings):
            lock_seconds = record_profile_auth_failure(profile_name, settings)
            if lock_seconds > 0:
                raise ProfileAuthorizationError(
                    429,
                    "Too many failed profile secret attempts. Try again later.",
                    retry_after_seconds=lock_seconds,
                )
            raise ProfileAuthorizationError(403, "Profile access denied")
        clear_profile_auth_failures(profile_name)
        return

    existing_hash = read_profile_secret_hash(profile_name, settings)
    if existing_hash is None:
        if allow_create:
            upsert_profile_secret_hash(
                profile_name,
                hash_profile_secret(profile_secret, settings),
                settings,
            )
            clear_profile_auth_failures(profile_name)
            return
        raise ProfileAuthorizationError(404, "Profile not found")
    lock_seconds = get_profile_auth_lock_seconds(profile_name, settings)
    if lock_seconds > 0:
        raise ProfileAuthorizationError(
            429,
            "Too many failed profile secret attempts. Try again later.",
            retry_after_seconds=lock_seconds,
        )
    if not profile_secret_matches(profile_secret, existing_hash, settings):
        lock_seconds = record_profile_auth_failure(profile_name, settings)
        if lock_seconds > 0:
            raise ProfileAuthorizationError(
                429,
                "Too many failed profile secret attempts. Try again later.",
                retry_after_seconds=lock_seconds,
            )
        raise ProfileAuthorizationError(403, "Profile access denied")
    clear_profile_auth_failures(profile_name)


def _resolve_profile_owner(
    profile_name_input: Any,
    profile_secret_input: str | None,
    authorization_input: str | None,
    settings,
    *,
    allow_create: bool,
) -> str:
    try:
        identity = authenticate_supabase_bearer(authorization_input, settings)
    except SupabaseAuthorizationError as exc:
        raise ProfileAuthorizationError(exc.status_code, exc.message) from exc

    if identity is not None:
        return _supabase_profile_name(identity.user_id)

    profile_name = normalize_profile_name(profile_name_input)
    if not profile_name:
        raise ProfileAuthorizationError(400, "profileName is required")
    _authorize_profile_access(profile_name, profile_secret_input, settings, allow_create=allow_create)
    return profile_name


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    settings = get_settings()
    return HealthResponse(storageMode=settings.storage_mode)


@router.get("/lessons", response_model=list[LessonRecord])
def lessons(
    language: str | None = Query(default=None),
    sourceLabel: str | None = Query(default=None),
    collectionLabel: str | None = Query(default=None),
    contentType: str | None = Query(default=None),
):
    try:
        settings = get_settings()
        return get_lessons(
            language,
            settings,
            source_label=sourceLabel,
            collection_label=collectionLabel,
            content_type=contentType,
        )
    except Exception:
        logger.exception("Failed to load lessons")
        return JSONResponse(status_code=500, content=MessageResponse(message="Failed to load lessons").model_dump())


@router.get("/library")
def library(language: str | None = Query(default=None)):
    try:
        settings = get_settings()
        lessons = get_lessons(language, settings)
        return build_library_index(lessons)
    except Exception:
        logger.exception("Failed to load library index")
        return JSONResponse(
            status_code=500,
            content=MessageResponse(message="Failed to load library index").model_dump(),
        )


@router.get(
    "/progress",
    response_model=ProgressState,
    responses={
        400: {"model": MessageResponse},
        401: {"model": MessageResponse},
        403: {"model": MessageResponse},
        404: {"model": MessageResponse},
        429: {"model": MessageResponse},
        503: {"model": ProgressUnavailableResponse},
    },
)
def get_progress(
    profileName: str | None = Query(default=None),
    x_profile_secret: str | None = Header(default=None, alias="X-Profile-Secret"),
    authorization: str | None = Header(default=None, alias="Authorization"),
):
    try:
        settings = get_settings()
        profile_name = _resolve_profile_owner(
            profileName,
            x_profile_secret,
            authorization,
            settings,
            allow_create=False,
        )
        if _is_json_progress_mode(settings.storage_mode):
            progress = _PROGRESS_JSON_STORE.get(profile_name) or dict(DEFAULT_PROGRESS)
            return ProgressState(**progress)
        progress = read_progress_from_db(profile_name, settings)
        if progress is None:
            return JSONResponse(status_code=404, content=MessageResponse(message="Progress not found").model_dump())
        return progress
    except ProfileAuthorizationError as exc:
        return _profile_auth_error_response(exc)
    except ProfileAuthStorageUnavailable:
        logger.warning("Profile auth storage unavailable for read")
        return JSONResponse(
            status_code=503,
            content=ProgressUnavailableResponse(
                message="Profile auth storage unavailable. Configure DATABASE_URL for PostgreSQL.",
                fallback=ProgressState(**DEFAULT_PROGRESS),
            ).model_dump(),
        )
    except ProgressStorageUnavailable:
        logger.warning("Progress storage unavailable for read")
        return JSONResponse(
            status_code=503,
            content=ProgressUnavailableResponse(
                message="Progress storage unavailable. Configure DATABASE_URL for PostgreSQL.",
                fallback=ProgressState(**DEFAULT_PROGRESS),
            ).model_dump(),
        )
    except Exception:
        logger.exception("Failed to read progress")
        return JSONResponse(
            status_code=503,
            content=ProgressUnavailableResponse(
                message="Progress storage unavailable. Configure DATABASE_URL for PostgreSQL.",
                fallback=ProgressState(**DEFAULT_PROGRESS),
            ).model_dump(),
        )


@router.put(
    "/progress",
    response_model=ProgressUpdateResponse,
    responses={
        400: {"model": MessageResponse},
        401: {"model": MessageResponse},
        403: {"model": MessageResponse},
        429: {"model": MessageResponse},
        503: {"model": MessageResponse},
    },
)
def put_progress(
    payload: dict,
    x_profile_secret: str | None = Header(default=None, alias="X-Profile-Secret"),
    authorization: str | None = Header(default=None, alias="Authorization"),
):
    try:
        settings = get_settings()
        profile_name = _resolve_profile_owner(
            payload.get("profileName"),
            x_profile_secret,
            authorization,
            settings,
            allow_create=True,
        )
        if _is_json_progress_mode(settings.storage_mode):
            saved = normalize_progress_input(payload, settings)
            _PROGRESS_JSON_STORE[profile_name] = saved
            return ProgressUpdateResponse(ok=True, progress=ProgressState(**saved)).model_dump()
        saved = write_progress_to_db(profile_name, payload, settings)
        return ProgressUpdateResponse(ok=True, progress=ProgressState(**saved)).model_dump()
    except ProfileAuthorizationError as exc:
        return _profile_auth_error_response(exc)
    except ProfileAuthStorageUnavailable:
        logger.warning("Profile auth storage unavailable for write")
        return JSONResponse(
            status_code=503,
            content=MessageResponse(
                message="Profile auth storage unavailable. Configure DATABASE_URL for PostgreSQL.",
            ).model_dump(),
        )
    except ProgressStorageUnavailable:
        logger.warning("Progress storage unavailable for write")
        return JSONResponse(
            status_code=503,
            content=MessageResponse(message="Progress storage unavailable. Configure DATABASE_URL for PostgreSQL.").model_dump(),
        )
    except Exception:
        logger.exception("Failed to write progress")
        return JSONResponse(
            status_code=503,
            content=MessageResponse(message="Progress storage unavailable. Configure DATABASE_URL for PostgreSQL.").model_dump(),
        )


@router.get(
    "/highlights",
    response_model=list[HighlightRecord],
    responses={
        400: {"model": MessageResponse},
        401: {"model": MessageResponse},
        403: {"model": MessageResponse},
        429: {"model": MessageResponse},
        503: {"model": MessageResponse},
    },
)
def get_highlights(
    profileName: str | None = Query(default=None),
    learnLanguage: str | None = Query(default=None),
    x_profile_secret: str | None = Header(default=None, alias="X-Profile-Secret"),
    authorization: str | None = Header(default=None, alias="Authorization"),
):
    try:
        settings = get_settings()
        profile_name = _resolve_profile_owner(
            profileName,
            x_profile_secret,
            authorization,
            settings,
            allow_create=False,
        )
        learn_language = normalize_activity_language(learnLanguage, settings)
        if _is_json_progress_mode(settings.storage_mode):
            store_key = _highlight_store_key(profile_name, learn_language)
            items = list((_HIGHLIGHTS_JSON_STORE.get(store_key) or {}).values())
            items.sort(key=lambda item: str(item.get("createdAt", "")), reverse=True)
            return items
        return read_highlights_from_db(profile_name, learn_language, settings)
    except ProfileAuthorizationError as exc:
        return _profile_auth_error_response(exc)
    except ProfileAuthStorageUnavailable:
        logger.warning("Profile auth storage unavailable for highlights read")
        return JSONResponse(
            status_code=503,
            content=MessageResponse(
                message="Profile auth storage unavailable. Configure DATABASE_URL for PostgreSQL.",
            ).model_dump(),
        )
    except ActivityStorageUnavailable:
        logger.warning("Activity storage unavailable for highlights read")
        return JSONResponse(
            status_code=503,
            content=MessageResponse(message="Activity storage unavailable. Configure DATABASE_URL for PostgreSQL.").model_dump(),
        )
    except Exception:
        logger.exception("Failed to read highlights")
        return JSONResponse(
            status_code=503,
            content=MessageResponse(message="Activity storage unavailable. Configure DATABASE_URL for PostgreSQL.").model_dump(),
        )


@router.put(
    "/highlights",
    response_model=HighlightUpsertResponse,
    responses={
        400: {"model": MessageResponse},
        401: {"model": MessageResponse},
        403: {"model": MessageResponse},
        429: {"model": MessageResponse},
        503: {"model": MessageResponse},
    },
)
def put_highlight(
    payload: dict,
    x_profile_secret: str | None = Header(default=None, alias="X-Profile-Secret"),
    authorization: str | None = Header(default=None, alias="Authorization"),
):
    try:
        settings = get_settings()
        profile_name = _resolve_profile_owner(
            payload.get("profileName"),
            x_profile_secret,
            authorization,
            settings,
            allow_create=True,
        )
        effective_payload = dict(payload)
        effective_payload["profileName"] = profile_name
        normalized = normalize_highlight_input(effective_payload, settings)
        if not normalized["profileName"]:
            return JSONResponse(status_code=400, content=MessageResponse(message="profileName is required").model_dump())
        if not normalized["lessonKey"]:
            return JSONResponse(status_code=400, content=MessageResponse(message="lessonKey is required").model_dump())
        if not normalized["selectedText"]:
            return JSONResponse(status_code=400, content=MessageResponse(message="selectedText is required").model_dump())

        if _is_json_progress_mode(settings.storage_mode):
            store_key = _highlight_store_key(normalized["profileName"], normalized["learnLanguage"])
            store = _HIGHLIGHTS_JSON_STORE.setdefault(store_key, {})
            saved = {key: value for key, value in normalized.items() if not key.startswith("_")}
            store[normalized["id"]] = saved
            return HighlightUpsertResponse(ok=True, highlight=HighlightRecord(**saved)).model_dump()

        saved = upsert_highlight_to_db(effective_payload, settings)
        return HighlightUpsertResponse(ok=True, highlight=HighlightRecord(**saved)).model_dump()
    except ProfileAuthorizationError as exc:
        return _profile_auth_error_response(exc)
    except ProfileAuthStorageUnavailable:
        logger.warning("Profile auth storage unavailable for highlight write")
        return JSONResponse(
            status_code=503,
            content=MessageResponse(
                message="Profile auth storage unavailable. Configure DATABASE_URL for PostgreSQL.",
            ).model_dump(),
        )
    except ActivityStorageUnavailable:
        logger.warning("Activity storage unavailable for highlight write")
        return JSONResponse(
            status_code=503,
            content=MessageResponse(message="Activity storage unavailable. Configure DATABASE_URL for PostgreSQL.").model_dump(),
        )
    except Exception:
        logger.exception("Failed to save highlight")
        return JSONResponse(
            status_code=503,
            content=MessageResponse(message="Activity storage unavailable. Configure DATABASE_URL for PostgreSQL.").model_dump(),
        )


@router.delete(
    "/highlights",
    response_model=OkResponse,
    responses={
        400: {"model": MessageResponse},
        401: {"model": MessageResponse},
        403: {"model": MessageResponse},
        429: {"model": MessageResponse},
        503: {"model": MessageResponse},
    },
)
def delete_highlight(
    profileName: str | None = Query(default=None),
    learnLanguage: str | None = Query(default=None),
    lessonKey: str | None = Query(default=None),
    x_profile_secret: str | None = Header(default=None, alias="X-Profile-Secret"),
    authorization: str | None = Header(default=None, alias="Authorization"),
):
    lesson_key = str(lessonKey or "").strip()
    if not lesson_key:
        return JSONResponse(status_code=400, content=MessageResponse(message="lessonKey is required").model_dump())

    try:
        settings = get_settings()
        profile_name = _resolve_profile_owner(
            profileName,
            x_profile_secret,
            authorization,
            settings,
            allow_create=False,
        )
        learn_language = normalize_activity_language(learnLanguage, settings)
        if _is_json_progress_mode(settings.storage_mode):
            store_key = _highlight_store_key(profile_name, learn_language)
            store = _HIGHLIGHTS_JSON_STORE.setdefault(store_key, {})
            for highlight_id, highlight in list(store.items()):
                if str(highlight.get("lessonKey", "")).strip() == lesson_key:
                    store.pop(highlight_id, None)
            return OkResponse(ok=True).model_dump()
        delete_highlight_from_db(profile_name, learn_language, lesson_key, settings)
        return OkResponse(ok=True).model_dump()
    except ProfileAuthorizationError as exc:
        return _profile_auth_error_response(exc)
    except ProfileAuthStorageUnavailable:
        logger.warning("Profile auth storage unavailable for highlight delete")
        return JSONResponse(
            status_code=503,
            content=MessageResponse(
                message="Profile auth storage unavailable. Configure DATABASE_URL for PostgreSQL.",
            ).model_dump(),
        )
    except ActivityStorageUnavailable:
        logger.warning("Activity storage unavailable for highlight delete")
        return JSONResponse(
            status_code=503,
            content=MessageResponse(message="Activity storage unavailable. Configure DATABASE_URL for PostgreSQL.").model_dump(),
        )
    except Exception:
        logger.exception("Failed to clear highlight")
        return JSONResponse(
            status_code=503,
            content=MessageResponse(message="Activity storage unavailable. Configure DATABASE_URL for PostgreSQL.").model_dump(),
        )


@router.post(
    "/review-events",
    response_model=OkResponse,
    responses={
        400: {"model": MessageResponse},
        401: {"model": MessageResponse},
        403: {"model": MessageResponse},
        429: {"model": MessageResponse},
        503: {"model": MessageResponse},
    },
)
def post_review_event(
    payload: dict,
    x_profile_secret: str | None = Header(default=None, alias="X-Profile-Secret"),
    authorization: str | None = Header(default=None, alias="Authorization"),
):
    try:
        settings = get_settings()
        profile_name = _resolve_profile_owner(
            payload.get("profileName"),
            x_profile_secret,
            authorization,
            settings,
            allow_create=True,
        )
        effective_payload = dict(payload)
        effective_payload["profileName"] = profile_name
        normalized = normalize_review_event_input(effective_payload, settings)
        if not normalized["profileName"]:
            return JSONResponse(status_code=400, content=MessageResponse(message="profileName is required").model_dump())
        if not normalized["eventType"]:
            return JSONResponse(status_code=400, content=MessageResponse(message="eventType is required").model_dump())

        if _is_json_progress_mode(settings.storage_mode):
            saved = {key: value for key, value in normalized.items() if not key.startswith("_")}
            _REVIEW_EVENTS_JSON_STORE.append(saved)
            return OkResponse(ok=True).model_dump()

        write_review_event_to_db(effective_payload, settings)
        return OkResponse(ok=True).model_dump()
    except ProfileAuthorizationError as exc:
        return _profile_auth_error_response(exc)
    except ProfileAuthStorageUnavailable:
        logger.warning("Profile auth storage unavailable for review event write")
        return JSONResponse(
            status_code=503,
            content=MessageResponse(
                message="Profile auth storage unavailable. Configure DATABASE_URL for PostgreSQL.",
            ).model_dump(),
        )
    except ActivityStorageUnavailable:
        logger.warning("Activity storage unavailable for review event write")
        return JSONResponse(
            status_code=503,
            content=MessageResponse(message="Activity storage unavailable. Configure DATABASE_URL for PostgreSQL.").model_dump(),
        )
    except Exception:
        logger.exception("Failed to write review event")
        return JSONResponse(
            status_code=503,
            content=MessageResponse(message="Activity storage unavailable. Configure DATABASE_URL for PostgreSQL.").model_dump(),
        )

