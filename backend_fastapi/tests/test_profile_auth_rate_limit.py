from __future__ import annotations

import os
import sys
import unittest
from pathlib import Path


class ProfileAuthRateLimitTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        backend_fastapi_root = Path(__file__).resolve().parents[1]
        if str(backend_fastapi_root) not in sys.path:
            sys.path.insert(0, str(backend_fastapi_root))

        os.environ.setdefault("STORAGE_MODE", "json")
        os.environ.setdefault("DEFAULT_LANGUAGE", "english")
        os.environ.setdefault("FRONTEND_ORIGIN", "http://localhost:3000")
        os.environ["PROFILE_AUTH_MAX_FAILURES"] = "2"
        os.environ["PROFILE_AUTH_WINDOW_SECONDS"] = "300"
        os.environ["PROFILE_AUTH_BLOCK_SECONDS"] = "900"

        try:
            from app.config import get_settings
            from app.main import app
            from app.services.profile_auth import reset_profile_auth_rate_limiter
            from fastapi.testclient import TestClient
        except (ModuleNotFoundError, RuntimeError) as exc:
            raise unittest.SkipTest(f"FastAPI test dependencies are not installed: {exc}") from exc

        get_settings.cache_clear()
        reset_profile_auth_rate_limiter()
        cls._reset_profile_auth_rate_limiter = reset_profile_auth_rate_limiter
        cls.client = TestClient(app)

    def setUp(self) -> None:
        self._reset_profile_auth_rate_limiter()

    def test_locks_profile_after_repeated_wrong_secret(self) -> None:
        profile_name = "rate-limit-user-one"
        good_secret = "good-secret-12345678901234567890"
        bad_secret = "bad-secret-12345678901234567890"

        create_response = self.client.put(
            "/api/progress",
            json={"profileName": profile_name, "currentIndex": 1},
            headers={"X-Profile-Secret": good_secret},
        )
        self.assertEqual(create_response.status_code, 200)

        wrong_response_one = self.client.get(
            "/api/progress",
            params={"profileName": profile_name},
            headers={"X-Profile-Secret": bad_secret},
        )
        self.assertEqual(wrong_response_one.status_code, 403)

        wrong_response_two = self.client.get(
            "/api/progress",
            params={"profileName": profile_name},
            headers={"X-Profile-Secret": bad_secret},
        )
        self.assertEqual(wrong_response_two.status_code, 429)
        self.assertIn("Retry-After", wrong_response_two.headers)

        blocked_valid_response = self.client.get(
            "/api/progress",
            params={"profileName": profile_name},
            headers={"X-Profile-Secret": good_secret},
        )
        self.assertEqual(blocked_valid_response.status_code, 429)

    def test_successful_auth_clears_failed_attempt_counter(self) -> None:
        profile_name = "rate-limit-user-two"
        good_secret = "good-secret-abcdef1234567890uvwxyz"
        bad_secret = "bad-secret-abcdef1234567890uvwxyz"

        create_response = self.client.put(
            "/api/progress",
            json={"profileName": profile_name, "currentIndex": 1},
            headers={"X-Profile-Secret": good_secret},
        )
        self.assertEqual(create_response.status_code, 200)

        wrong_response = self.client.get(
            "/api/progress",
            params={"profileName": profile_name},
            headers={"X-Profile-Secret": bad_secret},
        )
        self.assertEqual(wrong_response.status_code, 403)

        good_response = self.client.get(
            "/api/progress",
            params={"profileName": profile_name},
            headers={"X-Profile-Secret": good_secret},
        )
        self.assertEqual(good_response.status_code, 200)

        wrong_response_again = self.client.get(
            "/api/progress",
            params={"profileName": profile_name},
            headers={"X-Profile-Secret": bad_secret},
        )
        self.assertEqual(wrong_response_again.status_code, 403)


if __name__ == "__main__":
    unittest.main()

