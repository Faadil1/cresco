import { describe, expect, it } from "vitest";
import sec from "./family-sec-verified-10k.json";
import { REAL_COMPANY_RESEARCH } from "./family-real-companies";
import { COMPANY_EXPLAINERS, MONEY_TERMS, profitPerHundred } from "./family-real-company-explainers";

describe("child-friendly real-company explainers (issue #130 P2)", () => {
  it("cover every company with plain words, two strong reasons and one gentle weak one, and no prices", () => {
    for (const company of REAL_COMPANY_RESEARCH) {
      const e = COMPANY_EXPLAINERS[company.id];
      expect(e.inOneSentence.length).toBeGreaterThan(30);
      expect(e.moneyExample).toMatch(/revenue/i);
      expect(e.reasons.filter(r => r.strong)).toHaveLength(2);
      expect(e.reasons.filter(r => !r.strong)).toHaveLength(1);
      // No share price, forecast or recommendation in teaching copy.
      expect(JSON.stringify(e)).not.toMatch(/\$\d|buy now|you should (buy|invest)|guarantee(d)? (gain|return)/i);
      expect(JSON.stringify(e).match(/will rise/gi)?.length ?? 0).toBe(JSON.stringify(e).match(/(not|n.t) promise [^"]*will rise/gi)?.length ?? 0);
    }
    expect(MONEY_TERMS.referencePrice).toMatch(/not a live price/i);
  });

  it("profit per $100 of revenue is plain arithmetic on the official annual figures", () => {
    const companies = (sec as { companies: Record<string, { annualRevenue: { valueUSD: number }; annualNetIncome: { valueUSD: number } }> }).companies;
    expect(profitPerHundred(companies.apple.annualRevenue.valueUSD, companies.apple.annualNetIncome.valueUSD)).toBe(28);
    expect(profitPerHundred(companies.costco.annualRevenue.valueUSD, companies.costco.annualNetIncome.valueUSD)).toBe(3);
    expect(profitPerHundred(0, 5)).toBe(0);
  });
});
