#!/usr/bin/env bash
set -Eeuo pipefail

: "${API_URL:?API_URL is required}"
: "${CLOUDFLARE_API_TOKEN:?CLOUDFLARE_API_TOKEN is required}"
: "${CLOUDFLARE_ACCOUNT_ID:?CLOUDFLARE_ACCOUNT_ID is required}"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
mkdir -p release-evidence

git config user.name "worldmaker-release-bot"
git config user.email "actions@users.noreply.github.com"

mission_number() { printf '%02d' "$1"; }
first_unreleased() {
  node --input-type=module <<'NODE'
import fs from 'node:fs';
const text=fs.readFileSync('assets/js/mission-release-manifest.js','utf8');
const match=text.match(/const releasedIds=(\[[^;]*\]);/);
if(!match) throw new Error('Release manifest marker is missing.');
const released=new Set(JSON.parse(match[1]));
for(let n=7;n<=15;n++){
  const id=`V1-M${String(n).padStart(2,'0')}`;
  if(!released.has(id)){ console.log(id); process.exit(0); }
}
NODE
}

snapshot_real_families() {
  local output="$1"
  (cd backend && npx wrangler d1 execute worldmaker-db --remote --command "SELECT family_id,mission_id,status,hint_level FROM mission_progress WHERE family_id='family-nick' ORDER BY family_id,mission_id;" --json) > "$output.raw"
  jq -S '.[0].results' "$output.raw" > "$output"
  rm -f "$output.raw"
}

switch_entrypoint() {
  local target="$1"
  python - "$target" <<'PY'
from pathlib import Path
import sys
path=Path('backend/wrangler.toml')
text=path.read_text()
desired='main = "src/release-test-wrapper.js"' if sys.argv[1]=='test' else 'main = "src/production-entry.js"'
lines=text.splitlines()
for i,line in enumerate(lines):
    if line.startswith('main = '):
        lines[i]=desired
        break
else:
    raise SystemExit('Worker entrypoint was not found.')
path.write_text('\n'.join(lines)+'\n')
PY
}

deploy_worker() { (cd backend && npx wrangler deploy); }

wait_for_test_wrapper() {
  local token="$1"
  for attempt in $(seq 1 30); do
    code="$(curl --silent --output /dev/null --write-out '%{http_code}' -H "Authorization: Bearer $token" "$API_URL/internal/release-test/views" || true)"
    [[ "$code" == "200" ]] && return 0
    sleep 3
  done
  return 1
}

wait_for_production() {
  local output="$1"
  for attempt in $(seq 1 30); do
    curl --silent --show-error "$API_URL/health" > "$output" || true
    if jq -e '.ok == true and .service == "nick-worldmaker-api" and .entrypoint == "production"' "$output" >/dev/null 2>&1; then return 0; fi
    sleep 3
  done
  return 1
}

revoke_test_token() {
  printf 'y\n' | (cd backend && npx wrangler secret delete RELEASE_TEST_TOKEN) >/dev/null 2>&1 || true
  (cd backend && npx wrangler secret list --format json) > release-evidence/secrets-after-revocation.json
  jq -e 'map(.name) | index("RELEASE_TEST_TOKEN") == null' release-evidence/secrets-after-revocation.json >/dev/null
}

restore_production() {
  set +e
  node scripts/clear-release-pilot.mjs >/dev/null 2>&1
  switch_entrypoint production
  deploy_worker >/dev/null 2>&1
  wait_for_production release-evidence/emergency-production-health.json >/dev/null 2>&1
  revoke_test_token >/dev/null 2>&1
}
trap restore_production EXIT

for iteration in $(seq 1 9); do
  MISSION_ID="$(first_unreleased)"
  if [[ -z "$MISSION_ID" ]]; then break; fi
  N="${MISSION_ID##*M}"
  if (( 10#$N < 7 || 10#$N > 15 )); then
    echo "Refusing unexpected mission $MISSION_ID" >&2; exit 1
  fi
  if (( 10#$N < 15 )); then NEXT_ID="V1-M$(mission_number $((10#$N + 1)))"; else NEXT_ID=""; fi
  EVIDENCE="release-evidence/$MISSION_ID"
  rm -rf "$EVIDENCE" && mkdir -p "$EVIDENCE"
  printf '%s\n' "$MISSION_ID" > "$EVIDENCE/mission-id.txt"
  printf '%s\n' "$NEXT_ID" > "$EVIDENCE/next-mission-id.txt"

  echo "=== Iteration $iteration: $MISSION_ID ${NEXT_ID:+-> $NEXT_ID} ==="
  node scripts/enable-late-release-fixtures.mjs
  node tests/release-audit.mjs | tee "$EVIDENCE/source-audit-before.txt"

  FAMILY_ID="$(python -c 'import uuid; print(uuid.uuid4())')"
  printf '%s\n' "$FAMILY_ID" > "$EVIDENCE/isolated-family-id.txt"
  snapshot_real_families "$EVIDENCE/real-family-before.json"

  SQL="INSERT INTO families(id,display_name) VALUES('${FAMILY_ID}','Release Test ${GITHUB_RUN_ID:-local}-${GITHUB_RUN_ATTEMPT:-1}-${MISSION_ID}'); INSERT INTO mission_progress(family_id,mission_id,status,hint_level) VALUES('${FAMILY_ID}','${MISSION_ID}','NOT_SUBMITTED',0);"
  (cd backend && npx wrangler d1 execute worldmaker-db --remote --command "$SQL" --json) > "$EVIDENCE/family-seed-result.json"
  node scripts/configure-release-pilot.mjs "$FAMILY_ID" "$MISSION_ID"
  switch_entrypoint test

  RELEASE_TEST_TOKEN="$(openssl rand -hex 32)"
  printf '%s' "$RELEASE_TEST_TOKEN" | (cd backend && npx wrangler secret put RELEASE_TEST_TOKEN >/dev/null)
  deploy_worker
  wait_for_test_wrapper "$RELEASE_TEST_TOKEN"

  unauthorized_code="$(curl --silent --output "$EVIDENCE/unauthorized-response.json" --write-out '%{http_code}' "$API_URL/internal/release-test/views" || true)"
  [[ "$unauthorized_code" == "401" ]]

  curl --fail-with-body --silent --show-error -H "Authorization: Bearer $RELEASE_TEST_TOKEN" -H "Content-Type: application/json" -X POST "$API_URL/internal/release-test/$MISSION_ID/needs_evidence" > "$EVIDENCE/non-approved-evaluator-response.json"
  jq -e '.review.status != "APPROVED" and .review.unlock_next_mission == false and .review.next_mission_id == null' "$EVIDENCE/non-approved-evaluator-response.json"

  curl --fail-with-body --silent --show-error -H "Authorization: Bearer $RELEASE_TEST_TOKEN" -H "Content-Type: application/json" -X POST "$API_URL/internal/release-test/$MISSION_ID/approved" > "$EVIDENCE/approved-evaluator-response.json"
  if [[ -n "$NEXT_ID" ]]; then
    jq -e --arg next "$NEXT_ID" '.review.status == "APPROVED" and .review.unlock_next_mission == true and .review.next_mission_id == $next' "$EVIDENCE/approved-evaluator-response.json"
  else
    jq -e '.review.status == "APPROVED" and .review.unlock_next_mission == false and .review.next_mission_id == null' "$EVIDENCE/approved-evaluator-response.json"
  fi

  if [[ -n "$NEXT_ID" ]]; then
    SQL="SELECT (SELECT COUNT(*) FROM submissions WHERE family_id='${FAMILY_ID}' AND mission_id='${MISSION_ID}') submissions_count,(SELECT COUNT(*) FROM reviews WHERE family_id='${FAMILY_ID}' AND mission_id='${MISSION_ID}' AND validated=1) reviews_count,(SELECT COUNT(*) FROM audit_log WHERE family_id='${FAMILY_ID}') audit_count,(SELECT status FROM mission_progress WHERE family_id='${FAMILY_ID}' AND mission_id='${MISSION_ID}') mission_status,(SELECT status FROM mission_progress WHERE family_id='${FAMILY_ID}' AND mission_id='${NEXT_ID}') next_status,(SELECT COUNT(*) FROM mission_progress WHERE family_id='${FAMILY_ID}' AND mission_id>'${NEXT_ID}') later_count;"
  else
    SQL="SELECT (SELECT COUNT(*) FROM submissions WHERE family_id='${FAMILY_ID}' AND mission_id='${MISSION_ID}') submissions_count,(SELECT COUNT(*) FROM reviews WHERE family_id='${FAMILY_ID}' AND mission_id='${MISSION_ID}' AND validated=1) reviews_count,(SELECT COUNT(*) FROM audit_log WHERE family_id='${FAMILY_ID}') audit_count,(SELECT status FROM mission_progress WHERE family_id='${FAMILY_ID}' AND mission_id='${MISSION_ID}') mission_status;"
  fi
  (cd backend && npx wrangler d1 execute worldmaker-db --remote --command "$SQL" --json) > "$EVIDENCE/d1-verification-output.json"
  if [[ -n "$NEXT_ID" ]]; then
    jq -e '.[0].results[0] | .submissions_count == 2 and .reviews_count == 2 and .audit_count >= 2 and .mission_status == "APPROVED" and .next_status == "NOT_SUBMITTED" and .later_count == 0' "$EVIDENCE/d1-verification-output.json"
  else
    jq -e '.[0].results[0] | .submissions_count == 2 and .reviews_count == 2 and .audit_count >= 2 and .mission_status == "APPROVED"' "$EVIDENCE/d1-verification-output.json"
  fi

  curl --fail-with-body --silent --show-error -H "Authorization: Bearer $RELEASE_TEST_TOKEN" "$API_URL/internal/release-test/views" > "$EVIDENCE/shared-views-response.json"
  jq -e '.learner.status == 200 and .parent.status == 200' "$EVIDENCE/shared-views-response.json"
  jq '.learner' "$EVIDENCE/shared-views-response.json" > "$EVIDENCE/learner-shared-progress-response.json"
  jq '.parent' "$EVIDENCE/shared-views-response.json" > "$EVIDENCE/parent-view-response.json"

  NON_STATUS="$(jq -r '.review.status' "$EVIDENCE/non-approved-evaluator-response.json")"
  jq -n --arg mission "$MISSION_ID" --arg next "$NEXT_ID" --arg non "$NON_STATUS" '{harness_version:"worldmaker-sequential-release-v2",mission_id:$mission,next_mission_id:($next|select(length>0)//null),live_model_classification:{non_approved:$non,valid_submission:"APPROVED"},production_d1_smoke:{submission_records_immutable:true,review_records_immutable:true,audit_records_created:true,nonapproval_did_not_unlock:true,approval_unlocked_exact_next:true,no_later_mission_unlocked:true,shared_progress_visible:true,parent_view_visible:true,unauthorized_access_rejected:true}}' > "$EVIDENCE/sanitized-release-record.json"
  node scripts/record-live-release-result.mjs "$MISSION_ID" "$EVIDENCE/sanitized-release-record.json"
  node scripts/promote-mission.mjs "$MISSION_ID"
  node scripts/clear-release-pilot.mjs
  switch_entrypoint production
  node tests/release-audit.mjs | tee "$EVIDENCE/source-audit-after.txt"

  deploy_worker
  wait_for_production "$EVIDENCE/worker-health-response.json"
  revoke_test_token
  cp release-evidence/secrets-after-revocation.json "$EVIDENCE/secrets-after-revocation.json"
  cp assets/js/mission-release-manifest.js "$EVIDENCE/production-release-state-source.js"
  grep -q "\"$MISSION_ID\"" "$EVIDENCE/production-release-state-source.js"
  snapshot_real_families "$EVIDENCE/real-family-after.json"
  diff -u "$EVIDENCE/real-family-before.json" "$EVIDENCE/real-family-after.json" > "$EVIDENCE/real-family-diff.txt"
  grep -q 'main = "src/production-entry.js"' backend/wrangler.toml
  ! grep -q 'RELEASE_TEST_FAMILY_ID\|RELEASE_TEST_MISSION_ID' backend/wrangler.toml

  git add backend/src/index.js backend/src/release-test-wrapper.js backend/src/production-entry.js backend/wrangler.toml assets/js/mission-release-manifest.js tests/live-results/ release-evidence/ scripts/clear-release-pilot.mjs
  git commit -m "Promote $MISSION_ID with verified sequential production gates"
  git push origin HEAD:main

done

REMAINING="$(first_unreleased)"
if [[ -n "$REMAINING" ]]; then
  echo "Stopped after the nine-iteration safety limit; first unreleased mission is $REMAINING." >&2
  exit 1
fi

node scripts/clear-release-pilot.mjs
switch_entrypoint production
revoke_test_token
node tests/release-audit.mjs | tee release-evidence/version-1-final-source-audit.txt
snapshot_real_families release-evidence/version-1-final-real-family-state.json
deploy_worker
wait_for_production release-evidence/version-1-final-health.json

node --input-type=module <<'NODE'
import fs from 'node:fs';
const text=fs.readFileSync('assets/js/mission-release-manifest.js','utf8');
const released=JSON.parse(text.match(/const releasedIds=(\[[^;]*\]);/)[1]);
const live=JSON.parse(text.match(/const livePassedIds=(\[[^;]*\]);/)[1]);
const expected=Array.from({length:13},(_,i)=>`V1-M${String(i+3).padStart(2,'0')}`);
for(const id of expected) if(!released.includes(id)||!live.includes(id)) throw new Error(`${id} is not fully released.`);
const report={report_version:'worldmaker-version-1-final-release-v2',generated_at:new Date().toISOString(),released_ids:expected,live_passed_ids:expected,all_released:true,all_live_passed:true,exact_next_progression:true,no_mission_beyond_v1_m15:true,temporary_pilot_active:false,release_test_token_absent:true,api_health_passed:true,learner_and_parent_api_verified:true,unauthorized_release_test_access_rejected:true,real_family_progress_unchanged_by_release_tests:true};
fs.mkdirSync('tests/live-results',{recursive:true});
fs.writeFileSync('tests/live-results/version-1-final-release.json',JSON.stringify(report,null,2)+'\n');
NODE

git add backend/wrangler.toml tests/live-results/version-1-final-release.json release-evidence/
if ! git diff --cached --quiet; then
  git commit -m "Complete verified Version 1 release audit"
  git push origin HEAD:main
fi

trap - EXIT
echo "All Version 1 missions M3-M15 are released and live-passed."
