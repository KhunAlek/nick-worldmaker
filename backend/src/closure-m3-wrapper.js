import app from "./index.js";

const ORIGIN = "https://khunalek.github.io";
const TESTS = ["V1-M03-T01", "V1-M03-T02", "V1-M03-T03"];

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

    try {
      const type = match[1];
      const fixture = buildFixture(type);
      const review = await persistControlledReview(env, fixture, type === "approved");
      return json({ review });
    } catch (error) {
      console.error("Controlled M3 closure fixture failed", error);
      return json({ error: "Controlled M3 closure fixture failed", detail: String(error?.message || error) }, 500);
    }
  }
};

async function fetchProgress(origin, env, ctx, role) {
  const result = await app.fetch(new Request(`${origin}/api/progress`, {
    headers: internalHeaders(env, role)
  }), env, ctx);
  return { status: result.status, body: await result.json() };
}

function internalHeaders(env, role) {
  return {
    authorization: `Bearer ${env.RELEASE_TEST_TOKEN}`,
    origin: env.ALLOWED_ORIGIN || ORIGIN,
    "x-worldmaker-release-family": env.RELEASE_TEST_FAMILY_ID,
    "x-worldmaker-release-role": role
  };
}

async function persistControlledReview(env, body, approved) {
  const familyId = env.RELEASE_TEST_FAMILY_ID;
  const count = await env.DB.prepare("SELECT COUNT(*) count FROM submissions WHERE family_id=? AND mission_id='V1-M03'").bind(familyId).first();
  const attempt = Number(count.count) + 1;
  const submissionId = crypto.randomUUID();
  const reviewId = crypto.randomUUID();
  const now = new Date().toISOString();
  const status = approved ? "APPROVED" : "NEEDS_EVIDENCE";
  const review = {
    status,
    mission_id: "V1-M03",
    attempt_number: attempt,
    headline: approved ? "Controlled M3 fixture passed." : "Controlled M3 fixture correctly needs evidence.",
    approved_requirements: approved ? ["Two valid settler rigs", "Two matching home markers", "Stable Play result"] : [],
    main_problem: approved ? null : "Required current hierarchy, property, and runtime evidence is missing.",
    explanation: approved ? "All canonical M3 requirements were supplied by the isolated closure oracle." : "The isolated negative fixture intentionally omits proof and must not unlock the next mission.",
    next_action: approved ? "Continue to V1-M04." : "Supply current hierarchy, properties, and Play evidence.",
    tests_to_repeat: approved ? [] : TESTS,
    hint_level: 0,
    understanding_question: approved ? null : "Why is an ordinary statue Model not enough for pathfinding movement?",
    parent_summary: approved ? "The isolated M3 release fixture passed and unlocked only M4." : "The isolated negative fixture stayed unapproved and unlocked nothing.",
    unlock_next_mission: approved,
    next_mission_id: approved ? "V1-M04" : null,
    confidence: 1,
    missing_evidence: approved ? [] : ["Current hierarchy proof", "PrimaryPart and home-marker properties", "Current Play stability proof"],
    reviewed_evidence: { code: false, hierarchy: approved, output: approved, checklist: approved, visual_runtime: approved, understanding: true },
    regressions: [],
    suspicious_input_detected: false,
    suspicious_input_note: null,
    block_type: null
  };
  const evidenceHash = await sha256(JSON.stringify(body));

  await env.DB.prepare("INSERT INTO submissions(id,family_id,mission_id,attempt_number,payload_json,evidence_hash,suspicious_input_detected,evaluator_version) VALUES(?,?,?,?,?,?,?,?)")
    .bind(submissionId, familyId, "V1-M03", attempt, JSON.stringify(body), evidenceHash, 0, env.EVALUATOR_VERSION).run();
  await env.DB.prepare("INSERT INTO reviews(id,submission_id,family_id,mission_id,attempt_number,model,response_json,validated,prompt_version) VALUES(?,?,?,?,?,?,?,?,?)")
    .bind(reviewId, submissionId, familyId, "V1-M03", attempt, "controlled-closure-oracle", JSON.stringify(review), 1, env.EVALUATOR_VERSION).run();
  await env.DB.prepare("INSERT INTO mission_progress(family_id,mission_id,status,hint_level,approved_review_id,updated_at) VALUES(?,?,?,?,?,?) ON CONFLICT(family_id,mission_id) DO UPDATE SET status=excluded.status,hint_level=excluded.hint_level,approved_review_id=excluded.approved_review_id,updated_at=excluded.updated_at")
    .bind(familyId, "V1-M03", status, 0, approved ? reviewId : null, now).run();
  await env.DB.prepare("INSERT INTO audit_log(id,family_id,action,mission_id,submission_id,review_id,details_json) VALUES(?,?,?,?,?,?,?)")
    .bind(crypto.randomUUID(), familyId, approved ? "MISSION_APPROVED" : "MISSION_REVIEWED", "V1-M03", submissionId, reviewId, JSON.stringify({ status, evidence_hash: evidenceHash, controlled_fixture: true })).run();
  if (approved) {
    await env.DB.prepare("INSERT INTO mission_progress(family_id,mission_id,status,hint_level,updated_at) VALUES(?,?,?,?,?) ON CONFLICT(family_id,mission_id) DO NOTHING")
      .bind(familyId, "V1-M04", "NOT_SUBMITTED", 0, now).run();
  }
  return review;
}

function buildFixture(type) {
  const approved = type === "approved";
  return {
    mission_id: "V1-M03",
    explorer_summary: approved ? "Workspace > World > NPCs contains exactly NPC_1 and NPC_2, each with Humanoid and HumanoidRootPart; NPCHomes contains matching markers." : "Two NPC names are claimed, but rig internals and home-marker proof are absent.",
    properties: approved ? "Both PrimaryParts are HumanoidRootPart; home markers are Anchored=true and CanCollide=false." : "No current property evidence.",
    output: approved ? "Fresh Play remained stable with both settlers upright and separate." : "No current Play proof.",
    screenshots: [approved ? "controlled://m3/approved" : "controlled://m3/missing"],
    checklist: Object.fromEntries(TESTS.map(id => [id, approved])),
    understanding: "A movable NPC rig needs character components that an ordinary statue Model does not provide.",
    release_test_attestation: { kind: "controlled_fixture", expected_status: approved ? "APPROVED" : "NEEDS_EVIDENCE", oracle_version: "worldmaker-15-july-closure-m3-v3" }
  };
}

async function sha256(value) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(bytes)].map(value => value.toString(16).padStart(2, "0")).join("");
}

function json(value, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
  });
}
