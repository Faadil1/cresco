import { describe, expect, it } from "vitest";
import {
  CHILD_LEARNING, PARENT_LEARNING, initialFamilyPractice, remainingCredits,
  transitionFamilyPractice as next,
} from "./family-public-practice";

describe("Family public teaching sandbox — never a financial permission", () => {
  it("begins with independent Parent/Child learning paths and a fictional Key", () => {
    const s = initialFamilyPractice();
    expect(s.key).toMatchObject({ version: 1, nonce: 1, maxPerAction: 15, maxPeriod: 60 });
    expect(s.childCompleted).toEqual([]);
    expect(s.parentCompleted).toEqual([]);
    expect(remainingCredits(s)).toBe(100);
    expect(CHILD_LEARNING.length).toBeGreaterThan(0);
    expect(PARENT_LEARNING.length).toBe(5);
  });
  it("records an autonomous within-Key practice buy with a non-execution receipt", () => {
    const s = next(initialFamilyPractice(), { type: "buy", asset: "ORC", amount: 10 });
    expect(s.spent).toBe(10);
    expect(s.holdings.ORC).toBe(1);
    expect(s.requests).toEqual([]);
    expect(s.receipts[0]).toMatchObject({ label: "PRACTICE_ONLY_NOT_EXECUTED", permission: "standing-key" });
  });
  it("blocks a larger order and records only an exact request", () => {
    const s = next(initialFamilyPractice(), { type: "buy", asset: "MKT", amount: 25 });
    expect(s.spent).toBe(0);
    expect(s.holdings.MKT).toBe(0);
    expect(s.requests).toMatchObject([{ asset: "MKT", amount: 25, version: 1, nonce: 1, status: "pending" }]);
  });
  it("approves once without widening a Key and consumes the approval only on matching action", () => {
    const initial = initialFamilyPractice();
    const requested = next(initial, { type: "buy", asset: "MKT", amount: 25 });
    const approved = next(requested, { type: "respond", id: 1, choice: "approve" });
    expect(approved.key).toEqual(initial.key);
    const changedAmount = next(approved, { type: "buy", asset: "MKT", amount: 26 });
    expect(changedAmount.spent).toBe(0);
    expect(changedAmount.requests[0].status).toBe("pending");
    const changedAsset = next(changedAmount, { type: "buy", asset: "ORC", amount: 25 });
    expect(changedAsset.spent).toBe(0);
    const consumed = next(changedAsset, { type: "buy", asset: "MKT", amount: 25 });
    expect(consumed.spent).toBe(25);
    expect(consumed.receipts[0].permission).toBe("allow-once");
    expect(consumed.requests.find(r => r.id === 1)?.status).toBe("used");
    expect(consumed.key).toEqual(initial.key);
    const replay = next(consumed, { type: "buy", asset: "MKT", amount: 25 });
    expect(replay.spent).toBe(25);
    expect(replay.receipts).toHaveLength(1);
  });
  it("parent refusal cannot be overridden by retry", () => {
    const req = next(initialFamilyPractice(), { type: "buy", asset: "MKT", amount: 25 });
    const declined = next(req, { type: "respond", id: 1, choice: "decline" });
    const retry = next(declined, { type: "buy", asset: "MKT", amount: 25 });
    expect(retry.spent).toBe(0);
    expect(retry.requests).toHaveLength(1);
    expect(retry.requests[0].status).toBe("declined");
  });
  it("a standing Key change is explicit, versioned and makes prior requests stale", () => {
    const req = next(initialFamilyPractice(), { type: "buy", asset: "MKT", amount: 25 });
    const changed = next(req, { type: "set-key", maxPerAction: 30, maxPeriod: 60, allowed: ["ORC", "MKT", "BKT"] });
    expect(changed.key.version).toBe(2);
    expect(changed.key.nonce).toBe(2);
    expect(changed.requests[0].status).toBe("stale");
    const lateApproval = next(changed, { type: "respond", id: 1, choice: "approve" });
    expect(lateApproval.requests[0].status).toBe("stale");
    const allowed = next(lateApproval, { type: "buy", asset: "MKT", amount: 25 });
    expect(allowed.receipts[0].permission).toBe("standing-key");
  });
  it("rejects invalid Key updates and retroactive budget shrinkage", () => {
    const s = next(initialFamilyPractice(), { type: "buy", asset: "ORC", amount: 10 });
    for (const data of [
      { maxPerAction: 30, maxPeriod: 20, allowed: ["ORC"] as const },
      { maxPerAction: 10, maxPeriod: 9, allowed: ["ORC"] as const },
      { maxPerAction: 10, maxPeriod: 30, allowed: [] as const },
    ]) {
      const changed = next(s, { type: "set-key", maxPerAction: data.maxPerAction, maxPeriod: data.maxPeriod, allowed: [...data.allowed] });
      expect(changed.key).toEqual(s.key);
    }
  });
  it("refuses insufficient credits, fractional values and forbidden instruments", () => {
    let s = initialFamilyPractice();
    s = next(s, { type: "save" });
    expect(remainingCredits(s)).toBe(80);
    expect(next(s, { type: "buy", asset: "ORC", amount: 99 }).requests).toHaveLength(0);
    expect(next(s, { type: "buy", asset: "ORC", amount: 1.5 }).receipts).toHaveLength(0);
    const restricted = next(s, { type: "set-key", maxPerAction: 15, maxPeriod: 60, allowed: ["ORC"] });
    const denied = next(restricted, { type: "buy", asset: "BKT", amount: 10 });
    expect(denied.requests[0]).toMatchObject({ asset: "BKT", status: "pending" });
    expect(denied.spent).toBe(0);
  });
  it("keeps Parent and Child course progress separate and never changes a Key", () => {
    const original = initialFamilyPractice();
    const c = next(original, { type: "complete", role: "child", lessonId: CHILD_LEARNING[0].id });
    const p = next(c, { type: "complete", role: "parent", lessonId: PARENT_LEARNING[0].id });
    const repeated = next(p, { type: "complete", role: "parent", lessonId: PARENT_LEARNING[0].id });
    expect(repeated.childCompleted).toEqual([CHILD_LEARNING[0].id]);
    expect(repeated.parentCompleted).toEqual([PARENT_LEARNING[0].id]);
    expect(repeated.key).toEqual(original.key);
  });
  it("marks shared family learning without changing authority; resets everything", () => {
    const s = next(next(initialFamilyPractice(), { type: "together" }), { type: "save" });
    expect(s.togetherCompleted).toBe(true);
    expect(s.key.version).toBe(1);
    expect(next(s, { type: "reset" })).toEqual(initialFamilyPractice());
  });
});
