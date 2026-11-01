"use client";

/**
 * Portfolio destination, after the original Cresco /portfolio: one summary
 * card, holdings, a what-if, then asks and receipts. Practice only: invented
 * prices, fictional credits, goal savings kept apart from practice choices.
 */
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, ChevronRight, PiggyBank, Receipt, Sprout } from "lucide-react";
import { useFamilyStory } from "@/components/family-story-provider";
import { CompanyArt, panel, primaryBtn } from "@/components/family-story-ui";
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
const allocationTone = { ORC: "bg-blue-strong", MKT: "bg-green-soft", BKT: "bg-yellow-strong" } as const;

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
  return (
    <div className="space-y-4 md:space-y-5" data-testid="portfolio-screen">
      <header>
        <h1 className="font-display text-[26px] leading-tight text-navy-strong md:text-[32px]">My practice portfolio</h1>
        <p className="text-[13px] text-ink-2">Pretend credits and invented companies. Nothing here is real money or a real share.</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-[24px] bg-gradient-to-br from-green-strong to-green p-5 text-white shadow-soft" aria-label="Practice summary" data-testid="portfolio-summary">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-wider text-white/80">Invested in fictional holdings · cost</p>
              <p className="mt-1 text-[36px] font-extrabold leading-none" data-testid="portfolio-spent">{p.spent}<span className="ml-1 text-[15px] font-semibold">credits</span></p>
              <p className="mt-2 text-[13px] text-white/85">{p.receipts.length} receipt{p.receipts.length === 1 ? "" : "s"} · {held.length} holding{held.length === 1 ? "" : "s"}</p>
            </div>
            <Sprout aria-hidden className="size-12 text-white/80"/>
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-2 text-[12px]">
            <div className="rounded-[14px] bg-white/15 p-3"><dt className="text-white/80">Free to use</dt><dd className="text-[20px] font-extrabold" data-testid="portfolio-available">{remainingCredits(p)}</dd></div>
            <div className="rounded-[14px] bg-white/15 p-3"><dt className="text-white/80">Set aside for {goal.label.toLowerCase()}</dt><dd className="text-[20px] font-extrabold">{p.saved}/{goal.target}</dd></div>
          </dl>
          <div className="mt-4" data-testid="portfolio-allocation" aria-label="How 100 pretend credits are used">
            <div className="flex h-3 overflow-hidden rounded-full bg-white/20" role="img"
              aria-label={`${p.saved} saved, ${p.spent} invested in practice, ${remainingCredits(p)} available out of 100 fictional credits`}>
              <span className="bg-yellow-strong" style={{ width: `${p.saved}%` }}/>
              <span className="bg-white" style={{ width: `${p.spent}%` }}/>
              <span className="bg-white/35" style={{ width: `${remainingCredits(p)}%` }}/>
            </div>
            <p className="mt-2 text-[11px] leading-5 text-white/90">Out of 100: {p.saved} saved · {p.spent} invested · {remainingCredits(p)} available</p>
          </div>
          <p className="mt-3 text-[11px] font-bold tracking-wide text-white/85">PRACTICE ONLY - NOT EXECUTED ONCHAIN</p>
        </section>

        <section className={`${panel} !p-4`} aria-labelledby="savings-title">
          <h2 id="savings-title" className="flex items-center gap-2 text-[15px] font-extrabold text-navy-strong"><PiggyBank aria-hidden className="size-5 text-green-strong"/>Savings stay separate</h2>
          <p className="mt-1 text-[13px] leading-5 text-navy">Credits you set aside for your {goal.label.toLowerCase()} never move with practice prices. Only practice choices do.</p>
          <Link href="/try/home" className="mt-2 inline-flex min-h-11 items-center gap-0.5 text-[13px] font-bold text-family-action">Set aside from Home<ChevronRight aria-hidden className="size-4"/></Link>
        </section>
      </div>

      <section aria-labelledby="holdings-title" className={panel}>
        <h2 id="holdings-title" className="text-[18px] font-extrabold text-navy-strong">My fictional positions</h2>
        <p className="mt-1 text-[13px] leading-5 text-ink-2">Units, amount invested, weight and scenario value. Prices here are invented, not a live feed.</p>
        {held.length ? (
          <>
          <ul className="mt-3 divide-y divide-line-soft" aria-label="Practice holdings">
            {held.map(asset => {
              const item = FAMILY_EXPLORE_CASES.find(c => c.practiceCode === asset.code)!;
              return (
                <li key={asset.code}>
                  <Link href={`/try/explore/${item.id}`} className="flex min-h-16 items-center gap-3 py-2">
                    <CompanyArt id={item.id} name={asset.name} className="h-12 w-14 shrink-0 overflow-hidden rounded-[10px]"/>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px] font-bold text-navy-strong">{asset.name}</span>
                      <span className="block text-[12px] text-ink-2">{p.holdings[asset.code].toFixed(2)} pretend units · {Math.round(asset.weight * 100)}% allocation</span>
                      <span className="mt-1 block text-[11px] text-ink-2">Cost {fmt(asset.cost)} · Change {asset.hypothetical >= asset.cost ? "+" : ""}{fmt(asset.hypothetical - asset.cost)} credits</span>
                    </span>
                    <span className="text-right text-[14px] font-bold text-navy-strong">{fmt(asset.hypothetical)}<span className="block text-[11px] font-normal text-ink-2">{scenario === "base" ? "sample value" : "scenario value"}</span></span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="mt-3 space-y-2" data-testid="portfolio-weights">
            <div className="flex h-3 overflow-hidden rounded-full bg-surface-soft" role="img"
              aria-label={`Fictional portfolio allocation: ${held.map(asset => `${asset.name} ${Math.round(asset.weight * 100)} percent`).join(", ")}`}>
              {held.map(asset => (
                <span key={asset.code} className={allocationTone[asset.code]} style={{ width: `${100 * asset.weight}%` }}/>
              ))}
            </div>
            <p className="text-[12px] leading-5 text-ink-2">
              {Math.round(Math.max(...held.map(asset => asset.weight)) * 100)}% in the largest position.
              {held.length === 1 ? " One company means all of your invested practice credits depend on that one fictional company." : " Diversifying can change concentration, but not eliminate risk."}
            </p>
          </div>
          </>
        ) : (
          <div className="mt-2 rounded-[18px] bg-surface-soft p-4" data-testid="portfolio-empty">
            <p className="text-[14px] font-semibold text-navy-strong">No practice holdings yet.</p>
            <p className="mt-1 text-[13px] leading-5 text-ink-2">Meet a fictional person in Explore, then try a small choice inside your Key. It will appear here with a receipt.</p>
            <Link href={mission.href.startsWith("/try/explore") ? mission.href : "/try/explore"} className={`mt-3 ${primaryBtn}`}>Go to Explore<ArrowRight aria-hidden className="size-4"/></Link>
            <button type="button" className="ml-0 mt-2 block min-h-11 text-left text-[13px] font-bold text-family-action underline underline-offset-4"
              aria-expanded={showSample} onClick={() => setShowSample(!showSample)} data-testid="portfolio-example-toggle">
              {showSample ? "Hide sample portfolio" : "See how a sample portfolio works"}
            </button>
            {showSample ? (
              <section className="mt-3 rounded-[18px] border border-yellow/50 bg-yellow-soft p-4" data-testid="portfolio-example">
                <p className="text-[11px] font-bold uppercase tracking-wider text-orange-text">Guided example — not your holdings</p>
                <h3 className="mt-1 text-[17px] font-extrabold text-navy-strong">Three pretend positions · 60 fictional credits</h3>
                <p className="mt-1 text-[13px] leading-5 text-navy">Imagine investing 20 credits in each of three invented assets. Their cost totals 60. This preview cannot spend your credits or approve a choice.</p>
                <div role="group" aria-label="Sample portfolio scenarios" className="mt-3 flex flex-wrap gap-2">
                  {SCENARIOS.map(choice => (
                    <button key={choice.id} type="button" aria-pressed={scenario === choice.id}
                      onClick={() => setScenario(choice.id)}
                      className={`min-h-10 rounded-full border px-3 text-[12px] font-bold ${scenario === choice.id ? "border-family-action bg-surface text-family-action" : "border-line bg-surface-soft text-navy-strong"}`}>
                      {choice.label}
                    </button>
                  ))}
                </div>
                <ul className="mt-3 space-y-2" aria-label="Example fictional holdings">
                  {example.assets.map(asset => (
                    <li key={asset.code} className="grid grid-cols-[1fr_auto] gap-2 rounded-[12px] bg-surface p-3 text-[12px] text-navy-strong">
                      <span><strong className="block">{asset.name}</strong><span>{fmt(asset.cost)} invested · 33% of sample</span></span>
                      <span className="text-right"><strong className="block">{fmt(asset.hypothetical)}</strong><span>scenario value</span></span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-[14px] font-semibold text-navy-strong" data-testid="example-scenario-total">
                  Sample total: {fmt(example.original)} invested → {fmt(example.hypothetical)} scenario value.
                </p>
                <p className="mt-1 text-[12px] leading-5 text-ink-2">Illustrative fixed prices, not market data. Your real practice balance and My Key remain unchanged.</p>
              </section>
            ) : null}
          </div>
        )}
      </section>

      {p.spent > 0 ? (
        <section aria-labelledby="whatif-title" className={panel} data-testid="portfolio-what-if">
          <h2 id="whatif-title" className="text-[18px] font-extrabold text-navy-strong">Revalue my practice portfolio</h2>
          <p className="mt-1 text-[13px] leading-5 text-ink-2">Switch between fixed fictional price scenarios. The values shown above update too; transactions and cash never change.</p>
          <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Portfolio teaching scenarios">
            {SCENARIOS.map(s => (
              <button key={s.id} type="button" aria-pressed={scenario === s.id} onClick={() => setScenario(s.id)}
                className={`min-h-11 rounded-full border px-4 text-[13px] font-bold ${scenario === s.id ? "border-family-action bg-family-action-soft text-family-action" : "border-line bg-surface text-navy-strong"}`}>{s.label}</button>
            ))}
          </div>
          <p className="mt-3 text-[14px] leading-6 text-navy">
            Your {fmt(result.original)} practice credits would be worth about <strong data-testid="scenario-hypothetical">{fmt(result.hypothetical)}</strong>
            {" "}(<strong>{delta >= 0 ? "+" : ""}{fmt(delta)}</strong>). Your {p.saved} saved credits do not move.
          </p>
          <p className="mt-1 text-[12px] text-ink-3">{SCENARIOS.find(s => s.id === scenario)!.explain} Receipts and credits never change here.</p>
        </section>
      ) : null}

      {p.requests.length ? (
        <section aria-labelledby="asks-title" className={panel} data-testid="child-request-history">
          <h2 id="asks-title" className="text-[18px] font-extrabold text-navy-strong">Asks sent to my Parent</h2>
          <ul className="mt-2 space-y-2">
            {p.requests.map(r => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-[14px] bg-surface-soft px-3 py-2 text-[13px]">
                <span><strong className="text-navy-strong">#{r.id} · {r.amount} credits · {PRACTICE_ASSETS.find(a => a.code === r.asset)?.name}</strong></span>
                <span className="text-ink-2">{STATUS[r.status]}</span>
              </li>
            ))}
          </ul>
          <Link href="/try/outcome" className="mt-2 inline-flex min-h-11 items-center gap-0.5 text-[13px] font-bold text-family-action">See the latest result<ChevronRight aria-hidden className="size-4"/></Link>
        </section>
      ) : null}

      <section aria-labelledby="receipts-title" className={panel}>
        <h2 id="receipts-title" className="flex items-center gap-2 text-[18px] font-extrabold text-navy-strong"><Receipt aria-hidden className="size-5 text-green-strong"/>Practice receipts</h2>
        {p.receipts.length ? (
          <ul className="mt-2 space-y-2" data-testid="portfolio-receipts">
            {p.receipts.map(r => (
              <li key={r.id} className="rounded-[14px] bg-green-soft px-3 py-2 text-[13px] text-navy-strong">
                <strong>Receipt #{r.id}: {r.amount} credits · {r.asset}</strong> · {r.permission === "allow-once" ? "Parent's one-time approval" : "Inside My Key"}
                <span className="block text-[11px] font-semibold">PRACTICE ONLY - NOT EXECUTED ONCHAIN</span>
              </li>
            ))}
          </ul>
        ) : <p className="mt-2 text-[13px] text-ink-2">No receipts yet. Your first practice choice creates one.</p>}
      </section>
    </div>
  );
}
