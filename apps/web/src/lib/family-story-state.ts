/**
 * Pure story layer above the practice engine. It adds only what a multi-page
 * journey needs (interests, which companies were opened or researched, the
 * Child's reason and the Parent's decline reason) and wraps the unchanged
 * practice reducer. Nothing here changes the Key, a request, a receipt or a
 * balance by itself: those change only through `transitionFamilyPractice`.
 */
import { FAMILY_EXPLORE_CASES, type FamilyExploreCase } from "./family-public-explore-data";
import {
  PRACTICE_ASSETS, initialFamilyPractice, selectedPracticeGoal, transitionFamilyPractice,
  type AssetCode, type FamilyPracticeState, type PracticeGoalId,
} from "./family-public-practice";

export type InterestId = "gadgets" | "food" | "moving" | "planet" | "health" | "mix";
export const INTERESTS: readonly { id: InterestId; label: string; caseId: string; hint: string }[] = [
  { id: "gadgets", label: "Apps & gadgets", caseId: "orchard", hint: "Software for shops" },
  { id: "food", label: "Food & shopping", caseId: "markets", hint: "Everyday groceries" },
  { id: "mix", label: "A bit of everything", caseId: "basket", hint: "A mixed basket" },
  { id: "moving", label: "Getting around", caseId: "river", hint: "Buses and transit" },
  { id: "planet", label: "Planet & energy", caseId: "greenroof", hint: "Rooftop solar" },
  { id: "health", label: "Health & helping", caseId: "harbor", hint: "Clinic equipment" },
];

export type ReasonId = "goal-fit" | "curious" | "small-try";
export const REASONS: readonly { id: ReasonId; label: string }[] = [
  { id: "goal-fit", label: "It fits what I am saving for" },
  { id: "curious", label: "I am curious how it behaves" },
  { id: "small-try", label: "I want to try a small practice choice" },
];
export type DeclineReasonId = "too-big" | "talk-first" | "not-yet";
export const DECLINE_REASONS: readonly { id: DeclineReasonId; label: string; explain: string }[] = [
  { id: "too-big", label: "That is a lot for one choice", explain: "Your Parent thought the amount was big for one choice. A smaller amount inside your Key needs no one's approval." },
  { id: "talk-first", label: "Let's talk about it first", explain: "Your Parent wants to talk before saying yes. That is a conversation, not a no forever." },
  { id: "not-yet", label: "Not yet", explain: "Your Parent wants to see how smaller choices go first. Decisions inside your Key can build that history." },
];

export type StoryState = {
  practice: FamilyPracticeState;
  goalChosen: boolean;
  interests: InterestId[];
  viewed: string[];
  researched: string[];
  pick: AssetCode | null;
  reasons: Record<number, ReasonId>;
  declineReasons: Record<number, DeclineReasonId>;
};
export function initialStory(): StoryState {
  return {
    practice: initialFamilyPractice(), goalChosen: false, interests: [], viewed: [], researched: [],
    pick: null, reasons: {}, declineReasons: {},
  };
}

type PracticeAction = Parameters<typeof transitionFamilyPractice>[1];
export type StoryAction =
  | { type: "practice"; action: PracticeAction; reason?: ReasonId; declineReason?: DeclineReasonId }
  | { type: "toggle-interest"; id: InterestId }
  | { type: "view-case"; id: string }
  | { type: "research-correct"; id: string }
  | { type: "pick-asset"; code: AssetCode | null };

const knownCase = (id: string) => FAMILY_EXPLORE_CASES.some(item => item.id === id);
const add = (list: string[], id: string) => list.includes(id) ? list : [...list, id];

export function transitionStory(s: StoryState, action: StoryAction): StoryState {
  if (action.type === "practice") {
    if (action.action.type === "reset") return initialStory();
    const next = transitionFamilyPractice(s.practice, action.action);
    let { reasons, declineReasons, goalChosen } = s;
    if (action.action.type === "set-goal" && next.goalId === action.action.goalId) goalChosen = true;
    if (action.action.type === "buy") {
      const made = next.requests.find(r => !s.practice.requests.some(old => old.id === r.id));
      if (made) reasons = { ...reasons, [made.id]: action.reason ?? "curious" };
    }
    if (action.action.type === "respond" && action.action.choice === "decline") {
      const target = next.requests.find(r => r.id === (action.action as { id: number }).id);
      const before = s.practice.requests.find(r => r.id === target?.id);
      if (target?.status === "declined" && before?.status === "pending") {
        declineReasons = { ...declineReasons, [target.id]: action.declineReason ?? "talk-first" };
      }
    }
    return { ...s, practice: next, reasons, declineReasons, goalChosen };
  }
  if (action.type === "toggle-interest") {
    if (!INTERESTS.some(item => item.id === action.id)) return s;
    return { ...s, interests: s.interests.includes(action.id) ? s.interests.filter(id => id !== action.id) : [...s.interests, action.id] };
  }
  if (action.type === "view-case") return knownCase(action.id) ? { ...s, viewed: add(s.viewed, action.id) } : s;
  if (action.type === "research-correct") return knownCase(action.id) ? { ...s, researched: add(s.researched, action.id) } : s;
  if (action.type === "pick-asset") {
    if (action.code !== null && !PRACTICE_ASSETS.some(a => a.code === action.code)) return s;
    return { ...s, pick: action.code };
  }
  return s;
}

/** Interest-matched companies first; otherwise the original order. Stable. */
export function interestMatches(interests: readonly InterestId[], item: FamilyExploreCase) {
  return INTERESTS.filter(i => interests.includes(i.id) && i.caseId === item.id);
}
export function orderExploreCases(interests: readonly InterestId[], cases: readonly FamilyExploreCase[]) {
  return cases
    .map((item, index) => ({ item, index, match: interestMatches(interests, item).length > 0 }))
    .sort((a, b) => Number(b.match) - Number(a.match) || a.index - b.index)
    .map(entry => entry.item);
}

export type GoalStory = { horizon: string; stance: string };
export const GOAL_STORY: Record<PracticeGoalId, GoalStory> = {
  bike: { horizon: "a few months", stance: "You need it soon, so protecting what you saved matters more than chasing a big gain." },
  gaming: { horizon: "about half a year", stance: "A bigger purchase: save steadily, and keep your practice ideas separate from the saving." },
  trip: { horizon: "a year or more", stance: "With more time, ups and downs matter a little less, but nothing is guaranteed." },
};

type Topic = "save" | "own" | "why-sell" | "token" | "price" | "risk" | "mix";
const LESSON_TOPIC: Record<string, Topic> = {
  "c-save": "save", "c-explore": "own", "c-risk": "risk",
  "original-what-is-a-stock": "own", "original-why-companies-sell-shares": "why-sell",
  "original-stock-vs-tokenized-security": "token", "original-why-prices-move": "price",
  "original-risk-and-reward": "risk", "original-build-your-portfolio": "mix",
};
/** A sentence that ties a Child lesson to the goal the Child chose. */
export function childLessonNote(goal: { label: string } & { id: PracticeGoalId }, lessonId: string): string {
  const g = GOAL_STORY[goal.id];
  const label = goal.label.toLowerCase();
  switch (LESSON_TOPIC[lessonId]) {
    case "save": return `Your ${label} is a plan with a date, ${g.horizon} away. Money needed that soon is usually saved, not risked.`;
    case "own": return `Your ${label} is certain once you have the credits. A share is a piece of a business with no promise. Keep the two apart.`;
    case "why-sell": return `Companies sell shares to fund growth. That is worth knowing before any ${label} money goes anywhere near a price that can fall.`;
    case "token": return `A practice choice here is not a share or a token. It is a way to understand what it would mean, long before the ${label}.`;
    case "price": return `Prices move for reasons you can research. With a ${label} to protect, researching beats guessing.`;
    case "risk": return `If a price fell 20% right before you needed your ${label}, would you still reach it? Your time horizon is ${g.horizon}.`;
    case "mix": return `A mix of choices can soften one bad surprise on the way to your ${label}. It cannot remove the risk.`;
    default: return `${g.stance}`;
  }
}
const PARENT_NOTE: Record<string, (label: string, horizon: string) => string> = {
  "p-basics": (label, horizon) => `Your child is saving for a ${label}, ${horizon} away. Ask what it means to them before talking about investing.`,
  "p-key": (label) => `The Key is how your child practices alongside a ${label} goal: inside it they decide, outside it they ask you.`,
  "p-risk": (label, horizon) => `With a ${label} due in ${horizon}, a price drop is not abstract. This lesson is about that conversation.`,
  "p-boundary": (label) => `When a request comes in, you can see the ${label} goal and the reason your child gave, then decide once, exactly.`,
  "p-together": (label) => `Whatever you decide, talk about the ${label} afterwards. Autonomy grows from conversations, not from badges.`,
};
export function parentLessonNote(goal: { label: string; id: PracticeGoalId }, lessonId: string): string {
  const g = GOAL_STORY[goal.id];
  return (PARENT_NOTE[lessonId] ?? ((label: string) => `This connects to your child's ${label} goal.`))(goal.label.toLowerCase(), g.horizon);
}
export function goalForCase(state: StoryState, item: FamilyExploreCase): string {
  const goal = selectedPracticeGoal(state.practice);
  const g = GOAL_STORY[goal.id];
  return `Your ${goal.label.toLowerCase()} is ${g.horizon} away. ${item.uncertainty} Could you live with that, with that goal in mind?`;
}

/** Plain consequences of a choice, from state only. */
export function choiceImpact(state: StoryState, amount: number) {
  const goal = selectedPracticeGoal(state.practice);
  const available = 100 - state.practice.saved - state.practice.spent;
  return {
    goal, amount, availableAfter: available - amount, saved: state.practice.saved,
    goalPercent: Math.min(100, Math.round(state.practice.saved / goal.target * 100)),
    withinPeriod: state.practice.spent + amount <= state.practice.key.maxPeriod,
  };
}

export type ChapterStatus = Record<"goal" | "learn" | "explore" | "decision" | "parent" | "outcome" | "together", boolean>;
/** A chapter is "done" only because something real happened in state. */
export function chapterStatus(s: StoryState): ChapterStatus {
  const p = s.practice;
  return {
    goal: s.goalChosen,
    learn: p.childCompleted.length > 0,
    explore: s.viewed.length > 0,
    decision: p.receipts.length > 0 || p.requests.length > 0,
    parent: p.requests.some(r => r.status !== "pending"),
    outcome: p.receipts.length > 0,
    together: p.togetherCompleted,
  };
}
