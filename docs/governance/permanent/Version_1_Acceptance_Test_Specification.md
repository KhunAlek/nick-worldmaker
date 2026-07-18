# Version 1 Acceptance Test Specification

## Purpose and evidence rule

A test passes only when its setup, action, and expected result match the evidence from the current submission. Code review may prove that a branch exists, but it cannot by itself prove that a visible action worked in Studio. When evidence is missing or ambiguous, the evaluator returns `NEEDS_EVIDENCE`; it does not guess.

**Evidence types**

- **Code:** proves written logic, script type assumptions only when location is also supplied, and presence of validation branches.
- **Hierarchy/properties:** proves object type, exact location, names, and important properties.
- **Text Output:** proves a particular run produced messages or errors, but must be tied to the current attempt.
- **Screenshot:** proves a static visible state.
- **Video:** proves order, movement, repeated interaction, and timing-sensitive behaviour.
- **Future automated Studio test:** may inspect the live DataModel and execute controlled actions; it supplements but does not replace visual evidence where appearance matters.

Before each evidence run, clear old Output, start from the mission’s stated setup, perform the action once in the required order, and capture the result before editing code again. Roblox Studio Output displays runtime errors and print/warn messages; Server & Clients mode can simulate one server with multiple clients. See official references at the end.

## Canonical test constants

- Wood award: **2**
- Stone award: **1**
- Hut cost: **6 wood + 3 stone**
- Initial state: two NPCs, 0/0 resources, no hut, both idle, no selection

---

# V1-M01 — Studio Ready

| Test ID | Test | Setup | Action | Expected result | Evidence required | Assessable from |
|---|---|---|---|---|---|---|
| V1-M01-T01 | Server script runs | Open approved project; clear Output | Press Play | Output contains exactly one `VERSION 1 SERVER READY`; no Nick-code red error | Output text | text Output / future automated Studio test |
| V1-M01-T02 | Hierarchy exists | Edit mode | Inspect required top-level folders | All M01 folders and `WorldServer` exist with exact names/locations | Hierarchy text | hierarchy / future automated Studio test |
| V1-M01-T03 | Restart is clean | Stop after T01 | Press Play again | The message appears again once; no duplicated scripts or errors | Output text | text Output |

## Mission pass rule

All mandatory tests above must pass from the current code and hierarchy. Optional visual polish never compensates for a failed functional test.

---

# V1-M02 — Build the Island

| Test ID | Test | Setup | Action | Expected result | Evidence required | Assessable from |
|---|---|---|---|---|---|---|
| V1-M02-T01 | Safe spawn | Start fresh Play | Allow character to spawn | Player stands on solid ground and can move | Screenshot + checklist | screenshot/video |
| V1-M02-T02 | World stays put | Play and wait through physics start | Walk across ground | Ground, obstacle, spawn, and BuildSite do not fall or drift | Checklist | video / future automated Studio test |
| V1-M02-T03 | Route exists | Play mode | Walk from centre around obstacle toward both resource zones | At least one traversable route exists to each zone | Short video or checklist | video |

## Mission pass rule

All mandatory tests above must pass from the current code and hierarchy. Optional visual polish never compensates for a failed functional test.

---

# V1-M03 — Add Two Settlers

| Test ID | Test | Setup | Action | Expected result | Evidence required | Assessable from |
|---|---|---|---|---|---|---|
| V1-M03-T01 | Two valid rigs | Edit mode | Inspect NPCs folder | Exactly NPC_1 and NPC_2 each contain Humanoid and HumanoidRootPart; PrimaryPart correct | Hierarchy/properties | hierarchy / future automated Studio test |
| V1-M03-T02 | Stable play | Play mode | Observe both NPCs | Both remain upright, separate, and on ground | Screenshot/video | video |
| V1-M03-T03 | Home markers | Edit mode | Inspect NPCHomes | Exact two markers exist, anchored and non-colliding, placed under matching starts | Hierarchy/properties | hierarchy |

## Mission pass rule

All mandatory tests above must pass from the current code and hierarchy. Optional visual polish never compensates for a failed functional test.

---

# V1-M04 — Select a Settler

| Test ID | Test | Setup | Action | Expected result | Evidence required | Assessable from |
|---|---|---|---|---|---|---|
| V1-M04-T01 | Select first | Play with no selection | Click NPC_1 | Exactly one Highlight appears on NPC_1 | Screenshot/video | video |
| V1-M04-T02 | Move selection | Continue T01 | Click NPC_2 | Same marker moves to NPC_2; NPC_1 no longer highlighted | Video | video |
| V1-M04-T03 | No duplication | Continue | Alternate clicks at least five times | Only one Highlight exists and Output stays clean | Hierarchy during Play + Output | video / future automated Studio test |
| V1-M04-T04 | Fresh restart | Stop and Play again | Click NPC_2 first | Selection works after restart without duplicated connections | Video + Output | video |

## Mission pass rule

All mandatory tests above must pass from the current code and hierarchy. Optional visual polish never compensates for a failed functional test.

---

# V1-M05 — Place the Resources

| Test ID | Test | Setup | Action | Expected result | Evidence required | Assessable from |
|---|---|---|---|---|---|---|
| V1-M05-T01 | Exact nodes | Edit mode | Inspect Resources | WoodNode and StoneNode each have one TargetPoint | Hierarchy | hierarchy |
| V1-M05-T02 | Targets safe | Edit/play | Inspect and walk to both target areas | TargetPoints are anchored, invisible, non-colliding, on reachable ground | Properties + checklist | hierarchy/video |
| V1-M05-T03 | No physics collapse | Play | Observe nodes | Visible node parts stay in place and do not trap player | Video/Output | video |

## Mission pass rule

All mandatory tests above must pass from the current code and hierarchy. Optional visual polish never compensates for a failed functional test.

---

# V1-M06 — Build the Command HUD

| Test ID | Test | Setup | Action | Expected result | Evidence required | Assessable from |
|---|---|---|---|---|---|---|
| V1-M06-T01 | HUD complete | Play | Inspect panel | All required controls visible with correct starting text | Screenshot | screenshot |
| V1-M06-T02 | Selection label | Play | Select NPC_1 then NPC_2 | SelectedNPCLabel follows current selection | Video | video |
| V1-M06-T03 | Buttons respond locally | Play | Press all four buttons | Each produces its temporary status and no game state changes | Checklist + Output | text/video |
| V1-M06-T04 | No off-screen control | Play at normal window size | Resize moderately | Required controls remain usable | Screenshot | screenshot |

## Mission pass rule

All mandatory tests above must pass from the current code and hierarchy. Optional visual polish never compensates for a failed functional test.

---

# V1-M07 — Send Safe Commands

| Test ID | Test | Setup | Action | Expected result | Evidence required | Assessable from |
|---|---|---|---|---|---|---|
| V1-M07-T01 | No selection guarded | Fresh Play; no NPC selected | Press Gather Wood | Client says select first; server receives no valid command | HUD + Output | video/text Output |
| V1-M07-T02 | Valid Wood request | Select NPC_1 | Press Gather Wood | Server validates and returns accepted NPC/resource status | HUD + server Output | video/text Output |
| V1-M07-T03 | Valid Stone request | Select NPC_2 | Press Gather Stone | Server validates and returns accepted NPC/resource status | HUD + server Output | video/text Output |
| V1-M07-T04 | Invalid command rejected | Use temporary Studio-only test then remove | Send resource string not Wood/Stone | Server rejects; no movement/state change; no crash | Server Output | text Output / future automated Studio test |
| V1-M07-T05 | Invalid NPC rejected | Temporary test with non-NPC Instance then remove | Fire command | Server rejects safely | Server Output | text Output |

## Mission pass rule

All mandatory tests above must pass from the current code and hierarchy. Optional visual polish never compensates for a failed functional test.

---

# V1-M08 — Walk to the Resource

| Test ID | Test | Setup | Action | Expected result | Evidence required | Assessable from |
|---|---|---|---|---|---|---|
| V1-M08-T01 | Path to wood | Select NPC_1 | Command Wood | NPC reaches WoodNode TargetPoint around obstacle; success status | Video + Output | video / future automated Studio test |
| V1-M08-T02 | Path to stone | Select NPC_2 | Command Stone | NPC reaches StoneNode TargetPoint | Video + Output | video |
| V1-M08-T03 | Blocked path handled | Temporarily enclose one TargetPoint | Command that resource | Function returns false; NPC stays safe; failure status; no red error | Video + Output | video/text Output |
| V1-M08-T04 | No resource award yet | Run T01/T02 | Inspect GameState | Wood and Stone remain unchanged in this mission | Hierarchy/value evidence | future automated Studio test |

## Mission pass rule

All mandatory tests above must pass from the current code and hierarchy. Optional visual polish never compensates for a failed functional test.

---

# V1-M09 — Gather and Return

| Test ID | Test | Setup | Action | Expected result | Evidence required | Assessable from |
|---|---|---|---|---|---|---|
| V1-M09-T01 | Out and home | Select NPC_1 | Command Wood | NPC reaches wood, reports collected, returns to NPC_1_Home, becomes idle | Video + Output | video |
| V1-M09-T02 | Duplicate blocked | NPC_1 travelling | Press same or other gather again | Second command is refused; no second job starts | Video + status | video |
| V1-M09-T03 | Two NPC concurrency | Command NPC_1 then quickly select/command NPC_2 | Observe both | Both run independent jobs; one busy state does not block the other | Video | video / Server & Clients optional |
| V1-M09-T04 | Failure clears busy | Force blocked path for NPC_1, then restore | Retry valid command | Failure clears busy and retry works | Output + video | video/text Output |
| V1-M09-T05 | Correct homes | Command both | Wait for return | Each returns to its own home marker | Video | video |

## Mission pass rule

All mandatory tests above must pass from the current code and hierarchy. Optional visual polish never compensates for a failed functional test.

---

# V1-M10 — Show Resource Totals

| Test ID | Test | Setup | Action | Expected result | Evidence required | Assessable from |
|---|---|---|---|---|---|---|
| V1-M10-T01 | Wood award | Reset 0/0; select NPC | Complete Wood trip | Wood becomes 2 after arrival; Stone stays 0 | HUD + GameState + Output | video/future automated Studio test |
| V1-M10-T02 | Stone award | Continue | Complete Stone trip | Stone becomes 1; Wood unchanged by this trip | HUD + GameState | video |
| V1-M10-T03 | Failed path no award | Record totals; block target | Issue command | Totals unchanged | Before/after evidence + Output | text/video |
| V1-M10-T04 | Duplicate no award | Issue command twice while busy | Wait | Only one award occurs | HUD/video | video |
| V1-M10-T05 | HUD starts from state | Set server test values then start client; restore afterward | Play | Labels match replicated values immediately | Screenshot | future automated Studio test |

## Mission pass rule

All mandatory tests above must pass from the current code and hierarchy. Optional visual polish never compensates for a failed functional test.

---

# V1-M11 — Unlock Construction

| Test ID | Test | Setup | Action | Expected result | Evidence required | Assessable from |
|---|---|---|---|---|---|---|
| V1-M11-T01 | Wood-only lock | Server test state 6 wood, 2 stone | Observe button | Build remains unavailable | Screenshot | screenshot/future automated test |
| V1-M11-T02 | Stone-only lock | Server test state 5 wood, 3 stone | Observe button | Build remains unavailable | Screenshot | screenshot |
| V1-M11-T03 | Both unlock | Server test state 6 wood, 3 stone | Observe button | Build becomes available | Screenshot | screenshot |
| V1-M11-T04 | Live update | Start below cost; gather final missing resource | Observe without restart | Button changes to available immediately | Video | video |
| V1-M11-T05 | Restore state | End tests | Reset to 0/0 | Button locked and test cheats removed | Hierarchy/code + screenshot | code/screenshot |

## Mission pass rule

All mandatory tests above must pass from the current code and hierarchy. Optional visual polish never compensates for a failed functional test.

---

# V1-M12 — Build the First Hut

| Test ID | Test | Setup | Action | Expected result | Evidence required | Assessable from |
|---|---|---|---|---|---|---|
| V1-M12-T01 | Insufficient rejected | 0/0 or below cost | Attempt build through normal UI and controlled remote test | No hut, no deduction, clear refusal | HUD/Buildings/Output | video/text |
| V1-M12-T02 | Successful build | Set/gather exactly 6/3 | Press Build Hut once | FirstHut appears at BuildSite; totals become 0/0; HutBuilt true | Video + hierarchy + values | video/future automated Studio test |
| V1-M12-T03 | Rapid double build | Reset to enough; click rapidly twice | Observe Buildings | Exactly one FirstHut; cost deducted once | Video + hierarchy | video |
| V1-M12-T04 | Repeated build later | After hut built, gather more if needed | Press Build Hut | No second hut; status says already built | Hierarchy + status | video/text |
| V1-M12-T05 | Missing template safe | Temporary rename template then restore | Attempt build with enough resources | No deduction and controlled error/status; no red crash | Output + values | text Output |

## Mission pass rule

All mandatory tests above must pass from the current code and hierarchy. Optional visual polish never compensates for a failed functional test.

---

# V1-M13 — Restart the World

| Test ID | Test | Setup | Action | Expected result | Evidence required | Assessable from |
|---|---|---|---|---|---|---|
| V1-M13-T01 | Idle reset | Create nonzero totals; NPCs idle | Press Restart World | 0/0, no hut, NPCs home, no selection, build locked | Video/checklist | video |
| V1-M13-T02 | Post-build reset | Build hut | Reset | FirstHut destroyed; HutTemplate remains; HutBuilt false | Hierarchy + video | video/hierarchy |
| V1-M13-T03 | Mid-travel reset | Start gather; reset before arrival | Wait beyond expected trip | NPC returns home; no late resource award; busy clears | Video + Output | video/text |
| V1-M13-T04 | Replay loop | After reset | Complete enough gathers and build again | Second full loop succeeds exactly once | Video | video |
| V1-M13-T05 | Two-NPC reset | Both NPCs working | Reset | Both jobs cancel and both NPCs return home | Video + Output | video |

## Mission pass rule

All mandatory tests above must pass from the current code and hierarchy. Optional visual polish never compensates for a failed functional test.

---

# V1-M14 — Prove Version 1

| Test ID | Test | Setup | Action | Expected result | Evidence required | Assessable from |
|---|---|---|---|---|---|---|
| V1-M14-T01 | Normal full loop | Clean reset | Select/gather Wood to 6; gather Stone to 3; build | Correct totals, unlock, one hut, no red errors | Full recording + outputs | video/text Output |
| V1-M14-T02 | No selection | Clean reset | Press both gather buttons | Clear local feedback; no server action | Video/Output | video/text |
| V1-M14-T03 | Invalid target | Controlled test or temporarily missing node | Issue command | Rejected/handled; no award; no crash | Output | text/future automated test |
| V1-M14-T04 | Duplicate command | NPC busy | Issue second command | Second ignored/refused; one award | Video | video |
| V1-M14-T05 | Resource unavailable | Block/remove TargetPoint temporarily then restore | Issue command | Controlled failure; no award; busy clears | Output/video | text/video |
| V1-M14-T06 | Insufficient build | Below either cost | Attempt build | No hut or deduction | Video | video |
| V1-M14-T07 | Two NPCs | Command both to different resources | Observe | Both jobs progress independently; shared totals accurate | Video | video |
| V1-M14-T08 | Repeated hut | After build | Attempt again | One hut only | Hierarchy/video | video |
| V1-M14-T09 | Stuck character | Block route during movement | Observe/retry/reset | No endless broken state; controlled failure or reset recovery | Video/Output | video/text |
| V1-M14-T10 | Test restart | Reset during work, then full loop | Observe | No stale awards; loop works again | Video | video |
| V1-M14-T11 | Two clients | Studio Server & Clients with 2 clients | Each selects a different NPC; gather/build | Highlights are local; counters/hut shared; no client/server red errors | Two-client recording + outputs | video/text Output |

## Mission pass rule

All mandatory tests above must pass from the current code and hierarchy. Optional visual polish never compensates for a failed functional test.

---

# V1-M15 — Publish Version 1

| Test ID | Test | Setup | Action | Expected result | Evidence required | Assessable from |
|---|---|---|---|---|---|---|
| V1-M15-T01 | Local backup | Final approved project | Save `.rbxl` | Version 1 backup exists with clear name | Filename/checklist | text evidence |
| V1-M15-T02 | Publish upload | Open final approved place | Publish to intended Roblox experience | Creator Dashboard shows updated experience/start place | Dashboard screenshot with private details hidden | screenshot |
| V1-M15-T03 | Metadata | Creator Dashboard | Inspect name/description/devices | Stable name and accurate first-sentence command-loop description | Text/screenshot | text/screenshot |
| V1-M15-T04 | Audience checkpoint | Parent reviews current settings | Inspect Audience and eligibility | Safe audience chosen or exact platform block recorded | Redacted screenshot + parent note | screenshot/text |
| V1-M15-T05 | Published loop smoke test | Open Roblox link outside Studio | Select, one wood trip, one stone trip, reset | Published build behaves like approved Studio build; no serious live error | Recording + Developer Console/Output | video/text |
| V1-M15-T06 | External access | Permitted tester uses link | Tester joins | Tester sees Version 1 and can interact; or exact eligibility block yields BLOCKED_NEEDS_HELP | Tester confirmation or block evidence | text/video |
| V1-M15-T07 | Version match | After any final code fix | Republish and reopen link | Live build contains the fix and release note/link record updated | Checklist/video | video/text |

## Mission pass rule

All mandatory tests above must pass from the current code and hierarchy. Optional visual polish never compensates for a failed functional test.


---

# Final Version 1 integration test

## Clean-start setup

1. Use the approved final scripts and canonical hierarchy.
2. Start a fresh Play session or press Restart World and verify the exact initial state.
3. Clear client and server Output.
4. Record the normal loop continuously so evidence cannot be assembled from unrelated attempts.

## Normal full loop

1. Confirm exactly `NPC_1` and `NPC_2` are present and idle.
2. Click `NPC_1`; verify the local selection Highlight and selected label.
3. Command Wood; verify NPC_1 reaches WoodNode, Wood increases by 2 only after arrival, and NPC_1 returns home.
4. Repeat Wood commands until Wood equals 6.
5. Select `NPC_2`; command Stone and verify Stone increases by 1 only after arrival.
6. Continue until Stone equals 3. During one trip, command the other NPC so both work at once.
7. Verify Build Hut remained locked at 6/2 and becomes available at 6/3.
8. Press Build Hut once. Verify FirstHut appears at BuildSite, Wood and Stone become 0/0, and HutBuilt is true.
9. Press Build Hut again or send a controlled repeat request. Verify there is still exactly one FirstHut and no second deduction.
10. Press Restart World. Verify the full reset contract.
11. Repeat enough of the loop to prove the game still works after reset.
12. Confirm there are no unresolved red runtime errors caused by project code.

## Required edge-case matrix

### No NPC selected
- Press both gather buttons from a clean start.
- Expected: local guidance only; no server job, movement, or resource change.

### Invalid target or command
- Use a controlled Studio-only test that is removed afterward, or temporarily rename/remove a TargetPoint.
- Expected: server validation or target lookup rejects the action; no award, no crash, busy clears.

### Command issued twice
- Issue a second order to the same NPC while travelling.
- Expected: one active job and one award only; clear busy feedback.

### Resource unavailable
- Make one TargetPoint unreachable or temporarily unavailable.
- Expected: path/lookup failure is handled; totals unchanged; NPC can receive a later valid command.

### Insufficient resources
- Test at 6/2 and 5/3.
- Expected: construction unavailable and server refuses any forced request.

### Two NPCs receiving commands
- Send NPC_1 and NPC_2 to different nodes close together.
- Expected: both work independently; shared totals remain accurate.

### Repeated hut construction
- Rapidly press Build twice and later try again.
- Expected: exactly one live hut and one deduction.

### Character becoming stuck
- Block a route during movement or force a failed waypoint.
- Expected: controlled failure or reset recovery, no permanent busy lock, no endless award loop.

### Test restart
- Reset while one or both NPCs are travelling.
- Expected: generation changes, old jobs cannot award late resources, all state returns cleanly.

### Two-client behaviour
- Use Studio Server & Clients with two clients.
- Each client selects a different NPC.
- Expected: each client sees only its own Highlight selection; both clients see the same server totals and hut.

## Integration approval evidence bundle

- Current full `CommandClient` and `WorldServer`.
- Current hierarchy snapshot.
- Continuous normal-loop recording.
- Edge-case checklist with test IDs and outcomes.
- Client and server Output from the final run.
- Two-client evidence.
- Statement confirming all temporary test code was removed.


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
