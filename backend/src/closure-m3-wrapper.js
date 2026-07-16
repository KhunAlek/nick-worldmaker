import app from "./index.js";

const ORIGIN = "https://khunalek.github.io";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const authorized = Boolean(
      env.RELEASE_TEST_TOKEN &&
      request.headers.get("authorization") === `Bearer ${env.RELEASE_TEST_TOKEN}`
    );

    if (url.pathname === "/internal/closure-m3/views") {
      if (request.method !== "GET") return json({ error: "Method not allowed" }, 405);
      if (!authorized) return json({ error: "Unauthorized" }, 401);
      const learner = await fetchProgress(url.origin, env, ctx, "learner");
      const parent = await fetchProgress(url.origin, env, ctx, "parent");
      return json({ learner, parent });
    }

    const match = url.pathname.match(/^\/internal\/closure-m3\/(needs_evidence|approved)$/);
    if (!match) return app.fetch(request, env, ctx);
    if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
    if (!authorized) return json({ error: "Unauthorized" }, 401);
    if (!env.RELEASE_TEST_FAMILY_ID || env.RELEASE_TEST_MISSION_ID !== "V1-M03") {
      return json({ error: "M3 closure pilot is not configured" }, 409);
    }

    const fixture = buildFixture(match[1]);
    const internalRequest = new Request(`${url.origin}/api/missions/V1-M03/submissions`, {
      method: "POST",
      headers: internalHeaders(env, "learner", true),
      body: JSON.stringify(fixture)
    });
    return cloneJsonResponse(await app.fetch(internalRequest, env, ctx));
  }
};

async function fetchProgress(origin, env, ctx, role) {
  const result = await app.fetch(new Request(`${origin}/api/progress`, {
    headers: internalHeaders(env, role, false)
  }), env, ctx);
  return { status: result.status, body: await result.json() };
}

function internalHeaders(env, role, includeContentType) {
  const headers = {
    authorization: `Bearer ${env.RELEASE_TEST_TOKEN}`,
    origin: env.ALLOWED_ORIGIN || ORIGIN,
    "x-worldmaker-release-family": env.RELEASE_TEST_FAMILY_ID,
    "x-worldmaker-release-role": role
  };
  if (includeContentType) headers["content-type"] = "application/json";
  return headers;
}

function buildFixture(type) {
  const approved = type === "approved";
  return {
    mission_id: "V1-M03",
    explorer_summary: approved
      ? "CONTROLLED RELEASE TEST ORACLE: Workspace > World > NPCs contains exactly NPC_1 and NPC_2. Each Model contains Humanoid and HumanoidRootPart, and each Model PrimaryPart is HumanoidRootPart. Workspace > World > NPCHomes contains exactly NPC_1_Home and NPC_2_Home."
      : "CONTROLLED RELEASE TEST: two NPC names are claimed, but rig internals, PrimaryPart, stability, and home-marker properties are not proven.",
    properties: approved
      ? "Both NPC rigs are movable and stable. NPC_1_Home and NPC_2_Home are Anchored=true, CanCollide=false, placed under their matching starts."
      : "No current PrimaryPart or home-marker property evidence supplied.",
    output: approved
      ? "Fresh Play: both settlers remained upright, separate, and on the ground. No Nick-code red error."
      : "No current Play Output or runtime stability proof supplied.",
    screenshots: [approved ? "release-test-oracle://V1-M03/approved" : "release-test-oracle://V1-M03/missing-proof"],
    checklist: {
      "V1-M03-T01": approved,
      "V1-M03-T02": approved,
      "V1-M03-T03": approved
    },
    understanding: "A movable NPC rig needs a Humanoid and HumanoidRootPart; an ordinary statue Model does not provide the same character movement structure.",
    release_test_attestation: {
      kind: "controlled_fixture",
      expected_status: approved ? "APPROVED" : "NEEDS_EVIDENCE",
      visual_runtime_observed: approved,
      oracle_version: "worldmaker-15-july-closure-m3-v1",
      note: "Machine-observed isolated closure assertions reachable only through the temporary secret endpoint."
    }
  };
}

async function cloneJsonResponse(response) {
  return new Response(await response.text(), {
    status: response.status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
  });
}

function json(value, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
  });
}
