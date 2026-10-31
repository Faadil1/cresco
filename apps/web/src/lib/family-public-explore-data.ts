/**
 * Invented companies and example price paths for the public Family teaching sandbox.
 * No live feeds, API calls, commercial products, actual issuers, performance, or claims of ownership.
 * The first three entries map to the independent pure Practice engine; the others are research-only.
 */
import type { AssetCode } from "./family-public-practice";

export type FamilyExploreCase = {
  id: string;
  practiceCode?: AssetCode;
  name: string;
  category: "Technology" | "Consumer" | "Funds" | "Services" | "Energy" | "Health";
  model: string;
  customer: string;
  opportunity: string;
  uncertainty: string;
  researchPrompt: string;
  // Every business has a fictional human-sized dilemma, not a real market claim.
  episode: {
    person: string;
    scene: string;
    dilemma: string;
    options: readonly [string, string];
    reflection: readonly [string, string];
  };
  examplePath: readonly number[];
  question: string;
  answers: readonly [string, string, string];
  correctAnswer: number;
  lesson: string;
};
export const FAMILY_EXPLORE_CASES: readonly FamilyExploreCase[] = [
  {
    id: "orchard", practiceCode: "ORC", name: "Orchard Technology", category: "Technology",
    model: "Sells fictional software subscriptions to neighborhood stores.",
    customer: "Small store owners who need simple inventory tools.",
    opportunity: "A useful product could attract more paying customers.",
    uncertainty: "Subscriptions may be canceled if stores reduce spending.",
    researchPrompt: "How many stores keep paying, and what does it cost to serve them?",
    episode: {"person":"Ari, who runs a tiny bookstore","scene":"Ari's shelves are full of the wrong titles. Orchard promises software that predicts which books sell, but Ari worries about another monthly bill.","dilemma":"Should Ari try Orchard before knowing whether it saves enough time?","options":["Ask for a short trial and measure the time saved","Sign a long contract because the app looks exciting"],"reflection":["Testing the benefit against the subscription cost gives Ari evidence before committing.","Excitement is understandable, but the price of a subscription does not disappear if the software disappoints."]},
    examplePath: [8, 9, 8, 11, 9, 12, 11, 10],
    question: "If Orchard adds customers but loses money on each subscription, what should you learn next?",
    answers: ["Whether customers stay and the service can cover its costs", "Only the latest example price", "The logo's color"],
    correctAnswer: 0, lesson: "A growing business is not necessarily profitable. Costs matter alongside sales.",
  },
  {
    id: "markets", practiceCode: "MKT", name: "Neighborhood Markets", category: "Consumer",
    model: "Runs invented grocery stores with everyday products.",
    customer: "Families buying food and household essentials.",
    opportunity: "Repeat purchases may support steadier customer demand.",
    uncertainty: "Higher food, labor or delivery costs can reduce profit.",
    researchPrompt: "Are sales growing faster than the cost of keeping stores open?",
    episode: {"person":"Mina, whose family runs a neighborhood grocery","scene":"Mina's family sells fruit, rice and bread. Their supplier has raised delivery prices just as more neighbors start shopping there.","dilemma":"More people are visiting the shop. Does that automatically mean Mina's family is earning more?","options":["Compare food, wages and delivery costs with sales","Assume more customers always means more profit"],"reflection":["More customers can help, but Mina needs to check what remains after paying the bills.","Busier shelves do not guarantee profit when suppliers, workers and delivery all cost more."]},
    examplePath: [5, 5, 4, 6, 5, 4, 6, 5],
    question: "What might happen if grocery-store expenses increase faster than sales?",
    answers: ["Profit can become smaller", "Profit is guaranteed to grow", "There can be no risk"],
    correctAnswer: 0, lesson: "Revenue and profit are different. Expenses change the outcome.",
  },
  {
    id: "basket", practiceCode: "BKT", name: "Balanced Basket Fund", category: "Funds",
    model: "An imaginary fund combines multiple example investments.",
    customer: "A fictional learner looking at the idea of spreading exposure.",
    opportunity: "Different holdings may respond differently to events.",
    uncertainty: "Even many holdings can decline at the same time.",
    researchPrompt: "What does the basket hold, and are its holdings actually different?",
    episode: {"person":"Sam, who is saving for a family trip","scene":"Sam hears that a mixed basket owns pieces of several imaginary businesses. One bad week makes almost every part of the basket fall.","dilemma":"Does holding several different things mean Sam's travel goal cannot be affected?","options":["Check what the basket actually holds and keep savings separate","Treat diversification as a promise of no losses"],"reflection":["A basket may spread risk, but Sam still needs to protect money needed for the trip.","Diversification is not insurance. Several holdings can lose value together."]},
    examplePath: [20, 20, 21, 19, 20, 19, 21, 20],
    question: "Does a fund with several holdings guarantee no losses?",
    answers: ["Yes, diversification guarantees profits", "No, markets and holdings can fall together", "Only after you earn a learning badge"],
    correctAnswer: 1, lesson: "Diversification may reduce concentration, but cannot remove all risk.",
  },
  {
    id: "river", name: "River Transit Services", category: "Services",
    model: "Operates an invented local bus network under service contracts.",
    customer: "A city purchasing mobility services for residents.",
    opportunity: "Long contracts may give visibility into future work.",
    uncertainty: "Vehicle maintenance, staffing and contract conditions affect costs.",
    researchPrompt: "Can the company reliably deliver service within its contract budget?",
    episode: {"person":"Leila, a bus-route planner","scene":"Leila's team has won a long city contract, but a fleet repair arrives right when staff shortages make every shift more expensive.","dilemma":"Is the long contract enough to know River Transit will make money?","options":["Ask how repairs and staffing costs fit the contract","Assume a long contract means there is no risk"],"reflection":["A long contract can make income predictable without making the service cheap to operate.","A contract promises work, not an absence of breakdowns or rising costs."]},
    examplePath: [9, 8, 9, 10, 9, 8, 8, 9],
    question: "Why might a long service contract still be risky?",
    answers: ["Because costs may rise while contract revenue stays fixed", "It eliminates every operating cost", "It proves all future profits"],
    correctAnswer: 0, lesson: "Predictable revenue does not eliminate operational risk.",
  },
  {
    id: "greenroof", name: "Green Roof Energy", category: "Energy",
    model: "Designs imaginary rooftop solar equipment for small buildings.",
    customer: "Building owners hoping to reduce energy purchases.",
    opportunity: "A useful design might see demand from many buildings.",
    uncertainty: "Installation costs, regulations and technology change over time.",
    researchPrompt: "Who pays installation costs, and what happens when policies change?",
    episode: {"person":"Jo, who wants solar panels on a community center","scene":"Jo loves the idea of rooftop solar. The installer shows a sunny-year estimate, but the community center still needs permits and a realistic installation budget.","dilemma":"What should Jo check before promising that solar will pay for itself?","options":["Compare installation costs, demand and policy changes","Judge the project only by its best sunny month"],"reflection":["A useful clean-energy idea also needs realistic costs, time and assumptions.","The brightest month is not the whole project. A beautiful idea can still face expensive surprises."]},
    examplePath: [7, 6, 8, 8, 6, 7, 9, 7],
    question: "What should you investigate before trusting an optimistic forecast?",
    answers: ["Only the best month", "Costs, demand, technology and policy uncertainty", "Whether the chart is green"],
    correctAnswer: 1, lesson: "A promising idea is not a guaranteed investment result.",
  },
  {
    id: "harbor", name: "Harbor Medical Tools", category: "Health",
    model: "Builds invented equipment that clinics use during routine appointments.",
    customer: "Healthcare clinics purchasing durable equipment.",
    opportunity: "A practical tool could become part of routine workflows.",
    uncertainty: "Safety testing, support and procurement can be expensive.",
    researchPrompt: "Does the product work reliably, and can clinics afford it?",
    episode: {"person":"Dr. Noor, who runs a small clinic","scene":"Dr. Noor likes Harbor's new appointment tool, but the clinic cannot afford weeks of repairs or a device that fails safety tests.","dilemma":"If a health tool seems helpful, does that prove Harbor is a good business?","options":["Ask about safety, support, clinic budgets and long-term costs","Assume usefulness guarantees commercial success"],"reflection":["Helpful products still need trustworthy safety checks, sustainable support and customers who can pay.","Even a useful idea can be too costly or unreliable to succeed as a business."]},
    examplePath: [10, 11, 11, 8, 9, 12, 10, 10],
    question: "Does a useful health product automatically create a profitable company?",
    answers: ["Yes, useful products always return profits", "No, quality, costs and customers still matter", "Only if the sample price rises"],
    correctAnswer: 1, lesson: "Product usefulness and investment value are different questions.",
  },
];

export function filterFamilyExploreCases(query: string, category: FamilyExploreCase["category"] | "All") {
  const term = query.trim().toLowerCase();
  return FAMILY_EXPLORE_CASES.filter(item =>
    (category === "All" || item.category === category) &&
    (!term || [item.name, item.category, item.model, item.customer, item.uncertainty]
      .some(value => value.toLowerCase().includes(term)))
  );
}
export function sampleTrendPath(points: readonly number[], width = 320, height = 100) {
  if (points.length < 2 || points.some(value => !Number.isFinite(value))) return "";
  const minimum = Math.min(...points);
  const range = Math.max(...points) - minimum || 1;
  return points.map((value, index) => {
    const x = index / (points.length - 1) * width;
    const y = height - 8 - ((value - minimum) / range) * (height - 16);
    return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");
}
