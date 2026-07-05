from __future__ import annotations

import unittest

from app.services.lessons import parse_standard_markdown_lessons


class StandardMarkdownParserTest(unittest.TestCase):
    def test_keeps_legacy_three_line_blocks(self) -> None:
        raw = """
## 1.1 Greetings
Nǐ hǎo ma?
你好吗？
How are you?
"""

        rows = parse_standard_markdown_lessons(
            raw=raw,
            language="english",
            source_label="test",
            collection_label="Beginner (A1)",
        )

        self.assertEqual(len(rows), 1)
        row = rows[0]
        self.assertEqual(row.get("english"), "你好吗？")
        self.assertEqual(row.get("burmese"), "How are you?")
        self.assertIsNone(row.get("translations"))

    def test_parses_tagged_translations_for_standard_docs(self) -> None:
        raw = """
## 1.1 Greetings
Nǐ hǎo ma?
你好吗？
@en: How are you?
@vi: Bạn có khỏe không?
@my: နေကောင်းလား?
"""

        rows = parse_standard_markdown_lessons(
            raw=raw,
            language="english",
            source_label="test",
            collection_label="Beginner (A1)",
        )

        self.assertEqual(len(rows), 1)
        row = rows[0]
        self.assertEqual(row.get("english"), "你好吗？")
        self.assertEqual(row.get("burmese"), "")
        self.assertEqual(
            row.get("translations"),
            {
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
            language="english",
            source_label="test",
            collection_label="Beginner (A1)",
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

    def test_parses_tag_first_chinese_blocks_without_tag_prefix_in_output(self) -> None:
        raw = """
## 1.1 Greetings
@ch_py: nǐ hǎo
@ch: 你好。
@en_py: ni hao
@en: Hello.
@vi: Xin chào.
@my: မင်္ဂလာပါ။
@th: สวัสดีครับ/ค่ะ
"""

        rows = parse_standard_markdown_lessons(
            raw=raw,
            language="chinese",
            source_label="test",
            collection_label="CEFR A1",
        )

        self.assertEqual(len(rows), 1)
        row = rows[0]
        self.assertEqual(row.get("pronunciation"), "nǐ hǎo")
        self.assertEqual(row.get("english"), "你好。")
        self.assertEqual(row.get("burmese"), "မင်္ဂလာပါ။")
        self.assertEqual(
            row.get("translations"),
            {
                "ch_py": "nǐ hǎo",
                "ch": "你好。",
                "en_py": "ni hao",
                "english": "Hello.",
                "vietnamese": "Xin chào.",
                "burmese": "မင်္ဂလာပါ။",
                "th": "สวัสดีครับ/ค่ะ",
            },
        )


if __name__ == "__main__":
    unittest.main()

