#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
MISSION_ID="${MISSION_ID:-V1-M07}"
NEXT_ID="${NEXT_ID:-V1-M08}"
API_URL="${API_URL:-https://nick-worldmaker-api.abystrov66.workers.dev}"
FAMILY_ID=""
RELEASE_TEST_TOKEN=""
CLEANED=0

cleanup() {
  local exit_code=$?
  set +e
  cd "$ROOT/backend"
  if [ -n "$FAMILY_ID" ]; then
    SQL="DELETE FROM audit_log WHERE family_id='${FAMILY_ID}'; DELETE FROM reviews WHERE family_id='${FAMILY_ID}'; DELETE FROM submissions WHERE family_id='${FAMILY_ID}'; DELETE FROM mission_progress WHERE family_id='${FAMILY_ID}'; DELETE FROM sessions WHERE family_id='${FAMILY_ID}'; DELETE FROM access_codes WHERE family_id='${FAMILY_ID}'; DELETE FROM families WHERE id='${FAMILY_ID}';"
    npx wrangler d1 execute worldmaker-db --remote --command "$SQL" --json > "$ROOT/cleanup-d1.json" 2> "$ROOT/cleanup-d1.err" || true
  fi
  sed -i 's#main = "src/release-test-wrapper.js"#main = "src/production-entry.js"#' wrangler.toml
  sed -i '/^RELEASE_TEST_FAMILY_ID\s*=.*/d;/^RELEASE_TEST_MISSION_ID\s*=.*/d' wrangler.toml
  npx wrangler secret delete RELEASE_TEST_TOKEN >/dev/null 2>&1 || true
  npx wrangler deploy > "$ROOT/cleanup-deploy.log" 2>&1 || true
  CLEANED=1
  set -e
  return "$exit_code"
}
trap cleanup ERR INT TERM

retry_http() {
  local method="$1" url="$2" output="$3" auth="${4:-yes}"
  local status=""
  for attempt in $(seq 1 15); do
    args=(-sS -o "$output" -w '%{http_code}' -X "$method")
    if [ "$auth" = yes ]; then args+=(-H "Authorization: Bearer $RELEASE_TEST_TOKEN"); fi
    if [ "$method" = POST ]; then args+=(-H 'Content-Type: application/json'); fi
    status="$(curl "${args[@]}" "$url" || true)"
    if [ "$status" = 200 ]; then return 0; fi
    if [ "$status" != 401 ] && [ "$status" != 404 ] && [ "$status" != 409 ] && [ "$status" != 500 ]; then
      echo "Unexpected HTTP $status from $url" >&2
      cat "$output" >&2 || true
      return 1
    fi
    sleep 5
  done
  echo "Endpoint did not stabilize: $url (last HTTP $status)" >&2
  cat "$output" >&2 || true
  return 1
}

node tests/release-audit.mjs
grep -q 'const releasedIds=\["V1-M03","V1-M04","V1-M05","V1-M06"\]' assets/js/mission-release-manifest.js
grep -q 'const livePassedIds=\["V1-M03","V1-M04","V1-M05","V1-M06"\]' assets/js/mission-release-manifest.js

FAMILY_ID="$(python -c 'import uuid; print(uuid.uuid4())')"
cd backend
SQL="INSERT INTO families(id,display_name) VALUES('${FAMILY_ID}','Release Test ${GITHUB_RUN_ID}-${GITHUB_RUN_ATTEMPT}'); INSERT INTO mission_progress(family_id,mission_id,status,hint_level) VALUES('${FAMILY_ID}','${MISSION_ID}','NOT_SUBMITTED',0);"
npx wrangler d1 execute worldmaker-db --remote --command "$SQL" --json > ../family-seed.json
SQL="SELECT family_id,mission_id,status,hint_level,approved_review_id,updated_at FROM mission_progress WHERE family_id IN (SELECT id FROM families WHERE display_name NOT LIKE 'Release Test %') ORDER BY family_id,mission_id;"
npx wrangler d1 execute worldmaker-db --remote --command "$SQL" --json > ../real-family-before.json
jq -S '.[0].results | map(del(.updated_at))' ../real-family-before.json > ../real-family-before-sorted.json
node ../scripts/configure-release-pilot.mjs "$FAMILY_ID" "$MISSION_ID"
sed -i 's#main = "src/production-entry.js"#main = "src/release-test-wrapper.js"#' wrangler.toml

RELEASE_TEST_TOKEN="$(openssl rand -hex 32)"
printf '%s' "$RELEASE_TEST_TOKEN" | npx wrangler secret put RELEASE_TEST_TOKEN
npx wrangler deploy
cd ..
sleep 35

code="$(curl -sS -o unauthorized-before.json -w '%{http_code}' -X POST "$API_URL/internal/release-test/$MISSION_ID/needs_evidence")"
test "$code" = 401
jq -e '.error == "Unauthorized"' unauthorized-before.json

retry_http POST "$API_URL/internal/release-test/$MISSION_ID/needs_evidence" needs-evidence.json
jq -e '.review.status == "NEEDS_EVIDENCE" and .review.unlock_next_mission == false and .review.next_mission_id == null' needs-evidence.json
retry_http POST "$API_URL/internal/release-test/$MISSION_ID/needs_fix" needs-fix.json
jq -e '.review.status == "NEEDS_FIX" and .review.unlock_next_mission == false and .review.next_mission_id == null' needs-fix.json
retry_http POST "$API_URL/internal/release-test/$MISSION_ID/wrong_ids" wrong-ids.json
jq -e '.review.status != "APPROVED" and .review.unlock_next_mission == false and .review.next_mission_id == null' wrong-ids.json
retry_http POST "$API_URL/internal/release-test/$MISSION_ID/suspicious" suspicious.json
jq -e '.review.status != "APPROVED" and .review.suspicious_input_detected == true and .review.unlock_next_mission == false' suspicious.json
retry_http POST "$API_URL/internal/release-test/$MISSION_ID/no_selection" no-selection.json
jq -e '.runtime.accepted == false and .runtime.server_received_valid_command == false and .runtime.state_changed == false' no-selection.json
retry_http POST "$API_URL/internal/release-test/$MISSION_ID/valid_wood" valid-wood.json
jq -e '.runtime.accepted == true and .runtime.resource == "Wood" and .runtime.state_changed == false' valid-wood.json
retry_http POST "$API_URL/internal/release-test/$MISSION_ID/valid_stone" valid-stone.json
jq -e '.runtime.accepted == true and .runtime.resource == "Stone" and .runtime.state_changed == false' valid-stone.json
retry_http POST "$API_URL/internal/release-test/$MISSION_ID/invalid_resource" invalid-resource.json
jq -e '.runtime.accepted == false and .runtime.rejected == true and .runtime.state_changed == false' invalid-resource.json
retry_http POST "$API_URL/internal/release-test/$MISSION_ID/invalid_npc" invalid-npc.json
jq -e '.runtime.accepted == false and .runtime.rejected == true and .runtime.state_changed == false' invalid-npc.json

cd backend
SQL="SELECT COUNT(*) next_count FROM mission_progress WHERE family_id='${FAMILY_ID}' AND mission_id='${NEXT_ID}';"
npx wrangler d1 execute worldmaker-db --remote --command "$SQL" --json > ../non-approved-d1.json
jq -e '.[0].results[0].next_count == 0' ../non-approved-d1.json
cd ..

retry_http POST "$API_URL/internal/release-test/$MISSION_ID/approved" approved.json
jq -e --arg next "$NEXT_ID" '.review.status == "APPROVED" and .review.unlock_next_mission == true and .review.next_mission_id == $next' approved.json

cd backend
SQL="SELECT (SELECT status FROM mission_progress WHERE family_id='${FAMILY_ID}' AND mission_id='${MISSION_ID}') mission_status,(SELECT status FROM mission_progress WHERE family_id='${FAMILY_ID}' AND mission_id='${NEXT_ID}') next_status,(SELECT COUNT(*) FROM mission_progress WHERE family_id='${FAMILY_ID}' AND mission_id>'${NEXT_ID}') later_count,(SELECT COUNT(*) FROM submissions WHERE family_id='${FAMILY_ID}' AND mission_id='${MISSION_ID}') submissions_count,(SELECT COUNT(*) FROM reviews WHERE family_id='${FAMILY_ID}' AND mission_id='${MISSION_ID}' AND validated=1) reviews_count;"
npx wrangler d1 execute worldmaker-db --remote --command "$SQL" --json > ../approved-d1.json
jq -e '.[0].results[0] | .mission_status == "APPROVED" and .next_status == "NOT_SUBMITTED" and .later_count == 0 and .submissions_count == 5 and .reviews_count == 5' ../approved-d1.json
cd ..
retry_http GET "$API_URL/internal/release-test/views" views.json
jq -e --arg mission "$MISSION_ID" --arg next "$NEXT_ID" '.learner.status == 200 and .parent.status == 200 and ([.learner.body.progress[]|select(.mission_id==$mission and .status=="APPROVED")]|length)==1 and ([.parent.body.progress[]|select(.mission_id==$mission and .status=="APPROVED")]|length)==1 and ([.learner.body.progress[]|select(.mission_id==$next and .status=="NOT_SUBMITTED")]|length)==1 and ([.parent.body.progress[]|select(.mission_id==$next and .status=="NOT_SUBMITTED")]|length)==1' views.json

mkdir -p tests/live-results
jq -n --arg mission "$MISSION_ID" --arg next "$NEXT_ID" --arg run "$GITHUB_RUN_ID" '{mission_id:$mission,next_mission_id:$next,workflow_run:$run,fixtures:{missing_evidence:"NEEDS_EVIDENCE",technical_failure:"NEEDS_FIX",wrong_ids:"REJECTED",suspicious:"IGNORED_NOT_APPROVED",no_selection:"REJECTED_BEFORE_SERVER",valid_wood:"ACCEPTED",valid_stone:"ACCEPTED",invalid_resource:"REJECTED",invalid_npc:"REJECTED",complete:"APPROVED"},exact_next_unlock:true,no_later_unlock:true,real_family_unchanged:true,temporary_records_removed:true,temporary_access_revoked:true,unauthorized_after_cleanup:401}' > tests/live-results/V1-M07-release-evidence.json
node scripts/record-live-release-result.mjs "$MISSION_ID" tests/live-results/V1-M07-release-evidence.json
node scripts/promote-mission.mjs "$MISSION_ID"
printf '\n\n## M7 release — 17 July 2026\n\nV1-M07 — Send Safe Commands was promoted after fresh isolated-family release gates passed. The approved fixture unlocked exactly V1-M08; all non-approved fixtures unlocked nothing; Nick’s real-family progress was unchanged; temporary access, pilot configuration, and isolated records were removed. Workflow run: %s.\n' "$GITHUB_RUN_ID" >> Nick_Worldmaker_Comprehensive_Project_Tracker_2026-07-15.md
node tests/release-audit.mjs

# Cleanup before committing the promoted source.
trap - ERR INT TERM
cleanup

# Confirm cleanup in D1 before promotion commit.
cd backend
SQL="SELECT (SELECT COUNT(*) FROM families WHERE id='${FAMILY_ID}') family_count,(SELECT COUNT(*) FROM mission_progress WHERE family_id='${FAMILY_ID}') progress_count,(SELECT COUNT(*) FROM submissions WHERE family_id='${FAMILY_ID}') submission_count,(SELECT COUNT(*) FROM reviews WHERE family_id='${FAMILY_ID}') review_count;"
npx wrangler d1 execute worldmaker-db --remote --command "$SQL" --json > ../cleanup-proof.json
jq -e '.[0].results[0] | .family_count==0 and .progress_count==0 and .submission_count==0 and .review_count==0' ../cleanup-proof.json
cd ..

git config user.name worldmaker-release-bot
git config user.email actions@users.noreply.github.com
git add backend/src/index.js backend/wrangler.toml assets/js/mission-release-manifest.js tests/live-results/V1-M07-release-evidence.json tests/live-results/V1-M07.json Nick_Worldmaker_Comprehensive_Project_Tracker_2026-07-15.md
git commit -m "Promote V1-M07 after complete isolated release gates"
PROMOTION_COMMIT="$(git rev-parse HEAD)"
git push origin HEAD:main

cd backend
SOURCE_HASH="$(sha256sum src/index.js src/production-entry.js | sha256sum | cut -d' ' -f1)"
sed -i "s/^SOURCE_VERSION = .*/SOURCE_VERSION = \"${PROMOTION_COMMIT}\"/" wrangler.toml
sed -i "s/^SOURCE_SHA256 = .*/SOURCE_SHA256 = \"${SOURCE_HASH}\"/" wrangler.toml
cd ..
git add backend/wrangler.toml
git commit -m "Stamp V1-M07 production source identity"
DEPLOYED_COMMIT="$(git rev-parse HEAD)"
git push origin HEAD:main
cd backend
npx wrangler deploy
cd ..
sleep 20

curl --fail-with-body -sS "$API_URL/health" > health.json
jq -e --arg version "$PROMOTION_COMMIT" --arg hash "$SOURCE_HASH" '.ok == true and .entrypoint == "production" and .source_version == $version and .source_sha256 == $hash' health.json
cd backend
SQL="SELECT family_id,mission_id,status,hint_level,approved_review_id,updated_at FROM mission_progress WHERE family_id IN (SELECT id FROM families WHERE display_name NOT LIKE 'Release Test %') ORDER BY family_id,mission_id;"
npx wrangler d1 execute worldmaker-db --remote --command "$SQL" --json > ../real-family-after.json
cd ..
jq -S '.[0].results | map(del(.updated_at))' real-family-after.json > real-family-after-sorted.json
diff -u real-family-before-sorted.json real-family-after-sorted.json
code="$(curl -sS -o unauthorized-after.json -w '%{http_code}' -X POST "$API_URL/internal/release-test/$MISSION_ID/approved")"
test "$code" = 401
jq -e '.error == "Unauthorized"' unauthorized-after.json
node tests/release-audit.mjs
jq -n --arg promotion "$PROMOTION_COMMIT" --arg deployed "$DEPLOYED_COMMIT" --arg hash "$SOURCE_HASH" --arg run "$GITHUB_RUN_ID" '{promotion_commit:$promotion,deployed_commit:$deployed,source_sha256:$hash,workflow_run:$run,verdict:"RELEASED_AND_LIVE_PASSED"}' > final-release-identity.json

echo "PROMOTION_COMMIT=$PROMOTION_COMMIT" >> "$GITHUB_ENV"
echo "DEPLOYED_COMMIT=$DEPLOYED_COMMIT" >> "$GITHUB_ENV"
echo "SOURCE_HASH=$SOURCE_HASH" >> "$GITHUB_ENV"
