import test from "node:test";
import assert from "node:assert/strict";

import { fetchHermesQuotes, normalizeHermesPrice, _resetHermesCache } from "../src/pyth-hermes.mjs";
import { handleFamilyApi } from "../src/cloudflare-family-api.mjs";

const AAPL_ID = "a".repeat(64);
const NVDA_ID = "b".repeat(64);
const NOW = Date.UTC(2026, 9, 12, 18, 0, 0);

function hermesMock({ prices, catalog = { AAPL: AAPL_ID, NVDA: NVDA_ID }, failLatest = false }) {
  const calls = [];
  const impl = async (url) => {
    calls.push(String(url));
    const u = new URL(url);
    if (u.pathname === "/v2/price_feeds") {
      const q = u.searchParams.get("query");
      const rows = catalog[q]
        ? [
            { id: catalog[q], attributes: { symbol: `Equity.US.${q}/USD` } },
            { id: "c".repeat(64), attributes: { symbol: `Equity.Index.${q}/USD` } },
          ]
        : [];
      return new Response(JSON.stringify(rows), { status: 200 });
    }
    if (u.pathname === "/v2/updates/price/latest") {
      if (failLatest) return new Response("nope", { status: 503 });
      const ids = u.searchParams.getAll("ids[]");
      const parsed = ids.filter((id) => prices[id]).map((id) => ({ id, price: prices[id] }));
      return new Response(JSON.stringify({ parsed }), { status: 200 });
    }
    return new Response("not found", { status: 404 });
  };
  return { impl, calls };
}

test("normalizes a fresh Hermes equity price", () => {
  const snap = normalizeHermesPrice(
    { price: { price: "24512345", conf: "12000", expo: -5, publish_time: NOW / 1000 - 5 } },
    { receivedAt: NOW },
  );
  assert.equal(snap.status, "FRESH");
  assert.equal(snap.price, 245.12345);
  assert.equal(snap.confidenceBps, 5);
});

test("an old published price is STALE (delayed), never FRESH", () => {
  const snap = normalizeHermesPrice(
    { price: { price: "24512345", conf: "12000", expo: -5, publish_time: NOW / 1000 - 3 * 3600 } },
    { receivedAt: NOW },
  );
  assert.equal(snap.status, "STALE");
  assert.equal(snap.reasonCode, "HERMES_PRICE_DELAYED");
});

test("malformed or zero prices are UNAVAILABLE", () => {
  assert.equal(normalizeHermesPrice({ price: { price: "0", conf: "1", expo: -5, publish_time: 1 } }).status, "UNAVAILABLE");
  assert.equal(normalizeHermesPrice({}).status, "UNAVAILABLE");
});

test("feed ids come from the catalog by exact symbol; unknown tickers stay UNAVAILABLE", async () => {
  _resetHermesCache();
  const { impl, calls } = hermesMock({
    prices: { [AAPL_ID]: { price: "24500000", conf: "10000", expo: -5, publish_time: NOW / 1000 - 2 } },
  });
  const quotes = await fetchHermesQuotes(["AAPL", "ZZZZ"], { fetchImpl: impl, now: () => NOW });
  assert.equal(quotes[0].symbol, "AAPL");
  assert.equal(quotes[0].status, "FRESH");
  assert.equal(quotes[0].source, "PYTH_HERMES");
  assert.equal(quotes[0].feedId, AAPL_ID);
  assert.equal(quotes[1].status, "UNAVAILABLE");
  assert.equal(quotes[1].reasonCode, "HERMES_FEED_NOT_FOUND");
  assert.equal(quotes[1].price, null);
  const latest = calls.find((c) => c.includes("/v2/updates/price/latest"));
  assert.ok(latest.includes(AAPL_ID));
  assert.ok(!latest.includes("c".repeat(64)), "index feed must not be used");
});

test("Hermes outage reports UNAVAILABLE with a reason, never a price", async () => {
  _resetHermesCache();
  const { impl } = hermesMock({ prices: {}, failLatest: true });
  const quotes = await fetchHermesQuotes(["AAPL"], { fetchImpl: impl, now: () => NOW });
  assert.equal(quotes[0].status, "UNAVAILABLE");
  assert.equal(quotes[0].reasonCode, "HERMES_HTTP_503");
  assert.equal(quotes[0].price, null);
});

test("quotes endpoint uses Hermes when Pyth Pro has no key", async () => {
  _resetHermesCache();
  const previous = process.env.PYTH_PRO_API_KEY;
  delete process.env.PYTH_PRO_API_KEY;
  const nowSec = Math.floor(Date.now() / 1000);
  const { impl } = hermesMock({
    prices: {
      [AAPL_ID]: { price: "24500000", conf: "10000", expo: -5, publish_time: nowSec - 2 },
      [NVDA_ID]: { price: "18000000", conf: "10000", expo: -5, publish_time: nowSec - 4 * 3600 },
    },
  });
  try {
    const response = await handleFamilyApi(
      new Request("https://keys.example/api/v0.2/market/quotes?symbols=AAPL,NVDA"),
      { HERMES_FETCH: impl },
    );
    const result = await response.json();
    const [aapl, nvda] = result.quotes;
    assert.equal(aapl.source, "PYTH_HERMES");
    assert.equal(aapl.status, "FRESH");
    assert.equal(aapl.price, 245);
    assert.equal(aapl.tokenizedSymbol, "AAPLx");
    assert.equal(nvda.status, "STALE");
    assert.equal(nvda.price, 180);
    assert.equal(result.truthBoundary.onlyFreshPythIsLive, true);
  } finally {
    if (previous == null) delete process.env.PYTH_PRO_API_KEY;
    else process.env.PYTH_PRO_API_KEY = previous;
  }
});
