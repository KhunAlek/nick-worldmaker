# Nick // Worldmaker — Production Source Policy

## Authoritative source

GitHub is the only approved production source. Direct Cloudflare editor changes are prohibited except emergency recovery. Any emergency edit must immediately be synchronized back to GitHub and followed by a source-controlled redeployment.

## Required deployment identity

Every production Worker deployment must expose the following through `/health`:

- `entrypoint` — must be `production`;
- `source_version` — the exact Git commit SHA used for deployment;
- `source_sha256` — the SHA-256 fingerprint of `backend/src/production-entry.js` at that commit;
- `evaluator_version` — the active evaluator contract version.

The same values must be recorded in `backend/wrangler.toml` before deployment. A production verification is valid only when the live `/health` values match the repository configuration and the repository source fingerprint.

## Change rules

1. Production code changes are committed to GitHub first.
2. Deployment is performed from a GitHub checkout or GitHub Actions checkout of the recorded commit.
3. The deployment process calculates the production entrypoint fingerprint and writes the commit/fingerprint metadata before deployment.
4. After deployment, `/health` is checked and the returned commit and fingerprint are recorded as evidence.
5. Direct Cloudflare dashboard editing is not an accepted normal workflow.
6. An emergency Cloudflare edit must be copied into GitHub immediately, reviewed, committed, redeployed from GitHub, and verified through `/health`.

## Drift response

If the deployed commit or fingerprint does not match GitHub, the deployment is considered undocumented drift. Stop mission releases, preserve the current production state for recovery evidence, reconcile the code into GitHub, and redeploy the approved GitHub version before normal work resumes.

## Verified baseline — 16 July 2026

- Production entrypoint: `backend/src/production-entry.js`
- Deployment source commit: `2a98d9efc809d991a05801c967f8ce99a58ebf2a`
- Production source SHA-256: `8adcd3bb3a6c8121243f286e8ceb34a7d11b9b32a1cb71d7c1fde1f245b1ed38`
- Evaluator version: `v1-release-engine-2026-07-15`
- Successful verification run: `29475820894`
- Evidence commit: `6014250bf360fd047f4b628240ad5fbd547ed31d`

The successful workflow calculated the fingerprint from the GitHub checkout, deployed that checkout through Wrangler, and then verified the same commit and fingerprint through production `/health`. No Cloudflare-only source difference was detected.
