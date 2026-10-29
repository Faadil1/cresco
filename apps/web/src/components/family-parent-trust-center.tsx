"use client";

import { useState } from "react";
import { BookOpen, CheckCircle2, HeartHandshake, Info, LockKeyhole, ShieldAlert, ShieldCheck } from "lucide-react";

const disclosures = [
  {
    id: "money",
    icon: BookOpen,
    eyebrow: "01 · Practice is not money",
    title: "Are the credits real?",
    body: "No. The learning story uses imaginary credits. No cash, USDC, stock or investment belongs to you or your child because of a practice action. There are no deposits, withdrawals, earnings or purchases.",
  },
  {
    id: "chain",
    icon: ShieldAlert,
    eyebrow: "02 · Understand the technology",
    title: "Is there crypto behind Cresco?",
    body: "Yes. Cresco explores blockchain-based permission controls on Solana. The separate technical demonstrations are on Devnet. That is not the same as offering a regulated savings, crypto custody or brokerage account.",
  },
  {
    id: "permissions",
    icon: ShieldCheck,
    eyebrow: "03 · Decisions have boundaries",
    title: "What can a young person actually do?",
    body: "In the practice story, young people can set aside imaginary credits and ask a parent to discuss an investment idea. A parent's approval in the story never places a trade or creates an actual financial permission.",
  },
  {
    id: "identity",
    icon: LockKeyhole,
    eyebrow: "04 · Roles are not identity",
    title: "How do I know a parent is really a parent?",
    body: "The separate Family setup is still an early technical preview. A wallet signature can prove control of a wallet, but cannot establish age, parenthood or legal guardian status. Those checks and independent security review remain outstanding.",
  },
  {
    id: "risk",
    icon: Info,
    eyebrow: "05 · Future financial risk",
    title: "What if Cresco later supports real assets?",
    body: "Cryptoassets can lose value. Stablecoins are not automatically insured bank deposits; tokenized stocks can carry securities and ownership restrictions. Before any real-money service, Cresco would need to disclose custody, rights, fees, risk, eligibility and applicable approvals.",
  },
  {
    id: "privacy",
    icon: HeartHandshake,
    eyebrow: "06 · Your family's privacy",
    title: "Who can see my child's data?",
    body: "This Trust Center asks for no name, email, age, wallet or child details. The practice questions stay only in this page's temporary state. Privacy, retention, access rights and verifiable guardian consent for a real child account are not yet approved; do not enter a child's personal data into the technical preview.",
  },
] as const;

const checkQuestions = [
  {
    id: "credits",
    question: "If a child sets aside 20 practice credits, has any real money been deposited?",
    yes: "Yes, it is a real deposit",
    no: "No, it is only a simulation",
    answer: "no" as const,
    correct: "Correct. Practice credits are imaginary. No deposit or investment occurs.",
    incorrect: "Not quite. This practice story never deposits real money or crypto.",
  },
  {
    id: "approval",
    question: "If a parent approves exploring a fund in the practice story, is a stock purchased?",
    yes: "Yes, the fund is bought",
    no: "No, only the discussion is approved",
    answer: "no" as const,
    correct: "Correct. The approval is only part of the learning story. Nothing is purchased.",
    incorrect: "Not quite. A practice approval never buys a stock, fund or token.",
  },
  {
    id: "guardian",
    question: "Does controlling a wallet prove that a person is a child's legal guardian?",
    yes: "Yes, it verifies the guardian",
    no: "No, legal guardian checks are separate",
    answer: "no" as const,
    correct: "Correct. Wallet control and legal guardian verification are different.",
    incorrect: "Not quite. A signature proves wallet control, not parenthood or legal guardianship.",
  },
] as const;

type CheckAnswer = "yes" | "no";
type CheckId = (typeof checkQuestions)[number]["id"];

export function FamilyParentTrustCenter() {
  const [answers, setAnswers] = useState<Partial<Record<CheckId, CheckAnswer>>>({});
  const answered = checkQuestions.filter((item) => answers[item.id] !== undefined);
  const allCorrect = answered.length === checkQuestions.length &&
    checkQuestions.every((item) => answers[item.id] === item.answer);

  return (
    <section
      id="family-trust"
      aria-labelledby="family-trust-title"
      data-testid="family-parent-trust-center"
      className="mt-14 scroll-mt-6 rounded-[30px] border border-line-soft bg-surface p-5 shadow-soft md:p-8"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-[68ch]">
          <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-green-strong">
            Parent Trust Center · Early preview
          </p>
          <h2 id="family-trust-title" className="mt-2 font-display text-[clamp(32px,4vw,48px)] leading-tight text-navy-strong">
            Know what your family is trying.
          </h2>
          <p className="mt-3 text-[15px] leading-7 text-ink-2">
            Your questions should come before any account or investment. This
            learning preview does not move money, sell assets, earn interest or
            verify anyone as a legal guardian.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-green/30 bg-green-soft px-4 py-2 text-[12px] font-bold text-green-strong">
          <ShieldCheck aria-hidden className="size-4" />
          Imaginary credits only
        </span>
      </div>

      <div className="mt-6 rounded-[20px] border border-line bg-surface-soft p-5">
        <h3 className="text-[16px] font-bold text-navy-strong">Two environments. Two different meanings.</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div className="rounded-[16px] bg-surface p-4">
            <p className="text-[13px] font-bold text-green-strong">Family practice illustration</p>
            <p className="mt-2 text-[13px] leading-6 text-ink-2">
              Fictional credits and same-page Parent/Teen choices. No backend
              request, account, wallet action, trading, yield or custody.
            </p>
          </div>
          <div className="rounded-[16px] bg-surface p-4">
            <p className="text-[13px] font-bold text-navy-strong">Separate Family setup / Solana Devnet work</p>
            <p className="mt-2 text-[13px] leading-6 text-ink-2">
              Technical role and wallet demonstrations are different from this
              practice story. They do not prove legal guardian identity or
              readiness for a real-money financial product.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {disclosures.map(({ id, icon: Icon, eyebrow, title, body }) => (
          <details key={id} className="group rounded-[18px] border border-line-soft bg-surface-soft p-4">
            <summary className="flex min-h-12 cursor-pointer list-none items-center gap-3 text-left [&::-webkit-details-marker]:hidden">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-green-soft text-green-strong">
                <Icon aria-hidden className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-ink-3">{eyebrow}</span>
                <span className="mt-1 block text-[15px] font-bold text-navy-strong">{title}</span>
              </span>
              <span aria-hidden className="text-xl text-ink-2 group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 border-t border-line pt-3 text-[13px] leading-6 text-ink-2">{body}</p>
          </details>
        ))}
      </div>

      <div className="mt-7 rounded-[22px] border border-green/25 bg-green-soft/40 p-5 md:p-6">
        <p className="text-[12px] font-bold uppercase tracking-wider text-green-strong">Understand the limits</p>
        <h3 className="mt-2 font-display text-[30px] leading-tight text-navy-strong">
          Three questions every adult should be able to answer.
        </h3>
        <p className="mt-2 text-[13px] leading-6 text-ink-2">
          This self-check is optional and educational. Your choices are not
          submitted, saved or used as legal consent, eligibility or identity proof.
        </p>
        <div className="mt-5 grid gap-3">
          {checkQuestions.map((item, index) => {
            const selected = answers[item.id];
            return (
              <fieldset key={item.id} className="min-w-0 rounded-[16px] bg-surface p-4">
                <legend className="sr-only">{item.question}</legend>
                <p className="text-[14px] font-bold text-navy-strong">{index + 1}. {item.question}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(["yes", "no"] as const).map((option) => (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={selected === option}
                      onClick={() => setAnswers((current) => ({ ...current, [item.id]: option }))}
                      className={`min-h-11 rounded-xl border px-4 py-2 text-left text-[12px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-strong ${selected === option ? "border-green-strong bg-green-soft text-green-strong" : "border-line bg-surface text-navy-strong"}`}
                    >
                      {option === "yes" ? item.yes : item.no}
                    </button>
                  ))}
                </div>
                {selected && (
                  <p aria-live="polite" role="status" className="mt-3 text-[12px] leading-6 text-navy-strong">
                    {selected === item.answer ? item.correct : item.incorrect}
                  </p>
                )}
              </fieldset>
            );
          })}
        </div>
        {allCorrect && (
          <p role="status" className="mt-4 inline-flex items-start gap-2 text-[13px] font-semibold leading-6 text-green-strong">
            <CheckCircle2 aria-hidden className="mt-0.5 size-4 shrink-0" />
            You understand these three practice boundaries. This is not approval to open an account or invest.
          </p>
        )}
        {answered.length > 0 && (
          <button
            type="button"
            onClick={() => setAnswers({})}
            className="mt-4 min-h-10 rounded-full border border-line bg-surface px-4 py-2 text-[12px] font-bold text-navy-strong"
          >
            Clear these answers
          </button>
        )}
      </div>
      <p className="mt-4 text-[12px] leading-6 text-ink-3">
        This is an educational prototype, not a bank, broker, crypto exchange,
        insurance product or investment adviser. Real financial services for
        minors are not offered here. Jurisdictional and child-privacy reviews
        are outstanding. Please do not enter any child&apos;s personal information.
      </p>
    </section>
  );
}
