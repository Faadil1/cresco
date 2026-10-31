import { describe, expect, it } from "vitest";
import { FAMILY_EXPLORE_CASES } from "./family-public-explore-data";
import { CHILD_LEARNING, PARENT_LEARNING } from "./family-public-practice";
import { STORY_CHAPTERS, STORY_EXPLORE_IDS, STORY_LESSON_IDS, familyStoryRouteAllowed, lensOfPath } from "./family-story-routes";
import { familyWebRouteAllowed } from "./family-web-route-guard";

describe("lens of a page", () => {
  it("Parent pages and Parent lessons use the Parent lens, Child lessons do not, Together is shared", () => {
    for (const path of ["/try/parent", "/try/parent/request", "/try/parent/key", "/try/parent/learn", "/try/learn/p-basics", "/try/learn/p-boundary"]) {
      expect(lensOfPath(path), path).toBe("parent");
    }
    for (const path of ["/try/goal", "/try/learn", "/try/learn/c-save", "/try/learn/original-risk-and-reward", "/try/explore/markets", "/try/decision", "/try/outcome"]) {
      expect(lensOfPath(path), path).toBe("child");
    }
    expect(lensOfPath("/try/together")).toBe("both");
    for (const id of STORY_LESSON_IDS) expect(lensOfPath(`/try/learn/${id}`)).toBe(id.startsWith("p-") ? "parent" : "child");
  });
});

describe("closed public story routes", () => {
  it("allows each enumerated story path and nothing near it", () => {
    for (const chapter of STORY_CHAPTERS) expect(familyWebRouteAllowed(chapter.path)).toBe(true);
    for (const path of ["/try/lab", "/try/parent/learn", "/try/parent/key", "/try/parent/request"]) {
      expect(familyWebRouteAllowed(path)).toBe(true);
    }
  });

  it("allows only real company and lesson ids", () => {
    for (const item of FAMILY_EXPLORE_CASES) expect(familyStoryRouteAllowed(`/try/explore/${item.id}`)).toBe(true);
    for (const id of STORY_LESSON_IDS) expect(familyStoryRouteAllowed(`/try/learn/${id}`)).toBe(true);
    for (const path of ["/try/explore/nope", "/try/explore/ORCHARD", "/try/learn/unknown", "/try/learn/", "/try/explore/orchard/extra"]) {
      expect(familyWebRouteAllowed(path)).toBe(false);
    }
  });

  it("keeps the lesson and company lists identical to the content they name", () => {
    expect([...STORY_EXPLORE_IDS].sort()).toEqual(FAMILY_EXPLORE_CASES.map(item => item.id).sort());
    expect([...STORY_LESSON_IDS].sort()).toEqual([...CHILD_LEARNING, ...PARENT_LEARNING].map(item => item.id).sort());
  });

  it("denies prefix tricks, trailing slashes, case changes, encodings and history", () => {
    for (const path of [
      "/try/", "/try/goal/", "/TRY", "/Try/goal", "/try/GOAL", "/try%2Fgoal", "/try/%2e%2e/worlds-fair", "/try/../worlds-fair",
      "/try/api", "/try/api/health", "/try/sign-in", "/try/parent/sign-in", "/try/parent/settings", "/try/parent/request/1",
      "/try/wallet", "/try/invest/ORC", "/try/home", "/tryout", "/try.json", "/try/goal.rsc", "/try/explore.rsc",
      "/home", "/parent", "/parent/sign-in", "/onboarding/goal", "/learn", "/explore", "/portfolio", "/lesson/what-is-a-stock",
      "/invest/ORC", "/api/health", "/worlds-fair", "/start",
    ]) {
      expect(familyWebRouteAllowed(path), path).toBe(false);
    }
  });

  it("still allows the landing and framework assets only", () => {
    for (const path of ["/", "/_next/static/chunk.js", "/_vinext/x", "/icon.svg"]) expect(familyWebRouteAllowed(path)).toBe(true);
    expect(familyWebRouteAllowed("/_next/image")).toBe(false);
  });
});
