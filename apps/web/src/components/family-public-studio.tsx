"use client";

import { useReducer, useState } from "react";
import { LessonIllustration } from "@/components/illustrations/scenes";
import { GoalArt } from "@/components/illustrations/objects";
import { BadgeArt } from "@/components/illustrations/badges";
import { FamilyPracticePortfolio } from "@/components/family-public-portfolio";
import {
  ArrowRight, BookOpen, CheckCircle2, Compass, Home, KeyRound,
  RotateCcw, ShieldCheck, Sprout, Users, Wallet,
} from "lucide-react";
import {
  CHILD_LEARNING, PARENT_LEARNING, PRACTICE_ASSETS, PRACTICE_GOALS, selectedPracticeGoal,
  initialFamilyPractice, remainingCredits, remainingPeriod, transitionFamilyPractice,
  type AssetCode, type FamilyPracticeState, type FamilyRole,
} from "@/lib/family-public-practice";

type ChildTab = "home" | "learn" | "explore" | "portfolio" | "key" | "together";
type ParentTab = "overview" | "learn" | "key" | "requests" | "together";
const childTabs: { id: ChildTab; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "learn", label: "Learn", icon: BookOpen },
  { id: "explore", label: "Explore", icon: Compass },
  { id: "portfolio", label: "Portfolio", icon: Wallet },
  { id: "key", label: "My Key", icon: KeyRound },
  { id: "together", label: "Together", icon: Users },
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
          {lesson.sections?.length ? (
            <div role="region" className="mt-4 space-y-4" aria-label="Original Cresco lesson concepts">
              {lesson.sections.map((section, index) => (
                <section key={index} className="overflow-hidden rounded-[18px] border border-line-soft bg-surface">
                  <div className="p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-green-strong">Concept {index + 1} / {lesson.sections?.length}</p>
                    <h4 className="mt-1 text-[17px] font-bold text-navy-strong">{section.title}</h4>
                  </div>
                  <LessonIllustration kind={section.illustration} title={section.title + " illustration"}
                    className="h-auto max-h-[220px] w-full"/>
                  <div className="p-4">
                    <p className="text-[14px] leading-7 text-navy">{section.body}</p>
                    {section.realityCheck ? <p className="mt-3 rounded-[14px] bg-blue-soft p-3 text-[12px] leading-6 text-navy">
                      <strong>Reality check: </strong>{section.realityCheck}
                    </p> : null}
                    {section.source ? <p className="mt-3 text-[12px] leading-6 text-ink-2">
                      <strong>Educational reference: </strong>
                      <a href={section.source.url} rel="noopener noreferrer" target="_blank"
                        className="font-semibold text-green-strong underline underline-offset-4">
                        {section.source.organization}: {section.source.title}
                      </a>
                      <span> · Source checked {section.source.verifiedAt} · U.S. educational context, not legal or financial advice</span>
                    </p> : null}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <>
              {lesson.illustration ? <LessonIllustration kind={lesson.illustration}
                title={lesson.title + " illustrated learning concept"}
                className="mt-3 h-auto max-h-[230px] w-full overflow-hidden rounded-[18px] border border-line-soft" /> : null}
              <p className="mt-3 text-[15px] leading-7 text-navy">{lesson.concept}</p>
              {lesson.source ? <p className="mt-3 text-[12px] leading-6 text-ink-2">
                <strong>Educational reference: </strong>
                <a href={lesson.source.url} target="_blank" rel="noopener noreferrer"
                  className="font-semibold text-green-strong underline underline-offset-4">
                  {lesson.source.organization}: {lesson.source.title}
                </a>
                <span> · Source checked {lesson.source.verifiedAt} · U.S. educational context, not legal or financial advice</span>
              </p> : <p className="mt-3 text-[12px] text-ink-3">Cresco practice explanation, not an external research citation.</p>}
            </>
          )}
          {lesson.quizPrompt ? <p className="mt-5 rounded-[14px] bg-yellow-soft p-3 text-[13px] leading-6 text-navy">{lesson.quizPrompt}</p> : null}
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

function ChildHome({ state, open, save, chooseGoal }: { state: FamilyPracticeState; open: (tab: ChildTab) => void; save: () => void; chooseGoal: (goalId: FamilyPracticeState["goalId"]) => void }) {
  const goal = selectedPracticeGoal(state);
  return (
    <div className="space-y-5">
      <header>
        <p className="cresco-section-kicker">Your journey</p>
        <h2 className="mt-2 font-display text-[clamp(34px,4vw,48px)] leading-tight text-navy-strong">Hey, future explorer.</h2>
        <p className={small}>Grow your knowledge, practice decisions and learn how your family&apos;s Key works.</p>
      </header>
      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="Available credits" value={String(remainingCredits(state))} testId="practice-available" />
        <Metric label={`Saved for ${goal.label}`} value={String(state.saved)} testId="practice-saved" />
        <Metric label="Child lessons" value={`${state.childCompleted.length}/${CHILD_LEARNING.length}`} />
      </div>
      <div className={panel}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="cresco-section-kicker">Saving goal · {goal.label}</p>
            <h3 className="mt-2 font-display text-[26px] text-navy-strong">Small steps count.</h3>
            <p className={small}>Choose a goal, then set aside pretend credits independently.</p>
          </div>
          <div className="flex items-center gap-3">
            <GoalArt goal={goal.id} className="hidden h-16 w-20 sm:block"/>
            <button type="button" className={primary} disabled={remainingCredits(state) < 20}
              onClick={save}>Set aside 20 <ArrowRight aria-hidden className="ml-1 inline size-4" /></button>
          </div>
        </div>
        <fieldset className="mt-5">
          <legend className="text-[12px] font-bold text-navy-strong">Choose a fictional saving goal</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {PRACTICE_GOALS.map(option => (
              <button key={option.id} type="button"
                aria-pressed={state.goalId === option.id}
                className={`rounded-[12px] border px-3 py-3 text-left text-[12px] font-semibold ${state.goalId === option.id ? "border-green-strong bg-green-soft text-green-strong" : "border-line bg-surface text-ink-2"}`}
                onClick={() => chooseGoal(option.id)}>
                {option.label} <span className="block text-[11px]">{option.target} pretend credits</span>
              </button>
            ))}
          </div>
        </fieldset>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-soft" role="progressbar"
          aria-label="Fictional saving goal progress" aria-valuenow={Math.min(state.saved, goal.target)}
          aria-valuemin={0} aria-valuemax={goal.target}>
          <div className="h-full rounded-full bg-green-strong"
            style={{ width: `${Math.min(100, state.saved / goal.target * 100)}%` }} />
        </div>
        <p className="mt-2 text-[12px] text-ink-2">{state.saved} of {goal.target} pretend credits saved for {goal.label}.</p>
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
      <div className={panel}>
        <h3 className="text-[17px] font-bold text-navy-strong">Your wins · earned in practice</h3>
        <div className="mt-3 flex flex-wrap gap-4">
          {([
            { badge: "first-investor", earned: state.receipts.length > 0, label: "First practice choice" },
            { badge: "company-detective", earned: state.childCompleted.includes("original-what-is-a-stock"), label: "Know what a share is" },
            { badge: "diversification-pro", earned: Object.values(state.holdings).filter(shares => shares > 0).length >= 2, label: "Explore two holdings" },
            { badge: "money-master", earned: state.childCompleted.length === CHILD_LEARNING.length, label: "Complete Child learning" },
          ] as const).map(item => (
            <div key={item.badge} className="flex w-[120px] flex-col items-center gap-1 text-center">
              <BadgeArt badge={item.badge} earned={item.earned} className="size-14"/>
              <span className="text-[11px] font-semibold text-navy-strong">{item.label}</span>
              <span className="text-[10px] text-ink-3">{item.earned ? "Earned" : "Not yet"}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[12px] text-ink-2">{state.togetherCompleted ? "Your family check-in is complete." : "Try Together with your parent."} Badges celebrate practice; they never change My Key.</p>
      </div>
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
type ChildDiscussion = NonNullable<FamilyPracticeState["discussion"]["child"]>;
type ParentDiscussion = NonNullable<FamilyPracticeState["discussion"]["parent"]>;
const childChoices: { id: ChildDiscussion; title: string; why: string }[] = [
  { id: "save-first", title: "Save first for the near-term bike goal", why: "Short timelines make preserving the goal important." },
  { id: "practice-small", title: "Practice a small fictional choice", why: "A small practice example helps me understand uncertainty." },
  { id: "ask-together", title: "Not sure yet, talk through the options", why: "Questions are a good reason to learn together." },
];
const parentChoices: { id: ParentDiscussion; title: string; why: string }[] = [
  { id: "protect-goal", title: "Protect the child's short-term goal", why: "Make room for savings without confusing it with investing." },
  { id: "small-limit", title: "Agree on a small practice boundary", why: "Let the child practice independently inside an explicit Key." },
  { id: "review-risk", title: "Discuss risk before changing any limits", why: "Understand possible losses; this answer does not change My Key." },
];
function Together({ role, state, childAnswer, parentAnswer, onComplete }: {
  role: FamilyRole;
  state: FamilyPracticeState;
  childAnswer: (choice: ChildDiscussion) => void;
  parentAnswer: (choice: ParentDiscussion) => void;
  onComplete: () => void;
}) {
  const goal = selectedPracticeGoal(state);
  const myChoices = role === "child" ? childChoices : parentChoices;
  const selected = role === "child" ? state.discussion.child : state.discussion.parent;
  const child = childChoices.find(choice => choice.id === state.discussion.child);
  const parent = parentChoices.find(choice => choice.id === state.discussion.parent);
  return (
    <section aria-labelledby="together-title" className="space-y-4">
      <header>
        <p className="cresco-section-kicker">Parent + Child · Shared learning activity</p>
        <h2 id="together-title" className="mt-2 font-display text-[34px] text-navy-strong">Learn together, not just approve.</h2>
        <p className={small}>Each person contributes their own perspective. Switch roles to finish the discussion, then compare outcomes together.</p>
      </header>
      <div className={panel}>
        <h3 className="text-[19px] font-bold text-navy-strong">
          {role === "child" ? "Child: what matters most for the bike goal?" : "Parent: how would you guide this goal?"}
        </h3>
        <div className="mt-3 grid gap-2" role="group" aria-label={role === "child" ? "Child family goal choices" : "Parent family guidance choices"}>
          <p className="mb-3 text-[12px] text-ink-2">Current shared goal: {goal.label} ({state.saved}/{goal.target} pretend credits).</p>
          {myChoices.map(choice => (
            <button type="button" key={choice.id} aria-pressed={selected === choice.id}
              className={`rounded-[14px] border px-4 py-3 text-left ${selected === choice.id ? "border-green-strong bg-green-soft" : "border-line bg-surface"}`}
              onClick={() => role === "child" ? childAnswer(choice.id as ChildDiscussion) : parentAnswer(choice.id as ParentDiscussion)}>
              <span className="block text-[13px] font-bold text-navy-strong">{choice.title}</span>
              <span className="mt-1 block text-[12px] text-ink-2">{choice.why}</span>
            </button>
          ))}
        </div>
      </div>
      <div className={panel}>
        <h3 className="text-[19px] font-bold text-navy-strong">Our two perspectives</h3>
        <dl className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[14px] bg-surface-soft p-3">
            <dt className="text-[12px] font-semibold text-ink-2">Child said</dt>
            <dd className="mt-2 text-[13px] font-bold text-navy-strong" data-testid="together-child-answer">
              {child?.title ?? "Awaiting Child input"}
            </dd>
          </div>
          <div className="rounded-[14px] bg-surface-soft p-3">
            <dt className="text-[12px] font-semibold text-ink-2">Parent said</dt>
            <dd className="mt-2 text-[13px] font-bold text-navy-strong" data-testid="together-parent-answer">
              {parent?.title ?? "Awaiting Parent input"}
            </dd>
          </div>
        </dl>
        {child && parent ? (
          <div className="mt-4 rounded-[15px] border border-green/20 bg-green-soft p-4">
            <strong className="text-[13px] text-navy-strong">Discussion prompt</strong>
            <p className="mt-1 text-[13px] leading-6 text-navy-strong">
              The Child values: {child.why} The Parent suggests: {parent.why}
              Agree on what to learn next, without assuming either answer authorizes an action.
            </p>
          </div>
        ) : <p className="mt-3 text-[12px] text-ink-2">Switch profiles so both people can contribute. No account is required for this fictional exercise.</p>}
        <button type="button" className={`mt-4 ${primary}`}
          disabled={!child || !parent || state.togetherCompleted} onClick={onComplete}>
          {state.togetherCompleted ? "Family check-in completed" : "Mark our discussion complete"}
        </button>
        <p className="mt-3 text-[12px] text-ink-3">
          This discussion is educational only. It changes no Key, allowance, permission or real financial status.
        </p>
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
            childTab === "home" ? <ChildHome state={state} open={setChildTab} save={() => dispatch({ type: "save" })} chooseGoal={goalId => dispatch({ type: "set-goal", goalId })}/> :
            childTab === "learn" ? <LearningPath role="child" state={state} complete={id => dispatch({ type: "complete", role: "child", lessonId: id })}/> :
            childTab === "explore" ? <Explore state={state} save={() => dispatch({ type: "save" })}
              buy={(asset, amount) => dispatch({ type: "buy", asset, amount })}/> :
            childTab === "portfolio" ? <FamilyPracticePortfolio state={state}/> :
            childTab === "key" ? <KeySummary state={state}/> :
            <Together role="child" state={state} childAnswer={choice => dispatch({ type: "discussion-child", choice })}
              parentAnswer={choice => dispatch({ type: "discussion-parent", choice })} onComplete={() => dispatch({ type: "together" })}/>
          ) : (
            parentTab === "overview" ? <div className="space-y-4">
              <header><p className="cresco-section-kicker">Parent dashboard</p><h2 className="mt-2 font-display text-[34px] text-navy-strong">Guide with confidence.</h2>
                <p className={small}>Support independent learning while keeping the boundaries explicit.</p></header>
              <div className="grid gap-3 sm:grid-cols-3">
                <Metric label="Pending requests" value={String(pending)} />
                <Metric label="Your learning" value={`${state.parentCompleted.length}/${PARENT_LEARNING.length}`} />
                <Metric label="Child learning" value={`${state.childCompleted.length}/${CHILD_LEARNING.length}`} />
              </div>
              <div className={panel}>
                <p className="cresco-section-kicker">Child's fictional saving goal</p>
                <h3 className="mt-2 text-[19px] font-bold text-navy-strong">{selectedPracticeGoal(state).label}</h3>
                <p className={small}>{state.saved} of {selectedPracticeGoal(state).target} credits set aside. Discuss the goal together; no approval needed to save fictional credits.</p>
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
            <Together role="parent" state={state} childAnswer={choice => dispatch({ type: "discussion-child", choice })}
              parentAnswer={choice => dispatch({ type: "discussion-parent", choice })} onComplete={() => dispatch({ type: "together" })}/>
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
