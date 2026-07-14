(function(){
  "use strict";

  function enhanceMission2() {
    const params = new URLSearchParams(location.search);
    if (document.body.dataset.page !== "mission" || params.get("id") !== "V1-M02") return false;

    const form = document.getElementById("mission2-form");
    const panel = document.getElementById("later-mission-panel");
    if (!form || !panel) return false;
    if (document.getElementById("mission2-beginner-lesson")) return true;

    document.querySelectorAll("[data-local-notice]").forEach(function(el){
      el.textContent = "Shared backend active. Your mission progress and reviews are saved centrally and can be opened from another browser or device.";
    });

    const lesson = document.createElement("div");
    lesson.id = "mission2-beginner-lesson";
    lesson.className = "lesson-path section";
    lesson.innerHTML = `
      <section class="card mission-header">
        <div class="eyebrow">Mission 2 · Build first, submit after testing</div>
        <h1>Build the Island</h1>
        <p class="lead">Turn the empty Baseplate into a small settlement area where the player can spawn, walk, and reach both future resource zones.</p>
        <div class="lesson-goal">
          <div><strong>Visible result</strong><br>The player appears safely on a compact island with a clear BuildSite and open walking routes.</div>
          <div><strong>Starting point</strong><br>Mission 1 is approved. The <code>World</code> and <code>Ground</code> folders already exist.</div>
        </div>
      </section>

      <section class="card content-card lesson-part">
        <div class="eyebrow">Before you touch anything</div>
        <h2>Open the correct place</h2>
        <ol>
          <li>Open the same Roblox Studio project you used for Mission 1.</li>
          <li>In Explorer, expand <code>Workspace</code>.</li>
          <li>Expand <code>World</code>.</li>
          <li>Expand the empty folder named <code>Ground</code>.</li>
        </ol>
        <div class="checkpoint"><strong>Stop and check:</strong> you can see <code>Workspace → World → Ground</code>. Do not create anything outside <code>World</code> in this mission.</div>
      </section>

      <details class="step-card" open>
        <summary>Step 1 — Make the main ground</summary>
        <div class="step-body">
          <ol>
            <li>Move the mouse over the <code>Ground</code> folder and click its small <strong>+</strong>.</li>
            <li>Choose <strong>Part</strong>.</li>
            <li>Rename the new Part exactly <code>MainGround</code>.</li>
            <li>Select <code>MainGround</code>.</li>
            <li>In Properties, set <strong>Anchored</strong> to <strong>true</strong>.</li>
            <li>Use the Scale tool to make a compact platform large enough to walk around, but small enough to see most of it on screen.</li>
            <li>Move it so its top surface is easy to stand on.</li>
          </ol>
          <div class="checkpoint"><strong>Stop and check:</strong> <code>MainGround</code> is directly inside <code>Ground</code>, and Anchored is checked.</div>
        </div>
      </details>

      <details class="step-card">
        <summary>Step 2 — Add the player spawn</summary>
        <div class="step-body">
          <ol>
            <li>In Explorer, move the mouse over <code>World</code> and click <strong>+</strong>.</li>
            <li>Choose <strong>SpawnLocation</strong>.</li>
            <li>Rename it exactly <code>PlayerSpawn</code>.</li>
            <li>Move <code>PlayerSpawn</code> onto the top of <code>MainGround</code>, near one side of the island.</li>
            <li>Make sure it is not hanging over an edge and is not inside another Part.</li>
            <li>In Properties, confirm <strong>Anchored</strong> is true.</li>
          </ol>
          <div class="checkpoint"><strong>Stop and check:</strong><pre class="mini-code">Workspace
└── World
    ├── Ground
    │   └── MainGround
    └── PlayerSpawn</pre></div>
        </div>
      </details>

      <details class="step-card">
        <summary>Step 3 — Create the BuildSite</summary>
        <div class="step-body">
          <ol>
            <li>Move the mouse over <code>World</code> and click <strong>+</strong>.</li>
            <li>Choose <strong>Part</strong>.</li>
            <li>Rename it exactly <code>BuildSite</code>.</li>
            <li>Move it onto the middle area of <code>MainGround</code>.</li>
            <li>Scale it into a flat marker. Keep it low enough that the player can walk across or around it.</li>
            <li>In Properties, set <strong>Anchored</strong> to true.</li>
            <li>Choose a colour that makes it easy to recognise.</li>
          </ol>
          <div class="checkpoint"><strong>Important:</strong> <code>BuildSite</code> must be directly under <code>World</code>. Do not put it inside <code>Ground</code> or <code>Buildings</code>.</div>
        </div>
      </details>

      <details class="step-card">
        <summary>Step 4 — Leave two future resource areas</summary>
        <div class="step-body">
          <ol>
            <li>Look at the island from above.</li>
            <li>Choose one open area for a future wood resource.</li>
            <li>Choose a different open area for a future stone resource.</li>
            <li>Keep both areas reachable from the centre.</li>
            <li>Do not add WoodNode or StoneNode yet. Those belong to Mission 5.</li>
          </ol>
          <div class="checkpoint"><strong>Stop and check:</strong> there is room for two settlers near the centre and two separate future resource zones.</div>
        </div>
      </details>

      <details class="step-card">
        <summary>Step 5 — Add one obstacle with a route around it</summary>
        <div class="step-body">
          <ol>
            <li>Inside <code>Ground</code>, create one more <strong>Part</strong>.</li>
            <li>Rename it exactly <code>Obstacle</code>.</li>
            <li>Set <strong>Anchored</strong> to true.</li>
            <li>Place it between the centre and one future resource area.</li>
            <li>Keep enough empty space on at least one side for a player and a future NPC to walk around it.</li>
          </ol>
          <div class="checkpoint"><strong>Wrong:</strong> a wall that blocks the full width of the island. <strong>Correct:</strong> an obstacle that forces a turn but still leaves a clear route.</div>
        </div>
      </details>

      <details class="step-card">
        <summary>Step 6 — Check every important object</summary>
        <div class="step-body">
          <p>Select each object and check Properties one at a time.</p>
          <div class="screen-check">
            <label><input type="checkbox"><span><code>MainGround</code> is inside <code>World → Ground</code> and Anchored is true.</span></label>
            <label><input type="checkbox"><span><code>Obstacle</code> is inside <code>World → Ground</code> and Anchored is true.</span></label>
            <label><input type="checkbox"><span><code>PlayerSpawn</code> is directly under <code>World</code>, on safe ground, and Anchored is true.</span></label>
            <label><input type="checkbox"><span><code>BuildSite</code> is directly under <code>World</code>, is flat, and Anchored is true.</span></label>
          </div>
          <div class="checkpoint"><strong>Expected Explorer shape:</strong><pre class="mini-code">Workspace
└── World
    ├── Ground
    │   ├── MainGround
    │   └── Obstacle
    ├── PlayerSpawn
    ├── BuildSite
    ├── NPCs
    ├── NPCHomes
    ├── Resources
    └── Buildings</pre></div>
        </div>
      </details>

      <details class="step-card">
        <summary>Step 7 — Check for unwanted scripts</summary>
        <div class="step-body">
          <ol>
            <li>Use the Explorer search box and search for <code>Script</code>.</li>
            <li>Keep your approved <code>ServerScriptService → WorldServer</code>.</li>
            <li>If you inserted any Toolbox model, expand it completely.</li>
            <li>Remove any unknown Script, LocalScript, or ModuleScript inside imported decoration.</li>
            <li>Clear the Explorer search box.</li>
          </ol>
          <div class="checkpoint"><strong>Safety rule:</strong> do not keep free-model code you cannot explain. Simple Parts made by you are safest.</div>
        </div>
      </details>

      <section class="card content-card lesson-part">
        <div class="eyebrow">Final proof</div>
        <h2>Run the three exact tests</h2>

        <article class="test-card">
          <strong>V1-M02-T01 — Safe spawn</strong>
          <dl><dt>Setup</dt><dd>Stop any old Play session.</dd><dt>Action</dt><dd>Press Play and wait for the character to appear.</dd><dt>Expected</dt><dd>The character stands on solid ground and can move without immediately falling.</dd></dl>
        </article>

        <article class="test-card">
          <strong>V1-M02-T02 — World stays put</strong>
          <dl><dt>Setup</dt><dd>Stay in the same Play session for several seconds.</dd><dt>Action</dt><dd>Walk across the island and around the BuildSite.</dd><dt>Expected</dt><dd>MainGround, Obstacle, PlayerSpawn, and BuildSite do not fall, tip, or drift.</dd></dl>
        </article>

        <article class="test-card">
          <strong>V1-M02-T03 — Route exists</strong>
          <dl><dt>Setup</dt><dd>Remain in Play mode.</dd><dt>Action</dt><dd>Walk from the centre around the obstacle toward both future resource areas.</dd><dt>Expected</dt><dd>At least one clear walking route reaches each area.</dd></dl>
        </article>

        <div class="checkpoint"><strong>Capture the screenshot now:</strong> while still in Play mode, take one clear screenshot showing the player, most of the island, PlayerSpawn, BuildSite, and the obstacle. Then press Stop.</div>
      </section>

      <section class="card content-card lesson-part">
        <div class="eyebrow">Before submitting</div>
        <h2>Fix these common mistakes first</h2>
        <ul>
          <li>Any ground or obstacle Part has Anchored turned off.</li>
          <li><code>BuildSite</code> is inside <code>Ground</code> instead of directly under <code>World</code>.</li>
          <li><code>PlayerSpawn</code> is over an edge, buried in another Part, or named incorrectly.</li>
          <li>The obstacle blocks every route to one side.</li>
          <li>An imported model contains an unknown executable script.</li>
          <li>The screenshot was taken before the latest change.</li>
        </ul>
      </section>

      <section class="card content-card">
        <h2>Need help?</h2>
        <div class="recovery-grid">
          <details><summary>The ground falls when I press Play</summary><p>Stop Play, select each ground Part, and set Anchored to true in Properties.</p></details>
          <details><summary>I spawn beside or under the island</summary><p>Stop Play, move PlayerSpawn onto the top surface of MainGround, and keep it away from the edge.</p></details>
          <details><summary>I cannot walk to one resource area</summary><p>Move or shrink the obstacle until a wide route remains around at least one side.</p></details>
          <details><summary>I cannot find BuildSite in the correct place</summary><p>Drag BuildSite directly onto World in Explorer. It should line up with PlayerSpawn, Ground, NPCs, and the other World folders.</p></details>
        </div>
      </section>
    `;

    panel.parentNode.insertBefore(lesson, panel);
    panel.classList.add("form-card");
    const heading = panel.querySelector("h1");
    if (heading) heading.textContent = "Submit Mission 2 evidence";
    const summary = panel.querySelector(".lead");
    if (summary) summary.textContent = "Submit only after all three tests pass in the current Studio version.";
    const message = document.getElementById("later-message");
    if (message) message.textContent = "The evaluator checks your current screenshot, Explorer summary, Output, test confirmations, and short answer. Only an approved review unlocks Mission 3.";

    return true;
  }

  document.addEventListener("DOMContentLoaded", function(){
    let tries = 0;
    const timer = setInterval(function(){
      tries += 1;
      if (enhanceMission2() || tries > 100) clearInterval(timer);
    }, 100);
  });
})();