import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const backendPath = path.join(root, "backend/src/index.js");
const wranglerPath = path.join(root, "backend/wrangler.toml");
const familyId = process.argv[2];
const missionId = process.argv[3] || "V1-M04";

if (!/^[0-9a-f-]{36}$/i.test(familyId || "")) {
  throw new Error("Usage: node scripts/configure-release-pilot.mjs <family-uuid> [mission-id]");
}
if (!/^V1-M(?:0[3-9]|1[0-5])$/.test(missionId)) {
  throw new Error("Invalid pilot mission ID.");
}

let source = fs.readFileSync(backendPath, "utf8");

if (!source.includes("function isPilotMissionAvailable")) {
  source = source.replace(
    "async function getProgress(auth, env, cors) {",
    `function isPilotMissionAvailable(auth, env, missionId, config) {\n  return config.releaseState === "released" || (\n    auth.family_id === env.RELEASE_TEST_FAMILY_ID &&\n    missionId === env.RELEASE_TEST_MISSION_ID\n  );\n}\n\nasync function getProgress(auth, env, cors) {`
  );

  source = source.replace(
    "const missions = Object.entries(missionRegistry).map(([id, config]) => ({ id, title: config.title, next_mission_id: config.next, release_state: config.releaseState, test_ids: config.tests, required_evidence: config.evidence }));",
    "const missions = Object.entries(missionRegistry).map(([id, config]) => ({ id, title: config.title, next_mission_id: config.next, release_state: isPilotMissionAvailable(auth, env, id, config) ? \"released\" : config.releaseState, test_ids: config.tests, required_evidence: config.evidence }));"
  );

  source = source.replace(
    "if (config.releaseState !== \"released\") return json({ error: \"Mission is unlocked in progress but not released yet\" }, 409, cors);",
    "if (!isPilotMissionAvailable(auth, env, missionId, config)) return json({ error: \"Mission is unlocked in progress but not released yet\" }, 409, cors);"
  );
}

if (!source.includes("x-worldmaker-release-family")) {
  source = source.replace(
    `async function authenticate(request, env) {\n  const value = request.headers.get("authorization") || "";\n  if (!value.startsWith("Bearer ")) return null;`,
    `async function authenticate(request, env) {\n  const value = request.headers.get("authorization") || "";\n  const internalFamily = request.headers.get("x-worldmaker-release-family");\n  const internalRole = request.headers.get("x-worldmaker-release-role");\n  if (\n    env.RELEASE_TEST_TOKEN &&\n    env.RELEASE_TEST_FAMILY_ID &&\n    env.RELEASE_TEST_MISSION_ID &&\n    value === \`Bearer \${env.RELEASE_TEST_TOKEN}\` &&\n    internalFamily === env.RELEASE_TEST_FAMILY_ID &&\n    (internalRole === "learner" || internalRole === "parent")\n  ) {\n    return { family_id: internalFamily, role: internalRole };\n  }\n  if (!value.startsWith("Bearer ")) return null;`
  );
}

if (!source.includes("isPilotMissionAvailable") || !source.includes("x-worldmaker-release-family")) {
  throw new Error("Backend pilot patch could not be applied.");
}
fs.writeFileSync(backendPath, source);

let wrangler = fs.readFileSync(wranglerPath, "utf8");
wrangler = upsertVar(wrangler, "RELEASE_TEST_FAMILY_ID", familyId);
wrangler = upsertVar(wrangler, "RELEASE_TEST_MISSION_ID", missionId);
fs.writeFileSync(wranglerPath, wrangler);

console.log(`Configured ${missionId} pilot access for isolated family ${familyId}.`);

function upsertVar(text, key, value) {
  const line = `${key} = "${value}"`;
  const pattern = new RegExp(`^${key}\\s*=.*$`, "m");
  if (pattern.test(text)) return text.replace(pattern, line);
  const marker = /^\[\[d1_databases\]\]/m;
  if (!marker.test(text)) throw new Error("wrangler.toml [vars] insertion point is missing.");
  return text.replace(marker, `${line}\n\n[[d1_databases]]`);
}
