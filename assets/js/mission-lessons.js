window.WORLDMAKER_LESSONS = window.WORLDMAKER_LESSONS || {};

window.WORLDMAKER_LESSONS["V1-M03"] = {
  id: "V1-M03",
  title: "Add Two Settlers",
  difficulty: "Easy",
  objective: "Create two correctly organised NPC rigs that stand in the world without falling apart.",
  whyItMatters: "The whole game begins with two people, so the project needs two valid movable character rigs before commands can exist.",
  startingState: "Mission 2 is approved. The world has safe ground, PlayerSpawn, BuildSite, and empty NPCs and NPCHomes folders.",
  visibleResult: "NPC_1 and NPC_2 stand separately on the island during Play and remain upright.",
  concepts: [
    { name: "Rig", text: "A ready-made character Model with connected body parts." },
    { name: "Model", text: "One Explorer object that contains a group of related objects." },
    { name: "Humanoid", text: "The object that lets a Roblox character stand, walk, and behave like a character." },
    { name: "HumanoidRootPart", text: "The central body part Roblox uses to locate and move the rig." },
    { name: "PrimaryPart", text: "The Model property that tells Roblox which part represents the whole Model when it is positioned." }
  ],
  hierarchy: "Workspace\n└── World\n    ├── NPCs\n    │   ├── NPC_1 (Model)\n    │   │   ├── Humanoid\n    │   │   └── HumanoidRootPart\n    │   └── NPC_2 (Model)\n    │       ├── Humanoid\n    │       └── HumanoidRootPart\n    └── NPCHomes\n        ├── NPC_1_Home (Part)\n        └── NPC_2_Home (Part)",
  steps: [
    {
      title: "Open the rig tool",
      actions: [
        "Stop Play mode if the game is running.",
        "At the top of Roblox Studio, open the Avatar tab.",
        "Click Rig Builder or Build Rig. Studio versions may use either name.",
        "Choose one simple block rig. Use R15 Block Rig when it is available."
      ],
      checkpoint: "A complete character appears in Workspace. It should have a head, body, arms, and legs.",
      recovery: "If no rig appears, make sure Edit mode is active, reopen Avatar, and choose the basic block rig again."
    },
    {
      title: "Move and rename the first settler",
      actions: [
        "In Explorer, find the new rig Model under Workspace.",
        "Drag the entire Model into Workspace > World > NPCs.",
        "Rename the Model exactly NPC_1.",
        "Expand NPC_1 and confirm Humanoid and HumanoidRootPart are inside."
      ],
      checkpoint: "Explorer shows World > NPCs > NPC_1, and NPC_1 contains Humanoid and HumanoidRootPart.",
      recovery: "If only one body part moved, undo. Drag the top Model row, not an arm, leg, or HumanoidRootPart."
    },
    {
      title: "Set PrimaryPart correctly",
      actions: [
        "Click the NPC_1 Model row in Explorer.",
        "Open Properties.",
        "Find PrimaryPart.",
        "Set PrimaryPart to HumanoidRootPart if it is blank or different."
      ],
      checkpoint: "NPC_1 PrimaryPart reads HumanoidRootPart.",
      recovery: "If HumanoidRootPart is not offered, expand NPC_1 and confirm the object exists inside the same Model."
    },
    {
      title: "Remove unwanted scripts",
      actions: [
        "Expand NPC_1 fully in Explorer.",
        "Look for Script or LocalScript objects added with the rig.",
        "Delete demo or animation scripts that came with the inserted rig.",
        "Keep the body parts, joints, Humanoid, and HumanoidRootPart."
      ],
      checkpoint: "NPC_1 has no unknown executable Script or LocalScript inside it.",
      recovery: "If unsure whether an object is a body part or a script, check its icon and ClassName in Properties before deleting it."
    },
    {
      title: "Duplicate the cleaned settler",
      actions: [
        "Select the NPC_1 Model.",
        "Press Ctrl+D to duplicate it.",
        "Rename the copy exactly NPC_2.",
        "Select NPC_2 and confirm its PrimaryPart is also HumanoidRootPart."
      ],
      checkpoint: "The NPCs folder contains exactly NPC_1 and NPC_2.",
      recovery: "If extra copies exist, delete them so the folder contains only the two required NPC Models."
    },
    {
      title: "Place both settlers safely",
      actions: [
        "Use the Move tool to place NPC_1 and NPC_2 on solid ground.",
        "Leave a clear gap between them so their bodies do not overlap.",
        "Select body parts in each rig and confirm Anchored is false.",
        "Do not add movement code."
      ],
      checkpoint: "Both settlers stand separately above solid ground, and their body parts are not anchored.",
      recovery: "If a rig falls before testing, move it slightly upward onto clear ground and check that no body part is stuck inside the floor or the other rig."
    },
    {
      title: "Create the two home markers",
      actions: [
        "Under World > NPCHomes, insert a Part.",
        "Rename it exactly NPC_1_Home.",
        "Set Anchored to true, CanCollide to false, and Transparency to 1.",
        "Make it small and place it under NPC_1's starting position.",
        "Duplicate it, rename the copy NPC_2_Home, and move it under NPC_2's starting position."
      ],
      checkpoint: "NPCHomes contains exactly NPC_1_Home and NPC_2_Home. Both are invisible, anchored, and non-colliding.",
      recovery: "Temporarily set Transparency to 0.5 while positioning a marker, then return it to 1."
    },
    {
      title: "Run the three proof tests",
      actions: [
        "Clear Output.",
        "Press Play and watch both settlers for several seconds.",
        "Confirm both stay upright, separate, and on the ground.",
        "Stop Play and capture the required Explorer and Properties evidence."
      ],
      checkpoint: "No NPC falls apart, falls through the ground, or begins inside the other NPC. Output has no Nick-project red error.",
      recovery: "If a settler falls apart, replace it with a fresh generated rig instead of rebuilding joints by hand. If it falls through the floor, check its position and the approved ground."
    }
  ],
  mistakes: [
    "A statue or random Model was used instead of a character rig.",
    "NPC_1 or NPC_2 is outside World > NPCs.",
    "Humanoid or HumanoidRootPart is missing.",
    "PrimaryPart is blank or points to the wrong object.",
    "One or more NPC body parts are anchored.",
    "Home marker names or properties are wrong.",
    "An unknown Script or LocalScript remains inside a rig.",
    "The two NPCs overlap when Play begins."
  ],
  tests: [
    { id: "V1-M03-T01", name: "Two valid rigs", setup: "Edit mode", action: "Inspect World > NPCs and both Model properties", expected: "Exactly NPC_1 and NPC_2; each contains Humanoid and HumanoidRootPart; each PrimaryPart is HumanoidRootPart." },
    { id: "V1-M03-T02", name: "Stable play", setup: "Fresh Play with clear Output", action: "Observe both NPCs", expected: "Both remain upright, separate, and on solid ground with no relevant project error." },
    { id: "V1-M03-T03", name: "Home markers", setup: "Edit mode", action: "Inspect World > NPCHomes and marker properties", expected: "Exactly NPC_1_Home and NPC_2_Home; both anchored, non-colliding, and placed under matching starts." }
  ],
  submission: {
    fields: [
      { key: "explorer_summary", label: "Explorer proof", help: "Describe exactly what is under World > NPCs and World > NPCHomes." },
      { key: "properties", label: "Properties proof", help: "State each NPC PrimaryPart and each home marker's Anchored, CanCollide, and Transparency values." },
      { key: "output", label: "Current Output", help: "Clear Output, run the stable-play test, then paste the current Output text." },
      { key: "screenshot", label: "Current Play screenshot", help: "Show both settlers standing separately on the island." }
    ],
    understanding: "Why would an ordinary statue Model not be enough for pathfinding movement?"
  }
};
