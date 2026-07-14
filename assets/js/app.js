(function () {
  "use strict";

  const API = "https://nick-worldmaker-api.abystrov66.workers.dev";
  const missions = window.WORLDMAKER_MISSIONS || [];
  const byId = id => missions.find(m => m.id === id);
  const esc = value => String(value == null ? "" : value);
  const page = document.body.dataset.page;
  const role = page === "parent" ? "parent" : "learner";

  function setText(id, value) { const el = document.getElementById(id); if (el) el.textContent = esc(value); }
  function statusLabel(status, unlocked=true) { if (!unlocked) return "Locked"; return ({NOT_SUBMITTED:"Ready",UNDER_REVIEW:"Under Review",NEEDS_FIX:"Needs Fix",NEEDS_EVIDENCE:"Needs Evidence",BLOCKED_NEEDS_HELP:"Needs Help",APPROVED:"Approved"})[status] || status; }
  function statusClass(status, unlocked=true) { return unlocked ? String(status || "NOT_SUBMITTED").toLowerCase().replaceAll("_", "-") : "locked"; }
  function setStatus(el, status, unlocked=true) { if (!el) return; el.className = "status status-" + statusClass(status, unlocked); el.textContent = statusLabel(status, unlocked); }
  function missionURL(id) { return "mission.html?id=" + encodeURIComponent(id); }
  function tokenKey() { return "worldmaker_token_" + role; }
  function getToken() { return sessionStorage.getItem(tokenKey()); }
  function setToken(token) { sessionStorage.setItem(tokenKey(), token); }
  function clearToken() { sessionStorage.removeItem(tokenKey()); }

  async function api(path, options={}) {
    const headers = { ...(options.headers || {}) };
    if (getToken()) headers.Authorization = `Bearer ${getToken()}`;
    const response = await fetch(API + path, { ...options, headers });
    const text = await response.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = { error: text || "Invalid server response" }; }
    if (response.status === 401) { clearToken(); throw new Error("LOGIN_REQUIRED"); }
    if (!response.ok) throw new Error(data?.detail || data?.error || `Request failed (${response.status})`);
    return data;
  }

  function showLogin() {
    document.querySelectorAll("main, footer").forEach(el => el.hidden = true);
    const wrap = document.createElement("div");
    wrap.id = "shared-login";
    wrap.className = "site-shell";
    wrap.style.maxWidth = "620px";
    wrap.style.paddingTop = "80px";
    wrap.innerHTML = `<section class="card card-pad"><div class="eyebrow">Shared progress</div><h1>${role === "parent" ? "Parent login" : "Nick's login"}</h1><p class="lead">Enter the private ${role} code. The code is checked by the secure backend and is never stored in the website files.</p><form id="shared-login-form" class="form-grid"><div class="field"><label for="shared-code">Private code</label><input id="shared-code" type="password" minlength="6" autocomplete="current-password" required></div><p id="shared-login-error" class="muted" aria-live="polite"></p><button class="button button-primary" type="submit">Open ${role === "parent" ? "Parent View" : "Build HQ"}</button></form></section>`;
    document.body.appendChild(wrap);
    document.getElementById("shared-login-form").addEventListener("submit", async event => {
      event.preventDefault();
      const button = event.currentTarget.querySelector("button");
      const error = document.getElementById("shared-login-error");
      button.disabled = true; error.textContent = "Checking code…";
      try {
        const result = await api("/api/session", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ role, code:document.getElementById("shared-code").value }) });
        setToken(result.token);
        location.reload();
      } catch (err) {
        error.textContent = err.message === "Invalid access code" ? "That code is not correct." : err.message;
        button.disabled = false;
      }
    });
  }

  function stateFromProgress(data) {
    const statuses = {};
    (data.progress || []).forEach(row => { statuses[row.mission_id] = row.status; });
    const unlocked = missions.filter((m, i) => i === 0 || statuses[m.id] || statuses[missions[i-1]?.id] === "APPROVED").map(m => m.id);
    const approved = Object.keys(statuses).filter(id => statuses[id] === "APPROVED");
    const current = missions.find(m => unlocked.includes(m.id) && statuses[m.id] !== "APPROVED") || byId(approved.at(-1)) || missions[0];
    const attempts = (data.attempts || []).map(item => ({ missionId:item.mission_id, attemptNumber:item.attempt_number, submittedAt:item.created_at, review:item.review, status:item.review?.status || statuses[item.mission_id] }));
    return { statuses, unlocked, approved, current, attempts };
  }

  function latestReview(state) { return state.attempts.find(item => item.review)?.review || null; }

  function renderMissionMap(container, state, compact=false) {
    if (!container) return;
    container.textContent = "";
    missions.forEach(mission => {
      const unlocked = state.unlocked.includes(mission.id);
      const approved = state.approved.includes(mission.id);
      const node = document.createElement(unlocked ? "a" : "div");
      node.className = "mission-node" + (!unlocked ? " locked" : "") + (approved ? " approved" : "");
      if (unlocked) node.href = missionURL(mission.id);
      const num = document.createElement("div"); num.className = "mission-number"; num.textContent = mission.id;
      const title = document.createElement("h3"); title.textContent = mission.title;
      const desc = document.createElement("p"); desc.textContent = compact ? mission.summary.split(".")[0] + "." : mission.summary;
      const badge = document.createElement("span"); setStatus(badge, state.statuses[mission.id] || "NOT_SUBMITTED", unlocked);
      node.append(num, title, desc, badge); container.appendChild(node);
    });
  }

  function renderHQ(state) {
    const current = state.current;
    setText("current-mission-id", current.id);
    setText("current-mission-title", current.title);
    setText("current-mission-summary", current.summary);
    setStatus(document.getElementById("current-status"), state.statuses[current.id] || "NOT_SUBMITTED", true);
    const latest = latestReview(state);
    setText("next-action", latest?.next_action || (current.id === "V1-M02" ? "Open Mission 2 and build the island." : "Open the current mission."));
    setText("latest-achievement", state.approved.length ? (byId(state.approved.at(-1))?.title || state.approved.at(-1)) + " approved" : "Shared Build HQ online");
    const button = document.getElementById("continue-mission"); if (button) { button.href = missionURL(current.id); button.textContent = `Open ${current.id} →`; }
    renderMissionMap(document.getElementById("mission-map"), state, true);
  }

  function renderProgress(state) {
    const list = document.getElementById("progress-list"); if (!list) return;
    list.textContent = "";
    missions.forEach(mission => {
      const unlocked = state.unlocked.includes(mission.id);
      const row = document.createElement("div"); row.className = "progress-row";
      const id = document.createElement("strong"); id.textContent = mission.id;
      const titleWrap = document.createElement("div"); const title = document.createElement(unlocked ? "a" : "strong"); title.textContent = mission.title; if (unlocked) title.href = missionURL(mission.id);
      const summary = document.createElement("div"); summary.className = "muted"; summary.textContent = mission.summary; titleWrap.append(title, summary);
      const difficulty = document.createElement("span"); difficulty.textContent = mission.difficulty;
      const status = document.createElement("span"); setStatus(status, state.statuses[mission.id] || "NOT_SUBMITTED", unlocked);
      row.append(id, titleWrap, difficulty, status); list.appendChild(row);
    });
  }

  function renderParent(state) {
    const current = state.current; const latest = state.attempts[0]; const review = latest?.review;
    setText("parent-current", `${current.id} — ${current.title}`);
    setText("parent-latest-attempt", latest ? `Attempt ${latest.attemptNumber} · ${new Date(latest.submittedAt).toLocaleString()}` : "No submission yet");
    setStatus(document.getElementById("parent-status"), review?.status || state.statuses[current.id] || "NOT_SUBMITTED", true);
    setText("parent-problem", review?.main_problem || review?.next_action || "No current problem recorded.");
    setText("parent-next-action", review?.next_action || "Nick can open the current mission when ready.");
    setText("parent-last-activity", latest ? new Date(latest.submittedAt).toLocaleString() : "No activity yet");
    const approved = document.getElementById("parent-approved"); if (approved) { approved.textContent = ""; state.approved.forEach(id => { const span = document.createElement("span"); span.className = "status status-approved"; span.textContent = `${id} — ${byId(id)?.title || "Approved"}`; approved.appendChild(span); }); if (!state.approved.length) approved.textContent = "None yet"; }
    const attempts = document.getElementById("parent-attempts"); if (attempts) { attempts.textContent = ""; state.attempts.slice(0,8).forEach(item => { const card=document.createElement("div"); card.className="attempt"; const head=document.createElement("div"); head.className="attempt-head"; const title=document.createElement("strong"); title.textContent=`${item.missionId} · Attempt ${item.attemptNumber}`; const badge=document.createElement("span"); setStatus(badge,item.status,true); const text=document.createElement("p"); text.className="muted"; text.textContent=item.review?.parent_summary || "Stored submission"; head.append(title,badge); card.append(head,text); attempts.appendChild(card); }); }
    const reset = document.getElementById("reset-progress"); if (reset) { reset.textContent = "Sign out"; reset.onclick = () => { clearToken(); location.reload(); }; }
  }

  function renderFeedback(review) {
    const feedback = document.getElementById("feedback-card"); if (!feedback) return;
    feedback.hidden = false; feedback.className = "feedback " + review.status.toLowerCase().replaceAll("_", "-");
    setStatus(document.getElementById("feedback-status"), review.status, true); setText("feedback-headline", review.headline);
    const worked = document.getElementById("feedback-worked"); worked.textContent = ""; (review.approved_requirements.length ? review.approved_requirements : ["No mandatory requirement is fully proven yet."]).forEach(text => { const li=document.createElement("li"); li.textContent=text; worked.appendChild(li); });
    setText("feedback-problem", review.main_problem || "No blocker remains."); setText("feedback-explanation", review.explanation); setText("feedback-next", review.next_action);
    const repeat=document.getElementById("feedback-tests"); repeat.textContent=""; (review.tests_to_repeat.length ? review.tests_to_repeat : ["None"]).forEach(text=>{const li=document.createElement("li");li.textContent=text;repeat.appendChild(li);});
    setText("feedback-hint", "Level " + review.hint_level); setText("feedback-unlock", review.unlock_next_mission ? review.next_mission_id + " unlocked" : "Next mission remains locked");
    feedback.scrollIntoView({behavior:"smooth",block:"start"});
  }

  function renderMission1(state) {
    const mission = byId("V1-M01");
    setText("mission-id", mission.id); setText("mission-title", mission.title); setText("mission-objective", mission.objective); setText("visible-result", mission.visibleResult); setText("why-it-matters", mission.whyItMatters); setText("starting-state", mission.startingState); setText("hierarchy-block", mission.requiredHierarchy); setText("understanding-question", mission.understandingQuestion);
    setStatus(document.getElementById("mission-status"), state.statuses[mission.id] || "NOT_SUBMITTED", true);
    const form = document.getElementById("submission-form"); if (form && state.statuses[mission.id] === "APPROVED") { form.innerHTML = '<div class="callout"><strong>Mission 1 is approved.</strong> Its result is now stored in the shared backend. Continue to Mission 2.</div><div class="form-actions"><a class="button button-primary" href="mission.html?id=V1-M02">Open Mission 2 →</a></div>'; }
  }

  function renderMission2(state) {
    const full = document.getElementById("mission-one-content"); if (full) full.hidden = true;
    const panel = document.getElementById("later-mission-panel"); panel.hidden = false; panel.className = "card content-card";
    const mission = byId("V1-M02"); setText("later-id", mission.id); setText("later-title", mission.title); setText("later-summary", mission.summary); setText("later-difficulty", mission.difficulty); setStatus(document.getElementById("later-status"), state.statuses[mission.id] || "NOT_SUBMITTED", true);
    panel.querySelector(".lock-icon").textContent = "🏝️";
    document.getElementById("later-message").innerHTML = "Build safe ground, a spawn, a BuildSite, and open walking routes. Then submit current evidence below.";
    const action = document.getElementById("later-action"); action.remove();
    const form = document.createElement("form"); form.id = "mission2-form"; form.className = "form-grid"; form.innerHTML = `<div class="field"><label>1. Explorer summary</label><textarea id="m2-explorer" required minlength="20" placeholder="Describe the exact World/Ground/PlayerSpawn/BuildSite structure and whether imported models contain scripts."></textarea></div><div class="field"><label>2. Current Studio Output</label><textarea id="m2-output" required placeholder="Paste current Output text."></textarea></div><div class="field"><label>3. Current Play-mode screenshot</label><input id="m2-image" type="file" accept="image/png,image/jpeg,image/webp" required><p class="field-help">Use one clear screenshot under about 120 KB for this first build.</p></div><fieldset><legend>4. Confirm the tests you actually ran</legend><label class="check-row"><input id="m2-t01" type="checkbox"> <span>V1-M02-T01 — I spawned safely on the playable ground.</span></label><label class="check-row"><input id="m2-t02" type="checkbox"> <span>V1-M02-T02 — The island stayed still during Play.</span></label><label class="check-row"><input id="m2-t03" type="checkbox"> <span>V1-M02-T03 — Walking routes to both future resource areas stay open.</span></label></fieldset><div class="field"><label>5. Quick understanding</label><input id="m2-understanding" required maxlength="500" placeholder="What does PlayerSpawn control?"></div><p id="m2-error" class="muted" aria-live="polite"></p><button class="button button-primary" type="submit">Send Mission 2 for review</button>`;
    panel.appendChild(form);
    form.addEventListener("submit", async event => {
      event.preventDefault(); const button=form.querySelector("button"); const error=document.getElementById("m2-error"); button.disabled=true; error.textContent="Preparing evidence…";
      try {
        const file=document.getElementById("m2-image").files[0]; if (!file) throw new Error("Choose a current screenshot."); if (file.size > 130000) throw new Error("This screenshot is too large. Crop it or save a smaller copy under about 120 KB.");
        const dataUrl=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file);});
        error.textContent="The evaluator is reviewing the evidence…";
        const result=await api("/api/missions/V1-M02/submissions",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({mission_id:"V1-M02",explorer_summary:document.getElementById("m2-explorer").value,output:document.getElementById("m2-output").value,screenshots:[{name:file.name,mime_type:file.type,data_url:dataUrl}],checklist:{"V1-M02-T01":document.getElementById("m2-t01").checked,"V1-M02-T02":document.getElementById("m2-t02").checked,"V1-M02-T03":document.getElementById("m2-t03").checked},understanding:document.getElementById("m2-understanding").value})});
        renderFeedback(result.review); error.textContent="Review saved to shared progress."; button.disabled=false;
      } catch(err) { error.textContent=err.message; button.disabled=false; }
    });
  }

  async function init() {
    document.querySelectorAll("[data-local-notice]").forEach(el => el.textContent = "Shared backend active. Progress and reviews are stored centrally and can be opened from another browser or device.");
    if (!getToken()) { showLogin(); return; }
    try {
      const state = stateFromProgress(await api("/api/progress"));
      if (page === "hq") renderHQ(state);
      if (page === "progress") renderProgress(state);
      if (page === "parent") renderParent(state);
      if (page === "mission") { const id = new URLSearchParams(location.search).get("id") || state.current.id; if (id === "V1-M01") renderMission1(state); else if (id === "V1-M02" && state.unlocked.includes(id)) renderMission2(state); else { const full=document.getElementById("mission-one-content"); if(full)full.hidden=true; const panel=document.getElementById("later-mission-panel"); panel.hidden=false; setText("later-id",id); setText("later-title",byId(id)?.title||id); setText("later-summary",byId(id)?.summary||""); setStatus(document.getElementById("later-status"),state.statuses[id]||"NOT_SUBMITTED",false); setText("later-message","Complete and prove the previous mission to unlock this mission."); } }
      document.querySelectorAll("[data-nav]").forEach(link => { if (link.dataset.nav === page) link.setAttribute("aria-current","page"); });
    } catch (err) {
      if (err.message === "LOGIN_REQUIRED") showLogin(); else { console.error(err); alert("The shared backend could not load: " + err.message); }
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();