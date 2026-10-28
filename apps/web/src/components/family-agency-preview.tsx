"use client";

import { useState } from "react";
import { ArrowRight, BookOpen, RotateCcw, ShieldCheck, Sprout } from "lucide-react";

type PracticeDecision = "none" | "pending" | "approved" | "declined";

const INITIAL_CREDITS = 100;
const SAVING_STEP = 20;

/**
 * A purely local illustration of a Teen acting and a Parent responding.
 * Not a wallet, balance, savings product, yield, payment, trade or mandate.
 * No network requests, auth, localStorage, SDK or blockchain operations.
 */
export function FamilyAgencyPreview() {
  const [savedCredits, setSavedCredits] = useState(0);
  const [decision, setDecision] = useState<PracticeDecision>("none");
  const availableCredits = INITIAL_CREDITS - savedCredits;

  const reset = () => {
    setSavedCredits(0);
    setDecision("none");
  };

  const status =
    decision === "pending"
      ? "A request is waiting for a Parent decision. No action has happened."
      : decision === "approved"
        ? "Parent approved exploring this idea in practice. Nothing was purchased."
        : decision === "declined"
          ? "Parent declined this practice request. Nothing was purchased."
          : savedCredits
            ? "You made a saving choice yourself. You can still ask to explore something new."
            : "Your choices are yours to make in this practice story.";

  return (
    <section
      aria-labelledby="family-agency-preview-title"
      data-testid="family-agency-preview"
      className="mt-14 rounded-[30px] border border-line-soft bg-surface p-5 shadow-soft md:p-8"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-[65ch]">
          <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-green-strong">
            A story you can try
          </p>
          <h2 id="family-agency-preview-title" className="mt-2 font-display text-[clamp(32px,4vw,48px)] leading-tight text-navy-strong">
            The young person acts. The parent guides.
          </h2>
          <p className="mt-2 text-[14px] leading-6 text-ink-2">
            Explore one simple decision together. This is a local practice story,
            not a connected Family account.
          </p>
        </div>
        <span className="rounded-full border border-green/30 bg-green-soft px-4 py-2 text-[12px] font-bold text-green-strong">
          Practice only · zero real funds
        </span>
      </div>

      <div className="mt-7 grid gap-4 lg:grid-cols-2">
        <article aria-label="Teen practice view" className="rounded-[24px] border border-green/25 bg-green-soft/40 p-5 md:p-6">
          <div className="flex items-center gap-2 text-green-strong">
            <Sprout aria-hidden className="size-5" />
            <h3 className="text-[15px] font-bold">Teen · Your own choices</h3>
          </div>
          <p className="mt-3 text-[13px] leading-6 text-ink-2">
            Start with 100 imaginary credits. Learn what setting something aside means.
          </p>
          <dl className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-[16px] bg-surface p-4">
              <dt className="text-[12px] font-semibold text-ink-2">Available practice credits</dt>
              <dd className="mt-1 font-display text-[34px] text-navy-strong" data-testid="practice-available">{availableCredits}</dd>
            </div>
            <div className="rounded-[16px] bg-surface p-4">
              <dt className="text-[12px] font-semibold text-ink-2">Set aside in practice</dt>
              <dd className="mt-1 font-display text-[34px] text-navy-strong" data-testid="practice-saved">{savedCredits}</dd>
            </div>
          </dl>
          <div className="mt-5 grid gap-2">
            <button
              type="button"
              disabled={availableCredits < SAVING_STEP}
              onClick={() => setSavedCredits((current) => current + SAVING_STEP)}
              className="flex min-h-12 items-center justify-between rounded-[14px] bg-green-strong px-5 py-3 text-left text-[14px] font-bold text-white disabled:opacity-50"
            >
              Set aside 20 practice credits <ArrowRight aria-hidden className="size-4" />
            </button>
            <button
              type="button"
              disabled={decision !== "none"}
              onClick={() => setDecision("pending")}
              className="flex min-h-12 items-center justify-between rounded-[14px] border border-green/40 bg-surface px-5 py-3 text-left text-[14px] font-bold text-navy-strong disabled:opacity-50"
            >
              Ask to explore a diversified fund <BookOpen aria-hidden className="size-4" />
            </button>
          </div>
          <p className="mt-3 text-[12px] leading-5 text-ink-3">
            Exploring an investment is different from buying one. No investment is
            being offered or recommended here.
          </p>
        </article>

        <article aria-label="Parent practice view" className="rounded-[24px] border border-line bg-surface-soft p-5 md:p-6">
          <div className="flex items-center gap-2 text-blue">
            <ShieldCheck aria-hidden className="size-5" />
            <h3 className="text-[15px] font-bold text-navy-strong">Parent · A clear choice</h3>
          </div>
          <p className="mt-3 text-[13px] leading-6 text-ink-2">
            Your child can learn to save independently. When they want to explore
            an unfamiliar investment, you can discuss the idea together.
          </p>
          <div className="mt-5 rounded-[16px] border border-line-soft bg-surface p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-ink-3">Practice request</p>
            <p className="mt-1 text-[16px] font-bold text-navy-strong">
              Explore a diversified fund
            </p>
            <p className="mt-2 text-[12px] leading-5 text-ink-2">
              A fund can spread exposure across assets, but it still has risks and
              can lose value. Understand what it holds before making decisions.
            </p>
            <p className="mt-3 text-[12px] font-bold text-navy">
              {decision === "pending"
                ? "Waiting for your practice decision"
                : decision === "none"
                  ? "The Teen has not requested this yet"
                  : decision === "approved"
                    ? "Approved for practice discussion"
                    : "Declined for practice discussion"}
            </p>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              disabled={decision !== "pending"}
              onClick={() => setDecision("approved")}
              className="min-h-12 rounded-[14px] bg-navy-strong px-4 py-3 text-[13px] font-bold text-white disabled:opacity-50"
            >
              Approve practice discussion
            </button>
            <button
              type="button"
              disabled={decision !== "pending"}
              onClick={() => setDecision("declined")}
              className="min-h-12 rounded-[14px] border border-line bg-surface px-4 py-3 text-[13px] font-bold text-navy-strong disabled:opacity-50"
            >
              Decline practice discussion
            </button>
          </div>
          <p className="mt-3 text-[12px] leading-5 text-ink-3">
            This preview is not a guardian account, legal identity check, transaction
            approval or permission to invest.
          </p>
        </article>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[18px] bg-surface-soft p-4">
        <p aria-live="polite" role="status" className="max-w-[60ch] text-[13px] font-semibold leading-6 text-navy-strong">
          {status}
        </p>
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-10 items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-[12px] font-bold text-navy-strong"
        >
          <RotateCcw aria-hidden className="size-3.5" /> Reset practice
        </button>
      </div>
      <p className="mt-3 text-[11px] leading-5 text-ink-3">
        Illustrated story only. State is temporary in this browser tab. No real
        balance, interest, USDC, securities, blockchain write, or Parent/Teen
        credentials are involved.
      </p>
    </section>
  );
}
