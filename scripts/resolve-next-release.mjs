import fs from "node:fs";

const manifest = fs.readFileSync("assets/js/mission-release-manifest.js", "utf8");
const match = manifest.match(/const releasedIds=(\[[^;]*\]);/);
if (!match) throw new Error("Release manifest marker is missing.");
const released = new Set(JSON.parse(match[1]));
const missions = Array.from({ length: 9 }, (_, index) => `V1-M${String(index + 7).padStart(2, "0")}`);
const mission = process.env.INPUT_MISSION_ID || missions.find(id => !released.has(id));
if (!mission) {
  console.log("ALL_RELEASED=true");
  fs.appendFileSync(process.env.GITHUB_ENV, "ALL_RELEASED=true\n");
  process.exit(0);
}
const number = Number(mission.slice(-2));
const next = process.env.INPUT_NEXT_MISSION_ID || (number < 15 ? `V1-M${String(number + 1).padStart(2, "0")}` : "");
fs.appendFileSync(process.env.GITHUB_ENV, `ALL_RELEASED=false\nMISSION_ID=${mission}\nNEXT_ID=${next}\n`);
console.log(`Resolved ${mission}${next ? ` -> ${next}` : " as final mission"}.`);
