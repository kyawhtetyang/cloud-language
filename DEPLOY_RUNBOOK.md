# Step 4: Production Deploy Runbook (Frozen)

This file is the canonical deploy flow.
Use these exact commands to avoid drift.

## 1) Stack Modes

Two separate production paths are supported:

1. `VPS frontend + VPS backend`
2. `Vercel frontend + Render backend`

Current known IDs/hosts:

- Render backend service id: `srv-d6drsli4d50c73b27j90`
- Render backend URL: `https://duolingo-backend-fastapi.onrender.com`
- Vercel alias URL: `https://frontend-nine-xi-21.vercel.app`
- VPS app repo path: `/opt/duolingo`
- VPS static frontend path: `/var/www/duolingo`
- VPS backend service: `duolingo-backend.service`
- VPS backend bind: `127.0.0.1:8010` (behind nginx)

## 2) Prerequisites

Run from local machine:

cd /Users/kyawhtet/Documents/EDU/CS/02_Web/01_Cloud_Language/v0
git checkout main
git pull --ff-only origin main

If pushing new changes first:

git add <files>
git commit -m "your message"
git push origin main

## 2.5) One-Click GitHub Deploy Setup

Workflow file: `.github/workflows/deploy-vps.yml`

Required GitHub repository secrets:

- `VPS_HOST` (example: `38.54.32.58`)
- `VPS_USER` (example: `kyaw`)
- `VPS_SSH_KEY` (private key that can SSH to VPS and run sudo deploy commands)

Optional GitHub repository variables:

- `VPS_REPO_DIR` (default: `/opt/duolingo`)
- `VPS_BACKEND_SERVICE` (default: `duolingo-backend.service`)
- `VPS_STATIC_DIR` (default: `/var/www/duolingo`)
- `VPS_PUBLIC_HEALTH_URL` (default: `https://duolingo.kyawhtet.com/api/health`)
- `VPS_BACKEND_ENV_FILE` (default: `/opt/duolingo/backend_fastapi/.env`)
- `VPS_FRONTEND_ENV_FILE` (default: `/opt/duolingo/frontend/.env.production`)

If Supabase auth is enabled, add these repository variables/secrets:

- Variables:
  - `SUPABASE_URL`
  - `SUPABASE_JWT_ISSUER` (optional; auto-derived from `SUPABASE_URL` if blank)
  - `SUPABASE_JWT_AUDIENCE` (default: `authenticated`)
  - `VITE_SUPABASE_URL`
  - `VITE_API_BASE_URL`
- Secrets:
  - `SUPABASE_JWT_SECRET`
  - `SUPABASE_ANON_KEY` (or reuse `VITE_SUPABASE_ANON_KEY` for backend verification path)
  - `VITE_SUPABASE_ANON_KEY`

Behavior:

- Push to `main` triggers auto deploy to VPS.
- You can also run it manually via **Actions -> Deploy VPS -> Run workflow**.
- Workflow injects provided env keys into:
  - backend: `/opt/duolingo/backend_fastapi/.env` (or `VPS_BACKEND_ENV_FILE`)
  - frontend build: `/opt/duolingo/frontend/.env.production` (or `VPS_FRONTEND_ENV_FILE`)

## 3) Deploy Path A: VPS Frontend + VPS Backend


ssh vps 'cd /opt/duolingo && git fetch origin && git checkout main && git pull --ff-only origin main'


ssh vps 'set -e; cd /opt/duolingo/frontend; npm install --silent; npm run build; sudo rsync -a --delete --chown=www-data:www-data dist/ /var/www/duolingo/'


ssh vps 'sudo systemctl restart duolingo-backend.service && sudo systemctl reload nginx'


ssh vps 'systemctl is-active duolingo-backend.service && systemctl is-active nginx'
ssh vps 'curl -fsS http://127.0.0.1:8010/api/health && echo'
ssh vps 'curl -fsSL https://duolingo.kyawhtet.com/api/health && echo'
ssh vps 'curl -I -s https://duolingo.kyawhtet.com/ | head -n 1'

Expected:

- services are `active`
- health returns `{"status":"ok",...}`
- homepage returns `HTTP/1.1 200 OK`


ssh vps 'awk -F= '\''/^(SUPABASE_URL|SUPABASE_JWT_SECRET|SUPABASE_JWT_ISSUER|SUPABASE_JWT_AUDIENCE)=/{print $1"=***"}'\'' /opt/duolingo/backend_fastapi/.env'
ssh vps 'awk -F= '\''/^(VITE_SUPABASE_URL|VITE_SUPABASE_ANON_KEY|VITE_API_BASE_URL)=/{print $1"=***"}'\'' /opt/duolingo/frontend/.env.production'

## 4) Deploy Path B: Vercel Frontend + Render Backend


printf '%s' 'YOUR_RENDER_API_KEY' > /tmp/render_api_key
chmod 600 /tmp/render_api_key

printf '%s' 'YOUR_VERCEL_TOKEN' > /tmp/vercel_token
chmod 600 /tmp/vercel_token


KEY=$(cat /tmp/render_api_key)
SID="srv-d6drsli4d50c73b27j90"
curl -sS -X POST \
  -H "Authorization: Bearer $KEY" \
  -H "Content-Type: application/json" \
  -d '{"clearCache":"do_not_clear"}' \
  "https://api.render.com/v1/services/$SID/deploys"


cd /Users/kyawhtet/Documents/EDU/CS/02_Web/01_Cloud_Language/v0/frontend
TOKEN=$(cat /tmp/vercel_token)
npx --yes vercel deploy --prod --yes --token "$TOKEN" \
  --build-env VITE_API_BASE_URL=https://duolingo-backend-fastapi.onrender.com


curl -fsSL https://duolingo-backend-fastapi.onrender.com/api/health && echo
curl -I -s https://frontend-nine-xi-21.vercel.app/ | head -n 1

Optional verify Vercel bundle target:

URL=https://frontend-nine-xi-21.vercel.app
JS_PATH=$(curl -fsSL "$URL" | grep -oE '/assets/index-[^" ]+\.js' | head -n1)
curl -fsSL "$URL$JS_PATH" | grep -o 'https://[^"[:space:]]*onrender\.com' | sort -u

## 5) Rollback (Fast)


cd /Users/kyawhtet/Documents/EDU/CS/02_Web/01_Cloud_Language/v0
git checkout main
git log --oneline -n 20
# revert latest commit (or repeat as needed)
git revert --no-edit HEAD
git push origin main


Run section `3` for VPS stack or section `4` for Vercel+Render stack.


# on VPS, temporarily serve known-good commit
ssh vps 'cd /opt/duolingo && git log --oneline -n 20'
ssh vps 'cd /opt/duolingo && git checkout GOOD_COMMIT'
ssh vps 'cd /opt/duolingo/frontend && npm run build && sudo rsync -a --delete --chown=www-data:www-data dist/ /var/www/duolingo/'
ssh vps 'sudo systemctl restart duolingo-backend.service && sudo systemctl reload nginx'

## 6) Secrets Cleanup (Mandatory)

rm -f /tmp/render_api_key /tmp/vercel_token

## 7) Quick Decision Rule

- Use `Path A` when `duolingo.kyawhtet.com` is primary.
- Use `Path B` when Vercel frontend is primary.
- Keep both healthy; only one should be canonical for users.

