# Nick // Worldmaker — Production Baseline Before Sequential Release

**Date:** 15 July 2026  
**Repository:** `KhunAlek/nick-worldmaker`  
**Baseline commit inspected:** `76873383f973c71d24bca99460c6893ba766a553`

## Purpose

This report records the production truth that can be proven from repository state and the completed production-operations source before another production release operation is triggered.

## Confirmed repository state

- The one-time workflow `.github/workflows/production-ops-2026-07-15.yml` was removed by commit `76873383f973c71d24bca99460c6893ba766a553`.
- The retained sequential workflow `.github/workflows/release-v1-sequential.yml` still exists and supports both `workflow_dispatch` and a path-filtered push trigger.
- `backend/wrangler.toml` uses `main = "src/production-entry.js"`.
- No temporary `RELEASE_TEST_FAMILY_ID` or `RELEASE_TEST_MISSION_ID` variable remains in `backend/wrangler.toml`.
- `backend/src/production-entry.js` adds `entrypoint: "production"`, `source_version`, and `evaluator_version` to the successful `/health` response.
- The release manifest currently records `V1-M03` through `V1-M06` as both released and live-passed.
- `V1-M07` is the first unreleased mission.
- The accepted learner-state target remains: M1 approved, M2 approved, M3 next, M4–M15 locked until genuine sequential approval.

## Evidence represented by the green production-operations run

The removed one-time workflow was fail-closed around these gates:

- remote D1 export;
- snapshot of all non-test-family progress before and after;
- isolated test-family creation;
- temporary authenticated wrapper deployment;
- non-approved submission with no unlock;
- approved submission unlocking exactly the next mission;
- shared learner/Parent View response retrieval;
- restoration and health verification of the production entrypoint;
- `RELEASE_TEST_TOKEN` deletion and absence check;
- final production health verification;
- evidence artifact upload.

A green result therefore proves those workflow assertions passed for that run, subject to direct artifact inspection.

## Unresolved run-identification item

Commit `6cae78f440801eb5863ce9e06b501c1486edbef9` produced one reported green run and one reported red run. The available GitHub connector can read jobs, logs, and artifacts **after a run ID is known**, but cannot list push-triggered runs for a commit. The exact two run IDs/URLs therefore remain the only missing inputs needed to:

- identify both runs by workflow name and run ID;
- inspect the green run artifact directly;
- prove the red run’s production effect or lack of effect.

No new production release should be triggered until those two runs are identified.

## Release-blocking defect found in the retained orchestrator

`scripts/release-all-unreleased.sh` currently calls `scripts/configure-release-pilot.mjs`, rotates `RELEASE_TEST_TOKEN`, and deploys the Worker, but it does **not** change `backend/wrangler.toml` from `src/production-entry.js` to `src/release-test-wrapper.js` before calling `/internal/release-test/...` routes.

This would cause the authenticated internal routes to be absent in the deployed Worker. The orchestrator must be hardened before it is triggered.

Additional cleanup/verification improvements required before the run:

- readiness polling after temporary and restored deployments;
- unconditional restoration on failure;
- unconditional token revocation and absence verification;
- deletion of each isolated pilot family after evidence capture;
- unauthorized internal-route rejection check after restoration;
- production health check requiring `entrypoint == "production"`;
- final proof that temporary pilot variables are absent.

## Current release position

- Released and live-passed: `V1-M03`, `V1-M04`, `V1-M05`, `V1-M06`.
- First unreleased mission: `V1-M07`.
- Remaining automated release sequence: `V1-M07` through `V1-M15`.

## Baseline status

**Baseline documented. Sequential release is not yet safe to trigger until the run IDs are inspected and the retained orchestrator defect is corrected.**
