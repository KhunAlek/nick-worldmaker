(function () {
  "use strict";
  const STORAGE_KEY = "nick_worldmaker_build1_v1";
  const MISSION_IDS = (window.WORLDMAKER_MISSIONS || []).map(m => m.id);

  function createDefaultState() {
    const statuses = {};
    const hints = {};
    MISSION_IDS.forEach(id => { statuses[id] = "NOT_SUBMITTED"; hints[id] = 0; });
    return {
      schemaVersion: 1,
      currentMission: "V1-M01",
      missionStatuses: statuses,
      attempts: [],
      latestMockReview: null,
      approvedMissions: [],
      unlockedMissions: ["V1-M01"],
      hintLevels: hints,
      lastActivity: null
    };
  }

  function normaliseState(value) {
    const base = createDefaultState();
    if (!value || typeof value !== "object") return base;
    const state = Object.assign(base, value);
    state.missionStatuses = Object.assign(base.missionStatuses, value.missionStatuses || {});
    state.hintLevels = Object.assign(base.hintLevels, value.hintLevels || {});
    state.attempts = Array.isArray(value.attempts) ? value.attempts : [];
    state.approvedMissions = Array.isArray(value.approvedMissions) ? value.approvedMissions.filter(id => MISSION_IDS.includes(id)) : [];
    state.unlockedMissions = Array.isArray(value.unlockedMissions) ? value.unlockedMissions.filter(id => MISSION_IDS.includes(id)) : ["V1-M01"];
    if (!state.unlockedMissions.includes("V1-M01")) state.unlockedMissions.unshift("V1-M01");
    if (!MISSION_IDS.includes(state.currentMission)) state.currentMission = "V1-M01";
    return state;
  }

  function getState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return normaliseState(raw ? JSON.parse(raw) : null);
    } catch (error) {
      console.warn("Worldmaker storage was reset because saved data could not be read.", error);
      return createDefaultState();
    }
  }

  function saveState(state) {
    const clean = normaliseState(state);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
    return clean;
  }

  function update(mutator) {
    const state = getState();
    const next = mutator(state) || state;
    next.lastActivity = new Date().toISOString();
    return saveState(next);
  }

  function setHintLevel(missionId, level) {
    return update(state => {
      state.hintLevels[missionId] = Math.max(0, Math.min(5, Number(level) || 0));
      return state;
    });
  }

  function recordAttempt(submission, review, approvalEligible) {
    return update(state => {
      const missionId = review.mission_id;
      const entry = {
        missionId,
        attemptNumber: review.attempt_number,
        submittedAt: new Date().toISOString(),
        status: review.status,
        review,
        evidenceSummary: {
          codeCharacters: submission.code.length,
          hierarchyCharacters: submission.hierarchy.length,
          outputCharacters: submission.output.length,
          checklistConfirmed: Object.values(submission.checklist).filter(Boolean).length,
          understandingAnswered: Boolean(submission.understanding.trim())
        }
      };
      state.attempts.push(entry);
      state.latestMockReview = review;
      state.hintLevels[missionId] = review.hint_level;
      state.missionStatuses[missionId] = review.status;

      if (approvalEligible && review.status === "APPROVED" && missionId === "V1-M01") {
        state.missionStatuses[missionId] = "APPROVED";
        if (!state.approvedMissions.includes(missionId)) state.approvedMissions.push(missionId);
        if (!state.unlockedMissions.includes("V1-M02")) state.unlockedMissions.push("V1-M02");
        state.currentMission = "V1-M02";
      } else {
        state.currentMission = missionId;
      }
      return state;
    });
  }

  function reset() {
    localStorage.removeItem(STORAGE_KEY);
    return saveState(createDefaultState());
  }

  window.WorldmakerStorage = { STORAGE_KEY, createDefaultState, getState, saveState, update, setHintLevel, recordAttempt, reset };
})();
