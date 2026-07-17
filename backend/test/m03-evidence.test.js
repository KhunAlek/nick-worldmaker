import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const source = fs.readFileSync(path.resolve(here, "../../assets/js/m03-evidence-simplification.js"), "utf8");
const lesson = {
  id: "V1-M03",
  steps: [{ title: "Prove — Capture only the evidence the reviewer needs", actions: [], checkpoint: "", recovery: "" }],
  submission: { fields: [] }
};
const context = { window: { WORLDMAKER_LESSONS: { "V1-M03": lesson } } };
vm.createContext(context);
vm.runInContext(source, context);
const helper = context.window.WORLDMAKER_M03_EVIDENCE;
helper.simplifyLesson(lesson);

const allChecks = Object.fromEntries(helper.PROPERTY_CHECKS.map(([key]) => [key, true]));
const values = {
  propertyChecks: allChecks,
  placementConfirmation: "NPC_1_Home is under NPC_1; NPC_2_Home is under NPC_2.",
  output: "No project errors",
  playScreenshot: { name: "play.webp", mime_type: "image/webp", data_url: "data:image/webp;base64,AA" },
  explorerScreenshot: { name: "explorer.webp", mime_type: "image/webp", data_url: "data:image/webp;base64,BB" },
  tests: { "V1-M03-T01": true, "V1-M03-T02": true, "V1-M03-T03": true },
  understanding: "The complete Model keeps every body part and joint together."
};

test("M3 learner fields remove redundant proof transcription", () => {
  assert.deepEqual(Array.from(lesson.submission.fields, field => field.key), [
    "play_screenshot", "explorer_screenshot", "home_marker_checklist", "placement_confirmation", "output"
  ]);
  assert.equal(lesson.steps[0].actions.some(action => /retype/i.test(action)), true);
  assert.equal(lesson.steps[0].actions.some(action => /screenshot/i.test(action)), true);
});

test("M3 simplified form maps to the existing evaluator contract", () => {
  const payload = helper.buildPayload(values);
  assert.equal(payload.mission_id, "V1-M03");
  assert.equal(payload.screenshots.length, 2);
  assert.deepEqual(Array.from(payload.screenshots, item => item.evidence_type), ["play_test", "explorer_hierarchy"]);
  assert.match(payload.explorer_summary, /NPC_1_Home and NPC_2_Home/);
  assert.match(payload.properties, /Anchored=true, CanCollide=false, Transparency=1/);
  assert.match(payload.properties, /PrimaryPart=HumanoidRootPart/);
  assert.match(payload.properties, /NPC_1_Home is under NPC_1/);
  assert.deepEqual(Object.keys(payload.checklist), ["V1-M03-T01", "V1-M03-T02", "V1-M03-T03"]);
});

test("M3 mapping fails closed when a required property check is missing", () => {
  assert.throws(() => helper.buildPayload({ ...values, propertyChecks: { ...allChecks, npc2CanCollide: false } }), /Complete every guided Properties check/);
});

test("M3 canonical identifiers and evaluator mapping stay unchanged", () => {
  const payload = helper.buildPayload(values);
  assert.equal(payload.mission_id, "V1-M03");
  assert.equal(payload.checklist["V1-M03-T03"], true);
  assert.equal("status" in payload, false);
  assert.equal("unlock_next_mission" in payload, false);
  assert.equal("next_mission_id" in payload, false);
});
