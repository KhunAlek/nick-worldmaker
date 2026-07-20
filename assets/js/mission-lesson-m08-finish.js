(function(){
"use strict";
const lesson=window.WORLDMAKER_LESSONS&&window.WORLDMAKER_LESSONS["V1-M08"];
if(!lesson)throw new Error("Load the V1-M08 core lesson first.");
lesson.tests=[
  {"id":"V1-M08-T01","name":"Walk NPC_1 to Wood","setup":"In one clean Play run, keep the route open and show the starting totals","action":"Select NPC_1 and press Gather Wood","expected":"NPC_1 reaches WoodNode > TargetPoint; status says NPC_1 arrived at Wood; Output says [M8] PATH SUCCESS NPC_1 -> Wood; no red Nick-code error appears"},
  {"id":"V1-M08-T02","name":"Walk NPC_2 to Stone","setup":"Continue the same Play run with the temporary enclosure non-colliding","action":"Select NPC_2 and press Gather Stone","expected":"NPC_2 reaches StoneNode > TargetPoint; status says NPC_2 arrived at Stone; Output says [M8] PATH SUCCESS NPC_2 -> Stone"},
  {"id":"V1-M08-T03","name":"Show one safe blocked-route failure","setup":"In that Play run, use the exact five-Part M8_TemporaryBlock enclosure and set all five Parts CanCollide = true","action":"Command NPC_2 to Stone once, then set the five Parts non-colliding and retry","expected":"The closed enclosure keeps NPC_2 outside; status says NPC_2 could not reach Stone; Output says [M8] PATH FAILED NPC_2 -> Stone; the restored route then succeeds; the Model is deleted after Stop"},
  {"id":"V1-M08-T04","name":"Show that totals did not change","setup":"Show Wood and Stone BEFORE at the start of the same uninterrupted Play run","action":"Run Wood success, Stone success, blocked Stone failure, and restored Stone success without pressing Stop; then show AFTER","expected":"BEFORE and AFTER Wood and Stone values are identical before Stop; M8 awards nothing"}
];
lesson.submission={
  "fields":[
    {"key":"code","label":"WorldServer movement code","help":"Paste the complete moveNPCTo function and the complete small command section that chooses the TargetPoint and handles the true-or-false result."},
    {"key":"explorer_summary","label":"Explorer and Properties pictures","help":"Attach or describe the current screenshots showing both NPCs, both TargetPoints, WorldServer, and TargetPoint properties. Do not type the full tree by hand when the screenshot already shows it."},
    {"key":"output","label":"Current movement Output","help":"Paste the exact current Wood success, Stone success, and blocked Stone failure lines, including -> Wood or -> Stone. Include any current red WorldServer or CommandClient error."},
    {"key":"videos","label":"One continuous proof recording","help":"Show BEFORE totals, Wood success, Stone success, the five-Part enclosure becoming colliding, safe blocked failure, restored success, identical AFTER totals before Stop, and cleanup after Stop."},
    {"key":"checklist","label":"Four walking checks","help":"Confirm the four listed checks only after running them with the final code and removing the temporary block."},
    {"key":"understanding","label":"One short explanation","help":"Explain in your own words why the code checks for a usable route before reading waypoints, and why it stops when one MoveTo result is false."}
  ],
  "understanding":"Why must WorldServer stop before reading waypoints when Roblox did not find a usable route, and why must one failed MoveTo result stop the rest of the walk?"
};
})();
