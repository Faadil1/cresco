"use client";

/**
 * Paper trading of REAL issuer names with manually entered price references.
 * Every dollar and share is imaginary. The quotes are user-entered and never
 * represented as verified market feeds. There is no network or brokerage.
 */
import { useEffect, useState } from "react";
import { TradingViewOnDemand } from "@/components/family-real-world-panel";
import licensedEodJson from "@/lib/family-market-approved-snapshot.json";
import { ArrowDownRight, ArrowUpRight, RotateCcw } from "lucide-react";
import { StepPanel } from "@/components/family-story-ui";
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

/**
 * Step 4 of the lab: the child explains a paper gain or loss. Uses only the
 * child's own entered prices; it invents no number and changes no state.
 */
function explainOptions(company: PublicCompanyResearch, direction: "up" | "down") {
  return direction === "down" ? [
    { text: `${company.name} must have lost money as a business.`, right: false,
      why: "Not necessarily. A share price can fall while a company still earns a profit. Check the SEC results in step 1: they did not change." },
    { text: "The price you entered is lower than the price you paid, so your paper shares are worth less.", right: true,
      why: "Yes. A paper loss only means today's price is below your buying price. It becomes a real loss only if you sell at that price." },
    { text: "Cresco took a fee from your paper dollars.", right: false,
      why: "No. There are no fees here. The difference comes only from the two prices you entered." },
  ] : [
    { text: `${company.name}'s sales must have grown since you bought.`, right: false,
      why: "Not necessarily. Prices move for many reasons, like news and expectations. Sales are only reported in filings, like the SEC results in step 1." },
    { text: "The price you entered is higher than the price you paid, so your paper shares are worth more.", right: true,
      why: "Yes. A paper gain only means today's price is above your buying price. Prices can fall again before you sell." },
    { text: "The gain is guaranteed now.", right: false,
      why: "No. Until you sell, the gain can grow, shrink or turn into a loss." },
  ];
}

export function FamilyRealMarketPractice({ company, openStep, setOpenStep, toggle }: {
  company: PublicCompanyResearch;
  /** Which step is open on phones (lg+ shows all). Owned by the page so step 1 can hand over. */
  openStep: number; setOpenStep: (n: number) => void; toggle: (n: number) => void;
}) {
  const { market, marketDispatch } = useRealMarketPractice();
  const [inputPrice, setInputPrice] = useState("");
  const [inputDate, setInputDate] = useState(() => new Date().toISOString().slice(0,10));
  const [reference, setReference] = useState<QuoteReference>("TradingView");
  const [quantity, setQuantity] = useState("0.25");
  const [message, setMessage] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [explained, setExplained] = useState<number | null>(null);
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
    // Guide phones forward: trade next, or straight to explaining if shares are already held.
    setOpenStep(localPosition.sharesHundredths > 0 ? 4 : 3);
  }

  function simulate(kind:"BUY"|"SELL") {
    const preview = kind === "BUY" ? buy : sell;
    if (!preview.allowed) {
      setMessage(preview.reason);
      return;
    }
    marketDispatch({type:"trade",kind,symbol:company.id,sharesHundredths:qty});
    setMessage(kind + " simulated for " + fmt(preview.totalCents) + " - no real order, no Parent approval, no payment.");
    setOpenStep(4);
  }

  const position = metrics.holdings.find(h => h.id === company.id);
  const change = position?.unrealizedCents ?? null;
  const direction = change === null || change === 0 ? null : change < 0 ? "down" : "up";
  const options = direction ? explainOptions(company, direction) : [];
  const inputCls = "mt-1 block min-h-12 w-full rounded-[12px] border border-line bg-surface px-3 text-[15px] text-navy-strong";

  return (
    <div className="space-y-4" data-testid="real-market-sandbox" aria-label="Real company paper portfolio">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)]" data-testid="market-workspace">
        <StepPanel n={2} title="Read the price" done={Boolean(quote)} open={openStep === 2} onToggle={() => toggle(2)}
          testId="market-chart-column" ariaLabel={"Step 2: read the price of " + company.ticker}
          summary={quote ? `Your price: ${fmt(quote.priceCents)} · ${quote.asOf}` : "Type the latest price and its date"}
          hint={<>Open the chart if you like, then type the latest price you see and its date. Shopify uses NASDAQ:SHOP in US dollars.</>}>
          <TradingViewOnDemand company={company} />
          <div className="rounded-[16px] bg-surface-soft p-3 md:p-4" aria-label="Enter your quote">
            <div className="grid grid-cols-2 gap-3">
              <label className="text-[13px] font-bold text-navy-strong">
                Price in USD
                <input type="text" inputMode="decimal" placeholder="e.g. 200.00" value={inputPrice}
                  onChange={event => setInputPrice(event.target.value)} data-testid="market-price-input" className={inputCls}/>
              </label>
              <label className="text-[13px] font-bold text-navy-strong">
                Date of this price
                <input type="date" value={inputDate} max={today}
                  min={quote?.asOf} onChange={event => setInputDate(event.target.value)}
                  data-testid="market-quote-date" className={inputCls}/>
              </label>
            </div>
            <label className="mt-3 block text-[13px] font-bold text-navy-strong">
              Where did you read it?
              <select value={reference} onChange={event => setReference(event.target.value as QuoteReference)}
                className={inputCls} data-testid="market-quote-source">
                {QUOTE_REFERENCES.map(name => <option key={name} value={name}>{name}</option>)}
              </select>
            </label>
            {isDateTooEarly ? <p className="mt-2 text-[13px] text-loss-text">Choose the same or a later date than the last saved price.</p> : null}
            <button type="button" onClick={saveQuote} disabled={!canSavePrice}
              className="mt-3 min-h-12 w-full rounded-full bg-family-action px-4 text-[15px] font-bold text-white disabled:opacity-50"
              data-testid="market-quote-submit">Save this price</button>
            {approvedQuote ? <p className="mt-2 text-[13px] font-semibold text-green-strong" data-testid="market-approved-quote">
              Approved Marketstack EOD close (not live): {fmt(approvedQuote.priceCents)} dated {approvedQuote.asOf}.
              {APPROVED_EOD.status === "APPROVED_SNAPSHOT" ? " Applied when not superseded by a newer quote." : " Disabled."}
            </p> : null}
            <p className="mt-2 text-[13px] leading-5 text-navy" data-testid="market-current-quote">
              {quote
                ? (quote.provenance === "LICENSED_EOD_SNAPSHOT" ? "Licensed EOD close " : "User-entered ") + company.ticker + ": " + fmt(quote.priceCents) + " · " + quote.asOf + " · " + quote.reference + (quote.provenance === "LICENSED_EOD_SNAPSHOT" ? " (DATED CLOSE, NOT LIVE)" : " (NOT VERIFIED)")
                : "No price recorded yet. Save a price to unlock the paper trade."}
            </p>
          </div>
        </StepPanel>

        <StepPanel n={3} title="Try a paper trade" done={market.receipts.some(r => r.symbol === company.id)} open={openStep === 3} onToggle={() => toggle(3)}
          testId="market-order-column" ariaLabel="Paper trade"
          summary={`${fmt(metrics.cashCents)} to use · you hold ${(localPosition.sharesHundredths / 100).toFixed(2)} ${company.ticker}`}
          hint={<>You have <strong className="text-navy-strong">{fmt(metrics.cashCents)}</strong> imaginary dollars. Fractions like 0.25 shares are fine.</>}>
          <label className="block text-[13px] font-bold text-navy-strong">
            Shares of {company.ticker}
            <input type="text" inputMode="decimal" value={quantity} onChange={event => setQuantity(event.target.value)}
              data-testid="market-quantity-input" className={inputCls}/>
          </label>
          <p className="rounded-[12px] bg-surface-soft px-3 py-2 text-[14px] leading-6 text-navy" data-testid="market-trade-preview">
            {buy.allowed ? "This would cost " + fmt(buy.totalCents) + " of imaginary dollars." : buy.reason}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => simulate("BUY")} disabled={!buy.allowed} data-testid="market-buy"
              className="inline-flex min-h-12 items-center justify-center gap-1 rounded-full bg-green-strong px-3 text-[15px] font-bold text-white disabled:opacity-40">
              <ArrowUpRight aria-hidden className="size-4"/>Paper buy
            </button>
            <button type="button" onClick={() => simulate("SELL")} disabled={!sell.allowed} data-testid="market-sell"
              className="inline-flex min-h-12 items-center justify-center gap-1 rounded-full border border-line bg-surface px-3 text-[15px] font-bold text-navy-strong disabled:opacity-40">
              <ArrowDownRight aria-hidden className="size-4"/>Paper sell
            </button>
          </div>
          <p className="text-[13px] leading-5 text-ink-2" data-testid="market-selected-holding">
            You hold {(localPosition.sharesHundredths / 100).toFixed(2)} paper shares of {company.ticker}.
          </p>
        </StepPanel>
      </div>

      {/* Outside the steps so it stays visible on phones when the next step opens. */}
      {message ? <p role="status" data-testid="market-action-feedback"
        className="rounded-[12px] border border-line-soft bg-blue-soft p-3 text-[13px] font-semibold text-navy-strong">{message}</p> : null}

      <StepPanel n={4} title="Explain the result" done={explained !== null && options[explained]?.right} open={openStep === 4} onToggle={() => toggle(4)}
        testId="market-holdings" ariaLabel="Explain the result"
        summary={metrics.unrealizedCents !== null && metrics.holdings.length ? `Gain or loss now: ${fmt(metrics.unrealizedCents)}` : "Why did your paper value move?"}
        hint="Change the price later (a new date), then explain why your paper value moved.">
        <dl className="grid grid-cols-2 gap-2 md:grid-cols-4" data-testid="market-summary">
          {([
            ["Portfolio value", metrics.equityCents, "market-equity"],
            ["Imaginary cash", metrics.cashCents, "market-cash"],
            ["Gain or loss now", metrics.unrealizedCents, "market-unrealized"],
            ["Since the start", metrics.changeFromStartCents, "market-return"],
          ] as const).map(([label, value, id]) => (
            <div key={id} className="rounded-[14px] bg-surface-soft px-3 py-2 md:p-3">
              <dt className="text-[13px] font-semibold text-ink-2">{label}</dt>
              <dd className="text-[17px] font-extrabold text-navy-strong md:mt-0.5 md:text-[19px]" data-testid={id}>{value === null ? "Needs a price" : fmt(value)}</dd>
            </div>
          ))}
        </dl>
        {metrics.holdings.length ? (
          <ul className="space-y-2">
            {metrics.holdings.map(h => {
              const name = REAL_COMPANY_RESEARCH.find(c => c.id === h.id)?.name ?? h.id;
              return (
                <li key={h.id} className="grid gap-1 rounded-[14px] bg-surface-soft p-3 text-[13px] text-navy sm:grid-cols-[1fr_auto]">
                  <span><strong className="block text-[15px] text-navy-strong">{name}</strong>
                    {(h.sharesHundredths / 100).toFixed(2)} paper shares · cost {fmt(h.costBasisCents)}</span>
                  <span className="sm:text-right">
                    <strong className="block text-[15px] text-navy-strong">{h.valueCents === null ? "No valuation" : fmt(h.valueCents)}</strong>
                    {h.unrealizedCents === null ? "No price yet" : (h.unrealizedCents >= 0 ? "+" : "") + fmt(h.unrealizedCents) + " · price dated " + h.quote?.asOf}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : <p className="text-[14px] leading-6 text-ink-2">No paper positions yet. Save a price and make a paper buy to see this change.</p>}

        {direction ? (
          <fieldset className="rounded-[16px] border border-family-action/25 bg-family-action-soft/50 p-3 md:p-4" data-testid="market-explain">
            <legend className="px-1 text-[15px] font-extrabold text-navy-strong">
              Your paper {company.ticker} is {direction} {fmt(Math.abs(change ?? 0))}. Why?
            </legend>
            <div className="mt-1 grid gap-2">
              {options.map((option, index) => (
                <button key={option.text} type="button" aria-pressed={explained === index} onClick={() => setExplained(index)}
                  className={`min-h-12 rounded-[14px] border bg-surface p-3 text-left text-[14px] font-semibold leading-5 text-navy-strong ${explained === index ? "border-family-action" : "border-line"}`}>
                  {option.text}
                </button>
              ))}
            </div>
            {explained !== null ? (
              <p role="status" data-testid="market-explain-feedback" className={`mt-2 rounded-[12px] p-3 text-[14px] leading-6 ${options[explained].right ? "bg-green-soft" : "bg-yellow-soft"} text-navy-strong`}>
                {options[explained].why}
              </p>
            ) : null}
          </fieldset>
        ) : position ? (
          <p className="rounded-[14px] bg-surface-soft p-3 text-[14px] leading-6 text-navy" data-testid="market-explain-wait">
            Nothing has moved yet. Come back with a newer price (a later date), then explain what changed.
            <button type="button" onClick={() => setOpenStep(2)} className="mt-1 block min-h-11 text-[14px] font-bold text-family-action underline underline-offset-4 lg:hidden">Enter a newer price</button>
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-x-4">
          <button type="button" onClick={() => setShowHistory(v => !v)} aria-expanded={showHistory}
            className="min-h-11 text-[14px] font-bold text-family-action underline underline-offset-4">
            {showHistory ? "Hide paper activity" : "View paper activity (" + market.receipts.length + ")"}
          </button>
          <button type="button" onClick={() => {marketDispatch({type:"reset"});setExplained(null);setMessage("Paper portfolio restarted; your original fictional credits and Parent/My Key were not changed.");}}
            className="flex min-h-11 items-center gap-1 text-[14px] font-semibold text-loss-text underline underline-offset-4"
            data-testid="market-reset"><RotateCcw aria-hidden className="size-4"/>Restart paper portfolio</button>
        </div>
        {showHistory ? (
          <ul className="space-y-1" data-testid="market-history">
            {market.receipts.length ? market.receipts.map(receipt => (
              <li key={receipt.id} className="text-[13px] leading-5 text-navy">
                {receipt.kind} · {REAL_COMPANY_RESEARCH.find(c => c.id === receipt.symbol)?.ticker} ·
                {" "}{(receipt.sharesHundredths / 100).toFixed(2)} imaginary shares at {fmt(receipt.priceCents)}
                {" "}({receipt.asOf}, entered reference) · {fmt(receipt.totalCents)} · NO ORDER
              </li>
            )) : <li className="text-[13px] text-ink-2">No activity yet.</li>}
          </ul>
        ) : null}
      </StepPanel>
    </div>
  );
}
