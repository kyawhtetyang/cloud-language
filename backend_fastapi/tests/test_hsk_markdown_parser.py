from __future__ import annotations

import unittest

from app.services.lessons import parse_standard_markdown_lessons


class HskMarkdownParserTest(unittest.TestCase):
    def test_keeps_legacy_three_line_hsk_blocks_with_standard_parser(self) -> None:
        raw = """
## 1.1 Greetings
Nǐ hǎo ma?
你好吗？
How are you?
"""

        rows = parse_standard_markdown_lessons(
            raw=raw,
            language="chinese",
            source_label="test",
            collection_label="HSK 1",
        )

        self.assertEqual(len(rows), 1)
        row = rows[0]
        self.assertEqual(row.get("english"), "你好吗？")
        self.assertEqual(row.get("burmese"), "How are you?")
        self.assertIsNone(row.get("translations"))

    def test_parses_tagged_translations_and_leaves_legacy_fallback_empty(self) -> None:
        raw = """
## 1.1 Greetings
@ch_py: nǐ hǎo ma
@ch: 你好吗？
@en: How are you?
@vi: Bạn có khỏe không?
@my: နေကောင်းလား?
"""

        rows = parse_standard_markdown_lessons(
            raw=raw,
            language="chinese",
            source_label="test",
            collection_label="HSK 1",
        )

        self.assertEqual(len(rows), 1)
        row = rows[0]
        self.assertEqual(row.get("english"), "你好吗？")
        self.assertEqual(row.get("burmese"), "နေကောင်းလား?")
        self.assertEqual(
            row.get("translations"),
            {
                "ch_py": "nǐ hǎo ma",
                "ch": "你好吗？",
                "english": "How are you?",
                "vietnamese": "Bạn có khỏe không?",
                "burmese": "နေကောင်းလား?",
            },
        )

    def test_supports_legacy_fallback_line_with_optional_tagged_overrides(self) -> None:
        raw = """
## 1.1 Greetings
Nǐ hǎo ma?
你好吗？
How are you?
@vi: Bạn có khỏe không?
@my: နေကောင်းလား?
"""

        rows = parse_standard_markdown_lessons(
            raw=raw,
            language="chinese",
            source_label="test",
            collection_label="HSK 1",
        )

        self.assertEqual(len(rows), 1)
        row = rows[0]
        self.assertEqual(row.get("english"), "你好吗？")
        self.assertEqual(row.get("burmese"), "How are you?")
        self.assertEqual(
            row.get("translations"),
            {
                "vietnamese": "Bạn có khỏe không?",
                "burmese": "နေကောင်းလား?",
            },
        )

    def test_supports_file_level_metadata_tags(self) -> None:
        raw = """
@content_type: story
@display_title: Job Seeking
@display_meta: HSK 2 · Story

## 2.65 Story. Job Seeking Part 1
@speaker: M
@ch_py: nǐ hǎo ma
@ch: 你好吗？
@en: How are you?
"""

        rows = parse_standard_markdown_lessons(
            raw=raw,
            language="chinese",
            source_label="HSK 2 Story Job Seeking",
            collection_label="HSK 2",
        )

        self.assertEqual(len(rows), 1)
        row = rows[0]
        self.assertEqual(row.get("contentType"), "story")
        self.assertEqual(row.get("displayTitle"), "Job Seeking")
        self.assertEqual(row.get("displayMeta"), "HSK 2 · Story")
        self.assertEqual(row.get("speaker"), "M")


if __name__ == "__main__":
    unittest.main()

