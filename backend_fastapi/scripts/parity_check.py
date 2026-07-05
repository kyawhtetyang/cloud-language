#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import sys
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass
from typing import Any


@dataclass
class HttpResult:
    status: int
    content_type: str
    json_body: Any | None
    text_body: str


def request_json(
    base_url: str,
    path: str,
    method: str = "GET",
    body: dict[str, Any] | None = None,
    headers: dict[str, str] | None = None,
) -> HttpResult:
    url = f"{base_url.rstrip('/')}{path}"
    data = None
    request_headers: dict[str, str] = {}
    if headers:
        request_headers.update(headers)
    if body is not None:
        data = json.dumps(body).encode("utf-8")
        request_headers["Content-Type"] = "application/json"

    req = urllib.request.Request(url=url, data=data, method=method, headers=request_headers)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            raw = resp.read()
            content_type = resp.headers.get("Content-Type", "")
            text = raw.decode("utf-8", errors="replace")
            parsed = None
            if "application/json" in content_type:
                try:
                    parsed = json.loads(text)
                except json.JSONDecodeError:
                    parsed = None
            return HttpResult(status=resp.status, content_type=content_type, json_body=parsed, text_body=text)
    except urllib.error.HTTPError as error:
        raw = error.read() if error.fp else b""
        content_type = error.headers.get("Content-Type", "") if error.headers else ""
        text = raw.decode("utf-8", errors="replace")
        parsed = None
        if "application/json" in content_type:
            try:
                parsed = json.loads(text)
            except json.JSONDecodeError:
                parsed = None
        return HttpResult(status=error.code, content_type=content_type, json_body=parsed, text_body=text)


def ensure_json_dict(result: HttpResult) -> dict[str, Any]:
    if isinstance(result.json_body, dict):
        return result.json_body
    return {}


def compare_status(route_name: str, express_result: HttpResult, fastapi_result: HttpResult) -> tuple[bool, str]:
    if express_result.status != fastapi_result.status:
        return (
            False,
            f"{route_name}: status mismatch express={express_result.status} fastapi={fastapi_result.status}",
        )
    return True, f"{route_name}: status {express_result.status}"


def compare_message_when_json(route_name: str, express_result: HttpResult, fastapi_result: HttpResult) -> tuple[bool, str]:
    express_body = ensure_json_dict(express_result)
    fastapi_body = ensure_json_dict(fastapi_result)
    express_message = express_body.get("message")
    fastapi_message = fastapi_body.get("message")
    if express_message != fastapi_message:
        return (
            False,
            f"{route_name}: message mismatch express={express_message!r} fastapi={fastapi_message!r}",
        )
    return True, f"{route_name}: message parity ok"


def compare_health(express_base: str, fastapi_base: str) -> list[tuple[bool, str]]:
    route = "/api/health"
    express_result = request_json(express_base, route)
    fastapi_result = request_json(fastapi_base, route)
    checks = [compare_status(route, express_result, fastapi_result)]
    express_keys = set(ensure_json_dict(express_result).keys())
    fastapi_keys = set(ensure_json_dict(fastapi_result).keys())
    if express_keys != fastapi_keys:
        checks.append((False, f"{route}: key mismatch express={sorted(express_keys)} fastapi={sorted(fastapi_keys)}"))
    else:
        checks.append((True, f"{route}: keys parity ok"))
    return checks


def compare_lessons(express_base: str, fastapi_base: str, language: str) -> list[tuple[bool, str]]:
    query = urllib.parse.urlencode({"language": language})
    route = f"/api/lessons?{query}"
    express_result = request_json(express_base, route)
    fastapi_result = request_json(fastapi_base, route)
    checks = [compare_status(route, express_result, fastapi_result)]
    if express_result.status == 200 and fastapi_result.status == 200:
        express_body = express_result.json_body if isinstance(express_result.json_body, list) else []
        fastapi_body = fastapi_result.json_body if isinstance(fastapi_result.json_body, list) else []
        if not express_body or not fastapi_body:
            checks.append((False, f"{route}: one side returned empty/non-list lessons"))
            return checks
        required = {
            "level",
            "unit",
            "topic",
            "english",
            "burmese",
            "pronunciation",
            "groupId",
            "unitId",
            "orderIndex",
        }
        express_keys = set(express_body[0].keys())
        fastapi_keys = set(fastapi_body[0].keys())
        missing_in_fastapi = sorted(required - fastapi_keys)
        if missing_in_fastapi:
            checks.append((False, f"{route}: fastapi missing keys {missing_in_fastapi}"))
        else:
            checks.append((True, f"{route}: required lesson keys present"))
        if required - express_keys:
            checks.append((False, f"{route}: express missing required keys unexpectedly"))
    else:
        checks.append(compare_message_when_json(route, express_result, fastapi_result))
    return checks


def compare_error_route(
    express_base: str,
    fastapi_base: str,
    method: str,
    route: str,
    body: dict[str, Any] | None = None,
) -> list[tuple[bool, str]]:
    express_result = request_json(express_base, route, method=method, body=body)
    fastapi_result = request_json(fastapi_base, route, method=method, body=body)
    return [compare_status(route, express_result, fastapi_result), compare_message_when_json(route, express_result, fastapi_result)]


def compare_binary_status(express_base: str, fastapi_base: str, route: str) -> tuple[bool, str]:
    express_result = request_json(express_base, route)
    fastapi_result = request_json(fastapi_base, route)
    return compare_status(route, express_result, fastapi_result)


def main() -> int:
    parser = argparse.ArgumentParser(description="Route parity check between Express and FastAPI backends.")
    parser.add_argument("--express", default="http://localhost:4000", help="Express base URL")
    parser.add_argument("--fastapi", default="http://localhost:4001", help="FastAPI base URL")
    parser.add_argument("--language", default="english", help="Language for /api/lessons check")
    parser.add_argument("--hsk-language", default="hsk1", help="HSK language for cover/audio checks")
    parser.add_argument("--hsk-unit", default="1.1", help="HSK unit code for audio check")
    parser.add_argument("--profile-name", default="parity-check", help="Profile name for progress read check")
    parser.add_argument(
        "--profile-secret",
        default="parity-check-secret-1234567890",
        help="Profile secret header for progress checks",
    )
    args = parser.parse_args()

    checks: list[tuple[bool, str]] = []
    checks.extend(compare_health(args.express, args.fastapi))
    checks.extend(compare_lessons(args.express, args.fastapi, args.language))
    checks.extend(compare_error_route(args.express, args.fastapi, "GET", "/api/progress"))
    checks.extend(
        compare_error_route(
            args.express,
            args.fastapi,
            "PUT",
            "/api/progress",
            body={"currentIndex": 1},
        )
    )
    progress_route = f"/api/progress?{urllib.parse.urlencode({'profileName': args.profile_name})}"
    progress_headers = {"X-Profile-Secret": args.profile_secret}
    checks.append(
        compare_status(
            progress_route,
            request_json(args.express, progress_route, headers=progress_headers),
            request_json(args.fastapi, progress_route, headers=progress_headers),
        )
    )
    checks.append(compare_binary_status(args.express, args.fastapi, f"/api/lesson-cover/{args.hsk_language}"))
    checks.append(compare_binary_status(args.express, args.fastapi, f"/api/hsk-audio/{args.hsk_language}/{args.hsk_unit}"))

    failures = [message for ok, message in checks if not ok]
    for ok, message in checks:
        prefix = "PASS" if ok else "FAIL"
        print(f"[{prefix}] {message}")

    if failures:
        print(f"\nParity failed: {len(failures)} check(s) failed.")
        return 1

    print("\nParity passed: all checks matched.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

