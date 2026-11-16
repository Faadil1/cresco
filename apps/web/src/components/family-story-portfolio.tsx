"use client";

/**
 * Portfolio destination, after the original Cresco /portfolio: one summary
 * card, holdings, a what-if, then asks and receipts. Practice only: invented
 * prices, fictional credits, goal savings kept apart from practice choices.
 */
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Building2, CheckCircle2, Clock3, Receipt, XCircle } from "lucide-react";
import { useFamilyStory, useRealMarketPractice } from "@/components/family-story-provider";
import {
  CompanyArt, RealityTag, Segmented, SourcesNote, Stat, kicker, pageTitle, panel, primaryBtn, secondaryBtn, sectionTitle,
} from "@/components/family-story-ui";
import { summarizeRealMarket } from "@/lib/family-real-market-sandbox";
import { REAL_COMPANY_RESEARCH } from "@/lib/family-real-companies";
import { FAMILY_EXPLORE_CASES } from "@/lib/family-public-explore-data";
import {
  PRACTICE_ASSETS, evaluatePracticeScenario, initialFamilyPractice, remainingCredits, selectedPracticeGoal,
  type PracticeRequest, type PracticeScenario,
} from "@/lib/family-public-practice";
import { nextMission } from "@/lib/family-story-state";

const SCENARIOS: { id: PracticeScenario; label: string; explain: string }[] = [
  { id: "base", label: "Sample prices", explain: "The fixed invented prices from Explore. Not today's market." },
  { id: "downturn", label: "A bad month", explain: "Invented: ORC -30%, MKT -10%, BKT -15%. Not a prediction." },
  { id: "mixed", label: "A mixed month", explain: "Invented: ORC +10%, MKT -20%, BKT +2%. Different things move differently." },
];
const STATUS: Record<PracticeRequest["status"], string> = {
  pending: "Waiting for my Parent", "approved-once": "Approved once, not used yet", declined: "Declined, nothing bought",
  used: "Approval used", stale: "Expired after a Key change",
};
const fmt = (n: number) => n.toFixed(2);
const allocationTone = { ORC: "bg-blue-strong", MKT: "bg-green", BKT: "bg-yellow" } as const;
const usd = (cents: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

function PortfolioHeader({ active }: { active: "pretend" | "paper" }) {
  return (
    <header className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className={pageTitle}>Portfolio</h1>
          <p className="mt-1 text-[15px] leading-6 text-ink-2">
            {active === "pretend" ? "What your pretend credits are doing, and what happened to each choice." : "Your separate paper portfolio of real company names, in imaginary dollars."}
          </p>
        </div>
        <RealityTag kind={active === "pretend" ? "pretend" : "real"}/>
      </div>
      <Segmented label="Portfolio sections" testId="portfolio-sections" items={[
        { href: "/try/portfolio", label: "Pretend credits", active: active === "pretend", reality: "pretend" },
        { href: "/try/portfolio/paper", label: "Paper dollars", active: active === "paper", reality: "real" },
      ]}/>
    </header>
  );
}

export function PortfolioScreen() {
  const { story } = useFamilyStory();
  const p = story.practice;
  const goal = selectedPracticeGoal(p);
  const [scenario, setScenario] = useState<PracticeScenario>("base");
  const [showSample, setShowSample] = useState(false);
  const result = evaluatePracticeScenario(p, scenario);
  const delta = result.hypothetical - result.original;
  const example = evaluatePracticeScenario({ ...initialFamilyPractice(), spent: 60, holdings: { ORC: 2, MKT: 4, BKT: 1 } }, scenario);
  const held = result.assets.filter(a => p.holdings[a.code] > 0);
  const mission = nextMission(story);
  const free = remainingCredits(p);
  const assetName = (code: string) => PRACTICE_ASSETS.find(a => a.code === code)?.name ?? code;
  const activity = [
    ...p.requests.map(r => ({ kind: "ask" as const, id: r.id, r })),
    ...p.receipts.map(r => ({ kind: "receipt" as const, id: r.id, r })),
  ].sort((a, b) => b.id - a.id || (a.kind === "receipt" ? -1 : 1));
  const scenarioButtons = (
    <div role="group" aria-label="Portfolio teaching scenarios" className="flex flex-wrap gap-2">
      {SCENARIOS.map(s => (
        <button key={s.id} type="button" aria-pressed={scenario === s.id} onClick={() => setScenario(s.id)}
          className={`min-h-11 rounded-full border px-4 text-[14px] font-bold ${scenario === s.id ? "border-family-action bg-family-action-soft text-family-action" : "border-line bg-surface text-navy-strong"}`}>{s.label}</button>
      ))}
    </div>
  );
  return (
    <div className="space-y-5" data-testid="portfolio-screen">
      <PortfolioHeader active="pretend"/>

      <section className={panel} aria-label="Practice summary" data-testid="portfolio-summary">
        <h2 className={sectionTitle}>My 100 pretend credits</h2>
        <div className="mt-3" data-testid="portfolio-allocation">
          <div className="flex h-4 overflow-hidden rounded-full bg-surface-soft" role="img"
            aria-label={`${p.saved} saved, ${p.spent} invested in practice, ${free} available out of 100 pretend credits`}>
            <span className="bg-green-strong" style={{ width: `${p.saved}%` }}/>
            <span className="bg-yellow" style={{ width: `${p.spent}%` }}/>
          </div>
        </div>
        <dl className="mt-3 grid grid-cols-3 gap-2">
          <Stat label={`Saved for ${goal.label.toLowerCase()}`} value={<>{p.saved}<span className="text-[14px] font-semibold text-ink-2">/{goal.target}</span></>} hint="Never moves with prices"/>
          <Stat label="In practice choices" value={<span data-testid="portfolio-spent">{p.spent}</span>} hint={`${held.length} holding${held.length === 1 ? "" : "s"}`}/>
          <Stat label="Free to use" value={<span data-testid="portfolio-available">{free}</span>} hint={`Key: ${p.key.maxPerAction} a choice`}/>
        </dl>
      </section>

      <section aria-labelledby="holdings-title" className={panel}>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="holdings-title" className={sectionTitle}>My practice holdings</h2>
          {held.length ? <p className="text-[13px] text-ink-2">Prices are invented examples, not a live feed.</p> : null}
        </div>
        {held.length ? (
          <>
            <div className="mt-3 space-y-2" data-testid="portfolio-what-if">
              <p className="text-[14px] font-semibold text-navy-strong">What if prices changed?</p>
              {scenarioButtons}
              <p className="text-[15px] leading-6 text-navy">
                Your {fmt(result.original)} practice credits would be worth about <strong data-testid="scenario-hypothetical">{fmt(result.hypothetical)}</strong>
                {" "}(<strong className={delta < 0 ? "text-loss-text" : delta > 0 ? "text-green-strong" : ""}>{delta >= 0 ? "+" : ""}{fmt(delta)}</strong>). Your {p.saved} saved credits do not move.
              </p>
              <p className="text-[13px] text-ink-2">{SCENARIOS.find(s => s.id === scenario)!.explain}</p>
            </div>
            <ul className="mt-4 divide-y divide-line-soft border-t border-line-soft" aria-label="Practice holdings">
              {held.map(asset => {
                const item = FAMILY_EXPLORE_CASES.find(c => c.practiceCode === asset.code)!;
                const change = asset.hypothetical - asset.cost;
                return (
                  <li key={asset.code}>
                    <Link href={`/try/explore/${item.id}`} className="flex min-h-16 items-center gap-3 py-3">
                      <CompanyArt id={item.id} name={asset.name} className="h-12 w-14 shrink-0 overflow-hidden rounded-[12px]"/>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[15px] font-bold text-navy-strong">{asset.name}</span>
                        <span className="block text-[13px] text-ink-2">{p.holdings[asset.code].toFixed(2)} pretend units · {Math.round(asset.weight * 100)}% of holdings · cost {fmt(asset.cost)}</span>
                      </span>
                      <span className="text-right text-[15px] font-bold text-navy-strong">{fmt(asset.hypothetical)}
                        <span className={`block text-[13px] font-semibold ${change < 0 ? "text-loss-text" : change > 0 ? "text-green-strong" : "text-ink-2"}`}>{change >= 0 ? "+" : ""}{fmt(change)}</span></span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="mt-2 space-y-2" data-testid="portfolio-weights">
              <div className="flex h-3 overflow-hidden rounded-full bg-surface-soft" role="img"
                aria-label={`Practice allocation: ${held.map(asset => `${asset.name} ${Math.round(asset.weight * 100)} percent`).join(", ")}`}>
                {held.map(asset => <span key={asset.code} className={allocationTone[asset.code]} style={{ width: `${100 * asset.weight}%` }}/>)}
              </div>
              <p className="text-[14px] leading-6 text-navy">
                {held.length === 1 ? "All your practice credits depend on one invented company. A second, different holding would spread the risk." : `${Math.round(Math.max(...held.map(asset => asset.weight)) * 100)}% is in your largest holding. Spreading out changes the risk, but never removes it.`}
              </p>
            </div>
          </>
        ) : (
          <div className="mt-3 rounded-[16px] bg-surface-soft p-4" data-testid="portfolio-empty">
            <p className="text-[15px] font-semibold text-navy-strong">No practice holdings yet.</p>
            <p className="mt-1 text-[14px] leading-6 text-ink-2">Meet someone in Explore, then make a small choice inside your Key. It shows up here with a receipt.</p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
              <Link href={mission.href.startsWith("/try/explore") ? mission.href : "/try/explore"} className={primaryBtn}>Go to Explore<ArrowRight aria-hidden className="size-4"/></Link>
              <button type="button" className="min-h-11 text-left text-[14px] font-bold text-family-action underline underline-offset-4 sm:px-3"
                aria-expanded={showSample} onClick={() => setShowSample(!showSample)} data-testid="portfolio-example-toggle">
                {showSample ? "Hide the example" : "See an example portfolio"}
              </button>
            </div>
            {showSample ? (
              <section className="mt-3 rounded-[16px] border border-yellow/50 bg-surface p-4" data-testid="portfolio-example">
                <p className={`${kicker} text-orange-text`}>Example · not your holdings</p>
                <h3 className="mt-1 text-[17px] font-extrabold text-navy-strong">Three pretend holdings · 60 credits</h3>
                <p className="mt-1 text-[14px] leading-6 text-navy">20 credits in each of three invented companies. Try a month and see what changes. This example cannot spend your credits.</p>
                <div className="mt-3">{scenarioButtons}</div>
                <ul className="mt-3 space-y-2" aria-label="Example fictional holdings">
                  {example.assets.map(asset => (
                    <li key={asset.code} className="grid grid-cols-[1fr_auto] gap-2 rounded-[12px] bg-surface-soft p-3 text-[13px] text-navy-strong">
                      <span><strong className="block">{asset.name}</strong>{fmt(asset.cost)} invested</span>
                      <span className="text-right"><strong className="block">{fmt(asset.hypothetical)}</strong>after the month</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-[15px] font-semibold text-navy-strong" data-testid="example-scenario-total">
                  Example total: {fmt(example.original)} invested → {fmt(example.hypothetical)} after the month.
                </p>
              </section>
            ) : null}
          </div>
        )}
      </section>

      <section aria-labelledby="activity-title" className={panel} data-testid="portfolio-activity">
        <h2 id="activity-title" className={sectionTitle}>What happened</h2>
        {activity.length ? (
          <ol className="mt-3 space-y-2" data-testid="portfolio-receipts">
            {activity.map(entry => entry.kind === "receipt" ? (
              <li key={`r${entry.id}`} className="flex items-start gap-3 rounded-[14px] bg-green-soft px-3 py-2.5 text-[14px] text-navy-strong">
                <Receipt aria-hidden className="mt-0.5 size-5 shrink-0 text-green-strong"/>
                <span><strong>Receipt #{entry.r.id}: {entry.r.amount} credits · {assetName(entry.r.asset)}</strong>
                  <span className="block text-[13px] text-navy">{entry.r.permission === "allow-once" ? "With your Parent's one-time yes" : "On your own, inside My Key"} · practice receipt, no real money</span></span>
              </li>
            ) : (
              <li key={`a${entry.id}`} data-testid="child-request-history" className="flex items-start gap-3 rounded-[14px] bg-surface-soft px-3 py-2.5 text-[14px] text-navy-strong">
                {entry.r.status === "pending" ? <Clock3 aria-hidden className="mt-0.5 size-5 shrink-0 text-orange-text"/> : entry.r.status === "declined" || entry.r.status === "stale" ? <XCircle aria-hidden className="mt-0.5 size-5 shrink-0 text-ink-2"/> : <CheckCircle2 aria-hidden className="mt-0.5 size-5 shrink-0 text-lavender"/>}
                <span><strong>Ask #{entry.r.id}: {entry.r.amount} credits · {assetName(entry.r.asset)}</strong>
                  <span className="block text-[13px] text-navy">{STATUS[entry.r.status]}</span></span>
              </li>
            ))}
          </ol>
        ) : <p className="mt-2 text-[14px] text-ink-2">Nothing yet. Your first practice choice creates a receipt here.</p>}
        {p.requests.length ? <Link href="/try/outcome" className="mt-2 inline-flex min-h-11 items-center gap-1 text-[14px] font-bold text-family-action">See the latest result<ArrowRight aria-hidden className="size-4"/></Link> : null}
      </section>
    </div>
  );
}

/** The imaginary-USD paper book of real company names. Never summed with pretend credits. */
export function PaperPortfolioScreen() {
  const { market } = useRealMarketPractice();
  const m = summarizeRealMarket(market);
  const name = (id: string) => REAL_COMPANY_RESEARCH.find(c => c.id === id);
  return (
    <div className="space-y-5" data-testid="paper-portfolio-screen">
      <PortfolioHeader active="paper"/>
      <section className={panel} aria-label="Paper portfolio summary">
        <h2 className={sectionTitle}>$1,000 of imaginary dollars</h2>
        <dl className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
          <Stat label="Portfolio value" value={m.equityCents === null ? "Needs a price" : usd(m.equityCents)} testId="paper-equity"/>
          <Stat label="Imaginary cash" value={usd(m.cashCents)} testId="paper-cash"/>
          <Stat label="Gain or loss now" value={m.unrealizedCents === null ? "Needs a price" : usd(m.unrealizedCents)} testId="paper-unrealized"/>
          <Stat label="Since the start" value={m.changeFromStartCents === null ? "Needs a price" : usd(m.changeFromStartCents)} testId="paper-return"/>
        </dl>
      </section>
      <section className={panel} aria-labelledby="paper-holdings-title">
        <h2 id="paper-holdings-title" className={sectionTitle}>Paper positions</h2>
        {m.holdings.length ? (
          <ul className="mt-3 divide-y divide-line-soft" data-testid="paper-holdings">
            {m.holdings.map(h => (
              <li key={h.id} className="flex min-h-16 items-center gap-3 py-3">
                <Building2 aria-hidden className="size-6 shrink-0 text-blue-strong"/>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-bold text-navy-strong">{name(h.id)?.name} <span className="text-[13px] font-semibold text-ink-2">{name(h.id)?.ticker}</span></span>
                  <span className="block text-[13px] text-ink-2">{(h.sharesHundredths / 100).toFixed(2)} paper shares · cost {usd(h.costBasisCents)}{h.quote ? ` · your price from ${h.quote.asOf}` : ""}</span>
                </span>
                <span className="text-right text-[15px] font-bold text-navy-strong">{h.valueCents === null ? "No price" : usd(h.valueCents)}
                  {h.unrealizedCents !== null ? <span className={`block text-[13px] font-semibold ${h.unrealizedCents < 0 ? "text-loss-text" : h.unrealizedCents > 0 ? "text-green-strong" : "text-ink-2"}`}>{h.unrealizedCents >= 0 ? "+" : ""}{usd(h.unrealizedCents)}</span> : null}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-3 rounded-[16px] bg-surface-soft p-4" data-testid="paper-empty">
            <p className="text-[15px] font-semibold text-navy-strong">No paper positions yet.</p>
            <p className="mt-1 text-[14px] leading-6 text-ink-2">Pick a real company, understand how it earns money, then try a paper trade.</p>
          </div>
        )}
        <Link href="/try/explore/real" className={`mt-4 ${m.holdings.length ? secondaryBtn : primaryBtn}`} data-testid="paper-go-real">
          {m.holdings.length ? "Trade or research more" : "Go to real companies"}<ArrowRight aria-hidden className="size-4"/>
        </Link>
      </section>
      <SourcesNote>
        <p>Paper dollars are imaginary. There is no brokerage, account, order or payment, and nothing is saved after you close the tab.</p>
        <p>Prices are the ones you typed in yourself, with the date you gave. They are not verified and are not live.</p>
        <p>This book is separate from your 100 pretend credits and from My Key. It never changes them, and they are never added together.</p>
      </SourcesNote>
    </div>
  );
}
