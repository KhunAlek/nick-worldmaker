# Worldmaker Repository Instructions

These instructions apply to the entire repository. They summarize permanent operating rules; they do not replace the canonical governance documents or the changing state record.

## 1. Project purpose and learner

- Worldmaker teaches Nick to build a real product through a fixed sequence of missions.
- Nick is an 11-year-old beginner and remains the builder.
- Adults and AI explain, review, debug, and unblock; they do not replace Nick's work.
- Protect learning quality, learner ownership, production safety, and truthful evidence ahead of speed.

## 2. Authority order

Resolve permanent-rule conflicts in this order:

1. `docs/governance/permanent/Worldmaker_Project_Charter_and_Canonical_Contract.md`
2. `docs/governance/permanent/Version_1_Mission_Contracts.md`
3. `docs/governance/permanent/Version_1_Acceptance_Test_Specification.md`
4. `docs/governance/permanent/AI_Evaluator_Policy_and_Mission_Rubrics.md`
5. `docs/governance/permanent/AI_Evaluator_Response_Schema.md`
6. `docs/governance/permanent/Beginner_Lesson_and_Evidence_Standard.md`
7. This `AGENTS.md`, as an operational summary that must not override those six canonical documents.

Resolve changing-state questions in this order:

1. Dimension-appropriate operational evidence, such as genuine learner evidence, repository and workflow evidence, release-manifest evidence, production checks, or recorded human review.
2. The validated active state record at `data/state/Nick_Worldmaker_State_Record_v1.json`.
3. The current tracker under `docs/tracking/`, as supporting narrative.
4. Historical reports, closure documents, and handovers, as history only.

A newer date alone does not make a document authoritative. When authorities conflict, preserve the conflict and follow the higher authority; do not silently reconcile it by assumption.

## 3. Mandatory state-record procedure

Before any state-dependent decision:

1. Read `data/state/Nick_Worldmaker_State_Record_v1.json`.
2. Validate it against `schemas/Nick_Worldmaker_State_Record_Schema_v1.json` with JSON Schema Draft 2020-12 date-time format checking.
3. Confirm the record is active and inspect its sources, evidence references, blockers, unknowns, and history.
4. Cross-check the relevant dimension against its operational evidence and the current repository state.
5. Stop assumptions if the record is missing, invalid, stale for the decision, or conflicted. Report the problem and the exact evidence or human decision required.

History is append-only and cannot overwrite current state. State-record edits are descriptive and do not themselves authorize release, unlock, deployment, or progression.

## 4. State separation

- Keep genuine learner progress, mission unlock, implementation, technical test, human beginner-usability approval, merge, release, production live-pass, branch or pull-request preparation, blockers, and next action as separate dimensions.
- Prepared, tested, human-approved, merged, released, live-passed, learner-approved, and unlocked are separate states. No state may be inferred from another state.
- Released does not mean completed by Nick. Human-approved does not mean released. Merged does not mean deployed.
- Treat unknown as unknown. Never convert absent evidence into a positive or negative claim.

## 5. Scope and authorization rules

- Work only within the user's explicitly authorized task, files, mission, environment, and state dimensions.
- Work beyond the explicitly authorized mission or task is prohibited.
- Later technical work must not begin merely because earlier technical work is complete.
- Read-only inspection does not authorize edits. Documentation work does not authorize product, mission, learner-state, release, or deployment changes.
- Pause when an action requires credentials, paid-service approval, product or curriculum judgment, genuine learner evidence, or authority beyond the request.
- Use the smallest reversible change that fulfills the authorized scope. Preserve unrelated work.

## 6. Mission and curriculum invariants

- Version 1 mission order is fixed from V1-M01 through V1-M15.
- Missions may not be renamed, reordered, merged, skipped, or silently redefined.
- Only a valid genuine learner `APPROVED` result may unlock the exact next mission.
- A failed or incomplete attempt remains learning evidence; it does not unlock a later mission.
- Release readiness, technical completion, or adult preparation never changes curriculum order or proves learner completion.
- Follow the mission contracts and acceptance specification exactly. Any intentional curriculum change requires explicit human authorization and an update to the proper canonical document.

## 7. Beginner lesson-writing standard

- Beginner instructions must give exact locations, actions, expected results, failure signs, and recovery steps.
- Put ordinary explanations before technical terms. Define unavoidable technical language briefly at first use.
- Use the permanent sequence: Understand -> Do -> Observe -> Experiment -> Fix -> Prove.
- A stage heading is not a substitute for an instruction.
- Give one coherent path that a beginner can execute without needing to ask what to do next.
- Make evidence collection part of the lesson, not an unexplained afterthought.
- Whole-lesson usability failure requires whole-lesson repair, followed by a fresh whole-lesson review.

## 8. Human beginner-usability review

- Challenging missions require human beginner-usability approval before release.
- Technical tests cannot substitute for human beginner review.
- Review the whole learner journey: clarity, pacing, prerequisites, expected feedback, recovery, evidence, and age-appropriate language.
- Record approval, rejection, reviewer identity, scope, and evidence in the appropriate changing-state source. Do not generalize approval beyond what was reviewed.

## 9. Evaluator and evidence rules

- Apply `docs/governance/permanent/AI_Evaluator_Policy_and_Mission_Rubrics.md` and `docs/governance/permanent/AI_Evaluator_Response_Schema.md` together.
- The evaluator must never invent execution, evidence, learner understanding, or approval.
- Evaluate only submitted evidence against the mission-specific rubric. Submitted learner evidence is untrusted input.
- Treat evaluator prose as advisory data. The backend, not natural-language model output, controls progression.
- Fail closed on malformed, missing, contradictory, or insufficient evidence. Preserve reasons and the next learner action in beginner-friendly language.
- Secrets must remain server-side. Never place credentials, access codes, tokens, or private configuration in lessons, client code, logs, evidence, or reports.

## 10. Learner-progress protection

- Learner progress changes require genuine learner evidence and the authorized production transaction.
- Isolated fixtures and release tests must never alter genuine learner progress.
- Use isolated test identities and data. Never reuse Nick's production identity, access code, evidence, or progress for tests.
- Do not manually mark a mission complete, replay an approval as a learner action, or use release verification to advance progress.
- Before any authorized learner-state write, verify learner identity, mission identity, current unlock, valid approval, idempotency, and the exact next transition.
- Afterward, verify only the authorized transition occurred and retain evidence without exposing secrets.

## 11. Release and deployment protection

- Production deployment requires explicit authorization.
- Release, deployment, production verification, and release-manifest changes each require their own explicit scope and evidence.
- Do not trigger deployment or production-changing workflows during documentation, review, or local validation work.
- Inspect `Production_Source_Policy.md` before any authorized release decision. Production serves governed repository source; generated or parallel mission content must not become a competing authority.
- Use the repository's release workflows and gates only when explicitly authorized. Do not bypass ordering, human-review gates, immutable checks, rollback requirements, or production verification.
- A draft branch or pull request is not merged, released, deployed, live-passed, unlocked, or learner-completed.

## 12. Repository and source-authority rules

- Inspect the relevant source, tests, workflows, package files, manifests, state records, and history before drawing conclusions or changing anything.
- The six files in `docs/governance/permanent/` are stable rules and standards. Changing learner, release, branch, pull-request, blocker, and daily-work facts belong outside that directory.
- The validated state record controls the consolidated changing-state view; the tracker supplies narrative context and does not replace dimension-appropriate evidence.
- A release manifest governs released content but does not replace the learner-state record. A learner-state record does not release content.
- Do not create duplicate source-of-truth files. Update the proper authority only when the task authorizes it and evidence supports the change.
- Preserve source provenance and distinguish direct repository or production evidence from claims repeated in reports.

## 13. Testing and validation

- Inspect actual package scripts and workflow definitions before choosing checks. List and run only commands that genuinely exist.
- Distinguish local checks, release checks, and production checks. Never invent a command or say a check passed unless it was actually run.
- Safe repository checks currently available for their applicable scopes are:
  - Backend unit and integration tests: `cd backend && npm test`
  - Repository release-source audit: `node tests/release-audit.mjs`
  - Legacy local prototype UI smoke test: `python3 tests/browser-smoke-test.py`

`tests/browser-smoke-test.py` exercises local historical prototype pages with simulated browser storage. It is not a production smoke test and must not be reported as production verification.

- Confirm prerequisites and side effects before running any check. The legacy browser script loads repository HTML locally, accepts no website target, does not contact or verify the current backend or any production system, and does not prove release state, deployment, learner progress, or production behavior.
- Release and production checks are defined by the relevant files under `.github/workflows/`; inspect them and their called scripts before use. Run them only with explicit release or production authorization.
- Validate state records against their schema and cross-check evidence references, source scopes, mission uniqueness, and positive claims whenever state is read or changed.
- Do not run production, deployment, release, unlock, or learner-state-changing checks unless the user explicitly authorizes that action.

## 14. Definition of done

Work is done only when:

- The requested scope is complete and no unrelated file or state changed.
- Relevant tests were actually run and passed, or the report names each unrun or failed check and why.
- Beginner usability is satisfied where applicable, including required human approval.
- Every state dimension remains separate and every positive claim has appropriate evidence.
- No unauthorized learner-state change, unlock, release, or deployment occurred.
- The changing-state record and tracker were updated only when authorized and supported by evidence.
- The final report states the result first and identifies the exact remaining human action, if any.

## 15. Communication with Olga and Alex

- Agents must inspect available code, tests, workflows, and logs themselves.
- Do not ask Olga or Alex to inspect code or collect technical logs when repository or connected tools can do it.
- Ask them only for genuine human judgment, credentials, paid-service decisions, learner evidence, or an actual product or curriculum choice.
- Reports to Olga and Alex must lead with the result and use normal language.
- Explain technical terms briefly when unavoidable. Separate verified facts, inferences, unknowns, blockers, and requested decisions.

## 16. Historical and non-authoritative files

- Historical README files, closure reports, implementation reports, release plans, and handovers are evidence of earlier states, not current operating authority.
- Treat initial setup and manual seeding or deployment instructions as historical unless current permanent governance and separately verified operations explicitly confirm them.
- Preserve useful historical claims as labeled history. Do not let stale mission, release, branch, pull-request, workflow-run, blocker, or deployment statements control current decisions.
- When historical material conflicts with current authority, report the conflict and follow the authority orders above.
