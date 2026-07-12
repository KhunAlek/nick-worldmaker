# Nick // Worldmaker — Website MVP Build 1

Static, repository-ready prototype for the first mission workflow of Nick’s Roblox tutor website.

## What Build 1 demonstrates

- Promotional landing page based on the existing `NICK // WORLDMAKER` concept
- Build HQ with all 15 canonical Version 1 missions
- Only `V1-M01` unlocked in fresh state
- Complete Mission 1 instructions, tests, hints, submission form, and feedback
- Deterministic browser-only mock evaluator with `NEEDS_FIX`, `NEEDS_EVIDENCE`, and `APPROVED`
- Application-controlled unlocking of `V1-M02`
- Local progress, attempts, review, hints, and unlocks stored in `localStorage`
- Read-only Parent View plus a prototype reset control

## Important evaluator notice

Build 1 does **not** call ChatGPT or the OpenAI API. The evaluator is a deterministic JavaScript simulation in `assets/js/mock-evaluator.js`. It checks fixed Mission 1 evidence rules and returns an object shaped like the project’s evaluator response schema.

Submitted Luau is never executed. It is inspected only as text. There is no API key placeholder or backend code in this repository.

## File structure

```text
/
├── index.html
├── hq.html
├── mission.html
├── progress.html
├── parent.html
├── README.md
├── assets/
│   ├── css/
│   │   ├── landing.css
│   │   └── styles.css
│   └── js/
│       ├── landing.js
│       ├── missions-data.js
│       ├── storage.js
│       ├── mock-evaluator.js
│       └── app.js
├── data/
│   └── missions.json
└── tests/
    └── browser-smoke-test.py
```

`data/missions.json` is the repository data record. `assets/js/missions-data.js` is the static-browser bundle generated from the same data so the site does not need a framework or build tool.

## Run locally

Use a local static server so every browser treats the site like GitHub Pages:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080/`.

## Quick evaluator samples

Open Mission 1, expand **Prototype test samples**, and load one of the three samples:

- `NEEDS_FIX`: wrong readiness print message
- `NEEDS_EVIDENCE`: current Output/checklist proof is incomplete
- `APPROVED`: all mandatory Mission 1 evidence is present

A valid approved review unlocks `V1-M02`. Refreshing or opening Parent View keeps the same browser-local state.

## Deploy to GitHub Pages

1. Create a GitHub repository.
2. Upload the contents of this folder to the repository root.
3. Commit and push.
4. In GitHub repository settings, open **Pages**.
5. Choose **Deploy from a branch**.
6. Select the branch containing the files and the `/ (root)` folder.
7. Save and open the generated Pages URL.

No secrets or build command are required.

## Local storage

The key is `nick_worldmaker_build1_v1`. Build 1 stores:

- current mission
- mission statuses
- attempt summaries and reviews
- latest mock review
- approved and unlocked mission IDs
- hint levels
- last activity timestamp

The prototype does not store passwords, credentials, API keys, screenshots, or private account data. Reset is available only in Parent View.

## Mock evaluator rules for V1-M01

The local simulation checks:

- exact `print("VERSION 1 SERVER READY")` statement
- required Mission 1 folder names
- `ServerScriptService/WorldServer` and normal Script evidence
- exactly one readiness line in one submitted clean-run Output
- no apparent unresolved runtime error in submitted Output
- confirmation of `V1-M01-T01`, `V1-M01-T02`, and `V1-M01-T03`

Proven false requirements return `NEEDS_FIX`. Missing or ambiguous proof returns `NEEDS_EVIDENCE`. All mandatory evidence returns `APPROVED`.

Unlocking is not caused by feedback prose. `app.js` asks the evaluator module to independently recheck approval eligibility before `storage.js` updates the unlocked mission list.

## Automated smoke test

The optional test uses Playwright with Chromium. Install the test dependency once:

```bash
python3 -m pip install playwright
python3 -m playwright install chromium
```

Then run from the repository root:

```bash
python3 tests/browser-smoke-test.py
```

The test loads the static files directly in an isolated browser document. It checks page structure and navigation links, fresh lock state, all three evaluator outcomes, the schema-shaped review object, Mission 2 unlocking and summary view, persistence across page documents, Parent View synchronisation, reset, and 390px mobile overflow. Set `WORLDMAKER_CHROMIUM` to a browser executable when needed.

## Build 1 limitations

- Progress exists only in the current browser and can be cleared by browser storage settings.
- There is no login, cloud sync, database, file upload, screenshot/video evidence, or real AI review.
- Only Mission 1 has the complete child-facing workflow. Later missions use canonical titles and summaries; Mission 2 can unlock, but its full instruction and evaluation interface is intentionally deferred.
- Runtime-error detection is a conservative text check, not a Luau parser.
- The site cannot inspect Roblox Studio directly and trusts pasted evidence plus checklist confirmations.

## Next backend integration points

A later build can replace `mock-evaluator.js` and `storage.js` behind stable application interfaces:

- send validated mission submissions to a private serverless endpoint
- request strict structured evaluator output server-side
- apply schema and mission invariants on the backend
- persist submissions, reviews, and unlock transactions in a database
- add authenticated parent/learner views
- add controlled screenshot/video evidence storage

The OpenAI API key must remain server-side and must never be added to this static repository.
