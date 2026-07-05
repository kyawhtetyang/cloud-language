# Backend Runtime Checklist

Use this checklist when validating FastAPI runtime updates.

## 1) Start FastAPI Service

cd backend_fastapi
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --host 0.0.0.0 --port 4001

## 2) Run Contract Tests

cd backend_fastapi
source .venv/bin/activate
python -m unittest tests/test_api_contract.py

## 3) Run Endpoint Parity Check (Optional)

If comparing two backend environments (for example old vs new deploy):

cd backend_fastapi
source .venv/bin/activate
python scripts/parity_check.py \
  --express http://localhost:4000 \
  --fastapi http://localhost:4001 \
  --language english \
  --hsk-language hsk1 \
  --hsk-unit 1.1

Acceptance:
- No `FAIL` lines.
- Script exits with code `0`.

## 4) Smoke Test in UI

- Verify:
  - Library loads
  - Lesson opens
  - HSK cover endpoint works
  - HSK audio endpoint works (or expected fallback path)
  - Progress read/write works

