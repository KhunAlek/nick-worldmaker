# D1 Backup Register

## 15 July 2026 closure backup

- **Database:** `worldmaker-db`
- **Cloudflare D1 database ID:** `15ed824d-fa44-46c7-8427-7451635a97bf`
- **Backup created (UTC):** `2026-07-16T06:08:30Z`
- **Workflow:** `Close 15 July 2026`
- **Workflow run ID / attempt:** `29475820894 / 1`
- **Workflow run URL:** https://github.com/KhunAlek/nick-worldmaker/actions/runs/29475820894
- **Source commit SHA:** `2a98d9efc809d991a05801c967f8ce99a58ebf2a`
- **Evidence commit SHA:** `6014250bf360fd047f4b628240ad5fbd547ed31d`
- **Artifact:** `worldmaker-15-july-closure-29475820894`
- **Artifact ID:** `8366520728`
- **Artifact size:** `573,491 bytes`
- **Artifact digest:** `sha256:7c4f3ee45f45319c9e77dde7b199fadb3c5eeb4c08551ea67eb117329c656510`
- **Artifact created:** `2026-07-16T06:09:45Z`
- **Artifact expiry:** `2026-10-14T06:08:04Z`
- **Artifact expired at verification:** `No`
- **SQL export inside artifact:** `release-evidence/2026-07-15-closure/worldmaker-db-2026-07-16.sql`
- **SQL export size:** `859,116 bytes`
- **SQL export SHA-256:** `a7a6391cef25da8bca14b249195dd5daf2e2014e3a9f55891b0c40842924342a`

## Content verification

The artifact ZIP was downloaded and opened through the connected GitHub tools. The SQL file is present and readable. It contains the expected D1 export rather than a placeholder: table definitions for `families`, `access_codes`, `sessions`, `mission_progress`, `submissions`, `reviews`, and `audit_log`, together with data `INSERT` statements including the real `family-nick` records and isolated release-test records.

## Local human download recommendation

**Yes — still recommended.** The GitHub Actions artifact is currently valid but expires on 14 October 2026. The SQL export is also source-controlled in the closure evidence commit, but an additional encrypted local or off-repository copy provides protection against repository or account loss.

## Restoration note

The `.sql` export is the authoritative restore source. Restore it only after owner approval, preferably first into a temporary D1 database. Validate schema, row counts, access-code ownership, Nick's mission progress, and application health before considering restoration to production.
