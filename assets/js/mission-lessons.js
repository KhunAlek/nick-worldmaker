window.WORLDMAKER_LESSONS = window.WORLDMAKER_LESSONS || {};

window.WORLDMAKER_LESSONS["V1-M03"] = {
  id: "V1-M03",
  title: "Add Two Settlers",
  difficulty: "Easy",
  objective: "Create two complete Roblox characters that stand safely in the world and are ready to move in later missions.",
  whyItMatters: "Your game begins with two settlers. Each one must be a complete character, not a statue or a loose collection of body parts.",
  startingState: "Mission 2 is approved. Workspace > World already contains safe ground plus empty folders named NPCs and NPCHomes.",
  visibleResult: "NPC_1 and NPC_2 stand apart on the island during Play, stay together, and remain upright.",
  concepts: [
    { name: "Character rig", text: "A ready-made Roblox character with connected body parts. Roblox calls this complete character a rig." },
    { name: "Model", text: "One top row in Explorer that holds all parts of one character. Roblox calls this container a Model." },
    { name: "Humanoid", text: "The object inside the character that gives it character behavior such as standing and walking." },
    { name: "HumanoidRootPart", text: "The hidden central body piece Roblox uses to locate and move the whole character." },
    { name: "PrimaryPart", text: "A setting on the complete character that names its main positioning piece. Roblox calls this setting PrimaryPart." }
  ],
  hierarchy: "CORRECT EXPLORER STRUCTURE\n\nWorkspace\n└── World\n    ├── NPCs\n    │   ├── NPC_1 (Model)\n    │   │   ├── Humanoid\n    │   │   ├── HumanoidRootPart\n    │   │   └── body parts and joints\n    │   └── NPC_2 (Model)\n    │       ├── Humanoid\n    │       ├── HumanoidRootPart\n    │       └── body parts and joints\n    └── NPCHomes\n        ├── NPC_1_Home (Part)\n        └── NPC_2_Home (Part)\n\nCOMMON WRONG STRUCTURE\n\nWorkspace\n├── NPC_1\n├── NPC_2\n└── World\n    ├── NPCs (empty)\n    └── NPCHomes\n        ├── Part\n        └── Part\n\nWrong because the settlers are outside World > NPCs and the markers do not have the required names.",
  steps: [
    {
      title: "Understand — Stop the running game before editing",
      actions: [
        "Look at the top toolbar. If the square Stop button is active, the game is in Play mode.",
        "Click the square Stop button. Wait until your player character disappears and the normal editing tools return.",
        "If you cannot see Explorer or Properties, open the View tab at the top and click Explorer and Properties. Some Studio layouts place these buttons under Window instead."
      ],
      checkpoint: "You are back in Edit mode. Your player character is gone, Explorer is visible, and you can select saved objects without the game running.",
      recovery: "If Stop does nothing, press Shift+F5 once. Do not insert or rename settlers while Play mode is running because Play-mode changes disappear when you stop."
    },
    {
      title: "Understand — Open Roblox Studio's character tool",
      actions: [
        "At the top of Studio, click the Avatar tab.",
        "Look for a button named Rig Builder, Build Rig, or Character. Roblox has used different labels in different Studio versions.",
        "Click that button. A small rig-selection window should open.",
        "If the Avatar tab or button is hidden, widen the Studio window and look for a double-arrow or three-dot overflow button at the right end of the top toolbar.",
        "If it is still missing, open the Plugins tab and look for Build Rig there. Do not use Toolbox search results or a random free model."
      ],
      checkpoint: "A rig-selection window is open and shows basic character choices.",
      recovery: "Close any unrelated Toolbox window and try Avatar > Rig Builder again. If Studio shows no built-in rig control in Avatar, overflow, or Plugins, restart Studio once and reopen the project before continuing."
    },
    {
      title: "Do — Insert one clean basic character",
      actions: [
        "In the rig-selection window, choose R15.",
        "Choose the plain Block Rig or another plain basic R15 option. R15 is used because it is Roblox's modern character format and already contains the pieces needed for later walking missions.",
        "Click the option once and wait. Do not click it repeatedly.",
        "Look in the 3D world and in Explorer under Workspace. A complete character should appear."
      ],
      checkpoint: "Explorer has one new top row directly under Workspace. Expanding that row shows many body parts plus Humanoid and HumanoidRootPart.",
      recovery: "If nothing appears, confirm you are in Edit mode and repeat the insertion once. If several characters appeared, keep one complete character and delete the extra complete copies before continuing."
    },
    {
      title: "Do — Move the complete character into World > NPCs",
      actions: [
        "In Explorer, expand Workspace and find the new character's top row. It is the row that contains Head, body parts, Humanoid, and HumanoidRootPart underneath it.",
        "Click that top row once. Do not select Head, an arm, a leg, Humanoid, or HumanoidRootPart.",
        "Drag the selected top row onto the NPCs folder inside Workspace > World.",
        "Release the mouse only when the NPCs folder is highlighted.",
        "Expand World, then NPCs. The complete character row should now appear indented underneath NPCs. The outer folder that holds an object is called its parent in Roblox."
      ],
      checkpoint: "Explorer reads Workspace > World > NPCs > [new character]. Expanding the character still shows all body parts, Humanoid, and HumanoidRootPart together.",
      recovery: "If only one body part moved, press Ctrl+Z immediately. Then select the character's top row and try again. If the character disappeared from view, use Explorer to select its top row and press F to focus the camera on it."
    },
    {
      title: "Do — Rename the first settler and inspect its required pieces",
      actions: [
        "In Explorer under World > NPCs, right-click the complete character's top row and choose Rename. You can also select it and press F2.",
        "Type exactly NPC_1 and press Enter.",
        "Click the small arrow beside NPC_1 to expand it.",
        "Find an item named Humanoid and an item named HumanoidRootPart. Do not rename either one.",
        "If either item is missing, stop here. This is not a complete usable character."
      ],
      checkpoint: "World > NPCs contains NPC_1, and NPC_1 contains both Humanoid and HumanoidRootPart.",
      recovery: "If Humanoid or HumanoidRootPart is missing, delete the whole broken NPC_1 Model and insert one fresh basic R15 Block Rig. Do not try to rebuild character joints by hand."
    },
    {
      title: "Do — Set the character's main positioning piece",
      actions: [
        "Click the NPC_1 top row in Explorer, not HumanoidRootPart itself.",
        "In Properties, click the search box and type PrimaryPart.",
        "PrimaryPart is the setting that tells Roblox which body piece represents the whole character when it is positioned.",
        "Click the empty value or its selection button, then choose HumanoidRootPart from inside NPC_1.",
        "Look at the value again. It should now say HumanoidRootPart."
      ],
      checkpoint: "With NPC_1 selected, Properties shows PrimaryPart = HumanoidRootPart.",
      recovery: "If PrimaryPart does not appear, make sure the NPC_1 Model row is selected. If HumanoidRootPart is not offered, confirm it is still inside NPC_1 rather than beside it in Explorer."
    },
    {
      title: "Fix — Remove only unwanted inserted scripts",
      actions: [
        "Expand NPC_1 in Explorer and look specifically for rows whose type is Script or LocalScript. Their icons look like script pages, not body blocks.",
        "Do not delete Humanoid, HumanoidRootPart, body parts, Motor6D joints, attachments, clothing, or accessories.",
        "A plain Rig Builder character normally needs no demo Script for this mission. Delete only Script or LocalScript objects that were inserted inside NPC_1 and are not part of Nick's project.",
        "If you are unsure about an item, select it and read its type at the top of Properties before deleting it."
      ],
      checkpoint: "NPC_1 is still a complete character with Humanoid, HumanoidRootPart, body parts, and joints, but no unknown Script or LocalScript remains inside it.",
      recovery: "If you deleted a required character object, press Ctrl+Z. If the character is already damaged or confusing, delete the whole NPC_1 Model and restart from a fresh built-in rig."
    },
    {
      title: "Do — Duplicate the cleaned complete character",
      actions: [
        "Select the NPC_1 top row in Explorer.",
        "Press Ctrl+D once. A complete copy should appear beside NPC_1 under the same NPCs folder.",
        "Rename the new top row exactly NPC_2 and press Enter.",
        "Expand NPC_2 and confirm Humanoid and HumanoidRootPart are present.",
        "Select NPC_2, search Properties for PrimaryPart, and confirm it says HumanoidRootPart."
      ],
      checkpoint: "World > NPCs contains exactly two complete Models named NPC_1 and NPC_2. Both contain Humanoid and HumanoidRootPart, and both use HumanoidRootPart as PrimaryPart.",
      recovery: "If duplication created a loose body part, delete that loose copy and duplicate the NPC_1 top row again. If there are more than two complete settlers, delete the extras."
    },
    {
      title: "Do — Move the settlers apart without breaking them",
      actions: [
        "Select the NPC_1 top row in Explorer. At the top of Studio, click the Move tool.",
        "Use the colored arrows in the 3D view to move the complete character onto clear solid ground.",
        "Repeat with the NPC_2 top row. Leave at least one full character-width of empty space between them.",
        "Keep both feet slightly above the ground surface rather than buried inside it.",
        "Do not drag individual arms, legs, or HumanoidRootPart to separate the settlers."
      ],
      checkpoint: "Both complete settlers are visible, stand over solid ground, do not overlap, and remain inside World > NPCs in Explorer.",
      recovery: "If a character bends or one limb separates, press Ctrl+Z and move the complete Model row instead. If the settlers overlap, move NPC_2 sideways using the Model selection until there is a clear gap."
    },
    {
      title: "Do — Confirm the body parts can move",
      actions: [
        "Expand NPC_1 and click one body part such as Head or UpperTorso.",
        "In Properties, find Anchored. It must be false, which means the body can move with the character.",
        "Check several body parts, including HumanoidRootPart. None should have Anchored set to true.",
        "Repeat the same check inside NPC_2.",
        "Do not change the ground or home-marker anchoring during this check."
      ],
      checkpoint: "Body parts in NPC_1 and NPC_2 have Anchored = false. The settlers themselves are movable characters, not fixed statues.",
      recovery: "If a body part is anchored, select that body part and turn Anchored off. If many body parts have unexpected settings, replace the damaged character with a fresh built-in rig and duplicate it again."
    },
    {
      title: "Do — Create NPC_1_Home under World > NPCHomes",
      actions: [
        "In Explorer, move the mouse over NPCHomes inside Workspace > World and click the small + button.",
        "Choose Part. A new block should appear underneath NPCHomes.",
        "Rename the Part exactly NPC_1_Home.",
        "With NPC_1_Home selected, set Anchored to true, CanCollide to false, and Transparency to 1 in Properties.",
        "Transparency 1 makes the marker invisible. Temporarily use 0.5 while positioning it if needed.",
        "Use the Move tool to place the marker on the ground directly below NPC_1's starting position, near the middle between its feet. Then return Transparency to 1."
      ],
      checkpoint: "World > NPCHomes contains NPC_1_Home. Its settings are Anchored = true, CanCollide = false, Transparency = 1, and it sits under NPC_1's start.",
      recovery: "If the Part appeared somewhere else in Explorer, drag its Part row onto NPCHomes. If you cannot see it while positioning, temporarily set Transparency to 0.5 and return it to 1 afterward."
    },
    {
      title: "Do — Duplicate the second home marker",
      actions: [
        "Select NPC_1_Home in Explorer and press Ctrl+D once.",
        "Rename the copy exactly NPC_2_Home.",
        "Confirm it remains under World > NPCHomes.",
        "Confirm Anchored is true, CanCollide is false, and Transparency is 1.",
        "Temporarily set Transparency to 0.5, move it directly below NPC_2's starting position, then return Transparency to 1."
      ],
      checkpoint: "NPCHomes contains exactly NPC_1_Home and NPC_2_Home, each below the matching settler and using the three required values.",
      recovery: "If both markers are under one settler, select NPC_2_Home and move it below NPC_2. The names and positions must match."
    },
    {
      title: "Observe — Pre-Play checklist",
      actions: [
        "Confirm you are still in Edit mode and save the project.",
        "Expand World > NPCs. Confirm it contains exactly NPC_1 and NPC_2.",
        "Expand each settler. Confirm Humanoid and HumanoidRootPart are present.",
        "Select each settler top row. Confirm PrimaryPart = HumanoidRootPart.",
        "Confirm no unknown Script or LocalScript remains inside either settler.",
        "Confirm body parts are not anchored and the two settlers do not overlap.",
        "Expand World > NPCHomes. Confirm exactly NPC_1_Home and NPC_2_Home with Anchored true, CanCollide false, and Transparency 1."
      ],
      checkpoint: "Every pre-Play check passes. The correct Explorer structure is visible in the Explorer target section below.",
      recovery: "Do not press Play while a check is wrong. Use the recovery note from the matching step, then repeat this checklist from the top."
    },
    {
      title: "Experiment — Run the M3 Play test",
      actions: [
        "Open Output from View > Output or Window > Output, then clear old messages.",
        "Before clicking Play, predict: both settlers should drop only a tiny amount onto the ground, stay upright, remain separate, and keep all body parts connected.",
        "Click Play and watch both settlers for at least ten seconds.",
        "Walk around them once. Confirm neither disappears, breaks apart, falls through the ground, or starts inside the other.",
        "Success means both complete characters remain standing separately on solid ground. No movement code is required yet.",
        "Click Stop before making any correction or taking Explorer evidence."
      ],
      checkpoint: "During Play, NPC_1 and NPC_2 remain upright, separate, complete, and on the island. No red Output error points to Nick's project objects or scripts.",
      recovery: "If a rig falls, check that no body part is anchored and that the ground is solid. If it breaks apart, replace it with a fresh generated rig. If it disappears or falls through, move it above the ground in Edit mode. If both spawn together, move NPC_2 farther away. If unwanted scripts run, stop and delete only those Script or LocalScript objects."
    },
    {
      title: "Fix — Use the shortest safe recovery",
      actions: [
        "Rig falls over: Stop, select the complete Model, place both feet above flat ground, and confirm no body part is anchored.",
        "Rig breaks into pieces: Stop, delete the whole damaged rig, insert a fresh basic R15 Block Rig, clean it, and duplicate again.",
        "Rig disappears or falls through: Stop, select its Model in Explorer, press F to find it, and move it back above approved solid ground.",
        "Rigs begin inside each other: Stop and move NPC_2 sideways until a full character-width gap is visible.",
        "Unexpected animation or code runs: Stop, expand both Models, and remove only unknown Script or LocalScript objects."
      ],
      checkpoint: "After any repair, repeat the complete pre-Play checklist and the ten-second Play test.",
      recovery: "When several things look wrong, replacing one damaged settler with a fresh built-in rig is safer than repairing joints or guessing which character pieces are missing."
    },
    {
      title: "Prove — Capture only the evidence the reviewer needs",
      actions: [
        "After a successful Play test, take one screenshot in Play mode showing NPC_1 and NPC_2 standing separately on the island.",
        "Stop Play. In Explorer, expand World > NPCs, NPC_1, NPC_2, and World > NPCHomes so all required names are visible.",
        "Write a short Explorer proof stating that both NPC Models are under World > NPCs and both home Parts are under World > NPCHomes.",
        "In Properties, check each NPC's PrimaryPart and the three values on both home markers. Write those exact values in the Properties proof box.",
        "Paste Output from the successful current Play run. Do not use Output or a screenshot from before your last change.",
        "Tick only the three tests you actually completed, answer the short understanding question, and send the mission once."
      ],
      checkpoint: "The screenshot, Explorer proof, Properties proof, Output, and checked tests all describe the same final saved version.",
      recovery: "If one screenshot cannot show every Explorer row, keep the Play screenshot as the required image and use the two short text proof boxes for the exact Explorer locations and Properties values."
    }
  ],
  mistakes: [
    "Editing while Play mode is running, so changes disappear after Stop.",
    "Using a Toolbox statue or free model instead of Studio's built-in character rig.",
    "Moving one arm, leg, or root part instead of the complete Model top row.",
    "Leaving NPC_1 or NPC_2 directly under Workspace instead of under World > NPCs.",
    "Deleting Humanoid, HumanoidRootPart, joints, or body parts while trying to remove scripts.",
    "Leaving PrimaryPart blank or selecting something other than HumanoidRootPart.",
    "Anchoring character body parts.",
    "Creating home markers outside NPCHomes or leaving their default names and values.",
    "Starting Play with the two settlers overlapping.",
    "Submitting stale evidence captured before the final repair."
  ],
  tests: [
    { id: "V1-M03-T01", name: "Two valid rigs", setup: "Edit mode", action: "Inspect World > NPCs and both Model properties", expected: "Exactly NPC_1 and NPC_2; each contains Humanoid and HumanoidRootPart; each PrimaryPart is HumanoidRootPart." },
    { id: "V1-M03-T02", name: "Stable play", setup: "Fresh Play with clear Output", action: "Observe both NPCs", expected: "Both remain upright, separate, and on solid ground with no relevant project error." },
    { id: "V1-M03-T03", name: "Home markers", setup: "Edit mode", action: "Inspect World > NPCHomes and marker properties", expected: "Exactly NPC_1_Home and NPC_2_Home; both anchored, non-colliding, invisible, and placed under matching starts." }
  ],
  submission: {
    fields: [
      { key: "explorer_summary", label: "Explorer proof", help: "Write: NPC_1 and NPC_2 are under Workspace > World > NPCs; NPC_1_Home and NPC_2_Home are under Workspace > World > NPCHomes. Add that each NPC contains Humanoid and HumanoidRootPart." },
      { key: "properties", label: "Properties proof", help: "Write each NPC's PrimaryPart, then write Anchored, CanCollide, and Transparency for both home markers. Use the exact values shown in Studio." },
      { key: "output", label: "Current Output", help: "Clear Output, run the final ten-second Play test, Stop, then paste the Output from that same run." },
      { key: "screenshot", label: "Current Play screenshot", help: "Choose one screenshot from the final Play test showing both settlers upright, separate, and on the island." }
    ],
    understanding: "In your own words, why must you move and duplicate the complete NPC Model instead of one body part?"
  }
};
