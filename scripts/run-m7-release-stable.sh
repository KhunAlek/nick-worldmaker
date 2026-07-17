#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SOURCE="$ROOT/scripts/run-m7-release.sh"
PATCHED="$ROOT/release-runner-patched.sh"
PATCH_LOG="$ROOT/release-runner-patch.log"
rm -f "$PATCHED" "$PATCH_LOG"

python - "$SOURCE" "$PATCHED" >"$PATCH_LOG" 2>&1 <<'PY'
from pathlib import Path
import sys

source_path = Path(sys.argv[1])
patched_path = Path(sys.argv[2])
source = source_path.read_text()

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
    raise SystemExit(f'readiness marker count was {source.count(old_line)}, expected 1')
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

patched_path.write_text(source)
print('Patched runner created successfully.')
PY

chmod +x "$PATCHED"
bash -n "$PATCHED"
grep -q 'local original_dir="$PWD"' "$PATCHED"
grep -q 'ready_streak=0' "$PATCHED"
grep -q 'test "$PWD" = "$ROOT"' "$PATCHED"

echo "Patched runner syntax and regression guards verified." | tee -a "$PATCH_LOG"
exec bash "$PATCHED"
