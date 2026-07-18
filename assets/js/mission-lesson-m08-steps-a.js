(function(){
"use strict";
const lesson=window.WORLDMAKER_LESSONS&&window.WORLDMAKER_LESSONS["V1-M08"];
if(!lesson)throw new Error("Load the V1-M08 core lesson first.");
lesson.steps.push(...[
  {
    "title":"Understand — find the safe Wood and Stone destinations",
    "actions":[
      "Look at the island in the 3D view. Imagine several safe dots leading around the obstacle from the settler to the resource.",
      "The settler will walk to one dot, then the next dot, until it reaches the final safe standing place.",
      "Roblox calls the complete route a path and each small destination a waypoint. You will make Roblox calculate the route; you will not type the dots yourself.",
      "All new movement code belongs in ServerScriptService > WorldServer. Do not create another Script or another CommandClient.",
      "In Explorer, expand Workspace, then World, then Resources.",
      "Expand WoodNode. Click TargetPoint. At the top of Properties, confirm its object type is Part.",
      "For a safe invisible destination, confirm Anchored = true, CanCollide = false, and Transparency = 1.",
      "Temporarily change Transparency to 0.5 so you can see it. It should sit on open ground beside the visible tree, not inside the trunk, under the ground, or inside a wall.",
      "Move the complete TargetPoint Part onto clear ground if needed. Return Transparency to 1.",
      "Repeat the same checks for Workspace > World > Resources > StoneNode > TargetPoint.",
      "Do not use WoodNode or StoneNode itself as the destination. The Model is the visible resource; TargetPoint is the safe standing place."
    ],
    "checkpoint":"Explorer shows exactly one Part named TargetPoint inside WoodNode and one inside StoneNode. Both are anchored, invisible, non-colliding, and placed on reachable ground.",
    "recovery":"If the plan is still unclear, do not type code yet. Point in Explorer to WorldServer, one NPC, and one resource TargetPoint, then read the plan once more. If TargetPoint is missing, wrongly named, beside the resource Model, buried, or blocked, stop here. Move or recreate only that Part under the correct resource Model, set the three properties, and check again before editing code.",
    "codeBlocks":[]
  },
  {
    "title":"Do — ask Roblox to calculate a route",
    "actions":[
      "In Explorer, expand ServerScriptService and double-click WorldServer.",
      "Near the top of WorldServer, find the existing lines that get Remotes or other Roblox services. Add the PathfindingService line beside those setup lines, not inside the button handler.",
      "A Roblox service is a built-in game tool. PathfindingService is the built-in tool that tries to calculate a usable walking route.",
      "Below the setup section and above CommandNPC.OnServerEvent, start a function named moveNPCTo. A function is a named set of instructions that can be used when either settler needs to walk.",
      "The function receives npc, the settler Model, and targetPoint, the safe destination Part.",
      "Inside moveNPCTo, find npc's Humanoid, which controls walking, and HumanoidRootPart, which gives the settler's current position.",
      "Stop safely with false if either required object is missing. Returning false means: the walk did not finish, so the command caller must not pretend it succeeded.",
      "Create one new path inside the function.",
      "Ask that path to calculate from HumanoidRootPart.Position to targetPoint.Position.",
      "Put ComputeAsync inside pcall. pcall means Roblox may try the calculation without a calculation error stopping the whole WorldServer Script."
    ],
    "checkpoint":"The function has a Humanoid, a HumanoidRootPart, one created path, and a protected route calculation from the NPC's position to the TargetPoint's position.",
    "recovery":"If Roblox underlines PathfindingService or says it is nil, compare every capital letter. Use game:GetService(\"PathfindingService\"). Do not add a PathfindingService object in Explorer. If Output shows a red WorldServer error on FindFirstChild, CreatePath, or ComputeAsync, stop Play, check the exact object names and line order, then test again. Do not continue to waypoints while the calculation itself errors.",
    "codeBlocks":[
      {"label":"Get Roblox's route-calculating tool","code":"local PathfindingService = game:GetService(\"PathfindingService\")","explanation":"game:GetService asks Roblox for one built-in tool. The name inside quotation marks must match exactly."},
      {"label":"Start the movement instructions","code":"local function moveNPCTo(npc, targetPoint)\n    -- The next small sections go here.\nend","explanation":"npc is the chosen settler. targetPoint is the Part where that settler should finish."},
      {"label":"Find the movement parts and create one route","code":"local humanoid = npc:FindFirstChildOfClass(\"Humanoid\")\nlocal root = npc:FindFirstChild(\"HumanoidRootPart\")\nif not humanoid or not root then\n    return false\nend\n\nlocal path = PathfindingService:CreatePath()","explanation":"The early false prevents later code from trying to move a broken or incomplete NPC."},
      {"label":"Let Roblox try the route calculation safely","code":"local calculated = pcall(function()\n    path:ComputeAsync(root.Position, targetPoint.Position)\nend)\n\nif not calculated then\n    print(\"[M8] PATH CALCULATION ERROR \" .. npc.Name)\n    return false\nend","explanation":"calculated becomes true when the calculation call finished without a code error. It does not yet prove that a usable route exists."}
    ]
  },
  {
    "title":"Observe — check whether Roblox found a usable route",
    "actions":[
      "After ComputeAsync, Roblox stores a report inside path.Status.",
      "Continue only when that report equals Enum.PathStatus.Success. This means Roblox found a route it considers usable.",
      "When the report is anything else, print one clear failure line and return false before reading any route points.",
      "This check matters because a failed route has no safe set of points for the settler to follow.",
      "Expected success at this stage: no PATH FAILED line. Expected blocked result: [M8] PATH FAILED NPC_1 -> Wood."
    ],
    "checkpoint":"GetWaypoints appears only after the PathStatus.Success check. A failed route returns false without a red WorldServer error.",
    "recovery":"If the code calls GetWaypoints before checking path.Status, move that line below the success check. If a clear open route reports failure, first inspect the TargetPoint position and obstacle spacing before rewriting the whole function.",
    "codeBlocks":[{"label":"Stop when no route exists","code":"if path.Status ~= Enum.PathStatus.Success then\n    print(\"[M8] PATH FAILED \" .. npc.Name)\n    return false\nend","explanation":"~= means 'is not equal to'. The function stops before movement when Roblox did not report Success."}]
  },
  {
    "title":"Experiment — read the small route destinations",
    "actions":[
      "Only after the success check, ask the path for its waypoints. A waypoint is one small destination on the route.",
      "GetWaypoints gives a list. A list is several values kept in order: first point, second point, third point, and so on.",
      "Temporarily print the number of waypoints so you can see that Roblox made a route.",
      "For example, Output may show [M8] NPC_1 route has 7 waypoints. Your number can be different because it depends on the map.",
      "Do not treat a different positive number as an error. Remove the temporary count print after you understand the result, unless the lesson asks you to retain it for evidence."
    ],
    "checkpoint":"Output shows a positive waypoint count for an open route. No waypoint count is printed after a failed status.",
    "recovery":"If the count is 0 or the route fails, check whether the TargetPoint is above open ground and whether an NPC-sized gap exists. If Output shows a red GetWaypoints error, confirm the success check and spelling.",
    "codeBlocks":[{"label":"Read the route points after success","code":"local waypoints = path:GetWaypoints()\nprint(\"[M8] \" .. npc.Name .. \" route has \" .. #waypoints .. \" waypoints\")","explanation":"#waypoints means the number of items in the ordered list."}]
  },
  {
    "title":"Do — move to each route point and wait for the result",
    "actions":[
      "Use a loop to take the waypoints one at a time in their saved order. A loop repeats the same small movement instructions for each waypoint.",
      "For the current waypoint, call Humanoid:MoveTo(waypoint.Position). This asks the Humanoid to walk to that small destination.",
      "Then wait for Humanoid.MoveToFinished. Roblox gives back true when the Humanoid reached that point and false when it did not reach it in time.",
      "When the result is false, print which waypoint failed and return false immediately. Do not continue toward later points after one point failed.",
      "When every point succeeds, the function may print success and return true. Returning true tells the command code that the complete walk finished."
    ],
    "checkpoint":"The settler visits the points in order. One failed MoveToFinished result stops the function safely; all successful results lead to true.",
    "recovery":"If the settler walks partway and stops, read the MOVE FAILED waypoint number. Check the space around that part of the route, the NPC's anchored properties, and whether the code waits for each MoveToFinished result.",
    "codeBlocks":[{"label":"Walk through the ordered points","code":"for number, waypoint in ipairs(waypoints) do\n    humanoid:MoveTo(waypoint.Position)\n    local reached = humanoid.MoveToFinished:Wait()\n\n    if not reached then\n        print(\"[M8] MOVE FAILED \" .. npc.Name .. \" waypoint \" .. number)\n        return false\n    end\nend\n\nprint(\"[M8] PATH SUCCESS \" .. npc.Name)\nreturn true","explanation":"ipairs reads the list in order. number tells you which waypoint is being used. reached is the true-or-false movement result."}]
  },
  {
    "title":"Do — let the settler jump when the route asks",
    "actions":[
      "Some calculated route points are marked as places where the character must jump over a small step.",
      "Roblox calls this mark Enum.PathWaypointAction.Jump.",
      "Inside the waypoint loop, put the jump check immediately before MoveTo.",
      "When the current waypoint is marked Jump, set humanoid.Jump = true. The following MoveTo still sends the settler to the waypoint position.",
      "During Play, a route with a small step may make the settler jump. A flat route may use no jump points, which is also normal."
    ],
    "checkpoint":"The Jump check is inside the loop and before MoveTo. Flat routes still work; jump-marked routes are not ignored.",
    "recovery":"If the settler reaches a low step and stops, check whether the waypoint action equals Enum.PathWaypointAction.Jump and whether the jump line comes before MoveTo. Also check that the obstacle is small enough for a Roblox character to jump.",
    "codeBlocks":[{"label":"Handle a jump-marked waypoint","code":"if waypoint.Action == Enum.PathWaypointAction.Jump then\n    humanoid.Jump = true\nend","explanation":"This does not make every waypoint a jump. It reacts only when Roblox marked that route point as Jump."}]
  }
]);
})();
