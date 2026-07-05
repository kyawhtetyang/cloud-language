from __future__ import annotations

import os
import sys
import unittest
from pathlib import Path


class ApiContractTest(unittest.TestCase):
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
        cls.client = TestClient(app)

    def test_health(self) -> None:
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertEqual(body.get("status"), "ok")
        self.assertIn("storageMode", body)

    def test_lessons_english(self) -> None:
        response = self.client.get("/api/lessons", params={"language": "english"})
        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertIsInstance(body, list)
        self.assertGreater(len(body), 0)
        row = body[0]
        for key in [
            "level",
            "unit",
            "topic",
            "english",
            "burmese",
            "pronunciation",
            "groupId",
            "unitId",
            "orderIndex",
            "framework",
            "frameworkLevel",
            "frameworkUnit",
            "contentType",
            "displayTitle",
            "displayMeta",
        ]:
            self.assertIn(key, row)
        self.assertIn(row.get("framework"), {"cefr", "hsk", "jlpt", "custom"})
        self.assertTrue(isinstance(row.get("frameworkLevel"), str) and bool(row["frameworkLevel"].strip()))
        self.assertTrue(isinstance(row.get("frameworkUnit"), int) and row["frameworkUnit"] >= 1)

    def test_lessons_hsk_load_without_audio_paths(self) -> None:
        response = self.client.get("/api/lessons", params={"language": "hsk1"})
        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertIsInstance(body, list)
        self.assertGreater(len(body), 0)
        self.assertTrue(all(row.get("audioPath") in {None, ""} for row in body))

    def test_lessons_support_source_filter(self) -> None:
        response = self.client.get(
            "/api/lessons",
            params={
                "language": "hsk2",
                "sourceLabel": "HSK 2 Story Job Seeking",
            },
        )
        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertIsInstance(body, list)
        self.assertGreater(len(body), 0)
        self.assertTrue(all(row.get("sourceLabel") == "HSK 2 Story Job Seeking" for row in body))

    def test_library_index_returns_grouped_metadata(self) -> None:
        response = self.client.get("/api/library", params={"language": "hsk_chinese"})
        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertIsInstance(body, list)
        self.assertGreater(len(body), 0)
        first_section = body[0]
        self.assertIn("key", first_section)
        self.assertIn("label", first_section)
        self.assertIn("groups", first_section)
        self.assertIsInstance(first_section["groups"], list)
        self.assertGreater(len(first_section["groups"]), 0)
        first_group = first_section["groups"][0]
        for key in [
            "key",
            "sourceLabel",
            "collectionLabel",
            "contentType",
            "displayTitle",
            "displayMeta",
            "levelScheme",
            "levelCode",
            "units",
        ]:
            self.assertIn(key, first_group)

    def test_get_progress_requires_profile_name(self) -> None:
        response = self.client.get("/api/progress")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json().get("message"), "profileName is required")

    def test_get_progress_requires_profile_secret_when_profile_name_present(self) -> None:
        response = self.client.get("/api/progress", params={"profileName": "tester"})
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json().get("message"), "X-Profile-Secret header is required")

    def test_put_progress_requires_profile_name(self) -> None:
        response = self.client.put("/api/progress", json={"currentIndex": 1})
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json().get("message"), "profileName is required")


if __name__ == "__main__":
    unittest.main()

