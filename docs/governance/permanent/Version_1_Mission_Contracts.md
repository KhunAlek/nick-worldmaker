# Nick // Worldmaker
## Version 1 Mission Contracts

**Status:** Permanent project-source document  
**Version:** V1 — Command Loop  
**Purpose:** Preserve the stable mission-by-mission technical contract without duplicating learner lessons, hint ladders, evaluator rubrics, or submission wording.

---

## 1. Authority and use

This document controls the mission-specific boundaries of Version 1.

Use it together with:

- `docs/governance/permanent/Worldmaker_Project_Charter_and_Canonical_Contract.md` for project purpose, stable architecture, constants, ownership, and source authority;
- `docs/governance/permanent/Version_1_Acceptance_Test_Specification.md` for exact test setup, action, expected result, and evidence;
- `docs/governance/permanent/AI_Evaluator_Policy_and_Mission_Rubrics.md` for evaluator decisions, hint escalation, approval rules, and feedback;
- `docs/governance/permanent/AI_Evaluator_Response_Schema.md` for machine-readable evaluator output;
- `docs/governance/permanent/Beginner_Lesson_and_Evidence_Standard.md` for learner-facing wording, recovery, evidence presentation, and beginner usability;
- `docs/tracking/Nick_Worldmaker_Comprehensive_Project_Tracker_2026-07-18_FINAL.md` for actual learner, repository, release, and deployment state.

This document is not a learner lesson. It must not be displayed directly to Nick as step-by-step instruction.

Only a validated `APPROVED` result unlocks the next sequential mission.

---

## 2. Version 1 mission sequence

1. `V1-M01` — Studio Ready
2. `V1-M02` — Build the Island
3. `V1-M03` — Add Two Settlers
4. `V1-M04` — Select a Settler
5. `V1-M05` — Place the Resources
6. `V1-M06` — Build the Command HUD
7. `V1-M07` — Send Safe Commands
8. `V1-M08` — Walk to the Resource
9. `V1-M09` — Gather and Return
10. `V1-M10` — Show Resource Totals
11. `V1-M11` — Unlock Construction
12. `V1-M12` — Build the First Hut
13. `V1-M13` — Restart the World
14. `V1-M14` — Prove Version 1
15. `V1-M15` — Publish Version 1

---

# V1-M01 — Studio Ready

**Starting state:** Roblox Studio is installed and Nick can sign in. No project objects are assumed.

**Visible result:** Play starts normally and Output contains exactly one `VERSION 1 SERVER READY` from Nick's project code.

**Required concepts:** Explorer, Properties, Output, normal server `Script`, script location.

**Required technical state:**

- `Workspace/World` exists with `Ground`, `NPCs`, `NPCHomes`, `Resources`, and `Buildings` folders.
- `ReplicatedStorage/Remotes` and `ReplicatedStorage/GameState` exist.
- `ServerStorage/Templates` exists.
- `ServerScriptService/WorldServer` is one enabled normal `Script`.
- `WorldServer` prints `VERSION 1 SERVER READY` once per Play session.
- Play, Stop, restart, and local backup work.

**Boundary:** No gameplay feature, free-model script, extra project script, or duplicate `Hello world!` script is introduced.

**Acceptance tests:** `V1-M01-T01`–`V1-M01-T03`.

**Understanding objective:** Nick knows that Output is the first place to inspect when a script appears to do nothing.

---

# V1-M02 — Build the Island

**Starting state:** V1-M01 approved; canonical empty folders and `WorldServer` exist.

**Visible result:** The player spawns on a compact stable settlement area with a visible build site and open future resource routes.

**Required concepts:** Part, Anchored, SpawnLocation, physical layout.

**Required technical state:**

- Anchored playable ground exists under `Workspace/World/Ground`.
- `PlayerSpawn` is a safe `SpawnLocation` on solid ground.
- `Workspace/World/BuildSite` is anchored, visible, and does not block movement.
- Space exists for two NPCs and two resource nodes.
- At least one obstacle exists for later pathfinding, but a route remains open around it.
- The world does not fall, drift, trap the player, or use unknown executable asset scripts.

**Boundary:** No NPC, resource, selection, GUI, command, or pathfinding implementation is introduced.

**Acceptance tests:** `V1-M02-T01`–`V1-M02-T03`.

**Understanding objective:** Nick knows that `PlayerSpawn` decides where the player first appears.

---

# V1-M03 — Add Two Settlers

**Starting state:** V1-M02 approved; safe world, build site, `NPCs`, and `NPCHomes` exist.

**Visible result:** `NPC_1` and `NPC_2` stand separately, upright, and stable in Play.

**Required concepts:** generated rig, Model, Humanoid, HumanoidRootPart, PrimaryPart, home marker.

**Required technical state:**

- Exactly two required NPC Models exist under `Workspace/World/NPCs`: `NPC_1` and `NPC_2`.
- Each contains a valid `Humanoid` and `HumanoidRootPart`.
- Each Model uses `HumanoidRootPart` as its PrimaryPart.
- Required movable body parts are not anchored.
- Unneeded scripts introduced with rigs are removed.
- `NPC_1_Home` and `NPC_2_Home` exist under `NPCHomes` as anchored, invisible, non-colliding Parts at the matching starts.

**Boundary:** No selection or movement code is introduced.

**Acceptance tests:** `V1-M03-T01`–`V1-M03-T03`.

**Understanding objective:** Nick understands that a decorative statue without a Humanoid and root part is not a movable Roblox character rig.

---

# V1-M04 — Select a Settler

**Starting state:** V1-M03 approved; two valid NPC rigs exist.

**Visible result:** Clicking either NPC moves one local Highlight to that NPC; repeated switching never creates another marker.

**Required concepts:** ClickDetector, LocalScript, variable, event connection, Highlight, local player state.

**Required technical state:**

- Each NPC has one `ClickDetector` under its `HumanoidRootPart`.
- `StarterGui/CommandGui` exists with `ResetOnSpawn` false.
- `CommandGui/CommandClient` is one LocalScript owning selection.
- One variable remembers the current NPC.
- One local Highlight named `SelectedNPCHighlight` is created once and changes `Adornee` when selection changes.
- Click connections are created once and work in both switch directions after restart.

**Boundary:** Selection remains client-local. No server selection state, resource command, GUI panel, or movement is introduced.

**Acceptance tests:** `V1-M04-T01`–`V1-M04-T04`.

**Understanding objective:** Nick can identify the single variable that remembers which NPC should receive the next command.

---

# V1-M05 — Place the Resources

**Starting state:** V1-M04 approved; selection works and `Resources` is empty.

**Visible result:** One recognisable Wood node and one Stone node exist, each with a safe reachable destination beside it.

**Required concepts:** TargetPoint, Anchored, Transparency, CanCollide, exact object names.

**Required technical state:**

- `Workspace/World/Resources/WoodNode` and `StoneNode` are Models.
- Each Model contains exactly one Part named `TargetPoint`.
- Each TargetPoint is anchored, invisible, non-colliding, and placed on reachable ground beside—not inside—the visible node.
- Visible resource parts remain stable and do not trap the player or future NPC.

**Boundary:** No collection logic, pathfinding, resource values, or resource depletion is introduced.

**Acceptance tests:** `V1-M05-T01`–`V1-M05-T03`.

**Understanding objective:** Nick understands why movement should target a separate safe Part rather than the centre of a decorative Model.

---

# V1-M06 — Build the Command HUD

**Starting state:** V1-M05 approved; `CommandGui` and `CommandClient` already support local selection.

**Visible result:** A usable command panel shows selection, resource labels, hut cost, four buttons, and a status area.

**Required concepts:** ScreenGui, Frame, TextLabel, TextButton, `Activated`, UI state.

**Required technical state:**

- `CommandGui/Panel` contains every canonical label and button with exact names.
- Starting text includes no selection, 0 Wood, 0 Stone, hut cost `6 wood + 3 stone`, and a useful status.
- `CommandClient` safely references every control.
- Selection updates `SelectedNPCLabel`.
- Each button produces temporary local feedback only.
- Controls remain visible and usable at Nick's normal Studio window size.

**Boundary:** The client does not move NPCs, alter GameState, create a hut, or reset shared state.

**Acceptance tests:** `V1-M06-T01`–`V1-M06-T04`.

**Understanding objective:** Nick understands that the LocalScript controls the HUD, while later server code decides whether shared actions are allowed.

---

# V1-M07 — Send Safe Commands

**Starting state:** V1-M06 approved; complete HUD and local selection work; canonical remotes are not yet active.

**Visible result:** A valid selected Wood or Stone request is accepted by the server and returned as a status; no-selection stays local and sends no valid command.

**Required concepts:** client, server, RemoteEvent, FireServer, OnServerEvent, FireClient, validation.

**Required technical state:**

- `CommandNPC`, `BuildHut`, `ResetWorld`, and `StatusMessage` exist under `ReplicatedStorage/Remotes`.
- No-selection displays local guidance and does not fire a valid server request.
- `CommandClient` sends only the selected NPC and allowed resource name.
- `WorldServer` connects `CommandNPC.OnServerEvent` exactly once.
- The server validates resource type/value, NPC type, NPC membership in the canonical folder, and required rig structure.
- The server returns accepted or rejected status through `StatusMessage`.
- `CommandClient` displays server responses.
- Invalid command and invalid NPC tests are safe and temporary test code is removed.

**Boundary:** The mission does not move NPCs, award resources, change busy state, or build. The client never sends an award amount or changes shared truth.

**Acceptance tests:** `V1-M07-T01`–`V1-M07-T05`.

**Understanding objective:** Nick understands: the client requests; the server checks and decides; the client displays the result.

---

# V1-M08 — Walk to the Resource

**Starting state:** V1-M07 approved; valid requests reach `WorldServer`; targets and movable rigs exist.

**Visible result:** The selected NPC walks around obstacles to the requested TargetPoint or stops safely with a useful failure status.

**Required concepts:** PathfindingService, path, ComputeAsync, PathStatus.Success, waypoint, MoveToFinished, jump waypoint, protected call, return value, timeout/failure handling.

**Required technical state:**

- `WorldServer` has a bounded `moveNPCTo(npc, destinationPosition)` function returning `true` or `false`.
- Missing Humanoid or root part returns false safely.
- Path computation is protected against engine errors.
- Path status is checked before waypoints are used.
- Waypoints are followed in order.
- Jump waypoints are handled.
- Every movement wait has a controlled result and failure stops the function.
- The requested node's exact `TargetPoint` is used.
- Wood and Stone routes succeed in normal tests.
- A controlled blocked-route test fails safely and is fully restored afterward.

**Boundary:** No resource award, collection pause, return-home lifecycle, or busy system is introduced. Wood and Stone totals remain unchanged.

**Acceptance tests:** `V1-M08-T01`–`V1-M08-T04`.

**Understanding objective:** Nick understands that later game work may continue only when the movement function returns true.

---

# V1-M09 — Gather and Return

**Starting state:** V1-M08 approved; `moveNPCTo` reliably reports success or failure; totals are not awarded yet.

**Visible result:** An NPC travels to the requested node, reports collection, returns to its own home, and refuses a duplicate job while the other NPC can still work.

**Required concepts:** per-NPC state, table used as a map, task.spawn, early return, asynchronous lifecycle, cleanup.

**Required technical state:**

- `WorldServer` maintains busy state separately for each NPC.
- Busy is checked and set before asynchronous work begins.
- A second command to the same busy NPC is refused.
- Different NPCs may run jobs concurrently.
- The job uses the correct resource target and matching home marker.
- Collection status occurs only after successful arrival.
- The NPC returns home after collection.
- Busy clears on success, outward failure, return failure, and every other exit.
- A failed job can be retried after the problem is restored.

**Boundary:** No real resource totals are added yet.

**Acceptance tests:** `V1-M09-T01`–`V1-M09-T05`.

**Understanding objective:** Nick understands why one shared `isBusy` value cannot represent two independently working settlers.

---

# V1-M10 — Show Resource Totals

**Starting state:** V1-M09 approved; gather-and-return lifecycle works; `GameState` has no active canonical values yet.

**Visible result:** A successful Wood trip adds 2 and a successful Stone trip adds 1; the HUD displays the shared totals immediately and accurately.

**Required concepts:** IntValue, BoolValue, changed signal, server-owned state, single source of truth.

**Required technical state:**

- `GameState/Wood` and `Stone` are IntValues starting at 0.
- `GameState/HutBuilt` is a BoolValue starting false.
- Only `WorldServer` changes Wood and Stone.
- Wood is awarded by 2 and Stone by 1 only after successful arrival at the correct node.
- Invalid, failed, or duplicate commands award nothing.
- Return-home failure does not duplicate or reverse a resource already collected correctly.
- `CommandClient` reads the replicated values, refreshes at startup, and refreshes on changes.
- No second local resource total exists.

**Boundary:** Construction remains unavailable and no hut is created.

**Acceptance tests:** `V1-M10-T01`–`V1-M10-T05`.

**Understanding objective:** Nick understands that the server value is the real shared total and the HUD is only its display.

---

# V1-M11 — Unlock Construction

**Starting state:** V1-M10 approved; server totals and HUD stay in sync; no build handler is active.

**Visible result:** Build remains unavailable at 6/2 and 5/3 and becomes available at 6/3 without restarting.

**Required concepts:** comparison, boolean expression, `and`, derived UI state, disabled/enabled button presentation.

**Required technical state:**

- Canonical cost remains 6 Wood and 3 Stone.
- The HUD displays the same cost.
- Build availability is derived from `wood >= 6 and stone >= 3`.
- Button state refreshes at startup and whenever either value changes.
- Boundary states 6/2, 5/3, and 6/3 are proven.
- Temporary test values are restored.
- Client availability is presentation only; the server will recheck in M12.

**Boundary:** Clicking Build does not create a hut or spend resources.

**Acceptance tests:** `V1-M11-T01`–`V1-M11-T05`.

**Understanding objective:** Nick understands that both requirements must be satisfied, and that a disabled button is not a server security check.

---

# V1-M12 — Build the First Hut

**Starting state:** V1-M11 approved; build availability works; required remotes, state, build site, buildings folder, and templates folder exist.

**Visible result:** With enough resources, one click spends exactly 6/3 and creates exactly one `FirstHut`; insufficient or repeated requests create nothing extra.

**Required concepts:** server template, clone, PivotTo, server-side validation, race prevention, atomic check-and-spend.

**Required technical state:**

- `ServerStorage/Templates/HutTemplate` is a usable anchored Model.
- `CommandClient` requests a build but does not decide or create it.
- `WorldServer` connects `BuildHut.OnServerEvent` exactly once.
- Before spending, the server validates required objects, `HutBuilt`, Wood, and Stone.
- Insufficient resources are rejected with no deduction.
- Missing template or BuildSite produces controlled refusal with no deduction.
- `HutBuilt` is reserved before any yielding operation that could allow a duplicate request.
- Exactly 6 Wood and 3 Stone are deducted once.
- One clone named `FirstHut` is parented to `World/Buildings` and positioned at `BuildSite`.
- Rapid and later repeated requests never create a second hut or second deduction.

**Boundary:** No reset implementation is introduced.

**Acceptance tests:** `V1-M12-T01`–`V1-M12-T05`.

**Understanding objective:** Nick understands why the one-hut state must be reserved before code can pause.

---

# V1-M13 — Restart the World

**Starting state:** V1-M12 approved; a complete gather-and-build loop works once; ResetWorld has no complete handler.

**Visible result:** Restart returns the game to two NPCs at home, 0/0 resources, no hut, no busy jobs, no selection, locked construction, and a replayable loop.

**Required concepts:** reset contract, generation token, stale asynchronous job, state reconciliation.

**Required technical state:**

- `WorldServer` maintains a generation value for the current world run.
- Every asynchronous gather job records and checks its generation before continuing after waits or awarding resources.
- Reset increments the generation before changing visible state.
- Wood and Stone return to 0; HutBuilt returns false.
- Only live `FirstHut` is removed; `HutTemplate` remains.
- Both NPCs stop current work, clear busy state, and return to matching homes.
- `CommandClient` clears selection, Highlight, and local status while replicated handlers refresh totals and build state.
- Reset succeeds while idle, after building, and during one or two active jobs.
- Old jobs cannot award late resources.
- A second complete loop works after reset.

**Boundary:** No new gameplay feature is introduced.

**Acceptance tests:** `V1-M13-T01`–`V1-M13-T05`.

**Understanding objective:** Nick understands the late-award bug that can happen when an old job completes after reset.

---

# V1-M14 — Prove Version 1

**Starting state:** V1-M13 approved; every planned Version 1 feature exists and reset supports replay.

**Visible result:** The full normal loop and all required edge cases work together with no unresolved project-code runtime error.

**Required concepts:** integration test, regression, reproducible evidence, Studio Server & Clients.

**Required technical state:**

- Feature scope is frozen.
- The complete normal loop passes from clean reset.
- No-selection, invalid target, duplicate command, unavailable resource, insufficient resources, concurrent NPCs, repeated build, stuck movement, and reset-during-work cases pass.
- A two-client test proves selection is local while totals and hut are shared.
- Current client and server Output contain no unresolved red project-code errors.
- Intentional warnings are tied to controlled tests.
- Temporary commands, cheats, debug hooks, duplicate objects, and unused scripts are removed.
- Any final correction is followed by affected-test reruns and a fresh normal-loop run.

**Boundary:** No new gameplay or polish feature may delay or contaminate proof.

**Acceptance tests:** `V1-M14-T01`–`V1-M14-T11`, plus the final integration test in the acceptance specification.

**Understanding objective:** Nick can identify which earlier test must be rerun after changing a subsystem such as reset.

---

# V1-M15 — Publish Version 1

**Starting state:** V1-M14 approved; final Studio build and evidence are clean; a parent is available for account and audience decisions.

**Visible result:** The intended Roblox experience opens from its link, matches the approved Studio build, and a permitted external tester can enter when platform eligibility allows.

**Required concepts:** local backup, Publish to Roblox, experience/start place, private/limited/public audience, published-version test, parent checkpoint.

**Required technical state:**

- A clearly named final local `.rbxl` backup exists.
- The approved place is published to the intended Roblox experience and start place.
- Name, description, supported devices, release note, and experience link are recorded accurately.
- The parent reviews account, age, security, content maturity, and audience eligibility.
- Private information is hidden in evidence.
- The published link is tested outside Studio through selection, one Wood trip, one Stone trip, and reset.
- A permitted non-creator tester joins when eligibility allows.
- After any final code fix, the approved place is republished and the link test is repeated.
- Platform eligibility blocks produce `BLOCKED_NEEDS_HELP`, not a coding failure or false approval.

**Boundary:** No bypass of Roblox account controls, no forced spending, and no claim of public or external access without proof.

**Acceptance tests:** `V1-M15-T01`–`V1-M15-T07`.

**Understanding objective:** Nick understands that opening the published link after republishing proves whether Roblox is running the newest build.

---

## 3. Cross-mission boundaries

These rules apply to every mission:

- Do not implement later-mission behavior early.
- Do not silently change canonical names, mission IDs, test IDs, awards, cost, or ownership rules.
- A working beginner solution is acceptable when it safely satisfies the contract.
- Cosmetic choices remain Nick's unless they break routes, visibility, safety, canonical objects, or tests.
- Learner-facing lessons must be written separately and must pass the beginner-usability standard.
- Evidence and approval requirements come from the acceptance specification and evaluator documents, not from this contract alone.
