# FastAPI Backend

This is the primary backend runtime for the app.

Current scope:
- Config/env parity
- CORS parity
- `/api` routes matching `API_CONTRACT.md`
- Unified standard markdown lesson parser for CEFR + HSK (with DB fallback for lessons)
- Lesson `audioPath` fallback is intentionally disabled for now
- Progress DB read/write (`user_progress` table)
- Profile ownership checks for progress/activity routes via `Authorization: Bearer <supabase_jwt>` (preferred) or `X-Profile-Secret` fallback
- Brute-force lockout for repeated wrong profile secrets (`429` + `Retry-After`)
- Parity tooling (contract test + route parity script)

## Setup

cd backend_fastapi
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
UVICORN_RELOAD=true python run.py

## Notes
- Lesson/content data defaults to `../data` (relative to `backend_fastapi`).
- Override data path with `DATA_DIR` if needed.
- `run.py` now defaults to `reload=false` for safer detached starts. Set `UVICORN_RELOAD=true` only for local interactive development.

## Phase 4 Commands

Run contract tests:
cd backend_fastapi
source .venv/bin/activate
python -m unittest tests/test_api_contract.py

Run content lint (mixed legacy/tagged conflicts + duplicate locale tags):
cd backend_fastapi
source .venv/bin/activate
python -m unittest tests/test_content_lint.py

Run route parity against another backend endpoint:
cd backend_fastapi
source .venv/bin/activate
python scripts/parity_check.py --express http://localhost:4000 --fastapi http://localhost:4001

See full cutover steps:
- `backend_fastapi/SWITCHOVER_CHECKLIST.md`

