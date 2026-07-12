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
  function hasApparentRuntimeError(output) {
    const lines = normalise(output).split("\n").map(line => line.trim()).filter(Boolean);
    return lines.some(line =>
      /^(error|runtime error|syntax error)\b/i.test(line) ||
      /stack begin|stack end/i.test(line) ||
      /attempt to (index|call|perform|concatenate|compare)/i.test(line) ||
      /script ['\"].+['\"], line \d+/i.test(line) ||
      /expected .+ got/i.test(line)
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
    const outputHasError = outputPresent && hasApparentRuntimeError(output);
    const outputPass = outputPresent && outputCount === 1 && !outputHasError;
    const checklist = submission.checklist || {};
    const checklistPass = REQUIRED_TESTS.every(id => checklist[id] === true);
    const explicitFailures = [];
    const missingEvidence = [];

    if (!codePresent) missingEvidence.push("Full WorldServer code");
    else if (!codePass) explicitFailures.push("WorldServer does not contain the exact readiness print statement.");

    if (!hierarchyPresent) missingEvidence.push("Mission 1 hierarchy text");
    else {
      if (hierarchyResult.localScriptWrong) explicitFailures.push("WorldServer is shown as a LocalScript instead of a normal Script.");
      if (hierarchyResult.disabled) explicitFailures.push("WorldServer is shown as disabled.");
      if (hierarchyResult.missing.length) explicitFailures.push("Required hierarchy names are missing: " + hierarchyResult.missing.join(", ") + ".");
      if (!hierarchyResult.pathOK) explicitFailures.push("The hierarchy does not prove ServerScriptService/WorldServer.");
      if (!hierarchyResult.scriptTypeShown && hierarchyResult.pathOK) missingEvidence.push("WorldServer object type (normal Script)");
    }

    if (!outputPresent) missingEvidence.push("Output from one clean Play test");
    else {
      if (outputHasError) explicitFailures.push("The submitted Output contains an apparent unresolved runtime error.");
      else if (outputCount === 0) missingEvidence.push("Output line VERSION 1 SERVER READY");
      else if (outputCount > 1) explicitFailures.push("The submitted clean-run Output contains the readiness message more than once.");
    }

    REQUIRED_TESTS.forEach(id => { if (checklist[id] !== true) missingEvidence.push("Confirmed checklist item " + id); });

    const approved = [];
    if (codePass && outputPass && checklist["V1-M01-T01"]) approved.push("V1-M01-T01");
    if (hierarchyResult.pass && hierarchyResult.scriptTypeShown && checklist["V1-M01-T02"]) approved.push("V1-M01-T02");
    if (outputPass && checklist["V1-M01-T03"]) approved.push("V1-M01-T03");

    return {
      codePresent, hierarchyPresent, outputPresent, codePass, outputPass, outputHasError,
      outputCount, hierarchyResult, checklistPass, explicitFailures, missingEvidence,
      approved, allMandatory: explicitFailures.length === 0 && missingEvidence.length === 0 && approved.length === 3
    };
  }

  function baseReview(submission, attemptNumber, hintLevel, assessment) {
    const combined = [submission.code, submission.hierarchy, submission.output, submission.understanding].join("\n");
    const suspiciousDetected = suspicious(combined);
    return {
      status: "NEEDS_EVIDENCE",
      mission_id: "V1-M01",
      attempt_number: attemptNumber,
      headline: "More current evidence is needed before Mission 1 can unlock.",
      approved_requirements: assessment.approved,
      main_problem: null,
      explanation: "The local checker only approves what the submitted code, hierarchy, Output, and checklist prove together.",
      next_action: "Add the smallest missing proof and submit again.",
      tests_to_repeat: REQUIRED_TESTS.filter(id => !assessment.approved.includes(id)),
      hint_level: Math.max(0, Math.min(5, hintLevel || 0)),
      understanding_question: null,
      parent_summary: "Mission 1 has been reviewed locally. More evidence is needed before the prototype unlocks Mission 2.",
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
      suspicious_input_note: suspiciousDetected ? "Instruction-like text was detected inside submitted evidence. Build 1 displays it as untrusted text and does not follow it." : null,
      block_type: null
    };
  }

  function evaluateMission1(submission, attemptNumber, requestedHintLevel) {
    const assessment = assess(submission);
    const review = baseReview(submission, attemptNumber, requestedHintLevel, assessment);

    if (assessment.explicitFailures.length) {
      const problem = assessment.explicitFailures[0];
      review.status = "NEEDS_FIX";
      review.headline = "One proven Mission 1 problem needs a fix.";
      review.main_problem = problem;
      review.explanation = problem + " Fix the first proven blocker, then rerun the affected test from a clean Play session.";
      review.next_action = problem.includes("print")
        ? "Open ServerScriptService > WorldServer, use the exact print line, clear Output, and run Play again."
        : problem.includes("hierarchy") || problem.includes("ServerScriptService") || problem.includes("LocalScript")
          ? "Correct the object name, location, or script type in Explorer, then repeat the hierarchy and Play checks."
          : "Clear the runtime error shown in Output, clear Output, and repeat the Play test.";
      review.tests_to_repeat = assessment.outputHasError || problem.includes("print") ? ["V1-M01-T01", "V1-M01-T03"] : ["V1-M01-T02"];
      review.hint_level = Math.max(1, review.hint_level);
      review.understanding_question = "What is the first place you will look when a script seems to do nothing?";
      review.parent_summary = "Mission 1 has one proven technical blocker: " + problem;
      review.missing_evidence = assessment.missingEvidence;
      review.confidence = 0.98;
      return review;
    }

    if (assessment.missingEvidence.length) {
      review.main_problem = assessment.missingEvidence[0];
      review.next_action = "Provide " + assessment.missingEvidence[0] + ", then submit the same current version again.";
      review.tests_to_repeat = REQUIRED_TESTS.filter(id => !assessment.approved.includes(id));
      review.parent_summary = "Mission 1 may be working, but the local prototype is missing: " + assessment.missingEvidence.join("; ") + ".";
      review.hint_level = 0;
      review.confidence = 0.96;
      return review;
    }

    review.status = "APPROVED";
    review.headline = "Mission 1 is proven. Studio is ready.";
    review.approved_requirements = REQUIRED_TESTS.slice();
    review.main_problem = null;
    review.explanation = "WorldServer is in ServerScriptService, the required folder skeleton is present, the exact readiness message appears once, and the submitted Output is clean.";
    review.next_action = "Mission V1-M02 is unlocked: build the island and settlement area.";
    review.tests_to_repeat = [];
    review.hint_level = 0;
    review.understanding_question = null;
    review.parent_summary = "V1-M01 approved. Nick proved the required Studio structure, server script, clean Output, and restart checklist.";
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
