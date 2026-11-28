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
import { LESSON_CATALOGUE } from "./family-lesson-catalogue";

export type DecisionOption = {
  id: string;
  label: string;
  consequence: string;
  tone: "good" | "careful" | "risky";
  /** Worked numbers shown with the consequence. */
  numbers: { label: string; value: string }[];
};
export type DecideBeat = {
  kind: "decide"; id: string; title: string; situation: string; question: string; options: DecisionOption[]; insight: string;
  /** Optional invented price line to read before deciding (illustrative only). */
  chart?: { label: string; points: number[] };
};
export type LabBeat = {
  kind: "lab"; id: string; title: string; prompt: string;
  lab: "savings" | "drop" | "fees" | "profit" | "grocery";
  /** Slider range and starting value. */
  min: number; max: number; step: number; start: number;
};
export type CheckBeat = { kind: "check"; id: string; hints: [string, string, string] };
/** Put each item in the right group (tap a group per item; no dragging). Immediate, explained feedback. */
export type SortBeat = {
  kind: "sort"; id: string; title: string; prompt: string;
  buckets: { id: string; label: string }[];
  items: { id: string; label: string; bucket: string; why: string }[];
};
/** Share a total across buckets with + and - buttons until every rule holds. */
export type AllocateBeat = {
  kind: "allocate"; id: string; title: string; prompt: string; total: number; step: number;
  buckets: { id: string; label: string; min?: number; max?: number; start: number }[];
  success: string;
};
export type Beat = DecideBeat | LabBeat | CheckBeat | SortBeat | AllocateBeat;
export type InteractiveLesson = { id: string; intro: string; beats: Beat[]; /** What the Child should be able to do afterwards. */ objective?: string };

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
  if (beat.lab === "fees") {
    // 5 credits of gain a year for 5 years; the fee is taken every year.
    const gain = 5 * 5, fees = value * 5, kept = gain - fees;
    return { met: fees > gain / 2, text: `Gain over 5 years: ${gain} credits. Fees: ${value} a year x 5 = ${fees}. You keep ${kept}.` };
  }
  if (beat.lab === "profit") {
    const profit = 100 - value;
    return { met: profit === 0, text: profit > 0 ? `Sales 100 - costs ${value} = ${profit} credits of profit.` : profit < 0 ? `Sales 100 - costs ${value} = a loss of ${-profit} credits.` : "Sales 100 - costs 100 = 0. No profit and no loss: the break-even point." };
  }
  if (beat.lab === "grocery") {
    const left = 100 - 65 - value;
    return { met: left === 0, text: left > 0 ? `100 sales - 65 other costs - ${value} delivery = ${left} credits left.` : left < 0 ? `100 sales - 65 other costs - ${value} delivery = ${-left} credits short.` : "100 - 65 - 35 = 0. The shop only just covers its costs." };
  }
  const drop = priceDrop(20, value);
  return { met: drop.lost === 5, text: `20 credits become ${drop.afterDrop.toFixed(2)}. That is ${drop.lost.toFixed(2)} lost in the example.` };
}

/** Problems with an allocation, in plain words; empty means every rule holds. */
export function allocationProblems(beat: AllocateBeat, values: Record<string, number>): string[] {
  const sum = beat.buckets.reduce((total, b) => total + (values[b.id] ?? b.start), 0);
  const problems: string[] = [];
  if (sum < beat.total) problems.push(`${beat.total - sum} credits still to place.`);
  if (sum > beat.total) problems.push(`That is ${sum - beat.total} more than the ${beat.total} you have.`);
  for (const b of beat.buckets) {
    const v = values[b.id] ?? b.start;
    if (b.min !== undefined && v < b.min) problems.push(`${b.label} needs at least ${b.min}.`);
    if (b.max !== undefined && v > b.max) problems.push(`${b.label} is more than ${b.max}: too much in one place.`);
  }
  return problems;
}

/** What the "goal met" line says for a lab. */
export function labGoalMessage(beat: LabBeat, goal: LessonGoal): string {
  switch (beat.lab) {
    case "savings": return `A plan of 15 credits or less each period fits inside your Key, so you can keep saving for your ${goal.label.toLowerCase()} without asking.`;
    case "fees": return "A small fee that repeats every year can eat more than half of a gain. Always read the fees.";
    case "profit": return "Break-even: everything customers paid went on costs. Profit only starts after that point.";
    case "grocery": return "You found the delivery bill that wipes out Mina's earnings. More customers do not help if costs grow faster.";
    default: return "A 25% drop turns 20 credits into 15. You just measured a loss instead of guessing it.";
  }
}

/** Has the Child done enough in this beat to move on? A decision needs a pick; a lab needs its goal met. */
export type BeatState = {
  picked?: string | null; labValue?: number; correct?: boolean;
  sorted?: Record<string, string>; allocation?: Record<string, number>;
};
export function beatComplete(beat: Beat, state: BeatState, goal: LessonGoal): boolean {
  if (beat.kind === "decide") return Boolean(state.picked && beat.options.some(option => option.id === state.picked));
  if (beat.kind === "lab") return state.labValue !== undefined && labResult(beat, goal, state.labValue).met;
  if (beat.kind === "sort") return beat.items.every(item => state.sorted?.[item.id] === item.bucket);
  if (beat.kind === "allocate") return state.allocation !== undefined && allocationProblems(beat, state.allocation).length === 0;
  return state.correct === true;
}

export function interactiveLessonFor(id: string, goal: LessonGoal): InteractiveLesson | null {
  if (id === "c-save") {
    const g = goal.label.toLowerCase();
    const stillNeeded = Math.max(0, goal.target - 20);
    const afterDrop = priceDrop(20, 25).afterDrop;
    return {
      id, objective: "Keep money you need soon safe, and plan how much to set aside each period.",
      intro: `Three quick moves: decide, make a plan work, then check yourself. Your ${g} needs ${goal.target} pretend credits.`,
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
      id, objective: "See that spreading out changes how much one bad month can hurt, without removing risk.",
      intro: "Three quick moves: choose how to place 20 credits, measure a loss, then check yourself.",
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
  return LESSON_CATALOGUE[id] ?? null;
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
export const INTERACTIVE_LESSON_IDS = ["c-save", "c-risk", ...Object.keys(LESSON_CATALOGUE)] as readonly string[];
