"use client";

/**
 * Paper trading of REAL issuer names with manually entered price references.
 * Every dollar and share is imaginary. The quotes are user-entered and never
 * represented as verified market feeds. There is no network or brokerage.
 */
import { useEffect, useState } from "react";
import { TradingViewOnDemand } from "@/components/family-real-world-panel";
import licensedEodJson from "@/lib/family-market-approved-snapshot.json";
import { ArrowDownRight, ArrowUpRight, BookOpen, RotateCcw, ShieldAlert } from "lucide-react";
import { useRealMarketPractice } from "@/components/family-story-provider";
import {
  QUOTE_REFERENCES, marketTradePreview, summarizeRealMarket,
  type QuoteReference
} from "@/lib/family-real-market-sandbox";
import { REAL_COMPANY_RESEARCH, type PublicCompanyResearch } from "@/lib/family-real-companies";

type ApprovedEodQuote = {
  symbol: string; exchange: "XNAS"; currency: "USD"; priceCents: number;
  asOf: string; priceType: "END_OF_DAY_CLOSE"; source: "Marketstack EOD"
};
type ApprovedEodSnapshot = {
  status: "DISABLED" | "APPROVED_SNAPSHOT"; generatedAt: string | null;
  quotes: Partial<Record<PublicCompanyResearch["id"], ApprovedEodQuote>>;
};
const APPROVED_EOD = licensedEodJson as unknown as ApprovedEodSnapshot;
const fmt = (cents: number) => new Intl.NumberFormat("en-US", {
  style: "currency", currency: "USD", maximumFractionDigits: 2, minimumFractionDigits: 2
}).format(cents / 100);
const quantityHundredths = (value: string) => {
  if (!/^\d+(?:\.\d{1,2})?$/.test(value.trim())) return 0;
  const hundredths = Math.round(Number(value) * 100);
  return Number.isSafeInteger(hundredths) ? hundredths : 0;
};
const priceCentsFromInput = (value: string) => {
  if (!/^\d+(?:\.\d{1,2})?$/.test(value.trim())) return 0;
  const cents = Math.round(Number(value) * 100);
  return Number.isSafeInteger(cents) ? cents : 0;
};

export function FamilyRealMarketPractice({ company }: { company: PublicCompanyResearch }) {
  const { market, marketDispatch } = useRealMarketPractice();
  const [inputPrice, setInputPrice] = useState("");
  const [inputDate, setInputDate] = useState(() => new Date().toISOString().slice(0,10));
  const [reference, setReference] = useState<QuoteReference>("TradingView");
  const [quantity, setQuantity] = useState("0.25");
  const [message, setMessage] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const approvedQuote = APPROVED_EOD.status === "APPROVED_SNAPSHOT" ? APPROVED_EOD.quotes[company.id] : undefined;
  const quote = market.quotes[company.id];
  const metrics = summarizeRealMarket(market);
  const qty = quantityHundredths(quantity);
  const buy = marketTradePreview(market,{type:"trade",kind:"BUY",symbol:company.id,sharesHundredths:qty});
  const sell = marketTradePreview(market,{type:"trade",kind:"SELL",symbol:company.id,sharesHundredths:qty});
  const localPosition = market.positions[company.id];
  const dateParsed = Date.parse(inputDate + "T00:00:00.000Z");
  const validCalendarDate = /^\d{4}-\d{2}-\d{2}$/.test(inputDate) && Number.isFinite(dateParsed) &&
    new Date(dateParsed).toISOString().slice(0,10) === inputDate;
  const canSavePrice = priceCentsFromInput(inputPrice) > 0 && priceCentsFromInput(inputPrice) <= 100000000 &&
    validCalendarDate && inputDate <= today && (!quote || inputDate >= quote.asOf);
  const isDateTooEarly = Boolean(quote && inputDate < quote.asOf);
  // Auto-use an approved, bundled, dated EOD close when licensed rights exist.
  // Never fetch a provider from a child's browser or overwrite a same-day
  // manually entered price. This is inactive in the initial empty build.
  useEffect(() => {
    if (APPROVED_EOD.status !== "APPROVED_SNAPSHOT" || !approvedQuote ||
        approvedQuote.currency !== "USD" || approvedQuote.exchange !== "XNAS" ||
        approvedQuote.source !== "Marketstack EOD" || approvedQuote.priceType !== "END_OF_DAY_CLOSE" ||
        (quote && quote.asOf >= approvedQuote.asOf)) return;
    marketDispatch({
      type:"licensed-eod",symbol:company.id,priceCents:approvedQuote.priceCents,
      asOf:approvedQuote.asOf,reference:"Marketstack EOD",licenseConfirmed:true,today
    });
  }, [approvedQuote, company.id, marketDispatch, quote, today]);

  function saveQuote() {
    if (!canSavePrice) {
      setMessage("Enter a positive price (maximum 2 decimals) and a valid date no earlier than your last entry or later than today.");
      return;
    }
    marketDispatch({
      type:"quote",symbol:company.id,priceCents:priceCentsFromInput(inputPrice),
      asOf:inputDate,today,reference
    });
    setMessage("Price reference saved as USER-ENTERED, not verified. No shares were purchased.");
  }

  function simulate(kind:"BUY"|"SELL") {
    const preview = kind === "BUY" ? buy : sell;
    if (!preview.allowed) {
      setMessage(preview.reason);
      return;
    }
    marketDispatch({type:"trade",kind,symbol:company.id,sharesHundredths:qty});
    setMessage(kind + " simulated for " + fmt(preview.totalCents) + " - no real order, no Parent approval, no payment.");
  }

  return (
    <section className="mt-4 space-y-4 rounded-[20px] border-2 border-family-action/30 bg-family-action-soft/40 p-4 md:p-5"
      data-testid="real-market-sandbox" aria-label="Real company paper portfolio">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-family-action">Paper portfolio · USD</p>
          <h3 className="mt-1 text-[21px] font-extrabold text-navy-strong">Practice with real company names</h3>
          <p className="mt-1 max-w-[65ch] text-[13px] leading-5 text-navy">
            Start with $1,000 pretend USD. Use a licensed end-of-day snapshot if one is available, or record your own dated price. Paper trades never use real money.
          </p>
        </div>
        <span className="rounded-full bg-surface px-3 py-1 text-[11px] font-bold text-navy-strong">Not real investments</span>
      </div>

      <dl className="grid grid-cols-2 gap-2 md:grid-cols-4" data-testid="market-summary">
        <div className="rounded-[14px] bg-surface p-3">
          <dt className="text-[11px] font-semibold text-ink-2">Portfolio value</dt>
          <dd className="mt-1 text-[18px] font-extrabold text-navy-strong" data-testid="market-equity">
            {metrics.equityCents === null ? "Unavailable" : fmt(metrics.equityCents)}
          </dd>
        </div>
        <div className="rounded-[14px] bg-surface p-3">
          <dt className="text-[11px] font-semibold text-ink-2">Imaginary cash</dt>
          <dd className="mt-1 text-[18px] font-extrabold text-navy-strong" data-testid="market-cash">{fmt(metrics.cashCents)}</dd>
        </div>
        <div className="rounded-[14px] bg-surface p-3">
          <dt className="text-[11px] font-semibold text-ink-2">Unrealized change</dt>
          <dd className="mt-1 text-[18px] font-extrabold text-navy-strong" data-testid="market-unrealized">
            {metrics.unrealizedCents === null ? "Unavailable" : fmt(metrics.unrealizedCents)}
          </dd>
        </div>
        <div className="rounded-[14px] bg-surface p-3">
          <dt className="text-[11px] font-semibold text-ink-2">Total return</dt>
          <dd className="mt-1 text-[18px] font-extrabold text-navy-strong" data-testid="market-return">
            {metrics.changeFromStartCents === null ? "Unavailable" : fmt(metrics.changeFromStartCents)}
          </dd>
        </div>
      </dl>

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,.85fr)]" data-testid="market-workspace">
        <div className="min-w-0" data-testid="market-chart-column">
          <TradingViewOnDemand company={company} />
          <p className="mt-2 text-[11px] text-ink-2">The chart is display-only. TradingView prices are never copied into the simulation automatically.</p>
        </div>
        <div className="min-w-0 space-y-3" data-testid="market-order-column">
        <section className="rounded-[16px] border border-line-soft bg-surface p-4" aria-label="Enter your quote">
          <h4 className="text-[15px] font-extrabold text-navy-strong">1. Record a reference price for {company.ticker}</h4>
          <p className="mt-1 text-[12px] leading-5 text-ink-2">
            Check the chart to the left (below on mobile). When no licensed snapshot is available, enter a dated USD price yourself. Shopify uses NASDAQ:SHOP in USD, not TSX:SHOP in CAD.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <label className="text-[12px] font-bold text-navy-strong">
              Price in USD
              <input type="text" inputMode="decimal" placeholder="e.g. 200.00" value={inputPrice}
                onChange={event => setInputPrice(event.target.value)} data-testid="market-price-input"
                className="mt-1 block min-h-11 w-full rounded-[12px] border border-line bg-surface px-3 text-[14px]"/>
            </label>
            <label className="text-[12px] font-bold text-navy-strong">
              Date of this price
              <input type="date" value={inputDate} max={today}
                min={quote?.asOf} onChange={event => setInputDate(event.target.value)}
                data-testid="market-quote-date"
                className="mt-1 block min-h-11 w-full rounded-[12px] border border-line bg-surface px-3 text-[13px]"/>
            </label>
          </div>
          <label className="mt-3 block text-[12px] font-bold text-navy-strong">
            Where did you check?
            <select value={reference} onChange={event => setReference(event.target.value as QuoteReference)}
              className="mt-1 block min-h-11 w-full rounded-[12px] border border-line bg-surface px-3 text-[13px]"
              data-testid="market-quote-source">
              {QUOTE_REFERENCES.map(name => <option key={name} value={name}>{name}</option>)}
            </select>
          </label>
          {isDateTooEarly ? <p className="mt-2 text-[12px] text-loss-text">Choose the same or a later date than the last saved reference.</p> : null}
          <button type="button" onClick={saveQuote} disabled={!canSavePrice}
            className="mt-3 min-h-11 w-full rounded-full bg-family-action px-4 text-[13px] font-bold text-white disabled:opacity-50"
            data-testid="market-quote-submit">Save manual reference</button>
          {approvedQuote ? <p className="mt-2 text-[11px] font-semibold text-green-strong" data-testid="market-approved-quote">
            Approved Marketstack EOD close (not live): {fmt(approvedQuote.priceCents)} dated {approvedQuote.asOf}.
            {APPROVED_EOD.status === "APPROVED_SNAPSHOT" ? " Applied when not superseded by a newer quote." : " Disabled."}
          </p> : null}
          <p className="mt-2 text-[12px] leading-5 text-ink-2" data-testid="market-current-quote">
            {quote
              ? (quote.provenance === "LICENSED_EOD_SNAPSHOT" ? "Licensed EOD close " : "User-entered ") + company.ticker + ": " + fmt(quote.priceCents) + " · " + quote.asOf + " · " + quote.reference + (quote.provenance === "LICENSED_EOD_SNAPSHOT" ? " (DATED CLOSE, NOT LIVE)" : " (NOT VERIFIED)")
              : "No price recorded. Practice actions are blocked until you provide one."}
          </p>
        </section>

        <section className="rounded-[16px] border border-line-soft bg-surface p-4" aria-label="Paper trade">
          <h4 className="text-[15px] font-extrabold text-navy-strong">2. Try an imaginary trade</h4>
          <p className="mt-1 text-[12px] text-ink-2">Use the saved reference price. Fractions of 0.01 shares are allowed.</p>
          <label className="mt-3 block text-[12px] font-bold text-navy-strong">
            Shares to simulate
            <input type="text" inputMode="decimal" value={quantity} onChange={event => setQuantity(event.target.value)}
              data-testid="market-quantity-input"
              className="mt-1 block min-h-11 w-full rounded-[12px] border border-line bg-surface px-3 text-[14px]"/>
          </label>
          <p className="mt-3 text-[12px] text-ink-2" data-testid="market-trade-preview">
            {buy.allowed ? "Estimated imaginary cost: " + fmt(buy.totalCents)
              : buy.reason}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button type="button" onClick={() => simulate("BUY")} disabled={!buy.allowed}
              data-testid="market-buy"
              className="inline-flex min-h-11 items-center justify-center gap-1 rounded-full bg-green-strong px-3 text-[13px] font-bold text-white disabled:opacity-40">
              <ArrowUpRight aria-hidden className="size-4"/>Paper buy
            </button>
            <button type="button" onClick={() => simulate("SELL")} disabled={!sell.allowed}
              data-testid="market-sell"
              className="inline-flex min-h-11 items-center justify-center gap-1 rounded-full border border-line bg-surface px-3 text-[13px] font-bold text-navy-strong disabled:opacity-40">
              <ArrowDownRight aria-hidden className="size-4"/>Paper sell
            </button>
          </div>
          <p className="mt-3 text-[12px] leading-5 text-ink-2" data-testid="market-selected-holding">
            Your {company.ticker} position: {(localPosition.sharesHundredths / 100).toFixed(2)} imaginary shares.
          </p>
        </section>
        </div>
      </div>

      {message ? <p role="status" data-testid="market-action-feedback"
        className="rounded-[12px] border border-line-soft bg-surface p-3 text-[12px] font-semibold text-navy-strong">{message}</p> : null}

      <section className="rounded-[16px] border border-line-soft bg-surface p-4" data-testid="market-holdings">
        <h4 className="text-[16px] font-extrabold text-navy-strong">3. Review your paper holdings</h4>
        {metrics.holdings.length ? (
          <ul className="mt-2 space-y-2">
            {metrics.holdings.map(h => {
              const name = REAL_COMPANY_RESEARCH.find(c => c.id === h.id)?.name ?? h.id;
              return (
                <li key={h.id} className="grid gap-2 rounded-[12px] bg-surface-soft p-3 text-[12px] sm:grid-cols-[1fr_auto]">
                  <span><strong className="block text-[14px] text-navy-strong">{name}</strong>
                    {(h.sharesHundredths / 100).toFixed(2)} pretend shares · recorded cost {fmt(h.costBasisCents)}
                  </span>
                  <span className="sm:text-right">
                    <strong className="block text-[14px] text-navy-strong">{h.valueCents === null ? "No valuation" : fmt(h.valueCents)}</strong>
                    {h.unrealizedCents === null ? "No reference" : fmt(h.unrealizedCents) + " unrealized"}
                    <span className="block text-[11px] text-ink-3">
                      {h.quote ? "Manual price dated " + h.quote.asOf : "No price"}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        ) : <p className="mt-2 text-[13px] leading-5 text-ink-2">No pretend holdings yet. Record a price and make a paper buy to see this portfolio change.</p>}
        <button type="button" onClick={() => setShowHistory(v => !v)} aria-expanded={showHistory}
          className="mt-3 min-h-10 text-[12px] font-bold text-family-action underline underline-offset-4">
          {showHistory ? "Hide paper activity" : "View paper activity (" + market.receipts.length + ")"}
        </button>
        {showHistory ? (
          <ul className="mt-2 space-y-2" data-testid="market-history">
            {market.receipts.length ? market.receipts.map(receipt => (
              <li key={receipt.id} className="text-[12px] leading-5 text-navy">
                {receipt.kind} · {REAL_COMPANY_RESEARCH.find(c => c.id === receipt.symbol)?.ticker} ·
                {" "}{(receipt.sharesHundredths / 100).toFixed(2)} imaginary shares at {fmt(receipt.priceCents)}
                {" "}({receipt.asOf}, entered reference) · {fmt(receipt.totalCents)} · NO ORDER
              </li>
            )) : <li className="text-[12px] text-ink-2">No activity yet.</li>}
          </ul>
        ) : null}
        <button type="button" onClick={() => {marketDispatch({type:"reset"});setMessage("Paper portfolio restarted; your original fictional credits and Parent/My Key were not changed.");}}
          className="mt-3 flex min-h-10 items-center gap-1 text-[12px] font-semibold text-loss-text underline underline-offset-4"
          data-testid="market-reset"><RotateCcw aria-hidden className="size-3"/>Restart paper portfolio</button>
      </section>

      <p className="flex items-start gap-2 rounded-[14px] bg-yellow-soft p-3 text-[12px] leading-5 text-navy-strong">
        <ShieldAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-orange-text"/>
        No brokerage or real money. USD, trades, gains and losses are imaginary. Quote source and date are always shown; manual references are unverified. No personal account or saved data.
        No trades are sent, and this does not change your other fictional credits or Parent/My Key. Refresh resets the demo.
      </p>
      <p className="flex items-center gap-2 text-[11px] leading-5 text-ink-3">
        <BookOpen aria-hidden className="size-3"/> Market-price redistribution rights are not included with a free TradingView widget.
        A dated EOD reference is not a live price; historical returns exclude dividends, splits, fees and FX.
      </p>
    </section>
  );
}
