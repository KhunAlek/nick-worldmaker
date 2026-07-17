#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SOURCE="$ROOT/scripts/run-m7-release.sh"
PATCHED="$(mktemp)"
trap 'rm -f "$PATCHED"' EXIT

python - "$SOURCE" "$PATCHED" <<'PY'
from pathlib import Path
import sys

source = Path(sys.argv[1]).read_text()

old_cleanup = '''cleanup() {
  local exit_code=$?
  set +e
  cd "$ROOT/backend"'''
new_cleanup = '''cleanup() {
  local exit_code=$?
  local original_dir="$PWD"
  set +e
  cd "$ROOT/backend"'''
if old_cleanup not in source:
    raise SystemExit("cleanup function marker changed; refusing an unverified release")
source = source.replace(old_cleanup, new_cleanup, 1)

old_return = '''  CLEANED=1
  set -e
  return "$exit_code"
}'''
new_return = '''  CLEANED=1
  cd "$original_dir" || cd "$ROOT"
  set -e
  return "$exit_code"
}'''
if old_return not in source:
    raise SystemExit("cleanup return marker changed; refusing an unverified release")
source = source.replace(old_return, new_return, 1)

readiness_marker = '''sleep 35

code="$(curl -sS -o unauthorized-before.json'''
readiness = '''sleep 35

# Require three consecutive authenticated observations of the same pilot family.
# A single 200 can come from one Cloudflare edge while another still has stale
# token or pilot configuration, so fixtures do not start until readiness is stable.
ready_streak=0
last_status=""
for readiness_attempt in $(seq 1 24); do
  last_status="$(curl -sS -o readiness.json -w '%{http_code}' \
    -H "Authorization: Bearer $RELEASE_TEST_TOKEN" \
    "$API_URL/internal/release-test/views" || true)"
  if [ "$last_status" = 200 ] && jq -e --arg mission "$MISSION_ID" \
      '.learner.status == 200 and .parent.status == 200 and ([.learner.body.progress[] | select(.mission_id == $mission)] | length) == 1' \
      readiness.json >/dev/null; then
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

code="$(curl -sS -o unauthorized-before.json'''
if readiness_marker not in source:
    raise SystemExit("readiness insertion marker changed; refusing an unverified release")
source = source.replace(readiness_marker, readiness, 1)

old_manual_cleanup = '''trap - ERR INT TERM
cleanup

# Confirm cleanup in D1 before promotion commit.
cd backend'''
new_manual_cleanup = '''trap - ERR INT TERM
cleanup

# Regression guard for run 29569402995: cleanup must not leave the caller in
# backend/, otherwise the next `cd backend` resolves to backend/backend.
test "$PWD" = "$ROOT"
test -f "$ROOT/backend/wrangler.toml"

# Confirm cleanup in D1 before promotion commit.
cd backend'''
if old_manual_cleanup not in source:
    raise SystemExit("manual cleanup marker changed; refusing an unverified release")
source = source.replace(old_manual_cleanup, new_manual_cleanup, 1)

Path(sys.argv[2]).write_text(source)
PY

chmod +x "$PATCHED"
bash -n "$PATCHED"

grep -q 'local original_dir="$PWD"' "$PATCHED"
grep -q 'ready_streak=0' "$PATCHED"
grep -q 'test "$PWD" = "$ROOT"' "$PATCHED"

exec bash "$PATCHED"
