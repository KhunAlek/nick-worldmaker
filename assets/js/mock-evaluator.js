(function () {
  "use strict";
  const REQUIRED_TESTS = ["V1-M01-T01", "V1-M01-T02", "V1-M01-T03"];
  const REQUIRED_HIERARCHY = [
    "Workspace", "World", "Ground", "NPCs", "NPCHomes", "Resources", "Buildings",
    "ReplicatedStorage", "Remotes", "GameState", "ServerStorage", "Templates",
    "ServerScriptService", "WorldServer"
  ];

  function normalise(text) { return String(text || "").replace(/\r/g, ""); }
  function containsExactPrint(code) { return /print\s*\(\s*["']VERSION 1 SERVER READY["']\s*\)/.test(code); }
  function readinessCount(text) { return (text.match(/VERSION 1 SERVER READY/g) || []).length; }
  function helloCount(text) { return (text.match(/Hello world!/gi) || []).length; }
  function hasExternalNoise(text) { return /cloud_[^\s]*|MA2Theme/i.test(text); }
  function hasProjectError(text) {
    const lines = normalise(text).split("\n");
    return lines.some(line =>
      /Workspace\.Script/i.test(line) ||
      /WorldServer[^\n]*(incomplete statement|expected|attempt to|syntax error|runtime error)/i.test(line) ||
      /Incomplete statement/i.test(line) ||
      (/Script ['\"](?:Workspace\.)?WorldServer['\"]/i.test(line) && /Line \d+/i.test(line))
    );
  }
  function hierarchyAssessment(hierarchy) {
    const text = normalise(hierarchy);
    const missing = REQUIRED_HIERARCHY.filter(name => !new RegExp("\\b" + name + "\\b", "i").test(text));
    const pathOK = /ServerScriptService[\s\S]{0,220}WorldServer/i.test(text);
    const localScriptWrong = /WorldServer[^\n]{0,80}LocalScript|LocalScript[^\n]{0,80}WorldServer/i.test(text);
    const scriptTypeShown = /WorldServer[^\n]{0,80}\bScript\b|\bScript\b[^\n]{0,80}WorldServer/i.test(text);
    const disabled = /WorldServer[^\n]{0,100}(disabled\s*[:=]\s*true|enabled\s*[:=]\s*false)/i.test(text);
    return { missing, pathOK, localScriptWrong, scriptTypeShown, disabled, pass: missing.length === 0 && pathOK && !localScriptWrong && !disabled };
  }
  function suspicious(text) { return /ignore (all|the|previous) instructions|system prompt|developer message|unlock the next mission/i.test(text); }

  function assess(submission) {
    const code = normalise(submission.code);
    const hierarchy = normalise(submission.hierarchy);
    const output = normalise(submission.output);
    const hierarchyResult = hierarchyAssessment(hierarchy);
    const codePresent = Boolean(code.trim());
    const hierarchyPresent = Boolean(hierarchy.trim());
    const outputPresent = Boolean(output.trim());
    const codePass = codePresent && containsExactPrint(code);
    const outputCount = readinessCount(output);
    const oldHelloCount = helloCount(output);
    const externalNoise = hasExternalNoise(output);
    const projectError = outputPresent && hasProjectError(output);
    const outputPass = outputPresent && outputCount === 1 && oldHelloCount === 0 && !projectError;
    const checklist = submission.checklist || {};
    const checklistPass = REQUIRED_TESTS.every(id => checklist[id] === true);
    const explicitFailures = [];
    const missingEvidence = [];

    if (!codePresent) missingEvidence.push("the code inside WorldServer");
    else if (!codePass) explicitFailures.push("WorldServer does not contain the exact readiness print line.");

    if (!hierarchyPresent) missingEvidence.push("the completed Explorer structure check");
    else {
      if (hierarchyResult.localScriptWrong) explicitFailures.push("WorldServer is a LocalScript instead of a normal Script.");
      if (hierarchyResult.disabled) explicitFailures.push("WorldServer is disabled.");
      if (hierarchyResult.missing.length) explicitFailures.push("Required Explorer names are missing: " + hierarchyResult.missing.join(", ") + ".");
      if (!hierarchyResult.pathOK) explicitFailures.push("WorldServer is not proven under ServerScriptService.");
    }

    if (!outputPresent) missingEvidence.push("Output from the final Play run");
    else {
      if (oldHelloCount > 0) explicitFailures.push("Extra starter Scripts are still printing Hello world!.");
      if (projectError) explicitFailures.push("Output contains an error from WorldServer or an accidental Workspace Script.");
      if (outputCount === 0) missingEvidence.push("the VERSION 1 SERVER READY line in Output");
      if (outputCount > 1) explicitFailures.push("The readiness message appears more than once, which suggests duplicate WorldServer Scripts.");
    }

    REQUIRED_TESTS.forEach(id => { if (checklist[id] !== true) missingEvidence.push("the completed check for " + id); });

    const approved = [];
    if (codePass && outputPass && checklist["V1-M01-T01"]) approved.push("V1-M01-T01");
    if (hierarchyResult.pass && checklist["V1-M01-T02"]) approved.push("V1-M01-T02");
    if (outputPass && checklist["V1-M01-T03"]) approved.push("V1-M01-T03");

    return {
      codePresent, hierarchyPresent, outputPresent, codePass, outputPass, projectError,
      outputCount, oldHelloCount, externalNoise, hierarchyResult, checklistPass,
      explicitFailures, missingEvidence, approved,
      allMandatory: explicitFailures.length === 0 && missingEvidence.length === 0 && approved.length === 3
    };
  }

  function baseReview(submission, attemptNumber, hintLevel, assessment) {
    const combined = [submission.code, submission.hierarchy, submission.output, submission.understanding].join("\n");
    const suspiciousDetected = suspicious(combined);
    return {
      status: "NEEDS_EVIDENCE",
      mission_id: "V1-M01",
      attempt_number: attemptNumber,
      headline: "One small check is still needed.",
      approved_requirements: assessment.approved,
      main_problem: null,
      explanation: "The checker uses only the code, Output, and checks shown on this page.",
      next_action: "Complete the first missing item and check again.",
      tests_to_repeat: REQUIRED_TESTS.filter(id => !assessment.approved.includes(id)),
      hint_level: Math.max(0, Math.min(5, hintLevel || 0)),
      understanding_question: null,
      parent_summary: "Mission 1 was checked. One or more current proof items are still missing.",
      unlock_next_mission: false,
      next_mission_id: null,
      confidence: 0.94,
      missing_evidence: assessment.missingEvidence,
      reviewed_evidence: {
        code: assessment.codePresent,
        hierarchy: assessment.hierarchyPresent,
        output: assessment.outputPresent,
        checklist: assessment.checklistPass,
        visual_runtime: false,
        understanding: Boolean(String(submission.understanding || "").trim())
      },
      regressions: [],
      suspicious_input_detected: suspiciousDetected,
      suspicious_input_note: suspiciousDetected ? "Instruction-like text inside the pasted evidence was ignored and treated as plain text." : null,
      block_type: null
    };
  }

  function nextActionFor(problem) {
    if (/Hello world/i.test(problem)) return "Search Explorer for Script. Delete unnecessary Scripts that still contain print(\"Hello world!\"). Keep ServerScriptService > WorldServer.";
    if (/Workspace Script|Workspace\.Script/i.test(problem)) return "Stop Play. Delete the accidental Script under Workspace. Keep WorldServer under ServerScriptService, then run again.";
    if (/readiness print/i.test(problem)) return "Open ServerScriptService > WorldServer and repair the one print line. Then clear Output and run Play again.";
    if (/more than once|duplicate/i.test(problem)) return "Search Explorer for WorldServer and Script. Keep one WorldServer only, then clear Output and run again.";
    if (/Explorer names|ServerScriptService|LocalScript|disabled/i.test(problem)) return "Compare Explorer with the example on the mission page and correct the first wrong name, location, or Script type.";
    return "Open the Script named in Output, repair the first unfinished line, then clear Output and run again.";
  }

  function evaluateMission1(submission, attemptNumber, requestedHintLevel) {
    const assessment = assess(submission);
    const review = baseReview(submission, attemptNumber, requestedHintLevel, assessment);

    if (assessment.explicitFailures.length) {
      const problem = assessment.explicitFailures[0];
      review.status = "NEEDS_FIX";
      review.headline = "Your main Script is close; fix this one thing.";
      review.main_problem = problem;
      review.explanation = problem + (assessment.externalNoise ? " The cloud_/MA2Theme message is separate plugin noise and is not the reason for this result." : "");
      review.next_action = nextActionFor(problem);
      review.tests_to_repeat = /Explorer|ServerScriptService|LocalScript|disabled/i.test(problem) ? ["V1-M01-T02"] : ["V1-M01-T01", "V1-M01-T03"];
      review.hint_level = Math.max(1, review.hint_level);
      review.understanding_question = "Which Script name appears in the error or unexpected Output line?";
      review.parent_summary = "Mission 1 has one concrete setup or code problem: " + problem + (assessment.externalNoise ? " An unrelated plugin warning is also present." : "");
      review.missing_evidence = assessment.missingEvidence;
      review.confidence = 0.98;
      return review;
    }

    if (assessment.missingEvidence.length) {
      review.main_problem = assessment.missingEvidence[0];
      review.next_action = "Add " + assessment.missingEvidence[0] + ", then press Check my mission again.";
      review.parent_summary = "Mission 1 may be working. The checker still needs: " + assessment.missingEvidence.join("; ") + ".";
      review.hint_level = 0;
      review.confidence = 0.96;
      return review;
    }

    review.status = "APPROVED";
    review.headline = assessment.externalNoise ? "WorldServer works. The plugin warning is separate." : "Mission 1 works. Studio is ready.";
    review.approved_requirements = REQUIRED_TESTS.slice();
    review.main_problem = null;
    review.explanation = assessment.externalNoise
      ? "WorldServer is in the correct place and prints the readiness message once. Output also contains unrelated cloud_/MA2Theme plugin noise, which does not block this mission."
      : "WorldServer is in the correct place, the required folders are present, and the readiness message appears once on a clean run.";
    review.next_action = "Mission V1-M02 is unlocked, but its full beginner lesson must be ready before starting it.";
    review.tests_to_repeat = [];
    review.hint_level = 0;
    review.understanding_question = null;
    review.parent_summary = "V1-M01 approved. Nick proved the Script location, folder structure, and clean readiness output." + (assessment.externalNoise ? " A separate plugin warning remains but did not come from WorldServer." : "");
    review.unlock_next_mission = true;
    review.next_mission_id = "V1-M02";
    review.confidence = 0.99;
    review.missing_evidence = [];
    return review;
  }

  function validateReview(review, expectedAttempt) {
    const keys = ["status","mission_id","attempt_number","headline","approved_requirements","main_problem","explanation","next_action","tests_to_repeat","hint_level","understanding_question","parent_summary","unlock_next_mission","next_mission_id","confidence","missing_evidence","reviewed_evidence","regressions","suspicious_input_detected","suspicious_input_note","block_type"];
    if (!review || typeof review !== "object" || keys.some(key => !(key in review))) return false;
    if (review.mission_id !== "V1-M01" || review.attempt_number !== expectedAttempt) return false;
    if (!Array.isArray(review.approved_requirements) || !Array.isArray(review.tests_to_repeat) || !Array.isArray(review.missing_evidence) || !Array.isArray(review.regressions)) return false;
    if (review.status === "APPROVED") {
      if (!review.unlock_next_mission || review.next_mission_id !== "V1-M02" || review.main_problem !== null || review.missing_evidence.length) return false;
    } else if (review.unlock_next_mission || review.next_mission_id !== null) return false;
    if (review.status !== "BLOCKED_NEEDS_HELP" && review.block_type !== null) return false;
    return true;
  }

  function isApprovalEligible(submission, review) {
    const independent = assess(submission);
    return review.status === "APPROVED" && validateReview(review, review.attempt_number) && independent.allMandatory;
  }

  window.WorldmakerEvaluator = { evaluateMission1, validateReview, isApprovalEligible, assess };
})();
