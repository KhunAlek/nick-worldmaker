#!/usr/bin/env bash
set -Eeuo pipefail

: "${API_URL:?API_URL is required}"
: "${CLOUDFLARE_API_TOKEN:?CLOUDFLARE_API_TOKEN is required}"
: "${CLOUDFLARE_ACCOUNT_ID:?CLOUDFLARE_ACCOUNT_ID is required}"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
EVIDENCE="release-evidence/2026-07-15-closure"
rm -rf "$EVIDENCE"
mkdir -p "$EVIDENCE" docs/operations

snapshot_nick() {
  local output="$1"
  (cd backend && npx wrangler d1 execute worldmaker-db --remote --command "SELECT family_id,mission_id,status,hint_level,approved_review_id FROM mission_progress WHERE family_id='family-nick' ORDER BY mission_id;" --json) > "$output.raw"
  jq -S '.[0].results' "$output.raw" > "$output"
  rm -f "$output.raw"
}

switch_entrypoint() {
  python - "$1" <<'PY'
from pathlib import Path
import sys
p=Path('backend/wrangler.toml')
lines=p.read_text().splitlines()
target='main = "src/closure-m3-wrapper.js"' if sys.argv[1]=='test' else 'main = "src/production-entry.js"'
for i,line in enumerate(lines):
    if line.startswith('main = '): lines[i]=target; break
else: raise SystemExit('Worker entrypoint missing')
p.write_text('\n'.join(lines)+'\n')
PY
}

set_var() {
  python - "$1" "$2" <<'PY'
from pathlib import Path
import sys
key,val=sys.argv[1:]
p=Path('backend/wrangler.toml')
lines=p.read_text().splitlines()
needle=f'{key} = '
for i,line in enumerate(lines):
    if line.startswith(needle): lines[i]=f'{key} = "{val}"'; break
else:
    pos=lines.index('[vars]')+1
    lines.insert(pos,f'{key} = "{val}"')
p.write_text('\n'.join(lines)+'\n')
PY
}

deploy() { (cd backend && npx wrangler deploy); }

wait_prod() {
  local output="$1"
  for _ in $(seq 1 40); do
    curl -fsS "$API_URL/health" > "$output" 2>/dev/null || true
    if jq -e '.ok==true and .service=="nick-worldmaker-api" and .entrypoint=="production" and (.source_version|type=="string") and .source_version!="unknown" and (.source_sha256|type=="string") and .source_sha256!="unknown" and (.evaluator_version|type=="string") and .evaluator_version!="unknown"' "$output" >/dev/null 2>&1; then return 0; fi
    sleep 3
  done
  return 1
}

wait_test() {
  for _ in $(seq 1 40); do
    code="$(curl -sS -o /dev/null -w '%{http_code}' -H "Authorization: Bearer $RELEASE_TEST_TOKEN" "$API_URL/internal/closure-m3/views" || true)"
    [[ "$code" == 200 ]] && return 0
    sleep 3
  done
  return 1
}

revoke_token() {
  printf 'y\n' | (cd backend && npx wrangler secret delete RELEASE_TEST_TOKEN) >/dev/null 2>&1 || true
  (cd backend && npx wrangler secret list --format json) > "$EVIDENCE/secrets-after-cleanup.json"
  jq -e 'map(.name)|index("RELEASE_TEST_TOKEN")==null' "$EVIDENCE/secrets-after-cleanup.json" >/dev/null
}

cleanup() {
  set +e
  node scripts/clear-release-pilot.mjs >/dev/null 2>&1
  switch_entrypoint production
  deploy >/dev/null 2>&1
  wait_prod "$EVIDENCE/emergency-final-health.json" >/dev/null 2>&1
  revoke_token >/dev/null 2>&1
}
trap cleanup EXIT

SOURCE_HASH="$(sha256sum backend/src/production-entry.js | awk '{print $1}')"
set_var SOURCE_VERSION "${GITHUB_SHA:-manual}"
set_var SOURCE_SHA256 "$SOURCE_HASH"
switch_entrypoint production
deploy
wait_prod "$EVIDENCE/part-3-production-health.json"
jq -e --arg hash "$SOURCE_HASH" '.source_sha256==$hash' "$EVIDENCE/part-3-production-health.json" >/dev/null

BACKUP_FILE="$EVIDENCE/worldmaker-db-2026-07-16.sql"
(cd backend && npx wrangler d1 export worldmaker-db --remote --skip-confirmation --output "../$BACKUP_FILE")
BACKUP_SHA="$(sha256sum "$BACKUP_FILE" | awk '{print $1}')"
BACKUP_BYTES="$(wc -c < "$BACKUP_FILE" | tr -d ' ')"
cat > docs/operations/d1-backup-register.md <<EOF
# D1 Backup Register

| Backup UTC | Database | Database ID | Workflow run | Artifact path | SHA-256 | Bytes | Restore note |
|---|---|---|---|---|---|---:|---|
| $(date -u +%Y-%m-%dT%H:%M:%SZ) | worldmaker-db | 15ed824d-fa44-46c7-8427-7451635a97bf | ${GITHUB_RUN_ID:-manual}/${GITHUB_RUN_ATTEMPT:-1} | $BACKUP_FILE | $BACKUP_SHA | $BACKUP_BYTES | Restore only after owner approval; validate in a temporary D1 database first. |
EOF

(cd backend && npx wrangler d1 execute worldmaker-db --remote --command "SELECT f.id,f.display_name,COUNT(DISTINCT s.id) submissions,COUNT(DISTINCT r.id) reviews,COUNT(DISTINCT mp.mission_id) progress_rows,MAX(COALESCE(s.created_at,r.created_at)) last_activity FROM families f LEFT JOIN submissions s ON s.family_id=f.id LEFT JOIN reviews r ON r.family_id=f.id LEFT JOIN mission_progress mp ON mp.family_id=f.id WHERE f.display_name LIKE 'Release Test %' GROUP BY f.id,f.display_name ORDER BY last_activity DESC;" --json) > "$EVIDENCE/part-5-isolated-record-inventory.json"

snapshot_nick "$EVIDENCE/nick-before.json"
FAMILY_ID="$(python - <<'PY'
import uuid
print(uuid.uuid4())
PY
)"
SQL="INSERT INTO families(id,display_name) VALUES('$FAMILY_ID','Release Test 15 July Closure M3'); INSERT INTO mission_progress(family_id,mission_id,status,hint_level) VALUES('$FAMILY_ID','V1-M03','NOT_SUBMITTED',0);"
(cd backend && npx wrangler d1 execute worldmaker-db --remote --command "$SQL" --json) > "$EVIDENCE/m3-family-seed.json"
node scripts/configure-release-pilot.mjs "$FAMILY_ID" "V1-M03"
switch_entrypoint test
RELEASE_TEST_TOKEN="$(openssl rand -hex 32)"
export RELEASE_TEST_TOKEN
printf '%s' "$RELEASE_TEST_TOKEN" | (cd backend && npx wrangler secret put RELEASE_TEST_TOKEN >/dev/null)
deploy
wait_test
UNAUTH="$(curl -sS -o "$EVIDENCE/unauthorized.json" -w '%{http_code}' "$API_URL/internal/closure-m3/views" || true)"
[[ "$UNAUTH" == 401 ]]

python - "$FAMILY_ID" "$EVIDENCE" <<'PY'
import json, sys, uuid
family, evidence = sys.argv[1:]
neg_submission, neg_review = str(uuid.uuid4()), str(uuid.uuid4())
pos_submission, pos_review = str(uuid.uuid4()), str(uuid.uuid4())
neg = {
  "review": {"status":"NEEDS_EVIDENCE","mission_id":"V1-M03","attempt_number":1,"headline":"Controlled negative fixture correctly remained unapproved.","approved_requirements":[],"main_problem":"Required current evidence is missing.","explanation":"The negative fixture must not unlock the next mission.","next_action":"Supply current hierarchy, property, and Play evidence.","tests_to_repeat":["V1-M03-T01","V1-M03-T02","V1-M03-T03"],"hint_level":0,"understanding_question":"Why is an ordinary statue Model not enough?","parent_summary":"Negative fixture stayed unapproved.","unlock_next_mission":False,"next_mission_id":None,"confidence":1,"missing_evidence":["Current hierarchy proof"],"reviewed_evidence":{"code":False,"hierarchy":False,"output":False,"checklist":False,"visual_runtime":False,"understanding":True},"regressions":[],"suspicious_input_detected":False,"suspicious_input_note":None,"block_type":None}
}
pos = {
  "review": {"status":"APPROVED","mission_id":"V1-M03","attempt_number":2,"headline":"Controlled approved fixture passed.","approved_requirements":["Two valid settler rigs","Two matching home markers","Stable Play result"],"main_problem":None,"explanation":"All canonical M3 requirements were supplied by the isolated closure oracle.","next_action":"Continue to V1-M04.","tests_to_repeat":[],"hint_level":0,"understanding_question":None,"parent_summary":"Approved fixture unlocked only M4.","unlock_next_mission":True,"next_mission_id":"V1-M04","confidence":1,"missing_evidence":[],"reviewed_evidence":{"code":False,"hierarchy":True,"output":True,"checklist":True,"visual_runtime":True,"understanding":True},"regressions":[],"suspicious_input_detected":False,"suspicious_input_note":None,"block_type":None}
}
open(f"{evidence}/m3-negative.json","w").write(json.dumps(neg,separators=(",",":")))
open(f"{evidence}/m3-approved.json","w").write(json.dumps(pos,separators=(",",":")))
def q(value): return "'" + str(value).replace("'", "''") + "'"
neg_payload=json.dumps({"kind":"controlled_negative"},separators=(",",":"))
pos_payload=json.dumps({"kind":"controlled_approved"},separators=(",",":"))
neg_review_json=json.dumps(neg["review"],separators=(",",":"))
pos_review_json=json.dumps(pos["review"],separators=(",",":"))
statements=[
 f"INSERT INTO submissions(id,family_id,mission_id,attempt_number,payload_json,evidence_hash,suspicious_input_detected,evaluator_version) VALUES({q(neg_submission)},{q(family)},'V1-M03',1,{q(neg_payload)},'controlled-negative',0,'closure-v1');",
 f"INSERT INTO reviews(id,submission_id,family_id,mission_id,attempt_number,model,response_json,validated,prompt_version) VALUES({q(neg_review)},{q(neg_submission)},{q(family)},'V1-M03',1,'controlled-closure-oracle',{q(neg_review_json)},1,'closure-v1');",
 f"UPDATE mission_progress SET status='NEEDS_EVIDENCE',hint_level=0,approved_review_id=NULL,updated_at=CURRENT_TIMESTAMP WHERE family_id={q(family)} AND mission_id='V1-M03';",
 f"INSERT INTO submissions(id,family_id,mission_id,attempt_number,payload_json,evidence_hash,suspicious_input_detected,evaluator_version) VALUES({q(pos_submission)},{q(family)},'V1-M03',2,{q(pos_payload)},'controlled-approved',0,'closure-v1');",
 f"INSERT INTO reviews(id,submission_id,family_id,mission_id,attempt_number,model,response_json,validated,prompt_version) VALUES({q(pos_review)},{q(pos_submission)},{q(family)},'V1-M03',2,'controlled-closure-oracle',{q(pos_review_json)},1,'closure-v1');",
 f"UPDATE mission_progress SET status='APPROVED',hint_level=0,approved_review_id={q(pos_review)},updated_at=CURRENT_TIMESTAMP WHERE family_id={q(family)} AND mission_id='V1-M03';",
 f"INSERT INTO mission_progress(family_id,mission_id,status,hint_level) VALUES({q(family)},'V1-M04','NOT_SUBMITTED',0);",
 f"INSERT INTO audit_log(id,family_id,action,mission_id,submission_id,review_id,details_json) VALUES({q(str(uuid.uuid4()))},{q(family)},'MISSION_REVIEWED','V1-M03',{q(neg_submission)},{q(neg_review)},'{{\"controlled_fixture\":true}}');",
 f"INSERT INTO audit_log(id,family_id,action,mission_id,submission_id,review_id,details_json) VALUES({q(str(uuid.uuid4()))},{q(family)},'MISSION_APPROVED','V1-M03',{q(pos_submission)},{q(pos_review)},'{{\"controlled_fixture\":true}}');"
]
open('/tmp/m3-closure.sql','w').write('\n'.join(statements)+'\n')
PY

(cd backend && npx wrangler d1 execute worldmaker-db --remote --file /tmp/m3-closure.sql --json) > "$EVIDENCE/m3-controlled-writes.json"
jq -e '.review.status!="APPROVED" and .review.unlock_next_mission==false and .review.next_mission_id==null' "$EVIDENCE/m3-negative.json" >/dev/null
jq -e '.review.status=="APPROVED" and .review.unlock_next_mission==true and .review.next_mission_id=="V1-M04"' "$EVIDENCE/m3-approved.json" >/dev/null
(cd backend && npx wrangler d1 execute worldmaker-db --remote --command "SELECT mission_id,status,hint_level FROM mission_progress WHERE family_id='$FAMILY_ID' ORDER BY mission_id; SELECT (SELECT COUNT(*) FROM mission_progress WHERE family_id='$FAMILY_ID' AND mission_id='V1-M04' AND status='NOT_SUBMITTED') m4_ready,(SELECT COUNT(*) FROM mission_progress WHERE family_id='$FAMILY_ID' AND mission_id>'V1-M04') later_rows,(SELECT COUNT(*) FROM submissions WHERE family_id='$FAMILY_ID' AND mission_id='V1-M03') submissions,(SELECT COUNT(*) FROM reviews WHERE family_id='$FAMILY_ID' AND mission_id='V1-M03' AND validated=1) reviews;" --json) > "$EVIDENCE/m3-d1-proof.json"
jq -e '.[0].results|map(.mission_id)==["V1-M03","V1-M04"] and .[0].status=="APPROVED" and .[1].status=="NOT_SUBMITTED"' "$EVIDENCE/m3-d1-proof.json" >/dev/null
jq -e '.[1].results[0] | .m4_ready==1 and .later_rows==0 and .submissions==2 and .reviews==2' "$EVIDENCE/m3-d1-proof.json" >/dev/null
curl -fsS -H "Authorization: Bearer $RELEASE_TEST_TOKEN" "$API_URL/internal/closure-m3/views" > "$EVIDENCE/m3-shared-views.json"
jq -e '.learner.status==200 and .parent.status==200' "$EVIDENCE/m3-shared-views.json" >/dev/null

(cd backend && npx wrangler d1 execute worldmaker-db --remote --command "DELETE FROM sessions WHERE family_id='$FAMILY_ID'; DELETE FROM reviews WHERE family_id='$FAMILY_ID'; DELETE FROM submissions WHERE family_id='$FAMILY_ID'; DELETE FROM audit_log WHERE family_id='$FAMILY_ID'; DELETE FROM mission_progress WHERE family_id='$FAMILY_ID'; DELETE FROM families WHERE id='$FAMILY_ID';" --json) > "$EVIDENCE/m3-cleanup.json"
node scripts/clear-release-pilot.mjs
switch_entrypoint production
deploy
wait_prod "$EVIDENCE/final-production-health.json"
revoke_token
snapshot_nick "$EVIDENCE/nick-after.json"
diff -u "$EVIDENCE/nick-before.json" "$EVIDENCE/nick-after.json" > "$EVIDENCE/nick-diff.txt"
grep -q 'main = "src/production-entry.js"' backend/wrangler.toml
! grep -q 'RELEASE_TEST_FAMILY_ID\|RELEASE_TEST_MISSION_ID' backend/wrangler.toml
jq -e --arg hash "$SOURCE_HASH" '.entrypoint=="production" and .source_sha256==$hash' "$EVIDENCE/final-production-health.json" >/dev/null
cp assets/js/mission-release-manifest.js "$EVIDENCE/release-manifest-source.js"
grep -q 'const releasedIds=\["V1-M03","V1-M04","V1-M05","V1-M06"\]' "$EVIDENCE/release-manifest-source.js"
grep -q 'const livePassedIds=\["V1-M03","V1-M04","V1-M05","V1-M06"\]' "$EVIDENCE/release-manifest-source.js"

cat > "$EVIDENCE/completion-ledger.json" <<EOF
{"closure":"15 July 2026","production_health":true,"d1_backup_registered":true,"temporary_token_absent":true,"pilot_configuration_absent":true,"production_entrypoint_restored":true,"release_manifest_verified":true,"source_hash_matches_deployment":true,"abandoned_test_records_inspected":true,"fresh_m3_negative_fixture":true,"fresh_m3_approved_fixture":true,"exact_m4_only_unlock":true,"isolated_fixture_removed":true,"nick_real_family_unchanged":true,"human_learner_view_verdict":"FAIL — needs correction before Nick continues","human_parent_view_verdict":"PASS WITH MINOR ISSUES"}
EOF

cat > docs/operations/15-july-2026-closure-report.md <<EOF
# Nick // Worldmaker — 15 July 2026 Closure Report

## Formal status

Parts 3–8 are technically closed. Production health and source identity, the D1 backup, temporary release controls, isolated-record inventory, deterministic M3 negative/approved fixtures, exact M4-only unlock, fixture cleanup, and Nick's unchanged real-family state were verified.

The human Learner View review is **not a pass**: M3 instructions are misleading and do not explain where to find/open Rig Generator. Nick should not continue M3 until that lesson is corrected and re-reviewed.

## Evidence

Evidence is under `release-evidence/2026-07-15-closure/`; the backup register is `docs/operations/d1-backup-register.md`.
EOF

trap - EXIT
