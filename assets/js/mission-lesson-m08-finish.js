(function(){
"use strict";
const lesson=window.WORLDMAKER_LESSONS&&window.WORLDMAKER_LESSONS["V1-M08"];
if(!lesson)throw new Error("Load the V1-M08 core lesson first.");
lesson.tests=[
  {"id":"V1-M08-T01","name":"Walk NPC_1 to Wood","setup":"Start a clean Play run with an open route and unchanged totals","action":"Select NPC_1 and press Gather Wood","expected":"NPC_1 reaches WoodNode > TargetPoint around the obstacle, the status reports success, and no red Nick-code error appears"},
  {"id":"V1-M08-T02","name":"Walk NPC_2 to Stone","setup":"Start a second clean Play run with an open route and unchanged totals","action":"Select NPC_2 and press Gather Stone","expected":"NPC_2 reaches StoneNode > TargetPoint, the status reports success, and no red Nick-code error appears"},
  {"id":"V1-M08-T03","name":"Show one safe blocked-route failure","setup":"Add only M8_TemporaryBlock around one TargetPoint, then clear Output","action":"Command the blocked resource once","expected":"WorldServer reports PATH FAILED or MOVE FAILED, returns false, leaves the NPC safe, and the temporary block is removed afterward"},
  {"id":"V1-M08-T04","name":"Show that totals did not change","setup":"Record Wood and Stone before the movement tests","action":"Run the Wood, Stone, and blocked-route checks, then read the totals again","expected":"Wood and Stone have exactly the same values as before; M8 awards nothing"}
];
lesson.submission={
  "fields":[
    {"key":"code","label":"WorldServer movement code","help":"Paste the complete moveNPCTo function and the complete small command section that chooses the TargetPoint and handles the true-or-false result."},
    {"key":"explorer_summary","label":"Explorer and Properties pictures","help":"Attach or describe the current screenshots showing both NPCs, both TargetPoints, WorldServer, and TargetPoint properties. Do not type the full tree by hand when the screenshot already shows it."},
    {"key":"output","label":"Current movement Output","help":"Paste the current Wood success, Stone success, and blocked-route failure lines. Include any current red WorldServer or CommandClient error."},
    {"key":"videos","label":"Short current movement recordings","help":"Provide one labelled combined video or short links showing Wood success, Stone success, safe blocked failure, cleanup, and unchanged totals."},
    {"key":"checklist","label":"Four walking checks","help":"Confirm the four listed checks only after running them with the final code and removing the temporary block."},
    {"key":"understanding","label":"One short explanation","help":"Explain in your own words why the code checks for a usable route before reading waypoints, and why it stops when one MoveTo result is false."}
  ],
  "understanding":"Why must WorldServer stop before reading waypoints when Roblox did not find a usable route, and why must one failed MoveTo result stop the rest of the walk?"
};
})();
