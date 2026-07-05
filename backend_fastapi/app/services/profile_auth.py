from __future__ import annotations

import hashlib
import hmac
import time
from dataclasses import dataclass, field
from threading import Lock

from ..config import Settings


class ProfileAuthStorageUnavailable(Exception):
    pass


@dataclass
class _ProfileAuthAttemptState:
    failed_attempt_timestamps: list[float] = field(default_factory=list)
    blocked_until_timestamp: float = 0.0


_RATE_LIMIT_LOCK = Lock()
_RATE_LIMIT_BY_PROFILE: dict[str, _ProfileAuthAttemptState] = {}


def normalize_profile_secret(value: object) -> str:
    if not isinstance(value, str):
        return ""
    return value.strip()


def hash_profile_secret(secret: str, settings: Settings) -> str:
    pepper = str(settings.profile_secret_pepper or "")
    digest = hashlib.sha256(f"{pepper}:{secret}".encode("utf-8")).hexdigest()
    return digest


def profile_secret_matches(secret: str, secret_hash: str, settings: Settings) -> bool:
    if not secret or not secret_hash:
        return False
    return hmac.compare_digest(hash_profile_secret(secret, settings), secret_hash)


def _profile_auth_rate_limit_config(settings: Settings) -> tuple[int, int, int]:
    max_failures = max(1, int(getattr(settings, "profile_auth_max_failures", 8) or 8))
    window_seconds = max(30, int(getattr(settings, "profile_auth_window_seconds", 300) or 300))
    block_seconds = max(30, int(getattr(settings, "profile_auth_block_seconds", 900) or 900))
    return max_failures, window_seconds, block_seconds


def _prune_failed_attempts(state: _ProfileAuthAttemptState, now_timestamp: float, window_seconds: int) -> None:
    state.failed_attempt_timestamps = [
        timestamp for timestamp in state.failed_attempt_timestamps if (now_timestamp - timestamp) <= window_seconds
    ]


def get_profile_auth_lock_seconds(profile_name: str, settings: Settings) -> int:
    _, window_seconds, _ = _profile_auth_rate_limit_config(settings)
    now_timestamp = time.time()
    with _RATE_LIMIT_LOCK:
        state = _RATE_LIMIT_BY_PROFILE.get(profile_name)
        if state is None:
            return 0

        _prune_failed_attempts(state, now_timestamp, window_seconds)
        if state.blocked_until_timestamp <= now_timestamp:
            state.blocked_until_timestamp = 0.0
            if not state.failed_attempt_timestamps:
                _RATE_LIMIT_BY_PROFILE.pop(profile_name, None)
            return 0

        remaining = int(state.blocked_until_timestamp - now_timestamp)
        return max(1, remaining)


def record_profile_auth_failure(profile_name: str, settings: Settings) -> int:
    max_failures, window_seconds, block_seconds = _profile_auth_rate_limit_config(settings)
    now_timestamp = time.time()
    with _RATE_LIMIT_LOCK:
        state = _RATE_LIMIT_BY_PROFILE.setdefault(profile_name, _ProfileAuthAttemptState())
        _prune_failed_attempts(state, now_timestamp, window_seconds)
        state.failed_attempt_timestamps.append(now_timestamp)
        if len(state.failed_attempt_timestamps) >= max_failures:
            state.blocked_until_timestamp = max(state.blocked_until_timestamp, now_timestamp + block_seconds)
            return max(1, int(state.blocked_until_timestamp - now_timestamp))
        return 0


def clear_profile_auth_failures(profile_name: str) -> None:
    with _RATE_LIMIT_LOCK:
        _RATE_LIMIT_BY_PROFILE.pop(profile_name, None)


def reset_profile_auth_rate_limiter() -> None:
    with _RATE_LIMIT_LOCK:
        _RATE_LIMIT_BY_PROFILE.clear()


def _connect(settings: Settings):
    if not settings.database_url:
        raise ProfileAuthStorageUnavailable("DATABASE_URL is not configured.")
    try:
        import psycopg
        from psycopg.rows import dict_row
    except Exception as exc:
        raise ProfileAuthStorageUnavailable("psycopg is not available.") from exc

    sslmode = "require" if settings.pgssl else "prefer"
    return psycopg.connect(settings.database_url, row_factory=dict_row, sslmode=sslmode)


def ensure_profile_auth_table(settings: Settings) -> None:
    create_sql = """
    CREATE TABLE IF NOT EXISTS user_profile_auth (
      profile_name TEXT PRIMARY KEY,
      secret_hash TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
    """
    try:
        with _connect(settings) as conn:
            with conn.cursor() as cur:
                cur.execute(create_sql)
            conn.commit()
    except Exception as exc:
        raise ProfileAuthStorageUnavailable("Failed to initialize profile auth table.") from exc


def read_profile_secret_hash(profile_name: str, settings: Settings) -> str | None:
    ensure_profile_auth_table(settings)
    try:
        with _connect(settings) as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT secret_hash
                    FROM user_profile_auth
                    WHERE profile_name = %s
                    """,
                    (profile_name,),
                )
                row = cur.fetchone()
    except Exception as exc:
        raise ProfileAuthStorageUnavailable("Failed to read profile auth row.") from exc

    if not row:
        return None
    return str(row["secret_hash"] or "")


def upsert_profile_secret_hash(profile_name: str, secret_hash: str, settings: Settings) -> None:
    ensure_profile_auth_table(settings)
    try:
        with _connect(settings) as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO user_profile_auth (
                      profile_name,
                      secret_hash,
                      updated_at
                    )
                    VALUES (%s, %s, NOW())
                    ON CONFLICT (profile_name)
                    DO UPDATE SET
                      secret_hash = EXCLUDED.secret_hash,
                      updated_at = NOW()
                    """,
                    (profile_name, secret_hash),
                )
            conn.commit()
    except Exception as exc:
        raise ProfileAuthStorageUnavailable("Failed to write profile auth row.") from exc

