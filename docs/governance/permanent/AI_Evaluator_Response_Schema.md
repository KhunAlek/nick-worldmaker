# AI Evaluator Response Schema

## Design goals

The website should request OpenAI Structured Outputs using a strict JSON Schema, not ask for “valid JSON” in prose. OpenAI’s official guidance distinguishes Structured Outputs from ordinary JSON mode: Structured Outputs enforce schema adherence, while JSON mode alone only guarantees valid JSON. The application must still validate mission logic, status transitions, and business rules after parsing.

All fields are required so the UI never has to guess whether a missing field means false, unknown, or forgotten. Fields that may have no value use an explicit `null` union. `additionalProperties` is false at every object level so unexpected model keys cannot silently enter the application state.

## Canonical JSON Schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "NickRobloxMissionReview",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "status",
    "mission_id",
    "attempt_number",
    "headline",
    "approved_requirements",
    "main_problem",
    "explanation",
    "next_action",
    "tests_to_repeat",
    "hint_level",
    "understanding_question",
    "parent_summary",
    "unlock_next_mission",
    "next_mission_id",
    "confidence",
    "missing_evidence",
    "reviewed_evidence",
    "regressions",
    "suspicious_input_detected",
    "suspicious_input_note",
    "block_type"
  ],
  "properties": {
    "status": {
      "type": "string",
      "enum": [
        "NOT_SUBMITTED",
        "UNDER_REVIEW",
        "NEEDS_FIX",
        "NEEDS_EVIDENCE",
        "BLOCKED_NEEDS_HELP",
        "APPROVED"
      ]
    },
    "mission_id": {
      "type": "string",
      "enum": [
        "V1-M01",
        "V1-M02",
        "V1-M03",
        "V1-M04",
        "V1-M05",
        "V1-M06",
        "V1-M07",
        "V1-M08",
        "V1-M09",
        "V1-M10",
        "V1-M11",
        "V1-M12",
        "V1-M13",
        "V1-M14",
        "V1-M15"
      ]
    },
    "attempt_number": {
      "type": "integer",
      "minimum": 1
    },
    "headline": {
      "type": "string",
      "minLength": 1,
      "maxLength": 140
    },
    "approved_requirements": {
      "type": "array",
      "items": {
        "type": "string",
        "minLength": 1
      },
      "uniqueItems": true
    },
    "main_problem": {
      "type": [
        "string",
        "null"
      ],
      "maxLength": 500
    },
    "explanation": {
      "type": "string",
      "minLength": 1,
      "maxLength": 1200
    },
    "next_action": {
      "type": "string",
      "minLength": 1,
      "maxLength": 700
    },
    "tests_to_repeat": {
      "type": "array",
      "items": {
        "type": "string",
        "pattern": "^V1-M(0[1-9]|1[0-5])-T[0-9]{2}$"
      },
      "uniqueItems": true
    },
    "hint_level": {
      "type": "integer",
      "minimum": 0,
      "maximum": 5
    },
    "understanding_question": {
      "type": [
        "string",
        "null"
      ],
      "maxLength": 300
    },
    "parent_summary": {
      "type": "string",
      "minLength": 1,
      "maxLength": 500
    },
    "unlock_next_mission": {
      "type": "boolean"
    },
    "next_mission_id": {
      "type": [
        "string",
        "null"
      ],
      "enum": [
        "V1-M01",
        "V1-M02",
        "V1-M03",
        "V1-M04",
        "V1-M05",
        "V1-M06",
        "V1-M07",
        "V1-M08",
        "V1-M09",
        "V1-M10",
        "V1-M11",
        "V1-M12",
        "V1-M13",
        "V1-M14",
        "V1-M15",
        null
      ]
    },
    "confidence": {
      "type": "number",
      "minimum": 0,
      "maximum": 1
    },
    "missing_evidence": {
      "type": "array",
      "items": {
        "type": "string",
        "minLength": 1
      },
      "uniqueItems": true
    },
    "reviewed_evidence": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "code",
        "hierarchy",
        "output",
        "checklist",
        "visual_runtime",
        "understanding"
      ],
      "properties": {
        "code": {
          "type": "boolean"
        },
        "hierarchy": {
          "type": "boolean"
        },
        "output": {
          "type": "boolean"
        },
        "checklist": {
          "type": "boolean"
        },
        "visual_runtime": {
          "type": "boolean"
        },
        "understanding": {
          "type": "boolean"
        }
      }
    },
    "regressions": {
      "type": "array",
      "items": {
        "type": "string",
        "minLength": 1
      },
      "uniqueItems": true
    },
    "suspicious_input_detected": {
      "type": "boolean"
    },
    "suspicious_input_note": {
      "type": [
        "string",
        "null"
      ],
      "maxLength": 500
    },
    "block_type": {
      "type": [
        "string",
        "null"
      ],
      "enum": [
        "technical",
        "evidence",
        "platform_account",
        "adult_restoration",
        null
      ]
    }
  }
}
```


## Field behaviour

- `status`: principal mission result. Synchronous production responses should normally finish as `NEEDS_FIX`, `NEEDS_EVIDENCE`, `BLOCKED_NEEDS_HELP`, or `APPROVED`; `UNDER_REVIEW` is mainly a UI/server state before the model result arrives.
- `mission_id`: exact stable curriculum ID.
- `attempt_number`: server-generated or server-verified positive integer. Do not trust a model to decide the persisted attempt number without comparing it with database state.
- `headline`: short child-facing status line.
- `approved_requirements`: stable requirement/test labels already proven in this attempt. Do not infer that the whole mission is approved from a non-empty list.
- `main_problem`: one main blocker, or null for approval.
- `explanation`: concise child-facing reason.
- `next_action`: one bounded action. For approval, state that the next mission is unlocked.
- `tests_to_repeat`: exact test IDs affected by the change or missing evidence.
- `hint_level`: 0 for no hint/approval/evidence-only request; 1–5 for progressive help.
- `understanding_question`: one short conversational question or null.
- `parent_summary`: factual status for the parent dashboard.
- `unlock_next_mission`: must be true only when status is `APPROVED`.
- `next_mission_id`: sequential next ID only when unlocked; null for V1-M15 or when locked.
- `confidence`: evaluator confidence in the status based on evidence, not confidence that the code looks plausible.
- `missing_evidence`: precise missing items; normally empty for `APPROVED` and `NEEDS_FIX` when failure is proven.
- `reviewed_evidence`: records which evidence classes were actually inspected.
- `regressions`: inherited features newly broken by the current attempt.
- `suspicious_input_detected`: true only for actual instruction-like text in untrusted evidence.
- `suspicious_input_note`: neutral note or null.
- `block_type`: required category when status is `BLOCKED_NEEDS_HELP`; otherwise null.

## Server-side invariants after parsing

The backend must reject or repair a response that violates any of these:

1. `unlock_next_mission == true` only when `status == "APPROVED"`.
2. `APPROVED` requires `main_problem == null`, empty `missing_evidence`, and the next sequential mission ID (or null for V1-M15).
3. Non-approved statuses require `unlock_next_mission == false` and `next_mission_id == null`.
4. `BLOCKED_NEEDS_HELP` requires a non-null `block_type`.
5. All other statuses require `block_type == null`.
6. Test IDs must belong to the current mission unless a named regression explicitly requires an earlier test.
7. Attempt number must match the server’s expected value.
8. Mission ID must match the route/database mission being reviewed.
9. The model’s `approved_requirements` cannot create database approval by itself; the server derives final unlock from the validated status and rubric transaction.

## Example — APPROVED

```json
{
  "status": "APPROVED",
  "mission_id": "V1-M04",
  "attempt_number": 3,
  "headline": "Selection works reliably on both settlers.",
  "approved_requirements": ["V1-M04-T01", "V1-M04-T02", "V1-M04-T03", "V1-M04-T04"],
  "main_problem": null,
  "explanation": "Your one local Highlight moves from NPC_1 to NPC_2, repeated clicks do not create extra markers, and the current Output is clean.",
  "next_action": "Mission V1-M05 is unlocked: place the wood and stone resource nodes.",
  "tests_to_repeat": [],
  "hint_level": 0,
  "understanding_question": null,
  "parent_summary": "V1-M04 approved. Nick built reliable local NPC selection and supplied current runtime evidence.",
  "unlock_next_mission": true,
  "next_mission_id": "V1-M05",
  "confidence": 0.98,
  "missing_evidence": [],
  "reviewed_evidence": {"code": true, "hierarchy": true, "output": true, "checklist": true, "visual_runtime": true, "understanding": true},
  "regressions": [],
  "suspicious_input_detected": false,
  "suspicious_input_note": null,
  "block_type": null
}
```

## Example — NEEDS_FIX

```json
{
  "status": "NEEDS_FIX",
  "mission_id": "V1-M10",
  "attempt_number": 2,
  "headline": "The trip works, but the client is creating the wood total.",
  "approved_requirements": ["V1-M10-T02"],
  "main_problem": "CommandClient adds to a local wood variable instead of displaying the server IntValue.",
  "explanation": "That can make different players see different totals. WorldServer should award the resource after successful arrival, and the HUD should only read GameState.Wood.",
  "next_action": "Move the wood award into WorldServer's successful-arrival branch, remove the local counter arithmetic, and refresh WoodLabel from the IntValue.",
  "tests_to_repeat": ["V1-M10-T01", "V1-M10-T03", "V1-M10-T04", "V1-M10-T05"],
  "hint_level": 2,
  "understanding_question": "Which value should every player share as the real wood total?",
  "parent_summary": "V1-M10 needs one architecture fix: shared totals must be owned by the server. Movement still works.",
  "unlock_next_mission": false,
  "next_mission_id": null,
  "confidence": 0.96,
  "missing_evidence": [],
  "reviewed_evidence": {"code": true, "hierarchy": true, "output": true, "checklist": true, "visual_runtime": true, "understanding": false},
  "regressions": [],
  "suspicious_input_detected": false,
  "suspicious_input_note": null,
  "block_type": null
}
```

## Example — NEEDS_EVIDENCE

```json
{
  "status": "NEEDS_EVIDENCE",
  "mission_id": "V1-M08",
  "attempt_number": 1,
  "headline": "The pathfinding code is present, but the failure case is not proven yet.",
  "approved_requirements": ["V1-M08-T01", "V1-M08-T02"],
  "main_problem": "No current evidence shows what happens when PathStatus is not Success or a waypoint is not reached.",
  "explanation": "The code looks prepared for failure, but approval needs a controlled blocked-path test from this exact version.",
  "next_action": "Temporarily block one TargetPoint, run that command, capture the failure status and Output, then restore the world.",
  "tests_to_repeat": ["V1-M08-T03"],
  "hint_level": 0,
  "understanding_question": null,
  "parent_summary": "V1-M08 may be working. One required failure-case recording is missing.",
  "unlock_next_mission": false,
  "next_mission_id": null,
  "confidence": 0.91,
  "missing_evidence": ["Current blocked-path video", "Current server Output for V1-M08-T03"],
  "reviewed_evidence": {"code": true, "hierarchy": true, "output": true, "checklist": true, "visual_runtime": true, "understanding": false},
  "regressions": [],
  "suspicious_input_detected": false,
  "suspicious_input_note": null,
  "block_type": null
}
```

## Example — BLOCKED_NEEDS_HELP

```json
{
  "status": "BLOCKED_NEEDS_HELP",
  "mission_id": "V1-M15",
  "attempt_number": 2,
  "headline": "The game is published privately, but Roblox is blocking the external test.",
  "approved_requirements": ["V1-M15-T01", "V1-M15-T02", "V1-M15-T03", "V1-M15-T05"],
  "main_problem": "The current account is not eligible for the selected Limited/Public audience under Roblox's account and audience requirements.",
  "explanation": "This is an account-setting block, not a programming failure. A parent needs to review the linked account, age check, maturity questionnaire, 2FA, and available audience options.",
  "next_action": "Ask the parent to complete or choose an eligible audience option, then rerun the external-link test without changing the game code.",
  "tests_to_repeat": ["V1-M15-T04", "V1-M15-T06"],
  "hint_level": 0,
  "understanding_question": null,
  "parent_summary": "Version 1 code and private publish are ready. Adult account/audience action is required before an external tester can join.",
  "unlock_next_mission": false,
  "next_mission_id": null,
  "confidence": 0.99,
  "missing_evidence": ["Eligible audience confirmation", "External tester join confirmation"],
  "reviewed_evidence": {"code": true, "hierarchy": true, "output": true, "checklist": true, "visual_runtime": true, "understanding": true},
  "regressions": [],
  "suspicious_input_detected": false,
  "suspicious_input_note": null,
  "block_type": "platform_account"
}
```


## Official technical references

The curriculum uses the following official sources as its technical baseline:

- [Roblox Creator Hub — Script types and locations](https://create.roblox.com/docs/scripting/locations): `ServerScriptService` is the normal home for server game logic; `StarterGui` and `StarterPlayerScripts` are appropriate for client `LocalScript` code.
- [Roblox Creator Hub — Client-server runtime](https://create.roblox.com/docs/projects/client-server): Roblox experiences are multiplayer by default and the server is authoritative for shared game state.
- [Roblox Creator Hub — Remote events and callbacks](https://create.roblox.com/docs/scripting/events/remote): `RemoteEvent` supports one-way client/server communication.
- [Roblox Creator Hub — Securing the client-server boundary](https://create.roblox.com/docs/scripting/security/client-server-boundary): values sent by a client must be validated by the server before affecting shared state.
- [Roblox Creator Hub — ClickDetector](https://create.roblox.com/docs/reference/engine/classes/ClickDetector): a `ClickDetector` can receive pointer interaction on a 3D object.
- [Roblox Creator Hub — Rig Generator](https://create.roblox.com/docs/studio/rig-builder): Studio can insert a prebuilt character rig with the joints and humanoid structure needed for movement.
- [Roblox Creator Hub — Pathfinding](https://create.roblox.com/docs/characters/pathfinding) and [Path API](https://create.roblox.com/docs/reference/engine/classes/Path): `PathfindingService` computes routes around obstacles; a computed path must be checked for success before its waypoints are used.
- [Roblox Creator Hub — Humanoid](https://create.roblox.com/docs/reference/engine/classes/Humanoid): a `Humanoid` supports character movement, including `MoveTo()` and `MoveToFinished`.
- [Roblox Creator Hub — Output](https://create.roblox.com/docs/studio/output): Studio Output shows engine messages, `print()`/`warn()` messages, and runtime errors.
- [Roblox Creator Hub — Studio testing modes](https://create.roblox.com/docs/studio/testing-modes): Server & Clients testing can simulate multiple clients and one server.
- [Roblox Creator Hub — Publish games and places](https://create.roblox.com/docs/production/publishing/publish-games-and-places): new experiences publish privately first; Limited and Public audiences have eligibility requirements.
- [Roblox Creator Hub — Roblox Kids and Select](https://create.roblox.com/docs/production/publishing/kids-and-select): reaching players under 16 currently has additional account, verification, security, fee/subscription, and evaluation requirements; the feature is actively rolling out.
- [Roblox Support — Parental Controls FAQ](https://en.help.roblox.com/hc/en-us/articles/30428248050068-Parental-Controls-FAQ): a linked adult account can manage parental controls and approvals for a child account.
- [OpenAI API — Structured model outputs](https://developers.openai.com/api/docs/guides/structured-outputs): Structured Outputs can enforce a supplied JSON Schema; strict schemas should be used instead of relying on free-form JSON.
- [OpenAI Help — What is ChatGPT Plus?](https://help.openai.com/en/articles/6950777-what-is-chatgpt-plus): ChatGPT Plus does not include API usage; API use is billed separately.
