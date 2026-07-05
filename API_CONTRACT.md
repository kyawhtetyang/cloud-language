# API Contract (Phase 1 Freeze)

This document freezes the current backend API contract before FastAPI migration.

Source of truth:
- `backend/server.js`
- `backend/server.test.js`

## Base
- Base path: `/api`
- Content type: JSON for standard endpoints
- Asset endpoints return files when found

## Profile Auth Header

Profile-owned endpoints support either:

- `Authorization: Bearer <supabase_access_token>` (preferred)
- `X-Profile-Secret: <opaque secret>` (legacy fallback)

Current behavior:

- Missing `profileName` in legacy mode (no Bearer token): `400`
- Missing auth header when `profileName` is provided in legacy mode: `401`
- Header too short: `400`
- Wrong secret for existing profile: `403`
- Repeated wrong secrets: `429` (with `Retry-After` response header)

## GET `/api/health`
Response `200`:
{
  "status": "ok",
  "storageMode": "json | db"
}

## GET `/api/lesson-cover/:language`
- `:language` must be `hsk1`..`hsk6` (case-insensitive input, normalized lower)

Responses:
- `200`: image file
- `404`:
{ "message": "Cover not found" }
- `500`:
{ "message": "Failed to load lesson cover" }

## GET `/api/hsk-audio/:language/:unitCode`
- `:language` must be `hsk1`..`hsk6`
- `:unitCode` format normalized as `N.M` and validated against language level

Responses:
- `200`: audio file
- `404`:
{ "message": "Audio not found" }
- `500`:
{ "message": "Failed to load hsk audio" }

## GET `/api/lessons`
Query:
- `language` (optional). Unknown values fallback to default language.

Response `200`: array of lesson records.

Lesson record shape:
{
  "level": 1,
  "unit": 1,
  "topic": "string",
  "english": "string",
  "burmese": "string",
  "pronunciation": "string",
  "audioPath": "string (optional)",
  "groupId": "string",
  "unitId": 1,
  "orderIndex": 1,
  "sourceLabel": "string (optional)",
  "collectionLabel": "string (optional)",
  "trackId": "string (optional)",
  "levelScheme": "string (optional)",
  "levelCode": "string (optional)",
  "levelOrder": "number (optional)",
  "framework": "cefr | hsk | jlpt | custom (optional)",
  "frameworkLevel": "display level label such as A1 / HSK 1 / JLPT N5 (optional)",
  "frameworkUnit": "number within framework level (optional)",
  "translations": "{ \"english\": \"...\", \"vietnamese\": \"...\", \"burmese\": \"...\" } (optional)"
}

Error `500`:
{ "message": "Failed to load lessons" }

## GET `/api/progress`
Query:
- `profileName` (required for legacy `X-Profile-Secret` mode; optional for Bearer mode)

Header:
- `Authorization: Bearer <supabase_access_token>` OR `X-Profile-Secret`

Responses:
- `200`:
{
  "currentIndex": 0,
  "unlockedLevel": 1,
  "streak": 0,
  "learnLanguage": "english",
  "defaultLanguage": "burmese",
  "isPronunciationEnabled": false,
  "textScalePercent": 100,
  "isBoldTextEnabled": false,
  "isRandomLessonOrderEnabled": false,
  "isReviewQuestionsRemoved": false
}
- `400`:
{ "message": "profileName is required" }
- `404`:
{ "message": "Progress not found" }
- `429`:
{ "message": "Too many failed profile secret attempts. Try again later." }
- `503`:
{
  "message": "Progress storage unavailable. Configure DATABASE_URL for PostgreSQL.",
  "fallback": {
    "currentIndex": 0,
    "unlockedLevel": 1,
    "streak": 0,
    "learnLanguage": "english",
    "defaultLanguage": "burmese",
    "isPronunciationEnabled": false,
    "textScalePercent": 100,
    "isBoldTextEnabled": false,
    "isRandomLessonOrderEnabled": false,
    "isReviewQuestionsRemoved": false
  }
}

## PUT `/api/progress`
Body:
{
  "profileName": "required string in legacy mode, optional in Bearer mode",
  "currentIndex": 0,
  "unlockedLevel": 1,
  "streak": 0,
  "learnLanguage": "english",
  "defaultLanguage": "burmese",
  "isPronunciationEnabled": false,
  "textScalePercent": 100,
  "isBoldTextEnabled": false,
  "isRandomLessonOrderEnabled": false,
  "isReviewQuestionsRemoved": false
}

Header:
- `Authorization: Bearer <supabase_access_token>` OR `X-Profile-Secret`

Responses:
- `200`:
{
  "ok": true,
  "progress": {
    "currentIndex": 0,
    "unlockedLevel": 1,
    "streak": 0,
    "learnLanguage": "english",
    "defaultLanguage": "burmese",
    "isPronunciationEnabled": false,
    "textScalePercent": 100,
    "isBoldTextEnabled": false,
    "isRandomLessonOrderEnabled": false,
    "isReviewQuestionsRemoved": false
  }
}
- `400`:
{ "message": "profileName is required" }
- `429`:
{ "message": "Too many failed profile secret attempts. Try again later." }
- `503`:
{ "message": "Progress storage unavailable. Configure DATABASE_URL for PostgreSQL." }

## Migration Rule
FastAPI Phase 2+ must keep:
- Same routes and HTTP methods
- Same required params
- Same status codes
- Same top-level JSON keys and meanings

