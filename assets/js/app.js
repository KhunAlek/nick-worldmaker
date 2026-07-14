(function () {
  "use strict";

  const API = "https://nick-worldmaker-api.abystrov66.workers.dev";
  const missions = window.WORLDMAKER_MISSIONS || [];
  const byId = id => missions.find(mission => mission.id === id);
  const text = value => String(value == null ? "" : value);
  const page = document.body.dataset.page;
  const role = page === "parent" ? "parent" : "learner";

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = text(value);
  }

  function statusLabel(status, accessState = "released") {
    if (accessState === "locked") return "Locked";
    if (accessState === "unreleased") return "Preparing";
    return ({
      NOT_SUBMITTED: "Ready",
      UNDER_REVIEW: "Under Review",
      NEEDS_FIX: "Needs Fix",
      NEEDS_EVIDENCE: "Needs Evidence",
      BLOCKED_NEEDS_HELP: "Needs Help",
      APPROVED: "Approved"
    })[status] || status;
  }

  function statusClass(status, accessState = "released") {
    if (accessState !== "released") return accessState;
    return String(status || "NOT_SUBMITTED").toLowerCase().replaceAll("_", "-");
  }

  function setStatus(element, status, accessState = "released") {
    if (!element) return;
    element.className = "status status-" + statusClass(status, accessState);
    element.textContent = statusLabel(status, accessState);
  }

  function missionURL(id) { return "mission.html?id=" + encodeURIComponent(id); }
  function tokenKey() { return "worldmaker_token_" + role; }
  function getToken() { return sessionStorage.getItem(tokenKey()); }
  function setToken(token) { sessionStorage.setItem(tokenKey(), token); }
  function clearToken() { sessionStorage.removeItem(tokenKey()); }

  async function api(path, options = {}) {
    const headers = { ...(options.headers || {}) };
    if (getToken()) headers.Authorization = `Bearer ${getToken()}`;
    const response = await fetch(API + path, { ...options, headers });
    const bodyText = await response.text();
    let data;
    try { data = bodyText ? JSON.parse(bodyText) : null; }
    catch { data = { error: bodyText || "Invalid server response" }; }
    if (response.status === 401) {
      clearToken();
      throw new Error("LOGIN_REQUIRED");
    }
    if (!response.ok) throw new Error(data?.detail || data?.error || `Request failed (${response.status})`);
    return data;
  }

  function showLogin() {
    document.querySelectorAll("main, footer").forEach(element => { element.hidden = true; });
    const wrap = document.createElement("div");
    wrap.id = "shared-login";
    wrap.className = "site-shell";
    wrap.style.maxWidth = "620px";
    wrap.style.paddingTop = "80px";
    wrap.innerHTML = `<section class="card card-pad"><div class="eyebrow">Shared progress</div><h1>${role === "parent" ? "Parent login" : "Nick's login"}</h1><p class="lead">Enter the private ${role} code. The secure backend checks it; the website files never contain the code.</p><form id="shared-login-form" class="form-grid"><div class="field"><label for="shared-code">Private code</label><input id="shared-code" type="password" minlength="6" autocomplete="current-password" required></div><p id="shared-login-error" class="muted" aria-live="polite"></p><button class="button button-primary" type="submit">Open ${role === "parent" ? "Parent View" : "Build HQ"}</button></form></section>`;
    document.body.appendChild(wrap);
    document.getElementById("shared-login-form").addEventListener("submit", async event => {
      event.preventDefault();
      const button = event.currentTarget.querySelector("button");
      const error = document.getElementById("shared-login-error");
      button.disabled = true;
      error.textContent = "Checking code…";
      try {
        const result = await api("/api/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role, code: document.getElementById("shared-code").value })
        });
        setToken(result.token);
        location.reload();
      } catch (problem) {
        error.textContent = problem.message === "Invalid access code" ? "That code is not correct." : problem.message;
        button.disabled = false;
      }
    });
  }

  function stateFromProgress(data) {
    const statuses = {};
    (data.progress || []).forEach(row => { statuses[row.mission_id] = row.status; });

    const releaseStates = { "V1-M01": "released" };
    (data.missions || []).forEach(mission => { releaseStates[mission.id] = mission.release_state; });

    const unlocked = missions
      .filter((mission, index) => index === 0 || Boolean(statuses[mission.id]) || statuses[missions[index - 1]?.id] === "APPROVED")
      .map(mission => mission.id);
    const released = missions.filter(mission => releaseStates[mission.id] === "released").map(mission => mission.id);
    const available = unlocked.filter(id => released.includes(id));
    const approved = Object.keys(statuses).filter(id => statuses[id] === "APPROVED");
    const nextUnlocked = missions.find(mission => unlocked.includes(mission.id) && statuses[mission.id] !== "APPROVED");
    const current = nextUnlocked || byId(approved.at(-1)) || missions[0];
    const attempts = (data.attempts || []).map(item => ({
      missionId: item.mission_id,
      attemptNumber: item.attempt_number,
      submittedAt: item.created_at,
      review: item.review,
      status: item.review?.status || statuses[item.mission_id]
    }));

    return { statuses, releaseStates, unlocked, released, available, approved, current, attempts };
  }

  function accessState(state, id) {
    if (!state.unlocked.includes(id)) return "locked";
    if (!state.released.includes(id)) return "unreleased";
    return "released";
  }

  function latestReview(state) {
    return state.attempts.find(item => item.review)?.review || null;
  }

  function renderMissionMap(container, state, compact = false) {
    if (!container) return;
    container.textContent = "";
    missions.forEach(mission => {
      const access = accessState(state, mission.id);
      const approved = state.approved.includes(mission.id);
      const node = document.createElement(access === "released" ? "a" : "div");
      node.className = "mission-node" + (access !== "released" ? " locked" : "") + (approved ? " approved" : "");
      if (access === "released") node.href = missionURL(mission.id);
      const number = document.createElement("div");
      number.className = "mission-number";
      number.textContent = mission.id;
      const title = document.createElement("h3");
      title.textContent = mission.title;
      const description = document.createElement("p");
      description.textContent = compact ? mission.summary.split(".")[0] + "." : mission.summary;
      const badge = document.createElement("span");
      setStatus(badge, state.statuses[mission.id] || "NOT_SUBMITTED", access);
      node.append(number, title, description, badge);
      container.appendChild(node);
    });
  }

  function renderHQ(state) {
    const current = state.current;
    const access = accessState(state, current.id);
    setText("current-mission-id", current.id);
    setText("current-mission-title", current.title);
    setText("current-mission-summary", current.summary);
    setStatus(document.getElementById("current-status"), state.statuses[current.id] || "NOT_SUBMITTED", access);
    const latest = latestReview(state);
    setText("next-action", access === "unreleased"
      ? "This mission is unlocked in progress, but its complete lesson and reviewer are still being prepared."
      : latest?.next_action || "Open the current mission when you are ready.");
    setText("latest-achievement", state.approved.length
      ? (byId(state.approved.at(-1))?.title || state.approved.at(-1)) + " approved"
      : "Shared Build HQ online");
    const button = document.getElementById("continue-mission");
    if (button) {
      if (access === "released") {
        button.hidden = false;
        button.href = missionURL(current.id);
        button.textContent = `Open ${current.id} →`;
      } else {
        button.hidden = true;
        button.removeAttribute("href");
      }
    }
    renderMissionMap(document.getElementById("mission-map"), state, true);
  }

  function renderProgress(state) {
    const list = document.getElementById("progress-list");
    if (!list) return;
    list.textContent = "";
    missions.forEach(mission => {
      const access = accessState(state, mission.id);
      const row = document.createElement("div");
      row.className = "progress-row";
      const id = document.createElement("strong");
      id.textContent = mission.id;
      const titleWrap = document.createElement("div");
      const title = document.createElement(access === "released" ? "a" : "strong");
      title.textContent = mission.title;
      if (access === "released") title.href = missionURL(mission.id);
      const summary = document.createElement("div");
      summary.className = "muted";
      summary.textContent = mission.summary;
      titleWrap.append(title, summary);
      const difficulty = document.createElement("span");
      difficulty.textContent = mission.difficulty;
      const status = document.createElement("span");
      setStatus(status, state.statuses[mission.id] || "NOT_SUBMITTED", access);
      row.append(id, titleWrap, difficulty, status);
      list.appendChild(row);
    });
  }

  function renderParent(state) {
    const current = state.current;
    const latest = state.attempts[0];
    const review = latest?.review;
    const access = accessState(state, current.id);
    setText("parent-current", `${current.id} — ${current.title}${access === "unreleased" ? " (unlocked, not released)" : ""}`);
    setText("parent-latest-attempt", latest ? `Attempt ${latest.attemptNumber} · ${new Date(latest.submittedAt).toLocaleString()}` : "No submission yet");
    setStatus(document.getElementById("parent-status"), review?.status || state.statuses[current.id] || "NOT_SUBMITTED", access);
    setText("parent-problem", access === "unreleased" ? "No learner problem: the production lesson is not released yet." : review?.main_problem || review?.next_action || "No current problem recorded.");
    setText("parent-next-action", access === "unreleased" ? "Wait for the complete lesson, evaluator, and release tests." : review?.next_action || "Nick can open the current mission when ready.");
    setText("parent-last-activity", latest ? new Date(latest.submittedAt).toLocaleString() : "No activity yet");
    const approved = document.getElementById("parent-approved");
    if (approved) {
      approved.textContent = "";
      state.approved.forEach(id => {
        const badge = document.createElement("span");
        badge.className = "status status-approved";
        badge.textContent = `${id} — ${byId(id)?.title || "Approved"}`;
        approved.appendChild(badge);
      });
      if (!state.approved.length) approved.textContent = "None yet";
    }
    const attempts = document.getElementById("parent-attempts");
    if (attempts) {
      attempts.textContent = "";
      state.attempts.slice(0, 8).forEach(item => {
        const card = document.createElement("div");
        card.className = "attempt";
        const head = document.createElement("div");
        head.className = "attempt-head";
        const title = document.createElement("strong");
        title.textContent = `${item.missionId} · Attempt ${item.attemptNumber}`;
        const badge = document.createElement("span");
        setStatus(badge, item.status, "released");
        const summary = document.createElement("p");
        summary.className = "muted";
        summary.textContent = item.review?.parent_summary || "Stored submission";
        head.append(title, badge);
        card.append(head, summary);
        attempts.appendChild(card);
      });
    }
    const signOut = document.getElementById("reset-progress");
    if (signOut) {
      signOut.textContent = "Sign out";
      signOut.onclick = () => { clearToken(); location.reload(); };
    }
  }

  function renderFeedback(review) {
    const feedback = document.getElementById("feedback-card");
    if (!feedback) return;
    feedback.hidden = false;
    feedback.className = "feedback " + review.status.toLowerCase().replaceAll("_", "-");
    setStatus(document.getElementById("feedback-status"), review.status, "released");
    setText("feedback-headline", review.headline);
    const worked = document.getElementById("feedback-worked");
    worked.textContent = "";
    (review.approved_requirements.length ? review.approved_requirements : ["No mandatory requirement is fully proven yet."]).forEach(value => {
      const item = document.createElement("li");
      item.textContent = value;
      worked.appendChild(item);
    });
    setText("feedback-problem", review.main_problem || "No blocker remains.");
    setText("feedback-explanation", review.explanation);
    setText("feedback-next", review.next_action);
    const tests = document.getElementById("feedback-tests");
    tests.textContent = "";
    (review.tests_to_repeat.length ? review.tests_to_repeat : ["None"]).forEach(value => {
      const item = document.createElement("li");
      item.textContent = value;
      tests.appendChild(item);
    });
    setText("feedback-hint", "Level " + review.hint_level);
    setText("feedback-unlock", review.unlock_next_mission ? review.next_mission_id + " unlocked" : "Next mission remains locked");
    feedback.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderMission1(state) {
    const mission = byId("V1-M01");
    setText("mission-id", mission.id);
    setText("mission-title", mission.title);
    setText("mission-objective", mission.objective);
    setText("visible-result", mission.visibleResult);
    setText("why-it-matters", mission.whyItMatters);
    setText("starting-state", mission.startingState);
    setText("hierarchy-block", mission.requiredHierarchy);
    setText("understanding-question", mission.understandingQuestion);
    setStatus(document.getElementById("mission-status"), state.statuses[mission.id] || "NOT_SUBMITTED", "released");
    const form = document.getElementById("submission-form");
    if (form && state.statuses[mission.id] === "APPROVED") {
      form.innerHTML = '<div class="callout"><strong>Mission 1 is approved.</strong> Its result is stored in shared progress.</div><div class="form-actions"><a class="button button-primary" href="mission.html?id=V1-M02">Open Mission 2 →</a></div>';
    }
  }

  function renderMission2(state) {
    const full = document.getElementById("mission-one-content");
    if (full) full.hidden = true;
    const panel = document.getElementById("later-mission-panel");
    panel.hidden = false;
    panel.className = "card content-card";
    const mission = byId("V1-M02");
    setText("later-id", mission.id);
    setText("later-title", mission.title);
    setText("later-summary", mission.summary);
    setText("later-difficulty", mission.difficulty);
    setStatus(document.getElementById("later-status"), state.statuses[mission.id] || "NOT_SUBMITTED", "released");
    panel.querySelector(".lock-icon").textContent = "🏝️";
    setText("later-message", state.statuses[mission.id] === "APPROVED" ? "Mission 2 is approved and stored in shared progress." : "Build safe ground, a spawn, a BuildSite, and open walking routes. Then submit current evidence below.");
    const action = document.getElementById("later-action");
    if (action) action.remove();
    if (state.statuses[mission.id] === "APPROVED") return;

    const form = document.createElement("form");
    form.id = "mission2-form";
    form.className = "form-grid";
    form.innerHTML = `<div class="field"><label>1. Explorer summary</label><textarea id="m2-explorer" required minlength="20" placeholder="Describe the exact World/Ground/PlayerSpawn/BuildSite structure and whether imported models contain scripts."></textarea></div><div class="field"><label>2. Current Studio Output</label><textarea id="m2-output" required placeholder="Paste current Output text."></textarea></div><div class="field"><label>3. Current Play-mode screenshot</label><input id="m2-image" type="file" accept="image/png,image/jpeg,image/webp" required><p class="field-help">Use one clear screenshot under about 120 KB.</p></div><fieldset><legend>4. Confirm the tests you actually ran</legend><label class="check-row"><input id="m2-t01" type="checkbox"> <span>V1-M02-T01 — I spawned safely on the playable ground.</span></label><label class="check-row"><input id="m2-t02" type="checkbox"> <span>V1-M02-T02 — The island stayed still during Play.</span></label><label class="check-row"><input id="m2-t03" type="checkbox"> <span>V1-M02-T03 — Walking routes to both future resource areas stay open.</span></label></fieldset><div class="field"><label>5. Quick understanding</label><input id="m2-understanding" required maxlength="500" placeholder="What does PlayerSpawn control?"></div><p id="m2-error" class="muted" aria-live="polite"></p><button class="button button-primary" type="submit">Send Mission 2 for review</button>`;
    panel.appendChild(form);
    form.addEventListener("submit", async event => {
      event.preventDefault();
      const button = form.querySelector("button");
      const error = document.getElementById("m2-error");
      button.disabled = true;
      error.textContent = "Preparing evidence…";
      try {
        const file = document.getElementById("m2-image").files[0];
        if (!file) throw new Error("Choose a current screenshot.");
        if (file.size > 130000) throw new Error("This screenshot is too large. Crop it or save a smaller copy under about 120 KB.");
        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        error.textContent = "The evaluator is reviewing the evidence…";
        const result = await api("/api/missions/V1-M02/submissions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mission_id: "V1-M02",
            explorer_summary: document.getElementById("m2-explorer").value,
            output: document.getElementById("m2-output").value,
            screenshots: [{ name: file.name, mime_type: file.type, data_url: dataUrl }],
            checklist: {
              "V1-M02-T01": document.getElementById("m2-t01").checked,
              "V1-M02-T02": document.getElementById("m2-t02").checked,
              "V1-M02-T03": document.getElementById("m2-t03").checked
            },
            understanding: document.getElementById("m2-understanding").value
          })
        });
        renderFeedback(result.review);
        error.textContent = "Review saved to shared progress.";
      } catch (problem) {
        error.textContent = problem.message;
      } finally {
        button.disabled = false;
      }
    });
  }

  function renderUnavailableMission(state, id) {
    const full = document.getElementById("mission-one-content");
    if (full) full.hidden = true;
    const panel = document.getElementById("later-mission-panel");
    panel.hidden = false;
    const mission = byId(id);
    const access = accessState(state, id);
    setText("later-id", id);
    setText("later-title", mission?.title || id);
    setText("later-summary", mission?.summary || "");
    setText("later-difficulty", mission?.difficulty || "");
    setStatus(document.getElementById("later-status"), state.statuses[id] || "NOT_SUBMITTED", access);
    setText("later-message", access === "unreleased"
      ? "This mission is unlocked in progress, but it is not released yet. Its complete lesson, evidence form, evaluator, and release tests are still being prepared."
      : "Complete and prove the previous mission to unlock this mission.");
  }

  async function init() {
    document.querySelectorAll("[data-local-notice]").forEach(element => {
      element.textContent = "Shared backend active. Progress and reviews are stored centrally.";
    });
    if (!getToken()) {
      showLogin();
      return;
    }
    try {
      const state = stateFromProgress(await api("/api/progress"));
      if (page === "hq") renderHQ(state);
      if (page === "progress") renderProgress(state);
      if (page === "parent") renderParent(state);
      if (page === "mission") {
        const id = new URLSearchParams(location.search).get("id") || state.current.id;
        if (id === "V1-M01") renderMission1(state);
        else if (id === "V1-M02" && accessState(state, id) === "released") renderMission2(state);
        else renderUnavailableMission(state, id);
      }
      document.querySelectorAll("[data-nav]").forEach(link => {
        if (link.dataset.nav === page) link.setAttribute("aria-current", "page");
      });
    } catch (problem) {
      if (problem.message === "LOGIN_REQUIRED") showLogin();
      else {
        console.error(problem);
        alert("The shared backend could not load: " + problem.message);
      }
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();