from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
BACKEND_FASTAPI_ROOT = SCRIPT_DIR.parent
if str(BACKEND_FASTAPI_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_FASTAPI_ROOT))

from app.config import (  # noqa: E402
    HSK_COLLECTION_LANGUAGE_CODE,
    HSK_LANGUAGE_CODES,
    LESSON_PRIMARY_MARKDOWN_LANGUAGE_CODES,
    Settings,
)
from app.services.lessons import (  # noqa: E402
    enrich_lessons_with_framework_metadata,
    enrich_lessons_with_level_metadata,
    enrich_lessons_with_structure_labels,
    normalize_language,
    normalize_lesson_record,
    read_lessons_from_all_hsk_markdown,
    read_lessons_from_hsk_markdown,
    read_lessons_from_standard_markdown,
    sort_lessons_by_numeric_level_unit,
)


def build_runtime_lessons_from_markdown(language: str) -> list[dict]:
    normalized_language = str(language or "").strip().lower()
    if normalized_language in LESSON_PRIMARY_MARKDOWN_LANGUAGE_CODES:
        lessons = read_lessons_from_standard_markdown(normalized_language)
    elif normalized_language in HSK_LANGUAGE_CODES:
        lessons = read_lessons_from_hsk_markdown(normalized_language)
    elif normalized_language == HSK_COLLECTION_LANGUAGE_CODE:
        lessons = read_lessons_from_all_hsk_markdown()
    else:
        raise ValueError(f"Unsupported markdown-export language: {language}")

    normalized = [normalize_lesson_record(row) for row in lessons]
    with_structure = enrich_lessons_with_structure_labels(normalized_language, normalized)
    with_level_metadata = enrich_lessons_with_level_metadata(normalized_language, with_structure)
    with_framework_metadata = enrich_lessons_with_framework_metadata(with_level_metadata)
    return sort_lessons_by_numeric_level_unit(with_framework_metadata)


def resolve_export_languages(requested: list[str], settings: Settings) -> list[str]:
    if requested:
        supported = {
            *LESSON_PRIMARY_MARKDOWN_LANGUAGE_CODES,
            *HSK_LANGUAGE_CODES,
            HSK_COLLECTION_LANGUAGE_CODE,
        }
        result: list[str] = []
        for raw_language in requested:
            normalized = normalize_language(raw_language, settings.default_language, supported)
            if normalized not in result:
                result.append(normalized)
        return result

    return [
        *LESSON_PRIMARY_MARKDOWN_LANGUAGE_CODES,
        *HSK_LANGUAGE_CODES,
        HSK_COLLECTION_LANGUAGE_CODE,
    ]


def export_language(language: str, settings: Settings) -> Path:
    lessons = build_runtime_lessons_from_markdown(language)
    output_path = settings.data_dir / f"lessons.{language}.json"
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        json.dumps(lessons, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    return output_path


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Build runtime lesson JSON files from markdown source content.",
    )
    parser.add_argument(
        "languages",
        nargs="*",
        help="Optional language codes to export. Defaults to all markdown-backed lesson languages.",
    )
    args = parser.parse_args()

    settings = Settings()
    export_languages = resolve_export_languages(args.languages, settings)
    for language in export_languages:
        output_path = export_language(language, settings)
        print(f"exported {language} -> {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

