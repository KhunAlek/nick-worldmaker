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
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error("Release-test session was not visible after creation");
}

function checklist(missionId, count, approved) {
  return Object.fromEntries(Array.from({ length: count }, (_, index) => [`${missionId}-T${String(index + 1).padStart(2, "0")}`, approved]));
}

function attestation(expectedStatus, observed) {
  return {
    kind: "controlled_fixture",
    expected_status: expectedStatus,
    visual_runtime_observed: observed,
    oracle_version: "worldmaker-release-fixture-v1",
    note: "Machine-observed release assertions reachable only through the secret isolated endpoint."
  };
}

function buildFixture(missionId, fixtureType) {
  const builders = {
    "V1-M04": buildM4Fixture,
    "V1-M05": buildM5Fixture,
    "V1-M06": buildM6Fixture,
    "V1-M07": buildM7Fixture
  };
  if (!builders[missionId]) throw new Error(`No controlled fixture is registered for ${missionId}`);
  return builders[missionId](fixtureType);
}

function buildM4Fixture(type) {
  const approved = type === "approved";
  return {
    mission_id: "V1-M04",
    code: approved ? "local selectedNPC = nil\nlocal selectionHighlight = Instance.new(\"Highlight\")\nselectionHighlight.Name = \"SelectedNPCHighlight\"" : "local selectedNPC = nil",
    explorer_summary: approved ? "CONTROLLED RELEASE TEST ORACLE: both ClickDetectors exist; one CommandClient owns selection; one highlight moves between NPC_1 and NPC_2." : "CONTROLLED RELEASE TEST: runtime selection proof is absent.",
    output: approved ? "Fresh Play and restart passed; highlight count remained one after alternating clicks." : "No current Play output supplied.",
    screenshots: [approved ? "release-test-oracle://V1-M04/approved" : "release-test-oracle://V1-M04/missing-proof"],
    checklist: checklist("V1-M04", 4, approved),
    understanding: "selectedNPC remembers which settler is selected.",
    release_test_attestation: attestation(approved ? "APPROVED" : "NEEDS_EVIDENCE", approved)
  };
}

function buildM5Fixture(type) {
  const approved = type === "approved";
  return {
    mission_id: "V1-M05",
    explorer_summary: approved ? "CONTROLLED RELEASE TEST ORACLE: exactly WoodNode and StoneNode exist and each has exactly one TargetPoint." : "CONTROLLED RELEASE TEST: TargetPoint properties and route clearance are not proven.",
    properties: approved ? "Both TargetPoints are Anchored=true, Transparency=1, CanCollide=false and on reachable open ground." : "No verified TargetPoint property dump supplied.",
    output: approved ? "Fresh Play and restart passed; both visible nodes remained stable and routes stayed open." : "No fresh Play output supplied.",
    screenshots: [approved ? "release-test-oracle://V1-M05/approved" : "release-test-oracle://V1-M05/missing-proof"],
    checklist: checklist("V1-M05", 3, approved),
    understanding: "A separate TargetPoint gives pathfinding a simple reachable destination.",
    release_test_attestation: attestation(approved ? "APPROVED" : "NEEDS_EVIDENCE", approved)
  };
}

function buildM6Fixture(type) {
  const approved = type === "approved";
  return {
    mission_id: "V1-M06",
    code: approved ? "local hud = playerGui:WaitForChild(\"CommandHUD\")\nlocal selectedLabel = hud:WaitForChild(\"SelectedLabel\")" : "-- HUD runtime behavior not proven",
    explorer_summary: approved ? "CONTROLLED RELEASE TEST ORACLE: one CommandHUD contains SelectedLabel and all four canonical buttons; one CommandClient owns the controls." : "CONTROLLED RELEASE TEST: exact hierarchy and single-script ownership are not verified.",
    output: approved ? "Fresh Play passed; selection label updated; all four buttons showed temporary feedback without changing game state." : "No button interaction proof supplied.",
    screenshots: [approved ? "release-test-oracle://V1-M06/approved" : "release-test-oracle://V1-M06/missing-proof"],
    checklist: checklist("V1-M06", 4, approved),
    understanding: "The client changes the HUD; the server authorizes shared-state commands.",
    release_test_attestation: attestation(approved ? "APPROVED" : "NEEDS_EVIDENCE", approved)
  };
}

function buildM7Fixture(type) {
  const approved = type === "approved";
  return {
    mission_id: "V1-M07",
    code: approved ? `local ReplicatedStorage = game:GetService("ReplicatedStorage")
local remotes = ReplicatedStorage:WaitForChild("Remotes")
local commandNPC = remotes:WaitForChild("CommandNPC")
local commandResult = remotes:WaitForChild("CommandResult")
local selectedNPC = nil
local function sendCommand(commandName)
  if not selectedNPC then return end
  commandNPC:FireServer(selectedNPC, commandName)
end
commandResult.OnClientEvent:Connect(function(ok, message)
  print(ok, message)
end)` : `local commandNPC = game.ReplicatedStorage.Remotes.CommandNPC
commandNPC:FireServer(nil, "GatherWood")
-- server validation and response evidence omitted`,
    explorer_summary: approved ? "CONTROLLED RELEASE TEST ORACLE: all four canonical RemoteEvents exist; CommandClient blocks requests when no NPC is selected; CommandNPC direction is client-to-server and CommandResult returns server-to-client." : "CONTROLLED RELEASE TEST: RemoteEvent names are claimed, but direction, membership validation, and returned response are not proven.",
    output: approved ? "CONTROLLED RELEASE TEST ORACLE: no-selection clicks sent zero server requests; valid selected-NPC request reached the server; forged outsider Model and malformed NPC requests were rejected; server response reached only the requesting client; Wood, Stone, HutBuilt, and construction state remained unchanged." : "CONTROLLED RELEASE TEST: no fresh server/client output demonstrating rejected forged NPCs or a returned server response.",
    screenshots: [approved ? "release-test-oracle://V1-M07/T01-remotes" : "release-test-oracle://V1-M07/missing-proof"],
    checklist: checklist("V1-M07", 5, approved),
    understanding: "The server checks NPC membership so a client cannot command an arbitrary or forged object outside Workspace.World.NPCs.",
    release_test_attestation: attestation(approved ? "APPROVED" : "NEEDS_EVIDENCE", approved)
  };
}

async function sha256(value) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(bytes)].map(value => value.toString(16).padStart(2, "0")).join("");
}

function response(value, status = 200) {
  return new Response(JSON.stringify(value), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
}
