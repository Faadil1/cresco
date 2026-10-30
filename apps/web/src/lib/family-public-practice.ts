import { LEARNING_SOURCES, LESSONS } from "@/mocks/learning";
import type { IllustrationKey, LearningSource } from "@/domain/types";

/**
 * Public Family teaching sandbox. This module is deliberately pure:
 * no sessions, persistence, fetch, wallet, RPC or financial authority.
 * An approval changes only this in-memory fictional story.
 */
export type FamilyRole = "child" | "parent";
export type AssetCode = "ORC" | "MKT" | "BKT";
export type RequestStatus = "pending" | "approved-once" | "declined" | "used" | "stale";
export type LearningRole = FamilyRole;

export type PracticeAsset = {
  code: AssetCode;
  name: string;
  category: string;
  price: number;
  description: string;
  risk: string;
};
export const PRACTICE_ASSETS: PracticeAsset[] = [
  { code: "ORC", name: "Orchard Technology", category: "Technology", price: 10, description: "A fictional company building tools for local shops.", risk: "A single company's price can fall sharply." },
  { code: "MKT", name: "Neighborhood Markets", category: "Consumer", price: 5, description: "A fictional grocery and household goods company.", risk: "Consumer demand and expenses can change." },
  { code: "BKT", name: "Balanced Basket Fund", category: "Funds", price: 20, description: "A fictional fund holding many different investments.", risk: "Diversification can reduce some risks, not eliminate losses." },
];

export type LearningModule = {
  id: string;
  title: string;
  minutes: number;
  concept: string;
  question: string;
  choices: [string, string, string];
  answer: number;
  explanation: string;
  illustration?: IllustrationKey;
  source?: LearningSource;
  detail?: string;
  origin?: "historical-cresco";
};
export const CHILD_LEARNING: LearningModule[] = [
  { id: "c-save", title: "Save for a goal", minutes: 3, concept: "Saving sets credits aside for a future goal. Money needed soon may not belong in a risky investment.", question: "What helps before deciding how to save?", choices: ["Pick a random stock", "Choose a goal and a time horizon", "Assume prices always rise"], answer: 1, explanation: "A goal and timeframe help you understand how much uncertainty you can accept." },
  { id: "c-explore", title: "Know what you own", minutes: 4, concept: "A share represents ownership in a company. A fictional practice purchase is not a real share or token.", question: "What happens in this public demo?", choices: ["You own a security", "A wallet receives tokens", "Only pretend credits and a practice receipt change"], answer: 2, explanation: "The demo never places an order or creates an ownership right." },
  { id: "c-risk", title: "Practice with risk", minutes: 4, concept: "Prices can go down. Spreading investments across assets can reduce concentration but cannot guarantee returns.", question: "Does diversification eliminate the possibility of a loss?", choices: ["No", "Yes", "Only after a lesson"], answer: 0, explanation: "Different investments can decline together; learning does not guarantee any result." },
];
// Restore the original illustrated and primary-source-backed CRESCO curriculum
// without unlocking its backend-dependent routes, auth or lesson persistence.
const SOURCE_BACKED_CHILD_IDS = [
  "what-is-a-stock", "why-companies-sell-shares", "stock-vs-tokenized-security",
  "why-prices-move", "risk-and-reward", "build-your-portfolio",
];
for (const id of SOURCE_BACKED_CHILD_IDS) {
  const original = LESSONS.find(item => item.id === id);
  if (!original) throw new Error(`Missing original Cresco lesson ${id}`);
  const concepts = original.steps.filter(step => step.kind === "concept");
  const quiz = original.steps.find(step => step.kind === "quiz");
  const source = concepts.find(step => step.source)?.source;
  if (!quiz || !concepts.length || !source || quiz.options.length !== 3) {
    throw new Error(`Incomplete source-backed lesson ${id}`);
  }
  CHILD_LEARNING.push({
    id: `original-${id}`,
    title: original.title,
    minutes: original.minutes,
    concept: concepts[0].body,
    detail: concepts.map(step => step.realityCheck).filter(Boolean).join(" "),
    illustration: concepts[0].illustration,
    source,
    question: quiz.question,
    choices: quiz.options.map(option => option.label) as [string, string, string],
    answer: quiz.options.findIndex(option => option.id === quiz.correctId),
    explanation: quiz.correctExplanation,
    origin: "historical-cresco",
  });
}

export const PARENT_LEARNING: LearningModule[] = [
  { id: "p-basics", title: "Money & family conversations", minutes: 3, concept: "Begin with goals, needs and wants, and a conversation about what the child wants to learn. Progress is not permission.", question: "What is a good first family conversation?", choices: ["Promise guaranteed returns", "Talk about goals and what money is for", "Require a wallet"], answer: 1, explanation: "The conversation builds context without creating financial authority." },
  { id: "p-key", title: "Understand My Key", minutes: 4, concept: "A standing Key defines the amount per action, total spending this practice period, and eligible instruments. The child acts alone inside it.", question: "When a practice action is inside the standing Key, does it need a new Parent approval?", choices: ["Always", "No", "Only if the child has no badge"], answer: 1, explanation: "The point of the Key is bounded autonomy, not approval of every action." },
  { id: "p-risk", title: "Risk before permission", minutes: 4, concept: "Learn about losses, time horizons, diversification and the difference between savings, investment products and token representations.", question: "Which statement is accurate?", choices: ["Diversification removes all risk", "Fictional prices are live market data", "Diversification cannot guarantee against losses"], answer: 2, explanation: "Understanding risk informs a decision but never grants a right to trade." },
  { id: "p-boundary", title: "Decide at the boundary", minutes: 5, concept: "Above a limit, the child is blocked. You can decline, allow one exact action, or separately edit the standing Key. They have different consequences.", question: "What does Approve once change?", choices: ["Only the precise pending practice request", "Every future spending limit", "The child's learning score"], answer: 0, explanation: "An exact single-use exception leaves the standing Key unchanged and cannot be replayed." },
  { id: "p-together", title: "Grow autonomy together", minutes: 4, concept: "Review choices and outcomes with the child. You may explicitly update the Key, but a quiz, badge or recommendation must never widen it automatically.", question: "Who changes the standing Key in a real family product?", choices: ["The child's quiz", "A badge algorithm", "An authorized parent through an explicit action"], answer: 2, explanation: "Learning and authorization remain separate." },
];

// The parent's separate path uses the existing verified educational sources
// for financial concepts, not for Family Key rules (which are demo-specific).
for (const lesson of PARENT_LEARNING) {
  const sourceById: Partial<Record<string, LearningSource>> = {
    "p-basics": LEARNING_SOURCES.studentSaving,
    "p-risk": LEARNING_SOURCES.risk,
    "p-together": LEARNING_SOURCES.diversification,
  };
  lesson.source = sourceById[lesson.id];
  lesson.illustration = lesson.id === "p-risk" ? "scale" : lesson.id === "p-basics" ? "piggy" : "shares";
}


export type PracticeKey = {
  version: number;
  nonce: number;
  maxPerAction: number;
  maxPeriod: number;
  allowed: AssetCode[];
};
export type PracticeRequest = {
  id: number;
  asset: AssetCode;
  amount: number;
  version: number;
  nonce: number;
  status: RequestStatus;
};
export type PracticeReceipt = {
  id: number;
  asset: AssetCode;
  amount: number;
  shares: number;
  permission: "standing-key" | "allow-once";
  label: "PRACTICE_ONLY_NOT_EXECUTED";
};
export type FamilyPracticeState = {
  saved: number;
  spent: number;
  holdings: Record<AssetCode, number>;
  key: PracticeKey;
  requests: PracticeRequest[];
  receipts: PracticeReceipt[];
  childCompleted: string[];
  parentCompleted: string[];
  togetherCompleted: boolean;
  discussion: { child: "save-first" | "practice-small" | "ask-together" | null; parent: "protect-goal" | "small-limit" | "review-risk" | null };
  feedback: string;
  nextId: number;
};
export function initialFamilyPractice(): FamilyPracticeState {
  return {
    saved: 0, spent: 0, holdings: { ORC: 0, MKT: 0, BKT: 0 },
    key: { version: 1, nonce: 1, maxPerAction: 15, maxPeriod: 60, allowed: ["ORC", "MKT", "BKT"] },
    requests: [], receipts: [], childCompleted: [], parentCompleted: [],
    togetherCompleted: false, discussion: { child: null, parent: null }, feedback: "Choose a role to explore a fictional family scenario.",
    nextId: 1,
  };
}
export const remainingCredits = (s: FamilyPracticeState) => 100 - s.saved - s.spent;
export const remainingPeriod = (s: FamilyPracticeState) => Math.max(0, s.key.maxPeriod - s.spent);

// A fixed, explicitly fictional stress test; never fetches market prices and
// never changes receipts, balances, holdings or permissions.
export type PracticeScenario = "base" | "downturn" | "mixed";
const SCENARIO_MULTIPLIERS: Record<PracticeScenario, Record<AssetCode, number>> = {
  base: { ORC: 1, MKT: 1, BKT: 1 },
  downturn: { ORC: 0.7, MKT: 0.9, BKT: 0.85 },
  mixed: { ORC: 1.1, MKT: 0.8, BKT: 1.02 },
};
export function evaluatePracticeScenario(s: FamilyPracticeState, scenario: PracticeScenario) {
  const multipliers = SCENARIO_MULTIPLIERS[scenario];
  const assets = PRACTICE_ASSETS.map(a => {
    const cost = s.holdings[a.code] * a.price;
    const hypothetical = cost * multipliers[a.code];
    return { ...a, cost, hypothetical, weight: s.spent > 0 ? cost / s.spent : 0 };
  });
  return {
    assets,
    original: s.spent,
    hypothetical: assets.reduce((sum, item) => sum + item.hypothetical, 0),
  };
}


type Action =
  | { type: "save" }
  | { type: "buy"; asset: AssetCode; amount: number }
  | { type: "respond"; id: number; choice: "approve" | "decline" }
  | { type: "set-key"; maxPerAction: number; maxPeriod: number; allowed: AssetCode[] }
  | { type: "complete"; role: LearningRole; lessonId: string }
  | { type: "discussion-child"; choice: "save-first" | "practice-small" | "ask-together" }
  | { type: "discussion-parent"; choice: "protect-goal" | "small-limit" | "review-risk" }
  | { type: "together" }
  | { type: "reset" };

const reject = (s: FamilyPracticeState, feedback: string): FamilyPracticeState => ({ ...s, feedback });
const exact = (a: number): boolean => Number.isSafeInteger(a) && a > 0 && a <= 100;
function execute(s: FamilyPracticeState, asset: PracticeAsset, amount: number, permission: PracticeReceipt["permission"], requestId?: number): FamilyPracticeState {
  const receipt: PracticeReceipt = {
    id: s.nextId, asset: asset.code, amount,
    shares: amount / asset.price, permission, label: "PRACTICE_ONLY_NOT_EXECUTED",
  };
  return {
    ...s, spent: s.spent + amount,
    holdings: { ...s.holdings, [asset.code]: s.holdings[asset.code] + receipt.shares },
    receipts: [receipt, ...s.receipts], nextId: s.nextId + 1,
    requests: requestId === undefined ? s.requests : s.requests.map(r => r.id === requestId ? { ...r, status: "used" } : r),
    feedback: permission === "allow-once"
      ? "Exact one-time practice approval used. Standing Key unchanged. Receipt recorded."
      : "Inside My Key: independent practice action recorded. No Parent approval needed.",
  };
}
/** Pure state transition; parent decisions can NEVER authorize real execution. */
export function transitionFamilyPractice(s: FamilyPracticeState, action: Action): FamilyPracticeState {
  if (action.type === "reset") return initialFamilyPractice();
  if (action.type === "save") {
    if (remainingCredits(s) < 20) return reject(s, "Not enough available practice credits to save 20.");
    return { ...s, saved: s.saved + 20, feedback: "20 fictional credits set aside for a goal. No real savings created." };
  }
  if (action.type === "complete") {
    const valid = (action.role === "parent" ? PARENT_LEARNING : CHILD_LEARNING).some(l => l.id === action.lessonId);
    if (!valid) return reject(s, "Unknown learning module.");
    const key = action.role === "parent" ? "parentCompleted" : "childCompleted";
    return {
      ...s, [key]: s[key].includes(action.lessonId) ? s[key] : [...s[key], action.lessonId],
      feedback: "Lesson completed. Learning never changes My Key.",
    };
  }
  if (action.type === "discussion-child") {
    return { ...s, togetherCompleted: false, discussion: { ...s.discussion, child: action.choice }, feedback: "Child perspective recorded. The Parent can add their guidance." };
  }
  if (action.type === "discussion-parent") {
    return { ...s, togetherCompleted: false, discussion: { ...s.discussion, parent: action.choice }, feedback: "Parent guidance recorded. The family can review both perspectives." };
  }
  if (action.type === "together") {
    if (!s.discussion.child || !s.discussion.parent) {
      return reject(s, "Both perspectives are needed to complete the family check-in.");
    }
    return { ...s, togetherCompleted: true, feedback: "Family discussion reviewed together. No financial permission changed." };
  }
  if (action.type === "set-key") {
    const { maxPerAction, maxPeriod, allowed } = action;
    if (!exact(maxPerAction) || !exact(maxPeriod) || maxPerAction > maxPeriod ||
        maxPeriod < s.spent || !allowed.length || allowed.some(a => !PRACTICE_ASSETS.some(p => p.code === a)) ||
        new Set(allowed).size !== allowed.length) {
      return reject(s, "Invalid Key. Use whole credits, respect already spent credits, and select eligible assets.");
    }
    return {
      ...s, key: { version: s.key.version + 1, nonce: s.key.nonce + 1, maxPerAction, maxPeriod, allowed: [...allowed] },
      requests: s.requests.map(r => r.status === "pending" || r.status === "approved-once" ? { ...r, status: "stale" } : r),
      feedback: "Parent explicitly changed the standing practice Key. Previous requests became stale.",
    };
  }
  if (action.type === "respond") {
    const request = s.requests.find(r => r.id === action.id);
    if (!request || request.status !== "pending" || request.version !== s.key.version || request.nonce !== s.key.nonce)
      return reject(s, "This request is no longer pending or does not match the current Key.");
    return {
      ...s,
      requests: s.requests.map(r => r.id === action.id ? { ...r, status: action.choice === "approve" ? "approved-once" : "declined" } : r),
      feedback: action.choice === "approve"
        ? "One exact fictional action approved. The Child must retry it; My Key did not widen."
        : "Parent declined this practice request. Nothing was purchased.",
    };
  }
  if (action.type === "buy") {
    const asset = PRACTICE_ASSETS.find(a => a.code === action.asset);
    if (!asset || !exact(action.amount))
      return reject(s, "Choose an available example and a positive whole-credit amount.");
    if (action.amount > remainingCredits(s))
      return reject(s, "Insufficient practice credits. No order recorded.");
    const matched = s.requests.find(r =>
      r.asset === action.asset && r.amount === action.amount &&
      r.version === s.key.version && r.nonce === s.key.nonce && r.status === "approved-once"
    );
    if (matched) return execute(s, asset, action.amount, "allow-once", matched.id);
    if (s.key.allowed.includes(action.asset) &&
        action.amount <= s.key.maxPerAction &&
        s.spent + action.amount <= s.key.maxPeriod)
      return execute(s, asset, action.amount, "standing-key");
    const existing = s.requests.some(r =>
      r.asset === action.asset && r.amount === action.amount &&
      r.version === s.key.version && r.nonce === s.key.nonce &&
      (r.status === "pending" || r.status === "used" || r.status === "declined")
    );
    if (existing) return reject(s, "This exact request was already submitted or decided. A one-time permission cannot be replayed.");
    const request: PracticeRequest = {
      id: s.nextId, asset: action.asset, amount: action.amount,
      version: s.key.version, nonce: s.key.nonce, status: "pending",
    };
    return {
      ...s, nextId: s.nextId + 1, requests: [request, ...s.requests],
      feedback: "Outside My Key: blocked. Exact practice request sent to the simulated Parent.",
    };
  }
  return s;
}
