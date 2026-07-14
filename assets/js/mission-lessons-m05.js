window.WORLDMAKER_LESSONS = window.WORLDMAKER_LESSONS || {};

window.WORLDMAKER_LESSONS["V1-M05"] = {
  id: "V1-M05",
  title: "Place the Resources",
  difficulty: "Easy",
  objective: "Create clearly named wood and stone nodes with safe invisible destination points.",
  whyItMatters: "The command loop needs two exact places that later movement code can find without guessing where decorative models begin or end.",
  startingState: "Mission 4 is approved. NPC selection works and Workspace > World > Resources is empty.",
  visibleResult: "A recognisable WoodNode and StoneNode stand in the world, each with one reachable invisible TargetPoint beside it.",
  concepts: [
    { name: "TargetPoint", text: "A small Part that gives movement code one exact destination." },
    { name: "CanCollide", text: "When false, a Part does not block players or NPCs." },
    { name: "Transparency", text: "A value of 1 makes a Part invisible." },
    { name: "Model", text: "A container that keeps one resource's visible parts and TargetPoint together." },
    { name: "Exact name", text: "A script can find an object reliably only when its expected name and location match." }
  ],
  hierarchy: "Workspace\n└── World\n    └── Resources\n        ├── WoodNode (Model)\n        │   ├── visible anchored parts\n        │   └── TargetPoint (Part)\n        └── StoneNode (Model)\n            ├── visible anchored parts\n            └── TargetPoint (Part)",
  steps: [
    {
      title: "Build the wood node",
      actions: [
        "Stop Play mode.",
        "Under Workspace > World > Resources, insert a Model.",
        "Rename it exactly WoodNode.",
        "Add a few simple Parts that look like a tree or wood pile.",
        "Anchor every visible Part."
      ],
      checkpoint: "Resources contains one Model named WoodNode, and its visible parts stay in place when selected.",
      recovery: "If the parts are outside WoodNode, drag them into the Model. If they fall in Play, select them and set Anchored to true."
    },
    {
      title: "Add WoodNode TargetPoint",
      actions: [
        "Insert one Part inside WoodNode.",
        "Rename it exactly TargetPoint.",
        "Set Anchored to true, CanCollide to false, and Transparency to 1.",
        "Place it on clear walkable ground beside the visible wood parts, not inside them."
      ],
      checkpoint: "WoodNode contains exactly one TargetPoint with Anchored true, CanCollide false, and Transparency 1.",
      recovery: "Temporarily set Transparency to 0.5 while positioning it, then return Transparency to 1."
    },
    {
      title: "Build the stone node",
      actions: [
        "Under Resources, insert a second Model.",
        "Rename it exactly StoneNode.",
        "Add simple rock-like Parts inside it.",
        "Anchor every visible Part."
      ],
      checkpoint: "Resources contains WoodNode and StoneNode as two separate Models.",
      recovery: "If you duplicated WoodNode, remove the copied wood decoration and keep only the correct StoneNode name and rock-like parts."
    },
    {
      title: "Add StoneNode TargetPoint",
      actions: [
        "Insert one Part inside StoneNode.",
        "Rename it exactly TargetPoint.",
        "Set Anchored to true, CanCollide to false, and Transparency to 1.",
        "Place it on clear walkable ground beside the visible stone parts."
      ],
      checkpoint: "StoneNode contains exactly one safe TargetPoint and it is not buried inside the rock geometry.",
      recovery: "If the target is hard to place, make it visible temporarily, move it onto open ground, then return Transparency to 1."
    },
    {
      title: "Check routes and collisions",
      actions: [
        "Press Play.",
        "Walk the player from the centre to the WoodNode TargetPoint area.",
        "Walk back and then to the StoneNode TargetPoint area.",
        "Confirm visible resource parts do not trap the player and both routes remain open.",
        "Do not add collection code or resource values yet."
      ],
      checkpoint: "Both TargetPoint areas are reachable and neither decorative Model blocks every route.",
      recovery: "If a route is blocked, move the decorative parts or TargetPoint. Do not move the approved world obstacle unless necessary."
    },
    {
      title: "Run the three proof tests",
      actions: [
        "Stop Play and inspect the complete Resources hierarchy.",
        "Check both TargetPoint property sets.",
        "Clear Output and run a fresh Play test.",
        "Observe that both visible nodes stay still and walk to both target areas.",
        "Capture one current screenshot showing both visible resource nodes."
      ],
      checkpoint: "Exact names, one target per node, safe properties, stable visible parts, open routes, and clean current Output are all proven.",
      recovery: "If Output names a project object, fix that error before submitting. Unrelated plugin noise should be described separately."
    }
  ],
  mistakes: [
    "The Models are named Tree or Rock instead of WoodNode and StoneNode.",
    "TargetPoint is outside its resource Model.",
    "A node contains more than one TargetPoint.",
    "TargetPoint is collidable or unanchored.",
    "TargetPoint is buried inside decorative geometry.",
    "Visible resource parts are unanchored.",
    "The decorative Model blocks all routes.",
    "Collection scripts or resource values are added too early."
  ],
  tests: [
    { id: "V1-M05-T01", name: "Exact nodes", setup: "Edit mode", action: "Inspect Workspace > World > Resources", expected: "WoodNode and StoneNode each contain exactly one TargetPoint." },
    { id: "V1-M05-T02", name: "Targets safe", setup: "Edit mode and Play", action: "Inspect properties and walk to both target areas", expected: "Both TargetPoints are anchored, invisible, non-colliding, and on reachable ground." },
    { id: "V1-M05-T03", name: "No physics collapse", setup: "Fresh Play with clear Output", action: "Observe both visible nodes and walk nearby", expected: "Visible parts stay in place, do not trap the player, and Output has no relevant project error." }
  ],
  submission: {
    fields: [
      { key: "explorer_summary", label: "Explorer proof", help: "Describe WoodNode, StoneNode, and the exact TargetPoint child inside each." },
      { key: "properties", label: "TargetPoint properties", help: "State Anchored, CanCollide, and Transparency for both TargetPoints and where each sits." },
      { key: "output", label: "Current Output", help: "Clear Output, run the route and stability tests, then paste the current Output text." },
      { key: "screenshot", label: "Current resource screenshot", help: "Show both visible resource nodes in the current world." }
    ],
    understanding: "Why is a separate TargetPoint safer than sending an NPC to the middle of the tree Model?"
  }
};