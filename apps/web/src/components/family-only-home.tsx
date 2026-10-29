import Link from "next/link";
import { FamilyAgencyPreview } from "@/components/family-agency-preview";
import { FamilyParentTrustCenter } from "@/components/family-parent-trust-center";
import { ArrowRight, HeartHandshake, ShieldCheck, Sprout } from "lucide-react";
import { Wordmark } from "@/components/shell";

export function FamilyOnlyHome() {
  return (
    <main id="main" className="cresco-app-workspace min-h-dvh">
      <div className="mx-auto max-w-[1120px] px-5 pb-20 pt-7 md:px-10">
        <header className="flex items-center justify-between gap-4">
          <Wordmark size="md" />
          <span className="rounded-full border border-green/40 bg-green-soft px-4 py-2 text-[12px] font-bold text-green-strong">
            Family practice prototype
          </span>
        </header>

        <section
          aria-labelledby="family-hero-title"
          className="mt-12 grid gap-9 md:mt-16 md:grid-cols-[1.05fr_0.95fr] md:items-center"
        >
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-green-strong">
              Cresco Family · Learn through your own decisions
            </p>
            <h1
              id="family-hero-title"
              className="mt-5 max-w-[15ch] font-display text-[clamp(46px,5.8vw,80px)] leading-[0.98] text-navy-strong"
            >
              Your child takes the lead. <em className="text-green-strong">You set the boundaries.</em>
            </h1>
            <p className="mt-6 max-w-[55ch] text-[16px] leading-7 text-ink-2">
              Young people see their practice balance, make choices and ask to
              explore new ideas. Parents can understand those choices and decide
              when to say yes or no. Both learn together.
            </p>
            <p className="mt-3 max-w-[55ch] text-[13px] leading-6 text-ink-2">
              Today this is a no-money learning illustration, not a real family
              account, savings product or service for buying stocks or crypto.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#family-agency-preview-title"
                className="inline-flex min-h-12 items-center gap-3 rounded-full bg-green-strong px-6 text-[14px] font-bold text-white hover:bg-green"
              >
                Try the family practice story <ArrowRight aria-hidden className="size-4" />
              </a>
              <a
                href="#family-trust"
                className="inline-flex min-h-12 items-center gap-3 rounded-full border border-green/40 bg-surface px-6 text-[14px] font-bold text-navy-strong hover:bg-green-soft"
              >
                What parents should know
              </a>
            </div>
          </div>

          <div
            aria-label="Illustrative teen and parent experience"
            data-testid="family-hero-role-comparison"
            className="rounded-[28px] border border-green/20 bg-surface p-5 shadow-soft md:p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-[27px] leading-tight text-navy-strong">
                Two views. Shared understanding.
              </h2>
              <span className="rounded-full bg-green-soft px-3 py-1.5 text-[11px] font-bold text-green-strong">
                Illustrated · No real money
              </span>
            </div>
            <p className="mt-2 text-[12px] leading-5 text-ink-2">
              A simple view of what you can try in the interactive practice section below.
            </p>

            <div className="mt-5 rounded-[21px] border border-green/20 bg-green-soft/40 p-4">
              <div className="flex items-center gap-2 text-green-strong">
                <Sprout aria-hidden className="size-5" />
                <h3 className="text-[15px] font-bold">Teen view · I make a choice</h3>
              </div>
              <p className="mt-2 text-[12px] text-ink-2">Imaginary credits to learn with</p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-surface p-3">
                  <p className="text-[11px] font-semibold text-ink-2">Available</p>
                  <p className="mt-1 font-display text-[29px] text-navy-strong">80</p>
                </div>
                <div className="rounded-xl bg-surface p-3">
                  <p className="text-[11px] font-semibold text-ink-2">Set aside</p>
                  <p className="mt-1 font-display text-[29px] text-navy-strong">20</p>
                </div>
              </div>
              <p className="mt-3 rounded-xl border border-green/20 bg-surface p-3 text-[12px] leading-5 text-navy-strong">
                My next question: can I learn about diversified funds?
              </p>
            </div>

            <div className="mt-3 rounded-[21px] border border-line-soft bg-surface-soft p-4">
              <div className="flex items-center gap-2 text-navy-strong">
                <HeartHandshake aria-hidden className="size-5" />
                <h3 className="text-[15px] font-bold">Parent view · I guide the boundaries</h3>
              </div>
              <p className="mt-2 text-[12px] leading-5 text-ink-2">
                See what the young person chose and understand what a new request
                means. Approve or decline the <strong>practice discussion</strong>,
                without buying an asset.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-green-soft px-3 py-2 text-[11px] font-bold text-green-strong">Discuss together</span>
                <span className="rounded-full border border-line bg-surface px-3 py-2 text-[11px] font-bold text-navy-strong">Not yet</span>
              </div>
            </div>
            <div className="mt-4 flex items-start gap-2 rounded-[15px] bg-yellow-soft p-3">
              <ShieldCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-orange-text" />
              <p className="text-[11px] leading-5 text-navy">
                Illustration only. The actual demo below is a single-browser simulation.
                It does not prove separate accounts, legal guardianship, custody or
                authority over real funds.
              </p>
            </div>
          </div>
        </section>

        <div className="mt-6 text-[12px] leading-6 text-ink-2">
          Technical developers can inspect the{" "}
          <Link
            href="/worlds-fair/desk?case=family"
            className="font-bold text-green-strong underline underline-offset-4"
          >
            separate Family setup preview
          </Link>
          . Solana Devnet financial actions remain disabled in the standalone
          Family release candidate pending independent review.
        </div>

        <FamilyParentTrustCenter />
        <FamilyAgencyPreview />
      </div>
    </main>
  );
}
