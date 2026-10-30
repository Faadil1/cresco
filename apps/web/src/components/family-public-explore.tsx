"use client";

import { useMemo, useRef, useState } from "react";
import { BookOpen, CheckCircle2, Compass, Search, ShieldAlert } from "lucide-react";
import {
  FAMILY_EXPLORE_CASES, filterFamilyExploreCases, sampleTrendPath,
  type FamilyExploreCase,
} from "@/lib/family-public-explore-data";
import {
  PRACTICE_ASSETS, remainingCredits,
  type AssetCode, type FamilyPracticeState,
} from "@/lib/family-public-practice";

const panel = "rounded-[24px] border border-line-soft bg-surface p-5 shadow-sm md:p-6";
const primary = "min-h-11 rounded-full bg-green-strong px-5 py-3 text-[13px] font-bold text-white hover:bg-green disabled:opacity-50";
const secondary = "min-h-11 rounded-full border border-line bg-surface px-5 py-3 text-[13px] font-bold text-navy-strong hover:bg-green-soft disabled:opacity-50";
const categories = ["All", "Technology", "Consumer", "Funds", "Services", "Energy", "Health"] as const;
type Category = (typeof categories)[number];

function TeachingTrend({ item }: { item: FamilyExploreCase }) {
  const values = item.examplePath;
  const direction = values[values.length - 1] - values[0];
  return (
    <figure className="mt-3 rounded-[16px] border border-line-soft bg-surface-soft px-3 py-2">
      <svg viewBox="0 0 320 112" role="img" aria-label={`Invented eight-point example trend for ${item.name}; ${direction > 0 ? "ends higher" : direction < 0 ? "ends lower" : "ends unchanged"} relative to its invented starting value`}
        className="h-[88px] w-full" preserveAspectRatio="none">
        {[30, 60, 90].map(y => <path key={y} d={`M0 ${y} H320`} stroke="currentColor" opacity=".12" strokeDasharray="3 5"/>)}
        <path d={sampleTrendPath(values, 320, 112)} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-green-strong"/>
      </svg>
      <figcaption className="text-[11px] leading-5 text-ink-2">
        Invented 8-step line for discussion only. No real price, date, trend history or forecast.
      </figcaption>
    </figure>
  );
}

export function FamilyPublicExplore({ state, buy, save }: {
  state: FamilyPracticeState;
  buy: (asset: AssetCode, amount: number) => void;
  save: () => void;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category>("All");
  const [selectedId, setSelectedId] = useState("orchard");
  const researchRef = useRef<HTMLElement>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [amounts, setAmounts] = useState<Record<AssetCode, string>>({ ORC: "10", MKT: "25", BKT: "20" });
  const cases = useMemo(() => filterFamilyExploreCases(query, category), [query, category]);
  const selected = FAMILY_EXPLORE_CASES.find(item => item.id === selectedId)!;
  const comparison = compareIds.map(id => FAMILY_EXPLORE_CASES.find(item => item.id === id)!);

  const toggleCompare = (id: string) => {
    setCompareIds(previous => previous.includes(id) ? previous.filter(value => value !== id) :
      previous.length < 2 ? [...previous, id] : [previous[1], id]);
  };

  return (
    <section aria-labelledby="explore-title" className="space-y-4" data-testid="family-research-explore">
      <header>
        <p className="cresco-section-kicker">Child · Explore and Practice</p>
        <h2 id="explore-title" className="mt-2 font-display text-[34px] text-navy-strong">Investigate before you decide.</h2>
        <p className="mt-2 text-[13px] leading-6 text-ink-2">
          Explore six completely invented businesses and funds. Compare how they work, ask a question
          about risk, then try an eligible choice with pretend credits. These are not real securities,
          quotes or recommendations.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <label className="relative block">
          <span className="sr-only">Search fictional research examples</span>
          <Search aria-hidden className="pointer-events-none absolute left-3 top-3.5 size-5 text-ink-2"/>
          <input type="search" aria-label="Search fictional research examples" value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Search by company, sector or question"
            className="min-h-12 w-full rounded-[14px] border border-line bg-surface py-3 pl-11 pr-4 text-[14px] text-navy-strong"/>
        </label>
        <button className={secondary} type="button" onClick={save} disabled={remainingCredits(state) < 20}>
          Set aside 20 practice credits
        </button>
      </div>
      <div role="group" aria-label="Filter fictional research sectors" className="flex flex-wrap gap-2">
        {categories.map(item => <button type="button" key={item} aria-pressed={category === item}
          className={`min-h-10 rounded-full border px-3.5 py-2 text-[12px] font-bold ${category === item ? "border-green-strong bg-green-soft text-green-strong" : "border-line bg-surface text-navy-strong"}`}
          onClick={() => setCategory(item)}>{item}</button>)}
      </div>
      <p className="text-[12px] text-ink-2" aria-live="polite">{cases.length} fictional research {cases.length === 1 ? "example" : "examples"} shown · {compareIds.length}/2 selected to compare.</p>

      {cases.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cases.map(item => {
          const practice = item.practiceCode ? PRACTICE_ASSETS.find(a => a.code === item.practiceCode) : undefined;
          return <article key={item.id} className={panel}>
            <p className="text-[11px] font-bold uppercase tracking-wider text-green-strong">{item.category} · Fictional case</p>
            <h3 className="mt-2 min-h-[2.7rem] text-[19px] font-bold leading-6 text-navy-strong">{item.name}</h3>
            <p className="mt-2 text-[12px] leading-5 text-ink-2">{item.model}</p>
            <TeachingTrend item={item}/>
            <p className="mt-2 text-[12px] leading-6 text-navy"><strong>One key risk: </strong>{item.uncertainty}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" className={secondary} onClick={() => { setSelectedId(item.id); researchRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
                aria-label={`Research ${item.name}`}>Research</button>
              <button type="button" className={secondary} aria-pressed={compareIds.includes(item.id)}
                onClick={() => toggleCompare(item.id)} aria-label={`Compare ${item.name}`}>
                {compareIds.includes(item.id) ? "Selected to compare" : "Compare"}
              </button>
            </div>
            {practice ? <>
              <p className="mt-4 text-[12px] text-ink-2">
                Fictional practice price: <strong>{practice.price} credits per example unit</strong>
              </p>
              <label htmlFor={`amount-${practice.code}`} className="mt-2 block text-[12px] font-bold text-navy-strong">
                Practice amount (whole credits)
              </label>
              <input id={`amount-${practice.code}`} type="number" min="1" max="100" step="1" inputMode="numeric"
                value={amounts[practice.code]}
                onChange={event => setAmounts(previous => ({ ...previous, [practice.code]: event.target.value }))}
                className="mt-1 min-h-11 w-full rounded-[12px] border border-line bg-surface px-3 py-2 text-[14px] text-navy-strong"/>
              <button className={`mt-3 w-full ${primary}`} type="button"
                onClick={() => buy(practice.code, Number(amounts[practice.code]))}>
                Practice {practice.code} choice
              </button>
            </> : <p className="mt-4 rounded-[12px] bg-yellow-soft p-3 text-[12px] text-navy-strong">
              <ShieldAlert aria-hidden className="mr-1 inline size-4"/> Research only. No practice purchase is offered for this example.
            </p>}
          </article>;
        })}
      </div> : <p className={`${panel} text-[13px] text-ink-2`}>No matching fictional examples. Change your search or select All.</p>}

      {compareIds.length === 2 ? (
        <section className={panel} aria-label="Side-by-side example comparison">
          <h3 className="text-[20px] font-bold text-navy-strong">Compare two business questions</h3>
          <p className="mt-1 text-[12px] text-ink-2">This is a learning comparison, not a ranking or investment recommendation.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {comparison.map(item => <div key={item.id} className="rounded-[15px] border border-line p-4">
              <h4 className="text-[16px] font-bold text-navy-strong">{item.name}</h4>
              <p className="mt-2 text-[12px] leading-5 text-navy"><strong>How it earns: </strong>{item.model}</p>
              <p className="mt-2 text-[12px] leading-5 text-navy"><strong>What could go wrong: </strong>{item.uncertainty}</p>
              <p className="mt-2 text-[12px] leading-5 text-navy"><strong>Ask: </strong>{item.researchPrompt}</p>
            </div>)}
          </div>
          <button type="button" className={`mt-3 ${secondary}`} onClick={() => setCompareIds([])}>Clear comparison</button>
        </section>
      ) : null}

      <section ref={researchRef} className={panel} aria-labelledby="research-detail-title">
        <p className="cresco-section-kicker"><Compass aria-hidden className="mr-1 inline size-4"/> Research desk · Invented scenario</p>
        <h3 id="research-detail-title" className="mt-2 font-display text-[29px] text-navy-strong">{selected.name}</h3>
        <p className="mt-1 text-[12px] text-ink-2">Select Research on any card to learn how the example works.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <h4 className="text-[15px] font-bold text-navy-strong">What does it do?</h4>
            <p className="mt-1 text-[13px] leading-6 text-navy">{selected.model}</p>
            <h4 className="mt-3 text-[15px] font-bold text-navy-strong">Who is the customer?</h4>
            <p className="mt-1 text-[13px] leading-6 text-navy">{selected.customer}</p>
            <h4 className="mt-3 text-[15px] font-bold text-navy-strong">What could work?</h4>
            <p className="mt-1 text-[13px] leading-6 text-navy">{selected.opportunity}</p>
          </div>
          <div>
            <h4 className="text-[15px] font-bold text-navy-strong">What might go wrong?</h4>
            <p className="mt-1 text-[13px] leading-6 text-navy">{selected.uncertainty}</p>
            <div className="mt-3 rounded-[16px] bg-green-soft p-4">
              <h4 className="text-[13px] font-bold text-navy-strong"><BookOpen aria-hidden className="mr-1 inline size-4"/> An investor's research question</h4>
              <p className="mt-2 text-[13px] leading-6 text-navy">{selected.researchPrompt}</p>
            </div>
          </div>
        </div>
        <fieldset className="mt-5">
          <legend className="text-[14px] font-bold text-navy-strong">{selected.question}</legend>
          <div className="mt-3 grid gap-2">
            {selected.answers.map((answer, index) => <button type="button" key={answer}
              aria-pressed={answers[selected.id] === index}
              className={`min-h-11 rounded-[12px] border p-3 text-left text-[13px] font-semibold ${answers[selected.id] === index ? "border-green-strong bg-green-soft text-navy-strong" : "border-line bg-surface text-ink-2"}`}
              onClick={() => setAnswers(previous => ({ ...previous, [selected.id]: index }))}>
              {answer}
            </button>)}
          </div>
        </fieldset>
        {answers[selected.id] !== undefined ? (
          <p aria-live="polite" className="mt-3 rounded-[12px] bg-surface-soft p-3 text-[13px] leading-6 text-navy-strong">
            {answers[selected.id] === selected.correctAnswer ?
              <><CheckCircle2 aria-hidden className="mr-1 inline size-4 text-green-strong"/>Good research question. {selected.lesson}</> :
              "Not quite. Read how this fictional business earns money and what might affect it, then try again."}
          </p>
        ) : null}
        <p className="mt-3 text-[11px] leading-5 text-ink-3">
          Educational exercise. This quiz neither grants financial authority nor changes your Family Key, credits or permissions.
        </p>
      </section>

      <aside className={panel}>
        <h3 className="text-[17px] font-bold text-navy-strong">Your standing practice boundaries</h3>
        <p className="mt-2 text-[13px] leading-6 text-ink-2">
          Per action: <strong>{state.key.maxPerAction} pretend credits</strong> ·
          Practice period remaining: <strong>{Math.max(0, state.key.maxPeriod - state.spent)} credits</strong> ·
          Allowed: <strong>{state.key.allowed.join(", ")}</strong>.
        </p>
        <p className="mt-2 text-[12px] text-ink-3">
          An eligible choice inside the Key is independent. Outside, it is blocked for the simulated Parent to review.
          Research-only cases never create requests or receipts.
        </p>
      </aside>
    </section>
  );
}
