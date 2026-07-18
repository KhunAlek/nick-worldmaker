(function(){
"use strict";
const lesson=window.WORLDMAKER_LESSONS&&window.WORLDMAKER_LESSONS["V1-M08"];
if(!lesson)throw new Error("Load the V1-M08 core lesson first.");
lesson.steps.push(...[
  {
    "title":"Understand — follow the Wood or Stone request",
    "actions":[
      "Read this flow before editing: CommandClient sends the selected NPC and Wood or Stone; the existing CommandNPC handler checks both values; the handler chooses that resource's TargetPoint; moveNPCTo walks to the TargetPoint's Position; the handler uses the true-or-false result to send the matching status.",
      "All M8 code belongs in ServerScriptService > WorldServer. Keep the working M7 CommandClient unchanged.",
      "In Explorer, expand Workspace > World > Resources. Expand WoodNode and StoneNode. Each Model must contain exactly one Part named TargetPoint.",
      "Click each TargetPoint and check Properties: Anchored = true, CanCollide = false, Transparency = 1. Temporarily use Transparency = 0.5 to check that it is on reachable ground beside the resource, then return it to 1.",
      "The function receives a position, which Roblox stores as three coordinates. Its one consistent name is destinationPosition: moveNPCTo(npc, destinationPosition).",
      "The handler still keeps M7's server checks. A request is never trusted just because CommandClient sent it."
    ],
    "checkpoint":"You can point to CommandNPC, WorldServer, WoodNode > TargetPoint, and StoneNode > TargetPoint, and explain that the handler chooses the Part while moveNPCTo receives its Position.",
    "recovery":"If either TargetPoint is missing, duplicated, buried, inside the visible resource, or blocked, stop before coding. Repair only that TargetPoint, restore Transparency to 1, and check both destinations again.",
    "codeBlocks":[]
  },
  {
    "title":"Do — replace the M7 handler with one complete M8 section",
    "actions":[
      "In Explorer, expand ServerScriptService and double-click WorldServer.",
      "Find the one existing CommandNPC.OnServerEvent:Connect block from M7. Select that complete block from CommandNPC.OnServerEvent:Connect(function through its matching end). Delete only that block.",
      "Do not delete the existing lines that create or find CommandNPC and StatusMessage. The complete code below uses those exact existing variables.",
      "Near the other game:GetService lines, add the PathfindingService line once.",
      "Paste the complete moveNPCTo function below the setup lines and above the place where the old handler was.",
      "Paste the complete replacement CommandNPC handler immediately after the function. Do not keep a second CommandNPC handler.",
      "Compare the pasted code from the first local function line through the final end). Do not assemble it from the later explanation cards."
    ],
    "checkpoint":"WorldServer has exactly one PathfindingService setup line, one moveNPCTo(npc, destinationPosition) function, and one CommandNPC handler. No duplicate handler remains.",
    "recovery":"If two status messages appear for one click, stop Play and search WorldServer for CommandNPC.OnServerEvent. Keep only the complete M8 handler below. If CommandNPC or StatusMessage is underlined, restore the existing M7 setup lines instead of creating new RemoteEvents.",
    "codeBlocks":[
      {"label":"Add once beside the other service setup lines","code":"local PathfindingService = game:GetService(\"PathfindingService\")","explanation":"PathfindingService is Roblox's built-in route calculator."},
      {"label":"Paste this complete function — do not reconstruct fragments","code":"local function moveNPCTo(npc, destinationPosition)\n    local humanoid = npc:FindFirstChildOfClass(\"Humanoid\")\n    local root = npc:FindFirstChild(\"HumanoidRootPart\")\n    if not humanoid or not root then\n        return false\n    end\n\n    local path = PathfindingService:CreatePath()\n    local calculated = pcall(function()\n        path:ComputeAsync(root.Position, destinationPosition)\n    end)\n    if not calculated or path.Status ~= Enum.PathStatus.Success then\n        return false\n    end\n\n    local waypoints = path:GetWaypoints()\n    for _, waypoint in ipairs(waypoints) do\n        if waypoint.Action == Enum.PathWaypointAction.Jump then\n            humanoid.Jump = true\n        end\n\n        local finished = false\n        local reached = false\n        local connection = humanoid.MoveToFinished:Connect(function(didReach)\n            finished = true\n            reached = didReach\n        end)\n\n        humanoid:MoveTo(waypoint.Position)\n        local waitStarted = os.clock()\n        while not finished and os.clock() - waitStarted < 8 do\n            task.wait(0.1)\n        end\n        connection:Disconnect()\n\n        if not finished or not reached then\n            humanoid:MoveTo(root.Position)\n            return false\n        end\n    end\n\n    return true\nend","explanation":"This is the entire bounded movement function. Every waypoint wait stops after 8 seconds, and every failure returns false."},
      {"label":"Paste this complete replacement for the existing M7 CommandNPC handler","code":"CommandNPC.OnServerEvent:Connect(function(player, npc, resourceName)\n    local world = workspace:FindFirstChild(\"World\")\n    local npcs = world and world:FindFirstChild(\"NPCs\")\n    local resources = world and world:FindFirstChild(\"Resources\")\n\n    local resourceIsValid = resourceName == \"Wood\" or resourceName == \"Stone\"\n    local npcIsValid = typeof(npc) == \"Instance\"\n        and npcs\n        and npc:IsDescendantOf(npcs)\n        and (npc.Name == \"NPC_1\" or npc.Name == \"NPC_2\")\n        and npc:FindFirstChildOfClass(\"Humanoid\")\n        and npc:FindFirstChild(\"HumanoidRootPart\")\n\n    if not resourceIsValid or not npcIsValid or not resources then\n        StatusMessage:FireClient(player, \"Command rejected.\")\n        return\n    end\n\n    local resourceNode = resources:FindFirstChild(resourceName .. \"Node\")\n    local targetPoint = resourceNode and resourceNode:FindFirstChild(\"TargetPoint\")\n    if not targetPoint or not targetPoint:IsA(\"BasePart\") then\n        print(\"[M8] PATH FAILED \" .. npc.Name .. \" -> \" .. resourceName)\n        StatusMessage:FireClient(player, npc.Name .. \" could not reach \" .. resourceName .. \".\")\n        return\n    end\n\n    local arrived = moveNPCTo(npc, targetPoint.Position)\n    if arrived then\n        print(\"[M8] PATH SUCCESS \" .. npc.Name .. \" -> \" .. resourceName)\n        StatusMessage:FireClient(player, npc.Name .. \" arrived at \" .. resourceName .. \".\")\n    else\n        print(\"[M8] PATH FAILED \" .. npc.Name .. \" -> \" .. resourceName)\n        StatusMessage:FireClient(player, npc.Name .. \" could not reach \" .. resourceName .. \".\")\n    end\nend)","explanation":"The validated M7 checks stay on the server. The handler chooses WoodNode or StoneNode, passes the exact TargetPoint.Position, and uses the Boolean result for matching Output and status text."}
    ]
  },
  {
    "title":"Observe — check the exact signature and destination",
    "actions":[
      "At the first function line, confirm it says moveNPCTo(npc, destinationPosition). It must not say targetPoint there.",
      "Inside ComputeAsync, confirm the second value is destinationPosition. Do not add .Position because this value is already a position.",
      "In the handler, confirm resourceName .. \"Node\" chooses WoodNode for Wood and StoneNode for Stone.",
      "Confirm targetPoint is found inside that chosen node and the call is moveNPCTo(npc, targetPoint.Position).",
      "Confirm local arrived stores the true-or-false result before the if arrived branch.",
      "Use Edit > Find or Ctrl+F in WorldServer to search for moveNPCTo. You should see one function definition and one call."
    ],
    "checkpoint":"The definition, ComputeAsync line, TargetPoint selection, call, and arrived branch all use one consistent interface with no manual translation left for Nick.",
    "recovery":"If the call passes targetPoint without .Position, add .Position at the call. If the function uses targetPoint.Position, replace that function parameter and use with destinationPosition exactly as shown in the complete code.",
    "codeBlocks":[]
  },
  {
    "title":"Observe — see how a route is accepted or rejected",
    "actions":[
      "PathfindingService:CreatePath() creates one route attempt for this command.",
      "pcall lets Roblox try ComputeAsync without a route-calculation error stopping WorldServer.",
      "path.Status must equal Enum.PathStatus.Success before GetWaypoints is used.",
      "If calculation errors or no usable route exists, the function returns false. The handler then prints [M8] PATH FAILED NPC_1 -> Wood or the matching NPC and resource.",
      "The resource name belongs in the handler's Output line because the handler knows whether this request is Wood or Stone."
    ],
    "checkpoint":"GetWaypoints appears only after both calculated and PathStatus.Success are checked; every promised failure line ends with -> Wood or -> Stone.",
    "recovery":"If Output shows a red ComputeAsync or GetWaypoints error, compare the complete function with Stage 2. Do not move GetWaypoints above the status check.",
    "codeBlocks":[]
  },
  {
    "title":"Experiment — follow waypoints with a controlled wait",
    "actions":[
      "GetWaypoints returns an ordered list of small destinations called waypoints.",
      "The for loop visits each waypoint in order. A Jump-marked waypoint sets humanoid.Jump before MoveTo.",
      "MoveToFinished sends a result when that small movement ends. The connection records whether it finished and whether the NPC reached the point.",
      "The while line checks for at most 8 seconds. task.wait(0.1) gives Roblox time to move without waiting forever.",
      "The connection is disconnected after each waypoint so old listeners do not remain.",
      "If time ends or reached is false, the function stops that movement, returns false, and never walks to later waypoints."
    ],
    "checkpoint":"There is no MoveToFinished:Wait(). Every waypoint has the 8-second controlled wait, disconnect, and false branch before the loop continues.",
    "recovery":"Search WorldServer for MoveToFinished:Wait. If found in the M8 function, replace the function with the complete Stage 2 version. If the NPC waits longer than 8 seconds at one point, check the while condition and waitStarted spelling.",
    "codeBlocks":[]
  },
  {
    "title":"Fix — test the two matching success messages",
    "actions":[
      "Open Output from View > Output or Window > Output. Click the clear button so old messages cannot be mistaken for this run.",
      "Press Play. Select NPC_1 and press Gather Wood once.",
      "NPC_1 should stop at WoodNode > TargetPoint. The status label must say NPC_1 arrived at Wood. Output must say [M8] PATH SUCCESS NPC_1 -> Wood.",
      "Without stopping Play, select NPC_2 and press Gather Stone once.",
      "NPC_2 should stop at StoneNode > TargetPoint. The status label must say NPC_2 arrived at Stone. Output must say [M8] PATH SUCCESS NPC_2 -> Stone.",
      "Press Stop only after seeing both results. Neither resource total should change."
    ],
    "checkpoint":"One Play run shows the correct NPC reaching each requested TargetPoint with the exact matching status and Output wording and no red WorldServer error.",
    "recovery":"Wrong resource means compare resourceName .. \"Node\" and the targetPoint lookup. A rejected valid NPC means compare the M7 validation block. No movement plus PATH FAILED means check the TargetPoint and NPC Anchored properties before changing code.",
    "codeBlocks":[]
  }
]);
})();
