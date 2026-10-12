/**
 * Public Pyth price service (Hermes) for the Family learning lane.
 *
 * Hermes needs no API key. It is used for learning and Practice prices when
 * the entitled Pyth Pro feed is not configured or not reachable. Feed ids are
 * resolved at runtime from the Hermes catalog by exact symbol
 * ("Equity.US.<TICKER>/USD"), never guessed. Anything missing, malformed or
 * too wide stays UNAVAILABLE; a price is never invented.
 *
 * Status:
 * - FRESH: published within maxAgeSeconds and confidence within maxConfidenceBps
 * - STALE: a real published price that is older (for example after market close)
 * - UNAVAILABLE: no feed, no price, bad confidence, timeout or error
 */

export const HERMES_BASE_URL = "https://hermes.pyth.network";
const FEED_ID_TTL_MS = 6 * 60 * 60 * 1000;

const feedIdCache = new Map(); // ticker -> { id, expiresAt }

export function _resetHermesCache() {
  feedIdCache.clear();
}

function hermesSymbol(ticker) {
  return `Equity.US.${ticker}/USD`;
}

async function getJson(fetchImpl, url, timeoutMs) {
  const response = await fetchImpl(url, {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok) {
    const error = new Error(`HERMES_HTTP_${response.status}`);
    error.code = `HERMES_HTTP_${response.status}`;
    throw error;
  }
  return response.json();
}

export async function resolveHermesFeedId(ticker, { fetchImpl = fetch, baseUrl = HERMES_BASE_URL, timeoutMs = 1200, now = Date.now() } = {}) {
  const normalized = String(ticker || "").toUpperCase();
  const cached = feedIdCache.get(normalized);
  if (cached && cached.expiresAt > now) return cached.id;

  const url = `${baseUrl}/v2/price_feeds?asset_type=equity&query=${encodeURIComponent(normalized)}`;
  const rows = await getJson(fetchImpl, url, timeoutMs);
  const wanted = hermesSymbol(normalized);
  const match = Array.isArray(rows) ? rows.find((row) => row?.attributes?.symbol === wanted) : null;
  const id = typeof match?.id === "string" && /^(0x)?[0-9a-f]{64}$/i.test(match.id) ? match.id.replace(/^0x/i, "").toLowerCase() : null;
  if (id) feedIdCache.set(normalized, { id, expiresAt: now + FEED_ID_TTL_MS });
  return id;
}

export function normalizeHermesPrice(entry, { receivedAt = Date.now(), maxAgeSeconds = 60, maxConfidenceBps = 100 } = {}) {
  const p = entry?.price;
  const raw = Number(p?.price);
  const conf = Number(p?.conf);
  const expo = Number(p?.expo);
  const publishTime = Number(p?.publish_time);
  if (![raw, conf, expo, publishTime].every(Number.isFinite) || raw <= 0 || publishTime <= 0) {
    return { status: "UNAVAILABLE", reasonCode: "HERMES_PRICE_MALFORMED" };
  }
  const price = raw * Math.pow(10, expo);
  const confidence = conf * Math.pow(10, expo);
  const confidenceBps = Math.round((confidence / price) * 10_000);
  const ageSeconds = Math.max(0, Math.floor(receivedAt / 1000 - publishTime));
  const base = {
    price: Number(price.toFixed(6)),
    confidenceBps,
    ageSeconds,
    publishTime: new Date(publishTime * 1000).toISOString(),
  };
  if (confidenceBps > maxConfidenceBps * 5) {
    return { status: "UNAVAILABLE", reasonCode: "HERMES_CONFIDENCE_TOO_WIDE", confidenceBps, ageSeconds };
  }
  if (ageSeconds <= maxAgeSeconds && confidenceBps <= maxConfidenceBps) {
    return { status: "FRESH", reasonCode: null, ...base };
  }
  return { status: "STALE", reasonCode: ageSeconds > maxAgeSeconds ? "HERMES_PRICE_DELAYED" : "HERMES_CONFIDENCE_WIDE", ...base };
}

/**
 * Latest Hermes quotes for tickers. Always resolves; per-ticker failures are
 * reported as UNAVAILABLE with a reason code.
 */
export async function fetchHermesQuotes(tickers, { fetchImpl = fetch, baseUrl = HERMES_BASE_URL, timeoutMs = 1200, now = () => Date.now() } = {}) {
  const symbols = [...new Set(tickers.map((t) => String(t || "").toUpperCase()).filter(Boolean))];
  const unavailable = (symbol, reasonCode) => ({ symbol, source: "PYTH_HERMES", status: "UNAVAILABLE", price: null, publishTime: null, confidenceBps: null, reasonCode });

  const ids = await Promise.all(
    symbols.map((symbol) =>
      resolveHermesFeedId(symbol, { fetchImpl, baseUrl, timeoutMs, now: now() }).catch(() => null),
    ),
  );
  const byId = new Map();
  symbols.forEach((symbol, i) => {
    if (ids[i]) byId.set(ids[i], symbol);
  });
  if (byId.size === 0) return symbols.map((s) => unavailable(s, "HERMES_FEED_NOT_FOUND"));

  const params = new URLSearchParams({ parsed: "true", encoding: "hex" });
  for (const id of byId.keys()) params.append("ids[]", id);

  let parsed;
  try {
    const body = await getJson(fetchImpl, `${baseUrl}/v2/updates/price/latest?${params}`, timeoutMs);
    parsed = Array.isArray(body?.parsed) ? body.parsed : [];
  } catch (error) {
    const reason = error?.name === "TimeoutError" ? "HERMES_TIMEOUT" : error?.code || "HERMES_UNREACHABLE";
    return symbols.map((s) => unavailable(s, ids[symbols.indexOf(s)] ? reason : "HERMES_FEED_NOT_FOUND"));
  }

  const receivedAt = now();
  const results = new Map();
  for (const entry of parsed) {
    const id = String(entry?.id || "").replace(/^0x/i, "").toLowerCase();
    const symbol = byId.get(id);
    if (!symbol) continue;
    const snap = normalizeHermesPrice(entry, { receivedAt });
    results.set(symbol, {
      symbol,
      source: "PYTH_HERMES",
      feedId: id,
      status: snap.status,
      price: snap.price ?? null,
      publishTime: snap.publishTime ?? null,
      confidenceBps: snap.confidenceBps ?? null,
      reasonCode: snap.reasonCode ?? null,
    });
  }
  return symbols.map((symbol, i) =>
    results.get(symbol) ?? unavailable(symbol, ids[i] ? "HERMES_PRICE_MISSING" : "HERMES_FEED_NOT_FOUND"),
  );
}
