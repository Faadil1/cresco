"use client";

/**
 * Real-world learning: official SEC annual facts and an opt-in TradingView
 * display widget. Neither source is imported into the fictional trade engine.
 * No third-party request happens before the visitor requests the chart.
 */
import { useEffect, useRef, useState } from "react";
import { ExternalLink, LineChart, RefreshCcw, ShieldCheck } from "lucide-react";
import snapshotJson from "@/lib/family-sec-snapshot.json";
import verified10kJson from "@/lib/family-sec-verified-10k.json";
import type { PublicCompanyResearch } from "@/lib/family-real-companies";

type AnnualFact = {
  valueUSD: number;
  start: string;
  end: string;
  filed: string;
  form: string;
  accession: string;
  taxonomy: string;
  tag: string;
};
type CompanyFacts = {
  status: "AVAILABLE" | "UNAVAILABLE";
  cik: string;
  filingUrl?: string;
  annualRevenue: AnnualFact | null;
  annualNetIncome: AnnualFact | null;
};
type SecSnapshot = {
  schemaVersion: number;
  generatedAt: string | null;
  companies: Partial<Record<PublicCompanyResearch["id"], CompanyFacts>>;
};
const IMPORTED_SEC = snapshotJson as unknown as SecSnapshot;
const VERIFIED_SEC = verified10kJson as unknown as SecSnapshot;
// A manual, filing-linked verified snapshot is shown until a reviewed API import exists.
const SEC = IMPORTED_SEC.generatedAt ? IMPORTED_SEC : VERIFIED_SEC;

const MARKET_SYMBOLS: Record<PublicCompanyResearch["id"], string> = {
  apple: "NASDAQ:AAPL",
  microsoft: "NASDAQ:MSFT",
  costco: "NASDAQ:COST",
  shopify: "NASDAQ:SHOP"
};
const USD = new Intl.NumberFormat("en-US", {
  style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 2
});

function TradingViewOnDemand({ company }: { company: PublicCompanyResearch }) {
  const [open, setOpen] = useState(false);
  const host = useRef<HTMLDivElement>(null);
  const symbol = MARKET_SYMBOLS[company.id];

  useEffect(() => {
    if (!open || !host.current) return;
    const target = host.current;
    const widget = document.createElement("div");
    widget.className = "tradingview-widget-container__widget";
    const loader = document.createElement("script");
    loader.type = "text/javascript";
    loader.src = "https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js";
    loader.async = true;
    loader.textContent = JSON.stringify({
      symbols: [[company.name, symbol + "|1D"]],
      chartOnly: false,
      width: "100%",
      height: 350,
      locale: "en",
      colorTheme: "light",
      autosize: false,
      showVolume: false,
      showMA: false,
      hideMarketStatus: false
    });
    target.replaceChildren(widget);
    target.appendChild(loader);
    return () => target.replaceChildren();
  }, [open, company.name, symbol]);

  return (
    <section className="mt-3 rounded-[16px] border border-line-soft bg-surface-soft p-3" data-testid={"real-chart-" + company.id}>
      <p className="flex items-center gap-2 text-[13px] font-extrabold text-navy-strong">
        <LineChart aria-hidden className="size-4 text-family-action" />
        Market chart
      </p>
      <p className="mt-1 text-[12px] leading-5 text-ink-2">
        Display-only chart from TradingView. Prices may be delayed or unavailable depending on the market.
        We do not read chart prices into practice balances, lessons or My Key.
      </p>
      {!open ? (
        <button type="button" onClick={() => setOpen(true)}
          data-testid={"real-chart-consent-" + company.id}
          className="mt-3 min-h-11 rounded-full bg-family-action px-4 py-2 text-[13px] font-bold text-white">
          Load TradingView chart
        </button>
      ) : (
        <>
          <div ref={host} className="mt-3 min-h-[350px] w-full overflow-hidden bg-white" aria-label={company.name + " chart by TradingView"}
            data-testid={"real-chart-widget-" + company.id} />
          <button type="button" onClick={() => setOpen(false)}
            className="mt-2 min-h-10 text-[12px] font-bold text-family-action underline underline-offset-4">
            Hide third-party chart
          </button>
        </>
      )}
      <p className="mt-2 text-[11px] leading-5 text-ink-2">
        Loading the chart contacts TradingView and shares your IP address, this page URL and the viewed symbol.
        Chart data remains on TradingView; its branding and attribution must remain visible.
      </p>
      <a href={"https://www.tradingview.com/symbols/" + symbol.replace(":", "-") + "/"}
        target="_blank" rel="noopener noreferrer"
        className="mt-1 inline-flex items-center gap-1 text-[12px] font-bold text-family-action underline underline-offset-4">
        View directly on TradingView <ExternalLink aria-hidden className="size-3" />
      </a>
    </section>
  );
}

export function FamilyRealWorldPanel({ company }: { company: PublicCompanyResearch }) {
  const facts = SEC.companies[company.id];
  const revenue = facts?.annualRevenue ?? null;
  const netIncome = facts?.annualNetIncome ?? null;
  const [answer, setAnswer] = useState<"yes" | "no" | null>(null);
  const secHref = facts?.filingUrl ?? ("https://www.sec.gov/edgar/browse/?CIK=" + (facts?.cik ?? {
    apple:"0000320193", microsoft:"0000789019", costco:"0000909832", shopify:"0001594805"
  }[company.id]));

  return (
    <div data-testid={"real-learning-" + company.id}>
      <section className="mt-4 rounded-[16px] border border-line-soft bg-surface-soft p-3"
        data-testid={"real-sec-" + company.id}>
        <p className="flex items-center gap-2 text-[13px] font-extrabold text-navy-strong">
          <ShieldCheck aria-hidden className="size-4 text-green-strong" />
          Official SEC results
        </p>
        {revenue ? (
          <>
            <p className="mt-1 text-[11px] leading-5 text-ink-2">
              Annual fiscal period ending {revenue.end} · {revenue.form} filed {revenue.filed} · USD
            </p>
            <dl className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-[12px] bg-white p-3">
                <dt className="text-[11px] font-semibold text-ink-2">Annual revenue</dt>
                <dd className="mt-1 text-[18px] font-extrabold text-navy-strong" data-testid={"real-revenue-" + company.id}>
                  {USD.format(revenue.valueUSD)}
                </dd>
              </div>
              <div className="rounded-[12px] bg-white p-3">
                <dt className="text-[11px] font-semibold text-ink-2">Annual net income</dt>
                <dd className="mt-1 text-[18px] font-extrabold text-navy-strong">
                  {netIncome ? USD.format(netIncome.valueUSD) : "Not available"}
                </dd>
              </div>
            </dl>
            <p className="mt-2 text-[11px] leading-5 text-ink-2">
              Annual SEC filing facts · not live market data.
              Snapshot checked {SEC.generatedAt?.slice(0, 10) ?? "date unavailable"}.
              Financial figures can be restated; compare reporting periods before drawing conclusions.
            </p>
          </>
        ) : (
          <p className="mt-2 text-[12px] leading-5 text-ink-2">
            No verified SEC snapshot has been imported into this review build yet.
            We do not invent sales or profit numbers. Official filings remain accessible below.
          </p>
        )}
        <a href={secHref} target="_blank" rel="noopener noreferrer"
          className="mt-2 inline-flex min-h-10 items-center gap-1 text-[12px] font-bold text-family-action underline underline-offset-4">
          Read official SEC filings <ExternalLink aria-hidden className="size-3" />
        </a>
      </section>

      <details className="mt-3 rounded-[16px] border border-line-soft p-3" data-testid={"real-mission-" + company.id}>
        <summary className="cursor-pointer text-[13px] font-extrabold text-navy-strong">
          Try it · Can more sales mean less profit?
        </summary>
        <p className="mt-3 text-[13px] leading-6 text-navy">
          Imagine a shop sold 100 credits of goods while spending 90. Next year it sells 120,
          but spends 130. These numbers are fictional and are NOT {company.name}&apos;s results.
        </p>
        <p className="mt-2 text-[13px] font-bold text-navy-strong">Does higher revenue guarantee a higher profit?</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button type="button" aria-pressed={answer === "yes"} onClick={() => setAnswer("yes")}
            className={"min-h-10 rounded-full border px-4 text-[12px] font-bold " + (answer === "yes" ? "border-family-action bg-family-action-soft" : "border-line-soft")}>
            Yes
          </button>
          <button type="button" aria-pressed={answer === "no"} onClick={() => setAnswer("no")}
            className={"min-h-10 rounded-full border px-4 text-[12px] font-bold " + (answer === "no" ? "border-family-action bg-family-action-soft" : "border-line-soft")}>
            No
          </button>
        </div>
        {answer ? (
          <p className="mt-2 rounded-[12px] bg-green-soft p-3 text-[12px] leading-5 text-navy" role="status">
            {answer === "no"
              ? "Correct. The imaginary shop went from 10 credits of profit to a loss of 10."
              : "Not necessarily. Costs can rise even faster than sales. Here the shop would lose 10 credits."}
            {" "}This answer does not change your practice credits, lesson score or Parent Key.
          </p>
        ) : null}
      </details>

      <TradingViewOnDemand company={company} />
      <p className="mt-2 flex items-center gap-1 text-[11px] leading-5 text-ink-3">
        <RefreshCcw aria-hidden className="size-3" /> SEC figures are updated only when the offline snapshot is refreshed and reviewed.
      </p>
    </div>
  );
}
