"use client";

import Link from "next/link";
import { ArrowRight, KeyRound, PiggyBank, Target, Users } from "lucide-react";
import { GoalArt } from "@/components/illustrations/objects";
import { ExplorerKid, MountainScene } from "@/components/illustrations/adventure";
import { useFamilyStory } from "@/components/family-story-provider";
import { JourneyTrack, LOOP_STEPS, RealityTag, kicker, primaryBtn } from "@/components/family-story-ui";
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

/**
 * The goal jar: saved pretend credits shown as a glass jar filling up with
 * coins. Original artwork, a real text alternative, motion off when reduced.
 */
export function GoalJar({ saved, target, label, className = "h-[132px] w-[106px]" }: { saved: number; target: number; label: string; className?: string }) {
  const pct = Math.max(0, Math.min(1, target ? saved / target : 0));
  const fillTop = 136 - 92 * pct;
  const coins = Math.round(pct * 9);
  return (
    <svg viewBox="0 0 120 150" role="img" aria-label={`Goal jar for ${label}: ${saved} of ${target} pretend credits saved`} data-testid="goal-jar" className={`shrink-0 ${className}`}>
      <defs>
        <clipPath id="jar-inside"><path d="M24 40 Q14 46 14 60 V124 Q14 140 32 140 H88 Q106 140 106 124 V60 Q106 46 96 40 Z"/></clipPath>
        <linearGradient id="jar-liquid" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#6fd39b"/><stop offset="1" stopColor="#1f8a60"/></linearGradient>
      </defs>
      <ellipse cx="60" cy="144" rx="44" ry="5" fill="#102d36" opacity=".08"/>
      <g clipPath="url(#jar-inside)">
        <rect x="0" y="0" width="120" height="150" fill="#eef8f6"/>
        {pct > 0 ? (
          <g className="anim-fill">
            <rect x="0" y={fillTop} width="120" height={150 - fillTop} fill="url(#jar-liquid)"/>
            <path d={`M0 ${fillTop} q30 -5 60 0 t60 0 v4 h-120z`} fill="#a6e6c1" opacity=".7"/>
            {Array.from({ length: coins }, (_, i) => (
              <g key={i} transform={`translate(${30 + (i % 3) * 30 - (Math.floor(i / 3) % 2) * 8} ${132 - Math.floor(i / 3) * 9})`}>
                <ellipse rx="12" ry="5" fill="#d99a2b"/><ellipse cy="-2" rx="12" ry="5" fill="#f6c76a"/><ellipse cy="-2" rx="6" ry="2" fill="#ffe3a3"/>
              </g>
            ))}
          </g>
        ) : null}
      </g>
      <path d="M24 40 Q14 46 14 60 V124 Q14 140 32 140 H88 Q106 140 106 124 V60 Q106 46 96 40 Z" fill="none" stroke="#102d36" strokeWidth="3.5" strokeLinejoin="round"/>
      <rect x="26" y="26" width="68" height="16" rx="6" fill="#f6c76a" stroke="#102d36" strokeWidth="3"/>
      <path d="M38 28 v12 M50 28 v12 M62 28 v12 M74 28 v12 M86 28 v12" stroke="#d99a2b" strokeWidth="2"/>
      <rect x="36" y="16" width="48" height="12" rx="5" fill="#5936c7" stroke="#102d36" strokeWidth="3"/>
      <path d="M26 62 V118" stroke="#fff" strokeOpacity=".85" strokeWidth="6" strokeLinecap="round"/>
      <path d="M36 58 V70" stroke="#fff" strokeOpacity=".6" strokeWidth="4" strokeLinecap="round"/>
    </svg>
  );
}

export function HomeScreen() {
  const { story, dispatch } = useFamilyStory();
  const p = story.practice;
  const goal = selectedPracticeGoal(p);
  const mission = nextMission(story);
  const status = chapterStatus(story);
  const free = remainingCredits(p);
  const lessons = childPathFor(goal.id);
  const pending = p.requests.some(request => request.status === "pending" || request.status === "approved-once");
  const percent = Math.min(100, Math.round(p.saved / goal.target * 100));
  const goalName = story.goalChosen ? goal.label : "Your dream";
  const loopDone = LOOP_STEPS.filter(step => status[step.id]).length;

  return (
    <div className="pt-1 md:pt-4" data-testid="home-screen">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-x-6 lg:gap-y-5">
        {/* 1. The illustrated welcome: the real goal, never an invented child. */}
        <section className="order-1 relative isolate min-h-[196px] overflow-hidden rounded-[28px] bg-[linear-gradient(170deg,#4a2bab_0%,#5936c7_38%,#8a6ee6_72%,#c7b8f5_100%)] text-white sm:min-h-[300px] lg:col-span-2 lg:row-start-1 lg:min-h-[330px]"
          data-testid="home-focus" aria-labelledby="home-title">
          <MountainScene explorer={false} className="pointer-events-none absolute bottom-0 right-0 -z-10 h-[64%] w-full sm:h-[70%] lg:h-full lg:w-[66%]"/>
          <ExplorerKid className="pointer-events-none absolute bottom-2 right-3 -z-10 h-[124px] w-[74px] sm:bottom-6 sm:right-[12%] sm:h-[150px] sm:w-[90px] lg:bottom-16 lg:right-auto lg:left-[44%] lg:h-[190px] lg:w-[114px]"/>
          <div className="max-w-[72%] px-5 pb-5 pt-5 sm:max-w-[60%] sm:px-7 sm:pt-7 lg:max-w-[44%] lg:px-10 lg:pt-10">
            <div className="flex flex-wrap items-center gap-2">
              <p className={`${kicker} text-white/90`}>My Cresco</p>
              <RealityTag kind="pretend" label="Pretend credits · no real money"/>
            </div>
            <h1 id="home-title" className="mt-2 font-display text-[26px] leading-[1.1] sm:text-[34px] lg:text-[40px]">
              {story.goalChosen ? <>On the trail to your {goal.label.toLowerCase()}</> : <>Your money adventure starts here</>}
            </h1>
            <p className="mt-2 hidden max-w-[34ch] text-[16px] font-semibold leading-6 text-white/90 sm:block">
              {story.goalChosen
                ? (p.saved ? `${percent}% of the way there, one step at a time.` : "Every step on the trail teaches you something new.")
                : "Pick something to save for, then learn, meet, decide and talk it through."}
            </p>
          </div>
        </section>

        {/* 2. The goal jar: the real saved and target values from the practice state. */}
        <section className="family-card order-4 relative z-10 border border-line-soft p-4 sm:p-5 lg:col-start-2 lg:row-start-2 lg:mx-0 lg:-mt-20 lg:mr-5 lg:self-start lg:p-5"
          data-testid="home-goal-summary" aria-labelledby="wallet-title">
          <div className="flex items-center gap-4">
            <div className="flex shrink-0 justify-center rounded-[20px] bg-[radial-gradient(circle_at_50%_70%,#ddf5e8,transparent_70%)]">
              <GoalJar saved={p.saved} target={goal.target} label={story.goalChosen ? goal.label : "your dream"} className="h-[112px] w-[90px] lg:h-[128px] lg:w-[102px]"/>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold text-ink-2">Your goal</p>
              <h2 id="wallet-title" className="flex items-center gap-2 font-display text-[22px] leading-7 text-navy-strong">
                {goalName}{story.goalChosen ? <GoalArt goal={goal.id} className="h-7 w-9 shrink-0"/> : null}
              </h2>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-green-soft" role="progressbar" aria-label={`${goalName} savings`} aria-valuemin={0} aria-valuemax={goal.target} aria-valuenow={p.saved}>
                  <div className="h-full rounded-full bg-[linear-gradient(90deg,#2f9e6b,#147b56)]" style={{ width: `${percent}%` }}/>
                </div>
                <span className="text-[15px] font-extrabold text-green-strong">{percent}%</span>
              </div>
              <p className="mt-1 text-[14px] text-ink-2"><strong className="text-navy-strong" data-testid="home-goal-saved">{p.saved}/{goal.target}</strong> pretend credits saved · {GOAL_STORY[goal.id].horizon} away</p>
            </div>
          </div>
          {story.goalChosen ? (
            <button type="button" disabled={free < 20} data-testid="home-save"
              onClick={() => dispatch({ type: "practice", action: { type: "save" } })}
              className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-full border-2 border-green-strong/30 bg-surface px-4 text-[14px] font-extrabold text-green-strong hover:bg-green-soft disabled:opacity-50">
              <PiggyBank aria-hidden className="size-4"/>Set aside 20 for my goal
            </button>
          ) : null}
        </section>

        {/* 3. One next mission, one primary action. */}
        <section className="family-card order-2 relative z-10 border border-family-action/15 p-4 sm:p-6 lg:col-start-1 lg:row-start-2 lg:ml-5 lg:-mt-20"
          data-testid="home-mission" data-mission={mission.id} aria-labelledby="mission-title">
          <div className="flex items-start gap-4">
            <span aria-hidden className="hidden size-14 shrink-0 place-items-center rounded-[18px] bg-family-action-soft text-family-action sm:grid"><Target className="size-7"/></span>
            <div className="min-w-0 flex-1">
              <p className={`${kicker} text-family-action`}>Your next mission · {mission.kicker.replace(/^Today's mission · /i, "")}</p>
              <h2 id="mission-title" className="mt-1 font-display text-[23px] leading-tight text-navy-strong md:text-[27px]">{mission.title}</h2>
              <p className="mt-1.5 max-w-[52ch] text-[15px] leading-6 text-navy">{mission.body}</p>
              <Link href={mission.href} className={`mt-4 w-full sm:w-auto ${primaryBtn}`} data-testid="home-mission-go">
                {mission.cta}<ArrowRight aria-hidden className="size-4"/>
              </Link>
              {pending ? (
                <p data-testid="home-parent-preview" className="mt-4 flex items-start gap-2 rounded-[18px] border border-family-action/20 bg-lavender-soft px-4 py-3 text-[14px] leading-6 text-navy-strong">
                  <Users aria-hidden className="mt-1 size-4 shrink-0 text-family-action"/>
                  <span>Something is with your Parent. This mission shows you exactly what to do next.</span>
                </p>
              ) : null}
            </div>
          </div>
        </section>


        {/* 4. The learning loop as a short trail. */}
        <section className="family-card order-3 border border-line-soft p-4 md:p-5 lg:col-start-1 lg:row-start-3" aria-labelledby="loop-title">
          <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="loop-title" className="font-display text-[18px] text-navy-strong">My learning loop</h2>
            <p className="text-[13px] text-ink-2"><span data-testid="home-loop-count">{loopDone} of 5 done</span> · <Link href="/try/learn" className="font-bold text-family-action underline-offset-4 hover:underline" data-testid="home-to-learn">{p.childCompleted.length} of {lessons.length} lessons</Link></p>
          </div>
          <JourneyTrack status={status}/>
          {loopDone === LOOP_STEPS.length ? (
            <p className="mt-3 rounded-[14px] bg-green-soft px-3 py-2 text-[14px] leading-6 text-navy-strong" data-testid="home-loop-complete">
              <strong>You finished a full round.</strong> Every new lesson, person and choice makes the next round count. Your next mission is above.
            </p>
          ) : null}
        </section>

        {/* Credits and My Key: under the goal on desktop, below the loop on phones (never above the mission). */}
        <section className="family-card order-5 border border-line-soft p-4 lg:col-start-2 lg:row-start-3 lg:self-start lg:p-5" aria-label="My credits and key">
          <div className="flex h-2.5 overflow-hidden rounded-full bg-surface-soft" role="img" data-testid="home-credit-bar"
            aria-label={`Out of 100 pretend credits: ${p.saved} saved for your goal, ${p.spent} used in practice choices, ${free} free`}>
            <span className="bg-green-strong" style={{ width: `${p.saved}%` }}/>
            <span className="bg-yellow" style={{ width: `${p.spent}%` }}/>
          </div>
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-ink-2">
            <li><span aria-hidden className="mr-1.5 inline-block size-2.5 rounded-full bg-green-strong"/>Saved {p.saved}</li>
            <li><span aria-hidden className="mr-1.5 inline-block size-2.5 rounded-full bg-yellow"/>In practice {p.spent}</li>
            <li><span aria-hidden className="mr-1.5 inline-block size-2.5 rounded-full border border-line bg-surface-soft"/>Free {free}</li>
          </ul>
          <p className="mt-3 flex items-start gap-2 border-t border-line-soft pt-3 text-[13px] leading-5 text-navy" data-testid="home-key">
            <KeyRound aria-hidden className="mt-0.5 size-4 shrink-0 text-green-strong"/>
            <span><strong>My Key:</strong> I decide alone up to {p.key.maxPerAction} credits a choice ({remainingPeriod(p)} left this period). Bigger choices go to my Parent.</span>
          </p>
        </section>
      </div>
    </div>
  );
}
