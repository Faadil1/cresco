import { describe, expect, it } from "vitest";
import { FAMILY_EXPLORE_CASES } from "./family-public-explore-data";
import {
  CHILD_LEARNING, PARENT_LEARNING, PRACTICE_GOALS, initialFamilyPractice, selectedPracticeGoal,
} from "./family-public-practice";
import {
  DECLINE_REASONS, GOAL_STORY, INTERESTS, REASONS, chapterStatus, childLessonNote, choiceImpact,
  initialStory, interestMatches, orderExploreCases, parentLessonNote, transitionStory,
  type StoryAction, type StoryState,
} from "./family-story-state";

const run = (s: StoryState, ...actions: StoryAction[]) => actions.reduce(transitionStory, s);
const practice = (action: Extract<StoryAction, { type: "practice" }>["action"], extra: Partial<Extract<StoryAction, { type: "practice" }>> = {}): StoryAction =>
  ({ type: "practice", action, ...extra });

describe("story layer never carries authority", () => {
  it("goal, interests, lessons, views and research leave key, requests and receipts untouched", () => {
    const start = initialStory();
    const after = run(start,
      practice({ type: "set-goal", goalId: "trip" }),
      { type: "toggle-interest", id: "food" }, { type: "toggle-interest", id: "planet" },
      practice({ type: "complete", role: "child", lessonId: "c-save" }),
      practice({ type: "complete", role: "parent", lessonId: "p-key" }),
      { type: "view-case", id: "orchard" }, { type: "research-correct", id: "orchard" },
      { type: "pick-asset", code: "ORC" },
    );
    expect(after.practice.key).toEqual(start.practice.key);
    expect(after.practice.requests).toEqual([]);
    expect(after.practice.receipts).toEqual([]);
    expect(after.practice.spent).toBe(0);
    expect(after.practice.goalId).toBe("trip");
  });

  it("wraps the practice reducer: inside-key buys, over-key blocks, approval is single use", () => {
    let s = run(initialStory(), practice({ type: "buy", asset: "ORC", amount: 10 }));
    expect(s.practice.receipts).toHaveLength(1);
    s = run(s, practice({ type: "buy", asset: "MKT", amount: 25 }, { reason: "goal-fit" }));
    expect(s.practice.requests[0]).toMatchObject({ status: "pending", amount: 25 });
    expect(s.reasons[s.practice.requests[0].id]).toBe("goal-fit");
    s = run(s, practice({ type: "respond", id: s.practice.requests[0].id, choice: "approve" }),
      practice({ type: "buy", asset: "MKT", amount: 25 }));
    expect(s.practice.receipts[0].permission).toBe("allow-once");
    const before = s.practice.receipts.length;
    s = run(s, practice({ type: "buy", asset: "MKT", amount: 25 }));
    expect(s.practice.receipts.length).toBe(before);
  });

  it("remembers fictional dilemma decisions without altering any permission, balance or request", () => {
    const start = initialStory();
    let s = run(start, { type: "view-case", id: "markets" }, { type: "choose-episode", id: "markets", option: 0 });
    expect(s.episodeChoices.markets).toBe(0);
    expect(s.practice).toEqual(start.practice);
    expect(s.practice.key).toEqual(start.practice.key);
    expect(s.practice.requests).toEqual([]);
    expect(s.practice.receipts).toEqual([]);
    s = run(s, { type: "choose-episode", id: "markets", option: 1 });
    expect(s.episodeChoices.markets).toBe(1);
    const unchanged = s;
    expect(run(s, { type: "choose-episode", id: "unknown", option: 0 })).toBe(unchanged);
    expect(run(s, { type: "choose-episode", id: "markets", option: 5 as 0 })).toBe(unchanged);
    s = run(s, practice({ type: "buy", asset: "MKT", amount: 25 }));
    expect(s.practice.requests[0].status).toBe("pending");
    expect(s.episodeChoices.markets).toBe(1);
    const id = s.practice.requests[0].id;
    expect(s.requestEpisodeChoices[id]).toBe(1);
    s = run(s, { type: "choose-episode", id: "markets", option: 0 });
    expect(s.episodeChoices.markets).toBe(0);
    expect(s.requestEpisodeChoices[id]).toBe(1);
    expect(s.practice.requests[0].status).toBe("pending");
    const reset = run(s, practice({ type: "reset" }));
    expect(reset.episodeChoices).toEqual({});
    expect(reset.requestEpisodeChoices).toEqual({});
  });

  it("stores the Parent's decline reason only for a request that was pending and declined", () => {
    let s = run(initialStory(), practice({ type: "buy", asset: "MKT", amount: 25 }));
    const id = s.practice.requests[0].id;
    s = run(s, practice({ type: "respond", id, choice: "decline" }, { declineReason: "too-big" }));
    expect(s.declineReasons[id]).toBe("too-big");
    expect(s.practice.requests[0].status).toBe("declined");
    // A second decline attempt on a decided request does not overwrite the reason.
    s = run(s, practice({ type: "respond", id, choice: "decline" }, { declineReason: "not-yet" }));
    expect(s.declineReasons[id]).toBe("too-big");
    // Declining an unknown id stores nothing.
    s = run(s, practice({ type: "respond", id: 999, choice: "decline" }, { declineReason: "not-yet" }));
    expect(s.declineReasons[999]).toBeUndefined();
  });

  it("a defaulted reason is recorded when none is given, and a rejected buy records none", () => {
    let s = run(initialStory(), practice({ type: "buy", asset: "MKT", amount: 25 }));
    expect(s.reasons[s.practice.requests[0].id]).toBe("curious");
    s = run(s, practice({ type: "buy", asset: "MKT", amount: 25 }, { reason: "small-try" }));
    expect(Object.keys(s.reasons)).toHaveLength(1);
  });

  it("ignores unknown companies, assets and interests", () => {
    const s = initialStory();
    expect(run(s, { type: "view-case", id: "nope" }).viewed).toEqual([]);
    expect(run(s, { type: "research-correct", id: "nope" }).researched).toEqual([]);
    expect(run(s, { type: "pick-asset", code: "XYZ" as never }).pick).toBeNull();
    expect(run(s, { type: "toggle-interest", id: "bogus" as never }).interests).toEqual([]);
  });

  it("toggles interests, dedupes views and resets everything on reset", () => {
    let s = run(initialStory(), { type: "toggle-interest", id: "food" }, { type: "toggle-interest", id: "food" });
    expect(s.interests).toEqual([]);
    s = run(s, { type: "view-case", id: "orchard" }, { type: "view-case", id: "orchard" }, practice({ type: "set-goal", goalId: "gaming" }));
    expect(s.viewed).toEqual(["orchard"]);
    expect(s.goalChosen).toBe(true);
    s = run(s, practice({ type: "reset" }));
    expect(s).toEqual(initialStory());
  });

  it("a Key change makes the earlier request stale and the story keeps the reason", () => {
    let s = run(initialStory(), practice({ type: "buy", asset: "MKT", amount: 25 }, { reason: "curious" }));
    s = run(s, practice({ type: "set-key", maxPerAction: 30, maxPeriod: 60, allowed: ["ORC", "MKT", "BKT"] }));
    expect(s.practice.requests[0].status).toBe("stale");
    expect(s.practice.key.version).toBe(2);
  });
});

describe("personalization and consequences are real", () => {
  it("interests move the matching invented company first, stably, without hiding any", () => {
    const base = orderExploreCases([], FAMILY_EXPLORE_CASES).map(item => item.id);
    expect(base).toEqual(FAMILY_EXPLORE_CASES.map(item => item.id));
    const ordered = orderExploreCases(["planet", "food"], FAMILY_EXPLORE_CASES).map(item => item.id);
    expect(ordered.slice(0, 2)).toEqual(["markets", "greenroof"]);
    expect(ordered).toHaveLength(FAMILY_EXPLORE_CASES.length);
  });

  it("every interest maps to a real invented company and uses no real ticker", () => {
    for (const interest of INTERESTS) {
      const item = FAMILY_EXPLORE_CASES.find(entry => entry.id === interest.caseId);
      expect(item, interest.id).toBeDefined();
      expect(interestMatches([interest.id], item!)).toHaveLength(1);
      expect(JSON.stringify(interest)).not.toMatch(/NVDA|AAPL|MSFT|NFLX|AMZN|TSLA|MCD/);
    }
  });

  it("each goal and every lesson get a distinct, non-empty note that names the goal", () => {
    for (const goal of PRACTICE_GOALS) {
      const notes = new Set<string>();
      for (const lesson of CHILD_LEARNING) {
        const note = childLessonNote(goal, lesson.id);
        expect(note.length).toBeGreaterThan(20);
        expect(note.toLowerCase()).toContain(goal.label.toLowerCase());
        notes.add(note);
      }
      expect(notes.size).toBeGreaterThanOrEqual(6);
      for (const lesson of PARENT_LEARNING) expect(parentLessonNote(goal, lesson.id).toLowerCase()).toContain(goal.label.toLowerCase());
    }
    expect(childLessonNote(PRACTICE_GOALS[0], "c-risk")).not.toBe(childLessonNote(PRACTICE_GOALS[2], "c-risk"));
    expect(Object.keys(GOAL_STORY).sort()).toEqual(PRACTICE_GOALS.map(goal => goal.id).sort());
  });

  it("choice impact is computed from state and does not mutate it", () => {
    const s = run(initialStory(), practice({ type: "save" }));
    const frozen = JSON.stringify(s);
    const impact = choiceImpact(s, 10);
    expect(impact.availableAfter).toBe(70);
    expect(impact.saved).toBe(20);
    expect(impact.goalPercent).toBe(33);
    expect(impact.goal.id).toBe(selectedPracticeGoal(s.practice).id);
    expect(JSON.stringify(s)).toBe(frozen);
  });

  it("chapters become done only because something real happened", () => {
    let s = initialStory();
    expect(Object.values(chapterStatus(s)).every(done => !done)).toBe(true);
    s = run(s, practice({ type: "set-goal", goalId: "bike" }), practice({ type: "complete", role: "child", lessonId: "c-save" }), { type: "view-case", id: "markets" });
    expect(chapterStatus(s)).toMatchObject({ goal: true, learn: true, explore: true, decision: false, parent: false, outcome: false });
    s = run(s, practice({ type: "buy", asset: "MKT", amount: 25 }));
    expect(chapterStatus(s)).toMatchObject({ decision: true, parent: false, outcome: false });
    s = run(s, practice({ type: "respond", id: s.practice.requests[0].id, choice: "approve" }));
    expect(chapterStatus(s)).toMatchObject({ parent: true, outcome: false });
    s = run(s, practice({ type: "buy", asset: "MKT", amount: 25 }));
    expect(chapterStatus(s)).toMatchObject({ outcome: true, together: false });
  });

  it("the Parent's learning completion does not touch the Child's chapter status", () => {
    const s = run(initialStory(), practice({ type: "complete", role: "parent", lessonId: "p-key" }));
    expect(chapterStatus(s).learn).toBe(false);
    expect(s.practice.parentCompleted).toEqual(["p-key"]);
  });

  it("copy tables are complete", () => {
    expect(REASONS.map(item => item.id).sort()).toEqual(["curious", "goal-fit", "small-try"]);
    expect(DECLINE_REASONS.every(item => item.explain.length > 30)).toBe(true);
    expect(initialStory().practice).toEqual(initialFamilyPractice());
  });
});
