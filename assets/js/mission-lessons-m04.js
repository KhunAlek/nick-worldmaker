window.WORLDMAKER_LESSONS = window.WORLDMAKER_LESSONS || {};

window.WORLDMAKER_LESSONS["V1-M04"] = {
  id: "V1-M04",
  title: "Select a Settler",
  difficulty: "Moderate",
  objective: "Click either settler and move one bright selection marker onto that settler.",
  whyItMatters: "The command game needs to know which settler should receive the player's next command. This mission creates that choice without adding commands yet.",
  startingState: "V1-M03 is approved. Workspace > World > NPCs contains NPC_1 and NPC_2, and each one is a working character Model with Humanoid and HumanoidRootPart.",
  visibleResult: "Clicking NPC_1 highlights only NPC_1. Clicking NPC_2 moves the same marker to NPC_2. Repeated switching never creates a second marker.",
  concepts: [
    { name: "ClickDetector", text: "A ClickDetector lets Roblox notice when a player clicks a 3D object. Each settler will have one under its HumanoidRootPart." },
    { name: "LocalScript", text: "A LocalScript runs for one player on that player's device. Selection belongs only to the player who clicked." },
    { name: "Variable", text: "A variable is a named place where code remembers one value. selectedNPC remembers which settler is selected." },
    { name: "Event connection", text: "A click is something that happens while the game is running. Roblox calls this an event. Connecting a function to an event tells Roblox what code to run when the click happens." },
    { name: "Highlight", text: "A Highlight draws a visible marker around a 3D object. This mission creates one Highlight and moves it between settlers." },
    { name: "Local player state", text: "Local player state means a remembered value exists only for this player. It is not shared with the server or another player." }
  ],
  hierarchy: "Workspace\n└── World\n    └── NPCs\n        ├── NPC_1\n        │   └── HumanoidRootPart\n        │       └── ClickDetector\n        └── NPC_2\n            └── HumanoidRootPart\n                └── ClickDetector\n\nStarterGui\n└── CommandGui\n    └── CommandClient\n\nDuring Play\n└── SelectedNPCHighlight (one Highlight only)",
  steps: [
    {
      title: "Starting check",
      actions: [
        "Open your Worldmaker place in Roblox Studio.",
        "In the top menu, open View and make sure Explorer, Properties, and Output are visible.",
        "In Explorer, expand Workspace > World > NPCs and confirm NPC_1 and NPC_2 are both directly inside NPCs.",
        "Expand each NPC and confirm each one contains Humanoid and HumanoidRootPart.",
        "Confirm there is not already a ClickDetector under either HumanoidRootPart.",
        "Confirm StarterGui does not already contain a duplicate or unfinished CommandGui.",
        "Do not create a command panel, buttons, resources, movement code, or RemoteEvents in this mission."
      ],
      checkpoint: "The approved V1-M03 starting state is present: two valid settlers exist, and no selection system has been started yet.",
      recovery: "If one settler is missing or does not have HumanoidRootPart, stop this mission. The V1-M03 starting state is not ready."
    },
    {
      title: "Understand — One remembered settler, one movable marker",
      actions: [
        "The game needs to remember which settler you clicked most recently.",
        "The variable selectedNPC starts as nil, which means nothing is selected yet.",
        "After a click, selectedNPC remembers either NPC_1 or NPC_2.",
        "The visible marker is created once as a Highlight.",
        "Instead of making another Highlight after every click, the code changes the existing Highlight's Adornee. Adornee means the object this Highlight is drawing around.",
        "Remember the key idea: one variable remembers one NPC, and one Highlight shows that same NPC."
      ],
      codeBlocks: [
        {
          label: "Core idea",
          code: "local selectedNPC = nil\nlocal selectionHighlight = Instance.new(\"Highlight\")",
          explanation: "The variable remembers the selected settler. The Highlight is the one visible marker that will move."
        }
      ],
      checkpoint: "You can explain that selectedNPC remembers the chosen settler and the Highlight shows that same settler.",
      recovery: "If this sounds like two markers, pause here: the mission needs one marker only. The marker moves by changing Adornee."
    },
    {
      title: "Do — Add one ClickDetector to each settler",
      actions: [
        "Stop Play mode if it is running.",
        "Expand Workspace > World > NPCs > NPC_1.",
        "Select HumanoidRootPart, click the small + button, search for ClickDetector, and choose ClickDetector.",
        "Confirm the new ClickDetector appears directly under NPC_1 > HumanoidRootPart.",
        "Repeat the same action for Workspace > World > NPCs > NPC_2 > HumanoidRootPart.",
        "Check that neither HumanoidRootPart has two ClickDetectors."
      ],
      checkpoint: "Each settler has exactly one ClickDetector directly under its HumanoidRootPart.",
      recovery: "If a ClickDetector is under NPC_1, NPC_2, NPCs, or Workspace instead of under HumanoidRootPart, drag it to the correct HumanoidRootPart. Delete accidental duplicates."
    },
    {
      title: "Do — Create CommandGui",
      actions: [
        "In Explorer, find StarterGui.",
        "Move the mouse over StarterGui, click the small + button, search for ScreenGui, and choose ScreenGui.",
        "Select the new ScreenGui and rename it exactly CommandGui.",
        "With CommandGui selected, look in Properties.",
        "Find ResetOnSpawn and turn it off so the box is not checked.",
        "Do not add a Panel, Frame, TextLabel, or button. The visible command HUD belongs to V1-M06."
      ],
      checkpoint: "Explorer shows StarterGui > CommandGui, and CommandGui.ResetOnSpawn is false.",
      recovery: "If you made a Panel or button, delete it. If ResetOnSpawn is still true, select CommandGui and turn the property off."
    },
    {
      title: "Do — Create CommandClient",
      actions: [
        "Move the mouse over StarterGui > CommandGui and click the small + button.",
        "Search for LocalScript and choose LocalScript.",
        "Rename the new LocalScript exactly CommandClient.",
        "Check that CommandClient is a LocalScript, not a normal Script.",
        "Check that it is directly inside CommandGui.",
        "If Roblox Studio is in Play mode, click Stop before editing the code."
      ],
      checkpoint: "Explorer shows StarterGui > CommandGui > CommandClient, with exactly one CommandClient.",
      recovery: "If you created a normal Script, delete it and insert a LocalScript. Selection must run for the player who clicked."
    },
    {
      title: "Do — Write the complete selection code",
      actions: [
        "Double-click CommandClient to open it in the Script Editor.",
        "Delete all default code inside it.",
        "Type or paste the complete code below.",
        "Do not add command, resource, movement, or server code.",
        "Do not create a Highlight inside selectNPC. The Highlight must be created once before clicks happen."
      ],
      codeBlocks: [
        {
          label: "StarterGui > CommandGui > CommandClient",
          code: "local Players = game:GetService(\"Players\")\n\nlocal localPlayer = Players.LocalPlayer\nlocal npcFolder = workspace:WaitForChild(\"World\"):WaitForChild(\"NPCs\")\n\nlocal npc1 = npcFolder:WaitForChild(\"NPC_1\")\nlocal npc2 = npcFolder:WaitForChild(\"NPC_2\")\n\nlocal selectedNPC = nil\n\nlocal selectionHighlight = Instance.new(\"Highlight\")\nselectionHighlight.Name = \"SelectedNPCHighlight\"\nselectionHighlight.FillTransparency = 0.5\nselectionHighlight.OutlineTransparency = 0\nselectionHighlight.Adornee = nil\nselectionHighlight.Parent = workspace\n\nlocal function selectNPC(npc)\n\tselectedNPC = npc\n\tselectionHighlight.Adornee = selectedNPC\nend\n\nlocal function connectNPC(npc)\n\tlocal rootPart = npc:WaitForChild(\"HumanoidRootPart\")\n\tlocal clickDetector = rootPart:WaitForChild(\"ClickDetector\")\n\n\tclickDetector.MouseClick:Connect(function(playerWhoClicked)\n\t\tif playerWhoClicked ~= localPlayer then\n\t\t\treturn\n\t\tend\n\n\t\tselectNPC(npc)\n\tend)\nend\n\nconnectNPC(npc1)\nconnectNPC(npc2)",
          explanation: "This creates one selectedNPC variable, one SelectedNPCHighlight, and one click connection for each settler."
        }
      ],
      checkpoint: "The script contains the complete code, with no red underline and no temporary print lines.",
      recovery: "If the code looks incomplete, replace the whole script with the complete code block instead of patching small fragments."
    },
    {
      title: "Understand — What the code does",
      actions: [
        "Players.LocalPlayer remembers the player using this device.",
        "WaitForChild finds World, NPCs, NPC_1, and NPC_2 by exact name. It waits until the named object is available instead of guessing it has loaded.",
        "selectedNPC is the single variable that remembers the current selection.",
        "Instance.new(\"Highlight\") creates one Highlight object. An object created by code is called an Instance.",
        "selectionHighlight.Adornee = nil means nothing is outlined before the first click.",
        "selectNPC is a function. A function is a named group of instructions that can run later.",
        "The name npc between parentheses is the value given to the function when it is called. Luau calls that an argument.",
        "MouseClick is the click event from the ClickDetector. Connect tells Roblox which instructions to run after the click.",
        "The playerWhoClicked check makes this LocalScript react only to its own player's click.",
        "connectNPC(npc1) and connectNPC(npc2) create the two click connections once. Do not put those lines inside another click function."
      ],
      checkpoint: "You can point to the line that remembers the selected NPC and the line that moves the Highlight.",
      recovery: "If the code creates more connections after each click, restore the complete code and keep connectNPC(npc1) and connectNPC(npc2) at the bottom."
    },
    {
      title: "Do — Check before running",
      actions: [
        "Confirm the first line says local Players, with an s.",
        "Confirm the path uses \"World\" and then \"NPCs\".",
        "Confirm the settler names are exactly \"NPC_1\" and \"NPC_2\".",
        "Confirm there is only one line declaring selectedNPC.",
        "Confirm the Highlight name is exactly \"SelectedNPCHighlight\".",
        "Confirm the code changes selectionHighlight.Adornee and does not create a new Highlight inside selectNPC.",
        "Confirm connectNPC(npc1) appears once and connectNPC(npc2) appears once.",
        "Audit Explorer for exactly two ClickDetectors, exactly one CommandGui, exactly one CommandClient, and no visible command Panel."
      ],
      checkpoint: "The code and Explorer match the required M4 structure before Play starts.",
      recovery: "If any exact name differs, fix the name before testing. Do not compensate for wrong Explorer names by changing canonical code names."
    },
    {
      title: "Observe — Test the first selection",
      actions: [
        "In Output, click the clear button so old messages do not confuse this test.",
        "Click Play and wait until your character appears.",
        "Before clicking a settler, confirm neither settler has the selection marker, neither settler moves, and no command panel appears.",
        "Click NPC_1 once in the 3D world.",
        "Confirm one Highlight appears around NPC_1, NPC_2 is not highlighted, neither NPC moves, no resource value changes, and Output shows no red error from CommandClient.",
        "During Play, expand Workspace in Explorer and find exactly one object named SelectedNPCHighlight.",
        "Select SelectedNPCHighlight and check that its Adornee points to NPC_1."
      ],
      checkpoint: "NPC_1 is selected with exactly one Highlight, and no later-mission behavior appears.",
      recovery: "If clicking does nothing, check the ClickDetector locations, exact object names, CommandClient location, and the first red Output line mentioning CommandClient."
    },
    {
      title: "Observe — Move the same selection marker",
      actions: [
        "Without stopping Play, click NPC_2.",
        "Confirm the marker leaves NPC_1 and appears around NPC_2.",
        "Confirm only one settler is highlighted.",
        "Confirm Explorer still contains only one SelectedNPCHighlight.",
        "Confirm the Adornee property now points to NPC_2.",
        "Click NPC_1 again and confirm the same marker returns to NPC_1.",
        "Confirm neither NPC moves and Output remains free of red project-code errors."
      ],
      checkpoint: "The same marker moves between settlers. This proves one variable and one Highlight are changing together.",
      recovery: "If two markers appear, stop Play and remove any duplicate CommandClient or manually saved Highlight. Confirm Instance.new(\"Highlight\") appears only once and outside selectNPC."
    },
    {
      title: "Experiment — Make the marker softer, then restore it",
      actions: [
        "Stop Play.",
        "Open StarterGui > CommandGui > CommandClient.",
        "Find selectionHighlight.FillTransparency = 0.5.",
        "Predict what will happen if 0.5 changes to 0.8. A larger transparency number makes the inside color less visible.",
        "Change only that number to 0.8.",
        "Press Play and click one settler.",
        "Confirm selection still works, the inside of the Highlight looks fainter, there is still only one Highlight, and no movement or command behavior appears.",
        "Stop Play and restore the required lesson code to selectionHighlight.FillTransparency = 0.5.",
        "Run once more and confirm the stronger fill returns."
      ],
      checkpoint: "The safe experiment worked and the required value 0.5 was restored.",
      recovery: "Do not leave the experiment value behind. If selection stopped working, restore the complete code block from the lesson."
    },
    {
      title: "Fix — Use the symptom that matches your result",
      actions: [
        "Clicking does nothing: stop Play, confirm each ClickDetector is directly under its HumanoidRootPart, confirm exact names, and confirm CommandClient is a LocalScript inside StarterGui > CommandGui.",
        "Output says it waited forever for ClickDetector: move the existing ClickDetector into the correct HumanoidRootPart instead of making a second one.",
        "Two markers appear: keep only the required CommandClient, remove any saved Highlight, and confirm Instance.new(\"Highlight\") appears only once outside selectNPC.",
        "The marker appears on both NPCs: count objects named SelectedNPCHighlight during Play and remove duplicate scripts or manually created Highlights.",
        "The marker selects once but switching later fails: restore connectNPC(npc1) and connectNPC(npc2) once at the bottom of the script.",
        "Selection works before respawn but duplicates afterward: set CommandGui.ResetOnSpawn to false.",
        "Output contains an error from a plugin or a path beginning with cloud_: first confirm whether clicking still moves exactly one marker and CommandClient itself has no red error. Do not edit plugin code."
      ],
      checkpoint: "After any repair, the mission returns to one LocalScript, two ClickDetectors, and one runtime Highlight.",
      recovery: "When several things are wrong, restore the complete lesson code, remove duplicate objects, and repeat the starting check."
    },
    {
      title: "Prove — Run all four mission tests",
      actions: [
        "Remove all temporary experiment changes before proving the mission.",
        "Confirm the code uses selectionHighlight.FillTransparency = 0.5.",
        "Clear Output.",
        "V1-M04-T01: start a fresh Play session, click NPC_1, and confirm exactly one Highlight appears on NPC_1.",
        "V1-M04-T02: continue the same Play session, click NPC_2, and confirm the marker moves to NPC_2 while NPC_1 is no longer highlighted.",
        "V1-M04-T03: continue the same Play session, alternate between the settlers at least five times, expand Workspace, show the single SelectedNPCHighlight, and show Output.",
        "V1-M04-T04: stop Play completely, clear Output, start Play again, click NPC_2 first, and confirm selection works immediately with one SelectedNPCHighlight and no duplicated connection behavior."
      ],
      checkpoint: "All four V1-M04 tests pass from the same final saved version.",
      recovery: "If one proof test fails, fix the matching symptom, restart from a fresh Play session, and rerun all four tests."
    },
    {
      title: "Prove — Submit the smallest complete proof",
      actions: [
        "Submit one short screen recording showing a fresh Play start, NPC_1 selected, selection moved to NPC_2, at least five alternating clicks, Explorer expanded during Play with exactly one SelectedNPCHighlight, Output visible with no red project-code error, Stop, fresh Play, and NPC_2 clicked first.",
        "Submit one screenshot of the complete CommandClient code with the script path visible in Explorer: StarterGui > CommandGui > CommandClient.",
        "Before recording or taking the screenshot, restore FillTransparency to 0.5, remove temporary print lines, remove duplicate objects, keep no manually created Highlight, and keep no Panel, buttons, resources, commands, or movement code.",
        "Answer the understanding question: Which single variable remembers the settler that should receive the player's next command?",
        "A short answer such as selectedNPC is enough.",
        "After submission, the mission must receive a validated APPROVED result before V1-M05 unlocks."
      ],
      checkpoint: "The proof shows the final version, not an earlier attempt or an experiment version.",
      recovery: "If the recording missed Explorer or Output, capture one new complete proof from the final saved version instead of explaining from memory."
    }
  ],
  mistakes: [
    "CommandClient is a normal Script instead of a LocalScript.",
    "ClickDetector is outside HumanoidRootPart.",
    "A new Highlight is created on every click.",
    "A permanent Highlight is manually placed inside each NPC.",
    "selectedNPC is redeclared inside selectNPC.",
    "The same detector is connected repeatedly.",
    "CommandGui.ResetOnSpawn is left true.",
    "Panel, buttons, resources, commands, RemoteEvents, movement, or server selection state are added early."
  ],
  tests: [
    { id: "V1-M04-T01", name: "Select first", setup: "Fresh Play with no selection", action: "Click NPC_1", expected: "Exactly one Highlight appears on NPC_1." },
    { id: "V1-M04-T02", name: "Move selection", setup: "Continue from T01", action: "Click NPC_2", expected: "The same marker moves to NPC_2 and NPC_1 is no longer highlighted." },
    { id: "V1-M04-T03", name: "No duplication", setup: "Continue in the same Play run", action: "Alternate clicks at least five times", expected: "Only one SelectedNPCHighlight exists and Output stays clean." },
    { id: "V1-M04-T04", name: "Fresh restart", setup: "Stop and start a fresh Play run", action: "Click NPC_2 first", expected: "Selection works after restart with no duplicate connections or marker." }
  ],
  submission: {
    fields: [
      { key: "video", label: "Current selection recording", help: "Show fresh Play, NPC_1 selected, NPC_2 selected, five or more switches, one SelectedNPCHighlight in Explorer, clean Output, Stop, fresh Play, and NPC_2 clicked first." },
      { key: "code", label: "Complete CommandClient", help: "Paste the complete current LocalScript, not a cropped selection function." },
      { key: "output", label: "Current Output", help: "Clear Output, run all four tests, then paste the current Output text." },
      { key: "screenshot", label: "Current code screenshot", help: "Attach one screenshot showing StarterGui > CommandGui > CommandClient and the complete CommandClient code." }
    ],
    understanding: "Which single variable remembers the settler that should receive the player's next command?"
  }
};
