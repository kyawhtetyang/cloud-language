from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
import sys
import time
import unittest
from pathlib import Path


def _base64url_encode(payload: bytes) -> str:
    return base64.urlsafe_b64encode(payload).decode("utf-8").rstrip("=")


def _build_hs256_jwt(secret: str, claims: dict[str, object]) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    header_raw = _base64url_encode(json.dumps(header, separators=(",", ":")).encode("utf-8"))
    payload_raw = _base64url_encode(json.dumps(claims, separators=(",", ":")).encode("utf-8"))
    signing_input = f"{header_raw}.{payload_raw}".encode("utf-8")
    signature = hmac.new(secret.encode("utf-8"), signing_input, hashlib.sha256).digest()
    signature_raw = _base64url_encode(signature)
    return f"{header_raw}.{payload_raw}.{signature_raw}"


class ProfileOwnerResolutionTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        backend_fastapi_root = Path(__file__).resolve().parents[1]
        if str(backend_fastapi_root) not in sys.path:
            sys.path.insert(0, str(backend_fastapi_root))

        os.environ["STORAGE_MODE"] = "json"
        os.environ["SUPABASE_URL"] = "https://project-ref.supabase.co"
        os.environ["SUPABASE_JWT_SECRET"] = "test-supabase-secret"
        os.environ["SUPABASE_JWT_ISSUER"] = "https://project-ref.supabase.co/auth/v1"
        os.environ["SUPABASE_JWT_AUDIENCE"] = "authenticated"

        from app.config import get_settings
        from app.api import _PROFILE_SECRET_JSON_STORE, _resolve_profile_owner

        get_settings.cache_clear()
        cls.settings = get_settings()
        cls.resolve_profile_owner = staticmethod(_resolve_profile_owner)
        cls.profile_secret_store = _PROFILE_SECRET_JSON_STORE

    def setUp(self) -> None:
        self.profile_secret_store.clear()

    def test_bearer_uses_supabase_user_id_as_owner(self) -> None:
        token = _build_hs256_jwt(
            "test-supabase-secret",
            {
                "sub": "user-abc",
                "iss": "https://project-ref.supabase.co/auth/v1",
                "aud": "authenticated",
                "exp": int(time.time()) + 300,
            },
        )
        owner = self.resolve_profile_owner(
            "",
            None,
            f"Bearer {token}",
            self.settings,
            allow_create=True,
        )
        self.assertEqual(owner, "supabase:user-abc")

    def test_legacy_secret_path_still_requires_profile_name(self) -> None:
        from app.api import ProfileAuthorizationError

        with self.assertRaises(ProfileAuthorizationError):
            self.resolve_profile_owner(
                "",
                "legacy-secret-12345678901234567890",
                None,
                self.settings,
                allow_create=True,
            )


if __name__ == "__main__":
    unittest.main()

