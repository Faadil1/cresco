/**
 * MARKETSTACK EOD OFFLINE SNAPSHOT IMPORT (NO PUBLIC NETWORK ENDPOINT)
 *
 * Fetches latest prices using a private key only if the operator has
 * independently confirmed: display, redistribution, derivative/P&L and
 * local cache rights for these four US Nasdaq listings in a family app.
 *
 * The API key must never appear in source, client bundles, logs or errors.
 * The initial snapshot is DISABLED with no invented quotes.
 *
 * Usage from apps/web:
 *  node scripts/family-marketstack-eod-import.mjs --self-test
 *  MARKETSTACK_API_KEY=... CRESCO_EOD_DISPLAY_RIGHTS=CONFIRMED \
 *    CRESCO_EOD_DERIVED_RIGHTS=CONFIRMED CRESCO_EOD_CACHE_RIGHTS=CONFIRMED \
 *    CRESCO_EOD_LICENSE_REFERENCE="contract-or-license-reference" \
 *    node scripts/family-marketstack-eod-import.mjs
 *
 * IMPORTANT: This tool intentionally NEVER runs in an ordinary build or CI.
 */
import assert from "node:assert/strict";
import { writeFile, rename, unlink } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const TICKERS = Object.freeze({
  apple: "AAPL", microsoft: "MSFT", costco: "COST", shopify: "SHOP"
});
const TARGET = resolve(dirname(fileURLToPath(import.meta.url)), "../src/lib/family-market-approved-snapshot.json");
const EXPECTED_EXCHANGES = new Set(["XNAS", "NASDAQ"]);
const DATE = /^\d{4}-\d{2}-\d{2}$/;

function validDay(day) {
  if(typeof day !== "string" || !DATE.test(day)) return false;
  const n = Date.parse(day + "T00:00:00Z");
  return Number.isFinite(n) && new Date(n).toISOString().slice(0, 10) === day;
}
function daysBetween(a,b) {
  return (Date.parse(b+"T00:00:00Z")-Date.parse(a+"T00:00:00Z"))/86400000;
}
export function validateEodResponse(response, currentDay) {
  if(!validDay(currentDay) || !Array.isArray(response?.data)) throw Error("INVALID_MARKET_RESPONSE");
  const quotes = {};
  for(const [id,symbol] of Object.entries(TICKERS)){
    const all=response.data.filter(row=>row?.symbol === symbol);
    // Never silently pick an ambiguous row, different exchange or currency.
    if(all.length !== 1) throw Error("MISSING_OR_AMBIGUOUS_TICKER:"+symbol);
    const row=all[0];
    const day=typeof row.date === "string" ? row.date.slice(0,10) : "";
    const exchange=String(row.exchange ?? "").toUpperCase();
    if(!EXPECTED_EXCHANGES.has(exchange) || (row.currency && row.currency!=="USD")){
      throw Error("UNVERIFIED_US_LISTING_OR_CURRENCY:"+symbol);
    }
    if(!validDay(day) || daysBetween(day,currentDay)<0 || daysBetween(day,currentDay)>7) {
      throw Error("STALE_OR_FUTURE_EOD_DATE:"+symbol);
    }
    if(!Number.isFinite(row.close) || row.close<=0 || row.close>1000000){
      throw Error("BAD_CLOSE:"+symbol);
    }
    const cents=Math.round(row.close*100);
    if(!Number.isSafeInteger(cents) || cents<=0) throw Error("BAD_PRICE_CENTS:"+symbol);
    quotes[id]={symbol,exchange:"XNAS",currency:"USD",priceCents:cents,asOf:day,priceType:"END_OF_DAY_CLOSE",source:"Marketstack EOD"};
  }
  return quotes;
}
export function checkLicense(env) {
  const gates=["CRESCO_EOD_DISPLAY_RIGHTS","CRESCO_EOD_DERIVED_RIGHTS","CRESCO_EOD_CACHE_RIGHTS"];
  if(gates.some(key=>env[key]!=="CONFIRMED")) throw Error("RIGHTS_NOT_VERIFIED_NO_DATA_IMPORT");
  const ref=String(env.CRESCO_EOD_LICENSE_REFERENCE ?? "").trim();
  if(ref.length<8 || /test|demo|example|placeholder/i.test(ref)) throw Error("LICENSE_REFERENCE_REQUIRED");
  const key=String(env.MARKETSTACK_API_KEY ?? "").trim();
  if(key.length<8) throw Error("PRIVATE_MARKETSTACK_KEY_REQUIRED");
  return {key,ref};
}
async function run() {
  const {key,ref}=checkLicense(process.env);
  const url = new URL("https://api.marketstack.com/v2/eod/latest");
  url.searchParams.set("access_key",key);
  url.searchParams.set("symbols",Object.values(TICKERS).join(","));
  url.searchParams.set("limit","8");
  let response;
  try{
    response=await fetch(url,{method:"GET",headers:{accept:"application/json"},signal:AbortSignal.timeout(20000)});
    if(!response.ok) throw Error("EOD_PROVIDER_HTTP_ERROR");
    const raw=await response.json();
    const today=new Date().toISOString().slice(0,10);
    const quotes=validateEodResponse(raw,today);
    const output={
      schemaVersion:1,status:"APPROVED_SNAPSHOT",provider:"Marketstack EOD",
      generatedAt:new Date().toISOString(),rightsReference:ref,quotes
    };
    const tmp=TARGET+".tmp";
    try{
      await writeFile(tmp,JSON.stringify(output,null,2)+"\n",{flag:"w"});
      await rename(tmp,TARGET);
    }finally{ await unlink(tmp).catch(()=>{}); }
    process.stdout.write("MARKETSTACK_EOD_SNAPSHOT=PASS records="+Object.keys(quotes).length+
      "; verify rights and generated file before any public deployment\n");
  }catch(err){
    // Do not leak URL, token or third-party body through error logs.
    process.stderr.write("MARKETSTACK_EOD_SNAPSHOT=NO_GO "+
      (err?.message?.startsWith("MISSING_") || err?.message?.startsWith("UNVERIFIED_") ||
       err?.message?.startsWith("STALE_") || err?.message?.startsWith("BAD_") ?
       err.message : "REQUEST_OR_LICENSE_FAILED")+"\n");
    process.exitCode=1;
  }
}
function selfTest(){
  const day="2026-11-15";
  const data=Object.values(TICKERS).map(symbol=>({symbol,close:101.23,date:"2026-11-13T00:00:00+0000",exchange:"XNAS",currency:"USD"}));
  const p=validateEodResponse({data},day);
  assert.equal(p.apple.priceCents,10123);
  assert.equal(p.shopify.currency,"USD");
  assert.throws(()=>validateEodResponse({data:data.slice(1)},day),/MISSING_OR_AMBIGUOUS/);
  assert.throws(()=>validateEodResponse({data:[...data,{...data[0]}]},day),/MISSING_OR_AMBIGUOUS/);
  assert.throws(()=>validateEodResponse({data:data.map(x=>x.symbol==="SHOP"?{...x,exchange:"XTSE"}:x)},day),/UNVERIFIED/);
  assert.throws(()=>validateEodResponse({data:data.map(x=>x.symbol==="AAPL"?{...x,date:"2026-11-16"}:x)},day),/STALE/);
  assert.throws(()=>validateEodResponse({data:data.map(x=>x.symbol==="MSFT"?{...x,close:0}:x)},day),/BAD_CLOSE/);
  assert.throws(()=>checkLicense({MARKETSTACK_API_KEY:"dummykey123",CRESCO_EOD_DISPLAY_RIGHTS:"CONFIRMED"}),/RIGHTS/);
  process.stdout.write("MARKETSTACK_EOD_IMPORT_SELF_TEST=PASS; fake fixtures not bundled\n");
}
if(process.argv.includes("--self-test"))selfTest();
else run().catch(()=>{process.stderr.write("MARKETSTACK_EOD_SNAPSHOT=NO_GO\n");process.exitCode=1;});
