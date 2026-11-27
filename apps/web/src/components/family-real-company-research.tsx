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
import { ArrowRight, ExternalLink } from "lucide-react";
import { FamilyRealWorldPanel } from "@/components/family-real-world-panel";
import { FamilyRealMarketPractice } from "@/components/family-real-market-practice";
import { useRealMarketPractice } from "@/components/family-story-provider";
import { RealityTag, Segmented, SourcesNote, StepPanel, Term, pageTitle } from "@/components/family-story-ui";
import { COMPANY_EXPLAINERS, MONEY_TERMS, type ChooseReason } from "@/lib/family-real-company-explainers";
import { REAL_COMPANY_RESEARCH, type PublicCompanyResearch } from "@/lib/family-real-companies";

export function ExploreSections({ active }: { active: "story" | "real" }) {
  return (
    <Segmented label="Explore sections" testId="explore-sections" items={[
      { href: "/try/explore", label: "Story companies", active: active === "story", reality: "pretend" },
      { href: "/try/explore/real", label: "Real companies", active: active === "real", reality: "real" },
    ]}/>
  );
}

/** Runs after React commits and the browser lays out, so scroll/focus target the new DOM. */
const afterPaint = (fn: () => void) => requestAnimationFrame(() => requestAnimationFrame(fn));

/** The company-choice reason. One state, shown in step 1 and, when needed, right at the trade. */
function ReasonChoices({ reasons, selected, onPick, testId, compact = false }: {
  reasons: readonly ChooseReason[]; selected: string | undefined; onPick: (id: string) => void; testId: string; compact?: boolean;
}) {
  const chosen = reasons.find(item => item.id === selected);
  return (
    <>
      <div className={`mt-2 grid gap-2 ${compact ? "" : ""}`} role="group" aria-label="Your reason for choosing this company">
        {reasons.map(item => (
          <button key={item.id} type="button" aria-pressed={selected === item.id} onClick={() => onPick(item.id)}
            className={`min-h-12 rounded-[14px] border px-3 py-2 text-left text-[14px] font-semibold leading-5 text-navy-strong ${selected === item.id ? (item.strong ? "border-green-strong bg-green-soft" : "border-orange/50 bg-yellow-soft") : "border-line bg-surface hover:border-family-action/40"}`}>
            {item.label}
          </button>
        ))}
      </div>
      {chosen ? <p role="status" data-testid={testId} data-strong={chosen.strong ? "true" : "false"} className="mt-2 rounded-[12px] bg-surface p-3 text-[14px] leading-6 text-navy-strong">{chosen.feedback}</p> : null}
    </>
  );
}

export function RealCompanyResearch() {
  const [chosenId, setChosenId] = useState<PublicCompanyResearch["id"]>("apple");
  // Phones show one step at a time; lg+ shows all four. Switching company restarts at step 1.
  const [openStep, setOpenStep] = useState(1);
  const toggle = (n: number) => setOpenStep(current => current === n ? 0 : n);
  // "Why would you choose it?" per company: asked before any paper buy (issue #130 P2).
  const [reasons, setReasons] = useState<Partial<Record<PublicCompanyResearch["id"], string>>>({});
  // Set when the Child jumped from the trade to the reason question, so we can offer the way back.
  const [returnToTrade, setReturnToTrade] = useState(false);
  const { market } = useRealMarketPractice();
  const selected = REAL_COMPANY_RESEARCH.find(company => company.id === chosenId) ?? REAL_COMPANY_RESEARCH[0];
  const explainer = COMPANY_EXPLAINERS[selected.id];
  const reasonId = reasons[selected.id];
  const reason = explainer.reasons.find(item => item.id === reasonId);
  const pickReason = (id: string) => setReasons(r => ({ ...r, [selected.id]: id }));
  // Visible, keyboard-reachable recovery on every viewport (issue #132 P0): open step 1 on
  // phones, then scroll to the question and focus it on every size.
  const jumpToReason = () => {
    setOpenStep(1);
    setReturnToTrade(true);
    afterPaint(() => {
      const field = document.getElementById(`real-reason-${selected.id}`);
      field?.scrollIntoView({ block: "center", behavior: "auto" });
      (field?.querySelector("button") as HTMLButtonElement | null)?.focus({ preventScroll: true });
    });
  };
  const backToTrade = () => {
    setReturnToTrade(false);
    setOpenStep(3);
    afterPaint(() => {
      const buy = document.querySelector<HTMLButtonElement>('[data-testid="market-buy"]');
      buy?.scrollIntoView({ block: "center", behavior: "auto" });
      buy?.focus({ preventScroll: true });
    });
  };

  return (
    <div className="space-y-5" data-testid="real-companies-screen">
      <header className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h1 className={pageTitle}>Real companies</h1>
            <p className="mt-1 max-w-[62ch] text-[15px] leading-6 text-ink-2">
              Understand a real business, then practice with $1,000 of imaginary dollars.
            </p>
          </div>
          <RealityTag kind="real"/>
        </div>
        <ExploreSections active="real"/>
      </header>

      <section aria-label="Choose a real company" data-testid="real-company-picker">
        <div role="group" aria-label="Real company" className="grid grid-cols-4 gap-1.5 sm:gap-2">
          {REAL_COMPANY_RESEARCH.map(company => {
            const active = chosenId === company.id;
            const held = market.positions[company.id].sharesHundredths > 0;
            return (
              <div key={company.id} data-testid={"real-company-" + company.id}>
                <button type="button" aria-pressed={active} onClick={() => { setChosenId(company.id); setOpenStep(1); setReturnToTrade(false); }}
                  data-testid={"real-company-select-" + company.id} aria-label={`${company.name} (${company.ticker})${held ? ", you hold paper shares" : ""}`}
                  className={"relative flex min-h-12 w-full flex-col justify-center rounded-[14px] border px-2 py-1.5 text-center sm:min-h-14 sm:items-start sm:px-3 sm:text-left " +
                    (active ? "border-family-action bg-family-action-soft ring-2 ring-family-action/20" : "border-line-soft bg-surface hover:border-family-action/40")}>
                  <span className="block text-[15px] font-extrabold text-navy-strong sm:hidden">{company.ticker}</span>
                  <span className="block truncate text-[12px] font-bold text-ink-2 sm:text-[15px] sm:font-extrabold sm:text-navy-strong">{company.name}</span>
                  <span className="hidden text-[12px] font-bold text-ink-2 sm:block">{company.ticker} · {company.sector}</span>
                  {held ? <span aria-hidden className="absolute right-1.5 top-1.5 size-2.5 rounded-full bg-blue-strong"/> : null}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <section data-testid="real-active-company" aria-label={"Research " + selected.name} className="space-y-4">
        <StepPanel n={1} title={"Understand " + selected.name} hint={`${selected.exchange} · ${selected.ticker} · ${selected.sector}`}
          summary="What it does, who pays and its official results" open={openStep === 1} onToggle={() => toggle(1)}
          ariaLabel={"Step 1: understand " + selected.name} testId="real-step-1">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="space-y-3 text-[15px] leading-6 text-navy">
              <p className="text-[17px] font-bold leading-7 text-navy-strong" data-testid="real-in-one-sentence">{explainer.inOneSentence}</p>
              <p><strong className="text-navy-strong">How money comes in: </strong>{explainer.moneyExample}{" "}
                <Term word="What is revenue?" definition={MONEY_TERMS.revenue} testId="term-revenue"/></p>
              <p><strong className="text-navy-strong">Who pays: </strong>{selected.customers}</p>
              <fieldset id={`real-reason-${selected.id}`} tabIndex={-1} className="scroll-mt-24 rounded-[16px] border border-family-action/25 bg-family-action-soft/40 p-3 outline-none" data-testid="real-reason">
                <legend className="px-1 text-[15px] font-extrabold text-navy-strong">Your reason: why would someone choose {selected.name}?</legend>
                <p className="px-1 text-[13px] text-ink-2">This is not a quiz. Pick the reason closest to yours; you need one before a paper buy.</p>
                <ReasonChoices reasons={explainer.reasons} selected={reasonId} onPick={pickReason} testId="real-reason-feedback"/>
                {reason && returnToTrade ? (
                  <button type="button" onClick={backToTrade} data-testid="real-reason-back-to-trade"
                    className="mt-2 inline-flex min-h-11 items-center gap-2 rounded-full bg-family-action px-4 text-[14px] font-bold text-white">
                    Back to the paper trade <ArrowRight aria-hidden className="size-4"/>
                  </button>
                ) : null}
              </fieldset>
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
          <button type="button" onClick={() => setOpenStep(2)} data-testid="real-step-1-next" disabled={!reason}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-family-action px-6 text-[15px] font-bold text-white disabled:opacity-50 lg:hidden">
            {reason ? <>Next: read the price <ArrowRight aria-hidden className="size-4"/></> : "Pick a reason above to continue"}
          </button>
        </StepPanel>

        <FamilyRealMarketPractice key={"paper-" + selected.id} company={selected} openStep={openStep} setOpenStep={setOpenStep} toggle={toggle}
          reasonChosen={Boolean(reason)} onNeedReason={jumpToReason}
          reasonPrompt={<ReasonChoices reasons={explainer.reasons} selected={reasonId} onPick={pickReason} testId="market-reason-inline-feedback" compact/>}/>
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
