# CloudLanguage (v0)

Project structure:

- `frontend` - React + TypeScript + Vite client
- `backend_fastapi` - Python + FastAPI API
- `data` - lesson markdown/json and HSK assets

## Features

- Mobile-first layout with bottom tab navigation (`Lesson`, `Road Map`, `Settings`, `Profile`)
- Curriculum view with clickable levels and units
- Roadmap topics generated from lesson data (`level/unit/topic`) instead of duplicated frontend topic maps
- Lesson batches with audio playback
- Lesson and library headers use numeric unit code format (`level.unit`) instead of framework-specific labels
- Random lesson order toggle (shuffle per unit entry, no overlap inside the `3 x 10 = 30` lesson flow)
- Review questions toggle (`On/Off`)
- Pronunciation row toggle (when enabled, pronunciation is shown as the first row in lesson cards)
- Profile progress sync with backend (`/api/progress`)
- Settings persisted per profile in `localStorage` (with legacy global-key fallback migration)

## API

- `GET /api/health`
- `GET /api/lessons?language=english|chinese|hsk_chinese|hsk1...hsk6`
- `GET /api/progress?profileName=<name>`
- `PUT /api/progress`

Lesson records are served from:

- `data/CEFR English/...` and `data/CEFR Chinese/...` markdown collections
- `data/HSK Chinese/...` markdown collections and HSK cover assets
- Optional fallback JSON files:
  - `data/lessons.english.json`
  - `data/lessons.chinese.json`

## Lesson Runtime JSON

- Markdown remains the source of truth for the primary lesson content.
- To prebuild runtime JSON and reduce first-load latency, run:

```bash
cd backend_fastapi
python3 scripts/export_lessons_json.py
```

- This writes generated lesson files into `data/lessons.<language>.json`.
- When those files exist, the backend now prefers them before falling back to live markdown parsing.

`GET /api/lessons` uses DB as the primary source by default.
If DB is unavailable or a lesson language is not seeded yet, it falls back to the corresponding JSON file automatically.

Current curriculum seed size:

- `12 levels`
- Level 1-2 and 4-12: `5 units per level`
- Level 3: `10 units` (including selling/buying expansion)
- `30 lesson items per unit` (no repeat within the `3 x 10` lesson flow)

Each lesson item includes:

- `level`
- `unit`
- `topic`
- `english`
- `burmese`
- `pronunciation`

## PostgreSQL (optional, for profile progress)

Set backend env (see `backend_fastapi/.env.example`):

- `DATABASE_URL=postgres://user:password@host:5432/dbname`
- `FRONTEND_ORIGIN=http://localhost:3000,http://localhost:5173`
- `STORAGE_MODE=json|db`
- `DATA_DIR=../data`
- Optional TLS toggle: `PGSSL=true`
- Optional Supabase JWT verification (Bearer auth):
  - `SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co`
  - `SUPABASE_ANON_KEY=<public_anon_key>`
  - `SUPABASE_JWT_SECRET=<project_jwt_secret>`
  - `SUPABASE_JWT_AUDIENCE=authenticated`

Progress is saved in table `user_progress` (auto-created on first read/write).

Lessons are DB-primary by default.
If you want JSON-only lesson mode for local troubleshooting:

- Set `STORAGE_MODE=json`

If you want lessons from Postgres:

- Create/populate table `lessons` with columns:
  - `id` (for ordering)
  - `language`
  - `level`
  - `unit`
  - `topic`
  - `english`
  - `burmese`
  - `pronunciation`

## Settings persistence model

- Backend: settings are stored per `profileName` through `PUT /api/progress`.
- Frontend localStorage: settings are stored per profile key (`<setting_key>:<profile_id>`).
- Legacy support: if profile-scoped key does not exist, frontend falls back to older global setting keys.

## Run locally

Backend:

1. `cd /Users/kyawhtet/Documents/EDU/CS/02_Web/01_Cloud_Language/v0/backend_fastapi`
2. `python3 -m venv .venv`
3. `source .venv/bin/activate`
4. `pip install -r requirements.txt`
5. `cp .env.example .env`
6. `python run.py`

Frontend:

1. `cd /Users/kyawhtet/Documents/EDU/CS/02_Web/01_Cloud_Language/v0/frontend`
2. `npm install`
3. `cp .env.example .env.local`
4. `npm run dev`

Default local URLs:

- Backend: `http://localhost:4000`
- Frontend: `http://localhost:3000`

## Render deploy (FastAPI + Postgres)

This repo includes a Render blueprint at:

- `/Users/kyawhtet/Documents/EDU/CS/02_Web/01_Cloud_Language/v0/render.yaml`

It provisions:

- a FastAPI web service (`backend_fastapi`)
- a managed Postgres database

Important before production:

- Set `FRONTEND_ORIGIN` in Render env to your real frontend URL.

## Deployment Runbook

- Frozen production deploy flow:
  - `/Users/kyawhtet/Documents/EDU/CS/02_Web/01_Cloud_Language/v0/DEPLOY_RUNBOOK.md`
