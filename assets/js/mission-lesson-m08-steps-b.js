(function(){
"use strict";
const lesson=window.WORLDMAKER_LESSONS&&window.WORLDMAKER_LESSONS["V1-M08"];
if(!lesson)throw new Error("Load the V1-M08 core lesson first.");
lesson.steps.push(...[
  {
    "title":"Observe — test Wood, then test Stone",
    "actions":[
      "Open Output from View > Output or Window > Output. Clear old messages.",
      "Press Play. Select NPC_1. Press Gather Wood once.",
      "Watch NPC_1 walk around the obstacle and stop at Workspace > World > Resources > WoodNode > TargetPoint.",
      "The status label should report success. Output should include [M8] PATH SUCCESS NPC_1 -> Wood or the exact success wording used by your current WorldServer.",
      "Wood must not increase. NPC_2 must not move because this command selected NPC_1.",
      "Press Stop. Clear Output. Press Play again. Select NPC_2 and press Gather Stone once.",
      "Watch NPC_2 reach StoneNode > TargetPoint. The status label should report success and Output should include [M8] PATH SUCCESS NPC_2 -> Stone.",
      "Stone must not increase. Stop Play before editing anything."
    ],
    "checkpoint":"NPC_1 reaches Wood and NPC_2 reaches Stone in separate clean runs. Each run has a matching success message, no red WorldServer error, and unchanged totals.",
    "recovery":"Wrong NPC or wrong resource means the TargetPoint-selection branch is wrong. No movement means check Anchored on the NPC body parts, Humanoid/HumanoidRootPart names, and the first red WorldServer line. Straight-line collision means confirm the function follows all waypoints instead of moving directly to the final target.",
    "codeBlocks":[]
  },
  {
    "title":"Experiment — block one route temporarily and restore it",
    "actions":[
      "Stop Play. In Explorer, move the mouse over Workspace > World > Ground and click +, then choose Part.",
      "Rename the new Part exactly M8_TemporaryBlock. Set Anchored = true.",
      "Make it large enough to form a closed box or solid barrier around one TargetPoint with no NPC-sized opening. Keep it separate from permanent map pieces.",
      "For easier placement, temporarily set the chosen TargetPoint Transparency to 0.5. Do not move or rename the TargetPoint.",
      "Clear Output and press Play. Select the matching NPC and command the blocked resource.",
      "Expected result: the status label reports that the route failed, Output contains a PATH FAILED or MOVE FAILED line, the NPC stays safe, and no red WorldServer error appears.",
      "Stop Play immediately after capturing the failure proof.",
      "Delete M8_TemporaryBlock. Return TargetPoint Transparency to 1. Search Explorer for M8_TemporaryBlock and confirm nothing is found.",
      "Remove any temporary test-only print or code that is not part of the final lesson result. Run one normal route again to prove the map is restored."
    ],
    "checkpoint":"The temporary block causes a safe false result, then is deleted. The restored map completes a normal route again, and no temporary object or test code remains.",
    "recovery":"If the NPC still reaches the target, the block left an opening or did not surround the destination. Stop Play, adjust only M8_TemporaryBlock, and retry. If deleting the block also deletes a permanent object, undo immediately and confirm you selected the exact temporary Part.",
    "codeBlocks":[]
  },
  {
    "title":"Fix — use the symptom to choose the next check",
    "actions":[
      "NPC does not move and Output says PATH FAILED: first check whether the TargetPoint is buried, enclosed, above empty space, or separated by a gap too narrow for the NPC. This is usually a map or destination problem.",
      "Output shows a red error mentioning WorldServer: double-click the first red line and inspect that exact code line. This is usually a code or object-name problem.",
      "NPC walks partway and then stops: read the MOVE FAILED waypoint number. Check the obstacle width near that place, the jump check, and the saved MoveToFinished result.",
      "NPC never starts and no path message appears: confirm the existing CommandNPC handler calls moveNPCTo after the M7 validation succeeds.",
      "NPC body stays still: expand the NPC and confirm HumanoidRootPart and body parts have Anchored = false.",
      "Error path begins with cloud_, a plugin name, or an unrelated package: it is probably plugin noise. Do not rewrite WorldServer unless the error also points to WorldServer or CommandClient.",
      "Wood NPC goes to Stone or Stone NPC goes to Wood: inspect only the small resourceName-to-TargetPoint selection block."
    ],
    "checkpoint":"Before changing code, you can name the likely area: map/TargetPoint, WorldServer code, NPC setup, or unrelated plugin noise.",
    "recovery":"Change one likely cause at a time, clear Output, and repeat only the affected test. Do not replace the complete WorldServer because one path or one object is wrong.",
    "codeBlocks":[]
  },
  {
    "title":"Prove — confirm this mission changes walking only",
    "actions":[
      "Before Play, open ReplicatedStorage > GameState and read Wood.Value and Stone.Value.",
      "Run one successful Wood walk and one successful Stone walk.",
      "Stop Play and check the totals again. They must match the values from before the tests.",
      "Search the new M8 section of WorldServer for Wood.Value, Stone.Value, +=, or code that awards resources. Remove any new reward line from M8.",
      "The HUD may say that movement succeeded or failed, but the Wood and Stone numbers must not increase.",
      "Do not add collecting, returning home, busy flags, gathering delays, or resource rewards yet. Those features belong to later missions."
    ],
    "checkpoint":"Wood and Stone remain unchanged after both successful walks and the blocked-route experiment. M8 contains movement and status reporting only.",
    "recovery":"If either total changes, stop. Remove the new award line, reset the test values to their correct starting state, and repeat the two walks before submitting.",
    "codeBlocks":[]
  },
  {
    "title":"Prove — show that the walking system works",
    "actions":[
      "Walk NPC_1 to Wood and record the complete movement plus the success status. Supporting ID: V1-M08-T01.",
      "Walk NPC_2 to Stone and record the complete movement plus the success status. Supporting ID: V1-M08-T02.",
      "Add M8_TemporaryBlock, show one safe failure with no red Nick-code error, then delete the block and prove the normal route works again. Supporting ID: V1-M08-T03.",
      "Show Wood and Stone before and after the movement tests so it is clear that neither total changed. Supporting ID: V1-M08-T04.",
      "Before collecting evidence, confirm WorldServer is the only server Script changed for M8 and CommandClient still contains the working M7 request and status-display code."
    ],
    "checkpoint":"All four child-readable checks are current, consistent, and made from the same final code after temporary setup was removed.",
    "recovery":"Missing safe-failure proof means the walking code may be good but the lesson is not fully proven. A red WorldServer error or a movement branch that continues after false must be fixed before submission.",
    "codeBlocks":[]
  },
  {
    "title":"Prove — send a small, clear submission",
    "actions":[
      "Code: copy the complete current moveNPCTo function and the complete small WorldServer command section that chooses WoodNode or StoneNode TargetPoint and uses the true-or-false result. Do not crop out the failure branches.",
      "Explorer picture: expand Workspace > World > NPCs, Resources > WoodNode > TargetPoint, Resources > StoneNode > TargetPoint, and ServerScriptService > WorldServer in one or two screenshots. Show the TargetPoint Properties in a second picture only when one picture cannot show them clearly.",
      "Output: paste the current Wood success line, Stone success line, and one blocked-route PATH FAILED or MOVE FAILED line. Include any red line that mentions WorldServer; do not copy unrelated old Output.",
      "Success video: show selecting NPC_1, pressing Wood, the complete walk, and the success status; then show NPC_2 doing the same for Stone. One labelled combined video is fine.",
      "Blocked-route video: show M8_TemporaryBlock, the command, the safe failure message, and the NPC remaining safe. The final submitted Explorer picture must show that the block is gone.",
      "Unchanged totals: show Wood and Stone before and after the tests in one short recording or two clear screenshots.",
      "Final cleanup: delete M8_TemporaryBlock, restore TargetPoint Transparency to 1, remove temporary test code, stop Play, save, and run one last clean route before sending."
    ],
    "checkpoint":"The reviewer can see the exact code, exact object locations, successful movement, safe failure, clean Output, unchanged totals, and completed cleanup without Nick manually typing the Explorer tree.",
    "recovery":"If one item is missing, add only that item. Do not repeat or retype evidence that is already visible and current.",
    "codeBlocks":[]
  }
]);
})();
