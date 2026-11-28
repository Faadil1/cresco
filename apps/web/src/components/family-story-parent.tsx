"use client";

import Link from "next/link";
import { useState } from "react";
import { KeyRound } from "lucide-react";
import { StoryVignette } from "@/components/illustrations/family-story";
import { GoalArt } from "@/components/illustrations/objects";
import { useFamilyStory } from "@/components/family-story-provider";
import {
  ChapterHeading, JourneyTrack, ResultCard, Stat, kicker, panel, primaryBtn, secondaryBtn, sectionTitle, textLink,
} from "@/components/family-story-ui";
import {
  PARENT_LEARNING, PRACTICE_ASSETS, remainingPeriod, selectedPracticeGoal, type AssetCode, type PracticeRequest,
} from "@/lib/family-public-practice";
import { DECLINE_REASONS, GOAL_STORY, REASONS, chapterStatus, metCases, parentLessonNote } from "@/lib/family-story-state";
import { FAMILY_EXPLORE_CASES } from "@/lib/family-public-explore-data";

const SIMULATED = "Parent role is simulated in this one browser. No guardian identity or consent is verified, and nothing real is approved.";

function GoalCard() {
  const { story } = useFamilyStory();
  const p = story.practice;
  const goal = selectedPracticeGoal(p);
  return (
    <div className={`${panel} flex items-center gap-4 !p-4 md:!p-5`} data-testid="parent-goal-card">
      <GoalArt goal={goal.id} className="h-14 w-16 shrink-0"/>
      <div className="min-w-0">
        <p className={`${kicker} text-green-strong`}>Your child&apos;s goal</p>
        <p className="text-[17px] font-extrabold text-navy-strong">{goal.label} · {GOAL_STORY[goal.id].horizon} away</p>
        <p className="text-[14px] text-ink-2">{p.saved} of {goal.target} pretend credits set aside</p>
        {!story.goalChosen ? <p className="mt-1 text-[13px] text-ink-2" data-testid="goal-default-note">Not chosen yet, so this is the default. <Link href="/try/goal" className="font-bold text-green-strong underline underline-offset-4">Choose it together</Link>.</p> : null}
      </div>
    </div>
  );
}

type ActivityItem = { id: string; order: number; tone: "wait" | "good" | "info"; title: string; detail: string };
/** A plain, ordered list of what really happened in this tab. Nothing is inferred or sent anywhere. */
function activityOf(story: ReturnType<typeof useFamilyStory>["story"]): ActivityItem[] {
  const p = story.practice;
  const name = (code: string) => PRACTICE_ASSETS.find(a => a.code === code)?.name ?? code;
  const items: ActivityItem[] = [];
  for (const r of p.requests) {
    const reason = REASONS.find(item => item.id === story.reasons[r.id])?.label;
    const statusText = { pending: "waiting for you", "approved-once": "you said yes once (not used yet)", declined: "you declined", used: "your one-time yes was used", stale: "expired when the Key changed" }[r.status];
    items.push({ id: `ask-${r.id}`, order: r.id * 2 + 1, tone: r.status === "pending" ? "wait" : "info",
      title: `Asked for ${r.amount} credits of ${name(r.asset)}: ${statusText}`, detail: reason ? `Reason given: "${reason}"` : "No reason given" });
  }
  for (const r of p.receipts) {
    items.push({ id: `rc-${r.id}`, order: r.id * 2, tone: "good",
      title: `Practice choice: ${r.amount} credits of ${name(r.asset)}`, detail: r.permission === "allow-once" ? "With your one-time yes" : "On their own, inside the Key" });
  }
  items.sort((x, y) => y.order - x.order);
  if (p.childCompleted.length) items.push({ id: "lessons", order: 0, tone: "info", title: `Finished ${p.childCompleted.length} lesson${p.childCompleted.length === 1 ? "" : "s"}`, detail: "Lessons never change the Key" });
  const met = metCases(story);
  if (met.length) items.push({ id: "met", order: 0, tone: "info", title: `Met ${met.length} invented ${met.length === 1 ? "person" : "people"} in Explore`, detail: `Answered their dilemma or research question · ${story.researched.length} researched correctly` });
  return items;
}

export function ParentHome() {
  const { story } = useFamilyStory();
  const p = story.practice;
  const pending = p.requests.filter(r => r.status === "pending");
  const activity = activityOf(story);
  return (
    <div className="space-y-5">
      <ChapterHeading kicker="Parent · overview" title="How your child is doing"
        intro="Your child decides inside the Key you set. You only step in at the boundary."
        art={<StoryVignette role="parent" className="block h-auto w-full rounded-[20px]" title="An illustrated parent reviewing a Cresco request at home"/>}/>
      <p className="text-[13px] leading-5 text-ink-2">{SIMULATED}</p>

      <section data-testid="parent-overview-grid" aria-label="Parent overview at a glance" className="grid gap-3 lg:grid-cols-3 lg:items-stretch">
        <div className="min-w-0 lg:order-1 [&>*]:h-full">
          {pending.length ? (
            <ResultCard tone="wait" title={`${pending.length} request${pending.length > 1 ? "s" : ""} waiting for you`} testId="parent-pending">
              <p>Your child asked for more than the Key allows. Nothing was bought.</p>
              <Link href="/try/parent/request" className={`mt-3 ${primaryBtn}`} data-testid="open-request">Review the exact request</Link>
            </ResultCard>
          ) : (
            <section className={`${panel} !p-4 md:!p-5`} data-testid="parent-no-pending">
              <p className={`${kicker} text-ink-2`}>Needs you</p>
              <p className="mt-1 text-[15px] leading-6 text-navy-strong">Nothing is waiting. When your child asks for more than the Key allows, the exact request appears here.</p>
              {p.requests.length === 0 ? <Link href="/try/decision" className="mt-1 inline-flex min-h-11 items-center text-[14px] font-bold text-green-strong underline underline-offset-4">See how a request gets created</Link> : null}
            </section>
          )}
        </div>
        <div className="min-w-0 lg:order-2 [&>*]:h-full"><GoalCard/></div>
        <section className={`${panel} min-w-0 !p-4 md:!p-5 lg:order-3`} aria-label="My Key at a glance">
          <p className={`${kicker} text-green-strong`}>My Key you set</p>
          <p className="mt-1 flex items-start gap-2 text-[15px] leading-6 text-navy-strong"><KeyRound aria-hidden className="mt-1 size-4 shrink-0 text-green-strong"/>
            <span>Your child decides alone up to {p.key.maxPerAction} credits a choice, {remainingPeriod(p)} left this period, for {p.key.allowed.map(code => PRACTICE_ASSETS.find(a => a.code === code)?.name ?? code).join(", ")}.</span></p>
          <Link href="/try/parent/key" className={`mt-3 ${secondaryBtn}`}>Change the Key on purpose</Link>
        </section>
      </section>

      <section className={`${panel} !p-4 md:!p-5`} aria-labelledby="parent-loop-title">
        <h2 id="parent-loop-title" className="mb-2 text-[16px] font-extrabold text-navy-strong">Where your child is in the loop</h2>
        <JourneyTrack status={chapterStatus(story)} lens="parent" testId="parent-journey"/>
      </section>

      <section className={`${panel} !p-4 md:!p-5`} aria-labelledby="activity-title" data-testid="parent-activity">
        <h2 id="activity-title" className={sectionTitle}>What your child did</h2>
        {activity.length ? (
          <ol className="mt-3 space-y-2">
            {activity.map(item => (
              <li key={item.id} className={`rounded-[14px] px-3 py-2.5 ${item.tone === "wait" ? "bg-yellow-soft" : item.tone === "good" ? "bg-green-soft" : "bg-surface-soft"}`}>
                <p className="text-[14px] font-bold text-navy-strong">{item.title}</p>
                <p className="text-[13px] text-navy">{item.detail}</p>
              </li>
            ))}
          </ol>
        ) : <p className="mt-2 text-[14px] leading-6 text-ink-2">Nothing yet. Choices, asks and lessons from this tab appear here in order.</p>}
        <p className="mt-3 text-[13px] text-ink-2">From this browser tab only. No tracking, nothing sent anywhere.</p>
        <p className="mt-1 text-[14px]"><Link href="/try/outcome" className="font-bold text-family-action underline underline-offset-4">What happened</Link> · <Link href="/try/home" className="font-bold text-family-action underline underline-offset-4">Hand back to the Child</Link></p>
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/try/parent/learn" className={`${panel} block !p-4 hover:border-green md:!p-5`}><span className="text-[16px] font-bold text-navy-strong">Your learning path</span><span className="mt-1 block text-[14px] text-ink-2">{p.parentCompleted.length} of {PARENT_LEARNING.length} Parent lessons done. Separate from your child&apos;s.</span></Link>
        <Link href="/try/together" className={`${panel} block !p-4 hover:border-green md:!p-5`}><span className="text-[16px] font-bold text-navy-strong">Talk it through</span><span className="mt-1 block text-[14px] text-ink-2">Share your view and compare it with your child&apos;s.</span></Link>
      </div>
    </div>
  );
}

export function ParentLearnHub() {
  const { story } = useFamilyStory();
  const goal = selectedPracticeGoal(story.practice);
  const done = story.practice.parentCompleted;
  return (
    <div className="space-y-5">
      <ChapterHeading kicker="Parent · learning" title={`${PARENT_LEARNING.length} lessons for you`}
        intro="A different lens from your child's: how to use the Key, ask good questions and keep learning separate from permission."/>
      <ol className="grid gap-3 md:grid-cols-2" aria-label="Parent lessons">
        {PARENT_LEARNING.map((lesson, index) => (
          <li key={lesson.id}>
            <Link href={`/try/learn/${lesson.id}`} className="block min-h-24 rounded-[18px] border border-line bg-surface p-4 hover:border-green">
              <span className="block text-[12px] font-bold uppercase tracking-wider text-green-strong">Lesson {index + 1} · {lesson.minutes} min · {done.includes(lesson.id) ? "Done" : "Not started"}</span>
              <span className="block text-[17px] font-bold text-navy-strong">{lesson.title}</span>
              <span className="mt-1 block text-[12px] leading-5 text-ink-2">{parentLessonNote(goal, lesson.id)}</span>
            </Link>
          </li>
        ))}
      </ol>
      <p className="text-[12px] text-ink-3">Finishing Parent lessons never widens the Key. Only an explicit change on the Key page does.</p>
      <Link href="/try/parent" className={textLink}>Parent home</Link>
    </div>
  );
}

function requestStatusCopy(r: PracticeRequest, declineExplain?: string) {
  switch (r.status) {
    case "approved-once": return { tone: "good" as const, title: "Approved once. The Key did not widen.", body: "Hand the phone back: your child must retry exactly this choice. The approval is used up when they do." };
    case "declined": return { tone: "info" as const, title: "Declined. Nothing was bought.", body: declineExplain ?? "Your child can try an amount inside the Key." };
    case "used": return { tone: "info" as const, title: "This approval was already used.", body: "It cannot be replayed. A new request would need a new decision." };
    case "stale": return { tone: "stop" as const, title: "This request expired.", body: "The Key was changed after it was asked, so the old request no longer matches." };
    default: return null;
  }
}

export function ParentRequest() {
  const { story, dispatch } = useFamilyStory();
  const p = story.practice;
  const request = p.requests.find(r => r.status === "pending") ?? p.requests[0];
  const goal = selectedPracticeGoal(p);
  if (!request) {
    return (
      <div className="space-y-5">
        <ChapterHeading kicker="Parent · requests" title="No request to review yet"/>
        <p className={`${panel} text-[14px] leading-6 text-navy-strong`} data-testid="parent-empty">
          A request appears here only after your child tries a practice choice above the Key. Nothing is pre-filled for you.
        </p>
        <p className="flex flex-wrap gap-x-5 text-[14px]">
          <Link href="/try/parent" className={textLink}>Parent home</Link>
          <Link href="/try/decision" className={textLink}>Go to the Child&apos;s choice</Link>
        </p>
      </div>
    );
  }
  const company = FAMILY_EXPLORE_CASES.find(item => item.practiceCode === request.asset);
  // Read the answer recorded when the exact request was made, not a later edit.
  const episodeChoice = story.requestEpisodeChoices[request.id];
  const reason = REASONS.find(item => item.id === story.reasons[request.id]);
  const declineReason = DECLINE_REASONS.find(item => item.id === story.declineReasons[request.id]);
  const copy = requestStatusCopy(request, declineReason?.explain);
  const current = request.version === p.key.version && request.nonce === p.key.nonce;
  const others = p.requests.filter(r => r.id !== request.id);
  return (
    <div className="space-y-5">
      <ChapterHeading title={`${request.amount} credits · ${company?.name ?? request.asset}`}
        intro={<span className="hidden md:inline">Your child asked for more than the Key allows. Read the exact request, then decide once.</span>}/>
      {/* A decision should put the outcome within the first phone viewport, not
          below a request summary whose actions have disappeared. */}
      {copy ? (
        <ResultCard tone={copy.tone} title={copy.title} testId="parent-result">
          {copy.body}
          <span className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Link href="/try/outcome" className={primaryBtn} data-testid="hand-back">Hand back to the Child</Link>
          </span>
        </ResultCard>
      ) : null}
      <article className={panel} data-family-pending-request={request.status === "pending" ? "true" : undefined} data-testid="request-detail">
        <p className="text-[12px] font-bold uppercase tracking-wider text-green-strong">Request #{request.id} · {({ pending: "waiting for you", "approved-once": "approved once", declined: "declined", used: "used", stale: "expired" } as const)[request.status]}</p>
        <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-[13px]">
          <div className="col-span-2"><dt className="text-ink-2">Exact simulated action</dt><dd className="font-bold text-navy-strong">Practice {request.asset} for {request.amount} credits</dd></div>
          <div className="col-span-2"><dt className="text-ink-2">Why your child chose it</dt><dd className="font-bold text-navy-strong" data-testid="child-reason">{reason?.label ?? "No reason given"}</dd></div>
          <div className="col-span-2" data-testid="parent-goal-card"><dt className="text-ink-2">Their goal</dt><dd className="font-bold text-navy-strong">{goal.label}: {p.saved} of {goal.target} credits set aside</dd></div>
          <div className="col-span-2"><dt className="text-ink-2">Your Key</dt><dd className="font-bold text-navy-strong">{p.key.maxPerAction} credits per choice · {current ? "asked under the current Key" : "asked under an older Key"}</dd></div>
        </dl>
        {company ? (
          <details className="mt-3 rounded-[18px] border border-green/20 bg-green-soft/40 px-3 py-2" data-testid="parent-human-story">
            <summary className="min-h-10 cursor-pointer py-2 text-[13px] font-bold text-navy-strong">Talk about {company.episode.person} before deciding</summary>
            <p className="mt-1 text-[13px] leading-6 text-navy">{company.episode.dilemma}</p>
            {episodeChoice !== undefined ? (
              <p className="mt-2 text-[13px] leading-6 text-navy" data-testid="parent-episode-choice">
                <strong>Your child said:</strong> {company.episode.options[episodeChoice]}.
                <span className="mt-1 block"><strong>Ask together:</strong> What could change your mind if the situation got worse?</span>
              </p>
            ) : (
              <p className="mt-2 text-[13px] leading-6 text-navy" data-testid="parent-episode-empty">
                Your child has not answered this dilemma. Ask what they would want to know before making a choice.
              </p>
            )}
          </details>
        ) : null}
        {request.status === "pending" ? (
          <>
            <div className="mt-3 flex flex-col gap-2">
              <button type="button" className={primaryBtn} data-testid="approve-once"
                onClick={() => dispatch({ type: "practice", action: { type: "respond", id: request.id, choice: "approve" } })}>Approve once #{request.id}</button>
              <fieldset className="mt-2">
                <legend className="text-[14px] font-bold text-navy-strong">Or decline, and tell your child why</legend>
                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  {DECLINE_REASONS.map(option => (
                    <button key={option.id} type="button" data-testid={`decline-${option.id}`} aria-label={`Decline #${request.id}: ${option.label}`}
                      className="min-h-12 rounded-[14px] border border-line bg-surface px-3 py-2 text-left text-[14px] font-semibold leading-5 text-navy-strong hover:border-family-action/40"
                      onClick={() => dispatch({ type: "practice", action: { type: "respond", id: request.id, choice: "decline" }, declineReason: option.id })}>
                      {option.label}
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>
            <p className="mt-3 text-[13px] leading-5 text-ink-2">{SIMULATED}</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[13px] leading-5 text-navy">
              <li><strong>Approve once</strong> lets this exact choice happen one time. Your Key stays the same.</li>
              <li><strong>Decline</strong> buys nothing. A reason helps your child learn from it.</li>
            </ul>
          </>
        ) : <p className="mt-3 text-[13px] leading-5 text-ink-2">{SIMULATED}</p>}
      </article>
      {others.length ? (
        <section className={panel} aria-label="Other requests">
          <h2 className="text-[16px] font-bold text-navy-strong">Other requests</h2>
          <ul className="mt-2 space-y-1 text-[13px] text-navy">{others.map(r => <li key={r.id}>#{r.id}: {r.amount} credits · {r.asset} · {r.status}</li>)}</ul>
        </section>
      ) : null}
      <p className="flex flex-wrap gap-x-5 text-[14px]">
        <Link href="/try/parent" className={textLink}>Parent home</Link>
        <Link href="/try/outcome" className={textLink}>What happened</Link>
      </p>
    </div>
  );
}

/**
 * The Parent's standing Key, in the same design as the rest of the app. The
 * form only proposes values: the unchanged practice reducer validates them and
 * is the only thing that changes the Key (and expires open requests).
 */
export function ParentKeyPage() {
  const { story, dispatch } = useFamilyStory();
  const p = story.practice;
  const [per, setPer] = useState(String(p.key.maxPerAction));
  const [period, setPeriod] = useState(String(p.key.maxPeriod));
  const [allowed, setAllowed] = useState<AssetCode[]>([...p.key.allowed]);
  const open = p.requests.filter(r => r.status === "pending" || r.status === "approved-once").length;
  const changed = Number(per) !== p.key.maxPerAction || Number(period) !== p.key.maxPeriod
    || allowed.length !== p.key.allowed.length || allowed.some(code => !p.key.allowed.includes(code));
  const input = "mt-1 block min-h-12 w-full rounded-[12px] border border-line bg-surface px-3 text-[16px] font-bold text-navy-strong";
  const result = p.feedback.startsWith("Parent explicitly") || p.feedback.startsWith("Invalid Key");
  return (
    <div className="space-y-5">
      <ChapterHeading kicker="Parent · My Key" title="How much your child decides alone"
        intro="Inside the Key, your child chooses without asking. Above it, the choice comes to you. Only you change it, here, on purpose."/>
      <section className={`${panel} !p-4 md:!p-5`} aria-label="The Key right now" data-testid="parent-key-now">
        <p className={`${kicker} text-green-strong`}>Right now</p>
        <dl className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-3">
          <Stat label="Alone, per choice" value={<>{p.key.maxPerAction} <span className="text-[14px] font-semibold text-ink-2">credits</span></>}/>
          <Stat label="Left this period" value={<>{remainingPeriod(p)} <span className="text-[14px] font-semibold text-ink-2">of {p.key.maxPeriod}</span></>}/>
          <div className="col-span-2 md:col-span-1"><Stat label="Companies allowed" value={<span className="text-[15px] leading-6">{p.key.allowed.map(code => PRACTICE_ASSETS.find(a => a.code === code)?.name ?? code).join(", ")}</span>}/></div>
        </dl>
      </section>
      <form className={`${panel} !p-4 md:!p-5`} aria-labelledby="key-change-title"
        onSubmit={event => { event.preventDefault(); dispatch({ type: "practice", action: { type: "set-key", maxPerAction: Number(per), maxPeriod: Number(period), allowed } }); }}>
        <h2 id="key-change-title" className={sectionTitle}>Change the Key</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <label className="text-[14px] font-bold text-navy-strong">Max credits per action
            <span className="block text-[13px] font-normal text-ink-2">The most your child can choose alone at once</span>
            <input aria-label="Max credits per action" className={input} type="number" inputMode="numeric" min="1" max="100" step="1" value={per} onChange={e => setPer(e.target.value)}/>
          </label>
          <label className="text-[14px] font-bold text-navy-strong">Total credits this practice period
            <span className="block text-[13px] font-normal text-ink-2">Everything they can use alone before asking</span>
            <input aria-label="Total credits this practice period" className={input} type="number" inputMode="numeric" min="1" max="100" step="1" value={period} onChange={e => setPeriod(e.target.value)}/>
          </label>
        </div>
        <fieldset className="mt-4">
          <legend className="text-[14px] font-bold text-navy-strong">Companies your child may practice with</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {PRACTICE_ASSETS.map(asset => (
              <label key={asset.code} className={`flex min-h-12 items-center gap-3 rounded-[14px] border px-3 text-[14px] font-semibold text-navy-strong ${allowed.includes(asset.code) ? "border-green-strong bg-green-soft" : "border-line bg-surface"}`}>
                <input type="checkbox" aria-label={`${asset.name} ${asset.code}`} checked={allowed.includes(asset.code)} className="size-4"
                  onChange={e => setAllowed(v => e.target.checked ? [...v, asset.code] : v.filter(x => x !== asset.code))}/>
                <span>{asset.name} <span className="text-[13px] text-ink-2">{asset.code}</span></span>
              </label>
            ))}
          </div>
        </fieldset>
        {changed && open ? (
          <p className="mt-4 rounded-[14px] bg-yellow-soft px-3 py-2 text-[14px] leading-6 text-navy-strong" data-testid="key-change-warning">
            Saving will expire {open} open request{open === 1 ? "" : "s"}. Your child would need to ask again under the new Key.
          </p>
        ) : null}
        <button type="submit" className={`mt-4 w-full sm:w-auto ${primaryBtn}`} disabled={!changed}>Explicitly update standing Key</button>
      </form>
      <ResultCard tone={p.feedback.startsWith("Invalid Key") ? "stop" : "info"} title={result ? p.feedback : "Changing the Key is a separate, explicit act."} testId="key-result">
        <span>Any pending or approved-once request becomes stale when the Key changes. Lessons, badges and quizzes never change it.</span>
      </ResultCard>
      <p className="flex flex-wrap gap-x-5 text-[14px]">
        <Link href="/try/parent" className={textLink}>Parent home</Link>
        <Link href="/try/outcome" className={textLink}>What happened</Link>
      </p>
    </div>
  );
}
