from __future__ import annotations

import os
import sys
import unittest
from pathlib import Path


class UserActivityApiTest(unittest.TestCase):
    PROFILE_SECRET = "test-profile-secret-1234567890"

    @classmethod
    def setUpClass(cls) -> None:
        backend_fastapi_root = Path(__file__).resolve().parents[1]
        if str(backend_fastapi_root) not in sys.path:
            sys.path.insert(0, str(backend_fastapi_root))

        os.environ.setdefault("STORAGE_MODE", "json")
        os.environ.setdefault("DEFAULT_LANGUAGE", "english")
        os.environ.setdefault("FRONTEND_ORIGIN", "http://localhost:3000")
        os.environ.setdefault("PROFILE_AUTH_MAX_FAILURES", "8")
        os.environ.setdefault("PROFILE_AUTH_WINDOW_SECONDS", "300")
        os.environ.setdefault("PROFILE_AUTH_BLOCK_SECONDS", "900")

        try:
            from app.config import get_settings
            from fastapi.testclient import TestClient
            from app.main import app
            from app.services.profile_auth import reset_profile_auth_rate_limiter
        except (ModuleNotFoundError, RuntimeError) as exc:
            raise unittest.SkipTest(f"FastAPI test dependencies are not installed: {exc}") from exc

        get_settings.cache_clear()
        reset_profile_auth_rate_limiter()
        cls._reset_profile_auth_rate_limiter = reset_profile_auth_rate_limiter
        cls.client = TestClient(app)

    def setUp(self) -> None:
        self._reset_profile_auth_rate_limiter()

    def test_highlight_crud_flow(self) -> None:
        profile_name = "activity-tester"
        learn_language = "english"
        lesson_key = "1|1|Greeting|မင်္ဂလာပါ"

        put_response_one = self.client.put(
            "/api/highlights",
            json={
                "profileName": profile_name,
                "learnLanguage": learn_language,
                "lessonKey": lesson_key,
                "lessonText": "Hello there",
                "selectedText": "Hello",
                "createdAt": "2026-02-28T00:00:00Z",
            },
            headers={"X-Profile-Secret": self.PROFILE_SECRET},
        )
        self.assertEqual(put_response_one.status_code, 200)
        put_body_one = put_response_one.json()
        self.assertTrue(put_body_one.get("ok"))
        self.assertEqual(put_body_one.get("highlight", {}).get("lessonKey"), lesson_key)

        put_response_two = self.client.put(
            "/api/highlights",
            json={
                "profileName": profile_name,
                "learnLanguage": learn_language,
                "lessonKey": lesson_key,
                "lessonText": "Hello there",
                "selectedText": "there",
                "createdAt": "2026-02-28T00:00:01Z",
            },
            headers={"X-Profile-Secret": self.PROFILE_SECRET},
        )
        self.assertEqual(put_response_two.status_code, 200)
        put_body_two = put_response_two.json()
        self.assertTrue(put_body_two.get("ok"))
        self.assertEqual(put_body_two.get("highlight", {}).get("lessonKey"), lesson_key)

        get_response = self.client.get(
            "/api/highlights",
            params={
                "profileName": profile_name,
                "learnLanguage": learn_language,
            },
            headers={"X-Profile-Secret": self.PROFILE_SECRET},
        )
        self.assertEqual(get_response.status_code, 200)
        get_body = get_response.json()
        self.assertIsInstance(get_body, list)
        self.assertEqual(len(get_body), 2)
        self.assertEqual({row.get("selectedText") for row in get_body}, {"Hello", "there"})

        delete_response = self.client.delete(
            "/api/highlights",
            params={
                "profileName": profile_name,
                "learnLanguage": learn_language,
                "lessonKey": lesson_key,
            },
            headers={"X-Profile-Secret": self.PROFILE_SECRET},
        )
        self.assertEqual(delete_response.status_code, 200)
        self.assertTrue(delete_response.json().get("ok"))

        get_after_delete = self.client.get(
            "/api/highlights",
            params={
                "profileName": profile_name,
                "learnLanguage": learn_language,
            },
            headers={"X-Profile-Secret": self.PROFILE_SECRET},
        )
        self.assertEqual(get_after_delete.status_code, 200)
        self.assertEqual(get_after_delete.json(), [])

    def test_review_event_requires_event_type(self) -> None:
        response = self.client.post(
            "/api/review-events",
            json={
                "profileName": "activity-tester",
            },
            headers={"X-Profile-Secret": self.PROFILE_SECRET},
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json().get("message"), "eventType is required")

    def test_review_event_accepts_valid_payload(self) -> None:
        response = self.client.post(
            "/api/review-events",
            json={
                "profileName": "activity-tester",
                "eventType": "sentence_play",
                "learnLanguage": "english",
                "lessonKey": "1|1|Greeting|မင်္ဂလာပါ",
                "sentenceText": "Hello there",
                "metadata": {"source": "lesson"},
            },
            headers={"X-Profile-Secret": self.PROFILE_SECRET},
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json().get("ok"))


if __name__ == "__main__":
    unittest.main()

