(function(){
"use strict";
const lesson=window.WORLDMAKER_LESSONS&&window.WORLDMAKER_LESSONS["V1-M08"];
if(!lesson)throw new Error("Load the V1-M08 core lesson first.");
lesson.steps.push(...[
  {
    "title":"Experiment — build one exact temporary enclosure",
    "actions":[
      "Stop Play. In Explorer, move the mouse over Workspace > World, click the small + button, choose Model, and rename it exactly M8_TemporaryBlock.",
      "Choose the Stone TargetPoint for this experiment. Click it and copy its Position numbers X, Y, and Z from Properties onto paper. Do not change its Position.",
      "Inside M8_TemporaryBlock, insert exactly five Parts. Rename them NorthWall, SouthWall, EastWall, WestWall, and Roof. Set Anchored = true and Orientation = 0, 0, 0 on all five.",
      "Set NorthWall and SouthWall Size to 14, 8, 1. Use Position X, Y + 4, Z + 6.5 for NorthWall and X, Y + 4, Z - 6.5 for SouthWall.",
      "Set EastWall and WestWall Size to 1, 8, 12. Use Position X + 6.5, Y + 4, Z for EastWall and X - 6.5, Y + 4, Z for WestWall.",
      "Set Roof Size to 14, 1, 14 and Position to X, Y + 8, Z. The existing ground closes the bottom.",
      "Set all five Parts CanCollide = false for the start of the continuous proof run. Temporarily set StoneNode > TargetPoint Transparency = 0.5 and check in the 3D view that it is centered inside four touching walls with the roof above and no NPC-sized gap. Return Transparency to 1.",
      "Do not move, resize, rotate, or rename any permanent map object."
    ],
    "checkpoint":"M8_TemporaryBlock is one Model containing exactly five anchored Parts with the listed names, sizes, positions, and zero orientation; Stone TargetPoint is centered inside, and CanCollide is false before Play.",
    "recovery":"If the walls do not form a closed square, recheck plus and minus signs and the 6.5 offsets. If the roof is beside the walls, recheck that only Y has + 8. If any permanent object moved, use Undo immediately and edit only the five Parts inside M8_TemporaryBlock.",
    "codeBlocks":[]
  },
  {
    "title":"Observe — prove the enclosure really blocks the route",
    "actions":[
      "Press Play. Keep this same Play run open until Stage 10 says to stop.",
      "In Explorer, expand Workspace > World > M8_TemporaryBlock. Select all five Parts and change CanCollide from false to true in Properties.",
      "Look around the enclosure in the 3D view. Confirm the four walls touch at the corners, the roof covers the full top, the ground closes the bottom, and Stone TargetPoint is inside. This visual check must happen before calling the route blocked.",
      "Select NPC_2 and press Gather Stone once.",
      "Wait up to 8 seconds for each attempted waypoint. NPC_2 must remain outside the enclosure and safe.",
      "The status label must say NPC_2 could not reach Stone. Output must say [M8] PATH FAILED NPC_2 -> Stone. No red WorldServer error may appear.",
      "If NPC_2 enters or reaches the TargetPoint, the route was not genuinely blocked. Do not keep that evidence. Press Stop and use Stage 7 recovery before trying again."
    ],
    "checkpoint":"The visible closed five-Part enclosure prevents NPC_2 from reaching Stone, and the exact status and Output failure agree on NPC_2 and Stone.",
    "recovery":"If the NPC reaches Stone, stop Play and inspect every corner, the roof, and the ground contact. Correct only a gap or wrong Position, then restart the entire continuous proof from Stage 10's beginning.",
    "codeBlocks":[]
  },
  {
    "title":"Fix — restore the normal route inside the same run",
    "actions":[
      "Do not press Stop yet. Select all five Parts inside M8_TemporaryBlock and change CanCollide back to false.",
      "Select NPC_2 and press Gather Stone once again.",
      "NPC_2 must now reach StoneNode > TargetPoint.",
      "The status label must say NPC_2 arrived at Stone. Output must say [M8] PATH SUCCESS NPC_2 -> Stone.",
      "This failed-then-successful pair proves the controlled obstacle caused the failure and that the NPC can receive a later valid command."
    ],
    "checkpoint":"In one uninterrupted Play run, Stone fails while the five Parts collide and succeeds after those same Parts stop colliding.",
    "recovery":"If the restored route still fails, confirm all five CanCollide values are false and the TargetPoint was not moved. If needed, stop and restart the complete continuous proof; do not edit WorldServer based only on an enclosure setup mistake.",
    "codeBlocks":[]
  },
  {
    "title":"Prove — capture unchanged totals without a Studio reset",
    "actions":[
      "Start this proof again from Play if Stages 8–9 were interrupted. Do not press Stop anywhere in the following before-and-after sequence.",
      "At the start of the Play run, expand ReplicatedStorage > GameState. Record the visible Wood.Value and Stone.Value in the video or one screenshot. Say or label this BEFORE.",
      "With the enclosure Parts CanCollide = false, command NPC_1 to Wood and NPC_2 to Stone and show both exact PATH SUCCESS lines.",
      "Change all five enclosure Parts to CanCollide = true, command NPC_2 to Stone, and show the exact PATH FAILED line with NPC_2 remaining outside.",
      "Change all five Parts back to CanCollide = false and command NPC_2 to Stone once more to show the restored PATH SUCCESS line.",
      "Still without pressing Stop, return to ReplicatedStorage > GameState and show Wood.Value and Stone.Value again. Say or label this AFTER.",
      "BEFORE and AFTER must be identical. Because Play never stopped between them, Studio could not reset the totals and create false proof.",
      "Now press Stop. In Edit mode, delete the complete Workspace > World > M8_TemporaryBlock Model. Search Explorer for M8_TemporaryBlock and confirm no result. Confirm Stone TargetPoint Transparency = 1, save, and run one final normal Stone route."
    ],
    "checkpoint":"One continuous recording shows BEFORE totals, Wood success, Stone success, blocked Stone failure, restored Stone success, and identical AFTER totals before Stop; afterward the Model is deleted and a clean route works.",
    "recovery":"If Play stopped before AFTER totals were shown, discard that totals proof and repeat the whole continuous sequence. If either total changes during the run, stop, remove any M8 award code, restore the correct starting state through the normal Studio reset, and repeat from BEFORE.",
    "codeBlocks":[]
  },
  {
    "title":"Fix — use the first wrong sign",
    "actions":[
      "PATH FAILED on an open route: check TargetPoint placement, an NPC-sized opening, and all five temporary Parts being deleted or non-colliding.",
      "A red WorldServer line: double-click the first red line and compare that exact area with the complete Stage 2 code.",
      "No path message after a valid click: search for duplicate handlers and confirm the one M8 handler calls moveNPCTo after validation.",
      "Wood goes to Stone or Stone goes to Wood: compare resourceName .. \"Node\" and targetPoint inside the chosen node.",
      "The status and Output name different resources: restore the exact arrived/else branch from Stage 2; both messages must use the same resourceName.",
      "An error beginning with cloud_, a plugin name, or an unrelated package is plugin noise unless it also points to WorldServer or CommandClient."
    ],
    "checkpoint":"Every likely problem points to one exact place: destination setup, complete movement function, one validated handler, or temporary enclosure.",
    "recovery":"Change one likely cause, clear Output, and repeat the affected test. After any code change, rerun the complete continuous proof before submitting.",
    "codeBlocks":[]
  },
  {
    "title":"Prove — send one current, cleaned M8 evidence set",
    "actions":[
      "Code: copy the complete current moveNPCTo(npc, destinationPosition) function and complete CommandNPC handler. Include the TargetPoint selection, call, Boolean arrived branch, and both failure branches.",
      "Explorer and Properties: show both NPCs, both resource TargetPoints, WorldServer, and the TargetPoint Anchored, CanCollide, and Transparency values.",
      "Output: paste [M8] PATH SUCCESS NPC_1 -> Wood, [M8] PATH SUCCESS NPC_2 -> Stone, and [M8] PATH FAILED NPC_2 -> Stone from the final continuous run. Include any current red line mentioning WorldServer or CommandClient.",
      "Video: show the complete Stage 10 continuous run, including BEFORE and AFTER totals before Stop, the five-Part enclosure switching on and off, safe failure, restored success, and cleanup after Stop.",
      "Final Explorer proof: search for M8_TemporaryBlock and show that nothing remains. Confirm both TargetPoints have Transparency = 1.",
      "Do not add Wood or Stone awards, a collecting pause, return-home movement, busy flags, a hut, or any other later-mission behavior. M8 ends after walking reports true or false."
    ],
    "checkpoint":"The reviewer can reproduce the final lesson from the exact code and can see matching success/failure wording, genuine blocked-route proof, continuous unchanged-total proof, and complete cleanup.",
    "recovery":"If one item is missing or comes from an older run, repeat only the necessary final proof with the current code. Any changed code requires a new complete continuous run.",
    "codeBlocks":[]
  }
]);
})();
