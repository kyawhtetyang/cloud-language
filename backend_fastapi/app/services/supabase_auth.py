from __future__ import annotations

import base64
import hashlib
import hmac
import json
import time
import urllib.error
import urllib.request
from dataclasses import dataclass
from typing import Any

from ..config import Settings


class SupabaseAuthorizationError(Exception):
    def __init__(self, status_code: int, message: str) -> None:
        super().__init__(message)
        self.status_code = status_code
        self.message = message


@dataclass(frozen=True)
class SupabaseIdentity:
    user_id: str
    email: str | None
    claims: dict[str, Any]


def _base64url_decode(value: str) -> bytes:
    normalized = value.strip().encode("utf-8")
    padding = b"=" * ((4 - (len(normalized) % 4)) % 4)
    return base64.urlsafe_b64decode(normalized + padding)


def _json_decode(value: str) -> dict[str, Any]:
    try:
        parsed = json.loads(value)
    except json.JSONDecodeError as exc:
        raise SupabaseAuthorizationError(401, "Invalid bearer token payload") from exc
    if not isinstance(parsed, dict):
        raise SupabaseAuthorizationError(401, "Invalid bearer token payload")
    return parsed


def _extract_bearer_token(authorization_header: str | None) -> str | None:
    if not isinstance(authorization_header, str):
        return None
    raw = authorization_header.strip()
    if not raw:
        return None
    if not raw.lower().startswith("bearer "):
        raise SupabaseAuthorizationError(401, "Authorization header must use Bearer token")
    token = raw[7:].strip()
    if not token:
        raise SupabaseAuthorizationError(401, "Bearer token is required")
    return token


def _decode_jwt(token: str) -> tuple[dict[str, Any], dict[str, Any], bytes, bytes]:
    parts = token.split(".")
    if len(parts) != 3:
        raise SupabaseAuthorizationError(401, "Invalid bearer token format")

    header_raw, payload_raw, signature_raw = parts
    try:
        header_bytes = _base64url_decode(header_raw)
        payload_bytes = _base64url_decode(payload_raw)
        signature = _base64url_decode(signature_raw)
    except Exception as exc:
        raise SupabaseAuthorizationError(401, "Invalid bearer token encoding") from exc

    header = _json_decode(header_bytes.decode("utf-8"))
    payload = _json_decode(payload_bytes.decode("utf-8"))
    signing_input = f"{header_raw}.{payload_raw}".encode("utf-8")
    return header, payload, signature, signing_input


def _validate_time_claims(payload: dict[str, Any], now_timestamp: int) -> None:
    exp = payload.get("exp")
    if isinstance(exp, (int, float)) and now_timestamp >= int(exp):
        raise SupabaseAuthorizationError(401, "Bearer token has expired")

    nbf = payload.get("nbf")
    if isinstance(nbf, (int, float)) and now_timestamp < int(nbf):
        raise SupabaseAuthorizationError(401, "Bearer token is not active yet")


def _validate_issuer(payload: dict[str, Any], settings: Settings) -> None:
    expected_issuer = str(getattr(settings, "supabase_jwt_issuer", "") or "").strip()
    if not expected_issuer:
        return
    actual_issuer = str(payload.get("iss") or "").strip()
    if actual_issuer != expected_issuer:
        raise SupabaseAuthorizationError(401, "Bearer token issuer mismatch")


def _validate_audience(payload: dict[str, Any], settings: Settings) -> None:
    expected_audience = str(getattr(settings, "supabase_jwt_audience", "") or "").strip()
    if not expected_audience:
        return

    audience_claim = payload.get("aud")
    if isinstance(audience_claim, str):
        if audience_claim != expected_audience:
            raise SupabaseAuthorizationError(401, "Bearer token audience mismatch")
        return
    if isinstance(audience_claim, list):
        normalized = {str(value).strip() for value in audience_claim}
        if expected_audience not in normalized:
            raise SupabaseAuthorizationError(401, "Bearer token audience mismatch")
        return
    raise SupabaseAuthorizationError(401, "Bearer token audience mismatch")


def _authenticate_supabase_via_user_endpoint(token: str, settings: Settings) -> SupabaseIdentity:
    supabase_url = str(getattr(settings, "supabase_url", "") or "").strip().rstrip("/")
    supabase_anon_key = str(getattr(settings, "supabase_anon_key", "") or "").strip()
    if not supabase_url or not supabase_anon_key:
        raise SupabaseAuthorizationError(503, "Supabase JWT verification is not configured")

    user_endpoint = f"{supabase_url}/auth/v1/user"
    request = urllib.request.Request(
        user_endpoint,
        method="GET",
        headers={
            "apikey": supabase_anon_key,
            "Authorization": f"Bearer {token}",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=10) as response:
            body = response.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as exc:
        if exc.code in (401, 403):
            raise SupabaseAuthorizationError(401, "Invalid bearer token signature") from exc
        raise SupabaseAuthorizationError(503, "Supabase auth service unavailable") from exc
    except Exception as exc:
        raise SupabaseAuthorizationError(503, "Supabase auth service unavailable") from exc

    user_payload = _json_decode(body)
    user_id = str(user_payload.get("id") or user_payload.get("sub") or "").strip()
    if not user_id:
        raise SupabaseAuthorizationError(401, "Bearer token subject is missing")

    email = user_payload.get("email")
    normalized_email = str(email).strip() if isinstance(email, str) and email.strip() else None
    return SupabaseIdentity(user_id=user_id, email=normalized_email, claims=user_payload)


def authenticate_supabase_bearer(authorization_header: str | None, settings: Settings) -> SupabaseIdentity | None:
    token = _extract_bearer_token(authorization_header)
    if token is None:
        return None

    header, payload, signature, signing_input = _decode_jwt(token)
    algorithm = str(header.get("alg") or "").strip().upper()
    jwt_secret = str(getattr(settings, "supabase_jwt_secret", "") or "").strip()
    if algorithm != "HS256" or not jwt_secret:
        # Supabase commonly issues asymmetric tokens (for example ES256).
        # Validate those via Supabase Auth user endpoint.
        return _authenticate_supabase_via_user_endpoint(token, settings)

    expected_signature = hmac.new(jwt_secret.encode("utf-8"), signing_input, hashlib.sha256).digest()
    if not hmac.compare_digest(expected_signature, signature):
        raise SupabaseAuthorizationError(401, "Invalid bearer token signature")

    now_timestamp = int(time.time())
    _validate_time_claims(payload, now_timestamp)
    _validate_issuer(payload, settings)
    _validate_audience(payload, settings)

    user_id = str(payload.get("sub") or "").strip()
    if not user_id:
        raise SupabaseAuthorizationError(401, "Bearer token subject is missing")

    email = payload.get("email")
    normalized_email = str(email).strip() if isinstance(email, str) and email.strip() else None
    return SupabaseIdentity(user_id=user_id, email=normalized_email, claims=payload)

