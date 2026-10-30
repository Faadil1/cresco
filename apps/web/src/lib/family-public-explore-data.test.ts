import { describe, expect, it } from "vitest";
import { FAMILY_EXPLORE_CASES, filterFamilyExploreCases, sampleTrendPath } from "./family-public-explore-data";
import { PRACTICE_ASSETS, initialFamilyPractice } from "./family-public-practice";

describe("Family fictional research catalog", () => {
  it("provides six invented research cases, but practice on only three exact existing assets", () => {
    expect(FAMILY_EXPLORE_CASES).toHaveLength(6);
    const tradableInPractice = FAMILY_EXPLORE_CASES.filter(item => item.practiceCode);
    expect(tradableInPractice.map(item => item.practiceCode)).toEqual(["ORC", "MKT", "BKT"]);
    expect(tradableInPractice.every(item => PRACTICE_ASSETS.some(asset => asset.code === item.practiceCode))).toBe(true);
    expect(FAMILY_EXPLORE_CASES.filter(item => !item.practiceCode)).toHaveLength(3);
    expect(initialFamilyPractice().receipts).toEqual([]);
  });
  it("filters by sector, business model and customer without backend data", () => {
    expect(filterFamilyExploreCases("", "All")).toHaveLength(6);
    expect(filterFamilyExploreCases("clinic", "All").map(item => item.id)).toEqual(["harbor"]);
    expect(filterFamilyExploreCases("grocery", "Consumer").map(item => item.id)).toEqual(["markets"]);
    expect(filterFamilyExploreCases("grocery", "Energy")).toEqual([]);
    expect(filterFamilyExploreCases("  SOLAR  ", "All").map(item => item.id)).toEqual(["greenroof"]);
  });
  it("provides complete explicit risk and research questions, not unexplained tiny charts", () => {
    for (const item of FAMILY_EXPLORE_CASES) {
      expect(item.examplePath.length).toBeGreaterThan(2);
      expect(item.model.length).toBeGreaterThan(10);
      expect(item.uncertainty.length).toBeGreaterThan(10);
      expect(item.researchPrompt.length).toBeGreaterThan(10);
      expect(item.answers).toHaveLength(3);
      expect(item.answers[item.correctAnswer]).toBeTruthy();
      expect(sampleTrendPath(item.examplePath)).toMatch(/^M0\.0 /);
    }
  });
  it("handles invalid trends safely without introducing live charts or random market data", () => {
    expect(sampleTrendPath([])).toBe("");
    expect(sampleTrendPath([Number.NaN, 5])).toBe("");
    expect(sampleTrendPath([5, 5, 5])).toContain("L");
    expect(sampleTrendPath([5, 6])).toBe(sampleTrendPath([5, 6]));
  });
});
