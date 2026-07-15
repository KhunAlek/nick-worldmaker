import fs from "node:fs";

const path = "backend/wrangler.toml";
let source = fs.readFileSync(path, "utf8");
source = source.replace(/^RELEASE_TEST_FAMILY_ID\s*=.*\n?/m, "");
source = source.replace(/^RELEASE_TEST_MISSION_ID\s*=.*\n?/m, "");
source = source.replace(/\n{3,}/g, "\n\n");
fs.writeFileSync(path, source);
console.log("Cleared temporary release pilot variables from official production configuration.");
