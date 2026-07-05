from __future__ import annotations

import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from ..config import (
    CEFR_LEVEL_ORDER,
    CEFR_STAGE_LABELS,
    HSK_BASE_LANGUAGE_CODE,
    HSK_COLLECTION_LANGUAGE_CODE,
    HSK_LANGUAGE_CODES,
    LESSON_FRAMEWORK_CODES,
    LESSON_PRIMARY_MARKDOWN_LANGUAGE_CODES,
    Settings,
    get_settings,
)

HEADING_RE = re.compile(r"^##\s*([0-9]+\.[0-9]+)\s*(.*)$", re.IGNORECASE)
TRANSLATION_TAG_RE = re.compile(r"^@([a-zA-Z][a-zA-Z0-9_-]{0,15})\s*:\s*(.*)$")


@dataclass
class JsonCacheEntry:
    file_path: Path
    mtime_ns: int
    size: int
    data: list[dict[str, Any]]


class LessonsLoadError(Exception):
    pass


_LESSONS_JSON_CACHE: dict[str, JsonCacheEntry] = {}
_HSK_LANGUAGE_CODES_SET = set(HSK_LANGUAGE_CODES)
_PRIMARY_MARKDOWN_LANGUAGE_CODES_SET = set(LESSON_PRIMARY_MARKDOWN_LANGUAGE_CODES)
_ENGLISH_LANGUAGE_CODE = LESSON_PRIMARY_MARKDOWN_LANGUAGE_CODES[0]
_CHINESE_LANGUAGE_CODE = HSK_BASE_LANGUAGE_CODE


def _backend_data_dir(settings: Settings | None = None) -> Path:
    runtime_settings = settings or get_settings()
    return runtime_settings.data_dir


def get_supported_languages(default_language: str, settings: Settings | None = None) -> set[str]:
    fallback = {default_language, *LESSON_PRIMARY_MARKDOWN_LANGUAGE_CODES, HSK_COLLECTION_LANGUAGE_CODE, *HSK_LANGUAGE_CODES}
    data_dir = _backend_data_dir(settings)
    try:
        for entry in data_dir.iterdir():
            if not entry.is_file():
                continue
            match = re.match(r"^lessons\.([a-z0-9_-]+)\.json$", entry.name, re.IGNORECASE)
            if match:
                fallback.add(match.group(1).lower())
    except OSError:
        pass
    return fallback


def normalize_language(value: str | None, default_language: str, supported_languages: set[str]) -> str:
    if not isinstance(value, str):
        return default_language
    normalized = value.strip().lower()
    return normalized if normalized in supported_languages else default_language


def is_hsk_language(language: str) -> bool:
    normalized = str(language or "").strip().lower()
    return normalized in _HSK_LANGUAGE_CODES_SET


def is_hsk_collection_language(language: str) -> bool:
    normalized = str(language or "").strip().lower()
    return normalized == HSK_COLLECTION_LANGUAGE_CODE


def is_primary_markdown_language(language: str) -> bool:
    normalized = str(language or "").strip().lower()
    return normalized in _PRIMARY_MARKDOWN_LANGUAGE_CODES_SET


def is_english_language(language: str) -> bool:
    normalized = str(language or "").strip().lower()
    return normalized == _ENGLISH_LANGUAGE_CODE


def is_chinese_language(language: str) -> bool:
    normalized = str(language or "").strip().lower()
    return normalized == _CHINESE_LANGUAGE_CODE


def get_base_name_without_extension(filename: str) -> str:
    return re.sub(r"\.[^.]+$", "", str(filename)).strip()


def get_source_label_from_filename(filename: str) -> str:
    raw = get_base_name_without_extension(filename)
    without_leading_index = re.sub(r"^\d+(?:[._-]\d+)?[.\-_\s]*", "", raw).strip()
    normalized = re.sub(r"\s+", " ", re.sub(r"[_-]+", " ", without_leading_index)).strip()
    normalized = re.sub(r"\bHSK\s*(\d+)\b", r"HSK \1", normalized, flags=re.IGNORECASE)
    return normalized or raw


def to_display_label(value: str | None) -> str:
    lower = str(value or "").strip().lower()
    if lower == HSK_COLLECTION_LANGUAGE_CODE:
        return "HSK Chinese"
    tokens = [token for token in re.split(r"[\s_-]+", lower) if token]
    if not tokens:
        return "General"
    return " ".join(token[:1].upper() + token[1:] for token in tokens)


def _derive_group_id(order_index: Any) -> str:
    try:
        index = int(order_index)
    except (TypeError, ValueError):
        index = 1
    if index < 1:
        index = 1
    if index <= 3:
        return "beginner"
    if index <= 6:
        return "pre_intermediate"
    if index <= 9:
        return "intermediate"
    return "upper_intermediate"


def _normalize_positive_int(value: Any, fallback: int = 1) -> int:
    try:
        num = int(value)
    except (TypeError, ValueError):
        return fallback
    return num if num >= 1 else fallback


def normalize_lesson_record(record: dict[str, Any]) -> dict[str, Any]:
    raw_order_index = record.get("orderIndex", record.get("order_index", record.get("level")))
    raw_unit_id = record.get("unitId", record.get("unit_id", record.get("unit")))

    # Audio files are intentionally disabled for now; keep field present as null.
    audio_path = None

    order_index = _normalize_positive_int(raw_order_index, 1)
    unit_id = _normalize_positive_int(raw_unit_id, 1)

    raw_group = record.get("groupId", record.get("group_id"))
    if isinstance(raw_group, str):
        group_id = raw_group.strip() or _derive_group_id(order_index)
    else:
        group_id = _derive_group_id(order_index)

    normalized = dict(record)
    normalized.update(
        {
            "groupId": group_id,
            "unitId": unit_id,
            "orderIndex": order_index,
            "audioPath": audio_path,
            "sourceLabel": record.get("sourceLabel") if isinstance(record.get("sourceLabel"), str) else None,
            "collectionLabel": (
                record.get("collectionLabel") if isinstance(record.get("collectionLabel"), str) else None
            ),
            "level": order_index,
            "unit": unit_id,
        }
    )
    return normalized


def _infer_cefr_code_from_label(label: str | None) -> str | None:
    raw = str(label or "").strip()
    if not raw:
        return None
    upper = raw.upper()
    match = re.search(r"\b([ABC][12])\b", upper)
    if match:
        return match.group(1)
    if "UPPER" in upper and "INTERMEDIATE" in upper:
        return "B2"
    if "PRE" in upper and "INTERMEDIATE" in upper:
        return "A2"
    if "BEGINNER" in upper:
        return "A1"
    if "INTERMEDIATE" in upper:
        return "B1"
    return None


def _infer_cefr_code_from_level(level: Any) -> str:
    try:
        value = int(level)
    except (TypeError, ValueError):
        value = 1
    if value <= 3:
        return "A1"
    if value <= 6:
        return "A2"
    if value <= 9:
        return "B1"
    return "B2"


def _normalize_level_scheme(value: Any) -> str:
    if not isinstance(value, str):
        return ""
    return value.strip().lower()


def _normalize_level_code(value: Any) -> str:
    if not isinstance(value, str):
        return ""
    return value.strip().upper()


def _normalize_framework(value: Any) -> str:
    scheme = _normalize_level_scheme(value)
    if scheme in LESSON_FRAMEWORK_CODES:
        return scheme
    return "custom" if scheme else ""


def _format_framework_level(framework: str, code: Any, fallback_label: Any) -> str:
    normalized_code = _normalize_level_code(code)
    if framework == "cefr":
        match = re.search(r"\b([ABC][12])\b", normalized_code)
        if match:
            return match.group(1)
        return normalized_code or _to_title_case(str(fallback_label or ""))

    if framework == "hsk":
        match = re.search(r"HSK\s*([1-9]\d*)", normalized_code, re.I)
        if match:
            return f"HSK {match.group(1)}"
        if normalized_code.isdigit():
            return f"HSK {normalized_code}"
        return normalized_code or _to_title_case(str(fallback_label or ""))

    if framework == "jlpt":
        match = re.search(r"N\s*([1-5])", normalized_code, re.I)
        if match:
            return f"JLPT N{match.group(1)}"
        if normalized_code.startswith("JLPT"):
            return normalized_code
        if normalized_code:
            return f"JLPT {normalized_code}"
        return _to_title_case(str(fallback_label or ""))

    return _to_title_case(normalized_code or str(fallback_label or ""))


def enrich_lessons_with_level_metadata(language: str, lessons: list[dict[str, Any]]) -> list[dict[str, Any]]:
    normalized_language = str(language or "").strip().lower()
    enriched: list[dict[str, Any]] = []
    for lesson in lessons:
        row = dict(lesson)
        scheme = _normalize_level_scheme(row.get("levelScheme"))
        code = _normalize_level_code(row.get("levelCode"))
        track_id = str(row.get("trackId") or "").strip()
        level_order = row.get("levelOrder")

        if is_primary_markdown_language(normalized_language):
            if not scheme:
                scheme = "cefr"
            if not code:
                code = _infer_cefr_code_from_label(row.get("collectionLabel")) or _infer_cefr_code_from_level(row.get("level"))
            if not track_id:
                track_id = f"cefr_{normalized_language}"
            if not isinstance(level_order, int):
                level_order = CEFR_LEVEL_ORDER.get(code, CEFR_LEVEL_ORDER[_infer_cefr_code_from_level(row.get("level"))])
        elif is_hsk_collection_language(normalized_language) or is_hsk_language(normalized_language):
            if not scheme:
                scheme = "hsk"
            if not track_id:
                track_id = HSK_COLLECTION_LANGUAGE_CODE
            if not code:
                try:
                    level_num = int(row.get("level"))
                except (TypeError, ValueError):
                    level_num = None
                if level_num and level_num > 0:
                    code = f"HSK{level_num}"
                else:
                    code = _normalize_level_code(row.get("collectionLabel"))
            if not isinstance(level_order, int):
                match = re.search(r"HSK\s*([1-9]\d*)", code, re.I)
                if match:
                    level_order = int(match.group(1))
        else:
            if not scheme:
                scheme = "custom"
            if not track_id:
                track_id = normalized_language or "general"
            if not code:
                code = _normalize_level_code(row.get("collectionLabel")) or _normalize_level_code(row.get("sourceLabel"))

        row["trackId"] = track_id or None
        row["levelScheme"] = scheme or None
        row["levelCode"] = code or None
        row["levelOrder"] = level_order if isinstance(level_order, int) else None
        enriched.append(row)
    return enriched


def _to_title_case(value: str | None) -> str:
    parts = [token for token in re.split(r"[\s_-]+", str(value or "").strip()) if token]
    return " ".join(token[:1].upper() + token[1:].lower() for token in parts)


def enrich_lessons_with_framework_metadata(lessons: list[dict[str, Any]]) -> list[dict[str, Any]]:
    if not lessons:
        return lessons

    prepared_rows: list[tuple[dict[str, Any], tuple[str, str], int, int]] = []
    grouped_units: dict[tuple[str, str], set[tuple[int, int]]] = {}

    for lesson in lessons:
        row = dict(lesson)
        framework = _normalize_framework(row.get("framework") or row.get("levelScheme")) or "custom"
        framework_level = str(row.get("frameworkLevel") or "").strip()
        if not framework_level:
            framework_level = _format_framework_level(
                framework,
                row.get("levelCode"),
                row.get("collectionLabel") or row.get("sourceLabel"),
            ) or "General"
        order_index = _normalize_positive_int(row.get("orderIndex", row.get("level")), 1)
        unit_id = _normalize_positive_int(row.get("unitId", row.get("unit")), 1)
        group_key = (framework, framework_level.strip().lower())

        grouped_units.setdefault(group_key, set()).add((order_index, unit_id))
        prepared_rows.append((row, group_key, order_index, unit_id))

    unit_position_lookup: dict[tuple[tuple[str, str], tuple[int, int]], int] = {}
    for group_key, units in grouped_units.items():
        ordered_units = sorted(units, key=lambda entry: (entry[0], entry[1]))
        for position, unit_key in enumerate(ordered_units, start=1):
            unit_position_lookup[(group_key, unit_key)] = position

    enriched: list[dict[str, Any]] = []
    for row, group_key, order_index, unit_id in prepared_rows:
        framework = group_key[0]
        framework_level = str(row.get("frameworkLevel") or "").strip() or _format_framework_level(
            framework,
            row.get("levelCode"),
            row.get("collectionLabel") or row.get("sourceLabel"),
        ) or "General"
        framework_unit = row.get("frameworkUnit")
        if not isinstance(framework_unit, int) or framework_unit < 1:
            framework_unit = unit_position_lookup.get((group_key, (order_index, unit_id)), 1)

        row["framework"] = framework
        row["frameworkLevel"] = framework_level
        row["frameworkUnit"] = framework_unit
        enriched.append(row)

    return enriched


def sort_lessons_by_numeric_level_unit(lessons: list[dict[str, Any]]) -> list[dict[str, Any]]:
    def sort_key(row: dict[str, Any]) -> tuple[int, int]:
        order_index = _normalize_positive_int(row.get("orderIndex", row.get("level")), 1)
        unit_id = _normalize_positive_int(row.get("unitId", row.get("unit")), 1)
        return (order_index, unit_id)

    return sorted(lessons, key=sort_key)


def enrich_lessons_with_structure_labels(language: str, lessons: list[dict[str, Any]]) -> list[dict[str, Any]]:
    if is_hsk_language(language) or is_hsk_collection_language(language):
        return lessons
    collection_label = _to_title_case(language) or "General"
    enriched: list[dict[str, Any]] = []
    for lesson in lessons:
        row = dict(lesson)
        if not row.get("collectionLabel"):
            row["collectionLabel"] = collection_label
        if not row.get("sourceLabel"):
            topic = str(row.get("topic") or "General").strip() or "General"
            row["sourceLabel"] = topic
        enriched.append(row)
    return enriched


def _get_markdown_docs_folders_for_language(language: str) -> list[tuple[Path, str]]:
    language_label = to_display_label(language)
    language_code = str(language or "").strip().lower()
    data_dir = _backend_data_dir()
    candidate_roots: list[Path] = [data_dir / language_label]
    if not language_label.lower().startswith("cefr "):
        candidate_roots.append(data_dir / f"CEFR {language_label}")
    # New unified CEFR root after folder rename: data/CEFR
    if is_primary_markdown_language(language_code):
        candidate_roots.append(data_dir / "CEFR")
    if is_english_language(language_code):
        candidate_roots.append(data_dir / "CEFR English")
    # Keep chinese lessons available even if CEFR Chinese folder is removed.
    if is_chinese_language(language_code):
        candidate_roots.append(data_dir / "CEFR Chinese")
        candidate_roots.append(data_dir / "CEFR English")
    folders: list[tuple[Path, str]] = []

    def push_folder(dir_path: Path, collection_label: str) -> None:
        try:
            entries = list(dir_path.iterdir())
        except OSError:
            return
        if any(entry.is_file() and entry.name.lower().endswith(".md") for entry in entries):
            folders.append((dir_path, collection_label.strip() or language_label))
    def stage_rank(label: str) -> int:
        try:
            return next(i for i, stage in enumerate(CEFR_STAGE_LABELS) if stage.lower() == label.lower())
        except StopIteration:
            return 10_000

    for root in candidate_roots:
        push_folder(root / f"docs. {language_label}", language_label)
        push_folder(root / "docs", language_label)

        dir_names: list[str] = []
        try:
            dir_names = [entry.name for entry in root.iterdir() if entry.is_dir() and re.match(r"^docs\.", entry.name, re.I)]
        except OSError:
            dir_names = []

        dir_names.sort(key=lambda name: (stage_rank(re.sub(r"^docs\.\s*", "", name, flags=re.I).strip()), name.lower()))
        for dir_name in dir_names:
            collection_label = re.sub(r"^docs\.\s*", "", dir_name, flags=re.I).strip() or language_label
            push_folder(root / dir_name, collection_label)

    seen: set[Path] = set()
    unique_folders: list[tuple[Path, str]] = []
    for dir_path, label in folders:
        if dir_path in seen:
            continue
        seen.add(dir_path)
        unique_folders.append((dir_path, label))
    return unique_folders


def _get_hsk_docs_directory(level: int) -> Path:
    candidates = [
        _backend_data_dir() / "HSK" / f"docs. HSK {level}",
        _backend_data_dir() / f"CH_HSK {level}",
        _backend_data_dir() / "HSK Chinese" / f"docs. HSK {level}",
    ]
    existing_dir: Path | None = None
    for candidate in candidates:
        if candidate.is_dir() and existing_dir is None:
            existing_dir = candidate
        try:
            entries = list(candidate.iterdir())
        except OSError:
            continue
        if any(entry.is_file() and entry.name.lower().endswith(".md") for entry in entries):
            return candidate
    if existing_dir is not None:
        return existing_dir
    raise LessonsLoadError(f"HSK docs directory not found for level={level}")


def _read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def _natural_sort_key(value: str) -> tuple[Any, ...]:
    parts = re.split(r"(\d+)", value.lower())
    key: list[Any] = []
    for part in parts:
        if part.isdigit():
            key.append(int(part))
        else:
            key.append(part)
    return tuple(key)


def _normalize_translation_locale(raw_locale: str) -> str:
    normalized = str(raw_locale or "").strip().lower().replace("-", "_")
    if normalized in {"en", "eng", "english"}:
        return "english"
    if normalized in {"vi", "vie", "vietnamese"}:
        return "vietnamese"
    if normalized in {"my", "mm", "bm", "burmese", "myanmar"}:
        return "burmese"
    return normalized


def _parse_tagged_translations(lines: list[str], start_index: int) -> tuple[dict[str, str], int]:
    translations: dict[str, str] = {}
    cursor = start_index
    while cursor < len(lines):
        raw_line = lines[cursor].strip()
        if not raw_line:
            break
        match = TRANSLATION_TAG_RE.match(raw_line)
        if not match:
            break
        locale = _normalize_translation_locale(match.group(1))
        value = (match.group(2) or "").strip()
        if locale and value:
            translations[locale] = value
        cursor += 1
    return translations, cursor


def _first_non_empty(*values: str | None) -> str:
    for value in values:
        text = str(value or "").strip()
        if text:
            return text
    return ""


def _extract_standard_fields_from_tagged_block(
    language: str,
    tagged_translations: dict[str, str],
) -> tuple[str, str, str, str]:
    normalized_language = str(language or "").strip().lower()
    speaker = _first_non_empty(
        tagged_translations.get("speaker"),
        tagged_translations.get("spk"),
    )

    if is_chinese_language(normalized_language):
        pronunciation = _first_non_empty(
            tagged_translations.get("ch_py"),
            tagged_translations.get("zh_py"),
            tagged_translations.get("pinyin"),
            tagged_translations.get("pronunciation"),
        )
        learn_line = _first_non_empty(
            tagged_translations.get("ch"),
            tagged_translations.get("zh"),
            tagged_translations.get("hanzi"),
            tagged_translations.get("english"),
        )
    elif is_english_language(normalized_language):
        pronunciation = _first_non_empty(
            tagged_translations.get("en_py"),
            tagged_translations.get("pronunciation"),
            tagged_translations.get("english"),
        )
        learn_line = _first_non_empty(
            tagged_translations.get("english"),
            tagged_translations.get("source"),
        )
    else:
        pronunciation = _first_non_empty(
            tagged_translations.get("pronunciation"),
            tagged_translations.get("english"),
        )
        learn_line = _first_non_empty(
            tagged_translations.get("english"),
            tagged_translations.get("source"),
        )

    legacy_fallback_translation = _first_non_empty(
        tagged_translations.get("burmese"),
    )
    if not pronunciation:
        pronunciation = learn_line

    return pronunciation, learn_line, legacy_fallback_translation, speaker


def _parse_file_metadata(raw: str) -> tuple[dict[str, str], str]:
    lines = re.split(r"\r?\n", raw)
    metadata: dict[str, str] = {}
    body_start = 0
    saw_metadata = False

    for idx, raw_line in enumerate(lines):
        line = raw_line.strip()
        if not line:
            if saw_metadata:
                body_start = idx + 1
                break
            continue
        if line.startswith("##"):
            body_start = idx
            break
        if not line.startswith("@"):
            body_start = idx
            break
        match = TRANSLATION_TAG_RE.match(line)
        if not match:
            body_start = idx
            break
        key = (match.group(1) or "").strip().lower()
        value = (match.group(2) or "").strip()
        if key in {"content_type", "display_title", "display_meta"}:
            metadata[key] = value
            saw_metadata = True
            body_start = idx + 1
            continue
        body_start = idx
        break

    body = "\n".join(lines[body_start:])
    return metadata, body


def parse_standard_markdown_lessons(
    raw: str, language: str, source_label: str, collection_label: str
) -> list[dict[str, Any]]:
    file_metadata, lesson_body = _parse_file_metadata(raw)
    lines = [line.strip() for line in re.split(r"\r?\n", lesson_body)]
    lessons: list[dict[str, Any]] = []
    current_topic = f"{to_display_label(language)} Unit 1"
    current_level = 1
    current_unit = 1
    content_type = file_metadata.get("content_type") or None
    display_title = file_metadata.get("display_title") or None
    display_meta = file_metadata.get("display_meta") or None

    i = 0
    while i < len(lines):
        line = lines[i]
        if not line or line == "**":
            i += 1
            continue

        heading_match = HEADING_RE.match(line)
        if heading_match:
            unit_code = heading_match.group(1) or ""
            parts = unit_code.split(".")
            major_raw = parts[0] if len(parts) > 0 else ""
            minor_raw = parts[1] if len(parts) > 1 else ""
            heading_level = int(major_raw) if major_raw.isdigit() else current_level
            heading_unit = int(minor_raw) if minor_raw.isdigit() else current_unit
            current_level = heading_level if heading_level > 0 else current_level
            current_unit = heading_unit if heading_unit > 0 else current_unit
            current_topic = (heading_match.group(2) or "").strip() or f"{to_display_label(language)} {current_level}.{current_unit}"
            i += 1
            continue

        if line.startswith("@"):
            tagged_translations, next_index = _parse_tagged_translations(lines, i)
            pronunciation, learn_line, legacy_fallback_translation, speaker = _extract_standard_fields_from_tagged_block(
                language,
                tagged_translations,
            )
            if not tagged_translations:
                i += 1
                continue

            if not pronunciation and not learn_line:
                i += 1
                continue
            if pronunciation.startswith("##") or learn_line.startswith("##"):
                i += 1
                continue

            lessons.append(
                {
                    "level": current_level,
                    "unit": current_unit,
                    "topic": current_topic,
                    "speaker": speaker or None,
                    "english": learn_line,
                    "burmese": legacy_fallback_translation,
                    "translations": tagged_translations or None,
                    "pronunciation": pronunciation,
                    "sourceLabel": source_label,
                    "collectionLabel": (collection_label or "").strip() or to_display_label(language),
                    "contentType": content_type,
                    "displayTitle": display_title,
                    "displayMeta": display_meta,
                    "groupId": _derive_group_id(current_level),
                    "unitId": current_unit,
                    "orderIndex": current_level,
                }
            )
            i = next_index
            continue

        pronunciation = line
        learn_line = lines[i + 1] if i + 1 < len(lines) else ""
        translation_anchor_index = i + 2
        raw_third_line = lines[translation_anchor_index] if translation_anchor_index < len(lines) else ""
        tagged_translations: dict[str, str] = {}
        legacy_fallback_translation = ""
        next_index = i + 3

        if raw_third_line.startswith("@"):
            tagged_translations, next_index = _parse_tagged_translations(lines, translation_anchor_index)
            if not tagged_translations:
                i += 1
                continue
        else:
            legacy_fallback_translation = raw_third_line
            tagged_translations, tagged_cursor = _parse_tagged_translations(lines, i + 3)
            if tagged_translations:
                next_index = tagged_cursor

        if (
            pronunciation.startswith("##")
            or learn_line.startswith("##")
            or legacy_fallback_translation.startswith("##")
        ):
            i += 1
            continue

        if not pronunciation and not learn_line:
            i += 1
            continue

        lessons.append(
            {
                "level": current_level,
                "unit": current_unit,
                "topic": current_topic,
                "speaker": None,
                "english": learn_line,
                "burmese": legacy_fallback_translation,
                "translations": tagged_translations or None,
                "pronunciation": pronunciation,
                "sourceLabel": source_label,
                "collectionLabel": (collection_label or "").strip() or to_display_label(language),
                "contentType": content_type,
                "displayTitle": display_title,
                "displayMeta": display_meta,
                "groupId": _derive_group_id(current_level),
                "unitId": current_unit,
                "orderIndex": current_level,
            }
        )
        i = next_index if tagged_translations else i + 3

    return lessons


def read_lessons_from_standard_markdown(language: str) -> list[dict[str, Any]]:
    docs_folders = _get_markdown_docs_folders_for_language(language)
    if not docs_folders:
        raise LessonsLoadError(f"No markdown docs found for language={language}")

    all_rows: list[dict[str, Any]] = []
    for dir_path, collection_label in docs_folders:
        files = sorted(
            [entry for entry in dir_path.iterdir() if entry.is_file() and entry.name.lower().endswith(".md")],
            key=lambda p: _natural_sort_key(p.name),
        )
        for file_path in files:
            content = _read_text(file_path)
            all_rows.extend(
                parse_standard_markdown_lessons(
                    content,
                    language,
                    get_source_label_from_filename(file_path.name),
                    collection_label,
                )
            )
    if not all_rows:
        raise LessonsLoadError(f"No markdown lesson rows found for language={language}")
    return all_rows


def read_lessons_from_hsk_markdown(hsk_language: str) -> list[dict[str, Any]]:
    level = int(hsk_language.replace("hsk", ""))
    directory = _get_hsk_docs_directory(level)
    files = sorted(
        [entry for entry in directory.iterdir() if entry.is_file() and entry.name.lower().endswith(".md")],
        key=lambda p: _natural_sort_key(p.name),
    )
    all_rows: list[dict[str, Any]] = []
    for file_path in files:
        content = _read_text(file_path)
        all_rows.extend(
            parse_standard_markdown_lessons(
                raw=content,
                language=HSK_BASE_LANGUAGE_CODE,
                source_label=get_source_label_from_filename(file_path.name),
                collection_label=f"HSK {level}",
            )
        )
    if not all_rows:
        raise LessonsLoadError(f"No markdown lessons found for language={hsk_language}")
    return all_rows


def read_lessons_from_all_hsk_markdown() -> list[dict[str, Any]]:
    all_rows: list[dict[str, Any]] = []
    for language in HSK_LANGUAGE_CODES:
        all_rows.extend(read_lessons_from_hsk_markdown(language))
    return all_rows


def _load_json_file_with_cache(language: str, file_path: Path) -> list[dict[str, Any]]:
    stat = file_path.stat()
    cached = _LESSONS_JSON_CACHE.get(language)
    if cached and cached.file_path == file_path and cached.mtime_ns == stat.st_mtime_ns and cached.size == stat.st_size:
        return cached.data

    parsed = json.loads(file_path.read_text(encoding="utf-8"))
    if not isinstance(parsed, list):
        raise LessonsLoadError(f"Invalid JSON lesson source for language={language}")

    _LESSONS_JSON_CACHE[language] = JsonCacheEntry(
        file_path=file_path,
        mtime_ns=stat.st_mtime_ns,
        size=stat.st_size,
        data=parsed,
    )
    return parsed


def read_lessons_from_json(language: str) -> list[dict[str, Any]]:
    data_dir = _backend_data_dir()
    candidates = [
        data_dir / f"lessons.{language}.json",
        data_dir / f"lesson.{language}.json",
        data_dir / f"lessons.{language}_chinese.json",
        data_dir / f"lesson.{language}_chinese.json",
        data_dir / f"lessons.{language}-chinese.json",
        data_dir / f"lesson.{language}-chinese.json",
    ]
    for lessons_file_path in candidates:
        try:
            if lessons_file_path.is_file():
                return _load_json_file_with_cache(language, lessons_file_path)
        except Exception:
            continue

    if is_primary_markdown_language(language):
        try:
            return read_lessons_from_standard_markdown(language)
        except Exception:
            pass

    if is_hsk_language(language):
        return read_lessons_from_hsk_markdown(language)
    if is_hsk_collection_language(language):
        return read_lessons_from_all_hsk_markdown()
    raise LessonsLoadError(f"No JSON lesson source found for language={language}")


def read_lessons_from_db(language: str, settings: Settings) -> list[dict[str, Any]]:
    if not settings.database_url:
        raise LessonsLoadError("DATABASE_URL is not configured.")
    try:
        import psycopg
        from psycopg.rows import dict_row
    except Exception as exc:
        raise LessonsLoadError("psycopg is not available.") from exc

    sslmode = "require" if settings.pgssl else "prefer"
    with psycopg.connect(settings.database_url, row_factory=dict_row, sslmode=sslmode) as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT *
                FROM lessons
                WHERE language = %s
                ORDER BY level ASC, unit ASC, id ASC
                """,
                (language,),
            )
            rows = cur.fetchall()
    if not rows:
        raise LessonsLoadError(f"No lessons found in database for language={language}")
    return [dict(row) for row in rows]


def _load_and_enrich_lessons(language: str, settings: Settings) -> list[dict[str, Any]]:
    storage_mode = str(settings.storage_mode or "").strip().lower()

    prefer_markdown_source = (
        is_primary_markdown_language(language)
        or is_hsk_language(language)
        or is_hsk_collection_language(language)
    )

    if prefer_markdown_source or storage_mode == "json":
        lessons = read_lessons_from_json(language)
    else:
        try:
            lessons = read_lessons_from_db(language, settings)
        except Exception:
            lessons = read_lessons_from_json(language)

    normalized = [normalize_lesson_record(row) for row in lessons]
    with_structure = enrich_lessons_with_structure_labels(language, normalized)
    with_level_metadata = enrich_lessons_with_level_metadata(language, with_structure)
    with_framework_metadata = enrich_lessons_with_framework_metadata(with_level_metadata)
    return sort_lessons_by_numeric_level_unit(with_framework_metadata)


def _normalize_filter(value: str | None) -> str | None:
    if not isinstance(value, str):
        return None
    normalized = value.strip()
    return normalized or None


def _matches_filter(row_value: Any, expected_value: str | None) -> bool:
    if expected_value is None:
        return True
    return str(row_value or "").strip().lower() == expected_value.lower()


def build_library_index(lessons: list[dict[str, Any]]) -> list[dict[str, Any]]:
    grouped: dict[str, dict[str, Any]] = {}

    def _normalize_key(value: str) -> str:
        return re.sub(r"\s+", "-", str(value or "").strip().lower())

    for lesson in lessons:
        collection_label = str(lesson.get("collectionLabel") or "").strip() or "General"
        level_scheme = str(lesson.get("levelScheme") or "").strip().lower() or None
        level_code = str(lesson.get("levelCode") or "").strip().upper() or None
        level_order = lesson.get("levelOrder") if isinstance(lesson.get("levelOrder"), int) else None
        section_key = f"{level_scheme or 'custom'}-{_normalize_key(level_code or collection_label)}"
        section = grouped.setdefault(
            section_key,
            {
                "key": section_key,
                "label": collection_label,
                "levelScheme": level_scheme,
                "levelCode": level_code,
                "levelOrder": level_order,
                "groupsByKey": {},
                "groupOrder": [],
            },
        )

        source_label = str(lesson.get("sourceLabel") or "").strip() or "Untitled"
        group_key = f"{section_key}::{source_label.lower()}"
        if group_key not in section["groupsByKey"]:
            section["groupOrder"].append(group_key)
            section["groupsByKey"][group_key] = {
                "key": group_key,
                "stage": "A1",
                "groupIndex": len(section["groupOrder"]) - 1,
                "units": [],
                "firstTopicConcise": source_label,
                "sourceLabel": source_label,
                "collectionLabel": collection_label,
                "contentType": lesson.get("contentType"),
                "displayTitle": lesson.get("displayTitle"),
                "displayMeta": lesson.get("displayMeta"),
                "levelScheme": level_scheme,
                "levelCode": level_code,
                "coverUrl": None,
                "_seenUnits": set(),
            }

        group = section["groupsByKey"][group_key]
        order_index = _normalize_positive_int(lesson.get("orderIndex", lesson.get("level")), 1)
        unit_id = _normalize_positive_int(lesson.get("unitId", lesson.get("unit")), 1)
        unit_key = (order_index, unit_id)
        if unit_key not in group["_seenUnits"]:
            group["_seenUnits"].add(unit_key)
            group["units"].append(
                {
                    "stage": "A1",
                    "level": order_index,
                    "unit": unit_id,
                    "topic": lesson.get("topic"),
                }
            )

    sections = sorted(
        grouped.values(),
        key=lambda value: (
            get_library_sort_priority := {
                "cefr": 10,
                "hsk": 20,
                "jlpt": 30,
                "custom": 40,
            }.get(str(value.get("levelScheme") or "").strip().lower(), 50),
            value.get("levelOrder") if isinstance(value.get("levelOrder"), int) else 10_000,
            str(value.get("label") or "").lower(),
        ),
    )

    output: list[dict[str, Any]] = []
    for section in sections:
        groups: list[dict[str, Any]] = []
        for group_key in section["groupOrder"]:
            group = section["groupsByKey"][group_key]
            group["units"].sort(key=lambda entry: (entry["level"], entry["unit"]))
            group.pop("_seenUnits", None)
            groups.append(group)
        output.append(
            {
                "key": section["key"],
                "label": section["label"],
                "levelScheme": section["levelScheme"],
                "levelCode": section["levelCode"],
                "levelOrder": section["levelOrder"],
                "groups": groups,
            }
        )
    return output


def get_lessons(
    language_input: str | None,
    settings: Settings,
    *,
    source_label: str | None = None,
    collection_label: str | None = None,
    content_type: str | None = None,
) -> list[dict[str, Any]]:
    supported_languages = get_supported_languages(settings.default_language, settings)
    language = normalize_language(language_input, settings.default_language, supported_languages)
    lessons = _load_and_enrich_lessons(language, settings)

    normalized_source_label = _normalize_filter(source_label)
    normalized_collection_label = _normalize_filter(collection_label)
    normalized_content_type = _normalize_filter(content_type)

    if not any([normalized_source_label, normalized_collection_label, normalized_content_type]):
        return lessons

    return [
        row
        for row in lessons
        if _matches_filter(row.get("sourceLabel"), normalized_source_label)
        and _matches_filter(row.get("collectionLabel"), normalized_collection_label)
        and _matches_filter(row.get("contentType"), normalized_content_type)
    ]

