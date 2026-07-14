import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = path.join(root, "assets/js/mission-release-manifest.js");
const backendPath = path.join(root, "backend/src/index.js");
const missionId = process.argv[2];

if (!/^V1-M(?:0[4-9]|1[0-5])$/.test(missionId || "")) {
  throw new Error("Usage: node scripts/promote-mission.mjs V1-M04");
}

const manifestSource = fs.readFileSync(manifestPath, "utf8");
const context = vm.createContext({ window: {} });
vm.runInContext(manifestSource, context, { filename: "mission-release-manifest.js" });
const manifest = context.window.WORLDMAKER_RELEASE_MANIFEST;
const mission = manifest.missions[missionId];
assert.ok(mission, `${missionId} is absent from the manifest.`);
assert.equal(mission.lesson_configured, true, "Lesson is not configured.");
assert.equal(mission.evaluator_configured, true, "Evaluator is not configured.");
for (const [gate, passed] of Object.entries(mission.release_tests)) {
  assert.equal(passed, true, `${missionId} cannot be promoted: ${gate} has not passed.`);
}

const number = Number(missionId.slice(-2));
const previousId = `V1-M${String(number - 1).padStart(2, "0")}`;
assert.ok(manifest.released_ids.includes(previousId), `${missionId} cannot be promoted before ${previousId}.`);
assert.ok(!manifest.released_ids.includes(missionId), `${missionId} is already released.`);

let backend = fs.readFileSync(backendPath, "utf8");
const missionPattern = new RegExp(`("${missionId}":\\s*mission\\(\\{)(?!\\s*releaseState:)`);
if (!missionPattern.test(backend)) throw new Error(`Could not locate an unreleased ${missionId} registry entry.`);
backend = backend.replace(missionPattern, `$1 releaseState: "released",`);
fs.writeFileSync(backendPath, backend);

let updatedManifest = manifestSource;
const releasedMatch = updatedManifest.match(/const releasedIds=(\[[^;]*\]);/);
if (!releasedMatch) throw new Error("Manifest releasedIds marker is missing.");
const releasedIds = JSON.parse(releasedMatch[1]);
releasedIds.push(missionId);
releasedIds.sort();
updatedManifest = updatedManifest.replace(releasedMatch[0], `const releasedIds=${JSON.stringify(releasedIds)};`);
fs.writeFileSync(manifestPath, updatedManifest);

console.log(`Promoted ${missionId}. It is released in source but remains learner-locked until ${previousId} is approved.`);
