# Nick // Worldmaker — Comprehensive Project Tracker

**Updated:** 18 July 2026  
**Repository:** `KhunAlek/nick-worldmaker`  
**Working branch:** `agent/prepare-v1-m08-saturday`  
**Draft PR:** `#6`  
**Learner state:** M1–M3 approved; M4 is Nick's next genuine mission.  
**Release state:** M3–M7 released and live-passed; M8 remains unreleased.  

## Human review result

The first Saturday M8 candidate was technically complete but **failed human beginner-usability review**. The lesson used technically correct headings and terminology without giving an 11-year-old first-time Roblox/Luau learner enough concrete guidance about where to look, what to open, what to type, what each line means, what should happen, and how to recover.

This was treated as a whole-lesson failure, not a small wording defect.

## Complete M8 beginner-usability rewrite

The exact learner-facing `V1-M08 — Walk to the Resource` source was rebuilt into twelve explicit stages:

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

The browser candidate now adds M8-only visual teaching support:

- short code panels;
- explanations directly below each code panel;
- visible stop-and-fix checkpoints;
- child-facing proof and submission headings;
- no change to older mission rendering.

## Changed files

- `assets/js/mission-lesson-m08-walk-to-resource.js` — M8 core lesson metadata and explained concepts.
- `assets/js/mission-lesson-m08-steps-a.js` — beginner stages 1–6.
- `assets/js/mission-lesson-m08-steps-b.js` — beginner stages 7–12.
- `assets/js/mission-lesson-m08-finish.js` — child-facing proof checks and submission guidance.
- `assets/js/mission-m08-beginner-render.js` — M8-only code panels, headings, and visual checkpoints.
- `assets/js/missions-data.js` — loads the complete split M8 source and M8 renderer in order.
- `review/V1-M08-sanitized-lesson-review.html` — sanitized review generated from the exact split M8 source; no login, API, or learner-data access.
- `tests/m08-lesson-contract.mjs` — expanded lesson, registry, evidence-mapping, renderer, sanitized-review, and M8/M9 boundary checks.
- this tracker.

## Verification completed

Local source verification passed:

- JavaScript syntax for the M8 core, both stage files, finish file, and M8 renderer;
- exactly twelve learner stages with no missing or repeated stage section;
- exact mission ID `V1-M08`;
- exact test IDs `V1-M08-T01` through `V1-M08-T04` and unchanged canonical meaning;
- required object paths and beginner explanations;
- safe blocked-path setup and cleanup wording;
- Wood/Stone no-award boundary;
- child-facing proof and submission wording;
- sanitized review source mapping;
- no M9 content or functionality.

Result summary:

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

## Correction commits

The rewrite was pushed to the existing M8 branch through commits including:

- `1f9ccbbed180edb199529a5086c2656d4b55ea6e` — replace the original M8 learner source with the beginner core;
- `0978652f30cce5dd5c1ecdf262651172f0aaa1e4` — add stages 1–6;
- `1e1f2b56ef7bb576a653d783ac670ccf70774752` — add stages 7–12;
- `791d403aba4f3042befeb69c32c2a884d448053c` — add child-facing proof and submission guidance;
- `270a55e4f9d478ecaaf0e08bbcf3d6242d0067a7` — add M8 visual beginner rendering;
- `4ef7601e45a0cba84be6a3a0c9b81dcb911a2544` — load the complete corrected lesson;
- `b9a7e52c22330d86edc6f453a9710d142d9d0a2a` — strengthen automated tests;
- `a0a7068d47b3489ba17898fafd9f35e7448075a1` — rebuild the sanitized review.

## Scope and safety confirmation

- M8 remains **unreleased and not live-passed**.
- The release manifest was not promoted.
- M3–M7 release state was not changed.
- Nick's learner progress was not accessed or changed.
- No test account, learner login, D1 query, production fixture, or Roblox Studio runtime test was used.
- No production entrypoint, temporary release access, pilot setting, wrapper, or learner record was changed.
- M9 was not started.

## Still pending for the Sunday release run

- execute and retain the full isolated sequential production release gates;
- prove `NEEDS_EVIDENCE`, `NEEDS_FIX`, and `APPROVED` evaluator mapping;
- prove exact-next unlock is M9 only in an isolated family;
- prove Nick's real M1–M3 approvals and M4 unlock remain unchanged;
- clean every temporary release fixture and restore production configuration;
- inspect retained evidence before promotion.

## Formal status

**Original M8 learner lesson: FAILED beginner-usability review.**  
**Complete M8 beginner-usability rewrite: IMPLEMENTED AND SOURCE-VERIFIED.**  
**M8 release/live-pass: PENDING INDEPENDENT SUNDAY GATES.**  
**M9: NOT STARTED.**
