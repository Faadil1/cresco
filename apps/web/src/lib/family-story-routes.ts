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
  "c-budget", "c-price", "c-profit", "c-funds", "c-fees", "c-volatility", "c-scams", "c-research",
  "p-basics", "p-key", "p-risk", "p-boundary", "p-together", "p-digital", "p-research",
] as const;

/**
 * The durable Family app (restored from the original Cresco AppShell): five
 * real destinations with their own routes. Narrative scenes (decision,
 * outcome, together) live INSIDE a destination; they are not top-level tabs.
 */
export type FamilyTabId = "home" | "learn" | "explore" | "portfolio" | "profile";
export const FAMILY_APP_TABS: readonly { id: FamilyTabId; path: string; label: string }[] = [
  { id: "home", path: "/try/home", label: "Home" },
  { id: "learn", path: "/try/learn", label: "Learn" },
  { id: "explore", path: "/try/explore", label: "Explore" },
  { id: "portfolio", path: "/try/portfolio", label: "Portfolio" },
  { id: "profile", path: "/try/profile", label: "Profile" },
];
/** Which Child destination a path belongs to (null: not a Child app screen). */
export function tabOfPath(pathname: string): FamilyTabId | null {
  if (pathname === "/try/home" || pathname === "/try/together") return "home";
  if (pathname === "/try/learn" || (pathname.startsWith("/try/learn/") && !pathname.startsWith("/try/learn/p-"))) return "learn";
  if (pathname.startsWith("/try/explore") || pathname === "/try/decision") return "explore";
  if (pathname === "/try/portfolio" || pathname.startsWith("/try/portfolio/") || pathname === "/try/outcome") return "portfolio";
  if (pathname === "/try/profile") return "profile";
  return null;
}

/** The simulated Parent lens has its own small navigation, like the original Parent dashboard. */
export type ParentTabId = "overview" | "request" | "key" | "learn";
export const PARENT_APP_TABS: readonly { id: ParentTabId; path: string; label: string }[] = [
  { id: "overview", path: "/try/parent", label: "Overview" },
  { id: "request", path: "/try/parent/request", label: "Requests" },
  { id: "key", path: "/try/parent/key", label: "My Key" },
  { id: "learn", path: "/try/parent/learn", label: "Learn" },
];
export function parentTabOfPath(pathname: string): ParentTabId | null {
  if (pathname === "/try/parent") return "overview";
  if (pathname === "/try/parent/request") return "request";
  if (pathname === "/try/parent/key") return "key";
  if (pathname === "/try/parent/learn" || pathname.startsWith("/try/learn/p-")) return "learn";
  return null;
}

/**
 * How the shell frames a page:
 * - intro: the invitation, no navigation;
 * - onboarding: the three setup scenes (own progress, no navigation);
 * - focus: a lesson being read (one task, close button, no tab bar);
 * - child / parent: the persistent app navigation for that lens.
 */
export type ShellMode = "intro" | "onboarding" | "focus" | "child" | "parent";
export function shellModeOfPath(pathname: string): ShellMode {
  if (pathname === "/try") return "intro";
  if (pathname === "/try/goal" || pathname.startsWith("/try/goal/")) return "onboarding";
  if (pathname.startsWith("/try/learn/")) return "focus";
  if (pathname.startsWith("/try/parent")) return "parent";
  return "child";
}

const FIXED_STORY_PATHS = new Set([
  "/try", "/try/lab", "/try/goal", "/try/goal/interests", "/try/goal/ready",
  "/try/home", "/try/learn", "/try/explore", "/try/decision", "/try/portfolio", "/try/portfolio/companies", "/try/profile",
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

/** Whose lens a page is written for: the Parent's pages and lessons, or the Child's. Together belongs to both. */
export function lensOfPath(pathname: string): "child" | "parent" | "both" {
  if (pathname.startsWith("/try/parent") || pathname.startsWith("/try/learn/p-")) return "parent";
  if (pathname.startsWith("/try/together")) return "both";
  return "child";
}
