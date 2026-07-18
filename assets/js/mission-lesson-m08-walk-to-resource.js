(function(){
"use strict";
const lessons=window.WORLDMAKER_LESSONS||(window.WORLDMAKER_LESSONS={});
lessons["V1-M08"]={
  "id": "V1-M08",
  "title": "Walk to the Resource",
  "difficulty": "Challenging",
  "objective": "Teach one selected settler to walk around obstacles to Wood or Stone, and to stop safely when Roblox cannot find or finish a route.",
  "whyItMatters": "The Wood and Stone buttons already send safe requests. Now WorldServer must turn an accepted request into careful movement without teleporting, crashing, or changing the resource totals.",
  "startingState": "Mission 7 is approved. CommandClient already sends Wood or Stone to WorldServer and shows the server's answer. NPC_1, NPC_2, WoodNode, StoneNode, and both TargetPoints already exist.",
  "visibleResult": "NPC_1 walks to the Wood TargetPoint and NPC_2 walks to the Stone TargetPoint. A deliberately blocked route gives a clear failure message, leaves the settler safe, and Wood and Stone stay unchanged.",
  "proofHeading": "Show that your walking system works",
  "submissionHeading": "Show what you built",
  "submissionIntro": "Remove every temporary obstacle and test print you no longer need. Then send one current set of code, pictures, Output, and short videos. You do not need to type the Explorer tree by hand.",
  "concepts": [
    {"name":"Safe standing place","text":"The visible tree or rock may be too wide, buried, or awkward to stand inside. An invisible Part named TargetPoint marks the exact safe place where the settler should finish."},
    {"name":"Route","text":"The settler needs several small destinations that go around obstacles. Roblox calls the calculated route a path."},
    {"name":"Route points","text":"The small destinations on the route are called waypoints. The settler walks to them one at a time."},
    {"name":"Result","text":"The movement function gives back true when the whole walk finishes and false when it must stop safely. This true-or-false answer is the function result."},
    {"name":"Waiting too long","text":"Humanoid movement can report that it did not reach the next point. This failed wait is often called a timeout."}
  ],
  "hierarchy": "CORRECT EXPLORER LOCATIONS\n\nWorkspace\n└── World\n    ├── NPCs\n    │   ├── NPC_1 (Model)\n    │   │   ├── Humanoid\n    │   │   └── HumanoidRootPart\n    │   └── NPC_2 (Model)\n    │       ├── Humanoid\n    │       └── HumanoidRootPart\n    └── Resources\n        ├── WoodNode (Model)\n        │   └── TargetPoint (Part)\n        └── StoneNode (Model)\n            └── TargetPoint (Part)\n\nServerScriptService\n└── WorldServer (Script) — add all M8 movement code here\n\nStarterGui\n└── CommandGui\n    └── CommandClient (LocalScript) — keep the working M7 request and status code\n\nReplicatedStorage\n├── Remotes\n│   ├── CommandNPC\n│   └── StatusMessage\n└── GameState\n    ├── Wood\n    └── Stone",
  "steps": [],
  "tests": [],
  "submission": null
};
})();
