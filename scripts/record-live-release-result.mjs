import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = path.join(root, "assets/js/mission-release-manifest.js");
const [missionId, reportPathArg] = process.argv.slice(2);

if (!/^V1-M(?:0[3-9]|1[0-5])$/.test(missionId || "")) {
  throw new Error("Usage: node scripts/record-live-release-result.mjs V1-M04 path/to/report.json");
}
if (!reportPathArg) throw new Error("A JSON report path is required.");

const reportPath = path.resolve(process.cwd(), reportPathArg);
const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
assert.equal(report.mission_id, missionId, "Report mission_id does not match the requested mission.");
assert.equal(report.harness_version, "worldmaker-release-harness-v1");

const classification = report.live_model_classification || {};
assert.ok(["NEEDS_EVIDENCE", "NEEDS_FIX", "BLOCKED_NEEDS_HELP"].includes(classification.non_approved), "A real non-approved classification is required.");
assert.equal(classification.valid_submission, "APPROVED");

const smoke = report.production_d1_smoke || {};
for (const key of [
  "submission_records_immutable",
  "review_records_immutable",
  "audit_records_created",
  "nonapproval_did_not_unlock",
  "approval_unlocked_exact_next",
  "no_later_mission_unlocked",
  "shared_progress_visible",
  "parent_view_visible"
]) {
  assert.equal(smoke[key], true, `Production smoke gate failed: ${key}`);
}

let source = fs.readFileSync(manifestPath, "utf8");
const match = source.match(/const livePassedIds=(\[[^;]*\]);/);
if (!match) throw new Error("Manifest livePassedIds marker is missing.");
const ids = JSON.parse(match[1]);
if (!ids.includes(missionId)) ids.push(missionId);
ids.sort();
source = source.replace(match[0], `const livePassedIds=${JSON.stringify(ids)};`);
fs.writeFileSync(manifestPath, source);

const resultDir = path.join(root, "tests/live-results");
fs.mkdirSync(resultDir, { recursive: true });
fs.copyFileSync(reportPath, path.join(resultDir, `${missionId}.json`));
console.log(`Recorded verified live release gates for ${missionId}.`);
