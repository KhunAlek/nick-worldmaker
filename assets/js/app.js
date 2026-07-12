(function () {
  "use strict";
  const missions = window.WORLDMAKER_MISSIONS || [];
  const byId = id => missions.find(m => m.id === id);
  const esc = value => String(value == null ? "" : value);

  function statusLabel(status, unlocked=true) {
    if (!unlocked) return "Locked";
    return ({NOT_SUBMITTED:"Ready",UNDER_REVIEW:"Under Review",NEEDS_FIX:"Needs Fix",NEEDS_EVIDENCE:"Needs Evidence",BLOCKED_NEEDS_HELP:"Needs Help",APPROVED:"Approved"})[status] || status;
  }
  function statusClass(status, unlocked=true) {
    if (!unlocked) return "locked";
    return String(status || "not-submitted").toLowerCase().replaceAll("_", "-");
  }
  function formatDate(iso) {
    if (!iso) return "No activity yet";
    const date = new Date(iso);
    return Number.isNaN(date.getTime()) ? "Unknown" : date.toLocaleString([], {dateStyle:"medium", timeStyle:"short"});
  }
  function setText(id, value) { const el=document.getElementById(id); if(el) el.textContent=esc(value); }
  function setStatus(el, status, unlocked=true) {
    if (!el) return;
    el.className = "status status-" + statusClass(status, unlocked);
    el.textContent = statusLabel(status, unlocked);
  }
  function missionURL(id) { return "mission.html?id=" + encodeURIComponent(id); }
  function localNotice() {
    return "Build 1 uses a local deterministic simulation—not ChatGPT. Progress is stored only in this browser’s localStorage.";
  }
  function renderMissionMap(container, state, compact=false) {
    if (!container) return;
    container.textContent = "";
    missions.forEach(mission => {
      const unlocked = state.unlockedMissions.includes(mission.id);
      const approved = state.approvedMissions.includes(mission.id);
      const node = document.createElement(unlocked ? "a" : "div");
      node.className = "mission-node" + (!unlocked ? " locked" : "") + (approved ? " approved" : "");
      if (unlocked) node.href = missionURL(mission.id);
      const num = document.createElement("div"); num.className="mission-number"; num.textContent=mission.id;
      const title = document.createElement("h3"); title.textContent=mission.title;
      const desc = document.createElement("p"); desc.textContent=compact ? mission.summary.split(".")[0] + "." : mission.summary;
      const badge = document.createElement("span");
      setStatus(badge, state.missionStatuses[mission.id], unlocked);
      node.append(num,title,desc,badge);
      container.appendChild(node);
    });
  }
  function renderHQ() {
    const state = WorldmakerStorage.getState();
    const current = byId(state.currentMission) || missions[0];
    setText("current-mission-id", current.id);
    setText("current-mission-title", current.title);
    setText("current-mission-summary", current.summary);
    setStatus(document.getElementById("current-status"), state.missionStatuses[current.id], true);
    const latest = state.latestMockReview;
    setText("next-action", latest ? latest.next_action : "Open Mission 1 and build the Studio foundation.");
    setText("latest-achievement", state.approvedMissions.length ? byId(state.approvedMissions[state.approvedMissions.length-1]).title + " approved" : "Build HQ online");
    const continueButton = document.getElementById("continue-mission");
    if (continueButton) { continueButton.href = missionURL(current.id); continueButton.textContent = current.id === "V1-M01" ? "Continue Mission 1 →" : "Open unlocked Mission 2 →"; }
    renderMissionMap(document.getElementById("mission-map"), state, true);
  }
  function renderProgress() {
    const state = WorldmakerStorage.getState();
    const list = document.getElementById("progress-list");
    if (!list) return;
    list.textContent = "";
    missions.forEach(mission => {
      const unlocked = state.unlockedMissions.includes(mission.id);
      const row = document.createElement("div"); row.className="progress-row";
      const id = document.createElement("strong"); id.textContent=mission.id;
      const titleWrap = document.createElement("div");
      const title = document.createElement(unlocked ? "a" : "strong");
      title.textContent=mission.title; if(unlocked) title.href=missionURL(mission.id);
      const summary=document.createElement("div"); summary.className="muted"; summary.textContent=mission.summary;
      titleWrap.append(title,summary);
      const difficulty=document.createElement("span"); difficulty.textContent=mission.difficulty;
      const status=document.createElement("span"); setStatus(status,state.missionStatuses[mission.id],unlocked);
      row.append(id,titleWrap,difficulty,status); list.appendChild(row);
    });
  }
  function renderParent() {
    const state = WorldmakerStorage.getState();
    const current = byId(state.currentMission) || missions[0];
    const latestAttempt = state.attempts[state.attempts.length - 1];
    const review = latestAttempt ? latestAttempt.review : null;
    setText("parent-current", current.id + " — " + current.title);
    setText("parent-latest-attempt", latestAttempt ? "Attempt " + latestAttempt.attemptNumber + " · " + formatDate(latestAttempt.submittedAt) : "No submission yet");
    setStatus(document.getElementById("parent-status"), review ? review.status : state.missionStatuses[current.id], true);
    setText("parent-problem", review ? (review.main_problem || review.next_action) : "Mission 1 is ready to begin.");
    setText("parent-next-action", review ? review.next_action : "Nick can open Mission 1 when he chooses.");
    setText("parent-last-activity", formatDate(state.lastActivity));
    const approved = document.getElementById("parent-approved");
    if (approved) {
      approved.textContent="";
      if (!state.approvedMissions.length) { const span=document.createElement("span"); span.className="muted"; span.textContent="None yet"; approved.appendChild(span); }
      else state.approvedMissions.forEach(id => { const mission=byId(id); const span=document.createElement("span"); span.className="status status-approved"; span.textContent=id+" — "+(mission?mission.title:"Approved"); approved.appendChild(span); });
    }
    const attempts = document.getElementById("parent-attempts");
    if (attempts) {
      attempts.textContent="";
      state.attempts.slice().reverse().slice(0,8).forEach(item => {
        const card=document.createElement("div"); card.className="attempt";
        const head=document.createElement("div"); head.className="attempt-head";
        const title=document.createElement("strong"); title.textContent=item.missionId+" · Attempt "+item.attemptNumber;
        const badge=document.createElement("span"); setStatus(badge,item.status,true);
        const text=document.createElement("p"); text.className="muted"; text.textContent=item.review.parent_summary;
        const date=document.createElement("small"); date.className="muted"; date.textContent=formatDate(item.submittedAt);
        head.append(title,badge); card.append(head,text,date); attempts.appendChild(card);
      });
      if (!state.attempts.length) { const empty=document.createElement("div"); empty.className="empty"; empty.textContent="No attempts stored in this browser."; attempts.appendChild(empty); }
    }
    const reset=document.getElementById("reset-progress");
    if (reset) reset.onclick = () => {
      if (window.confirm("Reset all Build 1 progress stored in this browser?")) {
        WorldmakerStorage.reset();
        renderParent();
      }
    };
  }
  function populateMissionOne(mission, state) {
    setText("mission-id",mission.id); setText("mission-title",mission.title); setText("mission-objective",mission.objective);
    setText("visible-result",mission.visibleResult); setText("why-it-matters",mission.whyItMatters); setText("starting-state",mission.startingState);
    setText("hierarchy-block",mission.requiredHierarchy); setText("understanding-question",mission.understandingQuestion);
    setStatus(document.getElementById("mission-status"),state.missionStatuses[mission.id],true);
    const concepts=document.getElementById("concepts"); concepts.textContent="";
    mission.concepts.forEach(item=>{const div=document.createElement("div");div.className="concept";const b=document.createElement("b");b.textContent=item.name+": ";div.append(b,document.createTextNode(item.text));concepts.appendChild(div);});
    const steps=document.getElementById("build-steps"); steps.textContent=""; mission.steps.forEach(text=>{const li=document.createElement("li");li.textContent=text;steps.appendChild(li);});
    const mistakes=document.getElementById("mistakes"); mistakes.textContent=""; mission.mistakes.forEach(text=>{const li=document.createElement("li");li.textContent=text;mistakes.appendChild(li);});
    const submit=document.getElementById("submit-list"); submit.textContent=""; mission.submission.forEach(text=>{const li=document.createElement("li");li.textContent=text;submit.appendChild(li);});
    const tests=document.getElementById("test-list"); tests.textContent="";
    mission.tests.forEach(test=>{const card=document.createElement("article");card.className="test-card";const title=document.createElement("strong");title.textContent=test.id+" — "+test.name;const dl=document.createElement("dl");[["Setup",test.setup],["Action",test.action],["Expected",test.expected]].forEach(([k,v])=>{const dt=document.createElement("dt");dt.textContent=k;const dd=document.createElement("dd");dd.textContent=v;dl.append(dt,dd);});card.append(title,dl);tests.appendChild(card);});

    let hintLevel = state.hintLevels[mission.id] || 0;
    const hintText=document.getElementById("hint-text"); const hintBadge=document.getElementById("hint-level");
    function showHint(){ hintBadge.textContent="Hint level "+hintLevel; hintText.textContent=hintLevel ? mission.hints[hintLevel-1] : "No hint used. Open one only when it helps you move forward."; }
    showHint();
    document.getElementById("next-hint").addEventListener("click",()=>{ hintLevel=Math.min(5,hintLevel+1); WorldmakerStorage.setHintLevel(mission.id,hintLevel); showHint(); });

    const form=document.getElementById("submission-form");
    const feedback=document.getElementById("feedback-card");
    function getSubmission(){return{
      code:document.getElementById("worldserver-code").value,
      hierarchy:document.getElementById("hierarchy-text").value,
      output:document.getElementById("studio-output").value,
      checklist:{
        "V1-M01-T01":document.getElementById("check-t01").checked,
        "V1-M01-T02":document.getElementById("check-t02").checked,
        "V1-M01-T03":document.getElementById("check-t03").checked
      },
      understanding:document.getElementById("understanding-answer").value,
      strongHelp:document.getElementById("strong-help").checked
    };}
    function renderFeedback(review){
      feedback.hidden=false; feedback.className="feedback "+review.status.toLowerCase().replaceAll("_","-");
      setStatus(document.getElementById("feedback-status"),review.status,true);
      setText("feedback-headline",review.headline);
      const worked=document.getElementById("feedback-worked");worked.textContent="";
      (review.approved_requirements.length?review.approved_requirements:["No mandatory test is fully proven yet."]).forEach(text=>{const li=document.createElement("li");li.textContent=text;worked.appendChild(li);});
      setText("feedback-problem",review.main_problem||"No blocker remains."); setText("feedback-explanation",review.explanation); setText("feedback-next",review.next_action);
      const repeat=document.getElementById("feedback-tests");repeat.textContent="";(review.tests_to_repeat.length?review.tests_to_repeat:["None"]).forEach(text=>{const li=document.createElement("li");li.textContent=text;repeat.appendChild(li);});
      setText("feedback-hint","Level "+review.hint_level); setText("feedback-unlock",review.unlock_next_mission?review.next_mission_id+" unlocked":"Next mission remains locked");
      document.getElementById("review-json").textContent=JSON.stringify(review,null,2);
      feedback.scrollIntoView({behavior:"smooth",block:"start"});
    }
    if (state.latestMockReview && state.latestMockReview.mission_id===mission.id) renderFeedback(state.latestMockReview);
    form.addEventListener("submit",event=>{
      event.preventDefault();
      const submission=getSubmission();
      const currentState=WorldmakerStorage.getState();
      const attemptNumber=currentState.attempts.filter(a=>a.missionId===mission.id).length+1;
      const requestedLevel=submission.strongHelp?5:(currentState.hintLevels[mission.id]||0);
      const review=WorldmakerEvaluator.evaluateMission1(submission,attemptNumber,requestedLevel);
      if(!WorldmakerEvaluator.validateReview(review,attemptNumber)){ alert("The local evaluator returned an invalid response object. Progress was not changed."); return; }
      const eligible=WorldmakerEvaluator.isApprovalEligible(submission,review);
      WorldmakerStorage.recordAttempt(submission,review,eligible);
      renderFeedback(review);
      setStatus(document.getElementById("mission-status"),review.status,true);
    });

    function loadSample(kind){
      const code=document.getElementById("worldserver-code"),hier=document.getElementById("hierarchy-text"),output=document.getElementById("studio-output");
      hier.value=mission.requiredHierarchy;
      code.value=kind==="fix"?'print("SERVER READY")':'print("VERSION 1 SERVER READY")';
      output.value=kind==="evidence"?"":(kind==="fix"?"SERVER READY":"VERSION 1 SERVER READY");
      ["check-t01","check-t02","check-t03"].forEach(id=>document.getElementById(id).checked=kind!=="evidence");
      if(kind==="evidence"){document.getElementById("check-t01").checked=true;document.getElementById("check-t02").checked=true;}
      document.getElementById("understanding-answer").value="I will check Output first, then the script location and type.";
      form.scrollIntoView({behavior:"smooth",block:"start"});
    }
    document.querySelectorAll("[data-sample]").forEach(btn=>btn.addEventListener("click",()=>loadSample(btn.dataset.sample)));
  }
  function renderLaterMission(mission, state, unlocked) {
    const full=document.getElementById("mission-one-content"); if(full) full.hidden=true;
    const panel=document.getElementById("later-mission-panel"); panel.hidden=false;
    setText("later-id",mission.id); setText("later-title",mission.title); setText("later-summary",mission.summary); setText("later-difficulty",mission.difficulty);
    setStatus(document.getElementById("later-status"),state.missionStatuses[mission.id],unlocked);
    const message=document.getElementById("later-message");
    message.textContent=unlocked
      ? "Mission 1 approval unlocked this mission. Build 1 intentionally includes only the canonical summary; the full Mission 2 workflow belongs to the next website build."
      : "Complete and prove the previous mission to unlock this mission. Its canonical summary is visible, but detailed instructions stay locked.";
    const back=document.getElementById("later-action"); back.href=unlocked?"hq.html":"mission.html?id=V1-M01"; back.textContent=unlocked?"Return to Build HQ":"Open Mission 1";
  }
  function renderMission() {
    const state=WorldmakerStorage.getState();
    const params=new URLSearchParams(location.search); const id=params.get("id")||state.currentMission||"V1-M01";
    const mission=byId(id)||missions[0]; const unlocked=state.unlockedMissions.includes(mission.id);
    if(mission.id==="V1-M01") populateMissionOne(mission,state); else renderLaterMission(mission,state,unlocked);
  }
  function init() {
    document.querySelectorAll("[data-local-notice]").forEach(el=>el.textContent=localNotice());
    const page=document.body.dataset.page;
    if(page==="hq") renderHQ();
    if(page==="mission") renderMission();
    if(page==="progress") renderProgress();
    if(page==="parent") renderParent();
  }
  document.addEventListener("DOMContentLoaded",init);
})();
