import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync("assets/js/mission-lessons-m04.js", "utf8");
const runtime = fs.readFileSync("assets/js/mission-runtime.js", "utf8");
const review = fs.readFileSync("review/V1-M04-sanitized-lesson-review.html", "utf8");
const context = { window: {} };
vm.createContext(context);
vm.runInContext(source, context, { filename: "assets/js/mission-lessons-m04.js" });

const mission = context.window.WORLDMAKER_LESSONS["V1-M04"];
const joined = JSON.stringify(mission);
const lowerJoined = joined.toLowerCase();
const expectedTests = ["V1-M04-T01", "V1-M04-T02", "V1-M04-T03", "V1-M04-T04"];
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

assert(mission?.id === "V1-M04", "V1-M04 lesson missing or renamed");
assert(mission.title === "Select a Settler", "V1-M04 title changed");
assert(mission.steps.length >= 12, "M4 must render as a complete beginner lesson, not a compact checklist");
assert(JSON.stringify(mission.tests.map(test => test.id)) === JSON.stringify(expectedTests), "M4 canonical test IDs changed");

for (const term of [
  "ClickDetector",
  "LocalScript",
  "selectedNPC",
  "SelectedNPCHighlight",
  "Adornee",
  "local player state",
  "WaitForChild",
  "MouseClick",
  "Connect",
  "ResetOnSpawn"
]) {
  assert(lowerJoined.includes(term.toLowerCase()), `Missing required M4 explanation or technical term: ${term}`);
}

for (const path of [
  "Workspace > World > NPCs > NPC_1",
  "Workspace > World > NPCs > NPC_2",
  "StarterGui > CommandGui > CommandClient",
  "NPC_1\\n        │   └── HumanoidRootPart",
  "NPC_2\\n            └── HumanoidRootPart"
]) {
  assert(joined.includes(path), `Missing exact beginner path or hierarchy: ${path}`);
}

for (const phrase of [
  "Do not create a command panel",
  "The visible command HUD belongs to V1-M06",
  "Do not add command, resource, movement, or server code",
  "no Panel, buttons, resources, commands, or movement code",
  "validated APPROVED result before V1-M05 unlocks"
]) {
  assert(joined.includes(phrase), `Missing required M4 boundary wording: ${phrase}`);
}

const commandCode = mission.steps.flatMap(step => step.codeBlocks || []).map(block => block.code).join("\n");
assert(commandCode.includes("local selectedNPC = nil"), "Complete CommandClient code does not declare selectedNPC");
assert(commandCode.includes("Instance.new(\"Highlight\")"), "Complete CommandClient code does not create Highlight");
assert(commandCode.includes("selectionHighlight.Name = \"SelectedNPCHighlight\""), "Highlight exact name missing");
assert(commandCode.includes("selectionHighlight.Adornee = selectedNPC"), "Highlight does not move by Adornee");
assert(commandCode.includes("connectNPC(npc1)") && commandCode.includes("connectNPC(npc2)"), "Both click connections are not created once");
assert(!commandCode.includes("RemoteEvent") && !commandCode.includes("FireServer"), "M4 code introduced later RemoteEvent behavior");

for (const forbidden of [
  "CommandNPC",
  "BuildHut",
  "ResetWorld",
  "PathfindingService",
  "MoveTo",
  "WoodNode",
  "StoneNode",
  "TargetPoint",
  "Panel (Frame)"
]) {
  assert(!commandCode.includes(forbidden), `M4 CommandClient code introduced later feature: ${forbidden}`);
}

assert(runtime.includes("step.codeBlocks"), "Mission renderer does not render lesson code blocks");
assert(review.includes("mission-lessons-m04.js"), "Sanitized M4 review does not load the exact M4 source");
assert(!review.includes("localStorage") && !review.includes("sessionStorage") && !review.includes("/api/"), "Sanitized M4 review can access learner data");

console.log(JSON.stringify({
  mission: "V1-M04",
  steps: mission.steps.length,
  tests: expectedTests,
  lesson_contract: "PASS",
  renderer_contract: "PASS",
  sanitized_review: "PASS",
  later_missions_untouched: "PASS"
}, null, 2));
