window.WORLDMAKER_LESSONS = window.WORLDMAKER_LESSONS || {};

window.WORLDMAKER_LESSONS["V1-M04"] = {
  id: "V1-M04",
  title: "Select a Settler",
  difficulty: "Moderate",
  objective: "Click either NPC and move one visible selection marker to the NPC you chose.",
  whyItMatters: "Direct commands need a clear answer to which settler the player is controlling.",
  startingState: "Mission 3 is approved. NPC_1 and NPC_2 are valid movable rigs inside Workspace > World > NPCs.",
  visibleResult: "Clicking NPC_1 highlights only NPC_1. Clicking NPC_2 moves the same highlight to NPC_2. Repeated clicks never create extra highlights.",
  concepts: [
    { name: "ClickDetector", text: "An object that reports when a player clicks a 3D part." },
    { name: "LocalScript", text: "Code that runs separately for one player." },
    { name: "Variable", text: "A named place that remembers a value, such as the selected NPC." },
    { name: "Event connection", text: "Code that runs when something happens, such as a click." },
    { name: "Highlight", text: "A visible outline that can point to one Model through its Adornee property." }
  ],
  hierarchy: "Workspace\n└── World\n    └── NPCs\n        ├── NPC_1 (Model)\n        │   └── HumanoidRootPart\n        │       └── ClickDetector\n        └── NPC_2 (Model)\n            └── HumanoidRootPart\n                └── ClickDetector\n\nStarterGui\n└── CommandGui (ScreenGui)\n    └── CommandClient (LocalScript)\n\nCreated locally during Play\n└── SelectedNPCHighlight (one Highlight only)",
  steps: [
    {
      title: "Add one ClickDetector to each settler",
      actions: [
        "Stop Play mode.",
        "Expand Workspace > World > NPCs > NPC_1 > HumanoidRootPart.",
        "Click the + beside HumanoidRootPart and insert ClickDetector.",
        "Repeat under NPC_2 > HumanoidRootPart.",
        "Keep both object names exactly ClickDetector."
      ],
      checkpoint: "Each HumanoidRootPart contains exactly one ClickDetector.",
      recovery: "If a detector is under the NPC Model instead of HumanoidRootPart, drag it onto HumanoidRootPart. Delete accidental duplicates."
    },
    {
      title: "Create the player-side script",
      actions: [
        "In StarterGui, insert a ScreenGui and rename it CommandGui.",
        "Select CommandGui and set ResetOnSpawn to false.",
        "Inside CommandGui, insert a LocalScript.",
        "Rename the LocalScript exactly CommandClient.",
        "Delete its default Hello world line."
      ],
      checkpoint: "Explorer shows StarterGui > CommandGui > CommandClient, and CommandClient is a LocalScript.",
      recovery: "If you created a normal Script, delete it and insert LocalScript. Selection must remain local to each player."
    },
    {
      title: "Find the two NPCs safely",
      actions: [
        "Open CommandClient.",
        "Create a reference to Workspace.World.NPCs using WaitForChild for objects that may not be ready immediately.",
        "Create references to NPC_1 and NPC_2 from the NPCs folder.",
        "Create references to each HumanoidRootPart and ClickDetector."
      ],
      checkpoint: "Every reference points to the exact canonical object name and no red underline remains in the script.",
      recovery: "If Play reports an infinite yield or missing object, compare every Explorer name and location with the Explorer target before changing the code."
    },
    {
      title: "Create one remembered selection",
      actions: [
        "Near the top of CommandClient, create local selectedNPC = nil.",
        "Create one Highlight object in the LocalScript.",
        "Name it SelectedNPCHighlight.",
        "Set its Adornee to nil at the start.",
        "Parent it somewhere local and available during Play, such as CommandGui."
      ],
      checkpoint: "The script creates selectedNPC and one SelectedNPCHighlight once, before any click handler runs.",
      recovery: "If Highlight.new appears inside a click function, move it above the functions so clicks reuse one object instead of creating more."
    },
    {
      title: "Write one selection helper",
      actions: [
        "Create a local function named selectNPC with one parameter named npc.",
        "Inside the function, set selectedNPC to npc.",
        "Set SelectedNPCHighlight.Adornee to npc.",
        "Do not create another local selectedNPC inside this function."
      ],
      checkpoint: "Both the remembered variable and the Highlight point to the same npc parameter.",
      recovery: "If the marker moves but selectedNPC stays nil, look for local selectedNPC inside the function. Remove the extra local keyword."
    },
    {
      title: "Connect each detector exactly once",
      actions: [
        "Connect NPC_1's ClickDetector.MouseClick event once.",
        "Inside that event, call selectNPC(NPC_1).",
        "Connect NPC_2's ClickDetector.MouseClick event once.",
        "Inside that event, call selectNPC(NPC_2).",
        "Keep both connections outside selectNPC and outside each other."
      ],
      checkpoint: "The script has two event connections total: one for NPC_1 and one for NPC_2.",
      recovery: "If clicks become faster or repeat unexpectedly, search for :Connect. The same detector must not be connected again after every selection."
    },
    {
      title: "Run the four proof tests",
      actions: [
        "Clear Output and press Play.",
        "Click NPC_1, then NPC_2.",
        "Alternate between them at least five times and watch for one marker only.",
        "Stop, clear Output, press Play again, and click NPC_2 first.",
        "Capture one current composite screenshot or current visual evidence that clearly shows the selection states, plus the clean Output and hierarchy."
      ],
      checkpoint: "The same marker moves between NPCs, no duplicate Highlight appears, fresh restart works, and Output has no relevant project error.",
      recovery: "If nothing highlights, check ClickDetector location, LocalScript location, Adornee assignment, and Output in that order."
    }
  ],
  mistakes: [
    "CommandClient is a normal Script instead of a LocalScript.",
    "A new Highlight is created on every click.",
    "One permanent Highlight is placed inside each NPC.",
    "ClickDetector is outside HumanoidRootPart.",
    "selectedNPC is redeclared inside selectNPC.",
    "The same detector is connected repeatedly.",
    "Highlight.Parent changes but Highlight.Adornee is never set.",
    "Selection logic is moved to WorldServer even though selection must be local."
  ],
  tests: [
    { id: "V1-M04-T01", name: "Select first", setup: "Fresh Play with no selection", action: "Click NPC_1", expected: "Exactly one Highlight appears on NPC_1." },
    { id: "V1-M04-T02", name: "Move selection", setup: "Continue from T01", action: "Click NPC_2", expected: "The same marker moves to NPC_2 and NPC_1 is no longer highlighted." },
    { id: "V1-M04-T03", name: "No duplication", setup: "Continue in the same Play run", action: "Alternate clicks at least five times", expected: "Only one SelectedNPCHighlight exists and Output stays clean." },
    { id: "V1-M04-T04", name: "Fresh restart", setup: "Stop and start a fresh Play run", action: "Click NPC_2 first", expected: "Selection works after restart with no duplicate connections or marker." }
  ],
  submission: {
    fields: [
      { key: "code", label: "Complete CommandClient", help: "Paste the complete current LocalScript, not a cropped selection function." },
      { key: "explorer_summary", label: "Explorer proof", help: "Describe both ClickDetector locations and StarterGui > CommandGui > CommandClient." },
      { key: "output", label: "Current Output", help: "Clear Output, run all four tests, then paste the current Output text." },
      { key: "screenshot", label: "Current selection proof", help: "Use one clear composite screenshot showing the marker on both NPCs, or the clearest current visual proof available." }
    ],
    understanding: "What single variable tells the rest of the client which NPC should receive the next command?"
  }
};