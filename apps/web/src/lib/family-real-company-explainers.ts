/**
 * Child-friendly explanations for the four real companies (issue #130, P2).
 * Plain words only: what the business does, how money comes in, and a short
 * "why would someone choose it?" reflection. No prices, forecasts, ratings or
 * recommendations. Company facts stay in family-real-companies.ts and the
 * dated SEC snapshot; this file adds teaching language around them.
 */
import type { PublicCompanyResearch } from "./family-real-companies";

export type ChooseReason = { id: string; label: string; strong: boolean; feedback: string };
export type CompanyExplainer = { inOneSentence: string; moneyExample: string; reasons: ChooseReason[] };

const weakBrand = (name: string): ChooseReason => ({
  id: "like-brand", label: `I like ${name}'s logo or ads`, strong: false,
  feedback: "Liking a brand is a fine start, but it does not tell you whether the business earns more than it spends. Look at step 1's results too.",
});

export const COMPANY_EXPLAINERS: Record<PublicCompanyResearch["id"], CompanyExplainer> = {
  apple: {
    inOneSentence: "Apple makes iPhones, Macs and other devices, and sells services like app subscriptions and cloud storage.",
    moneyExample: "When a family buys an iPhone or pays for extra iCloud storage each month, that money is Apple's revenue.",
    reasons: [
      { id: "use-products", label: "Many people use and keep paying for its products", strong: true,
        feedback: "Good thinking: lots of loyal customers and monthly services can bring in steady revenue. It still can't promise the share price will rise." },
      { id: "big-revenue", label: "Its official results show a lot of revenue and profit", strong: true,
        feedback: "That is research, not guessing. Remember the results are for a past year, and prices can fall even when profits are high." },
      weakBrand("Apple"),
    ],
  },
  microsoft: {
    inOneSentence: "Microsoft makes software like Windows and Office, and rents computing power to other businesses through its cloud.",
    moneyExample: "When a school pays every year for Office, or a company rents Microsoft's cloud servers, that money is Microsoft's revenue.",
    reasons: [
      { id: "use-products", label: "Schools and businesses pay for it again every year", strong: true,
        feedback: "Repeat customers are a real strength. Competition and the cost of building data centres are risks to keep in mind." },
      { id: "big-revenue", label: "Its official results show a lot of revenue and profit", strong: true,
        feedback: "That is research, not guessing. Past results do not tell you what the share price will do next." },
      weakBrand("Microsoft"),
    ],
  },
  costco: {
    inOneSentence: "Costco runs big warehouse stores where members pay a yearly fee to buy groceries and household goods in bulk.",
    moneyExample: "When a family pays its yearly membership and buys a big pack of rice, both payments are Costco's revenue.",
    reasons: [
      { id: "use-products", label: "Members come back every week and renew each year", strong: true,
        feedback: "Membership fees are steady money. But stores have big costs (staff, rent, transport), so profit is a small slice of revenue." },
      { id: "big-revenue", label: "Its official results show huge revenue", strong: true,
        feedback: "Revenue is huge, but check profit too: Costco keeps only a small part of each sale after costs." },
      weakBrand("Costco"),
    ],
  },
  shopify: {
    inOneSentence: "Shopify makes the software that lets shops sell online, and takes a small fee when they make sales.",
    moneyExample: "When a small bakery pays Shopify a monthly fee to run its website, and a little from each online order, that is Shopify's revenue.",
    reasons: [
      { id: "use-products", label: "Many shops depend on it to sell online", strong: true,
        feedback: "If lots of shops rely on it, Shopify earns more as they sell more. If shops sell less, Shopify can earn less too." },
      { id: "big-revenue", label: "Its official results show it made a profit last year", strong: true,
        feedback: "That is research, not guessing. One good year does not promise the next one, or a rising share price." },
      weakBrand("Shopify"),
    ],
  },
};

/** Plain-language definitions used by the tap-to-explain terms. */
export const MONEY_TERMS = {
  revenue: "Revenue (sales) is all the money customers paid the company in a year, before it pays any costs.",
  profit: "Profit (net income) is the money left over after the company has paid all its costs, like staff, materials and taxes.",
  referencePrice: "A reference price is a share price you saw yourself on a certain date. It is not a live price and it may already have changed.",
  ticker: "A ticker is the short code for a company on a stock exchange, like AAPL for Apple.",
  share: "A share is a tiny piece of a company. Here you only use paper shares with imaginary dollars.",
} as const;

/** Profit as a share of revenue, from the official figures (a ratio, not a price). */
export function profitPerHundred(revenueUSD: number, netIncomeUSD: number): number {
  return revenueUSD > 0 ? Math.round(netIncomeUSD / revenueUSD * 100) : 0;
}
