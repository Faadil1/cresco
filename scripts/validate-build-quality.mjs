import fs from "node:fs";
import path from "node:path";

const recordPath = path.resolve("evidence/BUILD-QUALITY-RECORD.json");
const record = JSON.parse(fs.readFileSync(recordPath, "utf8"));

const requiredFields = ["signal", "negativeEvent", "impact", "lesson", "mitigation"];
const fail = (message) => {
  console.error("BUILD_QUALITY_GATE=FAIL " + message);
  process.exit(1);
};

if (record.principle !== "Real failure > fake success.") {
  fail("canonical principle is missing");
}

if (!Array.isArray(record.requiredNegativeOutcomes) ||
    !record.requiredNegativeOutcomes.includes("REFUSE") ||
    !record.requiredNegativeOutcomes.includes("UNKNOWN")) {
  fail("REFUSE and UNKNOWN must be declared negative outcomes");
}

if (!Array.isArray(record.records) || record.records.length < 1) {
  fail("at least one real negative event is required");
}

for (const event of record.records) {
  for (const field of requiredFields) {
    if (typeof event[field] !== "string" || event[field].trim().length < 8) {
      fail(`${event.id || "unknown"} missing required field ${field}`);
    }
  }

  if (!event.proof || typeof event.proof.url !== "string" || !event.proof.url.startsWith("https://github.com/")) {
    fail(`${event.id || "unknown"} missing verifiable proof URL`);
  }

  if (!event.proof.evidencePath || !fs.existsSync(path.resolve(event.proof.evidencePath))) {
    fail(`${event.id || "unknown"} evidencePath does not exist`);
  }
}

const httpTests = fs.readFileSync(path.resolve("test/http-api.test.mjs"), "utf8");
const boundedTests = fs.readFileSync(path.resolve("test/bounded-autonomy.test.mjs"), "utf8");

if (!httpTests.includes("UNKNOWN fail-closed") || !boundedTests.includes("ActionDecision.REFUSE")) {
  fail("negative path tests are missing");
}

console.log(`BUILD_QUALITY_GATE=PASS negative_events=${record.records.length} outcomes=REFUSE,UNKNOWN`);
