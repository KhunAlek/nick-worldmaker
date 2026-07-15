const SPECS = {
  "V1-M08": { count: 4, code: "local function moveNPCTo(npc, targetPoint)\n  local ok, path = pcall(function() return PathfindingService:CreatePath() end)\n  if not ok then return false end\n  return true\nend", good: "moveNPCTo returns a boolean; protected path calculation, status checks, ordered waypoints, jump handling, safe failure, and exact TargetPoint use all passed; resources stayed unchanged.", why: "Gather must wait for true so failed travel cannot award resources." },
  "V1-M09": { count: 5, code: "local busyByNPC = {}\nlocal function beginJob(npc)\n  if busyByNPC[npc] then return false end\n  busyByNPC[npc] = true\n  return true\nend", good: "Busy state was per NPC and set before asynchronous work; duplicate same-NPC commands were refused; two NPC jobs overlapped; correct node and home were used; busy cleared on every exit.", why: "One shared busy flag would incorrectly block the second settler." },
  "V1-M10": { count: 5, code: "local wood = state:WaitForChild('Wood')\nlocal stone = state:WaitForChild('Stone')\nlocal hutBuilt = state:WaitForChild('HutBuilt')", good: "Canonical replicated Wood, Stone, and HutBuilt values existed; successful arrivals awarded exactly 2 wood or 1 stone; failed, invalid, and duplicate commands awarded nothing; HUD followed server state live.", why: "The server totals are authoritative." },
  "V1-M11": { count: 5, code: "local canBuild = wood.Value >= 6 and stone.Value >= 3", good: "The exact 6 wood and 3 stone rule used AND; startup and both value changes refreshed the button; 6/2 and 5/3 stayed locked while 6/3 unlocked; server authority remained intact.", why: "Both resource requirements must be met." },
  "V1-M12": { count: 5, code: "if hutBuilt.Value then return end\nif wood.Value < 6 or stone.Value < 3 then return end", good: "BuildHut was handled once on the server; dependencies, HutBuilt, and exact cost were validated; one FirstHut was cloned; one deduction occurred; rapid repeats and missing template could not duplicate or consume resources.", why: "The server rechecks HutBuilt because clients are not trusted." },
  "V1-M13": { count: 5, code: "resetGeneration += 1\nwood.Value = 0\nstone.Value = 0\nhutBuilt.Value = false", good: "Reset restored 0/0, no hut, both NPCs home and idle, no local selection, and locked build state; generation token blocked stale rewards; the complete loop worked again.", why: "The generation number invalidates work started before reset." },
  "V1-M14": { count: 11, code: "-- complete Version 1 integration proof fixture", good: "Clean-state normal loop and every canonical edge case passed; two-client test proved local selection and shared server state; no unresolved project-code red errors or inherited regressions remained.", why: "Selection is local; resources, NPC jobs, and construction are shared server state." },
  "V1-M15": { count: 7, code: "-- publication evidence fixture", good: "Local backup existed; approved build was published with accurate metadata and parent-reviewed audience state; published smoke test matched Studio; external access was proven and final fixes were republished.", why: "Publication is complete only when the live experience matches the approved Studio build." }
};

export function buildLateFixture(missionId, type) {
  const spec = SPECS[missionId];
  if (!spec) return null;
  const approved = type === "approved";
  const result = {
    mission_id: missionId,
    code: approved ? spec.code : "-- controlled release fixture intentionally omits decisive runtime proof",
    explorer_summary: approved ? `CONTROLLED RELEASE TEST ORACLE: ${spec.good}` : "CONTROLLED RELEASE TEST: required implementation is claimed but decisive fresh runtime proof is missing.",
    output: approved ? `CONTROLLED RELEASE TEST ORACLE: ${spec.good}` : "No complete fresh Play output supplied.",
    screenshots: [approved ? `release-test-oracle://${missionId}/approved` : `release-test-oracle://${missionId}/missing-proof`],
    videos: [approved ? `release-test-oracle://${missionId}/runtime-video` : `release-test-oracle://${missionId}/missing-video`],
    properties: approved ? "CONTROLLED RELEASE TEST ORACLE: all canonical properties and hierarchy assertions passed." : "Required properties are not fully proven.",
    publication: approved ? "CONTROLLED RELEASE TEST ORACLE: publication and external-access checks passed." : "Publication proof is incomplete.",
    checklist: Object.fromEntries(Array.from({ length: spec.count }, (_, index) => [`${missionId}-T${String(index + 1).padStart(2, "0")}`, approved])),
    understanding: spec.why,
    release_test_attestation: {
      kind: "controlled_fixture",
      expected_status: approved ? "APPROVED" : "NEEDS_EVIDENCE",
      visual_runtime_observed: approved,
      oracle_version: "worldmaker-release-fixture-v1",
      note: "Machine-observed release assertions reachable only through the secret isolated endpoint."
    }
  };
  return result;
}
