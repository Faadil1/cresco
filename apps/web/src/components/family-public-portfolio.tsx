"use client";

import { useState } from "react";
import {
  PRACTICE_ASSETS, evaluatePracticeScenario, remainingCredits,
  type FamilyPracticeState, type PracticeScenario,
} from "@/lib/family-public-practice";

const panel = "rounded-[24px] border border-line-soft bg-surface p-5 shadow-sm md:p-6";
const scenarioLabels: Record<PracticeScenario, string> = {
  base: "Original sample prices",
  downturn: "Hypothetical downturn",
  mixed: "Hypothetical mixed market",
};
const explanation: Record<PracticeScenario, string> = {
  base: "Baseline uses the fixed original prices shown in Explore. It is not today's market value.",
  downturn: "Example only: ORC -30%, MKT -10% and BKT -15%. This is not a prediction.",
  mixed: "Example only: ORC +10%, MKT -20% and BKT +2%. Different assets can move differently.",
};
const asCredits = (value: number) => value.toFixed(2);

export function FamilyPracticePortfolio({ state }: { state: FamilyPracticeState }) {
  const [scenario, setScenario] = useState<PracticeScenario>("base");
  const result = evaluatePracticeScenario(state, scenario);
  const delta = result.hypothetical - result.original;

  return (
    <section aria-labelledby="portfolio-title" className="space-y-4">
      <header>
        <p className="cresco-section-kicker">Child · Practice portfolio</p>
        <h2 id="portfolio-title" className="mt-2 font-display text-[34px] text-navy-strong">
          See where your choices led.
        </h2>
        <p className="mt-2 text-[13px] leading-6 text-ink-2">
          No real purchases, shares, quotes or returns. Explore how allocation and
          hypothetical losses change a fictional portfolio without changing its balance.
        </p>
      </header>
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Available credits", value: String(remainingCredits(state)), testId: "portfolio-available" },
          { label: "Set aside for your goal", value: String(state.saved) },
          { label: "Used for practice holdings", value: String(state.spent) },
        ].map(item => (
          <div key={item.label} className={panel}>
            <p className="text-[12px] font-semibold text-ink-2">{item.label}</p>
            <p className="mt-2 font-display text-[32px] text-navy-strong" data-testid={item.testId}>{item.value}</p>
          </div>
        ))}
      </div>

      <article className={panel}>
        <h3 className="text-[19px] font-bold text-navy-strong">Allocation by practice cost</h3>
        <p className="mt-1 text-[12px] leading-5 text-ink-2">
          Weight is based on credits assigned to each fictional holding, not market performance.
        </p>
        <ul className="mt-4 space-y-4" aria-label="Practice portfolio allocation">
          {PRACTICE_ASSETS.map(a => {
            const item = result.assets.find(x => x.code === a.code)!;
            return (
              <li key={a.code}>
                <div className="flex flex-wrap items-center justify-between gap-2 text-[13px]">
                  <span className="font-semibold text-navy-strong">{a.name} ({a.code})</span>
                  <span className="text-ink-2">{asCredits(item.cost)} credits · {(item.weight * 100).toFixed(0)}%</span>
                </div>
                <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-surface-soft" role="progressbar"
                  aria-label={a.code + " portfolio weight"} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(item.weight * 100)}>
                  <div className="h-full rounded-full bg-green-strong" style={{ width: `${item.weight * 100}%` }} />
                </div>
                <p className="mt-1 text-[11px] text-ink-3">{state.holdings[a.code].toFixed(2)} pretend shares · {a.category}</p>
              </li>
            );
          })}
        </ul>
        {state.spent === 0 ? <p className="mt-4 text-[13px] text-ink-2">Your practice portfolio is empty. The first choice will create an allocation and a receipt.</p> : null}
      </article>

      <article className={panel}>
        <h3 className="text-[19px] font-bold text-navy-strong">What if sample prices changed?</h3>
        <p className="mt-1 text-[12px] leading-6 text-ink-2">
          Compare predefined teaching scenarios. These are invented percentages, not real prices,
          historical performance, investment forecasts or recommendations.
        </p>
        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Portfolio teaching scenarios">
          {(Object.keys(scenarioLabels) as PracticeScenario[]).map(id => (
            <button type="button" key={id} onClick={() => setScenario(id)} aria-pressed={scenario === id}
              className={`rounded-full border px-4 py-2.5 text-[12px] font-bold ${scenario === id ? "border-green-strong bg-green-soft text-green-strong" : "border-line text-navy-strong"}`}>
              {scenarioLabels[id]}
            </button>
          ))}
        </div>
        <p className="mt-3 text-[12px] leading-6 text-ink-2">{explanation[scenario]}</p>
        <dl className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-[14px] bg-surface-soft p-3">
            <dt className="text-[11px] text-ink-2">Practice cost</dt>
            <dd className="mt-1 font-display text-[25px] text-navy-strong">{asCredits(result.original)}</dd>
          </div>
          <div className="rounded-[14px] bg-surface-soft p-3">
            <dt className="text-[11px] text-ink-2">Hypothetical value</dt>
            <dd className="mt-1 font-display text-[25px] text-navy-strong" data-testid="scenario-hypothetical">{asCredits(result.hypothetical)}</dd>
          </div>
          <div className="rounded-[14px] bg-surface-soft p-3">
            <dt className="text-[11px] text-ink-2">Hypothetical change</dt>
            <dd className="mt-1 font-display text-[25px] text-navy-strong" data-testid="scenario-delta">{delta >= 0 ? "+" : ""}{asCredits(delta)}</dd>
          </div>
        </dl>
        <p className="mt-3 text-[12px] font-semibold text-navy-strong">
          Your actual fictional credits and recorded practice receipts do not change when you switch scenarios.
        </p>
      </article>

      <article className={panel}>
        <h3 className="text-[19px] font-bold text-navy-strong">Practice receipts</h3>
        {state.receipts.length ? (
          <ul className="mt-3 space-y-2">{state.receipts.map(receipt => (
            <li key={receipt.id} className="rounded-[12px] bg-green-soft p-3 text-[13px]">
              <strong>{receipt.amount} credits · {receipt.asset}</strong> · {receipt.permission === "allow-once" ? "Exact Parent exception used" : "Within standing Key"}
              <span className="mt-1 block text-[11px] font-semibold">PRACTICE ONLY - NOT EXECUTED ONCHAIN</span>
            </li>
          ))}</ul>
        ) : <p className="mt-3 text-[13px] text-ink-2">No practice receipts yet. Explore and make a fictional choice.</p>}
      </article>
    </section>
  );
}
