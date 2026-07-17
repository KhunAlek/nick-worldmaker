(function(){
  "use strict";
  const lessons=window.WORLDMAKER_LESSONS||(window.WORLDMAKER_LESSONS={});
  const test=(id,name,setup,action,expected)=>({id,name,setup,action,expected});
  const field=(key,label,help)=>({key,label,help});
  const step=(title,actions,checkpoint,recovery)=>({title,actions,checkpoint,recovery});
  lessons["V1-M08"]={
    id:"V1-M08",title:"Walk to the Resource",difficulty:"Challenging",
    objective:"Make the selected settler walk around obstacles to the requested resource, or stop safely and explain why it could not get there.",
    whyItMatters:"A command is only useful when the settler can reach the correct place without teleporting, crashing, getting stuck forever, or changing resources too early.",
    startingState:"Mission 7 is approved. CommandClient sends a validated Wood or Stone request to WorldServer and displays the server response. NPC_1, NPC_2, WoodNode, StoneNode, and both TargetPoints already exist.",
    visibleResult:"NPC_1 can reach WoodNode and NPC_2 can reach StoneNode by following a calculated route. A blocked or failed route returns a clear failure, leaves the NPC safe, and does not change Wood or Stone.",
    concepts:[
      {name:"Route finder",text:"Roblox can calculate a safe route around obstacles instead of moving in one straight line. Roblox calls this PathfindingService."},
      {name:"Path",text:"The calculated route from the NPC's current position to the selected TargetPoint."},
      {name:"Waypoint",text:"One stop along the route. The NPC walks through the waypoints in order."},
      {name:"Map problem or code problem",text:"A correct script can still fail when the target is buried or sealed off. A clear open route that still fails usually points back to code or NPC setup."}
    ],
    hierarchy:"Workspace\n└── World\n    ├── NPCs\n    │   ├── NPC_1 (Model)\n    │   │   ├── Humanoid\n    │   │   └── HumanoidRootPart\n    │   └── NPC_2 (Model)\n    │       ├── Humanoid\n    │       └── HumanoidRootPart\n    └── Resources\n        ├── WoodNode (Model)\n        │   └── TargetPoint (Part)\n        └── StoneNode (Model)\n            └── TargetPoint (Part)\n\nReplicatedStorage\n├── Remotes\n│   ├── CommandNPC\n│   └── StatusMessage\n└── GameState\n    ├── Wood\n    └── Stone\n\nServerScriptService\n└── WorldServer (Script) — all new M8 movement code belongs here\n\nStarterGui\n└── CommandGui\n    └── CommandClient (LocalScript) — keep the existing M7 request and status-display code",
    steps:[
      step("Understand — see the route before the code",[
        "Imagine dots placed around the obstacle from the settler to the resource. The settler walks dot by dot instead of trying to walk through the obstacle.",
        "Roblox calls the route a Path and the dots Waypoints. PathfindingService calculates them; Humanoid:MoveTo() follows them.",
        "Keep the established architecture: movement is added only to ServerScriptService > WorldServer. Do not create a second server Script or a second client LocalScript."
      ],"You can explain: target → ask for path → check success → read waypoints → move through them → return true or false.","If the terms feel mixed up, draw six arrows on paper using those exact stages before typing code."),
      step("Do — identify the exact TargetPoint",[
        "Inside the existing CommandNPC.OnServerEvent handler, keep the validated resourceName from M7.",
        "For Wood, use Workspace.World.Resources.WoodNode.TargetPoint. For Stone, use Workspace.World.Resources.StoneNode.TargetPoint.",
        "Check that the chosen object exists and is a BasePart before asking for a path.",
        "Do not use the decorative model's centre, WoodNode itself, StoneNode itself, BuildSite, or an NPCHome marker."
      ],"A Wood request selects WoodNode > TargetPoint; a Stone request selects StoneNode > TargetPoint.","Wrong TargetPoint recovery: expand World > Resources, compare the exact path, fix only the target-selection block, then test Wood and Stone separately."),
      step("Do — get PathfindingService and create one path",[
        "Near the top of WorldServer, obtain the service once with game:GetService(\"PathfindingService\").",
        "Inside a bounded movement function such as moveNPCTo(npc, targetPoint), call PathfindingService:CreatePath().",
        "Use pcall around path:ComputeAsync(startPosition, targetPosition) so a calculation error returns failure instead of stopping the whole server Script.",
        "The start position comes from npc.HumanoidRootPart.Position. The destination comes from targetPoint.Position."
      ],"The function has one NPC input, one TargetPoint input, and a protected path calculation.","If PathfindingService is nil or CreatePath errors, check spelling and capital letters in game:GetService(\"PathfindingService\"). Do not create an object named PathfindingService in Explorer."),
      step("Observe — check success before reading waypoints",[
        "After ComputeAsync finishes, inspect path.Status.",
        "Continue only when path.Status equals Enum.PathStatus.Success.",
        "When status is not Success, print a short M8 failure message, return false, and do not call GetWaypoints().",
        "Expected blocked-path Output example: [M8] PATH FAILED NPC_1 -> Wood: NoPath."
      ],"No waypoint is read until the path status is proven successful.","If GetWaypoints runs before the status check, move it below the Success branch. A blocked map must return false without a red WorldServer error."),
      step("Experiment — read and follow the waypoints",[
        "After a successful status check, call path:GetWaypoints() once and store the result.",
        "Loop through the waypoints in order.",
        "Before each move, if waypoint.Action equals Enum.PathWaypointAction.Jump, set humanoid.Jump = true.",
        "Call humanoid:MoveTo(waypoint.Position), then wait for humanoid.MoveToFinished:Wait().",
        "If MoveToFinished returns false, print a timeout/failure message and return false immediately. Do not continue to later waypoints."
      ],"The NPC follows every waypoint in order, jumps when asked, and stops on the first failed move.","Ignored jump recovery: add the Jump check immediately before MoveTo. Ignored movement failure recovery: store the MoveToFinished result and return false when it is false."),
      step("Fix — separate map problems from code problems",[
        "Map problem signs: TargetPoint is inside the ground, buried in the resource, sealed inside walls, or there is no NPC-sized route around the obstacle.",
        "Code problem signs: wrong object path, path status skipped, waypoints read too early, jump action ignored, MoveToFinished ignored, or a red error names WorldServer.",
        "NPC setup problem signs: the NPC does not move at all and one or more body parts, especially HumanoidRootPart, have Anchored = true.",
        "Plugin noise signs: Output names cloud_, a plugin, or an unrelated package instead of WorldServer or CommandClient. Record it separately; do not rewrite working M8 code because of unrelated noise."
      ],"You can name the category before changing anything: map, code, NPC setup, or unrelated plugin noise.","Blocked/buried target: temporarily set Transparency to 0.5, move it onto open ground, restore Transparency to 1, and rerun. Anchored NPC: set NPC body parts to Anchored = false, then rerun."),
      step("Prove — return a clear result and protect M9 work",[
        "When every waypoint succeeds, print a success message and return true. Example: [M8] PATH SUCCESS NPC_1 -> Wood.",
        "When calculation or movement fails, return false and send a clear StatusMessage to the requesting player.",
        "Expected Stone success: [M8] PATH SUCCESS NPC_2 -> Stone.",
        "Expected movement timeout: [M8] MOVE FAILED NPC_1 waypoint 3.",
        "Do not add resource awards, return-home movement, busy flags, gathering delays, or repeated-order protection. Those belong to M9 and later.",
        "Before and after every test, confirm GameState.Wood and GameState.Stone have the same values."
      ],"T01 and T02 succeed, T03 fails safely, T04 proves no award, and no M9 behavior has been introduced.","If totals change, remove every M8 line that changes Wood or Stone. If the NPC remains stuck in an early busy state, remove that busy state; M8 must not introduce permanent job locking."),
      step("Prove — submit the smallest useful evidence",[
        "Paste the complete current moveNPCTo function and the small WorldServer command branch that calls it. Do not retype unrelated parts of WorldServer.",
        "Attach one short Wood success video, one short Stone success video, and one short blocked-or-timeout failure video. A single combined video is acceptable when each result is clearly labelled.",
        "Paste current Output containing the matching success and failure lines, plus confirmation that no red error names WorldServer or CommandClient.",
        "Confirm all four canonical tests and answer the one understanding question."
      ],"The evaluator can match current code, current Output, visible movement, safe failure, and unchanged resource values without repetitive transcription.","If the code is present but the blocked/timeout proof is missing, the correct result is NEEDS_EVIDENCE. If current proof shows a pathfinding failure caused by the code, the correct result is NEEDS_FIX."),
    ],
    tests:[
      test("V1-M08-T01","Path to Wood","Select NPC_1 with an open route to WoodNode","Command Wood","NPC_1 reaches WoodNode TargetPoint around the obstacle and reports success"),
      test("V1-M08-T02","Path to Stone","Select NPC_2 with an open route to StoneNode","Command Stone","NPC_2 reaches StoneNode TargetPoint and reports success"),
      test("V1-M08-T03","Blocked path handled","Use the controlled removable blocked-target fixture","Command the blocked resource","The function returns false, reports failure, creates no red Nick-code error, and leaves the NPC safe"),
      test("V1-M08-T04","No resource award","Record Wood and Stone before T01/T02","Run both successful paths and inspect GameState","Wood and Stone remain unchanged")
    ],
    submission:{fields:[
      field("code","Current M8 WorldServer sections","Paste moveNPCTo plus the bounded command branch that chooses the TargetPoint and uses the boolean result."),
      field("explorer_summary","Exact object-path proof","Show World > NPCs, World > Resources > both TargetPoints, WorldServer, Remotes, and GameState values."),
      field("output","Current M8 Output","Include Wood success, Stone success, blocked or timeout failure, and no red WorldServer/CommandClient error."),
      field("videos","Three compact runtime proofs","Show Wood success, Stone success, and one controlled safe failure. One labelled combined clip is acceptable."),
      field("checklist","Four M8 confirmations","Confirm V1-M08-T01 through T04 only after running the current code."),
      field("understanding","Your explanation","Explain why the code checks path success before reading waypoints and why false must stop the command safely.")
    ],understanding:"Why must WorldServer check path success before it reads waypoints, and what should happen when movement returns false?"}
  };
})();
