# Nick // Worldmaker — Comprehensive Project Tracker

> **Tracking location:** This changing tracker is supporting narrative stored under `docs/tracking/`, not a permanent rule document. After the adopting pull request is merged, changing state is controlled by `data/state/Nick_Worldmaker_State_Record_v1.json`. This tracker remains supporting narrative and must not override that validated record.

**Updated:** 18 July 2026  
**Repository:** `KhunAlek/nick-worldmaker`  
**M8 merge result:** PR `#6` closed and squash-merged into `main` at `f2409a01ab4c3adb135c6b35ddc00b794d856642`.
**Approved PR head:** `c1ecb06c8085623bb9a7d2f563ec49fb33c25cca`
**Learner state:** M1–M3 approved; M4 is Nick's next genuine mission.  
**Release state:** M3–M7 released and live-passed; M8 remains unreleased pending the independent Sunday production release gates.
**18 July closure state:** M8 lesson and test-harness preparation completed, corrected learner lesson passed human beginner-usability review, PR #6 merged, and the automatic main audit passed; M8 remains unreleased and M9 remains untouched.

## Human review result

The first Saturday M8 candidate was technically complete but **failed human beginner-usability review**. The lesson did not give an 11-year-old first-time Roblox/Luau learner enough concrete guidance about where to look, what to open, what to type, what each line means, what should happen, and how to recover.

This was treated as a whole-lesson failure, not a small wording defect.

## Complete M8 beginner-usability rewrite

The learner-facing `V1-M08 — Walk to the Resource` lesson was rebuilt into twelve explicit stages:

1. find and repair the Wood and Stone TargetPoints;
2. open `ServerScriptService > WorldServer` and ask Roblox to calculate a route;
3. check `PathStatus.Success` before reading route points;
4. read and count the ordered waypoints;
5. move through each waypoint and use the `MoveToFinished` result;
6. handle `PathWaypointAction.Jump`;
7. run exact Wood and Stone Play tests;
8. create and remove `M8_TemporaryBlock` for a safe failure experiment;
9. separate map/TargetPoint, WorldServer, NPC anchoring, and plugin-noise symptoms;
10. prove Wood and Stone remain unchanged and forbid later-mission behavior;
11. show the four walking checks in child-readable language;
12. submit minimal current code, Explorer/Properties pictures, Output, videos, unchanged totals, and cleanup proof.

Ordinary ideas are explained before the technical terms `service`, `path`, `PathStatus.Success`, `waypoint`, `list`, `loop`, `return value`, `timeout`, and `PathWaypointAction.Jump`.

The browser candidate now provides M8-only short code panels, explanations under each block, visible stop-and-fix checkpoints, and child-facing proof and submission headings.


## Human beginner-usability approval

After the complete rewrite, Alex reviewed the corrected standalone M8 lesson.

Result: **PASSED**.

The corrected lesson is accepted as understandable enough for an intelligent 11-year-old who is new to Roblox Studio and Luau. This approval applies to the learner-facing lesson wording and structure only. It does not release M8 or replace the independent Sunday production release gates.

The final July 18 checklist records:

- every required preparation check completed;
- the corrected lesson passed automated verification;
- the corrected lesson passed human beginner-usability review;
- M8 remained unreleased;
- M9 was not started;
- Nick's real learner progress was unchanged.

## Permanent special rule — understandable instructions are mandatory

This project must never treat technically correct instructions as automatically suitable for Nick.

A lesson is **not ready for release** merely because:

- the code is correct;
- the automated tests pass;
- every canonical test ID is present;
- all required technical terms appear;
- the lesson follows the required stage headings;
- a developer can understand what the text means.

Every learner-facing instruction must be understandable and usable by Nick without Alex having to translate technical language, guess missing actions, or perform routine Studio work for him.

### Required writing standard

For every important action, the lesson must state:

1. **Where to look** — the exact Studio area, such as Explorer, Properties, Script Editor, Output, or the 3D world.
2. **What to open or select** — the exact object or script path.
3. **What to click, type, move, or change** — not an abstract task label.
4. **Why Nick is doing it** — in ordinary English before introducing the technical term.
5. **What should appear afterward** — in Explorer, Properties, the game world, the HUD, or Output.
6. **What must not happen** — including duplicate objects, wrong placement, red project-code errors, unwanted resource changes, or later-mission behavior.
7. **What to check when the result differs** — a concrete recovery action, not “debug the problem.”
8. **How to restore temporary experiments** — including removing temporary objects, prints, or test code.

### Forbidden instruction style

Do not use headings or commands such as these as complete instructions:

- “Identify the exact TargetPoint.”
- “Get PathfindingService.”
- “Check success.”
- “Read and follow the waypoints.”
- “Separate map problems from code problems.”
- “Return a clear result.”
- “Protect M9 work.”
- “Run canonical tests.”
- “Submit evidence.”

These phrases may appear only after the lesson has explained the actual action in child-readable language.

A stage heading such as **Understand**, **Do**, **Observe**, **Experiment**, **Fix**, or **Prove** is an organizer, not an instruction. The text beneath it must still tell Nick exactly what to do.

### Ordinary explanation before technical vocabulary

The lesson must explain the ordinary idea first and introduce the technical term second.

Examples:

- “Roblox tries to calculate a route around obstacles. This built-in tool is called `PathfindingService`.”
- “The route is divided into small destinations. Roblox calls them waypoints.”
- “Roblox reports whether it found a usable route. The code reads this report through `PathStatus.Success`.”
- “The function gives back `true` when the full walk succeeds and `false` when it must stop safely. This is the function’s return value.”

No new technical term should be required to understand the sentence that introduces it.

### Human-review rule

For challenging missions, automated content tests are necessary but not sufficient.

Before release, a human review must answer:

> Could Nick follow this lesson from beginning to end without repeated adult translation or unexplained technical assumptions?

If the answer is no, the lesson fails beginner usability even when all technical tests pass.

When a failure affects the whole teaching flow, the lesson must be rebuilt as a whole. It must not be treated as a minor wording polish task.

### Evidence and submission wording

Submission instructions must describe exactly what Nick should capture or provide. Avoid evaluator language such as “canonical evidence,” “hierarchy evidence,” or “proof mapping” in the learner-facing lesson.

Prefer:

- “Take one screenshot with these Explorer folders expanded.”
- “Copy the current Output lines from this Play test.”
- “Record a short video showing the NPC walk to Wood.”
- “Show that Wood and Stone totals did not increase.”
- “Remove the temporary obstacle before taking the final screenshot.”

The evidence process must prove the mission without becoming repetitive clerical work.

### Release consequence

A mission with unclear instructions must remain unreleased.

Beginner-usability failure is a release blocker equal to:

- failing code;
- incorrect evaluator behavior;
- broken unlock logic;
- missing acceptance tests;
- unsafe changes to Nick's learner progress.


## PR #6 merged file scope

PR #6 changed exactly these ten files. This authoritative tracker was not changed by PR #6:

- `.github/workflows/release-audit.yml`
- `assets/js/mission-lesson-m08-walk-to-resource.js`
- `assets/js/mission-lesson-m08-steps-a.js`
- `assets/js/mission-lesson-m08-steps-b.js`
- `assets/js/mission-lesson-m08-finish.js`
- `assets/js/mission-m08-beginner-render.js`
- `assets/js/missions-data.js`
- `review/V1-M08-sanitized-lesson-review.html`
- `tests/fixtures/V1-M08-controlled-fixtures.json`
- `tests/m08-lesson-contract.mjs`

## Verification completed

```json
{
  "syntax": "PASS",
  "stages": 12,
  "registry": "PASS",
  "evidence_mapping": "PASS",
  "renderer": "PASS",
  "m9_untouched": "PASS"
}
```

Verification covered JavaScript syntax, the complete twelve-stage lesson, exact M8 mission/test IDs, object paths, beginner explanations, failure setup and cleanup, no resource award, sanitized review mapping, and the M8/M9 boundary.

## Verified merge and automatic repository runs

PR #6 is closed and squash-merged.

- approved PR head: `c1ecb06c8085623bb9a7d2f563ec49fb33c25cca`;
- exact main merge commit: `f2409a01ab4c3adb135c6b35ddc00b794d856642`;
- automatic main audit run `29630572145`: **PASSED**;
- audit commands: `node tests/release-audit.mjs` and `node tests/m08-lesson-contract.mjs`;
- automatic GitHub Pages build and deployment run `29630571746`: **PASSED**.

The Pages deployment records that GitHub published the merged repository source. It is separate from mission release and production live-pass. Because the release manifest remained unchanged at M3–M7, M8 did not become a released learner mission.

The earlier preparation commits below remain useful provenance for the human-approved candidate:

Important correction commits include:

- `1f9ccbbed180edb199529a5086c2656d4b55ea6e` — beginner M8 core;
- `0978652f30cce5dd5c1ecdf262651172f0aaa1e4` — stages 1–6;
- `1e1f2b56ef7bb576a653d783ac670ccf70774752` — stages 7–12;
- `791d403aba4f3042befeb69c32c2a884d448053c` — proof and submission guidance;
- `270a55e4f9d478ecaaf0e08bbcf3d6242d0067a7` — M8 visual beginner renderer;
- `4ef7601e45a0cba84be6a3a0c9b81dcb911a2544` — complete source loading;
- `b9a7e52c22330d86edc6f453a9710d142d9d0a2a` — expanded automated tests;
- `a0a7068d47b3489ba17898fafd9f35e7448075a1` — rebuilt sanitized review;
- `bc6e271f66117fd1054af1175ef5f4bd40107c28` — final tracker update.

## Scope and safety confirmation

- The approved M8 candidate is merged into `main`.
- M8 remains **unreleased and not live-passed**.
- The release manifest was not promoted.
- M3–M7 release state was preserved.
- Nick's learner progress was not accessed or changed.
- No test account, learner login, D1 query, production fixture, or Roblox Studio runtime test was used.
- Automatic GitHub Pages run `29630571746` deployed the merged repository source, but did not release or live-pass M8 because the manifest still exposes only M3–M7.
- No production entrypoint, release-test access, pilot setting, wrapper, or learner record was manually changed.
- M9 was not started.

## Still pending for Sunday

The full isolated sequential production release gates, evaluator-status mapping, exact M9-only unlock proof, real-family protection proof, cleanup, and retained release evidence remain pending.

## 18 July 2026 formal closure

The July 18 preparation day is formally closed as **COMPLETED**.

Completed:

- M8 learner lesson and test harness prepared;
- original whole-lesson beginner-usability failure recorded;
- complete 12-stage learner lesson rewrite implemented;
- automated lesson, registry, evidence-mapping, rendering, and M8/M9-boundary verification passed;
- corrected sanitized lesson reviewed by Alex;
- human beginner-usability verdict: **PASS**;
- tracker and checklist updated;
- approved candidate squash-merged through PR #6;
- automatic main audit passed both the repository audit and focused M8 contract test;
- automatic Pages build and deployment passed without changing the M8 release boundary.

Not performed:

- M8 was not released or live-passed;
- release manifest was not promoted;
- Sunday production release gates were not run;
- M9 was not started;
- Nick's genuine learner progress was not accessed or changed.

## Formal status

**Original M8 learner lesson: FAILED beginner-usability review.**  
**Complete M8 beginner-usability rewrite: IMPLEMENTED, SOURCE-VERIFIED, AND HUMAN-APPROVED.**  
**M8 implementation: MERGED INTO MAIN AT `f2409a01ab4c3adb135c6b35ddc00b794d856642`.**
**18 July preparation day: COMPLETE AND FORMALLY CLOSED.**  
**M8 release/live-pass: PENDING INDEPENDENT SUNDAY GATES.**  
**M9: NOT STARTED.**  
**Nick's learner progress: UNCHANGED.**
