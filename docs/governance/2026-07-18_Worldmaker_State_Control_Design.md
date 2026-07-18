# Nick // Worldmaker — State Control Design

**Draft date:** 18 July 2026  
**Status:** Draft for human review; not active repository policy  
**Repository inspected:** `KhunAlek/nick-worldmaker`  
**Inspected main commit:** `5ddd4c2`  

## 1. Purpose

`data/state/Nick_Worldmaker_State_Record_v1.json` is the single proposed authority for Worldmaker facts that change over time. It prevents release preparation, automated tests, human lesson review, deployment work, and isolated test approvals from being mistaken for Nick's genuine progress. Its `active` status becomes effective on `main` only when the adopting pull request is merged; presence on an unmerged branch has no authority over `main`.

The record is descriptive only. Reading or editing it does not release, unlock, merge, deploy, approve, or advance anything. Each real-world transition must happen through its authorized system and must be supported by evidence before the record is updated.

## 2. State kept in the record

The record keeps these dimensions separate for every mission:

1. Nick's genuine learner progress;
2. genuine learner unlock state;
3. implementation state;
4. technical-test state;
5. human beginner-usability review state;
6. release state;
7. production live-pass state.

It also records active branch or pull-request preparation, current blockers, required next actions, unresolved facts, evidence sources, and append-only update history.

## 3. Permanent rules kept outside the record

The future `AGENTS.md` and the canonical permanent documents under `docs/governance/permanent/` should hold stable rules: project purpose; Nick's ownership; fixed M01–M15 order; canonical architecture, names, constants, tests and evaluator rules; beginner-writing requirements; authority order; security; and the prohibition on changing genuine learner state during testing.

They must not contain the current completed mission, next mission, released set, live-passed set, active branch, active PR, workflow run, current blocker, or current deployment identity. Those facts change and belong here.

## 4. Conflict authority

For permanent rules, use this order:

1. Project Charter and Canonical Contract;
2. Version 1 Mission Contracts;
3. Version 1 Acceptance Test Specification;
4. AI Evaluator Policy and Mission Rubrics;
5. AI Evaluator Response Schema;
6. Beginner Lesson and Evidence Standard.

For changing state, use this order:

1. genuine learner approval and progress evidence from Nick's real production family, for learner completion and unlock only;
2. the production release manifest plus retained successful release evidence, for release and live-pass only;
3. merged repository source at the recorded main commit, for merged implementation only;
4. branch/PR evidence, for preparation outside main only;
5. dated human-review evidence, for beginner-usability approval only;
6. the current state record after evidence reconciliation;
7. trackers and reports as supporting or historical evidence.

No source controls a dimension outside its scope. In particular, the release manifest cannot prove learner completion, and a learner approval cannot prove a mission was released or live-passed.

When same-scope evidence conflicts, do not select the newest-looking file automatically. Mark the fact `unknown`, `blocked`, or `invalid` as appropriate, record the conflict under `unresolved_facts`, and require human resolution. Historical reports remain evidence of what was believed or observed at their recorded time, not automatic current truth.

## 5. Update authority and evidence

### Genuine learner progress

May be updated only after a validated `APPROVED` result for Nick's genuine production-family submission. Required evidence: mission ID, validated review or progress record, genuine family identity, attempt or review reference, and confirmation that the record is not an isolated fixture.

### Learner unlock state

May be updated only by the production application's validated exact-next unlock transaction following genuine learner approval. Required evidence: genuine progress before/after or equivalent authoritative response showing only the canonical next mission unlocked. A tracker sentence alone is insufficient when the production record is available.

### Implementation state

May be updated by repository inspection. `prepared` requires identified branch/PR source evidence. `merged` requires the relevant source at a recorded main-branch commit. Branch or PR preparation must never be recorded as merged.

### Technical-test state

May be updated by test automation or a qualified reviewer. `tested` requires the exact test command or workflow, result, source revision, and retained output or report. Tests on a branch apply only to that branch candidate.

### Human beginner-usability state

May be updated only from a dated human review of the exact learner-facing candidate. `human_approved` requires reviewer identity, candidate or source revision, review result, and scope. It proves usability only; it does not prove merge, release, live-pass, or learner completion.

### Release state

May be updated only from the production release process and current main release manifest. `released` requires the mission in the main manifest plus retained successful promotion evidence. A lesson file, branch, PR, test result, or human approval cannot set this field.

### Production live-pass state

May be updated only after all required production gates pass for the released mission. Required evidence: final successful workflow/run, mission ID, production smoke results, exact-next isolated-fixture proof, real-family protection proof, and cleanup/access-revocation proof where applicable.

### Active preparation, blockers and next actions

May be updated by the human operator or repository auditor using branch/PR, checklist, tracker, review, and workflow evidence. These fields describe work; they do not cause state transitions.

## 6. Evidence required for transitions

Every positive state claim requires at least one structured evidence reference. Evidence references identify a source, its location, its scope, and what it proves. A reference must not be reused to prove a different dimension unless the source genuinely proves both. Every evidence-reference scope must appear in the referenced source's declared scopes, including `blocker` when a source supports a blocker.

Every source timestamp has a declared basis. `source_timestamp` means the exact time is documented by the source. `reconciliation_timestamp` means the source was assessed at that time; it must not be described as the source's creation time. A date-only source must not be converted into an invented end-of-day time.

Typical transitions are:

- `not_started → prepared`: identifiable candidate source exists;
- `prepared → tested`: tests pass against that exact candidate;
- `tested → human_approved`: a human passes the exact learner-facing candidate;
- `prepared/tested/human_approved → merged`: the candidate exists on recorded main;
- `merged → released`: main manifest promotion and retained release evidence exist;
- `released → live_passed`: required production gates pass;
- learner `not_started → learner_approved`: Nick's genuine submission receives validated approval;
- unlock `locked → unlocked`: the genuine approval transaction unlocks exactly the canonical next mission.

Transitions may skip labels only when evidence independently proves every resulting positive claim. The state record must not fill intermediate states by assumption.

## 7. Prohibited automatic transitions

The following implications are forbidden:

- implemented, prepared, tested, human-approved, merged, released, or live-passed ⇒ learner-approved;
- learner-approved ⇒ merged, released, or live-passed;
- human-approved ⇒ merged or released;
- draft branch or PR ⇒ merged;
- merged ⇒ released;
- released ⇒ live-passed;
- isolated fixture approval ⇒ genuine learner approval or genuine unlock;
- technical completion of one mission ⇒ start or preparation of a later mission;
- release/live testing ⇒ any change to Nick's real progress;
- a historical tracker/report statement ⇒ current state without reconciliation.

The JSON Schema enforces structural separation and evidence requirements. Cross-field transitions still require the review procedure in this design because JSON Schema cannot prove external events.

## 8. History preservation

`history` is append-only. Each entry records when the record changed, who or what prepared the update, which fields changed, the evidence used, and why. It never overrides `current_state`; current values are read only from `current_state`.

Superseded claims remain in source reports and may be summarized in history or `superseded_claims`. They must be labeled historical. For this baseline:

- reports saying M3 was next describe the July 15–16 snapshot;
- statements saying M7 was unreleased describe the pre-M7 release boundary;
- neither controls the current 18 July state.

Corrections are made by appending a new history entry and changing the explicit current field. Do not rewrite old evidence to make it appear current.

## 9. Relationship to future AGENTS.md

Future `AGENTS.md` should state that:

- this record is the authority for changing state after validation;
- agents must validate it against its schema before use;
- agents must read the relevant evidence before changing a safety-critical field;
- agents must never copy changing values into permanent instructions;
- missing, invalid, stale, or conflicted state blocks assumptions and requires reconciliation;
- reading the record does not authorize any mutation or release action.

`AGENTS.md` must not duplicate the mission-by-mission current values. It should reference `data/state/Nick_Worldmaker_State_Record_v1.json` and its schema at `schemas/Nick_Worldmaker_State_Record_Schema_v1.json`, and define safe handling.

## 10. Release manifest and learner state

The main release manifest is the operational source for which missions are released and live-gated. It does not store or prove Nick's genuine completion.

The genuine learner progress system is the operational source for Nick's approval and exact-next unlock. It does not prove source preparation, merge, release, or live-pass.

This state record reconciles and displays both without replacing either operational source. If they disagree within the same dimension, mark the dimension unresolved and investigate. A normal, safe state may have M3–M7 released and live-passed while Nick has completed only M1–M3 and has only M4 unlocked.

## 11. Baseline reconciliation at commit 5ddd4c2

Supported current state:

- Nick genuinely completed and received approval for M1–M3;
- M4 is his exact next genuine mission;
- no evidence supports learner completion of M4–M8;
- main releases and live-passes M3–M7;
- M8 is the first mission not released from main;
- final retained M7 evidence-bearing workflow run: `29571404259`;
- supplied July 18 tracker supports an M8 candidate prepared on `agent/prepare-v1-m08-saturday`, draft PR #6, automated testing, and human beginner-usability approval;
- that supplied tracker also says M8 was not merged, released, or live-passed and M9 was not started;
- branch/PR existence and exact current head were not independently re-inspected during the completed main-branch audit;
- Nick's live production-family record after the reported genuine M3 approval was not directly queried during that read-only repository inspection.

The last two items remain explicit unresolved/unavailable facts, not guessed values.

Unresolved facts have three classifications:

- `blocks_adoption`: the record cannot safely become authoritative until resolved, such as schema invalidity or contradictory current learner state;
- `safe_unknown`: the record may be adopted while the field remains explicitly unknown because no unsafe transition depends on it;
- `blocks_later_transition`: adoption is allowed, but the named release or state transition cannot occur until the required evidence is obtained.

This corrected baseline has no unresolved fact classified as `blocks_adoption`. The unavailable post-M3 direct snapshot, M1–M2 release classification, and M7 human-review artifact may safely remain recorded as unknown. Independent M8 branch/PR verification blocks claiming a later M8 merge or using that claim for release progression; it does not block adoption of the state-control record.

## 12. Baseline validation procedure

Before accepting a revision:

1. validate the JSON instance against Draft 2020-12 schema;
2. confirm all required mission IDs occur exactly once;
3. confirm every positive claim has scoped evidence;
4. compare release/live-pass values with the inspected main manifest and retained release evidence;
5. compare learner/unlock values with genuine learner evidence, never fixtures;
6. verify branch/PR claims are labeled preparation unless main evidence proves merge;
7. ensure unresolved facts are explicit and correctly classified; do not require `safe_unknown` facts or later-transition facts to be resolved before adoption;
8. confirm the record's no-side-effects declaration remains false for every action flag.

The corrected baseline draft passed Draft 2020-12 schema validation with date-time format checking and separate consistency checks. This validates structure and internal constraints, not the truth of external systems.
