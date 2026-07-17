(function () {
  "use strict";

  const MISSION_ID = "V1-M03";
  const API = "https://nick-worldmaker-api.abystrov66.workers.dev";
  const MAX_SOURCE_IMAGE_BYTES = 5 * 1024 * 1024;
  const TARGET_IMAGE_BYTES = 105 * 1024;
  const MAX_IMAGE_DIMENSION = 1600;
  const PROPERTY_CHECKS = [
    ["npc1PrimaryPart", "NPC_1 PrimaryPart is HumanoidRootPart."],
    ["npc2PrimaryPart", "NPC_2 PrimaryPart is HumanoidRootPart."],
    ["npc1Anchored", "NPC_1_Home has Anchored turned on."],
    ["npc1CanCollide", "NPC_1_Home has CanCollide turned off."],
    ["npc1Transparency", "NPC_1_Home has Transparency set to 1."],
    ["npc2Anchored", "NPC_2_Home has Anchored turned on."],
    ["npc2CanCollide", "NPC_2_Home has CanCollide turned off."],
    ["npc2Transparency", "NPC_2_Home has Transparency set to 1."]
  ];

  function simplifyLesson(lesson) {
    if (!lesson || lesson.id !== MISSION_ID) return lesson;
    const proveStep = lesson.steps.find(step => String(step.title).startsWith("Prove —"));
    if (proveStep) {
      proveStep.actions = [
        "After the successful ten-second Play test, take one screenshot showing NPC_1 and NPC_2 standing separately on the island.",
        "Stop Play. In Explorer, expand World > NPCs, NPC_1, NPC_2, and World > NPCHomes. Take one screenshot where those names are readable.",
        "Use the guided checkboxes in the form while you select NPC_1, NPC_2, NPC_1_Home, and NPC_2_Home in Properties. You do not need to retype the property names or values.",
        "Write one short sentence confirming that NPC_1_Home is under NPC_1's start and NPC_2_Home is under NPC_2's start.",
        "Paste Output from the successful current Play run, tick only the tests you completed, answer the short question, and send the mission once."
      ];
      proveStep.checkpoint = "Two current screenshots, the guided property checks, the placement sentence, Output, and the test boxes all describe the same final saved version.";
      proveStep.recovery = "If the Explorer names do not fit, make Explorer wider and collapse unrelated folders. Do not replace the screenshots with manually typed object lists.";
    }
    lesson.submission.fields = [
      { key: "play_screenshot", label: "Play-test screenshot", help: "Show both settlers upright, separate, and standing on the island during the final Play test." },
      { key: "explorer_screenshot", label: "Explorer screenshot", help: "After Stop, show World > NPCs with NPC_1 and NPC_2 expanded, and World > NPCHomes with both exact marker names." },
      { key: "home_marker_checklist", label: "Guided Properties check", help: "Select each named object in Studio and tick the matching line. No property retyping is needed." },
      { key: "placement_confirmation", label: "Marker placement confirmation", help: "Use one short sentence: which home marker is under which NPC start?" },
      { key: "output", label: "Current Output", help: "Paste Output from the same successful ten-second Play test." }
    ];
    return lesson;
  }

  function buildPayload(values) {
    const checks = values.propertyChecks || {};
    const missing = PROPERTY_CHECKS.filter(([key]) => checks[key] !== true).map(([, label]) => label);
    if (missing.length) throw new Error("Complete every guided Properties check before sending.");
    const placement = String(values.placementConfirmation || "").trim();
    if (placement.length < 12) throw new Error("Add one short sentence confirming which marker is under each NPC start.");
    return {
      mission_id: MISSION_ID,
      explorer_summary: "Current Explorer screenshot attached: Workspace > World > NPCs contains NPC_1 and NPC_2, and Workspace > World > NPCHomes contains NPC_1_Home and NPC_2_Home.",
      properties: "Guided Properties checklist confirmed: NPC_1 PrimaryPart=HumanoidRootPart; NPC_2 PrimaryPart=HumanoidRootPart; NPC_1_Home Anchored=true, CanCollide=false, Transparency=1; NPC_2_Home Anchored=true, CanCollide=false, Transparency=1. Placement confirmation: " + placement,
      output: String(values.output || "").trim(),
      screenshots: [
        { ...values.playScreenshot, evidence_type: "play_test" },
        { ...values.explorerScreenshot, evidence_type: "explorer_hierarchy" }
      ],
      checklist: {
        "V1-M03-T01": Boolean(values.tests && values.tests["V1-M03-T01"]),
        "V1-M03-T02": Boolean(values.tests && values.tests["V1-M03-T02"]),
        "V1-M03-T03": Boolean(values.tests && values.tests["V1-M03-T03"])
      },
      understanding: String(values.understanding || "").trim()
    };
  }

  const api = { simplifyLesson, buildPayload, PROPERTY_CHECKS };
  if (typeof window !== "undefined") window.WORLDMAKER_M03_EVIDENCE = api;
  if (typeof document === "undefined" || typeof window === "undefined") return;

  simplifyLesson(window.WORLDMAKER_LESSONS && window.WORLDMAKER_LESSONS[MISSION_ID]);

  function token() { return sessionStorage.getItem("worldmaker_token_learner"); }
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }
  function canvasToBlob(canvas, type, quality) {
    return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("The browser could not prepare this screenshot.")), type, quality));
  }
  async function fileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
  async function loadImage(file) {
    const url = URL.createObjectURL(file);
    try {
      const image = new Image();
      image.decoding = "async";
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = () => reject(new Error("This screenshot could not be opened. Save it as PNG or JPG and try again."));
        image.src = url;
      });
      return image;
    } finally { URL.revokeObjectURL(url); }
  }
  async function prepareScreenshot(file) {
    if (!file || !/^image\/(png|jpeg|webp)$/.test(file.type)) throw new Error("Choose a PNG, JPG, or WebP screenshot.");
    if (file.size > MAX_SOURCE_IMAGE_BYTES) throw new Error("A screenshot is over 5 MB. Save a smaller screenshot and choose it again.");
    const image = await loadImage(file);
    let scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight));
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext("2d", { alpha: false });
      context.fillStyle = "#fff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      for (const quality of [0.86, 0.72, 0.58, 0.44, 0.34]) {
        const blob = await canvasToBlob(canvas, "image/webp", quality);
        if (blob.size <= TARGET_IMAGE_BYTES) return { name: file.name.replace(/\.[^.]+$/, "") + "-optimized.webp", mime_type: "image/webp", data_url: await fileAsDataUrl(blob) };
      }
      scale *= 0.8;
    }
    throw new Error("A screenshot contains too much detail. Capture only the Roblox Studio window and try again.");
  }
  function uploadField(id, labelText, help) {
    const wrap = el("div", "field");
    const label = el("label", "", labelText);
    label.htmlFor = id;
    const input = el("input");
    input.id = id;
    input.type = "file";
    input.accept = "image/png,image/jpeg,image/webp";
    input.required = true;
    wrap.append(label, input, el("p", "field-help", help));
    return wrap;
  }

  function replaceForm(form) {
    if (!form || form.dataset.m03Simplified === "true") return;
    const replacement = el("form", "form-grid");
    replacement.id = "registry-mission-form";
    replacement.dataset.m03Simplified = "true";
    replacement.appendChild(el("h2", "", "Send current evidence"));
    replacement.appendChild(uploadField("m3-play-image", "1. Play-test screenshot", "Show both settlers upright and separate during the final Play test."));
    replacement.appendChild(uploadField("m3-explorer-image", "2. Explorer screenshot", "After Stop, expand NPCs and NPCHomes so all exact names are readable."));

    const propertySet = el("fieldset");
    propertySet.appendChild(el("legend", "", "3. Check the exact Properties in Studio"));
    PROPERTY_CHECKS.forEach(([key, labelText]) => {
      const label = el("label", "check-row");
      const input = el("input");
      input.type = "checkbox";
      input.id = "m3-property-" + key;
      label.append(input, el("span", "", labelText));
      propertySet.appendChild(label);
    });
    replacement.appendChild(propertySet);

    const placement = el("div", "field");
    const placementLabel = el("label", "", "4. One short placement confirmation");
    placementLabel.htmlFor = "m3-placement";
    const placementInput = el("input");
    placementInput.id = "m3-placement";
    placementInput.required = true;
    placementInput.minLength = 12;
    placementInput.maxLength = 240;
    placementInput.placeholder = "NPC_1_Home is under NPC_1; NPC_2_Home is under NPC_2.";
    placement.append(placementLabel, placementInput);
    replacement.appendChild(placement);

    const output = el("div", "field");
    const outputLabel = el("label", "", "5. Current Output");
    outputLabel.htmlFor = "m3-output";
    const outputInput = el("textarea");
    outputInput.id = "m3-output";
    outputInput.required = true;
    output.append(outputLabel, outputInput, el("p", "field-help", "Paste Output from the same successful ten-second Play test."));
    replacement.appendChild(output);

    const tests = el("fieldset");
    tests.appendChild(el("legend", "", "6. Confirm only the tests you actually ran"));
    [["V1-M03-T01", "Two valid rigs"], ["V1-M03-T02", "Stable play"], ["V1-M03-T03", "Home markers"]].forEach(([id, name]) => {
      const label = el("label", "check-row");
      const input = el("input");
      input.type = "checkbox";
      input.id = "m3-test-" + id;
      label.append(input, el("span", "", id + " — " + name));
      tests.appendChild(label);
    });
    replacement.appendChild(tests);

    const understanding = el("div", "field");
    const understandingLabel = el("label", "", "7. Quick understanding");
    understandingLabel.htmlFor = "m3-understanding";
    const understandingInput = el("textarea");
    understandingInput.id = "m3-understanding";
    understandingInput.required = true;
    understandingInput.minLength = 10;
    understanding.append(understandingLabel, el("p", "field-help", "Why must you move and duplicate the complete NPC Model instead of one body part?"), understandingInput);
    replacement.appendChild(understanding);

    const error = el("p", "muted");
    error.id = "m3-simplified-error";
    error.setAttribute("aria-live", "polite");
    const button = el("button", "button button-primary", "Send V1-M03 for review");
    button.type = "submit";
    replacement.append(error, button);

    replacement.addEventListener("submit", async event => {
      event.preventDefault();
      button.disabled = true;
      error.textContent = "Preparing both screenshots…";
      try {
        const propertyChecks = {};
        PROPERTY_CHECKS.forEach(([key]) => { propertyChecks[key] = document.getElementById("m3-property-" + key).checked; });
        const [playScreenshot, explorerScreenshot] = await Promise.all([
          prepareScreenshot(document.getElementById("m3-play-image").files[0]),
          prepareScreenshot(document.getElementById("m3-explorer-image").files[0])
        ]);
        const testValues = {};
        ["V1-M03-T01", "V1-M03-T02", "V1-M03-T03"].forEach(id => { testValues[id] = document.getElementById("m3-test-" + id).checked; });
        const payload = buildPayload({ propertyChecks, placementConfirmation: placementInput.value, output: outputInput.value, playScreenshot, explorerScreenshot, tests: testValues, understanding: understandingInput.value });
        error.textContent = "The evaluator is reviewing the evidence…";
        const response = await fetch(API + "/api/missions/V1-M03/submissions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: "Bearer " + token() },
          body: JSON.stringify(payload)
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.detail || data.error || "The evaluator request failed.");
        error.textContent = data.review && data.review.headline ? data.review.headline : "Review saved.";
        location.reload();
      } catch (problem) {
        error.textContent = problem.message;
      } finally { button.disabled = false; }
    });

    form.replaceWith(replacement);
  }

  function scan() {
    if (new URLSearchParams(location.search).get("id") !== MISSION_ID) return;
    replaceForm(document.getElementById("registry-mission-form"));
  }
  const observer = new MutationObserver(scan);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener("DOMContentLoaded", scan);
})();
