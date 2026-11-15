"use client";

/**
 * Two distinct learning modes: fictional choices in Practice, and sourced,
 * read-only research on public issuers here. This screen does not write to
 * the fictional practice reducer, persist identity or grant Parent authority.
 */
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Search, ShieldAlert } from "lucide-react";
import { FamilyPortfolioTabs } from "@/components/family-portfolio-tabs";
import { FamilyRealWorldPanel } from "@/components/family-real-world-panel";
import { FamilyRealMarketPractice } from "@/components/family-real-market-practice";
import { REAL_COMPANY_RESEARCH, type PublicCompanyResearch } from "@/lib/family-real-companies";

export function RealCompanyResearch() {
  const [chosenId, setChosenId] = useState<PublicCompanyResearch["id"]>("apple");
  const selected = REAL_COMPANY_RESEARCH.find(company => company.id === chosenId) ?? REAL_COMPANY_RESEARCH[0];

  return (
    <div className="mx-auto max-w-[1280px] space-y-3 md:space-y-4" data-testid="real-companies-screen">
      <header>
        <p className="text-[11px] font-extrabold uppercase tracking-wider text-green-strong">Explore the real world</p>
        <h1 className="mt-1 font-display text-[28px] text-navy-strong md:text-[36px]">Real-company practice</h1>
        <p className="mt-1 max-w-[660px] text-[14px] leading-6 text-ink-2">
          Choose a listed business, explore the chart, and try a paper trade. The price source and date are always shown. No real money or orders.
        </p>
      </header>

      <FamilyPortfolioTabs active="real"/>

      <section aria-label="Choose a real company" className="grid grid-cols-2 gap-2 md:grid-cols-4"
        data-testid="real-company-picker">
        {REAL_COMPANY_RESEARCH.map(company => (
          <article key={company.id}
            data-testid={"real-company-" + company.id}
            className={"flex min-w-0 flex-col rounded-[14px] border bg-surface p-3 " +
              (chosenId === company.id ? "border-family-action ring-2 ring-family-action/15" : "border-line-soft")}>
            <p className="text-[11px] font-bold text-green-strong">{company.ticker}</p>
            <h2 className="mt-1 text-[16px] font-extrabold text-navy-strong">{company.name}</h2>

            <button type="button" aria-pressed={chosenId === company.id} onClick={() => setChosenId(company.id)}
              data-testid={"real-company-select-" + company.id}
              className={"mt-2 min-h-10 rounded-[12px] border px-3 py-2 text-[12px] font-extrabold " +
                (chosenId === company.id ? "border-family-action bg-family-action-soft text-family-action" : "border-line bg-surface-soft text-navy-strong")}>
              {chosenId === company.id ? "Viewing company" : "Explore " + company.name}
            </button>
            <a href={company.officialSource} target="_blank" rel="noopener noreferrer"
              className="mt-2 inline-flex min-h-8 items-center gap-1 text-[11px] font-semibold text-family-action underline underline-offset-4">
              {company.sourceLabel} <ExternalLink aria-hidden className="size-3"/>
            </a>
          </article>
        ))}
      </section>

      <section data-testid="real-active-company" aria-label={"Research " + selected.name}
        className="rounded-[20px] border border-line-soft bg-surface p-3 shadow-sm md:p-5">
        <p className="text-[11px] font-extrabold uppercase tracking-wider text-green-strong">Paper market lab</p>
        <div className="mt-1 flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="font-display text-[28px] text-navy-strong md:text-[34px]">{selected.name}</h2>
            <p className="mt-1 text-[12px] font-semibold text-ink-2">{selected.exchange} · {selected.ticker} · {selected.sector}</p>
          </div>
          <span className="rounded-full bg-green-soft px-3 py-1 text-[11px] font-bold text-green-strong">Real company · practice only</span>
        </div>
        <p className="mt-2 text-[13px] leading-5 text-navy">{selected.model}</p>
        <FamilyRealMarketPractice key={"paper-" + selected.id} company={selected}/>
        <section className="mt-4 rounded-[16px] bg-surface-soft p-3 md:p-4" aria-label="Research and official results">
          <div className="flex items-center gap-2 text-[12px] font-extrabold text-green-strong">
            <Search aria-hidden className="size-4"/> Understand the business
          </div>
          <p className="mt-2 text-[13px] leading-5 text-navy-strong">{selected.researchQuestion}</p>
          <details className="mt-2 rounded-[12px] border border-line-soft bg-surface p-3">
            <summary className="cursor-pointer text-[13px] font-bold text-navy-strong">What should I check?</summary>
            <p className="mt-2 text-[13px] text-navy"><strong>Customers: </strong>{selected.customers}</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-[12px] leading-5 text-ink-2">
              {selected.risksToConsider.map(risk => <li key={risk}>{risk}</li>)}
            </ul>
          </details>
          <FamilyRealWorldPanel key={selected.id} company={selected} showChart={false}/>
        </section>
      </section>

      <div data-testid="real-company-boundary" role="note"
        className="rounded-[16px] border border-yellow/40 bg-yellow-soft p-3 text-[12px] leading-6 text-navy-strong">
        <ShieldAlert aria-hidden className="mr-2 inline size-4 text-orange-text"/>
        Research and paper practice only. You own no real shares; there are no real orders, real balances or accounts.
        Paper buys and sells use imaginary USD, with a dated approved end-of-day snapshot when licensed or an unverified manual reference.
        SEC figures are dated annual reports; TradingView charts are optional, display-only and now shown next to the paper-trading controls.
        These activities do not change the original Fictional practice credits or Parent/My Key.
      </div>

      <p className="text-[12px] leading-5 text-ink-2">
        <Link href="/try/portfolio" className="inline-flex min-h-10 items-center gap-1 font-bold text-family-action underline underline-offset-4">
          <ArrowLeft aria-hidden className="size-3" />Back to fictional practice
        </Link>
        {" "}· Prices and financial facts are different: a company can increase revenue while its share price falls.
      </p>
    </div>
  );
}
