"use client";

import { useReducer, useState } from "react";
import {
  ArrowRight, BookOpen, CheckCircle2, Compass, Home, KeyRound,
  RotateCcw, ShieldCheck, Sprout, Users, Wallet,
} from "lucide-react";
import {
  CHILD_LEARNING, PARENT_LEARNING, PRACTICE_ASSETS,
  initialFamilyPractice, remainingCredits, remainingPeriod, transitionFamilyPractice,
  type AssetCode, type FamilyPracticeState, type FamilyRole,
} from "@/lib/family-public-practice";

type ChildTab = "home" | "learn" | "explore" | "portfolio" | "key";
type ParentTab = "overview" | "learn" | "key" | "requests" | "together";
const childTabs: { id: ChildTab; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "learn", label: "Learn", icon: BookOpen },
  { id: "explore", label: "Explore", icon: Compass },
  { id: "portfolio", label: "Portfolio", icon: Wallet },
  { id: "key", label: "My Key", icon: KeyRound },
];
const parentTabs: { id: ParentTab; label: string; icon: typeof Home }[] = [
  { id: "overview", label: "Overview", icon: Home },
  { id: "learn", label: "Learn", icon: BookOpen },
  { id: "key", label: "My Key", icon: KeyRound },
  { id: "requests", label: "Requests", icon: ShieldCheck },
  { id: "together", label: "Learn Together", icon: Users },
];
const panel = "rounded-[24px] border border-line-soft bg-surface p-5 shadow-sm md:p-6";
const small = "text-[13px] leading-6 text-ink-2";
const primary = "rounded-full bg-green-strong px-5 py-3 text-[13px] font-bold text-white hover:bg-green disabled:opacity-50";
const secondary = "rounded-full border border-line bg-surface px-5 py-3 text-[13px] font-bold text-navy-strong hover:bg-green-soft disabled:opacity-50";

function LearningPath({ role, state, complete }: {
  role: FamilyRole;
  state: FamilyPracticeState;
  complete: (id: string) => void;
}) {
  const lessons = role === "parent" ? PARENT_LEARNING : CHILD_LEARNING;
  const done = role === "parent" ? state.parentCompleted : state.childCompleted;
  const [active, setActive] = useState<string | null>(null);
  const [answer, setAnswer] = useState<number | null>(null);
  const lesson = lessons.find(l => l.id === active);
  return (
    <section aria-labelledby="learning-title" className="space-y-4">
      <div>
        <p className="cresco-section-kicker">{role === "parent" ? "Parent Learning Path" : "Child Learning Path"}</p>
        <h2 id="learning-title" className="mt-2 font-display text-[32px] text-navy-strong">Learn at your own pace</h2>
        <p className={small}>Progress: {done.length} of {lessons.length} modules · Short lessons, practical examples, no financial authority.</p>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-green-soft" role="progressbar" aria-label={role + " learning progress"} aria-valuenow={done.length} aria-valuemin={0} aria-valuemax={lessons.length}>
        <div className="h-full rounded-full bg-green-strong" style={{ width: `${100 * done.length / lessons.length}%` }} />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {lessons.map((item, index) => (
          <button
            key={item.id} type="button"
            aria-pressed={active === item.id}
            onClick={() => { setActive(item.id); setAnswer(null); }}
            className="rounded-[18px] border border-line bg-surface p-4 text-left transition hover:border-green"
          >
            <span className="flex items-center justify-between gap-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-green-strong">Lesson {index + 1} · {item.minutes} min</span>
              {done.includes(item.id) ? <CheckCircle2 aria-label="Completed" className="size-5 text-green-strong" /> : <BookOpen aria-hidden className="size-5 text-ink-3" />}
            </span>
            <span className="mt-2 block text-[17px] font-bold text-navy-strong">{item.title}</span>
            <span className="mt-1 block text-[12px] text-ink-2">{active === item.id ? "Selected" : done.includes(item.id) ? "Completed · Review" : "Start lesson"}</span>
          </button>
        ))}
      </div>
      {lesson ? (
        <article className={panel} aria-label={lesson.title + " lesson"}>
          <p className="cresco-section-kicker">Interactive lesson</p>
          <h3 className="mt-2 font-display text-[29px] text-navy-strong">{lesson.title}</h3>
          <p className="mt-3 text-[15px] leading-7 text-navy">{lesson.concept}</p>
          <fieldset className="mt-5 space-y-2">
            <legend className="mb-3 text-[15px] font-bold text-navy-strong">{lesson.question}</legend>
            {lesson.choices.map((choice, i) => (
              <button key={choice} type="button" aria-pressed={answer === i}
                className={`block w-full rounded-[12px] border p-3 text-left text-[13px] font-semibold ${answer === i ? "border-green-strong bg-green-soft text-navy-strong" : "border-line bg-surface text-ink-2"}`}
                onClick={() => setAnswer(i)}>{choice}</button>
            ))}
          </fieldset>
          {answer !== null ? (
            <p className="mt-3 text-[13px] font-semibold text-navy-strong" role="status">
              {answer === lesson.answer ? "Correct. " + lesson.explanation : "Not quite. Consider the lesson and try another answer."}
            </p>
          ) : null}
          <button type="button" className={`mt-5 ${primary}`} disabled={answer !== lesson.answer || done.includes(lesson.id)}
            onClick={() => complete(lesson.id)}>
            {done.includes(lesson.id) ? "Lesson completed" : "Complete lesson"}
          </button>
        </article>
      ) : (
        <p className="rounded-[15px] bg-green-soft p-4 text-[13px] text-green-strong">Select a lesson to learn, answer a question and earn your progress.</p>
      )}
      <p className="text-[12px] text-ink-3">Educational content only. Finishing lessons never changes the practice Key, approval status or access to real financial services.</p>
    </section>
  );
}

function ChildHome({ state, open, save }: { state: FamilyPracticeState; open: (tab: ChildTab) => void; save: () => void }) {
  return (
    <div className="space-y-5">
      <header>
        <p className="cresco-section-kicker">Your journey</p>
        <h2 className="mt-2 font-display text-[clamp(34px,4vw,48px)] leading-tight text-navy-strong">Hey, future explorer.</h2>
        <p className={small}>Grow your knowledge, practice decisions and learn how your family&apos;s Key works.</p>
      </header>
      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="Available credits" value={String(remainingCredits(state))} testId="practice-available" />
        <Metric label="Set aside for a bike" value={String(state.saved)} testId="practice-saved" />
        <Metric label="Child lessons" value={`${state.childCompleted.length}/${CHILD_LEARNING.length}`} />
      </div>
      <div className={panel}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="cresco-section-kicker">Saving goal · Bike</p>
            <h3 className="mt-2 font-display text-[26px] text-navy-strong">Small steps count.</h3>
            <p className={small}>Set aside pretend credits independently. Your balance is fictional.</p>
          </div>
          <button type="button" className={primary} disabled={remainingCredits(state) < 20}
            onClick={save}>Set aside 20 <ArrowRight aria-hidden className="ml-1 inline size-4" /></button>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className={panel}>
          <BookOpen aria-hidden className="size-6 text-green-strong" />
          <h3 className="mt-3 text-[19px] font-bold text-navy-strong">Today&apos;s learning mission</h3>
          <p className={small}>Explore a lesson and answer its question. Your progress stays separate from permissions.</p>
          <button type="button" className={`mt-4 ${secondary}`} onClick={() => open("learn")}>Continue learning</button>
        </div>
        <div className={panel}>
          <Compass aria-hidden className="size-6 text-green-strong" />
          <h3 className="mt-3 text-[19px] font-bold text-navy-strong">Explore and practice</h3>
          <p className={small}>Research three fictional examples and make a decision within your Key.</p>
          <button type="button" className={`mt-4 ${secondary}`} onClick={() => open("explore")}>Explore companies</button>
        </div>
      </div>
      <p className={small}>Learning badges: {state.childCompleted.length} · Parent learning: {state.parentCompleted.length} lessons. {state.togetherCompleted ? "Your family discussion is complete." : "Try Learn Together with your parent."}</p>
    </div>
  );
}
function Metric({ label, value, testId }: { label: string; value: string; testId?: string }) {
  return <div className={panel}><p className="text-[12px] font-semibold text-ink-2">{label}</p><p className="mt-2 font-display text-[33px] text-navy-strong" data-testid={testId}>{value}</p></div>;
}
function KeySummary({ state }: { state: FamilyPracticeState }) {
  return (
    <div className={panel}>
      <p className="cresco-section-kicker">My Key · Practice version {state.key.version}</p>
      <h3 className="mt-2 font-display text-[27px] text-navy-strong">Independence with a boundary.</h3>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-[13px]">
        <div><dt className="text-ink-2">Per action</dt><dd className="font-bold text-navy-strong">{state.key.maxPerAction} credits</dd></div>
        <div><dt className="text-ink-2">Period remaining</dt><dd className="font-bold text-navy-strong">{remainingPeriod(state)} credits</dd></div>
        <div><dt className="text-ink-2">Key version / nonce</dt><dd className="font-bold text-navy-strong">{state.key.version} / {state.key.nonce}</dd></div>
        <div><dt className="text-ink-2">Allowed examples</dt><dd className="font-bold text-navy-strong">{state.key.allowed.join(", ")}</dd></div>
      </dl>
      <p className="mt-4 text-[12px] text-ink-3">Inside these rules, the child practices independently. Outside, the action is blocked pending a simulated Parent decision.</p>
    </div>
  );
}
function Explore({ state, buy, save }: {
  state: FamilyPracticeState;
  buy: (asset: AssetCode, amount: number) => void;
  save: () => void;
}) {
  const [amounts, setAmounts] = useState<Record<AssetCode, string>>({ ORC: "10", MKT: "25", BKT: "20" });
  return (
    <section aria-labelledby="explore-title" className="space-y-4">
      <header>
        <p className="cresco-section-kicker">Child · Explore & Practice</p>
        <h2 id="explore-title" className="mt-2 font-display text-[34px] text-navy-strong">Learn by making choices.</h2>
        <p className={small}>All companies, prices and investments below are fictional examples, not live offers.</p>
      </header>
      <button type="button" className={secondary} disabled={remainingCredits(state) < 20} onClick={save}>
        Set aside 20 practice credits
      </button>
      <div className="grid gap-4 lg:grid-cols-3">
        {PRACTICE_ASSETS.map(a => (
          <article key={a.code} className={panel}>
            <p className="text-[11px] font-bold uppercase tracking-wider text-green-strong">{a.category} · Fictional</p>
            <h3 className="mt-2 text-[19px] font-bold text-navy-strong">{a.name}</h3>
            <p className="mt-1 text-[12px] text-ink-2">{a.code} · Sample price {a.price} credits/share</p>
            <p className={`mt-3 ${small}`}>{a.description}</p>
            <p className="mt-2 text-[12px] text-orange-text">{a.risk}</p>
            <label htmlFor={`amount-${a.code}`} className="mt-4 block text-[12px] font-bold text-navy-strong">Practice amount (whole credits)</label>
            <input id={`amount-${a.code}`} type="number" min="1" max="100" step="1" inputMode="numeric"
              value={amounts[a.code]} onChange={e => setAmounts(v => ({ ...v, [a.code]: e.target.value }))}
              className="mt-1 w-full rounded-[12px] border border-line bg-surface px-3 py-3 text-[15px] text-navy-strong" />
            <button type="button" className={`mt-3 w-full ${primary}`}
              onClick={() => buy(a.code, Number(amounts[a.code]))}>Practice {a.code} choice</button>
          </article>
        ))}
      </div>
      <KeySummary state={state} />
    </section>
  );
}
function Portfolio({ state }: { state: FamilyPracticeState }) {
  return (
    <section aria-labelledby="portfolio-title" className="space-y-4">
      <header>
        <p className="cresco-section-kicker">Practice portfolio</p>
        <h2 id="portfolio-title" className="mt-2 font-display text-[34px] text-navy-strong">See what changed.</h2>
        <p className={small}>No real purchases, shares, market prices or returns. These are fictional practice records.</p>
      </header>
      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="Available" value={String(remainingCredits(state))} testId="portfolio-available" />
        <Metric label="Set aside" value={String(state.saved)} />
        <Metric label="Spent in practice" value={String(state.spent)} />
      </div>
      <div className={panel}>
        <h3 className="text-[19px] font-bold text-navy-strong">Holdings · fictional</h3>
        <ul className="mt-3 space-y-2">
          {PRACTICE_ASSETS.map(a => (
            <li key={a.code} className="flex items-center justify-between rounded-[12px] bg-surface-soft px-4 py-3">
              <span className="text-[13px] text-navy-strong">{a.name}</span>
              <strong className="text-[13px] text-navy-strong">{state.holdings[a.code].toFixed(2)} practice shares</strong>
            </li>
          ))}
        </ul>
      </div>
      <div className={panel}>
        <h3 className="text-[19px] font-bold text-navy-strong">Practice receipts</h3>
        {state.receipts.length ? (
          <ul className="mt-3 space-y-2">{state.receipts.map(r => (
            <li key={r.id} className="rounded-[12px] bg-green-soft p-3 text-[13px]">
              <strong>{r.amount} credits · {r.asset}</strong> · {r.permission === "allow-once" ? "Exact parent exception used" : "Within standing Key"}
              <span className="mt-1 block text-[11px] font-semibold">PRACTICE ONLY — NOT EXECUTED ONCHAIN</span>
            </li>
          ))}</ul>
        ) : <p className={small}>No practice receipts yet. Explore and make a practice choice.</p>}
      </div>
    </section>
  );
}
function ParentKey({ state, update }: {
  state: FamilyPracticeState;
  update: (perAction: number, period: number, allowed: AssetCode[]) => void;
}) {
  const [per, setPer] = useState(String(state.key.maxPerAction));
  const [period, setPeriod] = useState(String(state.key.maxPeriod));
  const [allowed, setAllowed] = useState<AssetCode[]>([...state.key.allowed]);
  return (
    <section aria-labelledby="parent-key-title" className="space-y-4">
      <header><p className="cresco-section-kicker">Parent · Standing Practice Key</p>
        <h2 id="parent-key-title" className="mt-2 font-display text-[34px] text-navy-strong">Set the room to decide.</h2>
        <p className={small}>Only an explicit Parent action changes this fictional standing Key. Lesson completion never does.</p>
      </header>
      <KeySummary state={state} />
      <form className={panel} onSubmit={e => { e.preventDefault(); update(Number(per), Number(period), allowed); }}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-[13px] font-bold text-navy-strong">Max credits per action
            <input aria-label="Max credits per action" className="mt-2 block w-full rounded-xl border border-line p-3" type="number" min="1" max="100" step="1" value={per} onChange={e => setPer(e.target.value)}/>
          </label>
          <label className="text-[13px] font-bold text-navy-strong">Total credits this practice period
            <input aria-label="Total credits this practice period" className="mt-2 block w-full rounded-xl border border-line p-3" type="number" min="1" max="100" step="1" value={period} onChange={e => setPeriod(e.target.value)}/>
          </label>
        </div>
        <fieldset className="mt-4">
          <legend className="text-[13px] font-bold text-navy-strong">Eligible fictional examples</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">{PRACTICE_ASSETS.map(a => (
            <label key={a.code} className="flex items-center gap-2 text-[13px] text-navy">
              <input type="checkbox" checked={allowed.includes(a.code)}
                onChange={e => setAllowed(v => e.target.checked ? [...v, a.code] : v.filter(x => x !== a.code))}/>
              {a.code}
            </label>
          ))}</div>
        </fieldset>
        <button type="submit" className={`mt-5 ${primary}`}>Explicitly update standing Key</button>
        <p className="mt-3 text-[12px] text-ink-3">Changing the Key increments its version and invalidates old pending permissions. This does not affect any real account or wallet.</p>
      </form>
    </section>
  );
}
function Requests({ state, decide }: {
  state: FamilyPracticeState;
  decide: (id: number, choice: "approve" | "decline") => void;
}) {
  return (
    <section aria-labelledby="requests-title" className="space-y-4">
      <header>
        <p className="cresco-section-kicker">Parent · Practice requests</p>
        <h2 id="requests-title" className="mt-2 font-display text-[34px] text-navy-strong">A conversation at the boundary.</h2>
        <p className={small}>A one-time approval is an exact exception, never a change to standing limits.</p>
      </header>
      {state.requests.length === 0 ? <div className={panel}><p className={small}>No requests yet. Switch to Child, Explore and try 25 credits of MKT (above the current 15-credit limit).</p></div> : (
        <ul className="space-y-3">{state.requests.map(r => (
          <li key={r.id} className={panel}>
            <p className="text-[11px] font-bold uppercase tracking-wider text-green-strong">Request #{r.id} · {r.status}</p>
            <h3 className="mt-2 text-[19px] font-bold text-navy-strong">{r.amount} practice credits · {r.asset}</h3>
            <p className={small}>Exact simulated action: buy {r.asset} for {r.amount} credits · Key v{r.version} / nonce {r.nonce}</p>
            {r.status === "pending" ? <div className="mt-4 flex flex-wrap gap-2">
              <button className={primary} type="button" onClick={() => decide(r.id, "approve")}>Approve once #{r.id}</button>
              <button className={secondary} type="button" onClick={() => decide(r.id, "decline")}>Decline #{r.id}</button>
            </div> : null}
            {r.status === "approved-once" ? <p className="mt-3 text-[12px] font-semibold text-green-strong">Switch to Child and retry the exact same amount. This permission is consumed on use.</p> : null}
          </li>
        ))}</ul>
      )}
    </section>
  );
}
function Together({ state, onComplete }: { state: FamilyPracticeState; onComplete: () => void }) {
  return (
    <section aria-labelledby="together-title" className="space-y-4">
      <header><p className="cresco-section-kicker">Parent + Child</p>
        <h2 id="together-title" className="mt-2 font-display text-[34px] text-navy-strong">Learn together, not just approve.</h2>
        <p className={small}>Discuss a saving goal and one practice decision, then review the consequence without treating a badge as permission.</p>
      </header>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className={panel}><h3 className="text-[17px] font-bold text-navy-strong">Child&apos;s perspective</h3><p className={small}>What am I saving for? How much risk can I explain?</p><p className="mt-2 text-[12px]">Child progress: {state.childCompleted.length}/{CHILD_LEARNING.length}</p></div>
        <div className={panel}><h3 className="text-[17px] font-bold text-navy-strong">Parent&apos;s perspective</h3><p className={small}>Can I explain the Key and the difference between one exception and changing a limit?</p><p className="mt-2 text-[12px]">Parent progress: {state.parentCompleted.length}/{PARENT_LEARNING.length}</p></div>
      </div>
      <div className={panel}>
        <h3 className="text-[19px] font-bold text-navy-strong">Our family practice check-in</h3>
        <p className={`mt-2 ${small}`}>Talk about the bike goal, the credits set aside, the limits and any blocked request. The child can keep learning whether or not this activity is complete.</p>
        <button className={`mt-4 ${primary}`} disabled={state.togetherCompleted} type="button" onClick={onComplete}>
          {state.togetherCompleted ? "Family check-in completed" : "Mark our discussion complete"}
        </button>
        <p className="mt-3 text-[12px] text-ink-3">Completion is a learning milestone only; no Key, budget or permission changes.</p>
      </div>
    </section>
  );
}

/** Full two-role public practice studio. No backend, auth, storage or financial execution. */
export function FamilyPublicStudio() {
  const [state, dispatch] = useReducer(transitionFamilyPractice, undefined, initialFamilyPractice);
  const [role, setRole] = useState<FamilyRole>("child");
  const [childTab, setChildTab] = useState<ChildTab>("home");
  const [parentTab, setParentTab] = useState<ParentTab>("overview");
  const pending = state.requests.filter(r => r.status === "pending").length;

  return (
    <section data-testid="family-public-studio" className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[23px] border border-line-soft bg-surface p-4 md:p-5">
        <div>
          <p className="cresco-section-kicker">A family story, two real perspectives</p>
          <h2 className="mt-1 font-display text-[27px] text-navy-strong">Choose the view you want to explore.</h2>
          <p className="mt-1 text-[12px] text-ink-2">Switch roles freely; both use the same fictional practice state.</p>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Choose demo profile">
          <button type="button" aria-pressed={role === "child"} onClick={() => setRole("child")}
            className={role === "child" ? primary : secondary}>Child view</button>
          <button type="button" aria-pressed={role === "parent"} onClick={() => setRole("parent")}
            className={role === "parent" ? primary : secondary}>Parent view {pending ? `(${pending})` : ""}</button>
        </div>
      </div>

      <div className="mt-5 rounded-[26px] border border-line-soft bg-surface-soft p-3 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 px-2 pb-4">
          <div className="flex items-center gap-2">
            {role === "child" ? <Sprout aria-hidden className="size-6 text-green-strong"/> : <ShieldCheck aria-hidden className="size-6 text-green-strong"/>}
            <span className="text-[16px] font-bold text-navy-strong">{role === "child" ? "Child profile · Practice" : "Parent profile · Guidance"}</span>
          </div>
          <span className="rounded-full bg-green-soft px-3 py-1.5 text-[11px] font-bold text-green-strong">Fictional scenario · 0 real funds</span>
        </div>
        <nav aria-label={role === "child" ? "Child demo navigation" : "Parent demo navigation"} className="mb-5 flex gap-2 overflow-x-auto pb-2">
          {role === "child" ? childTabs.map(tab => <button key={tab.id} type="button"
            aria-current={childTab === tab.id ? "page" : undefined}
            onClick={() => setChildTab(tab.id)}
            className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-[12px] font-bold ${childTab === tab.id ? "bg-navy-strong text-white" : "bg-surface text-navy-strong"}`}>
            <tab.icon aria-hidden className="size-4" /> {tab.label}</button>) :
            parentTabs.map(tab => <button key={tab.id} type="button"
              aria-current={parentTab === tab.id ? "page" : undefined}
              onClick={() => setParentTab(tab.id)}
              className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-[12px] font-bold ${parentTab === tab.id ? "bg-navy-strong text-white" : "bg-surface text-navy-strong"}`}>
              <tab.icon aria-hidden className="size-4" /> {tab.label}</button>)
          }
        </nav>
        <div className="px-1 pb-2">
          {role === "child" ? (
            childTab === "home" ? <ChildHome state={state} open={setChildTab} save={() => dispatch({ type: "save" })}/> :
            childTab === "learn" ? <LearningPath role="child" state={state} complete={id => dispatch({ type: "complete", role: "child", lessonId: id })}/> :
            childTab === "explore" ? <Explore state={state} save={() => dispatch({ type: "save" })}
              buy={(asset, amount) => dispatch({ type: "buy", asset, amount })}/> :
            childTab === "portfolio" ? <Portfolio state={state}/> : <KeySummary state={state}/>
          ) : (
            parentTab === "overview" ? <div className="space-y-4">
              <header><p className="cresco-section-kicker">Parent dashboard</p><h2 className="mt-2 font-display text-[34px] text-navy-strong">Guide with confidence.</h2>
                <p className={small}>Support independent learning while keeping the boundaries explicit.</p></header>
              <div className="grid gap-3 sm:grid-cols-3">
                <Metric label="Pending requests" value={String(pending)} />
                <Metric label="Your learning" value={`${state.parentCompleted.length}/${PARENT_LEARNING.length}`} />
                <Metric label="Child learning" value={`${state.childCompleted.length}/${CHILD_LEARNING.length}`} />
              </div>
              <KeySummary state={state}/>
              <div className="flex flex-wrap gap-3">
                <button className={primary} type="button" onClick={() => setParentTab("learn")}>Start Parent Learning</button>
                <button className={secondary} type="button" onClick={() => setParentTab("requests")}>Review requests {pending ? `(${pending})` : ""}</button>
              </div>
            </div> :
            parentTab === "learn" ? <LearningPath role="parent" state={state} complete={id => dispatch({ type: "complete", role: "parent", lessonId: id })}/> :
            parentTab === "key" ? <ParentKey state={state} update={(maxPerAction, maxPeriod, allowed) => dispatch({ type: "set-key", maxPerAction, maxPeriod, allowed })}/> :
            parentTab === "requests" ? <Requests state={state} decide={(id, choice) => dispatch({ type: "respond", id, choice })}/> :
            <Together state={state} onComplete={() => dispatch({ type: "together" })}/>
          )}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-line bg-surface px-4 py-3">
        <p aria-live="polite" role="status" className="max-w-[70ch] text-[13px] font-semibold leading-6 text-navy-strong">{state.feedback}</p>
        <button type="button" className={secondary} onClick={() => { dispatch({ type: "reset" }); setRole("child"); setChildTab("home"); setParentTab("overview"); }}>
          <RotateCcw aria-hidden className="mr-1 inline size-4"/> Reset whole demo
        </button>
      </div>
      <p className="mt-3 text-[12px] leading-5 text-ink-3">Public educational simulation in this browser tab only. Refreshing resets all lessons, balances, requests and badges. No sign-in, third-party finance data, wallet, server write, blockchain execution or real Parent verification. Sample companies and sample prices are not investment advice.</p>
    </section>
  );
}
