/**
 * Pure, offline real-company PAPER portfolio, completely separate from the
 * Cresco Family fictional-credit engine and Parent/My Key authorization.
 *
 * Prices are entered by the visitor after consulting an independent source.
 * They are NOT verified, live, licensed market data or executable quotes.
 * No brokerage, wallet, account, persistence, fetch or network.
 *
 * Money is integer USD cents; positions use hundredths of shares. All
 * transaction values are rounded to cents consistently.
 */
import type { PublicCompanyResearch } from "./family-real-companies";

export type MarketCompanyId = PublicCompanyResearch["id"];
export const MARKET_IDS: readonly MarketCompanyId[] = ["apple", "microsoft", "costco", "shopify"];
export type QuoteReference = "TradingView" | "Exchange website" | "Other public source" | "Marketstack EOD";
export const QUOTE_REFERENCES: readonly QuoteReference[] = ["TradingView", "Exchange website", "Other public source"];

export type ManualQuote = {
  symbol: MarketCompanyId;
  priceCents: number;
  asOf: string;
  reference: QuoteReference;
  provenance: "USER_ENTERED_NOT_VERIFIED" | "LICENSED_EOD_SNAPSHOT";
};
export type MarketPosition = { sharesHundredths: number; costBasisCents: number };
export type MarketReceipt = {
  id: number;
  kind: "BUY" | "SELL";
  symbol: MarketCompanyId;
  sharesHundredths: number;
  priceCents: number;
  totalCents: number;
  asOf: string;
  reference: QuoteReference;
  provenance: "SIMULATION_NO_ORDER";
};
export type RealMarketState = {
  cashCents: number;
  positions: Record<MarketCompanyId, MarketPosition>;
  quotes: Partial<Record<MarketCompanyId, ManualQuote>>;
  receipts: MarketReceipt[];
  realizedCents: number;
  nextId: number;
};
export type RealMarketAction =
  | { type: "quote"; symbol: MarketCompanyId; priceCents: number; asOf: string; reference: QuoteReference; today: string }
  | { type: "licensed-eod"; symbol: MarketCompanyId; priceCents: number; asOf: string; today: string; reference: "Marketstack EOD"; licenseConfirmed: true }
  | { type: "trade"; kind: "BUY" | "SELL"; symbol: MarketCompanyId; sharesHundredths: number }
  | { type: "reset" };

const isKnown = (symbol: string): symbol is MarketCompanyId => MARKET_IDS.includes(symbol as MarketCompanyId);
const goodInt = (n: number) => Number.isSafeInteger(n) && n > 0;
const dateOK = (s: string) => {
  if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const timestamp = Date.parse(s + "T00:00:00.000Z");
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === s;
};
const emptyPositions = (): Record<MarketCompanyId, MarketPosition> => ({
  apple: { sharesHundredths: 0, costBasisCents: 0 },
  microsoft: { sharesHundredths: 0, costBasisCents: 0 },
  costco: { sharesHundredths: 0, costBasisCents: 0 },
  shopify: { sharesHundredths: 0, costBasisCents: 0 },
});
export const INITIAL_PAPER_CASH_CENTS = 100000; // 1,000 entirely imaginary USD
export function initialRealMarketState(): RealMarketState {
  return { cashCents: INITIAL_PAPER_CASH_CENTS, positions: emptyPositions(), quotes: {}, receipts: [], realizedCents: 0, nextId: 1 };
}

export function marketTradePreview(state: RealMarketState, action: Extract<RealMarketAction, {type:"trade"}>): {
  allowed: boolean; reason: string; totalCents: number;
} {
  if (!isKnown(action.symbol) || !["BUY", "SELL"].includes(action.kind) ||
      !goodInt(action.sharesHundredths) || action.sharesHundredths > 1000000) {
    return { allowed: false, reason: "Choose a valid number of shares (minimum 0.01).", totalCents: 0 };
  }
  const quote = state.quotes[action.symbol];
  if (!quote || !goodInt(quote.priceCents) || !dateOK(quote.asOf)) {
    return { allowed: false, reason: "Enter a dated reference price first. No market quote is automatically supplied.", totalCents: 0 };
  }
  const totalCents = Math.round(quote.priceCents * action.sharesHundredths / 100);
  if (!Number.isSafeInteger(totalCents) || totalCents < 1) {
    return { allowed: false, reason: "The order amount must be at least $0.01.", totalCents: 0 };
  }
  if (action.kind === "BUY" && totalCents > state.cashCents) {
    return { allowed: false, reason: "Not enough imaginary USD. Reduce the shares or choose a different company.", totalCents };
  }
  if (action.kind === "SELL" && action.sharesHundredths > state.positions[action.symbol].sharesHundredths) {
    return { allowed: false, reason: "You cannot sell more imaginary shares than you hold.", totalCents };
  }
  return { allowed: true, reason: "Simulation only: no order is submitted and Parent/My Key is unchanged.", totalCents };
}

export function transitionRealMarket(state: RealMarketState, action: RealMarketAction): RealMarketState {
  if (action.type === "reset") return initialRealMarketState();
  if (action.type === "licensed-eod") {
    if (!isKnown(action.symbol) || action.licenseConfirmed !== true ||
        action.reference !== "Marketstack EOD" ||
        !goodInt(action.priceCents) || action.priceCents > 100000000 ||
        !dateOK(action.asOf) || !dateOK(action.today) ||
        action.asOf > action.today ||
        (Date.parse(action.today + "T00:00:00Z") - Date.parse(action.asOf + "T00:00:00Z")) / 86400000 > 7) return state;
    const old=state.quotes[action.symbol];
    if(old && old.asOf >= action.asOf) return state;
    return {
      ...state,
      quotes: {
        ...state.quotes,
        [action.symbol]: {symbol:action.symbol,priceCents:action.priceCents,
          asOf:action.asOf,reference:"Marketstack EOD",provenance:"LICENSED_EOD_SNAPSHOT"}
      }
    };
  }
  if (action.type === "quote") {
    if (!isKnown(action.symbol) || !goodInt(action.priceCents) || action.priceCents > 100000000 ||
        !dateOK(action.asOf) || !dateOK(action.today) || action.asOf > action.today ||
        !QUOTE_REFERENCES.includes(action.reference)) return state;
    const last = state.quotes[action.symbol];
    if (last && action.asOf < last.asOf) return state; // Never silently rewind a valued position.
    const quote: ManualQuote = {
      symbol: action.symbol, priceCents: action.priceCents, asOf: action.asOf,
      reference: action.reference, provenance: "USER_ENTERED_NOT_VERIFIED"
    };
    return { ...state, quotes: { ...state.quotes, [action.symbol]: quote } };
  }
  const preview = marketTradePreview(state, action);
  if (!preview.allowed) return state;
  const quote = state.quotes[action.symbol]!;
  const old = state.positions[action.symbol];
  const isBuy = action.kind === "BUY";
  const sharesHundredths = old.sharesHundredths + (isBuy ? action.sharesHundredths : -action.sharesHundredths);
  const soldBasis = isBuy ? 0 : action.sharesHundredths === old.sharesHundredths
    ? old.costBasisCents : Math.round(old.costBasisCents * action.sharesHundredths / old.sharesHundredths);
  const costBasisCents = isBuy ? old.costBasisCents + preview.totalCents : old.costBasisCents - soldBasis;
  const position: MarketPosition = { sharesHundredths, costBasisCents: sharesHundredths === 0 ? 0 : costBasisCents };
  const receipt: MarketReceipt = {
    id: state.nextId, kind: action.kind, symbol: action.symbol,
    sharesHundredths: action.sharesHundredths, priceCents: quote.priceCents,
    totalCents: preview.totalCents, asOf: quote.asOf, reference: quote.reference,
    provenance: "SIMULATION_NO_ORDER"
  };
  return {
    ...state,
    cashCents: state.cashCents + (isBuy ? -preview.totalCents : preview.totalCents),
    positions: { ...state.positions, [action.symbol]: position },
    realizedCents: state.realizedCents + (isBuy ? 0 : preview.totalCents - soldBasis),
    receipts: [receipt, ...state.receipts].slice(0, 100),
    nextId: state.nextId + 1
  };
}

export function summarizeRealMarket(state: RealMarketState) {
  const holdings = MARKET_IDS.filter(id => state.positions[id].sharesHundredths > 0).map(id => {
    const position = state.positions[id];
    const quote = state.quotes[id] ?? null;
    const valueCents = quote ? Math.round(quote.priceCents * position.sharesHundredths / 100) : null;
    return {
      id, ...position, quote,
      valueCents,
      unrealizedCents: valueCents == null ? null : valueCents - position.costBasisCents
    };
  });
  const allPriced = holdings.every(h => h.valueCents !== null);
  const equityCents = allPriced ? state.cashCents + holdings.reduce((sum, h) => sum + (h.valueCents ?? 0), 0) : null;
  return {
    holdings,
    allPriced,
    equityCents,
    cashCents: state.cashCents,
    unrealizedCents: allPriced ? holdings.reduce((sum, h) => sum + (h.unrealizedCents ?? 0), 0) : null,
    realizedCents: state.realizedCents,
    changeFromStartCents: equityCents === null ? null : equityCents - INITIAL_PAPER_CASH_CENTS,
    isUserEnteredData: true,
  };
}
