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
  const pending = p.requests.some(request => request.status === "pending" || request.status === "approved-once");

  return (
    <div className="mx-auto max-w-[660px] pt-4 md:pt-10" data-testid="home-screen">
      <header className="mb-6">
        <p className="text-[11px] font-extrabold uppercase tracking-wider text-green-strong">My Cresco</p>
        <h1 className="mt-1 font-display text-[28px] leading-tight text-navy-strong md:text-[36px]">Ready for your next step?</h1>
      </header>

      <section className="rounded-[28px] border border-green/25 bg-green-soft px-5 py-6 md:px-8 md:py-9"
        data-testid="home-focus" aria-label="Your next step">
        <div data-testid="home-mission" data-mission={mission.id}>
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-green-strong">Just one thing today</p>
          <h2 className="mt-2 font-display text-[25px] font-bold leading-tight text-navy-strong md:text-[31px]">{mission.title}</h2>
          <p className="mt-2 max-w-[44ch] text-[14px] leading-6 text-navy">{mission.body}</p>
          <Link href={mission.href} className={`mt-5 w-full sm:w-auto ${primaryBtn}`} data-testid="home-mission-go">
            {mission.cta}<ArrowRight aria-hidden className="size-4"/>
          </Link>
        </div>
      </section>

      <section aria-label="Goal progress" className="mt-5 flex items-center gap-3 rounded-[20px] border border-line-soft bg-surface px-3 py-3 sm:px-4" data-testid="home-goal-summary">
        <GoalArt goal={goal.id} className="h-12 w-14 shrink-0"/>
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-semibold text-ink-2">Saving for {story.goalChosen ? goal.label : "your dream"}</p>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-soft" role="progressbar" aria-label={`${goal.label} savings`} aria-valuemin={0} aria-valuemax={goal.target} aria-valuenow={p.saved}>
            <div className="h-full rounded-full bg-green-strong" style={{ width: `${percent}%` }}/>
          </div>
        </div>
        <p className="shrink-0 text-right text-[12px] text-ink-2"><strong className="block text-[16px] text-navy-strong" data-testid="home-goal-saved">{p.saved}/{goal.target}</strong>saved</p>
      </section>

      <details className="mt-2 rounded-[16px] px-3 py-2 text-[13px] text-ink-2" data-testid="home-extras">
        <summary className="cursor-pointer font-semibold text-family-action">Savings and practice limits</summary>
        <div className="mt-3 space-y-3">
          {story.goalChosen ? (
            <button type="button" disabled={remainingCredits(p) < 20} data-testid="home-save"
              onClick={() => dispatch({ type: "practice", action: { type: "save" } })}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-green/40 bg-surface px-4 text-[13px] font-bold text-green-strong disabled:opacity-50">
              <PiggyBank aria-hidden className="size-4"/>Set aside 20
            </button>
          ) : null}
          <div className="flex items-start gap-2 text-[12px] leading-5" data-testid="home-key">
            <KeyRound aria-hidden className="mt-0.5 size-4 shrink-0 text-green-strong"/>
            <span>My Key: {p.key.maxPerAction} pretend credits per choice, {remainingPeriod(p)} available this period. No real money.</span>
          </div>
        </div>
      </details>
      {pending ? (
        <p data-testid="home-parent-preview" className="mt-3 text-[13px] leading-6 text-family-action">
          Your next step includes a simulated Parent decision, shown when you select the main action above.
        </p>
      ) : null}
    </div>
  );
}
