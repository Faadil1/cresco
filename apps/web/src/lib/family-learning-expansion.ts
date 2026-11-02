import type { LearningModule } from "./family-public-practice";
import type { AppliedExercise } from "./family-learning-depth";

/**
 * An expanded, self-contained curriculum. These are original introductory
 * educational examples, not a live financial recommendation, asset feed or
 * promise of future returns. Every lesson includes multiple teaching steps.
 */
export const EXTRA_CHILD_LEARNING: LearningModule[] = [
  {
    id: "c-budget", title: "Needs, wants and a budget", minutes: 6,
    concept: "A budget makes trade-offs visible: needs, wants and saving each compete for limited money.",
    question: "You have 30 credits and need 20 for transport. What is a sensible plan?",
    choices: ["Spend 30 on games", "Keep 20 for transport and plan around the remaining 10", "Borrow 30 without a plan"],
    answer: 1, explanation: "Keep essential costs visible before deciding what is available for optional purchases.",
    sections: [
      { title: "Every choice has a cost", body: "You have 30 pretend credits. Transport to school costs 20, and a game costs 15. You cannot pay for both without changing something. Budgeting begins by identifying what you need first.", illustration: "piggy", realityCheck: "People's actual needs and income vary. This is a small made-up example to practice prioritizing." },
      { title: "Make a three-part plan", body: "Name a need, a want, and a future goal. Put your required expenses first, then decide how much of the remainder to spend today or set aside. A budget is a plan you can revise.", illustration: "scale", realityCheck: "A budget is not punishment; it helps you make choices you understand." },
      { title: "Review when things change", body: "If transport rises from 20 to 25, only five credits remain. The answer is to revisit the plan, not pretend the price did not change. Talk with a trusted adult when essentials become unaffordable.", illustration: "piggy", realityCheck: "No Family practice credits or real payments move when you read this lesson." },
    ],
  },
  {
    id: "c-price", title: "Compare prices and value", minutes: 5,
    concept: "A lower sticker price is not always a lower total cost. Compare quantity, durability and fees.",
    question: "What should you compare when choosing two products?",
    choices: ["Only the biggest discount badge", "Total cost, quantity and how long the product will work", "The most exciting advertisement"],
    answer: 1, explanation: "Value means what you receive for the total amount paid, not just an attractive label.",
    sections: [
      { title: "A deal can hide a trade-off", body: "One fictional bottle costs six credits for two portions; another costs eight for four. The first is cheaper at checkout, but the second costs less per portion.", illustration: "basket", realityCheck: "Unit prices help only when you compare similar quantities and real needs." },
      { title: "Add every cost", body: "Delivery, taxes, required subscriptions and repairs can change the total. A low first price could be the expensive option over time.", illustration: "scale", realityCheck: "Do not spend or share payment information inside this sandbox." },
      { title: "Check usefulness", body: "Buying twice as much does not save money if you will waste half. Ask whether the product suits your goal, how often you will use it and what the real total will be.", illustration: "piggy", realityCheck: "The best choice may be to buy nothing for now." },
    ],
  },
  {
    id: "c-profit", title: "Revenue, costs and profit", minutes: 6,
    concept: "A business needs to earn enough from customers to cover its expenses before it makes a profit.",
    question: "A shop sells 100 credits of food and pays 110 in total costs. What happened?",
    choices: ["It earned 100 in profit", "It lost 10 credits", "Its profit is guaranteed"],
    answer: 1, explanation: "Profit or loss is revenue minus expenses: 100 minus 110 is negative 10.",
    sections: [
      { title: "Sales are not earnings", body: "Mina's fictional grocery sells 100 credits of food. That's revenue, not profit. The shop must also pay for food, staff and deliveries.", illustration: "storefront", realityCheck: "Even busy companies can lose money when expenses grow faster than sales." },
      { title: "Subtract the bills", body: "If groceries cost 60, wages cost 25 and delivery costs 20, expenses total 105. Revenue of 100 leaves a five-credit loss despite strong sales.", illustration: "chart", realityCheck: "All numbers here are invented for learning." },
      { title: "Ask what could change", body: "The shop can seek better suppliers, reduce waste or improve service. Raising prices may make customers buy less. Every option has trade-offs.", illustration: "storefront", realityCheck: "Understanding the model matters more than guessing whether an imaginary chart rises." },
    ],
  },
  {
    id: "c-funds", title: "Funds, baskets and diversification", minutes: 6,
    concept: "A fund can hold many different assets, but the mix, fees and risks still matter.",
    question: "What should you learn about a fund before considering it?",
    choices: ["Only its name", "What it holds, its costs and its risks", "Whether it can guarantee profits"],
    answer: 1, explanation: "The contents and expenses of a fund matter much more than the appearance of its label.",
    sections: [
      { title: "What is a basket?", body: "Imagine a pretend basket that owns small pieces of several businesses. If one business struggles, the others might perform differently. But some events affect many companies at once.", illustration: "basket", realityCheck: "Diversification lowers some concentration risk; it does not stop all losses." },
      { title: "Look inside the basket", body: "Two funds with different names can contain similar companies. Read their objectives and holdings instead of assuming two labels create a diversified portfolio.", illustration: "shares", realityCheck: "Cresco's Balanced Basket Fund is invented, not a real ETF or regulated fund." },
      { title: "Ask about fees", body: "Even a diversified fund may charge ongoing expenses. Over long periods, small costs matter. Always distinguish an investment's price from its operating fees.", illustration: "scale", realityCheck: "This lesson does not recommend any real fund or portfolio allocation." },
    ],
  },
  {
    id: "c-fees", title: "Fees and hidden costs", minutes: 5,
    concept: "Costs can reduce how much money remains even when an investment or product performs well.",
    question: "Two fictional investments gain the same amount. One has larger fees. Which keeps more after fees?",
    choices: ["The one with larger fees", "The one with smaller fees", "They must be identical"],
    answer: 1, explanation: "When other things are equal, higher fees reduce what remains.",
    sections: [
      { title: "Returns have costs", body: "Suppose a pretend investment grows from 100 to 105 credits, but a service charges two credits. The amount left is 103, not 105.", illustration: "chart", realityCheck: "Fees, taxes and other costs depend on the actual product and situation." },
      { title: "Small costs can repeat", body: "A subscription can charge every month even when you do not use it. Some financial products also charge recurring fees, so ask how much they cost over time.", illustration: "scale", realityCheck: "Not all fees are bad; focus on the value, transparency and total cost." },
      { title: "Read before agreeing", body: "Check when you pay, how fees are calculated and whether they can change. Ask a trusted adult when a contract is unclear.", illustration: "piggy", realityCheck: "This Family sandbox has no real fees or payments." },
    ],
  },
  {
    id: "c-volatility", title: "Why prices move and time matters", minutes: 6,
    concept: "Markets react to new information, expectations and uncertainty. A single day tells only part of the story.",
    question: "A company's price falls today. What does that prove?",
    choices: ["That it will never recover", "That price changes can happen; more research is needed", "That every buyer must sell"],
    answer: 1, explanation: "One movement alone cannot explain a business or predict what comes next.",
    sections: [
      { title: "Prices move for many reasons", body: "Customers, costs, competition and investors' expectations can change. Even good news can be followed by a falling price if the news was already expected.", illustration: "chart", realityCheck: "A chart describes what happened; it does not tell you what must happen next." },
      { title: "Time horizon changes risk", body: "Saving for next month's trip is different from considering a goal many years away. A short deadline leaves less room to recover from unexpected price drops.", illustration: "scale", realityCheck: "Money needed soon should not be treated as a trading game." },
      { title: "Build a question, not a prediction", body: "Instead of guessing tomorrow's price, ask what the company does, how it earns money, what its risks are and what evidence might change your view.", illustration: "shares", realityCheck: "Learning to research is more important than guessing a winning ticker." },
    ],
  },
  {
    id: "c-scams", title: "Recognize scams and promises", minutes: 6,
    concept: "Guaranteed profits, urgent messages and secret links are warning signs in financial conversations.",
    question: "Someone online promises risk-free guaranteed doubling of your money. What is safest?",
    choices: ["Send money immediately", "Share your passwords to prove trust", "Pause, verify independently and ask a trusted adult"],
    answer: 2, explanation: "Pressure and guaranteed returns are warning signs. Never send passwords or money to a stranger.",
    sections: [
      { title: "Notice the pressure", body: "A message says 'only ten minutes left' and promises a guaranteed return. The urgency is designed to prevent careful checking.", illustration: "scale", realityCheck: "Real investments can lose value. Guaranteed high returns should trigger skepticism." },
      { title: "Protect your information", body: "Never send passwords, recovery phrases, access codes, identification photos or wallet keys because a social post asks for them.", illustration: "shares", realityCheck: "Cresco Family does not request any of these details." },
      { title: "Verify from another source", body: "Go directly to an official site, check multiple trustworthy sources and talk with a trusted adult. A logo and a famous name can be copied.", illustration: "piggy", realityCheck: "If something feels wrong, stop instead of clicking or paying." },
    ],
  },
  {
    id: "c-research", title: "Research a real company", minutes: 7,
    concept: "Use official filings to learn what a business sells, how it makes money and what might go wrong.",
    question: "Which is a strong first source for understanding a public company?",
    choices: ["A random video promising a target price", "The company's investor relations and annual report", "A friend's unverified screenshot"],
    answer: 1, explanation: "Official filings are a useful starting point, but still deserve careful reading and independent context.",
    sections: [
      { title: "Start with the business", body: "Find a company you recognize and describe its customers and products. Knowing the name does not mean knowing how it earns money.", illustration: "storefront", realityCheck: "Real company information may change. Check the filing date and current official source." },
      { title: "Ask three research questions", body: "Where does revenue come from? What expenses or competitors create risk? What would you need to learn before forming an opinion?", illustration: "shares", realityCheck: "Cresco's real-company section is an information library; it does not own securities or place orders." },
      { title: "Separate facts and guesses", body: "An annual report can describe products and financial results. A future price is uncertain. Label an assumption as a question, not a fact.", illustration: "chart", realityCheck: "Reading about a real company is not a recommendation to buy it." },
    ],
  },
];

export const EXTRA_PARENT_LEARNING: LearningModule[] = [
  {
    id: "p-digital", title: "Digital safety and young investors", minutes: 6,
    concept: "Help a child identify financial scams, protect private information and ask for evidence.",
    question: "A link requests your child's wallet recovery phrase. What should you do?",
    choices: ["Share it to verify the account", "Stop, do not share credentials and verify independently", "Send a photo of the child"],
    answer: 1, explanation: "Never share access credentials, seed phrases or child identity information with an unverified service.",
    sections: [
      { title: "Discuss pressure tactics", body: "Promises of guaranteed returns, false urgency and impersonation can target young people. Discuss these signs before they encounter a suspicious message.", illustration: "scale", realityCheck: "An educational app must not pretend that lesson completion verifies a real guardian." },
      { title: "Set privacy boundaries", body: "Teach why passwords, one-time codes, recovery phrases, ID documents and banking details are private. Never share them in a chat.", illustration: "shares", realityCheck: "This Family build has no login, identity collection, live wallet or financial account." },
      { title: "Research together", body: "Practice opening an official investor relations page directly, then comparing its description with a social claim. Let your child explain the differences.", illustration: "storefront", realityCheck: "The aim is critical thinking, not approval to trade." },
    ],
  },
  {
    id: "p-research", title: "Guide research without giving tips", minutes: 6,
    concept: "Help children research recognizable companies without confusing information with an investment recommendation.",
    question: "What is a helpful question when reviewing a company with a child?",
    choices: ["Which stock will triple tomorrow?", "How does it make money, what can go wrong, and where is the evidence?", "How can we skip the Parent Key?"],
    answer: 1, explanation: "Ask open questions, differentiate facts and assumptions, and preserve the authority boundary.",
    sections: [
      { title: "Study the business model", body: "Start from products, customers and costs. Encourage the child to explain what the company does in their own words.", illustration: "storefront", realityCheck: "Recognizing a brand is not enough to evaluate a company." },
      { title: "Use official primary sources", body: "Company investor relations pages and published annual filings can help answer questions about products and risks. Verify document dates.", illustration: "shares", realityCheck: "An issuer describes itself in its own documents; questions and independent checks still matter." },
      { title: "Draw a clear boundary", body: "Research and fictional practice have different purposes. Discussing a real company does not permit purchases or create a holding in the Child's practice portfolio.", illustration: "scale", realityCheck: "No real investments, advice, identity verification or custody occur here." },
    ],
  },
];

export const EXTENDED_LESSON_ACTIVITIES: Record<string, AppliedExercise> = Object.fromEntries([
  ["c-budget", "You have 30 credits. Transport costs 20 and a game costs 15.", "What would you do first?", "Keep 20 for transport and review the remaining 10", "Buy the game and hope transport works out", "An essential cost comes first, and you can revisit your wants.", "If you spend everything, your important transport need may go unmet.", "Budget for needs before optional spending."],
  ["c-price", "Two similar products cost six for two portions or eight for four.", "What makes the comparison fair?", "Compare the cost per portion and what you will use", "Pick the one with the biggest discount sticker", "The second is two credits per portion, but only a better deal if you need it.", "The headline discount does not explain the total value.", "Compare like for like, then ask if you actually need it."],
  ["c-profit", "A fictional shop has 100 in sales and 105 in bills.", "Did it make a profit?", "No, it lost five credits", "Yes, because 100 in sales is a lot", "Expenses exceeded sales, so the shop lost five credits.", "Revenue is not profit; costs can be greater than sales.", "Profit and revenue are different."],
  ["c-funds", "Two differently named fictional funds contain nearly the same companies.", "Is owning both automatically diversified?", "No, check the underlying holdings and fees", "Yes, because their names are different", "Different names do not mean different risks.", "Overlapping holdings can leave you concentrated.", "A fund's contents matter more than its name."],
  ["c-fees", "Two sample choices each grow five credits, but one costs two credits in fees.", "What happens after the fee?", "Only three credits of the gain remain", "The full five credits still remain", "Subtract the two-credit fee from the five-credit increase.", "Costs reduce the amount retained.", "Always consider costs when comparing outcomes."],
  ["c-volatility", "A fictional share price drops one afternoon despite a busy store.", "What is a sensible next question?", "Ask about profits, expectations and the time horizon", "Assume the share will certainly double tomorrow", "Business results and market expectations are both relevant.", "A one-day chart cannot promise the next move.", "Research uncertainties instead of predicting a price."],
  ["c-scams", "A social message says to send your recovery phrase before a special offer expires.", "What is the safer action?", "Stop and independently check with a trusted adult", "Send the phrase to avoid missing out", "Refusing to share a secret protects your account.", "A recovery phrase can grant access and should never be shared.", "Pressure and guarantees are warning signs."],
  ["c-research", "You are curious about how Shopify earns money.", "Where would you start?", "Read its official investor relations material and ask questions", "Trust a viral price prediction without a source", "Official disclosures help explain how the company operates.", "A confident prediction with no evidence is not research.", "Find sources, then separate facts from guesses."],
  ["p-digital", "Your child receives a message promising guaranteed returns in exchange for an access code.", "What is the constructive response?", "Stop, do not share the code and review warning signs together", "Forward the code to claim the reward", "You protect private information and create a teaching moment.", "Giving away an access code may compromise an account.", "Safety comes before opportunities."],
  ["p-research", "Your child loves a brand and wants to learn about its shares.", "What is a useful next step?", "Discuss customers, costs, risks and primary sources", "Promise that brand recognition guarantees gains", "Research grows understanding without granting permission.", "Familiarity alone cannot establish investment value.", "A child's research is not authorization to buy."],
].map(([id, situation, question, first, second, firstOutcome, secondOutcome, insight]) => [
  id, { situation, question, options: [first, second] as [string, string], outcomes: [firstOutcome, secondOutcome] as [string, string], insight },
]));
