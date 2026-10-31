/**
 * Closed set of public story routes for the Family-only site. Pure and cheap
 * so the edge proxy can import it. Nothing here is a prefix match: every path
 * is listed, and the two dynamic segments only accept ids from fixed lists
 * (tests keep these lists identical to the content they name).
 */
import { FAMILY_EXPLORE_CASES } from "./family-public-explore-data";

export const STORY_EXPLORE_IDS = FAMILY_EXPLORE_CASES.map(item => item.id);
export const STORY_LESSON_IDS = [
  "c-save", "c-explore", "c-risk",
  "original-what-is-a-stock", "original-why-companies-sell-shares", "original-stock-vs-tokenized-security",
  "original-why-prices-move", "original-risk-and-reward", "original-build-your-portfolio",
  "p-basics", "p-key", "p-risk", "p-boundary", "p-together",
] as const;

export type StoryChapterId = "welcome" | "goal" | "learn" | "explore" | "decision" | "parent" | "outcome" | "together";
export const STORY_CHAPTERS: readonly { id: StoryChapterId; path: string; label: string; short: string }[] = [
  { id: "welcome", path: "/try", label: "Welcome", short: "Welcome" },
  { id: "goal", path: "/try/goal", label: "My goal", short: "Goal" },
  { id: "learn", path: "/try/learn", label: "My learning path", short: "Learn" },
  { id: "explore", path: "/try/explore", label: "Explore", short: "Explore" },
  { id: "decision", path: "/try/decision", label: "Make a choice", short: "Choose" },
  { id: "parent", path: "/try/parent", label: "Parent's moment", short: "Parent" },
  { id: "outcome", path: "/try/outcome", label: "What happened", short: "Result" },
  { id: "together", path: "/try/together", label: "Together", short: "Together" },
];

const FIXED_STORY_PATHS = new Set([
  "/try", "/try/lab", "/try/goal", "/try/learn", "/try/explore", "/try/decision",
  "/try/parent", "/try/parent/learn", "/try/parent/key", "/try/parent/request",
  "/try/outcome", "/try/together",
]);
const EXPLORE_IDS = new Set<string>(STORY_EXPLORE_IDS);
const LESSON_IDS = new Set<string>(STORY_LESSON_IDS);

/** Exact, case-sensitive match. No trailing slash, no encoded segments, no query. */
export function familyStoryRouteAllowed(pathname: string): boolean {
  if (FIXED_STORY_PATHS.has(pathname)) return true;
  const explore = /^\/try\/explore\/([a-z0-9-]+)$/.exec(pathname);
  if (explore) return EXPLORE_IDS.has(explore[1]);
  const lesson = /^\/try\/learn\/([a-z0-9-]+)$/.exec(pathname);
  if (lesson) return LESSON_IDS.has(lesson[1]);
  return false;
}
