(function () {
  "use strict";

  const API = "https://nick-worldmaker-api.abystrov66.workers.dev";

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  }

  function setPreparingStatus() {
    const element = document.getElementById("parent-status");
    if (!element) return;
    element.className = "status status-unreleased";
    element.textContent = "Preparing";
  }

  async function correctCurrentMission() {
    const token = sessionStorage.getItem("worldmaker_token_parent");
    if (!token) return;

    const response = await fetch(API + "/api/progress", {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) return;

    const data = await response.json();
    const missions = window.WORLDMAKER_MISSIONS || [];
    const statuses = Object.fromEntries((data.progress || []).map(row => [row.mission_id, row.status]));
    const releaseStates = Object.fromEntries((data.missions || []).map(mission => [mission.id, mission.release_state]));

    let highestApprovedIndex = -1;
    missions.forEach((mission, index) => {
      if (statuses[mission.id] === "APPROVED") highestApprovedIndex = Math.max(highestApprovedIndex, index);
    });

    const current = missions[Math.min(highestApprovedIndex + 1, missions.length - 1)] || missions[0];
    if (!current) return;

    const unreleased = releaseStates[current.id] !== "released";
    setText("parent-current", `${current.id} — ${current.title}${unreleased ? " (unlocked, not released)" : ""}`);

    if (unreleased) {
      setPreparingStatus();
      setText("parent-problem", "No learner problem: the next mission is unlocked, but its production lesson is not released yet.");
      setText("parent-next-action", `Release ${current.id} after its complete lesson, evaluator, and live release tests pass.`);
    }
  }

  window.addEventListener("load", () => {
    correctCurrentMission().catch(error => console.error("Parent current-mission correction failed", error));
  });
})();
