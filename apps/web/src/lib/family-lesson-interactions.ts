/**
 * Interactive lesson beats (issue #130, P1). A lesson can be a short sequence
 * of micro-interactions instead of reading slides:
 *   decide  -> a relatable choice, then the consequence with worked numbers;
 *   lab     -> move a slider until a stated goal is met;
 *   check   -> the lesson's existing recall question, with a hint per wrong
 *              answer and free retries.
 * Pure data and arithmetic only: nothing here spends credits, changes the Key,
 * approves anything or persists. All numbers are invented classroom examples.
 */
import { priceDrop, savingsPlan } from "./family-learning-lab";

export type DecisionOption = {
  id: string;
  label: string;
  consequence: string;
  tone: "good" | "careful" | "risky";
  /** Worked numbers shown with the consequence. */
  numbers: { label: string; value: string }[];
};
export type DecideBeat = { kind: "decide"; id: string; title: string; situation: string; question: string; options: DecisionOption[]; insight: string };
export type LabBeat = {
  kind: "lab"; id: string; title: string; prompt: string;
  lab: "savings" | "drop";
  /** Slider range and starting value. */
  min: number; max: number; step: number; start: number;
};
export type CheckBeat = { kind: "check"; id: string; hints: [string, string, string] };
export type Beat = DecideBeat | LabBeat | CheckBeat;
export type InteractiveLesson = { id: string; intro: string; beats: Beat[] };

/** The goal context a lesson is personalised with (the Child's chosen goal). */
export type LessonGoal = { label: string; target: number; saved: number };

const credits = (n: number) => `${Number.isInteger(n) ? n : n.toFixed(1)} credits`;

/** Result of a lab position: the visible sentence and whether the goal is met. */
export function labResult(beat: LabBeat, goal: LessonGoal, value: number): { text: string; met: boolean } {
  if (beat.lab === "savings") {
    const plan = savingsPlan(goal.target, goal.saved, value);
    const met = plan.perPeriod <= 15;
    return {
      met,
      text: plan.stillNeeded === 0
        ? "You already have enough set aside. Nothing more to plan."
        : `${plan.stillNeeded} credits still needed ÷ ${plan.periods} period${plan.periods === 1 ? "" : "s"} = ${plan.perPeriod} credits each period.`,
    };
  }
  const drop = priceDrop(20, value);
  return { met: drop.lost === 5, text: `20 credits become ${drop.afterDrop.toFixed(2)}. That is ${drop.lost.toFixed(2)} lost in the example.` };
}

/** What the "goal met" line says for a lab. */
export function labGoalMessage(beat: LabBeat, goal: LessonGoal): string {
  return beat.lab === "savings"
    ? `A plan of 15 credits or less each period fits inside your Key, so you can keep saving for your ${goal.label.toLowerCase()} without asking.`
    : "A 25% drop turns 20 credits into 15. You just measured a loss instead of guessing it.";
}

/** Has the Child done enough in this beat to move on? A decision needs a pick; a lab needs its goal met. */
export function beatComplete(beat: Beat, state: { picked?: string | null; labValue?: number; correct?: boolean }, goal: LessonGoal): boolean {
  if (beat.kind === "decide") return Boolean(state.picked && beat.options.some(option => option.id === state.picked));
  if (beat.kind === "lab") return state.labValue !== undefined && labResult(beat, goal, state.labValue).met;
  return state.correct === true;
}

export function interactiveLessonFor(id: string, goal: LessonGoal): InteractiveLesson | null {
  if (id === "c-save") {
    const g = goal.label.toLowerCase();
    const stillNeeded = Math.max(0, goal.target - 20);
    const afterDrop = priceDrop(20, 25).afterDrop;
    return {
      id, intro: `Three quick moves: decide, make a plan work, then check yourself. Your ${g} needs ${goal.target} pretend credits.`,
      beats: [
        {
          kind: "decide", id: "save-decide", title: "A tempting tip",
          situation: `You have 20 pretend credits toward your ${g} (${goal.target} credits). A friend says: "Put all 20 into a company that always goes up!"`,
          question: "What do you do with your 20 credits?",
          options: [
            { id: "all-in", label: "Put all 20 into the company", tone: "risky",
              consequence: `Nothing "always goes up". If its price fell 25% before you needed it, your 20 would be worth about ${afterDrop}, and your ${g} moves further away.`,
              numbers: [{ label: "After a 25% drop", value: credits(afterDrop) }, { label: `Still needed for the ${g}`, value: credits(goal.target - afterDrop) }] },
            { id: "set-aside", label: `Set the 20 aside for my ${g}`, tone: "good",
              consequence: `Saved credits do not move with prices. You still need ${stillNeeded}, and you know exactly how far away you are.`,
              numbers: [{ label: "Still 20 safe", value: credits(20) }, { label: `Still needed for the ${g}`, value: credits(stillNeeded) }] },
            { id: "spend", label: "Spend it on snacks this week", tone: "careful",
              consequence: `That is your choice to make, but the ${g} starts again from zero.`,
              numbers: [{ label: "Saved", value: credits(0) }, { label: `Still needed for the ${g}`, value: credits(goal.target) }] },
          ],
          insight: "Money you need soon is usually saved, not risked. A goal with a date tells you how much uncertainty you can live with.",
        },
        { kind: "lab", id: "save-lab", lab: "savings", title: "Make the plan work",
          prompt: `Your Key lets you decide alone up to 15 credits at a time. Spread what you still need for your ${g} over enough practice periods that each one is 15 credits or less.`,
          min: 1, max: 8, step: 1, start: 1 },
        { kind: "check", id: "save-check", hints: [
          "A random pick ignores when you need the money. Think about your goal's date.",
          "",
          "Prices can fall as well as rise, and your goal's date does not move. What do you need to know first?",
        ] },
      ],
    };
  }
  if (id === "c-risk") {
    const allIn = priceDrop(20, 30).afterDrop;
    const split = priceDrop(10, 30).afterDrop + priceDrop(10, 15).afterDrop;
    return {
      id, intro: "Three quick moves: choose how to place 20 credits, measure a loss, then check yourself.",
      beats: [
        {
          kind: "decide", id: "risk-decide", title: "One company or two?",
          situation: "You want to practice with 20 pretend credits. Orchard Technology makes software for small shops. The Balanced Basket Fund holds a mix of many invented companies.",
          question: "How do you place your 20 credits?",
          options: [
            { id: "all-orchard", label: "All 20 in Orchard Technology", tone: "risky",
              consequence: `Then a bad month arrives: Orchard falls 30% and the Basket falls 15% (invented numbers). Everything you placed depended on one company, so you have ${allIn}.`,
              numbers: [{ label: "All in Orchard", value: credits(allIn) }, { label: "Split 10 + 10", value: credits(split) }] },
            { id: "split", label: "10 in Orchard, 10 in the Basket Fund", tone: "good",
              consequence: `Then a bad month arrives: Orchard falls 30% and the Basket falls 15% (invented numbers). You still lose, but less: you have ${split}.`,
              numbers: [{ label: "Split 10 + 10", value: credits(split) }, { label: "All in Orchard", value: credits(allIn) }] },
          ],
          insight: "Spreading out changes how much one company's bad news can hurt you. It does not remove the risk: both choices lost credits.",
        },
        { kind: "lab", id: "risk-lab", lab: "drop", title: "Measure a loss",
          prompt: "Imagine 20 pretend credits in one invented company. Move the slider to find the drop that would cost you exactly 5 credits.",
          min: 0, max: 50, step: 5, start: 0 },
        { kind: "check", id: "risk-check", hints: [
          "",
          `Look back at your choice: even the split lost ${(20 - split).toFixed(1)} credits. Spreading out does not remove losses.`,
          "Lessons build understanding, but they never change what prices do.",
        ] },
      ],
    };
  }
  return null;
}

/** Lesson chapters for the Learn page. Every Child lesson belongs to exactly one. */
export const LESSON_CHAPTERS: readonly { id: string; title: string; blurb: string; lessons: readonly string[] }[] = [
  { id: "money", title: "Money basics", blurb: "Goals, budgets, prices and staying safe",
    lessons: ["c-save", "c-budget", "c-price", "c-fees", "c-scams"] },
  { id: "companies", title: "Companies and shares", blurb: "What a company is and what owning a piece means",
    lessons: ["c-explore", "original-what-is-a-stock", "original-why-companies-sell-shares", "original-stock-vs-tokenized-security", "c-profit", "c-research"] },
  { id: "risk", title: "Risk and choices", blurb: "Why prices move and how to spread risk",
    lessons: ["c-risk", "original-why-prices-move", "original-risk-and-reward", "original-build-your-portfolio", "c-funds", "c-volatility"] },
];
export const INTERACTIVE_LESSON_IDS = ["c-save", "c-risk"] as const;
