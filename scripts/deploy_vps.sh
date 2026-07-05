#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="${REPO_DIR:-/opt/duolingo}"
DEPLOY_REF="${DEPLOY_REF:-main}"
FRONTEND_DIR="${FRONTEND_DIR:-frontend}"
STATIC_DIR="${STATIC_DIR:-/var/www/duolingo}"
BACKEND_SERVICE="${BACKEND_SERVICE:-duolingo-backend.service}"
BACKEND_HEALTH_URL="${BACKEND_HEALTH_URL:-http://127.0.0.1:8010/api/health}"
PUBLIC_HEALTH_URL="${PUBLIC_HEALTH_URL:-https://duolingo.kyawhtet.com/api/health}"
BACKEND_ENV_FILE="${BACKEND_ENV_FILE:-$REPO_DIR/backend_fastapi/.env}"
FRONTEND_ENV_FILE="${FRONTEND_ENV_FILE:-$REPO_DIR/frontend/.env.production}"
DEPLOY_ENV_PAYLOAD_B64="${DEPLOY_ENV_PAYLOAD_B64:-}"

SKIP_GIT_PULL="${SKIP_GIT_PULL:-false}"

wait_for_url() {
  local url="$1"
  local label="$2"
  local max_attempts="${3:-20}"
  local sleep_seconds="${4:-2}"
  local attempt=1

  while (( attempt <= max_attempts )); do
    if curl -fsS "$url" >/dev/null 2>&1; then
      echo "[deploy] ${label} is healthy on attempt ${attempt}"
      return 0
    fi
    echo "[deploy] waiting for ${label} (${attempt}/${max_attempts})"
    sleep "$sleep_seconds"
    ((attempt++))
  done

  echo "[deploy] ${label} did not become healthy in time"
  return 1
}

upsert_env_var() {
  local env_file="$1"
  local key="$2"
  local value="$3"
  local tmp_file
  tmp_file="$(mktemp)"

  mkdir -p "$(dirname "$env_file")"
  touch "$env_file"

  awk -v k="$key" -v v="$value" '
    BEGIN { replaced = 0 }
    {
      if ($0 ~ ("^" k "=")) {
        if (!replaced) {
          print k "=" v
          replaced = 1
        }
        next
      }
      print
    }
    END {
      if (!replaced) {
        print k "=" v
      }
    }
  ' "$env_file" > "$tmp_file"

  mv "$tmp_file" "$env_file"
}

apply_deploy_env_payload() {
  if [[ -z "$DEPLOY_ENV_PAYLOAD_B64" ]]; then
    echo "[deploy] no env payload provided; using existing env files"
    return 0
  fi

  local decoded_payload_file
  decoded_payload_file="$(mktemp)"
  if ! printf '%s' "$DEPLOY_ENV_PAYLOAD_B64" | base64 --decode > "$decoded_payload_file" 2>/dev/null; then
    echo "[deploy] failed to decode DEPLOY_ENV_PAYLOAD_B64"
    rm -f "$decoded_payload_file"
    return 1
  fi

  local applied_keys=()
  while IFS='=' read -r raw_key raw_value; do
    local key="${raw_key//$'\r'/}"
    local value="${raw_value%$'\r'}"
    if [[ -z "$key" || "$key" == \#* ]]; then
      continue
    fi
    if [[ ! "$key" =~ ^[A-Z0-9_]+$ ]]; then
      echo "[deploy] skipped invalid env key: $key"
      continue
    fi

    if [[ "$key" == VITE_* ]]; then
      upsert_env_var "$FRONTEND_ENV_FILE" "$key" "$value"
      if [[ "$key" == "VITE_SUPABASE_ANON_KEY" ]]; then
        upsert_env_var "$BACKEND_ENV_FILE" "SUPABASE_ANON_KEY" "$value"
      fi
    else
      upsert_env_var "$BACKEND_ENV_FILE" "$key" "$value"
    fi
    applied_keys+=("$key")
  done < "$decoded_payload_file"
  rm -f "$decoded_payload_file"

  if (( ${#applied_keys[@]} > 0 )); then
    echo "[deploy] applied env keys (${#applied_keys[@]}): ${applied_keys[*]}"
    echo "[deploy] backend env file: $BACKEND_ENV_FILE"
    echo "[deploy] frontend env file: $FRONTEND_ENV_FILE"
  else
    echo "[deploy] env payload was empty; no env keys applied"
  fi
}

echo "[deploy] repo=$REPO_DIR ref=$DEPLOY_REF skip_git_pull=$SKIP_GIT_PULL"
cd "$REPO_DIR"

if [[ "$SKIP_GIT_PULL" != "true" ]]; then
  echo "[deploy] syncing git branch"
  git fetch origin
  git checkout "$DEPLOY_REF"
  git pull --ff-only origin "$DEPLOY_REF"
fi

apply_deploy_env_payload

echo "[deploy] building frontend"
cd "$FRONTEND_DIR"
if [[ -f package-lock.json ]]; then
  npm ci --silent
else
  npm install --silent
fi
npm run build

echo "[deploy] publishing frontend to $STATIC_DIR"
sudo rsync -a --delete --chown=www-data:www-data dist/ "$STATIC_DIR"/

echo "[deploy] restarting backend and reloading nginx"
sudo systemctl restart "$BACKEND_SERVICE"
sudo systemctl reload nginx

echo "[deploy] health checks"
wait_for_url "$BACKEND_HEALTH_URL" "backend"
curl -fsS "$BACKEND_HEALTH_URL"
echo
wait_for_url "$PUBLIC_HEALTH_URL" "public endpoint"
curl -fsS "$PUBLIC_HEALTH_URL"
echo

echo "[deploy] deployed commit $(git -C "$REPO_DIR" rev-parse --short HEAD)"
