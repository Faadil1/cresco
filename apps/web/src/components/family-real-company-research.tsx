"use client";

/**
 * Real companies, as one guided task in four numbered steps:
 * 1 understand the business (official SEC facts), 2 read the price (optional
 * third-party chart + a dated price the child types), 3 a paper trade in
 * imaginary USD, 4 explain the result. This screen never writes to the
 * pretend-credit practice reducer, persists identity or grants Parent authority.
 */
import { useState } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { FamilyRealWorldPanel } from "@/components/family-real-world-panel";
import { FamilyRealMarketPractice } from "@/components/family-real-market-practice";
import { useRealMarketPractice } from "@/components/family-story-provider";
import { RealityTag, Segmented, SourcesNote, StepHeader, pageTitle } from "@/components/family-story-ui";
import { REAL_COMPANY_RESEARCH, type PublicCompanyResearch } from "@/lib/family-real-companies";

export function ExploreSections({ active }: { active: "story" | "real" }) {
  return (
    <Segmented label="Explore sections" testId="explore-sections" items={[
      { href: "/try/explore", label: "Story companies", active: active === "story", reality: "pretend" },
      { href: "/try/explore/real", label: "Real companies", active: active === "real", reality: "real" },
    ]}/>
  );
}

export function RealCompanyResearch() {
  const [chosenId, setChosenId] = useState<PublicCompanyResearch["id"]>("apple");
  const { market } = useRealMarketPractice();
  const selected = REAL_COMPANY_RESEARCH.find(company => company.id === chosenId) ?? REAL_COMPANY_RESEARCH[0];

  return (
    <div className="space-y-5" data-testid="real-companies-screen">
      <header className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h1 className={pageTitle}>Real companies</h1>
            <p className="mt-1 max-w-[62ch] text-[15px] leading-6 text-ink-2">
              Learn how a real business earns money, then practice with $1,000 of imaginary dollars. Four steps, about ten minutes.
            </p>
          </div>
          <RealityTag kind="real"/>
        </div>
        <ExploreSections active="real"/>
      </header>

      <section aria-label="Choose a real company" data-testid="real-company-picker">
        <div role="group" aria-label="Real company" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {REAL_COMPANY_RESEARCH.map(company => {
            const active = chosenId === company.id;
            const held = market.positions[company.id].sharesHundredths > 0;
            return (
              <div key={company.id} data-testid={"real-company-" + company.id}>
                <button type="button" aria-pressed={active} onClick={() => setChosenId(company.id)}
                  data-testid={"real-company-select-" + company.id}
                  className={"flex min-h-14 w-full items-center justify-between gap-2 rounded-[16px] border px-3 py-2 text-left " +
                    (active ? "border-family-action bg-family-action-soft ring-2 ring-family-action/20" : "border-line-soft bg-surface hover:border-family-action/40")}>
                  <span className="min-w-0">
                    <span className="block text-[15px] font-extrabold text-navy-strong">{company.name}</span>
                    <span className="block text-[12px] font-bold text-ink-2">{company.ticker}<span className="hidden sm:inline"> · {company.sector}</span></span>
                  </span>
                  {held ? <span className="shrink-0 rounded-full bg-blue-soft px-2 py-0.5 text-[12px] font-bold text-blue-strong">held</span> : null}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <section data-testid="real-active-company" aria-label={"Research " + selected.name} className="space-y-4">
        <article className="rounded-[20px] border border-line-soft bg-surface p-4 md:p-5" aria-label={"Step 1: understand " + selected.name}>
          <StepHeader n={1} title={"Understand " + selected.name} hint={`${selected.exchange} · ${selected.ticker} · ${selected.sector}`}/>
          <div className="mt-3 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="space-y-3 text-[15px] leading-6 text-navy">
              <p><strong className="text-navy-strong">What it does: </strong>{selected.model}</p>
              <p><strong className="text-navy-strong">Who pays: </strong>{selected.customers}</p>
              <p className="rounded-[14px] bg-yellow-soft p-3 text-[14px] text-navy-strong"><strong>A question to ask: </strong>{selected.researchQuestion}</p>
              <details key={selected.id} className="rounded-[14px] border border-line-soft px-3 py-1" data-testid="real-risks">
                <summary className="flex min-h-11 cursor-pointer items-center text-[14px] font-bold text-navy-strong">What could go wrong? ({selected.risksToConsider.length})</summary>
                <ul className="list-disc space-y-0.5 pb-2 pl-5 text-[14px]">
                  {selected.risksToConsider.map(risk => <li key={risk}>{risk}</li>)}
                </ul>
                <a href={selected.officialSource} target="_blank" rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-1 text-[13px] font-bold text-family-action underline underline-offset-4">
                  {selected.sourceLabel} (opens outside Cresco) <ExternalLink aria-hidden className="size-3"/>
                </a>
              </details>
            </div>
            <FamilyRealWorldPanel key={selected.id} company={selected} showChart={false}/>
          </div>
        </article>

        <FamilyRealMarketPractice key={"paper-" + selected.id} company={selected}/>
      </section>

      <SourcesNote testId="real-company-boundary">
        <p>Research and paper practice only. You own no real shares; there are no real orders, real balances or accounts.</p>
        <p>Paper buys and sells use imaginary USD. Prices are ones you type in with a date (unverified), or, only if licensed, a dated end-of-day close. A dated end-of-day reference is not a live price; returns here exclude dividends, splits, fees and currency changes.</p>
        <p>SEC figures are dated annual reports, updated only when the offline snapshot is refreshed and reviewed. Figures can be restated; compare reporting periods before drawing conclusions.</p>
        <p>TradingView charts are optional and display-only; prices there may be delayed, and Cresco never copies them into your paper dollars, lessons or My Key. Market-price redistribution rights are not included with a free TradingView widget.</p>
        <p>None of this changes your 100 pretend credits or My Key, and no Parent approval is involved.</p>
      </SourcesNote>

      <p className="text-[14px] leading-6 text-ink-2">
        See all your paper positions in <Link href="/try/portfolio/paper" className="font-bold text-family-action underline underline-offset-4">Portfolio · Paper dollars</Link>.
        Remember: a company can sell more while its share price falls.
      </p>
    </div>
  );
}
