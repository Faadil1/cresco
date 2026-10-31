"use client";

import Link from "next/link";
import { KeyRound } from "lucide-react";
import { StoryVignette } from "@/components/illustrations/family-story";
import { GoalArt } from "@/components/illustrations/objects";
import { useFamilyStory } from "@/components/family-story-provider";
import { ParentKey } from "@/components/family-public-studio";
import {
  ChapterHeading, ChapterNav, ResultCard, panel, primaryBtn, secondaryBtn,
} from "@/components/family-story-ui";
import {
  PARENT_LEARNING, remainingPeriod, selectedPracticeGoal, type PracticeRequest,
} from "@/lib/family-public-practice";
import { DECLINE_REASONS, GOAL_STORY, REASONS, parentLessonNote } from "@/lib/family-story-state";
import { FAMILY_EXPLORE_CASES } from "@/lib/family-public-explore-data";

const SIMULATED = "Parent role is simulated in this one browser. No guardian identity or consent is verified, and nothing real is approved.";

function GoalCard() {
  const { story } = useFamilyStory();
  const p = story.practice;
  const goal = selectedPracticeGoal(p);
  return (
    <div className={`${panel} flex items-center gap-4`} data-testid="parent-goal-card">
      <GoalArt goal={goal.id} className="h-16 w-20 shrink-0"/>
      <div>
        <p className="cresco-section-kicker">Your child&apos;s goal</p>
        <p className="text-[19px] font-bold text-navy-strong">{goal.label} · {GOAL_STORY[goal.id].horizon} away</p>
        <p className="text-[13px] text-ink-2">{p.saved} of {goal.target} pretend credits set aside. {p.childCompleted.length} Child lessons done.</p>
        {!story.goalChosen ? <p className="mt-1 text-[12px] text-ink-3" data-testid="goal-default-note">Your child has not chosen yet, so this is the default. <Link href="/try/goal" className="font-bold text-green-strong underline underline-offset-4">Choose it together</Link>.</p> : null}
      </div>
    </div>
  );
}

export function ParentHome() {
  const { story } = useFamilyStory();
  const p = story.practice;
  const pending = p.requests.filter(r => r.status === "pending");
  return (
    <div className="space-y-5">
      <ChapterHeading kicker="Chapter 5 · The Parent's moment" title="Guide with confidence"
        intro="This is the Parent's side of the same story. You see what your child is working toward, and you decide only at the boundary."
        art={<StoryVignette role="parent" className="block h-auto w-full rounded-[20px]" title="An illustrated parent reviewing a Cresco request at home"/>}/>
      <p className="rounded-[14px] bg-lavender-soft px-4 py-3 text-[12px] leading-5 text-navy-strong">{SIMULATED}</p>
      <GoalCard/>
      {pending.length ? (
        <ResultCard tone="wait" title={`${pending.length} request${pending.length > 1 ? "s" : ""} waiting for you`} testId="parent-pending">
          <Link href="/try/parent/request" className={`mt-2 ${primaryBtn}`} data-testid="open-request">Review the exact request</Link>
        </ResultCard>
      ) : (
        <p className={`${panel} text-[14px] leading-6 text-navy-strong`} data-testid="parent-no-pending">
          Nothing is waiting. When your child asks for more than the Key allows, the exact request appears here.
          {p.requests.length === 0 ? <> <Link href="/try/decision" className="font-bold text-green-strong underline underline-offset-4">See how a request gets created</Link>.</> : null}
        </p>
      )}
      <div className={panel}>
        <p className="cresco-section-kicker">My Key · Practice version {p.key.version}</p>
        <p className="mt-1 flex items-start gap-2 text-[15px] font-semibold text-navy-strong"><KeyRound aria-hidden className="mt-1 size-4 shrink-0 text-green-strong"/>
          <span>Your child decides alone up to {p.key.maxPerAction} credits per choice, {remainingPeriod(p)} left this practice period, for {p.key.allowed.join(", ")}.</span></p>
        <Link href="/try/parent/key" className={`mt-3 ${secondaryBtn}`}>Change the Key on purpose</Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/try/parent/learn" className={`${panel} block hover:border-green`}><span className="text-[17px] font-bold text-navy-strong">Your learning path</span><span className="mt-1 block text-[13px] text-ink-2">{p.parentCompleted.length} of {PARENT_LEARNING.length} Parent lessons done. Separate from your child&apos;s.</span></Link>
        <Link href="/try/together" className={`${panel} block hover:border-green`}><span className="text-[17px] font-bold text-navy-strong">Talk it through</span><span className="mt-1 block text-[13px] text-ink-2">Share your guidance and compare it with your child&apos;s.</span></Link>
      </div>
      <ChapterNav back={{ href: "/try/decision", label: "Back to the Child" }} next={{ href: "/try/outcome", label: "What happened" }}/>
    </div>
  );
}

export function ParentLearnHub() {
  const { story } = useFamilyStory();
  const goal = selectedPracticeGoal(story.practice);
  const done = story.practice.parentCompleted;
  return (
    <div className="space-y-5">
      <ChapterHeading kicker="Parent's lens · Learning path" title="Five short lessons for you"
        intro="A different lens from your child's: how to use the Key, ask good questions and keep learning separate from permission."/>
      <ol className="grid gap-3 md:grid-cols-2" aria-label="Parent lessons">
        {PARENT_LEARNING.map((lesson, index) => (
          <li key={lesson.id}>
            <Link href={`/try/learn/${lesson.id}`} className="block min-h-24 rounded-[18px] border border-line bg-surface p-4 hover:border-green">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-green-strong">Lesson {index + 1} · {lesson.minutes} min · {done.includes(lesson.id) ? "Done" : "Not started"}</span>
              <span className="block text-[17px] font-bold text-navy-strong">{lesson.title}</span>
              <span className="mt-1 block text-[12px] leading-5 text-ink-2">{parentLessonNote(goal, lesson.id)}</span>
            </Link>
          </li>
        ))}
      </ol>
      <p className="text-[12px] text-ink-3">Finishing Parent lessons never widens the Key. Only an explicit change on the Key page does.</p>
      <ChapterNav back={{ href: "/try/parent", label: "Parent home" }}/>
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
        <ChapterHeading kicker="Parent's moment · Request" title="No request to review yet"/>
        <p className={`${panel} text-[14px] leading-6 text-navy-strong`} data-testid="parent-empty">
          A request appears here only after your child tries a practice choice above the Key. Nothing is pre-filled for you.
        </p>
        <ChapterNav back={{ href: "/try/parent", label: "Parent home" }} next={{ href: "/try/decision", label: "Go to the Child's choice" }}/>
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
      <ChapterHeading kicker="Chapter 5 · The Parent's moment" title={`${request.amount} practice credits · ${request.asset}`}
        intro={<span className="hidden md:inline">Your child asked for more than the Key allows. Read the exact request, then decide once.</span>}/>
      <article className={panel} data-family-pending-request={request.status === "pending" ? "true" : undefined} data-testid="request-detail">
        <p className="text-[11px] font-bold uppercase tracking-wider text-green-strong">Request #{request.id} · {request.status}</p>
        <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-[13px]">
          <div className="col-span-2"><dt className="text-ink-2">Exact simulated action</dt><dd className="font-bold text-navy-strong">Practice {request.asset} for {request.amount} credits</dd></div>
          <div className="col-span-2"><dt className="text-ink-2">Why your child chose it</dt><dd className="font-bold text-navy-strong" data-testid="child-reason">{reason?.label ?? "No reason given"}</dd></div>
          <div className="col-span-2" data-testid="parent-goal-card"><dt className="text-ink-2">Their goal</dt><dd className="font-bold text-navy-strong">{goal.label}: {p.saved} of {goal.target} credits set aside</dd></div>
          <div><dt className="text-ink-2">Your standing Key</dt><dd className="font-bold text-navy-strong">{p.key.maxPerAction} per choice (v{p.key.version})</dd></div>
          <div><dt className="text-ink-2">Asked under</dt><dd className="font-bold text-navy-strong">v{request.version} / nonce {request.nonce}{current ? "" : " (old)"}</dd></div>
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
        <p className="mt-2 text-[11px] leading-4 text-ink-2">{SIMULATED}</p>
        {request.status === "pending" ? (
          <>
            <div className="mt-3 flex flex-col gap-2">
              <button type="button" className={primaryBtn} data-testid="approve-once"
                onClick={() => dispatch({ type: "practice", action: { type: "respond", id: request.id, choice: "approve" } })}>Approve once #{request.id}</button>
              <fieldset>
                <legend className="text-[13px] font-bold text-navy-strong">Or decline because</legend>
                <div className="mt-2 grid gap-2">
                  {DECLINE_REASONS.map(option => (
                    <button key={option.id} type="button" className={secondaryBtn} data-testid={`decline-${option.id}`}
                      onClick={() => dispatch({ type: "practice", action: { type: "respond", id: request.id, choice: "decline" }, declineReason: option.id })}>
                      Decline #{request.id}: {option.label}
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>
            <ul className="mt-4 list-disc space-y-1 pl-5 text-[12px] leading-5 text-navy">
              <li><strong>Approve once</strong> lets this exact choice happen one time. Your Key stays the same.</li>
              <li><strong>Decline</strong> buys nothing. A reason helps your child learn from it.</li>
            </ul>
          </>
        ) : null}
      </article>
      {copy ? (
        <ResultCard tone={copy.tone} title={copy.title} testId="parent-result">
          {copy.body}
          <span className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Link href="/try/outcome" className={primaryBtn} data-testid="hand-back">Hand back to the Child</Link>
          </span>
        </ResultCard>
      ) : null}
      {others.length ? (
        <section className={panel} aria-label="Other requests">
          <h2 className="text-[16px] font-bold text-navy-strong">Other requests</h2>
          <ul className="mt-2 space-y-1 text-[13px] text-navy">{others.map(r => <li key={r.id}>#{r.id}: {r.amount} credits · {r.asset} · {r.status}</li>)}</ul>
        </section>
      ) : null}
      <ChapterNav back={{ href: "/try/parent", label: "Parent home" }} next={{ href: "/try/outcome", label: "What happened" }}/>
    </div>
  );
}

export function ParentKeyPage() {
  const { story, dispatch } = useFamilyStory();
  return (
    <div className="space-y-5">
      <ParentKey state={story.practice} update={(maxPerAction, maxPeriod, allowed) => dispatch({ type: "practice", action: { type: "set-key", maxPerAction, maxPeriod, allowed } })}/>
      <ResultCard tone="info" title={story.practice.feedback.startsWith("Parent explicitly") || story.practice.feedback.startsWith("Invalid Key")
        ? story.practice.feedback : "Changing the Key is a separate, explicit act."} testId="key-result">
        <span>Any pending or approved-once request becomes stale when the Key changes. Lessons, badges and quizzes never change it.</span>
      </ResultCard>
      <ChapterNav back={{ href: "/try/parent", label: "Parent home" }} next={{ href: "/try/outcome", label: "What happened" }}/>
    </div>
  );
}
