import fs from "node:fs";
import path from "node:path";

const ROOTS = ["src/app", "src/components", "src/mocks"];
const EXTENSIONS = new Set([".ts", ".tsx"]);

const bannedPhrases = [
  "learning journey",
  "seamlessly",
  "game-changing",
  "revolutionary",
  "unlock your",
  "whether you're",
  "at the end of the day",
  "delve into",
  "elevate your",
];

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function stripComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
}

const failures = [];

for (const root of ROOTS) {
  for (const file of walk(root).filter((f) => EXTENSIONS.has(path.extname(f)))) {
    const source = stripComments(fs.readFileSync(file, "utf8"));
    const lines = source.split("\n");

    lines.forEach((line, index) => {
      if (line.includes("—")) {
        failures.push(`${file}:${index + 1} contains an em dash in non-comment source`);
      }

      const lower = line.toLowerCase();
      for (const phrase of bannedPhrases) {
        if (lower.includes(phrase)) {
          failures.push(`${file}:${index + 1} contains banned copy phrase "${phrase}"`);
        }
      }
    });
  }
}

if (failures.length) {
  console.error("Cresco copy lint failed:\n" + failures.map((x) => `- ${x}`).join("\n"));
  process.exit(1);
}

console.log("Cresco copy lint passed.");
