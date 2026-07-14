import assert from "node:assert/strict";
import fs from "node:fs";

const [missionId, familyId, expectedStatus, expectedNextId, resultPath] = process.argv.slice(2);

if (!/^V1-M(?:0[3-9]|1[0-5])$/.test(missionId || "")) throw new Error("Invalid mission ID.");
if (!/^[0-9a-f-]{36}$/i.test(familyId || "")) throw new Error("Invalid family ID.");
if (!new Set(["NEEDS_FIX", "NEEDS_EVIDENCE", "BLOCKED_NEEDS_HELP", "APPROVED"]).has(expectedStatus)) throw new Error("Invalid expected status.");
if (!resultPath) throw new Error("A Wrangler JSON result path is required.");

const raw = JSON.parse(fs.readFileSync(resultPath, "utf8"));
const rows = Array.isArray(raw) ? raw.flatMap(item => item?.results || item?.result?.[0]?.results || []) : [];
if (!rows.length) throw new Error("No D1 verification row was returned.");

const row = rows[0];
assert.equal(row.mission_id, missionId, "Latest reviewed mission does not match.");
assert.equal(row.status, expectedStatus, `Expected ${expectedStatus}, received ${row.status}.`);

if (expectedStatus === "APPROVED") {
  assert.equal(Number(row.unlock_next_mission), expectedNextId ? 1 : 0, "Approval unlock flag is wrong.");
  assert.equal(row.next_mission_id ?? null, expectedNextId || null, "Approval unlocked the wrong mission.");
  if (expectedNextId) {
    assert.equal(row.next_progress_mission_id, expectedNextId, "Exact next mission progress row is missing.");
    assert.equal(row.next_progress_status, "NOT_SUBMITTED", "Next mission did not start as NOT_SUBMITTED.");
    assert.equal(Number(row.later_progress_count), 0, "A later mission was unlocked unexpectedly.");
  }
} else {
  assert.equal(Number(row.unlock_next_mission), 0, "Non-approved review attempted an unlock.");
  assert.equal(row.next_mission_id ?? null, null, "Non-approved review returned a next mission.");
}

console.log(`PASS: ${missionId} compact live verification matched ${expectedStatus}.`);
