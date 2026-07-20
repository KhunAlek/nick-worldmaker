(function () {
  "use strict";

  const API = "https://nick-worldmaker-api.abystrov66.workers.dev";
  const lessons = window.WORLDMAKER_LESSONS || {};
  const IMAGE_KEYS = new Set(["screenshot", "screenshots"]);
  const VIDEO_KEYS = new Set(["video", "videos"]);
  const MAX_SOURCE_IMAGE_BYTES = 5 * 1024 * 1024;
  const TARGET_IMAGE_BYTES = 105 * 1024;
  const MAX_IMAGE_DIMENSION = 1600;

  const text = value => String(value == null ? "" : value);

  function element(tag, className, content) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content != null) node.textContent = text(content);
    return node;
  }

  const token = () => sessionStorage.getItem("worldmaker_token_learner");

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

  function canvasToBlob(canvas, type, quality) {
    return new Promise((resolve, reject) => {
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("The browser could not prepare this screenshot.")), type, quality);
    });
  }

  async function loadImage(file) {
    const objectUrl = URL.createObjectURL(file);
    try {
      const image = new Image();
      image.decoding = "async";
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = () => reject(new Error("This image could not be opened. Try saving it as PNG or JPG."));
        image.src = objectUrl;
      });
      return image;
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  async function prepareScreenshot(file) {
    if (!/^image\/(png|jpeg|webp)$/.test(file.type)) throw new Error("Use a PNG, JPG, or WebP screenshot.");
    if (file.size > MAX_SOURCE_IMAGE_BYTES) throw new Error("This screenshot is over 5 MB. Save a normal screenshot smaller than 5 MB and choose it again.");

    const image = await loadImage(file);
    let scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight));
    let bestBlob = null;

    for (let resizeAttempt = 0; resizeAttempt < 5; resizeAttempt += 1) {
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext("2d", { alpha: false });
      if (!context) throw new Error("The browser could not prepare this screenshot.");
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      for (const quality of [0.86, 0.76, 0.66, 0.56, 0.46, 0.38]) {
        const blob = await canvasToBlob(canvas, "image/webp", quality);
        bestBlob = blob;
        if (blob.size <= TARGET_IMAGE_BYTES) {
          const safeName = file.name.replace(/\.[^.]+$/, "") + "-optimized.webp";
          return {
            name: safeName,
            mime_type: "image/webp",
            data_url: await fileAsDataUrl(blob),
            original_bytes: file.size,
            prepared_bytes: blob.size
          };
        }
      }
      scale *= 0.82;
    }

    if (!bestBlob) throw new Error("The screenshot could not be prepared.");
    throw new Error("This screenshot contains too much detail to prepare safely. Capture only the Roblox Studio window and try again.");
  }

  function installUploadStyles() {
    if (document.getElementById("worldmaker-upload-styles")) return;
    const style = document.createElement("style");
    style.id = "worldmaker-upload-styles";
    style.textContent = `
      .evidence-upload{display:grid;gap:10px;padding:16px;border:1px dashed rgba(86,246,255,.45);border-radius:16px;background:rgba(9,11,30,.82)}
      .evidence-upload.has-file{border-style:solid;border-color:rgba(151,255,130,.55);background:rgba(151,255,130,.07)}
      .evidence-upload input[type=file]{position:absolute;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none}
      .evidence-upload-row{display:flex;gap:12px;align-items:center;flex-wrap:wrap}
      .evidence-upload-button{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:11px 17px;border:0;border-radius:11px;background:linear-gradient(100deg,var(--cyan),#9dc7ff 52%,#d9a9ff);color:#071018;font-weight:900;cursor:pointer}
      .evidence-upload-name{color:var(--muted);overflow-wrap:anywhere}.evidence-upload.has-file .evidence-upload-name{color:#b8ffac;font-weight:800}
      .evidence-upload-note{margin:0;color:var(--muted);font-size:.9rem}
      @media(max-width:620px){.evidence-upload-row{align-items:stretch;flex-direction:column}.evidence-upload-button{width:100%}}
    `;
    document.head.appendChild(style);
  }

  function buildImageUpload(field) {
    installUploadStyles();
    const box = element("div", "evidence-upload");
    const input = element("input", "");
    input.id = `evidence-${field.key}`;
    input.type = "file";
    input.accept = "image/png,image/jpeg,image/webp";
    input.required = true;
    const row = element("div", "evidence-upload-row");
    const choose = element("label", "evidence-upload-button", "Choose screenshot");
    choose.htmlFor = input.id;
    const name = element("span", "evidence-upload-name", "No screenshot selected");
    const note = element("p", "evidence-upload-note", "PNG, JPG, or WebP, up to 5 MB. The website will reduce the file size automatically.");
    row.append(choose, name);
    box.append(input, row, note);
    input.addEventListener("change", () => {
      const file = input.files[0];
      box.classList.toggle("has-file", Boolean(file));
      choose.textContent = file ? "Change screenshot" : "Choose screenshot";
      name.textContent = file ? `${file.name} · ${Math.max(1, Math.round(file.size / 1024))} KB` : "No screenshot selected";
    });
    return box;
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

    const lessonPath = element("section", "section lesson-path");
    lessonPath.appendChild(element("h2", "", "Build it one step at a time"));
    lesson.steps.forEach((step, index) => {
      const details = element("details", "step-card");
      if (index === 0) details.open = true;
      details.appendChild(element("summary", "", `Step ${index + 1} — ${step.title}`));
      const body = element("div", "step-body");
      const list = element("ol", "");
      step.actions.forEach(action => list.appendChild(element("li", "", action)));
      if (Array.isArray(step.codeBlocks)) {
        step.codeBlocks.forEach(block => {
          const codeCard = element("div", "checkpoint");
          const title = element("strong", "", block.label || "Code");
          const code = element("pre", "mini-code", block.code || "");
          codeCard.append(title, code);
          if (block.explanation) codeCard.appendChild(element("p", "", block.explanation));
          body.appendChild(codeCard);
        });
      }
      const checkpoint = element("div", "checkpoint");
      checkpoint.innerHTML = `<strong>Stop and check:</strong> ${text(step.checkpoint)}`;
      const recovery = element("div", "try-it");
      recovery.innerHTML = `<strong>Something went wrong?</strong> ${text(step.recovery)}`;
      body.append(list, checkpoint, recovery);
      details.appendChild(body);
      lessonPath.appendChild(details);
    });
    panel.appendChild(lessonPath);

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
      approved.innerHTML = `<strong>${text(lesson.title)} is approved.</strong> The result is stored in shared progress.`;
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
      if (IMAGE_KEYS.has(field.key)) {
        wrap.appendChild(buildImageUpload(field));
      } else {
        const input = element("textarea", "");
        input.id = `evidence-${field.key}`;
        input.required = true;
        input.minLength = 10;
        if (field.key === "code") input.setAttribute("spellcheck", "false");
        if (VIDEO_KEYS.has(field.key)) input.placeholder = "Paste a current share link and briefly state what the recording proves.";
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
    understandingInput.required = Boolean(lesson.submission.understanding);
    understandingInput.minLength = lesson.submission.understanding ? 10 : 0;
    understanding.append(understandingLabel, element("p", "field-help", lesson.submission.understanding || "No additional answer is required for this mission."), understandingInput);
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
        const payload = { mission_id: lesson.id, checklist: {}, understanding: understandingInput.value };
        for (const field of lesson.submission.fields) {
          const input = document.getElementById(`evidence-${field.key}`);
          if (IMAGE_KEYS.has(field.key)) {
            const screenshot = input.files[0];
            if (!screenshot) throw new Error("Choose a current screenshot.");
            error.textContent = "Optimizing the screenshot automatically…";
            const prepared = await prepareScreenshot(screenshot);
            payload.screenshots = [{ name: prepared.name, mime_type: prepared.mime_type, data_url: prepared.data_url }];
          } else if (VIDEO_KEYS.has(field.key)) {
            const evidence = input.value.trim();
            if (!evidence) throw new Error("Add the current video link and what it proves.");
            payload.videos = [{ url_or_note: evidence }];
          } else {
            payload[field.key] = input.value;
          }
        }
        lesson.tests.forEach(test => { payload.checklist[test.id] = document.getElementById(`test-${test.id}`).checked; });
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
