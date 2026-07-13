# Nick // Worldmaker shared backend

This is the first production backend slice for **V1-M02 — Build the Island**.

## Chosen stack

- Cloudflare Workers: API and secret OpenAI call
- Cloudflare D1: central progress, immutable submissions/reviews, sessions, audit log
- Existing GitHub Pages site: child and parent frontend
- OpenAI Responses API with strict JSON Schema Structured Outputs

The OpenAI key is never sent to the browser or committed to GitHub.

## Olga must do these account steps

1. Create or use a Cloudflare account.
2. In Cloudflare, create a D1 database named `worldmaker-db`.
3. Copy its database ID into `wrangler.toml` in place of `REPLACE_AFTER_D1_CREATE`.
4. Create an OpenAI Platform API account. ChatGPT Plus billing is separate.
5. Add a small API payment method/credit limit in OpenAI Platform.
6. Create a restricted project API key for this evaluator.
7. Install Node.js 20+ on the computer used for deployment.
8. In a terminal:

```bash
cd backend
npm install
npx wrangler login
npx wrangler secret put OPENAI_API_KEY
npm run db:remote
npm run deploy
```

9. Copy the deployed Worker URL. It will later be placed in `assets/js/backend-config.js`.

## Initial family and access codes

Choose two different private codes:

- learner code for Nick
- parent code for Olga

Do not commit the codes. Hash each code with SHA-256 and insert only the hashes:

```sql
INSERT INTO families(id, display_name) VALUES ('family-nick', 'Nick family');
INSERT INTO access_codes(id, family_id, role, code_hash) VALUES
('nick-code', 'family-nick', 'learner', '<SHA256_OF_NICK_CODE>'),
('olga-code', 'family-nick', 'parent', '<SHA256_OF_OLGA_CODE>');

INSERT INTO mission_progress(family_id, mission_id, status, hint_level)
VALUES
('family-nick', 'V1-M01', 'APPROVED', 0),
('family-nick', 'V1-M02', 'NOT_SUBMITTED', 0);
```

Run this through Cloudflare D1 Console after applying migrations.

## API routes

- `GET /health`
- `POST /api/session` with `{ "role": "learner|parent", "code": "..." }`
- `GET /api/progress` with `Authorization: Bearer <token>`
- `POST /api/missions/V1-M02/submissions` with bearer token

## Mission 2 payload

```json
{
  "mission_id": "V1-M02",
  "explorer_summary": "World/Ground contains anchored platform parts; PlayerSpawn is under Ground; BuildSite is directly under World; no scripts in imported assets.",
  "output": "VERSION 1 SERVER READY",
  "screenshots": [
    {"name":"whole-world.png","mime_type":"image/png","data_url":"data:image/png;base64,..."}
  ],
  "checklist": {
    "V1-M02-T01": true,
    "V1-M02-T02": true,
    "V1-M02-T03": true
  },
  "understanding": "PlayerSpawn decides where the player appears."
}
```

Current first slice accepts bounded image data inside the JSON request. The request is capped at 180 KB. A later R2 upload slice should replace inline images if larger video evidence becomes necessary.

## Unlock authority

The model cannot update progress. The Worker validates its response and writes the immutable submission, immutable review, progress update, audit entry, and V1-M03 unlock in one D1 batch. Non-approved responses cannot set `next_mission_id` or unlock V1-M03.

## Not yet proven

Deployment, OpenAI billing, cross-device login, and live failure-case tests cannot be completed until the Cloudflare database/Worker and OpenAI API key exist. Nick must not begin Mission 2 until those live tests pass.
