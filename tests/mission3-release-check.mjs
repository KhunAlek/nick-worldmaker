import fs from "node:fs";
import assert from "node:assert/strict";

const lesson = fs.readFileSync("assets/js/mission-lessons.js", "utf8");
const runtime = fs.readFileSync("assets/js/mission-runtime.js", "utf8");
const data = fs.readFileSync("assets/js/missions-data.js", "utf8");
const backend = fs.readFileSync("backend/src/index.js", "utf8");

const requiredLessonTerms = [
  'window.WORLDMAKER_LESSONS["V1-M03"]',
  "NPC_1",
  "NPC_2",
  "Humanoid",
  "HumanoidRootPart",
  "PrimaryPart",
  "NPC_1_Home",
  "NPC_2_Home",
  "V1-M03-T01",
  "V1-M03-T02",
  "V1-M03-T03",
  "Why would an ordinary statue Model not be enough for pathfinding movement?"
];
requiredLessonTerms.forEach(term => assert.ok(lesson.includes(term), `Mission 3 lesson missing: ${term}`));

const requiredRuntimeTerms = [
  "explorer_summary",
  "properties",
  "output",
  "screenshots",
  "checklist",
  "understanding",
  "/api/missions/${lesson.id}/submissions",
  "missionMeta?.release_state !== \"released\""
];
requiredRuntimeTerms.forEach(term => assert.ok(runtime.includes(term), `Mission runtime missing: ${term}`));

assert.ok(data.includes("mission-lessons.js"), "Mission lesson registry is not loaded");
assert.ok(data.includes("mission-runtime.js"), "Mission runtime is not loaded");

const mission3Block = backend.match(/"V1-M03": mission\(\{[\s\S]*?\n  \}\),/);
assert.ok(mission3Block, "Backend Mission 3 registry entry missing");
const block = mission3Block[0];
[
  'next: "V1-M04"',
  '"V1-M03-T01"',
  '"V1-M03-T02"',
  '"V1-M03-T03"',
  '"explorer_summary"',
  '"properties"',
  '"output"',
  '"screenshots"',
  '"checklist"'
].forEach(term => assert.ok(block.includes(term), `Backend Mission 3 contract missing: ${term}`));

assert.ok(backend.includes('if (config.releaseState !== "released")'), "Backend release guard missing");
assert.ok(backend.includes("review.next_mission_id !== config.next"), "Exact next-mission validation missing");
assert.ok(backend.includes("hasDuplicates(review.tests_to_repeat)"), "Duplicate-array validation missing");
assert.ok(!backend.includes("uniqueItems"), "Unsupported uniqueItems keyword returned");

console.log("Mission 3 release gate passed.");