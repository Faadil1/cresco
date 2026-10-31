import Link from "next/link";
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
            Open demo · fictional credits
          </span>
        </header>

        <section
          aria-labelledby="family-hero-title"
          className="mt-6 grid gap-7 md:mt-16 md:gap-9 md:grid-cols-[1.05fr_0.95fr] md:items-center"
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-green-strong md:text-[12px] md:tracking-[0.16em]">
              Cresco Family · Learn through your own decisions
            </p>
            <h1
              id="family-hero-title"
              className="mt-3 max-w-[15ch] font-display text-[clamp(38px,5.8vw,80px)] leading-[0.98] text-navy-strong"
            >
              Your child takes the lead. <em className="text-green-strong">You set the boundaries.</em>
            </h1>
            <p className="mt-4 max-w-[55ch] text-[16px] leading-7 text-ink-2 md:mt-6">
              A teen practices investing with pretend credits. Inside a limit
              the parent sets, the teen decides alone. Above it, the parent says yes or no.
            </p>

            <div className="mt-5 flex flex-wrap gap-3 md:mt-7">
              <Link
                href="/try"
                className="inline-flex min-h-12 items-center gap-3 rounded-full bg-green-strong px-6 text-[14px] font-bold text-white hover:bg-green"
              >
                Try Cresco - no sign-in <ArrowRight aria-hidden className="size-4" />
              </Link>
              <a
                href="#family-trust"
                className="inline-flex min-h-12 items-center gap-3 rounded-full border border-green/40 bg-surface px-6 text-[14px] font-bold text-navy-strong hover:bg-green-soft"
              >
                What parents should know
              </a>
            </div>
            <ol data-testid="family-three-steps" className="mt-6 grid max-w-[58ch] gap-2 text-[13px] leading-5 text-navy-strong">
              {[
                "The teen saves pretend credits toward a goal and researches six invented companies.",
                "Inside the Key limit, the teen makes the practice choice alone.",
                "Above the limit, it is blocked. A simulated parent approves it once or declines it.",
              ].map((text, index) => (
                <li key={text} className="flex items-start gap-3">
                  <span aria-hidden className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-green-soft text-[12px] font-bold text-green-strong">{index + 1}</span>
                  <span>{text}</span>
                </li>
              ))}
            </ol>
            <p className="mt-4 max-w-[55ch] text-[13px] leading-6 text-ink-2">
              Explore Cresco right now, without signing in, entering a code,
              or connecting a wallet. This is a fictional learning exercise,
              not a real financial account or investment service.
            </p>
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
              An introduction to the full Parent and Child workspaces, available under Try Cresco.
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
                Learn how the Key works, then review what the young person chose.
                Approve or decline the <strong>exact fictional practice request</strong>,
                or update the standing Key explicitly. No real investment occurs.
              </p>
              <p className="mt-3 text-[11px] font-bold text-green-strong">Parent learning path · 5 short lessons</p>
            </div>
            <div className="mt-4 flex items-start gap-2 rounded-[15px] bg-yellow-soft p-3">
              <ShieldCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-orange-text" />
              <p className="text-[11px] leading-5 text-navy">
                Illustration only. The full demo on Try Cresco is a single-browser simulation.
                It does not prove separate accounts, legal guardianship, custody or
                authority over real funds.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[22px] border border-green/30 bg-green-soft p-5 md:p-6" aria-label="Open public learning demo">
          <h2 className="font-display text-[27px] text-navy-strong">Curious? Try it right away.</h2>
          <p className="mt-2 max-w-[72ch] text-[13px] leading-6 text-ink-2">
            No registration, invitation or access code. Play both roles in one browser,
            using only pretend credits. Your choices are temporary and are not sent
            to a financial service. Each visitor starts with a fresh simulation.
          </p>
          <Link href="/try"
            className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-full bg-green-strong px-5 py-3 text-[13px] font-bold text-white">
            Start free demo <ArrowRight aria-hidden className="size-4"/>
          </Link>
        </section>
        <FamilyParentTrustCenter />
      </div>
    </main>
  );
}
