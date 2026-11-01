import { describe, expect, it } from "vitest";
import { groceryMargin, priceDrop, savingsPlan } from "./family-learning-lab";

describe("Family lesson labs are fictional arithmetic, never a transaction", () => {
  it("shows a saving plan based on the actual practice goal and saved credits", () => {
    expect(savingsPlan(60, 20, 4)).toEqual({ stillNeeded: 40, perPeriod: 10, periods: 4 });
    expect(savingsPlan(60, 20, 3).perPeriod).toBe(14);
    expect(savingsPlan(60, 80, 4).perPeriod).toBe(0);
    expect(savingsPlan(60, 20, 0).perPeriod).toBe(40);
  });

  it("demonstrates how a shop can lose money even when sales remain unchanged", () => {
    expect(groceryMargin(100, 65, 20).remaining).toBe(15);
    expect(groceryMargin(100, 65, 50).remaining).toBe(-15);
  });

  it("reports the value and loss for a fixed fictional position", () => {
    expect(priceDrop(20, 25)).toEqual({ initialValue: 20, dropPercent: 25, lost: 5, afterDrop: 15 });
    expect(priceDrop(20, 50).afterDrop).toBe(10);
    expect(priceDrop(20, 150).afterDrop).toBe(0);
  });
});
