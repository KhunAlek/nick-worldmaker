import fs from "node:fs";
import vm from "node:vm";

const files=[
  "assets/js/mission-lesson-m08-walk-to-resource.js",
  "assets/js/mission-lesson-m08-steps-a.js",
  "assets/js/mission-lesson-m08-steps-b.js",
  "assets/js/mission-lesson-m08-finish.js"
];
const sources=files.map(path=>fs.readFileSync(path,"utf8"));
const context={window:{}};
vm.createContext(context);
for(const source of sources)vm.runInContext(source,context);
const mission=context.window.WORLDMAKER_LESSONS["V1-M08"];
const joined=JSON.stringify(mission);
const renderer=fs.readFileSync("assets/js/mission-m08-beginner-render.js","utf8");
const review=fs.readFileSync("review/V1-M08-sanitized-lesson-review.html","utf8");
const expected=["V1-M08-T01","V1-M08-T02","V1-M08-T03","V1-M08-T04"];
const assert=(condition,message)=>{if(!condition)throw new Error(message);};

assert(mission?.id==="V1-M08","V1-M08 lesson missing or renamed");
assert(mission.steps.length===12,"M8 must render exactly twelve beginner teaching stages");
assert(JSON.stringify(mission.tests.map(test=>test.id))===JSON.stringify(expected),"M8 canonical test IDs changed");
for(const term of ["TargetPoint","PathfindingService","Enum.PathStatus.Success","waypoint","list","loop","return false","MoveToFinished","timeout","Enum.PathWaypointAction.Jump","plugin noise"]){
  assert(joined.includes(term),`Missing beginner explanation or required topic: ${term}`);
}
for(const path of ["Workspace > World > Resources > WoodNode > TargetPoint","Workspace > World > Resources > StoneNode > TargetPoint","ServerScriptService > WorldServer"]){
  assert(joined.includes(path),`Missing exact beginner path: ${path}`);
}
for(const phrase of ["M8_TemporaryBlock","Wood and Stone remain unchanged","Do not add collecting, returning home, busy flags","Show that your walking system works","Show what you built"]){
  assert(joined.includes(phrase),`Missing required child-facing guidance: ${phrase}`);
}
assert(!joined.includes("Canonical tests"),"Learner lesson still says Canonical tests");
assert(!joined.includes("Submission evidence"),"Learner lesson still says Submission evidence");
assert(!joined.includes("protect M9 work"),"Abstract protect-M9 wording remains");
assert(!joined.includes("V1-M09"),"M9 content or functionality was introduced");
assert(renderer.includes("m8-code-card")&&renderer.includes("Show what you built"),"M8 visual beginner renderer is incomplete");
assert(review.includes("mission-lesson-m08-steps-a.js")&&review.includes("mission-lesson-m08-steps-b.js"),"Sanitized review does not load the exact split M8 source");
assert(!review.includes("localStorage")&&!review.includes("sessionStorage")&&!review.includes("/api/"),"Sanitized review can access learner data");
console.log(JSON.stringify({mission:"V1-M08",stages:mission.steps.length,tests:expected,lesson_contract:"PASS",evidence_mapping:"PASS",renderer_contract:"PASS",sanitized_review:"PASS",m9_untouched:"PASS"},null,2));
