"use client";

import Link from "next/link";
import { GoalArt } from "@/components/illustrations/objects";
import { StoryVignette } from "@/components/illustrations/family-story";
import { useFamilyStory } from "@/components/family-story-provider";
import { ChapterHeading, ChapterNav, ResultCard, panel, primaryBtn } from "@/components/family-story-ui";
import { PRACTICE_GOALS, remainingCredits } from "@/lib/family-public-practice";
import { GOAL_STORY, INTERESTS } from "@/lib/family-story-state";

const tone = { bike: "bg-blue-soft", gaming: "bg-pink-soft", trip: "bg-aqua-soft" } as const;

/** Separate URLs and screens, not three sections in one form. */
function SceneSteps({ active }: { active: 1 | 2 | 3 }) {
  const steps = [
    { number: 1, title: "My dream", href: "/try/goal" },
    { number: 2, title: "My world", href: "/try/goal/interests" },
    { number: 3, title: "My first step", href: "/try/goal/save" },
  ] as const;
  return (
    <nav aria-label="My goal story scenes" className="grid grid-cols-3 gap-2">
      {steps.map(step => (
        <Link key={step.number} href={step.href} aria-current={step.number === active ? "step" : undefined}
          className={["rounded-xl border px-3 py-3 text-center text-[12px] font-semibold md:text-[14px]",
            step.number === active ? "border-green-strong bg-green-soft text-green-strong" : "border-line-soft bg-surface text-navy-strong"].join(" ")}>
          <span className="block text-[10px] uppercase tracking-wider">Scene {step.number} of 3</span>
          <span className="block">{step.title}</span>
        </Link>
      ))}
    </nav>
  );
}

/** Scene 1 — the dream has its own page and the first decision is immediate. */
export function GoalChapter() {
  const { story, dispatch } = useFamilyStory();
  const p = story.practice;
  const goal = PRACTICE_GOALS.find(item => item.id === p.goalId)!;
  const g = GOAL_STORY[goal.id];
  return (
    <div className="space-y-5" data-testid="goal-scene-dream">
      <SceneSteps active={1}/>
      <section className="rounded-[28px] border border-line-soft bg-surface p-5 shadow-sm md:p-9">
        <div className="grid items-center gap-5 md:grid-cols-[1fr_220px]">
          <ChapterHeading kicker="Chapter 1 · Scene 1 · The dream" title="What are you saving for?"
            intro="Every journey begins with something you care about. Pick a dream to protect. No name or account needed."/>
          <StoryVignette role="teen" className="hidden h-auto w-full rounded-[20px] md:block"
            title="A child imagining their saving goal"/>
        </div>
        <div role="radiogroup" aria-label="Saving goal" className="mt-5 grid grid-cols-3 gap-2 md:gap-4">
          {PRACTICE_GOALS.map(option => {
            const selected = p.goalId === option.id && story.goalChosen;
            return (
              <button key={option.id} type="button" role="radio" aria-checked={selected}
                onClick={() => dispatch({ type: "practice", action: { type: "set-goal", goalId: option.id } })}
                className={["flex min-h-[148px] flex-col items-center justify-center gap-2 rounded-[22px] border-2 p-2 text-center md:min-h-[200px]",
                  tone[option.id], selected ? "border-blue-strong shadow-soft" : "border-transparent"].join(" ")}>
                <GoalArt goal={option.id} className="h-16 w-20 md:h-24 md:w-32"/>
                <span className="text-[14px] font-bold leading-4 text-navy-strong md:text-[17px]">{option.label}</span>
                <span className="text-[11px] text-ink-2 md:text-[12px]">{option.target} credits</span>
              </button>
            );
          })}
        </div>
        <div className="mt-5">
          {story.goalChosen ? (
            <ResultCard tone="good" title={"Goal: " + goal.label + ". It is " + g.horizon + " away."} testId="goal-result">{g.stance}</ResultCard>
          ) : <p className="text-[13px] text-ink-2">Choose one to continue. You can change it any time.</p>}
        </div>
      </section>
      <ChapterNav back={{ href: "/try", label: "Welcome" }}
        next={{ href: "/try/goal/interests", label: story.goalChosen ? "Next scene: my world" : "Choose a goal to continue", disabled: !story.goalChosen }}/>
    </div>
  );
}

/** Scene 2 — encounter fictional people through personal interests. */
export function InterestsChapter() {
  const { story, dispatch } = useFamilyStory();
  return (
    <div className="space-y-5" data-testid="goal-scene-interests">
      <SceneSteps active={2}/>
      <section className={[panel, "!p-5 md:!p-9"].join(" ")}>
        <div className="grid items-center gap-5 md:grid-cols-[1fr_230px]">
          <ChapterHeading kicker="Chapter 1 · Scene 2 · My world" title="Who will you meet?"
            intro="What do you enjoy? Your choices introduce fictional people facing interesting problems. Pick several or skip."/>
          <StoryVignette role="teen" className="hidden h-auto w-full rounded-[20px] md:block" title="A child discovering fictional people"/>
        </div>
        <div className="mt-5 grid gap-2 sm:grid-cols-2" role="group" aria-label="Interests">
          {INTERESTS.map(item => {
            const selected = story.interests.includes(item.id);
            return (
              <button key={item.id} type="button" aria-pressed={selected}
                onClick={() => dispatch({ type: "toggle-interest", id: item.id })}
                className={["min-h-20 rounded-[18px] border p-4 text-left text-navy-strong",
                  selected ? "border-green-strong bg-green-soft" : "border-line bg-surface-soft"].join(" ")}>
                <span className="block text-[15px] font-bold">{item.label}</span>
                <span className="mt-1 block text-[12px] leading-5 text-ink-2">{item.hint}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-4 text-[13px] leading-6 text-ink-2" data-testid="interest-consequence">
          {story.interests.length ? "Matching fictional stories will appear first when you explore." : "It's okay to skip. You can still explore every invented company."}
        </p>
      </section>
      <ChapterNav back={{ href: "/try/goal", label: "My dream" }}
        next={{ href: "/try/goal/save", label: "Next scene: my first step" }}/>
    </div>
  );
}

/** Scene 3 — savings and practice are explicitly separated. */
export function SavingsChapter() {
  const { story, dispatch } = useFamilyStory();
  const p = story.practice;
  const goal = PRACTICE_GOALS.find(item => item.id === p.goalId)!;
  return (
    <div className="space-y-5" data-testid="goal-scene-save">
      <SceneSteps active={3}/>
      <section className={[panel, "!p-5 md:!p-9"].join(" ")}>
        <div className="grid items-center gap-5 md:grid-cols-[1fr_230px]">
          <ChapterHeading kicker="Chapter 1 · Scene 3 · My first step" title="Protect the dream first."
            intro={<>You chose <strong>{goal.label.toLowerCase()}</strong>. Before meeting companies, decide whether to put 20 pretend credits aside. Saving and investment practice are separate.</>}/>
          <StoryVignette role="teen" className="hidden h-auto w-full rounded-[20px] md:block" title="A teenager considering savings"/>
        </div>
        <div className="mt-6 rounded-[22px] bg-green-soft p-5">
          <p className="text-[14px] font-semibold text-navy-strong">Your {goal.label.toLowerCase()} goal</p>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-surface" role="progressbar" aria-label="Goal progress"
            aria-valuemin={0} aria-valuemax={goal.target} aria-valuenow={Math.min(p.saved, goal.target)}>
            <div className="h-full rounded-full bg-green-strong" style={{ width: String(Math.min(100, p.saved / goal.target * 100)) + "%" }}/>
          </div>
          <p className="mt-3 text-[14px] text-navy-strong" data-testid="goal-progress">
            {p.saved} of {goal.target} credits set aside for your {goal.label.toLowerCase()} · {remainingCredits(p)} still available
          </p>
          <button type="button" className={["mt-4", primaryBtn].join(" ")} disabled={remainingCredits(p) < 20}
            onClick={() => dispatch({ type: "practice", action: { type: "save" } })}>Set aside 20 credits</button>
        </div>
        <p className="mt-4 text-[13px] text-ink-2">Optional. All credits are pretend. This doesn't buy an investment or change My Key.</p>
      </section>
      <ChapterNav back={{ href: "/try/goal/interests", label: "My world" }}
        next={{ href: "/try/learn", label: "My learning path" }}/>
    </div>
  );
}
