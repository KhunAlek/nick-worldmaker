import app from "./index.js";
import { buildLateFixture } from "./release-test-fixtures-late.js";

const TEST_PATH = /^\/internal\/release-test\/(V1-M(?:0[7-9]|1[0-5]))\/(needs_evidence|approved)$/;
const ORIGIN = "https://khunalek.github.io";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const authorized = Boolean(
      env.RELEASE_TEST_TOKEN &&
      request.headers.get("authorization") === `Bearer ${env.RELEASE_TEST_TOKEN}`
    );

    if (url.pathname === "/internal/release-test/views") {
      if (request.method !== "GET") return json({ error: "Method not allowed" }, 405);
      if (!authorized) return json({ error: "Unauthorized" }, 401);
      const learner = await callProgressWithFreshSession(url.origin, env, ctx, "learner");
      const parent = await callProgressWithFreshSession(url.origin, env, ctx, "parent");
      return json({ learner, parent });
    }

    const match = url.pathname.match(TEST_PATH);
    if (!match) return app.fetch(request, env, ctx);
    if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
    if (!authorized) return json({ error: "Unauthorized" }, 401);

    const [, missionId, fixtureType] = match;
    if (!env.RELEASE_TEST_FAMILY_ID || missionId !== env.RELEASE_TEST_MISSION_ID) {
      return json({ error: "Release-test mission is not the configured pilot" }, 409);
    }

    const progress = await env.DB.prepare(
      "SELECT status FROM mission_progress WHERE family_id=? AND mission_id=?"
    ).bind(env.RELEASE_TEST_FAMILY_ID, missionId).first();
    if (!progress) return json({ error: "Release-test progress row is missing" }, 409);
    if (fixtureType === "needs_evidence" && progress.status === "APPROVED") {
      return json({ error: "Refusing to regress an already approved release-test mission" }, 409);
    }

    const fixture = buildFixture(missionId, fixtureType);
    return callSubmissionWithFreshSession(url.origin, env, ctx, missionId, fixture);
  }
};

async function callSubmissionWithFreshSession(origin, env, ctx, missionId, fixture) {
  let lastResponse;
  for (let attempt = 1; attempt <= 12; attempt += 1) {
    const token = await createShortSession(env, "learner");
    await delay(Math.min(250 * attempt, 1500));
    const request = new Request(`${origin}/api/missions/${missionId}/submissions`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
        origin: env.ALLOWED_ORIGIN || ORIGIN
      },
      body: JSON.stringify(fixture)
    });
    lastResponse = await app.fetch(request, env, ctx);
    if (lastResponse.status !== 401) return cloneJsonResponse(lastResponse);
    await delay(300 * attempt);
  }
  return cloneJsonResponse(lastResponse || json({ error: "Synthetic session authentication failed" }, 500));
}

async function callProgressWithFreshSession(origin, env, ctx, role) {
  let lastResponse;
  for (let attempt = 1; attempt <= 12; attempt += 1) {
    const token = await createShortSession(env, role);
    await delay(Math.min(250 * attempt, 1500));
    const request = new Request(`${origin}/api/progress`, {
      headers: {
        authorization: `Bearer ${token}`,
        origin: env.ALLOWED_ORIGIN || ORIGIN
      }
    });
    lastResponse = await app.fetch(request, env, ctx);
    if (lastResponse.status !== 401) {
      return { status: lastResponse.status, body: await lastResponse.json() };
    }
    await delay(300 * attempt);
  }
  return { status: lastResponse?.status || 500, body: { error: "Synthetic session authentication failed" } };
}

async function createShortSession(env, role) {
  const token = crypto.randomUUID() + crypto.randomUUID();
  const tokenHash = await sha256(token);
  await env.DB.prepare(
    "INSERT INTO sessions(id,family_id,role,token_hash,expires_at) VALUES(?,?,?,?,?)"
  ).bind(
    crypto.randomUUID(),
    env.RELEASE_TEST_FAMILY_ID,
    role,
    tokenHash,
    new Date(Date.now() + 10 * 60 * 1000).toISOString()
  ).run();
  return token;
}

function buildFixture(missionId, fixtureType) {
  if (missionId === "V1-M07") return buildM7Fixture(fixtureType);
  const late = buildLateFixture(missionId, fixtureType);
  if (late) return late;
  throw new Error(`No controlled fixture is registered for ${missionId}`);
}

function buildM7Fixture(type) {
  const approved = type === "approved";
  return {
    mission_id: "V1-M07",
    code: approved
      ? `local ReplicatedStorage = game:GetService("ReplicatedStorage")\nlocal remotes = ReplicatedStorage:WaitForChild("Remotes")\nlocal commandNPC = remotes:WaitForChild("CommandNPC")\nlocal commandResult = remotes:WaitForChild("CommandResult")\nlocal selectedNPC = nil\nlocal function sendCommand(commandName)\n  if not selectedNPC then return end\n  commandNPC:FireServer(selectedNPC, commandName)\nend\ncommandResult.OnClientEvent:Connect(function(ok, message)\n  print(ok, message)\nend)`
      : `local commandNPC = game.ReplicatedStorage.Remotes.CommandNPC\ncommandNPC:FireServer(nil, "GatherWood")\n-- server validation and response evidence omitted`,
    explorer_summary: approved
      ? "CONTROLLED RELEASE TEST ORACLE: all four canonical RemoteEvents exist; CommandClient blocks requests when no NPC is selected; CommandNPC direction is client-to-server and CommandResult returns server-to-client."
      : "CONTROLLED RELEASE TEST: RemoteEvent names are claimed, but direction, membership validation, and returned response are not proven.",
    output: approved
      ? "CONTROLLED RELEASE TEST ORACLE: no-selection clicks sent zero server requests; valid selected-NPC request reached the server; forged outsider Model and malformed NPC requests were rejected; server response reached only the requesting client; Wood, Stone, HutBuilt, and construction state remained unchanged."
      : "CONTROLLED RELEASE TEST: no fresh server/client output demonstrating rejected forged NPCs or a returned server response.",
    screenshots: [approved ? "release-test-oracle://V1-M07/T01-remotes" : "release-test-oracle://V1-M07/missing-proof"],
    checklist: Object.fromEntries(Array.from({ length: 5 }, (_, index) => [`V1-M07-T${String(index + 1).padStart(2, "0")}`, approved])),
    understanding: "The server checks NPC membership so a client cannot command an arbitrary or forged object outside Workspace.World.NPCs.",
    release_test_attestation: {
      kind: "controlled_fixture",
      expected_status: approved ? "APPROVED" : "NEEDS_EVIDENCE",
      visual_runtime_observed: approved,
      oracle_version: "worldmaker-release-fixture-v1",
      note: "Machine-observed release assertions reachable only through the secret isolated endpoint."
    }
  };
}

async function cloneJsonResponse(response) {
  return new Response(await response.text(), {
    status: response.status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
  });
}

async function sha256(value) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(bytes)].map(value => value.toString(16).padStart(2, "0")).join("");
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function json(value, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
  });
}
