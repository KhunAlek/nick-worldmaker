# Nick // Worldmaker — Comprehensive Project Tracker

**Updated:** 18 July 2026  
**Repository:** `KhunAlek/nick-worldmaker`  
**Learner state:** M1–M3 approved; M4 is Nick's next genuine mission.  
**Release state:** M3–M7 released and live-passed; M8 remains unreleased.  

## Saturday M8 candidate

`V1-M08 — Walk to the Resource` is prepared as a release-ready candidate. It is **not released, promoted, or live-passed**. M9 has not been started.

### Complete

- Beginner lesson follows Understand → Do → Observe → Experiment → Fix → Prove.
- Exact paths for NPCs, resources, TargetPoints, RemoteEvents, GameState, WorldServer, and CommandClient are included.
- Pathfinding is split into bounded stages: target selection, PathfindingService, protected computation, success check, waypoint reading, ordered movement, jump handling, MoveToFinished failure handling, and boolean success/failure return.
- Map, code, NPC anchoring, and unrelated plugin-noise problems are distinguished.
- Expected Wood success, Stone success, blocked-path failure, and waypoint-timeout Output are included.
- M8 explicitly moves NPCs without awarding Wood or Stone, adding return-home work, or introducing permanent busy state.
- Minimal evidence permits one clearly labelled combined video rather than repetitive transcription.
- Deterministic lesson-contract test and controlled fixture definitions are source-controlled.
- Sanitized exact-source HTML review is source-controlled and requires no login or learner data.

### Source validation

Passed locally:

- JavaScript syntax;
- exact `V1-M08-T01`–`V1-M08-T04` IDs;
- required beginner sequence;
- required recovery topics;
- M8/M9 boundary.

### Pending Sunday release gates

- Run the complete isolated sequential production workflow.
- Prove evaluator mapping: missing failure proof → `NEEDS_EVIDENCE`; proven code failure → `NEEDS_FIX`; complete current success/failure proof → `APPROVED`.
- Prove exact-next unlock is M9 only in an isolated family.
- Prove Nick's real M1–M3 approvals and M4 unlock remain unchanged.
- Remove all temporary fixtures, test access, records, wrappers, pilot configuration, and entrypoint changes.
- Inspect retained workflow evidence before marking M8 released/live-passed.

## Formal status

**M8 candidate prepared and source-validated.**  
**M8 release/live-pass pending Sunday gates.**  
**M9 not started.**
