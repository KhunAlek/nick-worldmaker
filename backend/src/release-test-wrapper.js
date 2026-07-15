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
  if (missionId === "V1-M04") return buildM4Fixture(fixtureType);
  if (missionId === "V1-M05") return buildM5Fixture(fixtureType);
  throw new Error(`No controlled fixture is registered for ${missionId}`);
}

function buildM4Fixture(fixtureType) {
  const checklist = Object.fromEntries([1, 2, 3, 4].map(number => [`V1-M04-T0${number}`, fixtureType === "approved"]));
  if (fixtureType === "needs_evidence") {
    return {
      mission_id: "V1-M04",
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
    mission_id: "V1-M04",
    code: "local Players = game:GetService(\"Players\")\nlocal world = workspace:WaitForChild(\"World\")\nlocal npcs = world:WaitForChild(\"NPCs\")\nlocal selectedNPC = nil\nlocal selectionHighlight = Instance.new(\"Highlight\")\nselectionHighlight.Name = \"SelectedNPCHighlight\"\nselectionHighlight.Adornee = nil\nselectionHighlight.Parent = Players.LocalPlayer:WaitForChild(\"PlayerGui\")",
    explorer_summary: "CONTROLLED RELEASE TEST ORACLE: both canonical ClickDetectors exist; one CommandClient LocalScript owns selection; runtime inspection counted one SelectedNPCHighlight and two event connections.",
    output: "CONTROLLED RELEASE TEST ORACLE: fresh Play and restart completed with no project-code red errors; highlight count remained 1 after alternating clicks five times.",
    screenshots: ["release-test-oracle://V1-M04/T01", "release-test-oracle://V1-M04/T02", "release-test-oracle://V1-M04/T03", "release-test-oracle://V1-M04/T04"],
    checklist,
    understanding: "selectedNPC is the one local variable that remembers which NPC should receive the next command.",
    release_test_attestation: { kind: "controlled_fixture", expected_status: "APPROVED", visual_runtime_observed: true, oracle_version: "worldmaker-release-fixture-v1" }
  };
}

function buildM5Fixture(fixtureType) {
  const checklist = Object.fromEntries([1, 2, 3].map(number => [`V1-M05-T0${number}`, fixtureType === "approved"]));
  if (fixtureType === "needs_evidence") {
    return {
      mission_id: "V1-M05",
      explorer_summary: "CONTROLLED RELEASE TEST: WoodNode and StoneNode are named, but TargetPoint properties and route clearance are not proven.",
      properties: "No verified TargetPoint property dump supplied.",
      output: "CONTROLLED RELEASE TEST: no fresh Play output supplied.",
      screenshots: ["release-test-oracle://V1-M05/missing-targetpoint-proof"],
      checklist,
      understanding: "A separate TargetPoint gives pathfinding a simple reachable destination away from decorative geometry.",
      release_test_attestation: { kind: "controlled_fixture", expected_status: "NEEDS_EVIDENCE", visual_runtime_observed: false, note: "This is not visual proof." }
    };
  }
  return {
    mission_id: "V1-M05",
    explorer_summary: "CONTROLLED RELEASE TEST ORACLE: Workspace.World.Resources contains exactly WoodNode and StoneNode Models; each contains exactly one TargetPoint; no duplicate resource Models or TargetPoints exist.",
    properties: "WoodNode.TargetPoint and StoneNode.TargetPoint: Anchored=true, Transparency=1, CanCollide=false; each target is positioned on reachable open ground beside its visible node.",
    output: "CONTROLLED RELEASE TEST ORACLE: fresh Play and restart completed with no project-code red errors; both visible resource nodes remained stable and routes from both NPC homes stayed unobstructed.",
    screenshots: ["release-test-oracle://V1-M05/T01-hierarchy", "release-test-oracle://V1-M05/T02-properties", "release-test-oracle://V1-M05/T03-routes-and-restart"],
    checklist,
    understanding: "A separate TargetPoint is safer because pathfinding targets a simple reachable invisible part instead of the possibly blocked center of decorative geometry.",
    release_test_attestation: { kind: "controlled_fixture", expected_status: "APPROVED", visual_runtime_observed: true, oracle_version: "worldmaker-release-fixture-v1" }
  };
}

async function sha256(value) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(bytes)].map(value => value.toString(16).padStart(2, "0")).join("");
}

function response(value, status = 200) {
  return new Response(JSON.stringify(value), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
}
