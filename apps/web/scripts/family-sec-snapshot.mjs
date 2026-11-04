/**
 * Offline SEC EDGAR import for Cresco Family's read-only learning cards.
 *
 * Run manually with a declared SEC User-Agent (real organization + contact):
 *   SEC_USER_AGENT="Cresco Research your-contact@your-domain" node scripts/family-sec-snapshot.mjs
 *
 * This is intentionally NOT a public browser/API fetch. No data is fabricated,
 * and failure leaves the last committed snapshot unchanged.
 */
import assert from "node:assert/strict";
import { writeFile, rename, unlink } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const COMPANIES = Object.freeze({
  apple: { cik: "0000320193", name: "Apple", forms: ["10-K"], taxonomies: ["us-gaap"] },
  microsoft: { cik: "0000789019", name: "Microsoft", forms: ["10-K"], taxonomies: ["us-gaap"] },
  costco: { cik: "0000909832", name: "Costco", forms: ["10-K"], taxonomies: ["us-gaap"] },
  shopify: { cik: "0001594805", name: "Shopify", forms: ["40-F", "10-K"], taxonomies: ["ifrs-full", "us-gaap"] }
});
const REVENUE = [
  "RevenueFromContractWithCustomerExcludingAssessedTax",
  "RevenueFromContractWithCustomerIncludingAssessedTax",
  "Revenues",
  "SalesRevenueNet",
  "Revenue"
];
const NET_INCOME = ["NetIncomeLoss", "ProfitLoss", "ProfitLossAttributableToOwnersOfParent"];
const TARGET = resolve(dirname(fileURLToPath(import.meta.url)), "../src/lib/family-sec-snapshot.json");

function calendarDays(start, end) {
  const a = Date.parse(start);
  const b = Date.parse(end);
  return Number.isFinite(a) && Number.isFinite(b) ? (b - a) / 86400000 : NaN;
}

export function extractLatestAnnual(document, tags, company) {
  const rows = [];
  for (const taxonomy of company.taxonomies) {
    for (const [tagOrder, tag] of tags.entries()) {
      const observations = document?.facts?.[taxonomy]?.[tag]?.units?.USD;
      if (!Array.isArray(observations)) continue;
      for (const row of observations) {
        const days = calendarDays(row.start, row.end);
        if (!company.forms.includes(row.form) || row.fp !== "FY" ||
            !Number.isFinite(row.val) || !Number.isSafeInteger(row.val) ||
            !Number.isFinite(days) || days < 330 || days > 385 ||
            typeof row.accn !== "string" || typeof row.filed !== "string") continue;
        rows.push({
          valueUSD: row.val, start: row.start, end: row.end,
          filed: row.filed, form: row.form, accession: row.accn,
          taxonomy, tag, tagOrder
        });
      }
    }
  }
  // The latest fiscal year wins. For duplicate facts choose the most recent
  // filing, then the preferred accounting tag. Never add quarter or YTD facts.
  rows.sort((a, b) =>
    b.end.localeCompare(a.end) ||
    b.filed.localeCompare(a.filed) ||
    a.tagOrder - b.tagOrder
  );
  const chosen = rows[0] ?? null;
  if (!chosen) return null;
  const { tagOrder, ...result } = chosen;
  return result;
}

export function normalizeCompany(document, company) {
  if (Number(document?.cik) !== Number(company.cik)) {
    throw new Error("SEC_CIK_MISMATCH:" + company.name);
  }
  const revenue = extractLatestAnnual(document, REVENUE, company);
  const netIncomeCandidate = extractLatestAnnual(document, NET_INCOME, company);
  // Do not juxtapose numbers from different fiscal years as if comparable.
  const netIncome = netIncomeCandidate?.end === revenue?.end ? netIncomeCandidate : null;
  return {
    cik: company.cik,
    issuer: String(document.entityName || company.name),
    annualRevenue: revenue,
    annualNetIncome: netIncome,
    status: revenue ? "AVAILABLE" : "UNAVAILABLE"
  };
}

async function downloadCompany(company, userAgent) {
  const url = "https://data.sec.gov/api/xbrl/companyfacts/CIK" + company.cik + ".json";
  const response = await fetch(url, {
    headers: { "User-Agent": userAgent, Accept: "application/json" },
    signal: AbortSignal.timeout(20000)
  });
  if (!response.ok) throw new Error("SEC_HTTP_" + response.status + ":" + company.name);
  const data = await response.json();
  return normalizeCompany(data, company);
}

async function main() {
  const ua = String(process.env.SEC_USER_AGENT ?? "").trim();
  if (!/^[^@\r\n]+ +[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ua) ||
      /example\.(com|org)|your-contact|placeholder/i.test(ua)) {
    throw new Error("Set SEC_USER_AGENT to a real organization and contact email. Never hard-code it into the site.");
  }
  const companies = {};
  for (const [id, company] of Object.entries(COMPANIES)) {
    companies[id] = await downloadCompany(company, ua);
    // Gentle sequential access; substantially below SEC's 10 req/s ceiling.
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 200));
  }
  const snapshot = {
    schemaVersion: 1,
    source: "US SEC EDGAR Company Facts API",
    generatedAt: new Date().toISOString(),
    companies
  };
  const temp = TARGET + ".tmp";
  try {
    await writeFile(temp, JSON.stringify(snapshot, null, 2) + "\n", { flag: "w" });
    await rename(temp, TARGET);
  } finally {
    await unlink(temp).catch(() => {});
  }
  process.stdout.write("SEC_SNAPSHOT=PASS " + Object.keys(companies).length + " companies; no market prices, no publication\n");
}

function selfTest() {
  const company = COMPANIES.apple;
  const make = (val, start, end, form = "10-K") =>
    ({val, start, end, filed: "2026-10-30", fp: "FY", form, accn: "0000000000-26-000001"});
  const document = {
    cik: 320193,
    facts: { "us-gaap": {
      Revenues: { units: {USD: [
        make(95, "2025-10-01", "2025-12-31"), // quarter masquerading as FY -> reject
        make(320, "2024-09-29", "2025-09-27"),
        make(290, "2023-10-01", "2024-09-28")
      ]}},
      NetIncomeLoss: { units: {USD: [make(50, "2024-09-29", "2025-09-27")]}}
    }}
  };
  assert.equal(normalizeCompany(document, company).annualRevenue.valueUSD, 320);
  assert.equal(normalizeCompany(document, company).annualNetIncome.valueUSD, 50);
  assert.equal(extractLatestAnnual({facts:{}}, REVENUE, company), null);
  assert.throws(() => normalizeCompany({...document,cik:1},company), /SEC_CIK_MISMATCH/);
  assert.equal(normalizeCompany({...document,facts:{"us-gaap":{
    ...document.facts["us-gaap"],
    NetIncomeLoss:{units:{USD:[make(20,"2023-10-01","2024-09-28")]}}
  }}},company).annualNetIncome,null);
  process.stdout.write("SEC_SNAPSHOT_SELF_TEST=PASS\n");
}
if (process.argv.includes("--self-test")) selfTest();
else main().catch(error => {console.error("SEC_SNAPSHOT=NO_GO " + error.message);process.exitCode = 1;});
