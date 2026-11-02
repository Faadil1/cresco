"use client";

import Link from "next/link";
import { ArrowRight, KeyRound, PiggyBank } from "lucide-react";
import { GoalArt } from "@/components/illustrations/objects";
import { useFamilyStory } from "@/components/family-story-provider";
import { primaryBtn } from "@/components/family-story-ui";
import { remainingCredits, remainingPeriod, selectedPracticeGoal } from "@/lib/family-public-practice";
import { GOAL_STORY, nextMission } from "@/lib/family-story-state";

/**
 * One destination, one next step. The persistent shell already owns all five
 * tabs, and their contents must not be repeated as a secondary dashboard.
 * Parent can still use GoalCard in their own lens; Home uses the single hero.
 */
export function GoalCard({ compact = false }: { compact?: boolean }) {
  const { story, dispatch } = useFamilyStory();
  const p = story.practice;
  const goal = selectedPracticeGoal(p);
  const percent = Math.min(100, Math.round(p.saved / goal.target * 100));
  return (
    <section data-testid="home-goal-card" aria-label="My goal"
      className="rounded-[22px] border border-line-soft bg-surface p-4">
      <div className="flex items-center gap-3">
        <GoalArt goal={goal.id} className={compact ? "h-12 w-14 shrink-0" : "h-16 w-20 shrink-0"}/>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold text-ink-2">Saving for</p>
          <p className="text-[18px] font-extrabold text-navy-strong">{story.goalChosen ? goal.label : "Your dream"}</p>
          <p className="text-[12px] text-ink-2">{GOAL_STORY[goal.id].horizon} away</p>
        </div>
        <p className="text-right text-[12px] font-semibold text-ink-2"><span className="block text-[18px] font-bold text-navy-strong" data-testid="home-goal-saved">{p.saved}/{goal.target}</span>saved</p>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-soft" role="progressbar" aria-label={`${goal.label} savings`}
        aria-valuemin={0} aria-valuemax={goal.target} aria-valuenow={p.saved}>
        <div className="h-full rounded-full bg-green-strong" style={{ width: `${percent}%` }}/>
      </div>
      {story.goalChosen ? (
        <button type="button" disabled={remainingCredits(p) < 20} data-testid="home-save"
          onClick={() => dispatch({ type: "practice", action: { type: "save" } })}
          className="mt-3 inline-flex min-h-11 items-center gap-1.5 rounded-full border border-green/40 bg-surface px-4 text-[13px] font-bold text-green-strong disabled:opacity-50">
          <PiggyBank aria-hidden className="size-4"/>Set aside 20
        </button>
      ) : null}
    </section>
  );
}

export function HomeScreen() {
  const { story, dispatch } = useFamilyStory();
  const p = story.practice;
  const goal = selectedPracticeGoal(p);
  const mission = nextMission(story);
  const percent = Math.min(100, Math.round(p.saved / goal.target * 100));
  return (
    <div className="mx-auto max-w-[710px] pt-3 md:pt-7" data-testid="home-screen">
      <header className="mb-5">
        <p className="text-[11px] font-extrabold uppercase tracking-wider text-green-strong">My Cresco</p>
        <h1 className="mt-1 font-display text-[29px] leading-tight text-navy-strong md:text-[36px]">One step at a time.</h1>
      </header>

      <section className="overflow-hidden rounded-[28px] border border-line-soft bg-surface p-5 shadow-sm md:p-7" data-testid="home-focus"
        aria-label="Your goal and your next step">
        <div className="flex items-center gap-3">
          <GoalArt goal={goal.id} className="h-[70px] w-[80px] shrink-0 md:h-[96px] md:w-[110px]"/>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-semibold text-ink-2">{story.goalChosen ? "My goal" : "Choose a dream"}</p>
            <h2 className="text-[20px] font-extrabold leading-6 text-navy-strong md:text-[24px]">{story.goalChosen ? goal.label : "Your first goal"}</h2>
            <p className="mt-1 text-[12px] text-ink-2">{story.goalChosen ? GOAL_STORY[goal.id].horizon + " away" : "Start with something that matters to you"}</p>
          </div>
          <p className="shrink-0 text-right text-[11px] text-ink-2"><strong className="block text-[19px] text-navy-strong" data-testid="home-goal-saved">{p.saved}/{goal.target}</strong>set aside</p>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-soft" role="progressbar"
          aria-label={`${goal.label} savings`} aria-valuemin={0} aria-valuemax={goal.target} aria-valuenow={p.saved}>
          <div className="h-full rounded-full bg-green-strong" style={{ width: `${percent}%` }}/>
        </div>

        <div className="my-5 border-t border-line-soft"/>
        <div data-testid="home-mission" data-mission={mission.id}>
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-family-action">Your next step</p>
          <h3 className="mt-1 text-[21px] font-extrabold leading-tight text-navy-strong">{mission.title}</h3>
          <p className="mt-2 max-w-[530px] text-[14px] leading-6 text-ink-2">{mission.body}</p>
          <Link href={mission.href} className={`mt-4 w-full sm:w-auto ${primaryBtn}`} data-testid="home-mission-go">
            {mission.cta}<ArrowRight aria-hidden className="size-4"/>
          </Link>
        </div>
      </section>

      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 px-1 text-[12px] text-ink-2" data-testid="home-key">
        <KeyRound aria-hidden className="size-4 text-green-strong"/>
        <span>My Key: {p.key.maxPerAction} credits per choice · {remainingPeriod(p)} available this period · fictional only</span>
        {story.goalChosen ? (
          <button type="button" disabled={remainingCredits(p) < 20} data-testid="home-save" onClick={() => dispatch({ type: "practice", action: { type: "save" } })}
            className="ml-auto min-h-11 rounded-full px-2 text-[12px] font-bold text-green-strong underline underline-offset-4">
            Set aside 20
          </button>
        ) : null}
      </div>
      {p.requests.some(request => request.status === "pending" || request.status === "approved-once") ? (
        <p data-testid="home-parent-preview" className="mt-3 text-[13px] leading-6 text-family-action">
          A Parent decision is part of your next step. The button above takes you to the exact request.
        </p>
      ) : null}
      <p className="mt-5 px-1 text-[11px] text-ink-3">Practice only. No actual money, investment or verified Parent identity.</p>
    </div>
  );
}
