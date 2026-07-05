from __future__ import annotations

import unittest

from app.services.progress import normalize_progress_input


class DummySettings:
    default_language = "english"
    text_scale_percent_min = 90
    text_scale_percent_max = 120


class ProgressNormalizationTest(unittest.TestCase):
    def test_accepts_vietnamese_default_language(self) -> None:
        payload = {
            "defaultLanguage": "vietnamese",
            "learnLanguage": "english",
            "textScalePercent": 100,
        }

        normalized = normalize_progress_input(payload, DummySettings())
        self.assertEqual(normalized["defaultLanguage"], "vietnamese")

    def test_falls_back_for_unknown_default_language(self) -> None:
        payload = {
            "defaultLanguage": "french",
            "learnLanguage": "english",
            "textScalePercent": 100,
        }

        normalized = normalize_progress_input(payload, DummySettings())
        self.assertEqual(normalized["defaultLanguage"], "burmese")

    def test_accepts_valid_ui_lock_language(self) -> None:
        payload = {
            "uiLockLanguage": "thai",
            "learnLanguage": "english",
            "textScalePercent": 100,
        }

        normalized = normalize_progress_input(payload, DummySettings())
        self.assertEqual(normalized["uiLockLanguage"], "thai")

    def test_falls_back_for_unknown_ui_lock_language(self) -> None:
        payload = {
            "uiLockLanguage": "french",
            "learnLanguage": "english",
            "textScalePercent": 100,
        }

        normalized = normalize_progress_input(payload, DummySettings())
        self.assertEqual(normalized["uiLockLanguage"], "english")

    def test_keeps_learning_language_visible_when_pronunciation_is_off(self) -> None:
        payload = {
            "isPronunciationEnabled": False,
            "isLearningLanguageVisible": False,
            "learnLanguage": "english",
            "textScalePercent": 100,
        }

        normalized = normalize_progress_input(payload, DummySettings())
        self.assertFalse(normalized["isPronunciationEnabled"])
        self.assertTrue(normalized["isLearningLanguageVisible"])

    def test_maps_google_voice_provider_to_apple_siri(self) -> None:
        payload = {
            "voiceProvider": "google",
            "learnLanguage": "english",
            "textScalePercent": 100,
        }

        normalized = normalize_progress_input(payload, DummySettings())
        self.assertEqual(normalized["voiceProvider"], "apple_siri")

    def test_resolves_default_learn_language_conflict(self) -> None:
        payload = {
            "defaultLanguage": "english",
            "learnLanguage": "english",
            "textScalePercent": 100,
        }

        normalized = normalize_progress_input(payload, DummySettings())
        self.assertEqual(normalized["defaultLanguage"], "english")
        self.assertNotEqual(normalized["learnLanguage"], "english")

    def test_keeps_framework_valid_after_language_normalization(self) -> None:
        payload = {
            "defaultLanguage": "english",
            "learnLanguage": "english",
            "courseFramework": "hsk",
            "textScalePercent": 100,
        }

        normalized = normalize_progress_input(payload, DummySettings())
        self.assertIn(normalized["courseFramework"], {"cefr", "hsk"})


if __name__ == "__main__":
    unittest.main()

