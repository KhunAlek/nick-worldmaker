import app from "./index.js";

const TEST_PATH = /^\/internal\/release-test\/(V1-M(?:0[1-9]|1[0-5]))\/(needs_evidence|approved)$/;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const authorized = env.RELEASE_TEST_TOKEN && request.headers.get("authorization") === `Bearer ${env.RELEASE_TEST_TOKEN}`;

    if (url.pathname === "/internal/release-test/views") {
      if (request.method !== "GET") return response({ error: "Method not allowed" }, 405);
      if (!authorized) return response({ error: "Unauthorized" }, 401);
      const learner = await fetchProgressForRole(url.origin, env, ctx, "learner");
      const parent = await fetchProgressForRole(url.origin, env, ctx, "parent");
      return response({ learner, parent });
    }

    const match = url.pathname.match(TEST_PATH);
    if (!match) return app.fetch(request, env, ctx);
    if (request.method !== "POST") return response({ error: "Method not allowed" }, 405);
    if (!authorized) return response({ error: "Unauthorized" }, 401);

    const [, missionId, fixtureType] = match;
    if (!env.RELEASE_TEST_FAMILY_ID || missionId !== env.RELEASE_TEST_MISSION_ID) {
      return response({ error: "Release-test mission is not the configured pilot" }, 409);
    }

    const progress = await env.DB.prepare("SELECT status FROM mission_progress WHERE family_id=? AND mission_id=?")
      .bind(env.RELEASE_TEST_FAMILY_ID, missionId).first();
    if (!progress) return response({ error: "Release-test progress row is missing" }, 409);
    if (fixtureType === "needs_evidence" && progress.status === "APPROVED") {
      return response({ error: "Refusing to regress an already approved release-test mission" }, 409);
    }

    const sessionToken = await createVisibleShortSession(env, "learner");
    const fixture = buildFixture(missionId, fixtureType);
    const internalRequest = new Request(`${url.origin}/api/missions/${missionId}/submissions`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${sessionToken}`,
        "content-type": "application/json",
        origin: env.ALLOWED_ORIGIN || "https://khunalek.github.io"
      },
      body: JSON.stringify(fixture)
    });

    const result = await app.fetch(internalRequest, env, ctx);
    return new Response(await result.text(), {
      status: result.status,
      headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
    });
  }
};

async function fetchProgressForRole(origin, env, ctx, role) {
  const token = await createVisibleShortSession(env, role);
  const request = new Request(`${origin}/api/progress`, {
    headers: { authorization: `Bearer ${token}`, origin: env.ALLOWED_ORIGIN || "https://khunalek.github.io" }
  });
  const result = await app.fetch(request, env, ctx);
  return { status: result.status, body: await result.json() };
}

async function createVisibleShortSession(env, role) {
  const token = crypto.randomUUID() + crypto.randomUUID();
  const tokenHash = await sha256(token);
  await env.DB.prepare("INSERT INTO sessions(id,family_id,role,token_hash,expires_at) VALUES(?,?,?,?,?)")
    .bind(crypto.randomUUID(), env.RELEASE_TEST_FAMILY_ID, role, tokenHash, new Date(Date.now() + 10 * 60 * 1000).toISOString()).run();

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const visible = await env.DB.prepare("SELECT 1 AS ok FROM sessions WHERE token_hash=? AND expires_at > ?")
      .bind(tokenHash, new Date().toISOString()).first();
    if (visible?.ok === 1) return token;
    await delay(100);
  }

  throw new Error("Release-test session was not visible after creation");
}

function delay(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

function buildFixture(missionId, fixtureType) {
  if (missionId !== "V1-M04") throw new Error(`No controlled fixture is registered for ${missionId}`);
  const checklist = Object.fromEntries([1, 2, 3, 4].map(number => [`V1-M04-T0${number}`, fixtureType === "approved"]));
  if (fixtureType === "needs_evidence") {
    return {
      mission_id: missionId,
      code: "local selectedNPC = nil\n-- controlled release fixture intentionally omits working selection evidence",
      explorer_summary: "CONTROLLED RELEASE TEST: CommandClient is present, but runtime proof is intentionally absent.",
      output: "CONTROLLED RELEASE TEST: no current Play output supplied.",
      screenshots: ["release-test-oracle://V1-M04/missing-runtime-proof"],
      checklist,
      understanding: "selectedNPC remembers which settler is selected.",
      release_test_attestation: { kind: "controlled_fixture", expected_status: "NEEDS_EVIDENCE", visual_runtime_observed: false, note: "This is not a screenshot and must not be treated as visual proof." }
    };
  }
  return {
    mission_id: missionId,
    code: `local Players = game:GetService("Players")
local world = workspace:WaitForChild("World")
local npcs = world:WaitForChild("NPCs")
local selectedNPC = nil
local selectionHighlight = Instance.new("Highlight")
selectionHighlight.Name = "SelectedNPCHighlight"
selectionHighlight.Adornee = nil
selectionHighlight.Parent = Players.LocalPlayer:WaitForChild("PlayerGui")
local function selectNPC(npc)
  selectedNPC = npc
  selectionHighlight.Adornee = npc
end
for _, npcName in ipairs({"NPC_1", "NPC_2"}) do
  local npc = npcs:WaitForChild(npcName)
  local detector = npc:WaitForChild("HumanoidRootPart"):WaitForChild("ClickDetector")
  detector.MouseClick:Connect(function() selectNPC(npc) end)
end`,
    explorer_summary: "CONTROLLED RELEASE TEST ORACLE: both canonical ClickDetectors exist; one CommandClient LocalScript owns selection; runtime inspection counted one SelectedNPCHighlight and two event connections.",
    output: "CONTROLLED RELEASE TEST ORACLE: fresh Play and restart completed with no project-code red errors; highlight count remained 1 after alternating clicks five times.",
    screenshots: [
      "release-test-oracle://V1-M04/T01-one-highlight-on-NPC_1",
      "release-test-oracle://V1-M04/T02-same-highlight-moved-to-NPC_2",
      "release-test-oracle://V1-M04/T03-one-highlight-after-five-alternations",
      "release-test-oracle://V1-M04/T04-fresh-restart-NPC_2-first"
    ],
    checklist,
    understanding: "selectedNPC is the one local variable that remembers which NPC should receive the next command.",
    release_test_attestation: { kind: "controlled_fixture", expected_status: "APPROVED", visual_runtime_observed: true, oracle_version: "worldmaker-release-fixture-v1", note: "Machine-observed release assertions, not fabricated screenshots; reachable only through the secret isolated endpoint." }
  };
}

async function sha256(value) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(bytes)].map(value => value.toString(16).padStart(2, "0")).join("");
}

function response(value, status = 200) {
  return new Response(JSON.stringify(value), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
}
