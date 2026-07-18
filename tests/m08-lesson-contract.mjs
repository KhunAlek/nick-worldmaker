import fs from "node:fs";
import vm from "node:vm";

const files=[
  "assets/js/mission-lesson-m08-walk-to-resource.js",
  "assets/js/mission-lesson-m08-steps-a.js",
  "assets/js/mission-lesson-m08-steps-b.js",
  "assets/js/mission-lesson-m08-finish.js"
];
const context={window:{}};
vm.createContext(context);
for(const file of files)vm.runInContext(fs.readFileSync(file,"utf8"),context,{filename:file});
const mission=context.window.WORLDMAKER_LESSONS["V1-M08"];
const joined=JSON.stringify(mission);
const codeBlocks=mission.steps.flatMap(step=>step.codeBlocks||[]).map(block=>block.code).join("\n");
const renderer=fs.readFileSync("assets/js/mission-m08-beginner-render.js","utf8");
const review=fs.readFileSync("review/V1-M08-sanitized-lesson-review.html","utf8");
const loader=fs.readFileSync("assets/js/missions-data.js","utf8");
const expectedTests=["V1-M08-T01","V1-M08-T02","V1-M08-T03","V1-M08-T04"];
const assert=(condition,message)=>{if(!condition)throw new Error(message);};

assert(mission?.id==="V1-M08","V1-M08 lesson missing or renamed");
assert(mission.steps.length===12,"M8 must render exactly twelve beginner teaching stages");
assert(JSON.stringify(mission.tests.map(test=>test.id))===JSON.stringify(expectedTests),"M8 canonical test IDs changed");

// One exact bounded function, one consistent canonical signature, and a matching call.
assert(codeBlocks.includes("local function moveNPCTo(npc, destinationPosition)"),"Complete canonical moveNPCTo signature missing");
assert(codeBlocks.includes("path:ComputeAsync(root.Position, destinationPosition)"),"Function does not use destinationPosition consistently");
assert(codeBlocks.includes("local arrived = moveNPCTo(npc, targetPoint.Position)"),"Validated handler does not call moveNPCTo with the chosen TargetPoint position");
assert(!codeBlocks.includes("local function moveNPCTo(npc, targetPoint)"),"Conflicting lesson signature remains");
assert(!codeBlocks.includes("MoveToFinished:Wait()"),"Unbounded MoveToFinished:Wait remains");
for(const phrase of ["os.clock() - waitStarted < 8","connection:Disconnect()","if not finished or not reached","return false"]){
  assert(codeBlocks.includes(phrase),`Bounded movement protection missing: ${phrase}`);
}

// The exact M7-to-M8 integration and true/false handling must be taught, not merely requested as evidence.
for(const phrase of [
  "CommandNPC.OnServerEvent:Connect(function(player, npc, resourceName)",
  "resourceName == \"Wood\" or resourceName == \"Stone\"",
  "resourceName .. \"Node\"",
  "resourceNode:FindFirstChild(\"TargetPoint\")",
  "if arrived then"
])assert(codeBlocks.includes(phrase),`Exact handler integration missing: ${phrase}`);

// Status, Output, and evidence wording must name the same NPC and resource.
for(const phrase of [
  "[M8] PATH SUCCESS NPC_1 -> Wood",
  "[M8] PATH SUCCESS NPC_2 -> Stone",
  "[M8] PATH FAILED NPC_2 -> Stone",
  "NPC_1 arrived at Wood",
  "NPC_2 arrived at Stone",
  "NPC_2 could not reach Stone"
])assert(joined.includes(phrase),`Exact success/failure wording missing: ${phrase}`);
assert(codeBlocks.includes("\"[M8] PATH SUCCESS \" .. npc.Name .. \" -> \" .. resourceName"),"Success Output omits the requested resource");
assert(codeBlocks.includes("\"[M8] PATH FAILED \" .. npc.Name .. \" -> \" .. resourceName"),"Failure Output omits the requested resource");

// Blocked-route instructions must be reproducible and fully cleaned up.
for(const phrase of [
  "exactly five Parts","NorthWall","SouthWall","EastWall","WestWall","Roof",
  "Size to 14, 8, 1","Size to 1, 8, 12","Roof Size to 14, 1, 14",
  "Orientation = 0, 0, 0","no NPC-sized gap","delete the complete Workspace > World > M8_TemporaryBlock Model"
])assert(joined.includes(phrase),`Temporary-block construction or cleanup detail missing: ${phrase}`);

// T04 must be one uninterrupted Play run so Stop cannot reset totals between readings.
for(const phrase of ["BEFORE","AFTER","without pressing Stop","same uninterrupted Play run","Studio could not reset the totals"]){
  assert(joined.includes(phrase),`Continuous before-and-after proof missing: ${phrase}`);
}

// Mission boundary and exact source-loading order.
for(const phrase of ["Do not add Wood or Stone awards","return-home movement","busy flags","M8 ends after walking reports true or false"]){
  assert(joined.includes(phrase),`M8/M9 boundary missing: ${phrase}`);
}
assert(!joined.includes("V1-M09"),"M9 content or functionality was introduced");
assert(renderer.includes("m8-code-card")&&renderer.includes("Show what you built"),"M8 visual beginner renderer is incomplete");
let previous=-1;
for(const file of files){
  const short=file.split("/").at(-1);
  const reviewIndex=review.indexOf(short);
  const loaderIndex=loader.indexOf(short);
  assert(reviewIndex>previous,`Sanitized review source order is wrong at ${short}`);
  assert(loaderIndex>=0,`Learner loader does not include ${short}`);
  previous=reviewIndex;
}
assert(review.includes("COMPLETE M8 SOURCE ORDER"),"Sanitized review was not regenerated for the complete repaired journey");
assert(!review.includes("localStorage")&&!review.includes("sessionStorage")&&!review.includes("/api/"),"Sanitized review can access learner data");

console.log(JSON.stringify({
  mission:"V1-M08",
  stages:mission.steps.length,
  tests:expectedTests,
  exact_function:"PASS",
  handler_integration:"PASS",
  bounded_waits:"PASS",
  output_status_evidence:"PASS",
  continuous_totals_proof:"PASS",
  temporary_block_and_cleanup:"PASS",
  lesson_contract:"PASS",
  renderer_contract:"PASS",
  sanitized_review_source_equivalence:"PASS",
  m9_untouched:"PASS"
},null,2));
