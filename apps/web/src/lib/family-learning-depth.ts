/**
 * Original contextual teaching moments for Cresco Family's local-only course.
 * The activities give consequences and examples beyond a single recall quiz.
 * No exercise dispatches an investment, approval or Key action.
 */
export type LessonScene = {
  title: string;
  body: string;
  illustration: "piggy" | "shares" | "scale" | "chart" | "storefront" | "basket";
  realityCheck: string;
};

export type AppliedExercise = {
  situation: string;
  question: string;
  options: [string, string];
  outcomes: [string, string];
  insight: string;
};

// The initial three Child lessons and the five Parent lessons used to be one
// text card followed by a quiz. They now have worked examples and a second
// concept before the independent applied exercise and final recall question.
export const FOUNDATION_SCENES: Record<string, LessonScene[]> = {
  "c-save": [
    { title: "Give a dream a deadline", body: "You want a bike in four months. A goal is more than a picture: you need a target, a date and a small plan for getting there. Imagine 60 pretend credits for the bike, not an investment.", illustration: "piggy", realityCheck: "60 credits over four months means making room for about 15 credits each month. The exact amount in real life depends on your budget." },
    { title: "Keep the bike money safe", body: "Credits saved for a near-term purchase serve a different purpose from credits used to explore a fictional company. An imaginary price could fall just before you want your bike.", illustration: "scale", realityCheck: "In this app, 'set aside' is a separate practice balance. It is not a bank account, and no real money moves." },
    { title: "Work backward from the goal", body: "Suppose you have already set aside 20 of your 60-credit target. You still need 40. If you have four practice periods left, try planning for 10 each period instead of guessing a lucky stock.", illustration: "piggy", realityCheck: "Saved credits do not change with fictional company prices. The lesson is planning, not a promise of returns." },
  ],
  "c-explore": [
    { title: "What is a share?", body: "A share represents a small ownership interest in a company. Owning a share is different from buying a product that company makes or visiting its store.", illustration: "shares", realityCheck: "Real shares carry legal rights and investment risks. Cresco's pretend units are neither shares nor tokens." },
    { title: "Understand the business first", body: "Imagine Mina's family grocery. More customers sounds promising, but food, wages and deliveries cost money too. Ask how the business earns revenue and what costs can rise.", illustration: "storefront", realityCheck: "Sales are not the same as profit. A company can sell more and still struggle with higher costs." },
    { title: "A practice receipt is not ownership", body: "If you select 10 credits of Neighborhood Markets here, you receive only a fictional entry and a practice balance. You do not own the shop, a financial product or an onchain token.", illustration: "shares", realityCheck: "A real investing app needs identity, regulatory and execution controls absent from this teaching sandbox." },
  ],
  "c-risk": [
    { title: "Make a loss concrete", body: "You put 20 pretend credits into a fictional company. If its sample price falls 25%, those pretend units would be worth 15 credits. A loss feels different when you need the money soon.", illustration: "chart", realityCheck: "A 25% decline on 20 is a five-credit decline. This is arithmetic, not a market prediction." },
    { title: "One choice or a basket?", body: "All 20 credits in one company means that one company's bad month affects your full practice portfolio. Spreading credits between different holdings changes your exposure.", illustration: "basket", realityCheck: "A basket can still fall. Diversification reduces some concentration risk, not every risk." },
    { title: "Your deadline changes the decision", body: "A family trip planned for next month and a long-term goal do not have the same room for ups and downs. Consider the time horizon before picking any risky product.", illustration: "scale", realityCheck: "Cresco never tells you what to buy with real money. Discuss any real financial choice with an appropriate adult or adviser." },
  ],
  "p-basics": [
    { title: "Ask before explaining", body: "Begin with your child's goal: What makes this bike, gaming setup or family trip meaningful? Ask what they already know and what they find confusing.", illustration: "piggy", realityCheck: "An open question usually teaches more than a promise that an asset will rise." },
    { title: "Separate three conversations", body: "Saving for an expected expense, learning how companies work, and authorizing financial activity are three different tasks. A lesson completion must not quietly grant permission.", illustration: "scale", realityCheck: "The current Family app only simulates choices in one browser tab; it does not authenticate a guardian." },
    { title: "Try a family check-in", body: "Ask your child to explain one idea in their own words, then name one question they still have. Keep the discussion about understanding, not performance or rewards.", illustration: "shares", realityCheck: "The Parent's own learning path is separate from the Child's progress." },
  ],
  "p-key": [
    { title: "A boundary the child can understand", body: "A practice Key says how much the Child can choose alone per action, how much can be used in a period, and which fictional instruments are eligible.", illustration: "shares", realityCheck: "The initial simulation limits one choice to 15 credits, but that number does not represent a real financial permission." },
    { title: "One exception is not a new rule", body: "If the Child asks to try 25 credits, the simulated Parent can accept one exact request. That does not increase the standing 15-credit ceiling.", illustration: "scale", realityCheck: "A separate, deliberate Key update is required to change a standing limit. The approval is single-use." },
    { title: "Learning cannot widen a Key", body: "An earned badge or correct quiz answer shows educational progress. It never alters limits, eligible instruments or the Parent's decision.", illustration: "piggy", realityCheck: "Real delegated authority requires identity and safeguards this sandbox does not have." },
  ],
  "p-risk": [
    { title: "Describe the downside", body: "If a pretend position of 20 credits falls 30%, it becomes 14. Explain that this is six fewer credits rather than describing it only as a red chart.", illustration: "chart", realityCheck: "Cresco's example prices are invented and cannot predict market returns." },
    { title: "Discuss concentration", body: "One company exposes all of that position to one set of business problems. A basket spreads exposure but can still decline when many companies have a bad period.", illustration: "basket", realityCheck: "Diversification does not remove loss risk." },
    { title: "Link risk to the goal", body: "Ask: If this value dropped before you wanted your bike, what would change? This connects a percentage to an actual family decision.", illustration: "scale", realityCheck: "The protected saving goal stays separate from simulated investment practice." },
  ],
  "p-boundary": [
    { title: "Read the exact request", body: "Before responding, check the pretend asset, amount, reason, standing Key and selected goal. Do not infer that a correct lesson makes the decision safe.", illustration: "shares", realityCheck: "The Parent lens shows a snapshot of the Child's request; it is not real guardian verification." },
    { title: "Three distinct actions", body: "Decline: nothing is purchased. Approve once: one exact practice request may proceed. Change the Key: future standing limits change, and previous pending requests expire.", illustration: "scale", realityCheck: "An approval cannot be replayed or silently widened into blanket permission." },
    { title: "Explain the answer", body: "Give a reason the Child can understand. A thoughtful decline still produces an opportunity to learn without changing the financial boundary.", illustration: "piggy", realityCheck: "Discuss the decision before moving on to another exercise." },
  ],
  "p-together": [
    { title: "Let both people explain", body: "Ask what the Child expected and what the Parent was concerned about. Invite each to describe one thing they noticed.", illustration: "shares", realityCheck: "The check-in has no financial authority and cannot change the Key." },
    { title: "Revisit a character", body: "Return to Mina's grocery: would more shoppers necessarily mean more profit? Consider the delivery bill as well as revenue.", illustration: "storefront", realityCheck: "Reasoning about a fictional business is not a recommendation to buy shares." },
    { title: "Choose the next small step", body: "Agree on one idea to research, one question to ask, or one saving habit to practice. Avoid measuring success only by badges.", illustration: "piggy", realityCheck: "A family can disagree about a practice choice and still complete a useful conversation." },
  ],
};

export const LESSON_ACTIVITIES: Record<string, AppliedExercise> = {
  "c-save": {
    situation: "Your bike costs 60 pretend credits. You have 20 saved, and the day you need it is getting closer.",
    question: "What is the safer next step for the bike goal?",
    options: ["Plan to save the remaining 40 over time", "Put the bike credits into one risky company and hope it doubles"],
    outcomes: ["Planning gives you a number to work toward without depending on a fictional price.", "That choice puts a near-term goal at the mercy of a price that could fall."],
    insight: "A saving goal is about meeting a need on time, not predicting a price.",
  },
  "c-explore": {
    situation: "Mina's grocery has more customers, but the delivery bill rose.",
    question: "What should you investigate before calling it a good business?",
    options: ["Sales and the costs of running the shop", "Only how many people enter the store"],
    outcomes: ["Exactly: both revenue and expenses influence how much the shop earns.", "More customers are one clue, but higher delivery and wage costs can erase the benefit."],
    insight: "Understand how a business earns money before thinking about ownership.",
  },
  "c-risk": {
    situation: "Your entire pretend portfolio is in one fictional company when its price drops 25%.",
    question: "What could reduce dependence on that one company?",
    options: ["Explore a mix of different practice holdings", "Assume that one company cannot fall again"],
    outcomes: ["A mix spreads exposure, although all holdings could still lose value.", "Price declines can continue; a single company is still a concentrated risk."],
    insight: "Diversification changes exposure; it does not guarantee a positive outcome.",
  },
  "original-what-is-a-stock": {
    situation: "A friend buys the newest headphones from a company. You buy a share of that company in a real brokerage account.",
    question: "Whose purchase represents a piece of the company?",
    options: ["The share buyer's", "The headphone buyer's"],
    outcomes: ["A share may represent an ownership stake; it also carries market risk.", "A product purchase does not grant ownership in the company."],
    insight: "Product ownership and company ownership are different.",
  },
  "original-why-companies-sell-shares": {
    situation: "A growing fictional business wants to open more stores.",
    question: "Why might it issue shares?",
    options: ["To raise capital in exchange for ownership", "To guarantee investors a profit"],
    outcomes: ["Selling shares can raise growth funds, with ownership spread to shareholders.", "Issuing shares does not guarantee future profits or prices."],
    insight: "Funding growth comes with trade-offs and risk.",
  },
  "original-stock-vs-tokenized-security": {
    situation: "A digital token claims to represent a real company's shares.",
    question: "What must you verify before treating the token as ownership?",
    options: ["Legal rights, issuer and custody arrangements", "Whether the token has a shiny logo"],
    outcomes: ["Good: legal and custody details determine what rights, if any, the holder has.", "A token's appearance says nothing about whether it grants lawful ownership."],
    insight: "Technology alone does not establish a financial right.",
  },
  "original-why-prices-move": {
    situation: "An invented company announces growing sales but also much higher expenses.",
    question: "Which fact is worth studying next?",
    options: ["How profits and expectations changed", "Only whether yesterday's price was green"],
    outcomes: ["Prices can reflect competing expectations about profit and risk.", "One day's price movement does not explain a company's value."],
    insight: "Evidence is more useful than guessing from a chart.",
  },
  "original-risk-and-reward": {
    situation: "One fictional investment might rise or fall sharply just before an important purchase.",
    question: "What deserves attention alongside possible gain?",
    options: ["Potential loss and how soon money is needed", "Only the biggest possible upside"],
    outcomes: ["Both downside and time horizon matter when judging uncertainty.", "Focusing only on upside hides the chance that your goal will be harder to reach."],
    insight: "Risk is the possibility of outcomes you may not be able to afford.",
  },
  "original-build-your-portfolio": {
    situation: "You have three fictional holdings: one is 90% of what you invested.",
    question: "What is your main concentration concern?",
    options: ["One company's bad news affects almost everything", "Three line items automatically mean broad diversification"],
    outcomes: ["A holding's weight matters more than merely counting the names.", "A portfolio can hold three names and still be dominated by one position."],
    insight: "Allocation is a clearer picture of portfolio risk than a ticker count.",
  },
  "p-basics": {
    situation: "Your child is excited about a bike goal but confused by 'portfolio' and 'shares'.",
    question: "What is a constructive starting conversation?",
    options: ["Ask what the bike goal means and what they understand", "Start by setting an aggressive return target"],
    outcomes: ["Listening gives you the context to teach and plan together.", "A return target can distract from understanding and risk."],
    insight: "Shared understanding should come before financial authority.",
  },
  "p-key": {
    situation: "The Key allows 15 credits per choice. The Child requests 25.",
    question: "What does one-time approval do?",
    options: ["Applies only to that exact 25-credit request", "Raises the permanent limit to 25"],
    outcomes: ["Correct: the standing Key remains at 15 for subsequent independent choices.", "A single exception does not change future limits."],
    insight: "An exception and a policy change are separate decisions.",
  },
  "p-risk": {
    situation: "The Child needs 60 credits for a bike soon, and an example investment drops 30%.",
    question: "What is the best teaching question?",
    options: ["Would that drop affect the bike deadline?", "Which stock will definitely recover first?"],
    outcomes: ["This connects a percentage to a goal the Child actually cares about.", "No one can guarantee a recovery date."],
    insight: "A useful risk conversation considers both loss and the child's deadline.",
  },
  "p-boundary": {
    situation: "You change the standing Key after a 25-credit practice request was made.",
    question: "What should happen to the old request?",
    options: ["Expire; ask again under the new Key", "Remain secretly approved for later"],
    outcomes: ["The request no longer matches the updated Key and must be reconsidered.", "A previous request must not survive a change in the authority it relied on."],
    insight: "Stale requests should fail closed.",
  },
  "p-together": {
    situation: "You and your child disagree about a fictional company's potential.",
    question: "Which next action builds understanding?",
    options: ["Compare evidence and name one thing to check", "Give a bonus credit whenever the child agrees"],
    outcomes: ["Both people can explain their reasoning and learn without forcing agreement.", "Agreement is not evidence, and badges cannot grant permission."],
    insight: "The goal is informed autonomy, not always agreeing.",
  },
};
