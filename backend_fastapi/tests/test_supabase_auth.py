from __future__ import annotations

import base64
import hashlib
import hmac
import io
import json
import os
import sys
import time
import unittest
from pathlib import Path
from unittest.mock import patch


def _base64url_encode(payload: bytes) -> str:
    return base64.urlsafe_b64encode(payload).decode("utf-8").rstrip("=")


def _build_hs256_jwt(secret: str, claims: dict[str, object], *, algorithm: str = "HS256") -> str:
    header = {"alg": algorithm, "typ": "JWT"}
    header_raw = _base64url_encode(json.dumps(header, separators=(",", ":")).encode("utf-8"))
    payload_raw = _base64url_encode(json.dumps(claims, separators=(",", ":")).encode("utf-8"))
    signing_input = f"{header_raw}.{payload_raw}".encode("utf-8")
    signature = hmac.new(secret.encode("utf-8"), signing_input, hashlib.sha256).digest()
    signature_raw = _base64url_encode(signature)
    return f"{header_raw}.{payload_raw}.{signature_raw}"


class SupabaseAuthTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        backend_fastapi_root = Path(__file__).resolve().parents[1]
        if str(backend_fastapi_root) not in sys.path:
            sys.path.insert(0, str(backend_fastapi_root))

        os.environ["SUPABASE_URL"] = "https://project-ref.supabase.co"
        os.environ["SUPABASE_ANON_KEY"] = "test-anon-key"
        os.environ["SUPABASE_JWT_SECRET"] = "test-supabase-secret"
        os.environ["SUPABASE_JWT_ISSUER"] = "https://project-ref.supabase.co/auth/v1"
        os.environ["SUPABASE_JWT_AUDIENCE"] = "authenticated"

        from app.config import get_settings
        from app.services.supabase_auth import SupabaseAuthorizationError
        from app.services.supabase_auth import authenticate_supabase_bearer

        get_settings.cache_clear()
        cls.settings = get_settings()
        cls.SupabaseAuthorizationError = SupabaseAuthorizationError
        cls.authenticate_supabase_bearer = staticmethod(authenticate_supabase_bearer)

    def test_returns_none_without_bearer_header(self) -> None:
        identity = self.authenticate_supabase_bearer(None, self.settings)
        self.assertIsNone(identity)

    def test_accepts_valid_hs256_token(self) -> None:
        now = int(time.time())
        token = _build_hs256_jwt(
            "test-supabase-secret",
            {
                "sub": "user-123",
                "email": "user@example.com",
                "iss": "https://project-ref.supabase.co/auth/v1",
                "aud": "authenticated",
                "exp": now + 300,
            },
        )
        identity = self.authenticate_supabase_bearer(f"Bearer {token}", self.settings)
        self.assertIsNotNone(identity)
        assert identity is not None
        self.assertEqual(identity.user_id, "user-123")
        self.assertEqual(identity.email, "user@example.com")

    def test_rejects_bad_signature(self) -> None:
        now = int(time.time())
        token = _build_hs256_jwt(
            "wrong-secret",
            {
                "sub": "user-123",
                "iss": "https://project-ref.supabase.co/auth/v1",
                "aud": "authenticated",
                "exp": now + 300,
            },
        )
        with self.assertRaisesRegex(self.SupabaseAuthorizationError, "Invalid bearer token signature"):
            self.authenticate_supabase_bearer(f"Bearer {token}", self.settings)

    def test_rejects_expired_token(self) -> None:
        now = int(time.time())
        token = _build_hs256_jwt(
            "test-supabase-secret",
            {
                "sub": "user-123",
                "iss": "https://project-ref.supabase.co/auth/v1",
                "aud": "authenticated",
                "exp": now - 1,
            },
        )
        with self.assertRaisesRegex(self.SupabaseAuthorizationError, "Bearer token has expired"):
            self.authenticate_supabase_bearer(f"Bearer {token}", self.settings)

    def test_accepts_es256_token_via_supabase_user_endpoint(self) -> None:
        now = int(time.time())
        token = _build_hs256_jwt(
            "test-supabase-secret",
            {
                "sub": "user-123",
                "iss": "https://project-ref.supabase.co/auth/v1",
                "aud": "authenticated",
                "exp": now + 300,
            },
            algorithm="ES256",
        )

        class _Response:
            def __init__(self, body: str) -> None:
                self._body = body.encode("utf-8")

            def __enter__(self):
                return self

            def __exit__(self, exc_type, exc, tb) -> None:
                return None

            def read(self) -> bytes:
                return self._body

        with patch(
            "urllib.request.urlopen",
            return_value=_Response(json.dumps({"id": "supabase-user", "email": "es256@example.com"})),
        ) as mocked_urlopen:
            identity = self.authenticate_supabase_bearer(f"Bearer {token}", self.settings)

        self.assertIsNotNone(identity)
        assert identity is not None
        self.assertEqual(identity.user_id, "supabase-user")
        self.assertEqual(identity.email, "es256@example.com")
        self.assertEqual(mocked_urlopen.call_count, 1)

    def test_rejects_es256_token_when_supabase_user_endpoint_rejects_it(self) -> None:
        now = int(time.time())
        token = _build_hs256_jwt(
            "test-supabase-secret",
            {
                "sub": "user-123",
                "iss": "https://project-ref.supabase.co/auth/v1",
                "aud": "authenticated",
                "exp": now + 300,
            },
            algorithm="ES256",
        )

        from urllib.error import HTTPError

        with patch(
            "urllib.request.urlopen",
            side_effect=HTTPError(
                url="https://project-ref.supabase.co/auth/v1/user",
                code=401,
                msg="Unauthorized",
                hdrs=None,
                fp=io.BytesIO(b'{"message":"invalid token"}'),
            ),
        ):
            with self.assertRaisesRegex(self.SupabaseAuthorizationError, "Invalid bearer token signature"):
                self.authenticate_supabase_bearer(f"Bearer {token}", self.settings)


if __name__ == "__main__":
    unittest.main()

