"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Building2, ChevronRight, KeyRound, PiggyBank, Users } from "lucide-react";
import { GoalArt } from "@/components/illustrations/objects";
import { useFamilyStory, useRealMarketPractice } from "@/components/family-story-provider";
import { JourneyTrack, LOOP_STEPS, RealityTag, kicker, pageTitle, panel, primaryBtn } from "@/components/family-story-ui";
import { summarizeRealMarket } from "@/lib/family-real-market-sandbox";
import { remainingCredits, remainingPeriod, selectedPracticeGoal } from "@/lib/family-public-practice";
import { GOAL_STORY, chapterStatus, childPathFor, nextMission } from "@/lib/family-story-state";

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
          <p className="text-[12px] font-bold text-ink-2">Saving for</p>
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
  const { market } = useRealMarketPractice();
  const p = story.practice;
  const goal = selectedPracticeGoal(p);
  const mission = nextMission(story);
  const status = chapterStatus(story);
  const free = remainingCredits(p);
  const lessons = childPathFor(goal.id);
  const pending = p.requests.some(request => request.status === "pending" || request.status === "approved-once");
  const paper = summarizeRealMarket(market);

  return (
    <div className="pt-2 md:pt-8" data-testid="home-screen">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className={`${kicker} text-green-strong`}>My Cresco</p>
          <h1 className={`mt-1 ${pageTitle}`}>{story.goalChosen ? `Saving for a ${goal.label.toLowerCase()}` : "Ready for your next step?"}</h1>
        </div>
        <RealityTag kind="pretend" label="Pretend credits · no real money"/>
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-6">
        <div className="min-w-0 space-y-4">
          <section className="relative overflow-hidden rounded-[24px] border border-family-action/20 bg-family-action-soft px-5 py-5 md:px-7 md:py-7"
            data-testid="home-focus" aria-label="Your next step">
            <div data-testid="home-mission" data-mission={mission.id} className="relative z-10 md:max-w-[70%]">
              <p className={`${kicker} text-family-action`}>{mission.kicker}</p>
              <h2 className="mt-1.5 font-display text-[24px] leading-tight text-navy-strong md:text-[30px]">{mission.title}</h2>
              <p className="mt-2 max-w-[46ch] text-[15px] leading-6 text-navy">{mission.body}</p>
              <Link href={mission.href} className={`mt-4 w-full sm:w-auto ${primaryBtn}`} data-testid="home-mission-go">
                {mission.cta}<ArrowRight aria-hidden className="size-4"/>
              </Link>
            </div>
            <GoalArt goal={goal.id} className="pointer-events-none absolute -bottom-2 right-3 hidden h-[130px] w-[160px] opacity-90 md:block"/>
          </section>

          <section className={`${panel} !p-4 md:!p-5`} aria-labelledby="loop-title">
            <div className="mb-2 flex items-baseline justify-between gap-2">
              <h2 id="loop-title" className="text-[16px] font-extrabold text-navy-strong">My learning loop</h2>
              <p className="text-[13px] text-ink-2" data-testid="home-loop-count">{LOOP_STEPS.filter(step => status[step.id]).length} of 5 done</p>
            </div>
            <JourneyTrack status={status}/>
            {LOOP_STEPS.every(step => status[step.id]) ? (
              <p className="mt-3 rounded-[14px] bg-green-soft px-3 py-2 text-[14px] leading-6 text-navy-strong" data-testid="home-loop-complete">
                <strong>You finished a full round.</strong> Every new lesson, person and choice makes the next round count. The next step is above.
              </p>
            ) : null}
          </section>

          {pending ? (
            <p data-testid="home-parent-preview" className="flex items-start gap-2 rounded-[16px] border border-lavender/30 bg-lavender-soft px-4 py-3 text-[14px] leading-6 text-navy-strong">
              <Users aria-hidden className="mt-1 size-4 shrink-0 text-lavender"/>
              <span>Something is with your Parent. The button above shows you exactly what to do next.</span>
            </p>
          ) : null}
        </div>

        <aside className="min-w-0 space-y-4" aria-label="My credits and key">
          <section className={`${panel} !p-4 md:!p-5`} data-testid="home-goal-summary" aria-labelledby="wallet-title">
            <div className="flex items-center gap-3">
              <GoalArt goal={goal.id} className="h-12 w-14 shrink-0"/>
              <div className="min-w-0 flex-1">
                <h2 id="wallet-title" className="text-[16px] font-extrabold text-navy-strong">{story.goalChosen ? goal.label : "Your dream"}</h2>
                <p className="text-[13px] text-ink-2">{GOAL_STORY[goal.id].horizon} away</p>
              </div>
              <p className="text-right text-[13px] text-ink-2"><strong className="block text-[20px] text-navy-strong" data-testid="home-goal-saved">{p.saved}/{goal.target}</strong>saved</p>
            </div>
            <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-surface-soft" role="img" data-testid="home-credit-bar"
              aria-label={`Out of 100 pretend credits: ${p.saved} saved for your goal, ${p.spent} used in practice choices, ${free} free`}>
              <span className="bg-green-strong" style={{ width: `${p.saved}%` }}/>
              <span className="bg-yellow" style={{ width: `${p.spent}%` }}/>
            </div>
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-ink-2">
              <li><span aria-hidden className="mr-1.5 inline-block size-2.5 rounded-full bg-green-strong"/>Saved {p.saved}</li>
              <li><span aria-hidden className="mr-1.5 inline-block size-2.5 rounded-full bg-yellow"/>In practice {p.spent}</li>
              <li><span aria-hidden className="mr-1.5 inline-block size-2.5 rounded-full border border-line bg-surface-soft"/>Free {free}</li>
            </ul>
            {story.goalChosen ? (
              <button type="button" disabled={free < 20} data-testid="home-save"
                onClick={() => dispatch({ type: "practice", action: { type: "save" } })}
                className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-full border border-green/40 bg-surface px-4 text-[14px] font-bold text-green-strong hover:bg-green-soft disabled:opacity-50">
                <PiggyBank aria-hidden className="size-4"/>Set aside 20 for my goal
              </button>
            ) : null}
            <p className="mt-3 flex items-start gap-2 border-t border-line-soft pt-3 text-[13px] leading-5 text-navy" data-testid="home-key">
              <KeyRound aria-hidden className="mt-0.5 size-4 shrink-0 text-green-strong"/>
              <span><strong>My Key:</strong> I decide alone up to {p.key.maxPerAction} credits a choice ({remainingPeriod(p)} left this period). Bigger choices go to my Parent.</span>
            </p>
          </section>

          <nav aria-label="More to do" className="grid gap-2">
            <Link href="/try/learn" className={`${panel} flex items-center gap-3 !p-4 hover:border-family-action/40`} data-testid="home-to-learn">
              <BookOpen aria-hidden className="size-5 shrink-0 text-family-action"/>
              <span className="min-w-0 flex-1"><span className="block text-[15px] font-bold text-navy-strong">Lessons</span>
                <span className="block text-[13px] text-ink-2">{p.childCompleted.length} of {lessons.length} done</span></span>
              <ChevronRight aria-hidden className="size-5 text-ink-2"/>
            </Link>
            <Link href="/try/explore/real" className={`${panel} flex items-center gap-3 !p-4 hover:border-blue/40`} data-testid="home-to-real">
              <Building2 aria-hidden className="size-5 shrink-0 text-blue-strong"/>
              <span className="min-w-0 flex-1"><span className="block text-[15px] font-bold text-navy-strong">Real companies</span>
                <span className="block text-[13px] text-ink-2">{paper.holdings.length ? `${paper.holdings.length} paper position${paper.holdings.length === 1 ? "" : "s"}` : "Apple, Microsoft, Costco, Shopify"}</span></span>
              <ChevronRight aria-hidden className="size-5 text-ink-2"/>
            </Link>
          </nav>
        </aside>
      </div>
    </div>
  );
}
