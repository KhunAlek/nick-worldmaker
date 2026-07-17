(function(){
  "use strict";
  const lessons=window.WORLDMAKER_LESSONS||(window.WORLDMAKER_LESSONS={});
  const test=(id,name,setup,action,expected)=>({id,name,setup,action,expected});
  const field=(key,label,help)=>({key,label,help});
  const step=(title,actions,checkpoint,recovery)=>({title,actions,checkpoint,recovery});
  lessons["V1-M07"]={
    id:"V1-M07",title:"Send Safe Commands",difficulty:"Challenging",
    objective:"Make the Wood and Stone buttons ask the server for a command, then show the server's answer.",
    whyItMatters:"One player's computer may ask for an action, but only the shared game authority may decide whether it is allowed.",
    startingState:"Mission 6 is approved. The HUD works locally, one NPC can be selected, and the resource buttons currently change only local status text.",
    visibleResult:"With no selection, no command leaves the player's computer. With a valid selection, Wood and Stone requests reach the server, are checked, and return an accepted or rejected status without moving NPCs, awarding resources, or building.",
    concepts:[
      {name:"Your computer",text:"The part of the game running for one player. Roblox later calls this the client."},
      {name:"Shared game authority",text:"The part that checks requests for everyone. Roblox later calls this the server."},
      {name:"RemoteEvent",text:"A message channel between the client and server. It is not a world object you can see."},
      {name:"The rule",text:"The client requests. The server decides."}
    ],
    hierarchy:"ReplicatedStorage\n└── Remotes (Folder)\n    ├── CommandNPC (RemoteEvent) — client request to server\n    ├── BuildHut (RemoteEvent)\n    ├── ResetWorld (RemoteEvent)\n    └── StatusMessage (RemoteEvent) — server response to client\n\nStarterGui\n└── CommandGui\n    └── CommandClient (LocalScript)\n\nServerScriptService\n└── WorldServer (Script)",
    steps:[
      step("Understand — follow one message",[
        "Read this flow before typing code: button → CommandClient LocalScript → CommandNPC RemoteEvent → WorldServer → StatusMessage RemoteEvent → StatusLabel.",
        "CommandClient runs for one player. WorldServer runs for the shared game.",
        "FireServer goes from a LocalScript to the server. OnServerEvent receives it in a server Script. FireClient goes from the server back to one player."
      ],"You can point to where the request starts, where it is checked, and where the answer returns.","Do not continue by guessing. Compare the arrows: client FireServer → server OnServerEvent; server FireClient → client OnClientEvent."),
      step("Do — create the exact message channels",[
        "In Explorer, expand ReplicatedStorage, then Remotes.",
        "Create RemoteEvents named CommandNPC, BuildHut, ResetWorld, and StatusMessage. Each must be directly inside Remotes and appear exactly once.",
        "Do not place them in ServerStorage: the client cannot see objects stored there."
      ],"Explorer matches the hierarchy above; every listed object has ClassName RemoteEvent.","Delete only the wrongly placed or duplicate RemoteEvent, then recreate it directly under ReplicatedStorage > Remotes."),
      step("Observe — prove no selection sends nothing",[
        "In CommandClient, keep selectedNPC local.",
        "At the start of each gather-button handler, check selectedNPC. When it is nil, set StatusLabel to Select a settler first and return before FireServer.",
        "Press Play without selecting an NPC. Click Gather Wood and Gather Stone."
      ],"The HUD says Select a settler first. Server Output shows no accepted command and no valid command request was sent.","If the server receives a request, move the return so it happens before CommandNPC:FireServer(...)."),
      step("Experiment — send safe Wood and Stone requests",[
        "Gather Wood must call CommandNPC:FireServer(selectedNPC, \"Wood\").",
        "Gather Stone must call CommandNPC:FireServer(selectedNPC, \"Stone\").",
        "In WorldServer, connect CommandNPC.OnServerEvent once. Remember: Roblox automatically supplies player as the first parameter.",
        "Accept only resourceName equal to Wood or Stone. Accept only NPC_1 or NPC_2 that is really inside Workspace.World.NPCs and contains Humanoid plus HumanoidRootPart.",
        "For M7, do not move the NPC, change Wood or Stone, or create a building."
      ],"Valid Wood and Stone are accepted. Invalid resource text and a non-NPC Instance are rejected without a crash or state change.","Check the receiver parameters first: function(player, npc, resourceName). Then check exact strings and npc.Parent/descendant membership."),
      step("Fix — return the server's decision",[
        "From WorldServer, use StatusMessage:FireClient(player, message) after every accepted or rejected decision.",
        "In CommandClient, use StatusMessage.OnClientEvent to place the returned message in StatusLabel.",
        "Wrong-direction examples: FireClient in CommandClient is wrong; FireServer in WorldServer is wrong; OnServerEvent in a LocalScript is wrong."
      ],"The requesting player sees the server's real answer in StatusLabel.","Match the direction chart again. Client: FireServer and OnClientEvent. Server: OnServerEvent and FireClient."),
      step("Prove — run the complete M7 evidence set",[
        "Clear Output and start a fresh Play test.",
        "Prove no selection, valid Wood with NPC_1, and valid Stone with NPC_2.",
        "Use temporary Studio-only test code to send an invalid resource and a non-NPC Instance; capture rejection, then remove the temporary code.",
        "Confirm Wood, Stone, HutBuilt, movement, and Buildings did not change. Stop Play and confirm no temporary test code or duplicate connection remains."
      ],"All five canonical tests pass from current code, Output is clean, and the client has no resource-award or building code.","Exact wrong results: server accepts Banana → fix the resource whitelist; server accepts Workspace.Baseplate → fix NPC membership; totals change → remove client/server award code from M7; two answers appear → remove the duplicate OnServerEvent connection."),
    ],
    tests:[
      test("V1-M07-T01","No selection guarded","Fresh Play with no selection","Press Gather Wood","HUD says select first and the server receives no valid command"),
      test("V1-M07-T02","Valid Wood request","Select NPC_1","Press Gather Wood","Server validates Wood and returns accepted status; no state change"),
      test("V1-M07-T03","Valid Stone request","Select NPC_2","Press Gather Stone","Server validates Stone and returns accepted status; no state change"),
      test("V1-M07-T04","Invalid resource rejected","Temporary Studio-only test","Send a value other than Wood or Stone","Server rejects it; no movement, award, build, or crash"),
      test("V1-M07-T05","Non-NPC rejected","Temporary Studio-only test","Send a Part or other Instance outside World.NPCs","Server rejects it safely")
    ],
    submission:{
      fields:[
        field("code","Current CommandClient and WorldServer code","Paste the complete M7-related sections, including button handlers, OnServerEvent validation, and status response."),
        field("explorer_summary","Explorer proof","Show ReplicatedStorage > Remotes and the exact locations of CommandClient and WorldServer."),
        field("output","Current client and server Output","Include no-selection, valid Wood, valid Stone, invalid resource, and non-NPC results from the current code."),
        field("screenshots","Current visual proof","Attach current HUD/Explorer evidence showing the returned status and exact RemoteEvent locations."),
        field("checklist","Five M7 test confirmations","Confirm each exact test only after running it from the current code."),
        field("understanding","Your explanation","In one or two sentences, explain: the client requests and the server decides.")
      ],
      understanding:"Why must WorldServer check the NPC and resource even when CommandClient already chose them?"
    }
  };
})();