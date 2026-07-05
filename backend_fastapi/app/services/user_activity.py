from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from typing import Any

from ..config import Settings
from .lessons import get_supported_languages, normalize_language
from .progress import normalize_profile_name


class ActivityStorageUnavailable(Exception):
    pass


def _normalize_text(value: Any, *, max_length: int, allow_empty: bool = False) -> str:
    if not isinstance(value, str):
        return "" if allow_empty else ""
    collapsed = " ".join(value.split()).strip()
    if not collapsed:
        return "" if allow_empty else ""
    return collapsed[:max_length]


def _normalize_timestamp(value: Any) -> datetime:
    if isinstance(value, datetime):
        if value.tzinfo is None:
            return value.replace(tzinfo=timezone.utc)
        return value.astimezone(timezone.utc)
    if isinstance(value, str):
        raw = value.strip()
        if raw:
            normalized = raw.replace("Z", "+00:00")
            try:
                parsed = datetime.fromisoformat(normalized)
                if parsed.tzinfo is None:
                    parsed = parsed.replace(tzinfo=timezone.utc)
                return parsed.astimezone(timezone.utc)
            except ValueError:
                pass
    return datetime.now(timezone.utc)


def _to_iso_utc(value: Any) -> str:
    normalized = _normalize_timestamp(value)
    return normalized.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")


def normalize_activity_language(value: Any, settings: Settings) -> str:
    try:
        supported_languages = get_supported_languages(settings.default_language, settings)
    except Exception:
        supported_languages = {settings.default_language}
    return normalize_language(value, settings.default_language, supported_languages)


def _build_highlight_id(profile_name: str, learn_language: str, lesson_key: str, selected_text: str) -> str:
    seed = f"{profile_name}\n{learn_language}\n{lesson_key}\n{selected_text}".encode("utf-8")
    digest = hashlib.sha1(seed).hexdigest()[:20]
    return f"{profile_name}:{learn_language}:{lesson_key}:{digest}"


def normalize_highlight_input(payload: dict[str, Any], settings: Settings) -> dict[str, Any]:
    profile_name = normalize_profile_name(payload.get("profileName"))
    learn_language = normalize_activity_language(payload.get("learnLanguage"), settings)
    lesson_key = _normalize_text(payload.get("lessonKey"), max_length=1024, allow_empty=True)
    lesson_text = _normalize_text(payload.get("lessonText"), max_length=2000, allow_empty=True)
    selected_text = _normalize_text(payload.get("selectedText"), max_length=1000, allow_empty=True)
    created_at = _normalize_timestamp(payload.get("createdAt") or payload.get("clientCreatedAt"))

    return {
        "id": _build_highlight_id(profile_name, learn_language, lesson_key, selected_text),
        "profileName": profile_name,
        "learnLanguage": learn_language,
        "lessonKey": lesson_key,
        "lessonText": lesson_text,
        "selectedText": selected_text,
        "createdAt": _to_iso_utc(created_at),
        "_createdAtDt": created_at,
    }


def normalize_review_event_input(payload: dict[str, Any], settings: Settings) -> dict[str, Any]:
    profile_name = normalize_profile_name(payload.get("profileName"))
    event_type = _normalize_text(payload.get("eventType"), max_length=80, allow_empty=True).lower().replace(" ", "_")
    learn_language = normalize_activity_language(payload.get("learnLanguage"), settings)
    lesson_key = _normalize_text(payload.get("lessonKey"), max_length=1024, allow_empty=True) or None
    sentence_text = _normalize_text(payload.get("sentenceText"), max_length=2000, allow_empty=True) or None
    metadata_raw = payload.get("metadata")
    metadata = metadata_raw if isinstance(metadata_raw, dict) else {}
    created_at = _normalize_timestamp(payload.get("createdAt") or payload.get("clientCreatedAt"))

    return {
        "profileName": profile_name,
        "eventType": event_type,
        "learnLanguage": learn_language,
        "lessonKey": lesson_key,
        "sentenceText": sentence_text,
        "metadata": metadata,
        "createdAt": _to_iso_utc(created_at),
        "_createdAtDt": created_at,
    }


def _connect(settings: Settings):
    if not settings.database_url:
        raise ActivityStorageUnavailable("DATABASE_URL is not configured.")
    try:
        import psycopg
        from psycopg.rows import dict_row
    except Exception as exc:
        raise ActivityStorageUnavailable("psycopg is not available.") from exc

    sslmode = "require" if settings.pgssl else "prefer"
    return psycopg.connect(settings.database_url, row_factory=dict_row, sslmode=sslmode)


def ensure_activity_tables(settings: Settings) -> None:
    create_highlights_sql = """
    CREATE TABLE IF NOT EXISTS user_highlights (
      profile_name TEXT NOT NULL,
      learn_language TEXT NOT NULL,
      lesson_key TEXT NOT NULL,
      lesson_text TEXT NOT NULL,
      selected_text TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (profile_name, learn_language, lesson_key, selected_text)
    )
    """
    migrate_highlights_pk_sql = """
    DO $$
    DECLARE
      pk_columns TEXT[];
    BEGIN
      SELECT array_agg(kcu.column_name ORDER BY kcu.ordinal_position)
      INTO pk_columns
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
       AND tc.constraint_schema = kcu.constraint_schema
      WHERE tc.table_schema = current_schema()
        AND tc.table_name = 'user_highlights'
        AND tc.constraint_type = 'PRIMARY KEY'
      GROUP BY tc.constraint_name;

      IF pk_columns = ARRAY['profile_name', 'learn_language', 'lesson_key'] THEN
        ALTER TABLE user_highlights DROP CONSTRAINT IF EXISTS user_highlights_pkey;
        ALTER TABLE user_highlights
          ADD PRIMARY KEY (profile_name, learn_language, lesson_key, selected_text);
      END IF;
    END $$;
    """
    create_highlights_index_sql = """
    CREATE INDEX IF NOT EXISTS user_highlights_profile_created_idx
    ON user_highlights (profile_name, created_at DESC)
    """
    create_events_sql = """
    CREATE TABLE IF NOT EXISTS user_review_events (
      id BIGSERIAL PRIMARY KEY,
      profile_name TEXT NOT NULL,
      event_type TEXT NOT NULL,
      learn_language TEXT NOT NULL,
      lesson_key TEXT NULL,
      sentence_text TEXT NULL,
      metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
    """
    create_events_index_sql = """
    CREATE INDEX IF NOT EXISTS user_review_events_profile_created_idx
    ON user_review_events (profile_name, created_at DESC)
    """

    try:
        with _connect(settings) as conn:
            with conn.cursor() as cur:
                cur.execute(create_highlights_sql)
                cur.execute(migrate_highlights_pk_sql)
                cur.execute(create_highlights_index_sql)
                cur.execute(create_events_sql)
                cur.execute(create_events_index_sql)
            conn.commit()
    except Exception as exc:
        raise ActivityStorageUnavailable("Failed to initialize activity tables.") from exc


def read_highlights_from_db(profile_name: str, learn_language: str, settings: Settings) -> list[dict[str, Any]]:
    ensure_activity_tables(settings)
    try:
        with _connect(settings) as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT profile_name, learn_language, lesson_key, lesson_text, selected_text, created_at
                    FROM user_highlights
                    WHERE profile_name = %s AND learn_language = %s
                    ORDER BY created_at DESC
                    """,
                    (profile_name, learn_language),
                )
                rows = cur.fetchall()
    except Exception as exc:
        raise ActivityStorageUnavailable("Failed to read highlights.") from exc

    highlights: list[dict[str, Any]] = []
    for row in rows:
        lesson_key = row["lesson_key"]
        selected_text = row["selected_text"]
        highlights.append(
            {
                "id": _build_highlight_id(row["profile_name"], row["learn_language"], lesson_key, selected_text),
                "profileName": row["profile_name"],
                "learnLanguage": row["learn_language"],
                "lessonKey": lesson_key,
                "lessonText": row["lesson_text"],
                "selectedText": selected_text,
                "createdAt": _to_iso_utc(row["created_at"]),
            },
        )
    return highlights


def upsert_highlight_to_db(payload: dict[str, Any], settings: Settings) -> dict[str, Any]:
    ensure_activity_tables(settings)
    normalized = normalize_highlight_input(payload, settings)
    try:
        with _connect(settings) as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO user_highlights (
                      profile_name,
                      learn_language,
                      lesson_key,
                      lesson_text,
                      selected_text,
                      created_at
                    )
                    VALUES (%s, %s, %s, %s, %s, %s)
                    ON CONFLICT (profile_name, learn_language, lesson_key, selected_text)
                    DO UPDATE SET
                      lesson_text = EXCLUDED.lesson_text,
                      created_at = EXCLUDED.created_at
                    RETURNING profile_name, learn_language, lesson_key, lesson_text, selected_text, created_at
                    """,
                    (
                        normalized["profileName"],
                        normalized["learnLanguage"],
                        normalized["lessonKey"],
                        normalized["lessonText"],
                        normalized["selectedText"],
                        normalized["_createdAtDt"],
                    ),
                )
                saved = cur.fetchone()
            conn.commit()
    except Exception as exc:
        raise ActivityStorageUnavailable("Failed to save highlight.") from exc

    lesson_key = saved["lesson_key"]
    selected_text = saved["selected_text"]
    return {
        "id": _build_highlight_id(saved["profile_name"], saved["learn_language"], lesson_key, selected_text),
        "profileName": saved["profile_name"],
        "learnLanguage": saved["learn_language"],
        "lessonKey": lesson_key,
        "lessonText": saved["lesson_text"],
        "selectedText": selected_text,
        "createdAt": _to_iso_utc(saved["created_at"]),
    }


def delete_highlight_from_db(profile_name: str, learn_language: str, lesson_key: str, settings: Settings) -> None:
    ensure_activity_tables(settings)
    try:
        with _connect(settings) as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    DELETE FROM user_highlights
                    WHERE profile_name = %s AND learn_language = %s AND lesson_key = %s
                    """,
                    (profile_name, learn_language, lesson_key),
                )
            conn.commit()
    except Exception as exc:
        raise ActivityStorageUnavailable("Failed to clear highlight.") from exc


def write_review_event_to_db(payload: dict[str, Any], settings: Settings) -> None:
    ensure_activity_tables(settings)
    normalized = normalize_review_event_input(payload, settings)
    metadata_json = json.dumps(normalized["metadata"], ensure_ascii=False)
    try:
        with _connect(settings) as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO user_review_events (
                      profile_name,
                      event_type,
                      learn_language,
                      lesson_key,
                      sentence_text,
                      metadata,
                      created_at
                    )
                    VALUES (%s, %s, %s, %s, %s, %s::jsonb, %s)
                    """,
                    (
                        normalized["profileName"],
                        normalized["eventType"],
                        normalized["learnLanguage"],
                        normalized["lessonKey"],
                        normalized["sentenceText"],
                        metadata_json,
                        normalized["_createdAtDt"],
                    ),
                )
            conn.commit()
    except Exception as exc:
        raise ActivityStorageUnavailable("Failed to write review event.") from exc

