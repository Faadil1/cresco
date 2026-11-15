import { describe, expect, it } from "vitest";
import {
  initialRealMarketState, marketTradePreview, summarizeRealMarket, transitionRealMarket as next,
  INITIAL_PAPER_CASH_CENTS
} from "./family-real-market-sandbox";

const today = "2026-11-15";
const setPrice = (state: ReturnType<typeof initialRealMarketState>, symbol: "apple" | "microsoft" | "costco" | "shopify", dollars: number, asOf = "2026-11-13") =>
  next(state, { type: "quote", symbol, priceCents: Math.round(dollars * 100), asOf, today, reference: "TradingView" });

describe("Real market sandbox is not a financial account", () => {
  it("starts empty and has no hard-coded share price", () => {
    const s = initialRealMarketState();
    expect(s.cashCents).toBe(100000);
    expect(s.quotes).toEqual({});
    expect(s.receipts).toEqual([]);
    expect(s.positions.apple.sharesHundredths).toBe(0);
    expect(summarizeRealMarket(s).equityCents).toBe(INITIAL_PAPER_CASH_CENTS);
  });

  it("rejects bogus, future, rewound, zero and non-date quotes", () => {
    const s = initialRealMarketState();
    const action = { type: "quote" as const, symbol: "apple" as const, priceCents: 20000, asOf: today, today, reference: "TradingView" as const };
    expect(next(s, { ...action, priceCents: 0 })).toBe(s);
    expect(next(s, { ...action, priceCents: Number.NaN })).toBe(s);
    expect(next(s, { ...action, priceCents: Infinity })).toBe(s);
    expect(next(s, { ...action, asOf: "2026-02-30" })).toBe(s);
    expect(next(s, { ...action, asOf: "2026-11-16" })).toBe(s);
    expect(next(s, { ...action, today: "not-a-date" })).toBe(s);
    expect(next(s, { ...action, reference: "unknown" as unknown as "TradingView" })).toBe(s);
    const updated = next(s, action);
    expect(next(updated, { ...action, asOf: "2026-11-14" })).toBe(updated);
  });

  it("requires a manual quote and rejects overspending or selling absent holdings", () => {
    const s = initialRealMarketState();
    const buy = { type: "trade" as const, kind: "BUY" as const, symbol: "costco" as const, sharesHundredths: 100 };
    expect(marketTradePreview(s, buy).allowed).toBe(false);
    expect(next(s, buy)).toBe(s);
    const priced = setPrice(s, "costco", 1500);
    expect(next(priced, buy)).toBe(priced); // $1500 > $1000 budget
    expect(next(priced, {...buy, sharesHundredths: 0})).toBe(priced);
    expect(next(priced, {...buy, sharesHundredths: 0.1})).toBe(priced);
    expect(next(priced, {type:"trade",kind:"SELL",symbol:"costco",sharesHundredths:1})).toBe(priced);
  });

  it("supports 0.01-share fractions and records a transparent no-order receipt", () => {
    const s = setPrice(initialRealMarketState(), "apple", 200);
    const bought = next(s, {type:"trade",kind:"BUY",symbol:"apple",sharesHundredths:50});
    expect(bought.cashCents).toBe(90000);
    expect(bought.positions.apple).toEqual({ sharesHundredths:50,costBasisCents:10000 });
    expect(bought.receipts[0]).toMatchObject({
      symbol:"apple",kind:"BUY",sharesHundredths:50,priceCents:20000,totalCents:10000,
      provenance:"SIMULATION_NO_ORDER",reference:"TradingView"
    });
    const down = setPrice(bought, "apple", 180, "2026-11-14");
    const summary = summarizeRealMarket(down);
    expect(summary.unrealizedCents).toBe(-1000);
    expect(summary.equityCents).toBe(99000);
    expect(summary.changeFromStartCents).toBe(-1000);
    const sold = next(down, {type:"trade",kind:"SELL",symbol:"apple",sharesHundredths:25});
    expect(sold.cashCents).toBe(94500);
    expect(sold.realizedCents).toBe(-500);
    expect(sold.positions.apple).toEqual({sharesHundredths:25,costBasisCents:5000});
    expect(summarizeRealMarket(sold).unrealizedCents).toBe(-500);
    expect(summarizeRealMarket(sold).equityCents).toBe(99000);
    const empty = next(sold, {type:"trade",kind:"SELL",symbol:"apple",sharesHundredths:25});
    expect(empty.positions.apple).toEqual({sharesHundredths:0,costBasisCents:0});
    expect(empty.realizedCents).toBe(-1000);
    expect(summarizeRealMarket(empty).equityCents).toBe(99000);
  });

  it("marks updates rather than automatically changing cash or buying shares", () => {
    const state = setPrice(initialRealMarketState(), "microsoft", 300);
    expect(state.cashCents).toBe(100000);
    expect(state.receipts).toHaveLength(0);
    const updated = setPrice(state,"microsoft",350,"2026-11-14");
    expect(updated.cashCents).toBe(100000);
    expect(updated.receipts).toEqual([]);
    expect(updated.positions.microsoft.sharesHundredths).toBe(0);
  });

  it("handles multi-company portfolio and reset without inventing permission events", () => {
    let s = setPrice(initialRealMarketState(),"apple",100);
    s = setPrice(s,"shopify",50);
    s = next(s,{type:"trade",kind:"BUY",symbol:"apple",sharesHundredths:100});
    s = next(s,{type:"trade",kind:"BUY",symbol:"shopify",sharesHundredths:200});
    expect(s.cashCents).toBe(80000);
    expect(summarizeRealMarket(s).holdings).toHaveLength(2);
    const reset = next(s,{type:"reset"});
    expect(reset).toEqual(initialRealMarketState());
  });
});
