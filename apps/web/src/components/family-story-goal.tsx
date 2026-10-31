"use client";

import { GoalArt } from "@/components/illustrations/objects";
import { PlantPot } from "@/components/illustrations/objects";
import { useFamilyStory } from "@/components/family-story-provider";
import { ChapterHeading, ChapterNav, ResultCard, panel, secondaryBtn } from "@/components/family-story-ui";
import { PRACTICE_GOALS, remainingCredits } from "@/lib/family-public-practice";
import { GOAL_STORY, INTERESTS } from "@/lib/family-story-state";

const tone = { bike: "bg-blue-soft", gaming: "bg-pink-soft", trip: "bg-aqua-soft" } as const;

export function GoalChapter() {
  const { story, dispatch } = useFamilyStory();
  const p = story.practice;
  const goal = PRACTICE_GOALS.find(item => item.id === p.goalId)!;
  const g = GOAL_STORY[goal.id];
  return (
    <div className="space-y-6">
      <ChapterHeading kicker="Chapter 1 · My goal" title="What are you saving for?"
        intro="Pick a goal. The lessons and the companies you meet next will point back to it. No name or age needed."
        art={<PlantPot className="mx-auto h-auto w-40 motion-safe:animate-bloom md:w-48"/>}/>

      <div role="radiogroup" aria-label="Saving goal" className="grid grid-cols-3 gap-2 md:gap-4">
        {PRACTICE_GOALS.map(option => {
          const selected = p.goalId === option.id && story.goalChosen;
          return (
            <button key={option.id} type="button" role="radio" aria-checked={selected}
              onClick={() => dispatch({ type: "practice", action: { type: "set-goal", goalId: option.id } })}
              className={`flex min-h-[148px] flex-col items-center justify-center gap-2 rounded-[22px] border-2 p-2 text-center md:min-h-[200px] ${tone[option.id]} ${selected ? "border-blue-strong shadow-soft" : "border-transparent"}`}>
              <GoalArt goal={option.id} className="h-16 w-20 md:h-24 md:w-32"/>
              <span className="text-[14px] font-bold leading-4 text-navy-strong md:text-[17px]">{option.label}</span>
              <span className="text-[11px] text-ink-2 md:text-[12px]">{option.target} credits</span>
            </button>
          );
        })}
      </div>

      {story.goalChosen ? (
        <ResultCard tone="good" title={`Goal: ${goal.label}. It is ${g.horizon} away.`} testId="goal-result">
          {g.stance}
        </ResultCard>
      ) : <p className="text-[13px] text-ink-2">Choose one to continue. You can change it any time.</p>}

      <section aria-labelledby="interests-title" className={panel}>
        <h2 id="interests-title" className="font-display text-[26px] text-navy-strong">What do you like? <span className="text-[14px] font-sans font-normal text-ink-3">(optional)</span></h2>
        <p className="mt-1 text-[13px] text-ink-2">We will show matching invented companies first. Pick as many as you like, or skip.</p>
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Interests">
          {INTERESTS.map(item => {
            const on = story.interests.includes(item.id);
            return (
              <button key={item.id} type="button" aria-pressed={on} onClick={() => dispatch({ type: "toggle-interest", id: item.id })}
                className={`min-h-12 rounded-full border px-4 text-[14px] font-bold ${on ? "border-green-strong bg-green-soft text-green-strong" : "border-line bg-surface text-navy-strong"}`}>
                {item.label}
              </button>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="start-saving-title" className={panel}>
        <h2 id="start-saving-title" className="font-display text-[26px] text-navy-strong">Set your first credits aside</h2>
        <p className="mt-1 text-[13px] text-ink-2">Optional. These are pretend credits. You start with 100.</p>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-surface-soft" role="progressbar" aria-label="Goal progress"
          aria-valuemin={0} aria-valuemax={goal.target} aria-valuenow={Math.min(p.saved, goal.target)}>
          <div className="h-full rounded-full bg-green-strong" style={{ width: `${Math.min(100, p.saved / goal.target * 100)}%` }}/>
        </div>
        <p className="mt-2 text-[13px] text-navy-strong" data-testid="goal-progress">{p.saved} of {goal.target} credits set aside for your {goal.label.toLowerCase()} · {remainingCredits(p)} still available</p>
        <button type="button" className={`mt-3 ${secondaryBtn}`} disabled={remainingCredits(p) < 20}
          onClick={() => dispatch({ type: "practice", action: { type: "save" } })}>Set aside 20 credits</button>
      </section>

      <ChapterNav back={{ href: "/try", label: "Welcome" }}
        next={{ href: "/try/learn", label: story.goalChosen ? "My learning path" : "Choose a goal to continue", disabled: !story.goalChosen }}/>
    </div>
  );
}
