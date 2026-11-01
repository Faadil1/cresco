/**
 * Pure story layer above the practice engine. It adds only what a multi-page
 * journey needs (interests, which companies were opened or researched, the
 * Child's reason and the Parent's decline reason) and wraps the unchanged
 * practice reducer. Nothing here changes the Key, a request, a receipt or a
 * balance by itself: those change only through `transitionFamilyPractice`.
 */
import { FAMILY_EXPLORE_CASES, type FamilyExploreCase } from "./family-public-explore-data";
import {
  CHILD_LEARNING, PRACTICE_ASSETS, initialFamilyPractice, selectedPracticeGoal, transitionFamilyPractice,
  type AssetCode, type FamilyPracticeState, type LearningModule, type PracticeGoalId,
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
  episodeChoices: Record<string, 0 | 1>;
  // Immutable per-request snapshot: Parent always sees what was answered at ask time.
  requestEpisodeChoices: Record<number, 0 | 1>;
  pick: AssetCode | null;
  reasons: Record<number, ReasonId>;
  declineReasons: Record<number, DeclineReasonId>;
};
export function initialStory(): StoryState {
  return {
    practice: initialFamilyPractice(), goalChosen: false, interests: [], viewed: [], researched: [],
    episodeChoices: {}, requestEpisodeChoices: {}, pick: null, reasons: {}, declineReasons: {},
  };
}

type PracticeAction = Parameters<typeof transitionFamilyPractice>[1];
export type StoryAction =
  | { type: "practice"; action: PracticeAction; reason?: ReasonId; declineReason?: DeclineReasonId }
  | { type: "toggle-interest"; id: InterestId }
  | { type: "view-case"; id: string }
  | { type: "research-correct"; id: string }
  | { type: "choose-episode"; id: string; option: 0 | 1 }
  | { type: "pick-asset"; code: AssetCode | null };

const knownCase = (id: string) => FAMILY_EXPLORE_CASES.some(item => item.id === id);
const add = (list: string[], id: string) => list.includes(id) ? list : [...list, id];

export function transitionStory(s: StoryState, action: StoryAction): StoryState {
  if (action.type === "practice") {
    if (action.action.type === "reset") return initialStory();
    const next = transitionFamilyPractice(s.practice, action.action);
    let { reasons, declineReasons, goalChosen, requestEpisodeChoices } = s;
    if (action.action.type === "set-goal" && next.goalId === action.action.goalId) goalChosen = true;
    if (action.action.type === "buy") {
      const made = next.requests.find(r => !s.practice.requests.some(old => old.id === r.id));
      if (made) {
        reasons = { ...reasons, [made.id]: action.reason ?? "curious" };
        const company = FAMILY_EXPLORE_CASES.find(item => item.practiceCode === made.asset);
        const chosen = company ? s.episodeChoices[company.id] : undefined;
        if (chosen !== undefined) requestEpisodeChoices = { ...requestEpisodeChoices, [made.id]: chosen };
      }
    }
    if (action.action.type === "respond" && action.action.choice === "decline") {
      const target = next.requests.find(r => r.id === (action.action as { id: number }).id);
      const before = s.practice.requests.find(r => r.id === target?.id);
      if (target?.status === "declined" && before?.status === "pending") {
        declineReasons = { ...declineReasons, [target.id]: action.declineReason ?? "talk-first" };
      }
    }
    return { ...s, practice: next, reasons, declineReasons, goalChosen, requestEpisodeChoices };
  }
  if (action.type === "toggle-interest") {
    if (!INTERESTS.some(item => item.id === action.id)) return s;
    return { ...s, interests: s.interests.includes(action.id) ? s.interests.filter(id => id !== action.id) : [...s.interests, action.id] };
  }
  if (action.type === "view-case") return knownCase(action.id) ? { ...s, viewed: add(s.viewed, action.id) } : s;
  if (action.type === "research-correct") return knownCase(action.id) ? { ...s, researched: add(s.researched, action.id) } : s;
  // An interpretation is just a teaching moment. It cannot alter financial state.
  if (action.type === "choose-episode") {
    if (!knownCase(action.id) || (action.option !== 0 && action.option !== 1)) return s;
    return { ...s, episodeChoices: { ...s.episodeChoices, [action.id]: action.option } };
  }
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

const FIRST_FOR_GOAL: Record<PracticeGoalId, string> = {
  bike: "c-save", gaming: "original-why-prices-move", trip: "original-build-your-portfolio",
};
/** The Child's path starts where the chosen goal needs it most; the rest keep their order. */
export function childPathFor(goalId: PracticeGoalId): LearningModule[] {
  const first = CHILD_LEARNING.find(item => item.id === FIRST_FOR_GOAL[goalId]);
  return first ? [first, ...CHILD_LEARNING.filter(item => item.id !== first.id)] : CHILD_LEARNING;
}

/** "Mina, whose family runs a grocery" -> "Mina". */
export const personName = (item: FamilyExploreCase) => item.episode.person.split(",")[0].trim();

export type Mission = {
  id: "choose-goal" | "use-approval" | "parent-deciding" | "see-decline" | "see-expired" | "first-lesson"
    | "meet-person" | "first-choice" | "together" | "next-lesson" | "meet-next" | "practice-again";
  kicker: string;
  title: string;
  body: string;
  href: string;
  cta: string;
};
/**
 * The one meaningful next step for the Child's Home, derived only from state.
 * It is a pointer, never an action: it cannot approve, buy or change the Key.
 * Order: unfinished setup, then anything waiting on a decision, then the
 * learn -> meet -> choose -> talk loop, then whatever is left to discover.
 */
export function nextMission(s: StoryState): Mission {
  const p = s.practice;
  const goal = selectedPracticeGoal(p);
  const path = childPathFor(goal.id);
  const nextLesson = path.find(item => !p.childCompleted.includes(item.id));
  const ordered = orderExploreCases(s.interests, FAMILY_EXPLORE_CASES);
  const newest = p.requests[0];
  const newestReceipt = p.receipts[0];
  const newestIsRequest = newest && (!newestReceipt || newest.id > newestReceipt.id);
  const asset = (code: string) => PRACTICE_ASSETS.find(a => a.code === code)?.name ?? code;

  if (!s.goalChosen) return {
    id: "choose-goal", kicker: "Start here", title: "Choose what you are saving for",
    body: "Your lessons and choices will follow your dream. It takes ten seconds.", href: "/try/goal", cta: "Choose my dream",
  };
  const approved = p.requests.find(r => r.status === "approved-once");
  if (approved) return {
    id: "use-approval", kicker: "Your Parent answered", title: "Your Parent said yes, once",
    body: `${approved.amount} credits of ${asset(approved.asset)}. Use it when you are ready; it works one time only.`, href: "/try/outcome", cta: "See and use it",
  };
  const pending = p.requests.find(r => r.status === "pending");
  if (pending) return {
    id: "parent-deciding", kicker: "Waiting for your Parent", title: `Ask for ${pending.amount} credits sent`,
    body: `It is above your ${p.key.maxPerAction}-credit Key, so nothing was bought. Hand the phone to your Parent to decide.`,
    href: "/try/parent/request", cta: "Hand to my Parent",
  };
  if (newestIsRequest && newest.status === "declined") return {
    id: "see-decline", kicker: "Your Parent answered", title: "Your Parent said not this time",
    body: "Find out why, then try a smaller choice inside your Key.", href: "/try/outcome", cta: "See why",
  };
  if (newestIsRequest && newest.status === "stale") return {
    id: "see-expired", kicker: "Something changed", title: "Your Parent changed My Key",
    body: "Your earlier ask expired. See what changed before choosing again.", href: "/try/outcome", cta: "See what changed",
  };
  // Right after a real decision (a receipt or a Parent answer), talk about it before anything new.
  const decided = p.receipts.length > 0 || p.requests.some(r => r.status !== "pending");
  if (decided && !p.togetherCompleted) return {
    id: "together", kicker: "Today's mission · together", title: "Talk it through with your Parent",
    body: "You each give one view about what happened. Nothing changes the Key.", href: "/try/together", cta: "Talk it through",
  };
  if (p.childCompleted.length === 0 && nextLesson) return {
    id: "first-lesson", kicker: `Today's mission · ${nextLesson.minutes} min`, title: nextLesson.title,
    body: `Your first lesson, picked for your ${goal.label.toLowerCase()}.`, href: `/try/learn/${nextLesson.id}`, cta: "Start lesson",
  };
  if (s.viewed.length === 0) {
    const first = ordered[0];
    return {
      id: "meet-person", kicker: "Today's mission · meet someone", title: `Meet ${personName(first)}`,
      body: first.episode.dilemma, href: `/try/explore/${first.id}`, cta: `Meet ${personName(first)}`,
    };
  }
  if (p.receipts.length === 0 && p.requests.length === 0) {
    const seen = ordered.find(item => item.practiceCode && s.viewed.includes(item.id)) ?? ordered.find(item => item.practiceCode)!;
    return {
      id: "first-choice", kicker: "Today's mission · decide", title: "Make your first practice choice",
      body: `You met ${personName(seen)}. Try a small practice choice with ${seen.name}, inside your ${p.key.maxPerAction}-credit Key.`,
      href: `/try/explore/${seen.id}`, cta: "Choose with pretend credits",
    };
  }
  if (nextLesson) return {
    id: "next-lesson", kicker: `Up next · ${nextLesson.minutes} min`, title: nextLesson.title,
    body: `Keep going: ${p.childCompleted.length} of ${path.length} lessons done.`, href: `/try/learn/${nextLesson.id}`, cta: "Continue learning",
  };
  const unseen = ordered.find(item => !s.viewed.includes(item.id));
  if (unseen) return {
    id: "meet-next", kicker: "Up next · meet someone", title: `Meet ${personName(unseen)}`,
    body: unseen.episode.dilemma, href: `/try/explore/${unseen.id}`, cta: `Meet ${personName(unseen)}`,
  };
  return {
    id: "practice-again", kicker: "You did it all", title: "Every lesson and every story",
    body: "Practice again inside your Key, or revisit a story with your Parent.", href: "/try/decision", cta: "Practice again",
  };
}

export type Win = { badge: "first-investor" | "company-detective" | "diversification-pro" | "money-master"; label: string; earned: boolean };
/** Badges celebrate what actually happened. They never change My Key. */
export function practiceWins(s: StoryState): Win[] {
  const p = s.practice;
  return [
    { badge: "first-investor", earned: p.receipts.length > 0, label: "First practice choice" },
    { badge: "company-detective", earned: s.researched.length > 0, label: "Researched a company" },
    { badge: "diversification-pro", earned: Object.values(p.holdings).filter(shares => shares > 0).length >= 2, label: "Two different holdings" },
    { badge: "money-master", earned: p.childCompleted.length === CHILD_LEARNING.length, label: "Finished Child lessons" },
  ];
}
