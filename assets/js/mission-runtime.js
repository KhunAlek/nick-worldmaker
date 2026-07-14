(function () {
  "use strict";

  const API = "https://nick-worldmaker-api.abystrov66.workers.dev";
  const lessons = window.WORLDMAKER_LESSONS || {};

  function text(value) {
    return String(value == null ? "" : value);
  }

  function element(tag, className, content) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content != null) node.textContent = text(content);
    return node;
  }

  function token() {
    return sessionStorage.getItem("worldmaker_token_learner");
  }

  async function api(path, options = {}) {
    const headers = { ...(options.headers || {}) };
    if (token()) headers.Authorization = `Bearer ${token()}`;
    const response = await fetch(API + path, { ...options, headers });
    const bodyText = await response.text();
    let data;
    try { data = bodyText ? JSON.parse(bodyText) : null; }
    catch { data = { error: bodyText || "Invalid server response" }; }
    if (!response.ok) throw new Error(data?.detail || data?.error || `Request failed (${response.status})`);
    return data;
  }

  function fileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function addLesson(panel, lesson, status) {
    panel.className = "card content-card";
    panel.textContent = "";

    const header = element("section", "mission-header");
    const meta = element("div", "mission-meta");
    const statusBadge = element("span", "status status-" + String(status || "NOT_SUBMITTED").toLowerCase().replaceAll("_", "-"), status === "APPROVED" ? "Approved" : "Ready");
    meta.append(statusBadge, element("span", "status status-not-submitted", lesson.id), element("span", "status status-not-submitted", lesson.difficulty));
    header.append(meta, element("h1", "", lesson.title), element("p", "lead", lesson.objective));
    const result = element("div", "callout");
    result.innerHTML = `<strong>What you will see:</strong> ${text(lesson.visibleResult)}`;
    header.appendChild(result);
    panel.appendChild(header);

    const intro = element("section", "section");
    intro.append(element("h2", "", "Why this matters"), element("p", "", lesson.whyItMatters), element("h3", "", "Starting point"), element("p", "", lesson.startingState));
    panel.appendChild(intro);

    const concepts = element("section", "section");
    concepts.appendChild(element("h2", "", "New words"));
    const conceptGrid = element("div", "lesson-goal");
    lesson.concepts.forEach(concept => {
      const card = element("div", "");
      card.innerHTML = `<strong>${text(concept.name)}</strong><br>${text(concept.text)}`;
      conceptGrid.appendChild(card);
    });
    concepts.appendChild(conceptGrid);
    panel.appendChild(concepts);

    const path = element("section", "section lesson-path");
    path.appendChild(element("h2", "", "Build it one step at a time"));
    lesson.steps.forEach((step, index) => {
      const details = element("details", "step-card");
      if (index === 0) details.open = true;
      details.appendChild(element("summary", "", `Step ${index + 1} — ${step.title}`));
      const body = element("div", "step-body");
      const list = element("ol", "");
      step.actions.forEach(action => list.appendChild(element("li", "", action)));
      body.appendChild(list);
      const checkpoint = element("div", "checkpoint");
      checkpoint.innerHTML = `<strong>Stop and check:</strong> ${text(step.checkpoint)}`;
      const recovery = element("div", "try-it");
      recovery.innerHTML = `<strong>Something went wrong?</strong> ${text(step.recovery)}`;
      body.append(checkpoint, recovery);
      details.appendChild(body);
      path.appendChild(details);
    });
    panel.appendChild(path);

    const structure = element("section", "section");
    structure.append(element("h2", "", "Explorer target"), element("pre", "mini-code", lesson.hierarchy));
    panel.appendChild(structure);

    const tests = element("section", "section");
    tests.appendChild(element("h2", "", "Proof tests"));
    lesson.tests.forEach(test => {
      const card = element("div", "checkpoint");
      card.innerHTML = `<strong>${text(test.id)} — ${text(test.name)}</strong><br><b>Setup:</b> ${text(test.setup)}<br><b>Action:</b> ${text(test.action)}<br><b>Expected:</b> ${text(test.expected)}`;
      tests.appendChild(card);
    });
    panel.appendChild(tests);

    if (status === "APPROVED") {
      const approved = element("div", "callout");
      approved.innerHTML = "<strong>Mission 3 is approved.</strong> The result is stored in shared progress.";
      panel.appendChild(approved);
      return;
    }

    panel.appendChild(buildForm(lesson));
  }

  function buildForm(lesson) {
    const form = element("form", "form-grid");
    form.id = "registry-mission-form";
    form.appendChild(element("h2", "", "Send current evidence"));

    lesson.submission.fields.forEach((field, index) => {
      const wrap = element("div", "field");
      const label = element("label", "", `${index + 1}. ${field.label}`);
      label.htmlFor = `evidence-${field.key}`;
      wrap.appendChild(label);
      if (field.key === "screenshot") {
        const input = element("input", "");
        input.id = `evidence-${field.key}`;
        input.type = "file";
        input.accept = "image/png,image/jpeg,image/webp";
        input.required = true;
        wrap.appendChild(input);
      } else {
        const input = element("textarea", "");
        input.id = `evidence-${field.key}`;
        input.required = true;
        input.minLength = 10;
        wrap.appendChild(input);
      }
      wrap.appendChild(element("p", "field-help", field.help));
      form.appendChild(wrap);
    });

    const fieldset = element("fieldset", "");
    fieldset.appendChild(element("legend", "", "Confirm only the tests you actually ran"));
    lesson.tests.forEach(test => {
      const label = element("label", "check-row");
      const input = element("input", "");
      input.type = "checkbox";
      input.id = `test-${test.id}`;
      label.append(input, element("span", "", `${test.id} — ${test.name}`));
      fieldset.appendChild(label);
    });
    form.appendChild(fieldset);

    const understanding = element("div", "field");
    const understandingLabel = element("label", "", "Quick understanding");
    understandingLabel.htmlFor = "evidence-understanding";
    const understandingInput = element("textarea", "");
    understandingInput.id = "evidence-understanding";
    understandingInput.required = true;
    understandingInput.minLength = 10;
    understanding.append(understandingLabel, element("p", "field-help", lesson.submission.understanding), understandingInput);
    form.appendChild(understanding);

    const error = element("p", "muted");
    error.id = "registry-form-error";
    error.setAttribute("aria-live", "polite");
    const button = element("button", "button button-primary", `Send ${lesson.id} for review`);
    button.type = "submit";
    form.append(error, button);

    form.addEventListener("submit", async event => {
      event.preventDefault();
      button.disabled = true;
      error.textContent = "Preparing evidence…";
      try {
        const screenshot = document.getElementById("evidence-screenshot").files[0];
        if (!screenshot) throw new Error("Choose a current Play screenshot.");
        if (screenshot.size > 130000) throw new Error("Crop or resize the screenshot to about 120 KB or less.");
        const dataUrl = await fileAsDataUrl(screenshot);
        const checklist = {};
        lesson.tests.forEach(test => { checklist[test.id] = document.getElementById(`test-${test.id}`).checked; });
        const payload = {
          mission_id: lesson.id,
          explorer_summary: document.getElementById("evidence-explorer_summary").value,
          properties: document.getElementById("evidence-properties").value,
          output: document.getElementById("evidence-output").value,
          screenshots: [{ name: screenshot.name, mime_type: screenshot.type, data_url: dataUrl }],
          checklist,
          understanding: document.getElementById("evidence-understanding").value
        };
        error.textContent = "The evaluator is reviewing the evidence…";
        const result = await api(`/api/missions/${lesson.id}/submissions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        error.textContent = result.review?.headline || "Review saved to shared progress.";
        location.reload();
      } catch (problem) {
        error.textContent = problem.message;
      } finally {
        button.disabled = false;
      }
    });

    return form;
  }

  async function init() {
    if (document.body.dataset.page !== "mission") return;
    const id = new URLSearchParams(location.search).get("id");
    const lesson = lessons[id];
    if (!lesson || !token()) return;

    try {
      const progress = await api("/api/progress");
      const missionMeta = (progress.missions || []).find(mission => mission.id === id);
      const progressRow = (progress.progress || []).find(row => row.mission_id === id);
      if (missionMeta?.release_state !== "released") return;
      if (!progressRow && id !== "V1-M01") return;

      const oldContent = document.getElementById("mission-one-content");
      if (oldContent) oldContent.hidden = true;
      const panel = document.getElementById("later-mission-panel");
      if (!panel) return;
      addLesson(panel, lesson, progressRow?.status || "NOT_SUBMITTED");
    } catch (problem) {
      console.error("Registry mission runtime failed", problem);
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();