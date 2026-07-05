from __future__ import annotations

import re
import unittest
from collections import defaultdict
from pathlib import Path


TAG_LINE_RE = re.compile(r"^@([a-zA-Z][a-zA-Z0-9_-]{0,15})\s*:\s*(.+)$")


def _normalize_locale(raw_locale: str) -> str:
    normalized = str(raw_locale or "").strip().lower().replace("-", "_")
    if normalized in {"en", "eng", "english"}:
        return "english"
    if normalized in {"vi", "vie", "vietnamese"}:
        return "vietnamese"
    if normalized in {"my", "mm", "bm", "burmese", "myanmar"}:
        return "burmese"
    return normalized


def _parse_tag_lines(lines: list[str], start: int) -> tuple[dict[str, str], int, list[str]]:
    tags: dict[str, str] = {}
    issues: list[str] = []
    cursor = start
    while cursor < len(lines):
        stripped = lines[cursor].strip()
        if not stripped:
            break
        match = TAG_LINE_RE.match(stripped)
        if not match:
            break
        locale = _normalize_locale(match.group(1))
        value = (match.group(2) or "").strip()
        if locale in tags:
            issues.append(f"duplicate locale tag @{locale} at line {cursor + 1}")
        elif value:
            tags[locale] = value
        cursor += 1
    return tags, cursor, issues


def _iter_hsk_markdown_files(repo_root: Path) -> list[Path]:
    base = repo_root / "data" / "HSK"
    return sorted(base.glob("docs. HSK */*.md"))


class ContentLintTest(unittest.TestCase):
    def test_hsk_markdown_has_no_tagged_migration_conflicts(self) -> None:
        repo_root = Path(__file__).resolve().parents[2]
        files = _iter_hsk_markdown_files(repo_root)
        self.assertGreater(len(files), 0, "No HSK markdown files found for linting")

        issues: list[str] = []

        for file_path in files:
            lines = file_path.read_text(encoding="utf-8").splitlines()
            entry_map: dict[tuple[str, str], list[tuple[int, str]]] = defaultdict(list)
            i = 0
            while i < len(lines):
                line = lines[i].strip()
                if not line or line == "**" or line.startswith("##"):
                    i += 1
                    continue

                if i + 2 >= len(lines):
                    i += 1
                    continue

                pinyin = line
                hanzi = lines[i + 1].strip()
                third = lines[i + 2].strip()
                if (
                    not hanzi
                    or not third
                    or hanzi.startswith("##")
                    or third.startswith("##")
                ):
                    i += 1
                    continue

                has_tags = False
                next_index = i + 3
                if third.startswith("@"):
                    tags, next_index, tag_issues = _parse_tag_lines(lines, i + 2)
                    if tag_issues:
                        for issue in tag_issues:
                            issues.append(f"{file_path}:{issue}")
                    has_tags = len(tags) > 0
                    if not has_tags:
                        i += 1
                        continue
                else:
                    _, cursor, tag_issues = _parse_tag_lines(lines, i + 3)
                    if tag_issues:
                        for issue in tag_issues:
                            issues.append(f"{file_path}:{issue}")
                    if cursor > i + 3:
                        has_tags = True
                        next_index = cursor

                key = (pinyin, hanzi)
                entry_map[key].append((i + 1, "tagged" if has_tags else "legacy"))
                i = next_index if has_tags else i + 3

            # Lint scope intentionally targets migration risk:
            # the same sentence key should not appear in both tagged and legacy formats.
            for (pinyin, hanzi), occurrences in entry_map.items():
                has_tagged = any(kind == "tagged" for _, kind in occurrences)
                has_legacy = any(kind == "legacy" for _, kind in occurrences)
                if not (has_tagged and has_legacy):
                    continue
                lines_list = ", ".join(str(line_no) for line_no, _ in occurrences)
                kinds = sorted({kind for _, kind in occurrences})
                issues.append(
                    f"{file_path}: mixed legacy/tagged sentence key at lines [{lines_list}] "
                    f"(formats={kinds}) for hanzi='{hanzi}'"
                )

        if issues:
            preview = "\n".join(issues[:40])
            self.fail(
                "Content lint failed for mixed/duplicate tagged migration entries.\n"
                f"{preview}"
            )


if __name__ == "__main__":
    unittest.main()

