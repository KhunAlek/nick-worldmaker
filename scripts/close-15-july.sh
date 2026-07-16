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

# Part 3: direct health and source identity.
SOURCE_HASH="$(sha256sum backend/src/production-entry.js | awk '{print $1}')"
set_var SOURCE_VERSION "${GITHUB_SHA:-manual}"
set_var SOURCE_SHA256 "$SOURCE_HASH"
switch_entrypoint production
deploy
wait_prod "$EVIDENCE/part-3-production-health.json"
jq -e --arg hash "$SOURCE_HASH" '.source_sha256==$hash' "$EVIDENCE/part-3-production-health.json" >/dev/null

# Part 4: export D1 and record a source-controlled register entry.
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

# Part 5: inspect previous isolated records and identify abandoned families without changing them.
(cd backend && npx wrangler d1 execute worldmaker-db --remote --command "SELECT f.id,f.display_name,COUNT(DISTINCT s.id) submissions,COUNT(DISTINCT r.id) reviews,COUNT(DISTINCT mp.mission_id) progress_rows,MAX(COALESCE(s.created_at,r.created_at)) last_activity FROM families f LEFT JOIN submissions s ON s.family_id=f.id LEFT JOIN reviews r ON r.family_id=f.id LEFT JOIN mission_progress mp ON mp.family_id=f.id WHERE f.display_name LIKE 'Release Test %' GROUP BY f.id,f.display_name ORDER BY last_activity DESC;" --json) > "$EVIDENCE/part-5-isolated-record-inventory.json"

# Part 6: fresh M3 negative and approval fixtures, exact M4-only unlock.
snapshot_nick "$EVIDENCE/nick-before.json"
FAMILY_ID="closure-m3-${GITHUB_RUN_ID:-manual}-${GITHUB_RUN_ATTEMPT:-1}"
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
curl -fsS -H "Authorization: Bearer $RELEASE_TEST_TOKEN" -H 'Content-Type: application/json' -X POST "$API_URL/internal/closure-m3/needs_evidence" > "$EVIDENCE/m3-negative.json"
jq -e '.review.status!="APPROVED" and .review.unlock_next_mission==false and .review.next_mission_id==null' "$EVIDENCE/m3-negative.json" >/dev/null
curl -fsS -H "Authorization: Bearer $RELEASE_TEST_TOKEN" -H 'Content-Type: application/json' -X POST "$API_URL/internal/closure-m3/approved" > "$EVIDENCE/m3-approved.json"
jq -e '.review.status=="APPROVED" and .review.unlock_next_mission==true and .review.next_mission_id=="V1-M04"' "$EVIDENCE/m3-approved.json" >/dev/null
(cd backend && npx wrangler d1 execute worldmaker-db --remote --command "SELECT mission_id,status,hint_level FROM mission_progress WHERE family_id='$FAMILY_ID' ORDER BY mission_id; SELECT (SELECT COUNT(*) FROM mission_progress WHERE family_id='$FAMILY_ID' AND mission_id='V1-M04' AND status='NOT_SUBMITTED') m4_ready,(SELECT COUNT(*) FROM mission_progress WHERE family_id='$FAMILY_ID' AND mission_id>'V1-M04') later_rows,(SELECT COUNT(*) FROM submissions WHERE family_id='$FAMILY_ID' AND mission_id='V1-M03') submissions,(SELECT COUNT(*) FROM reviews WHERE family_id='$FAMILY_ID' AND mission_id='V1-M03' AND validated=1) reviews;" --json) > "$EVIDENCE/m3-d1-proof.json"
jq -e '.[0].results|map(.mission_id)==["V1-M03","V1-M04"] and .[0].status=="APPROVED" and .[1].status=="NOT_SUBMITTED"' "$EVIDENCE/m3-d1-proof.json" >/dev/null
jq -e '.[1].results[0] | .m4_ready==1 and .later_rows==0 and .submissions==2 and .reviews==2' "$EVIDENCE/m3-d1-proof.json" >/dev/null
curl -fsS -H "Authorization: Bearer $RELEASE_TEST_TOKEN" "$API_URL/internal/closure-m3/views" > "$EVIDENCE/m3-shared-views.json"
jq -e '.learner.status==200 and .parent.status==200' "$EVIDENCE/m3-shared-views.json" >/dev/null

# Cleanup and final synchronization proof.
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
{
  "closure":"15 July 2026",
  "production_health":true,
  "d1_backup_registered":true,
  "temporary_token_absent":true,
  "pilot_configuration_absent":true,
  "production_entrypoint_restored":true,
  "release_manifest_verified":true,
  "source_hash_matches_deployment":true,
  "abandoned_test_records_inspected":true,
  "fresh_m3_negative_fixture":true,
  "fresh_m3_approved_fixture":true,
  "exact_m4_only_unlock":true,
  "nick_real_family_unchanged":true,
  "human_learner_view_verdict":"FAIL — needs correction before Nick continues",
  "human_parent_view_verdict":"PASS WITH MINOR ISSUES"
}
EOF

cat > docs/operations/15-july-2026-closure-report.md <<EOF
# Nick // Worldmaker — 15 July 2026 Closure Report

## Formal status

Parts 3–8 are technically closed. The production service, D1 backup, temporary release controls, source/deployment identity, isolated records, and fresh M3 evaluator fixtures were verified. Nick's real family state was unchanged.

The human Learner View review is **not a pass**: M3 instructions are misleading and do not explain where to find/open Rig Generator. This is recorded as a learner-content release defect, not an infrastructure failure. Nick should not continue M3 until that lesson is corrected and re-reviewed.

## Evidence

- Production health: `release-evidence/2026-07-15-closure/final-production-health.json`
- D1 backup register: `docs/operations/d1-backup-register.md`
- Isolated record inventory: `release-evidence/2026-07-15-closure/part-5-isolated-record-inventory.json`
- M3 negative fixture: `release-evidence/2026-07-15-closure/m3-negative.json`
- M3 approval fixture: `release-evidence/2026-07-15-closure/m3-approved.json`
- Exact unlock proof: `release-evidence/2026-07-15-closure/m3-d1-proof.json`
- Real-family comparison: `release-evidence/2026-07-15-closure/nick-diff.txt`
- Completion ledger: `release-evidence/2026-07-15-closure/completion-ledger.json`
EOF

trap - EXIT
