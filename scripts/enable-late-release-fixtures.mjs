import fs from "node:fs";

const path = "backend/src/release-test-wrapper.js";
let source = fs.readFileSync(path, "utf8");

if (!source.includes('import { buildLateFixture } from "./release-test-fixtures-late.js";')) {
  source = source.replace('import app from "./index.js";','import app from "./index.js";\nimport { buildLateFixture } from "./release-test-fixtures-late.js";');
}

source = source.replace(
  '  if (!builders[missionId]) throw new Error(`No controlled fixture is registered for ${missionId}`);\n  return builders[missionId](fixtureType);',
  '  if (builders[missionId]) return builders[missionId](fixtureType);\n  const late = buildLateFixture(missionId, fixtureType);\n  if (late) return late;\n  throw new Error(`No controlled fixture is registered for ${missionId}`);'
);

fs.writeFileSync(path, source);
console.log("Late release fixtures are wired into the isolated wrapper.");
