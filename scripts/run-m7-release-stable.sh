#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SOURCE="$ROOT/scripts/run-m7-release.sh"
PATCHED="$ROOT/scripts/release-runner-patched.sh"
PATCH_LOG="$ROOT/release-runner-patch.log"
rm -f "$PATCHED" "$PATCH_LOG"

python - "$SOURCE" "$PATCHED" >"$PATCH_LOG" 2>&1 <<'PY'
from pathlib import Path
import sys

source = Path(sys.argv[1]).read_text()
patched_path = Path(sys.argv[2])

replacements = [
    (
        'cleanup() {\n  local exit_code=$?\n  set +e\n  cd "$ROOT/backend"',
        'cleanup() {\n  local exit_code=$?\n  local original_dir="$PWD"\n  set +e\n  cd "$ROOT/backend"',
        'cleanup entry',
    ),
    (
        '  CLEANED=1\n  set -e\n  return "$exit_code"\n}',
        '  CLEANED=1\n  cd "$original_dir" || cd "$ROOT"\n  set -e\n  return "$exit_code"\n}',
        'cleanup return',
    ),
    (
        'grep -q \'const releasedIds=\\["V1-M03","V1-M04","V1-M05","V1-M06"\\]\' assets/js/mission-release-manifest.js\ngrep -q \'const livePassedIds=\\["V1-M03","V1-M04","V1-M05","V1-M06"\\]\' assets/js/mission-release-manifest.js',
        'grep -Eq \'const releasedIds=\\["V1-M03","V1-M04","V1-M05","V1-M06"(,"V1-M07")?\\]\' assets/js/mission-release-manifest.js\ngrep -Eq \'const livePassedIds=\\["V1-M03","V1-M04","V1-M05","V1-M06"(,"V1-M07")?\\]\' assets/js/mission-release-manifest.js',
        'idempotent manifest preflight',
    ),
    (
        'node scripts/promote-mission.mjs "$MISSION_ID"',
        'if grep -q \'const releasedIds=.*"V1-M07"\' assets/js/mission-release-manifest.js; then echo "V1-M07 is already promoted; preserving the existing release state."; else node scripts/promote-mission.mjs "$MISSION_ID"; fi',
        'idempotent promotion',
    ),
]
for old, new, label in replacements:
    if source.count(old) != 1:
        raise SystemExit(f'{label} marker count was {source.count(old)}, expected 1')
    source = source.replace(old, new, 1)

old_line = '''code="$(curl -sS -o unauthorized-before.json -w '%{http_code}' -X POST "$API_URL/internal/release-test/$MISSION_ID/needs_evidence")"'''
readiness = '''# Require three consecutive authenticated observations of the same pilot family.
# This distinguishes Cloudflare propagation delay from a genuine endpoint failure.
ready_streak=0
last_status=""
for readiness_attempt in $(seq 1 24); do
  last_status="$(curl -sS -o readiness.json -w '%{http_code}' -H "Authorization: Bearer $RELEASE_TEST_TOKEN" "$API_URL/internal/release-test/views" || true)"
  if [ "$last_status" = 200 ] && jq -e --arg mission "$MISSION_ID" '.learner.status == 200 and .parent.status == 200 and ([.learner.body.progress[] | select(.mission_id == $mission)] | length) == 1' readiness.json >/dev/null; then
    ready_streak=$((ready_streak + 1))
    echo "Pilot readiness observation $ready_streak/3 succeeded."
    if [ "$ready_streak" -eq 3 ]; then break; fi
  elif [ "$last_status" = 401 ] || [ "$last_status" = 404 ] || [ "$last_status" = 409 ] || [ "$last_status" = 500 ]; then
    echo "Pilot propagation pending: HTTP $last_status; resetting readiness streak."
    ready_streak=0
  else
    echo "Genuine readiness failure: HTTP $last_status" >&2
    cat readiness.json >&2 || true
    exit 1
  fi
  sleep 5
done
if [ "$ready_streak" -ne 3 ]; then
  echo "Pilot token/configuration never became consistently observable; last HTTP $last_status" >&2
  cat readiness.json >&2 || true
  exit 1
fi

code="$(curl -sS -o unauthorized-before.json -w '%{http_code}' -X POST "$API_URL/internal/release-test/$MISSION_ID/needs_evidence")"'''
if source.count(old_line) != 1:
    raise SystemExit(f'pilot readiness marker count was {source.count(old_line)}, expected 1')
source = source.replace(old_line, readiness, 1)

old_cleanup_call = '''trap - ERR INT TERM
cleanup

# Confirm cleanup in D1 before promotion commit.
cd backend'''
new_cleanup_call = '''trap - ERR INT TERM
cleanup

# Regression guard for failed run 29569402995.
test "$PWD" = "$ROOT"
test -f "$ROOT/backend/wrangler.toml"

# Confirm cleanup in D1 before promotion commit.
cd backend'''
if source.count(old_cleanup_call) != 1:
    raise SystemExit(f'manual-cleanup marker count was {source.count(old_cleanup_call)}, expected 1')
source = source.replace(old_cleanup_call, new_cleanup_call, 1)

old_health = '''sleep 20

curl --fail-with-body -sS "$API_URL/health" > health.json
jq -e --arg version "$PROMOTION_COMMIT" --arg hash "$SOURCE_HASH" '.ok == true and .entrypoint == "production" and .source_version == $version and .source_sha256 == $hash' health.json'''
new_health = '''# Require three consecutive production identity observations. A plain health 200
# without production metadata is treated as propagation delay, not success.
production_ready_streak=0
production_last_status=""
for production_attempt in $(seq 1 30); do
  production_last_status="$(curl -sS -o health.json -w '%{http_code}' "$API_URL/health" || true)"
  if [ "$production_last_status" = 200 ] && jq -e --arg version "$PROMOTION_COMMIT" --arg hash "$SOURCE_HASH" '.ok == true and .entrypoint == "production" and .source_version == $version and .source_sha256 == $hash' health.json >/dev/null; then
    production_ready_streak=$((production_ready_streak + 1))
    echo "Production identity observation $production_ready_streak/3 succeeded."
    if [ "$production_ready_streak" -eq 3 ]; then break; fi
  elif [ "$production_last_status" = 200 ] || [ "$production_last_status" = 404 ] || [ "$production_last_status" = 500 ]; then
    echo "Production deployment propagation pending: HTTP $production_last_status; resetting readiness streak."
    production_ready_streak=0
  else
    echo "Genuine production health failure: HTTP $production_last_status" >&2
    cat health.json >&2 || true
    exit 1
  fi
  sleep 5
done
if [ "$production_ready_streak" -ne 3 ]; then
  echo "Production identity never became consistently observable." >&2
  cat health.json >&2 || true
  exit 1
fi'''
if source.count(old_health) != 1:
    raise SystemExit(f'production health marker count was {source.count(old_health)}, expected 1')
source = source.replace(old_health, new_health, 1)

patched_path.write_text(source)
print('Patched runner created successfully.')
PY

chmod +x "$PATCHED"
bash -n "$PATCHED"
grep -q 'local original_dir="$PWD"' "$PATCHED"
grep -q 'ready_streak=0' "$PATCHED"
grep -q 'production_ready_streak=0' "$PATCHED"
grep -q 'already promoted' "$PATCHED"
grep -q 'test "$PWD" = "$ROOT"' "$PATCHED"

echo "Patched runner syntax, idempotent promotion, pilot readiness, production readiness, and cleanup guards verified." | tee -a "$PATCH_LOG"
exec bash "$PATCHED"
