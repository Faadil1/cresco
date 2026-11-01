"use client";

import type { ReactNode } from "react";
import { GoalArt } from "@/components/illustrations/objects";
import { StoryVignette } from "@/components/illustrations/family-story";
import { useFamilyStory } from "@/components/family-story-provider";
import { ChapterNav, ResultCard, primaryBtn } from "@/components/family-story-ui";
import { PRACTICE_GOALS, remainingCredits } from "@/lib/family-public-practice";
import { GOAL_STORY, INTERESTS } from "@/lib/family-story-state";

const tone = { bike: "bg-blue-soft", gaming: "bg-pink-soft", trip: "bg-aqua-soft" } as const;

/** Adapted from the old /onboarding/* journey: one decision per route,
 * centered editorial frame, progress and persistent next action. */
function FamilyOnboardingScene({ step, title, subtitle, children, footer, testId }: {
  step: 1 | 2 | 3;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
  testId: string;
}) {
  return (
    <div data-testid={testId} className="mx-auto flex min-h-[calc(100dvh-150px)] w-full max-w-[620px] flex-col px-0 pb-6">
      <header className="pt-2 text-center">
        <div className="mb-6 flex items-center gap-3">
          <div role="progressbar" aria-label="Setup progress" aria-valuemin={1} aria-valuemax={3} aria-valuenow={step}
            className="h-2.5 flex-1 overflow-hidden rounded-full bg-green-soft">
            <div className="h-full rounded-full bg-green-strong transition-[width] duration-300"
              style={{ width: String(step / 3 * 100) + "%" }}/>
          </div>
          <span className="shrink-0 text-[12px] font-semibold text-ink-2">{step} of 3</span>
        </div>
        <p className="cresco-section-kicker">Cresco Family · Getting started</p>
        <h1 className="mx-auto mt-2 max-w-[19ch] font-display text-[clamp(30px,6vw,43px)] leading-[1.07] text-navy-strong">{title}</h1>
        <p className="mx-auto mt-3 max-w-[40ch] text-[14px] leading-6 text-ink-2">{subtitle}</p>
      </header>
      <div className="cresco-editorial-panel mt-6 flex-1 rounded-[24px] bg-surface p-5 md:flex-none md:p-7">{children}</div>
      <div className="sticky bottom-0 z-10 mt-auto bg-gradient-to-t from-bg via-bg to-bg/0 pt-3">{footer}</div>
    </div>
  );
}

/** Original-style step 1: the goal is the ONLY content, not a long form. */
export function GoalChapter() {
  const { story, dispatch } = useFamilyStory();
  const p = story.practice;
  const goal = PRACTICE_GOALS.find(item => item.id === p.goalId)!;
  const g = GOAL_STORY[goal.id];
  return (
    <FamilyOnboardingScene step={1} testId="goal-scene-dream" title="What are you saving for?"
      subtitle="Choose a dream. Your lessons and choices will follow it. No name or age needed."
      footer={<ChapterNav back={{ href: "/try", label: "Welcome" }}
        next={{ href: "/try/goal/interests", label: story.goalChosen ? "Next" : "Choose a goal to continue", disabled: !story.goalChosen }}/>}>
      <div role="radiogroup" aria-label="Saving goal" className="grid grid-cols-3 gap-2 md:gap-3">
        {PRACTICE_GOALS.map(option => {
          const selected = p.goalId === option.id && story.goalChosen;
          return (
            <button key={option.id} type="button" role="radio" aria-checked={selected}
              onClick={() => dispatch({ type: "practice", action: { type: "set-goal", goalId: option.id } })}
              className={["relative flex min-h-[155px] flex-col items-center justify-center gap-2 rounded-[22px] border-2 p-2 text-center transition-colors",
                tone[option.id], selected ? "border-family-action ring-2 ring-family-action" : "border-line-soft"].join(" ")}>
              <GoalArt goal={option.id} className="h-16 w-20 md:h-20 md:w-28"/>
              <span className="text-[13px] font-bold leading-4 text-navy-strong md:text-[15px]">{option.label}</span>
              <span className="text-[11px] text-ink-2">{option.target} credits</span>
            </button>
          );
        })}
      </div>
      {story.goalChosen ? (
        <div className="mt-4">
          <ResultCard tone="good" title={"Goal: " + goal.label + ". It is " + g.horizon + " away."} testId="goal-result">{g.stance}</ResultCard>
        </div>
      ) : <p className="mt-4 text-center text-[13px] text-ink-2">Choose one to continue. You can change it any time.</p>}
    </FamilyOnboardingScene>
  );
}

/** Original-style step 2: interests are optional and have their own route. */
export function InterestsChapter() {
  const { story, dispatch } = useFamilyStory();
  return (
    <FamilyOnboardingScene step={2} testId="goal-scene-interests" title="What do you love?"
      subtitle="You will meet invented people behind things you enjoy. Pick any, or skip."
      footer={<ChapterNav back={{ href: "/try/goal", label: "My goal" }}
        next={{ href: "/try/goal/ready", label: story.interests.length ? "Next" : "Skip for now" }}/>}>
      <div className="flex flex-wrap justify-center gap-2.5" role="group" aria-label="Interests">
        {INTERESTS.map(item => {
          const on = story.interests.includes(item.id);
          return (
            <button key={item.id} type="button" aria-pressed={on}
              onClick={() => dispatch({ type: "toggle-interest", id: item.id })}
              className={["min-h-12 rounded-full border px-5 text-[14px] font-semibold",
                on ? "border-green-strong bg-green-soft text-green-strong" : "border-line bg-surface-soft text-navy-strong"].join(" ")}>
              {item.label}
            </button>
          );
        })}
      </div>
      <p className="mt-5 text-center text-[13px] leading-6 text-ink-2" data-testid="interest-consequence">
        {story.interests.length ? "People and companies you like will show up first in Explore." : "It's okay to skip. You can meet everyone in Explore later."}
      </p>
    </FamilyOnboardingScene>
  );
}

/** Original-style step 3: celebration and launch, not a long settings form. */
export function ReadyChapter() {
  const { story, dispatch } = useFamilyStory();
  const goal = PRACTICE_GOALS.find(item => item.id === story.practice.goalId)!;
  const p = story.practice;
  return (
    <FamilyOnboardingScene step={3} testId="goal-scene-ready" title="You're all set."
      subtitle={"Your Home is ready, with a first lesson picked for your " + goal.label.toLowerCase() + "."}
      footer={<ChapterNav back={{ href: "/try/goal/interests", label: "My interests" }}
        next={{ href: "/try/home", label: "Open my Home" }}/>}>
      <div className="mx-auto max-w-[96px] overflow-hidden rounded-[18px] border border-line-soft md:max-w-[152px]">
        <StoryVignette role="teen" className="block h-auto w-full" title="A fictional child ready to begin learning"/>
      </div>
      <div className="mt-3 rounded-[14px] bg-green-soft px-3 py-3 text-[13px] leading-5 text-navy-strong" data-testid="ready-safety-summary">
        <p><strong>Your dream:</strong> {goal.label}. Learning helps you protect it.</p>
        <p className="mt-1"><strong>My Key:</strong> Try up to {p.key.maxPerAction} fictional credits alone; a simulated Parent decides once on bigger choices.</p>
        <p className="mt-1 text-[12px] text-ink-2">Practice only. No money moves; no guardian identity is verified.</p>
      </div>
      <details className="mt-3 rounded-[14px] border border-line-soft bg-surface-soft p-3" data-testid="ready-optional-saving">
        <summary className="cursor-pointer text-[13px] font-semibold text-navy-strong">Optional: set aside credits for my goal</summary>
        <p className="mt-2 text-[12px] text-ink-2">You have 100 pretend credits. Saving is separate from fictional investment choices.</p>
        <p data-testid="goal-progress" className="mt-2 text-[13px] text-navy-strong">{p.saved} of {goal.target} credits set aside for your {goal.label.toLowerCase()} · {remainingCredits(p)} still available</p>
        <button type="button" className={["mt-3", primaryBtn].join(" ")} disabled={remainingCredits(p) < 20}
          onClick={() => dispatch({ type: "practice", action: { type: "save" } })}>Set aside 20 credits</button>
      </details>
    </FamilyOnboardingScene>
  );
}
