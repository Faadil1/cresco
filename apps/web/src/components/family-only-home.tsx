"use client";

/**
 * Public Family landing. A client component on purpose: lucide icons create a
 * React context, which is not available while rendering server components
 * (the cause of the 2026-11-16 HTTP 500 on "/").
 */
import Link from "next/link";
import { ArrowRight, BookOpen, Building2, Compass, HeartHandshake, KeyRound, ShieldCheck, Target } from "lucide-react";
import { FamilyParentTrustCenter } from "@/components/family-parent-trust-center";
import { Wordmark } from "@/components/shell";
import { FamilyStoryScene } from "@/components/illustrations/family-story";

const LOOP = [
  { icon: Target, title: "Pick a goal", body: "A bike, a game setup or a trip. Everything that follows is about that goal." },
  { icon: BookOpen, title: "Learn one idea", body: "Short lessons with a real decision inside, not just reading." },
  { icon: Compass, title: "Meet a company", body: "Invented people with real-life dilemmas, then four real businesses." },
  { icon: KeyRound, title: "Decide inside the Key", body: "Small choices alone. Bigger ones go to the Parent, who can say yes once." },
  { icon: HeartHandshake, title: "Talk it through", body: "Each of you shares a view about what happened and what to try next." },
];

export function FamilyOnlyHome() {
  return (
    <main id="main" className="cresco-app-workspace cresco-family-app min-h-dvh">
      <div className="mx-auto max-w-[1120px] px-5 pb-20 pt-5 md:px-10 md:pt-7">
        <header className="flex items-center justify-between gap-4">
          <Wordmark size="md" />
          <span className="rounded-full border border-yellow/50 bg-yellow-soft px-3 py-1.5 text-[12px] font-bold text-orange-text md:px-4 md:text-[13px]">
            Free · pretend money only
          </span>
        </header>

        <section aria-labelledby="family-hero-title" className="mt-6 grid gap-6 md:mt-14 md:grid-cols-[1.05fr_0.95fr] md:items-center md:gap-10">
          <div>
            <p className="text-[12px] font-extrabold uppercase tracking-[0.1em] text-green-strong">Cresco Family · learn money by deciding</p>
            <h1 id="family-hero-title" className="mt-3 max-w-[15ch] font-display text-[clamp(36px,5.6vw,72px)] leading-[1.02] text-navy-strong">
              Your child takes the lead. <span className="text-green-strong">You set the boundaries.</span>
            </h1>
            <p className="mt-4 max-w-[52ch] text-[16px] leading-7 text-ink-2">
              Your child learns about money by making real decisions with pretend credits. Inside a limit you set,
              they decide alone. Above it, they ask you.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link href="/try" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-family-action px-6 text-[15px] font-bold text-white hover:bg-family-action-hover">
                Try Cresco - no sign-in <ArrowRight aria-hidden className="size-4" />
              </Link>
              <a href="#family-trust" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-line bg-surface px-6 text-[15px] font-bold text-navy-strong hover:bg-family-action-soft">
                What parents should know
              </a>
            </div>
            <p className="mt-3 text-[13px] leading-6 text-ink-2">
              No account, code or wallet. This is a fictional learning exercise, not a real financial account or investment service.
            </p>
          </div>
          <div className="overflow-hidden rounded-[28px] border border-green/20 bg-surface shadow-soft">
            <FamilyStoryScene className="block h-auto max-h-[30vh] w-full md:max-h-none" title="An illustrated parent and teenager exploring Cresco together at home. Fictional practice only."/>
          </div>
        </section>

        <section aria-labelledby="loop-title" className="mt-12 md:mt-16">
          <h2 id="loop-title" className="font-display text-[26px] text-navy-strong md:text-[32px]">One loop, repeated</h2>
          <p className="mt-1 max-w-[60ch] text-[15px] leading-6 text-ink-2">Every round takes a few minutes. The app always shows where you are and the one next step.</p>
          <ol data-testid="family-three-steps" className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {LOOP.map(({ icon: Icon, title, body }, index) => (
              <li key={title} className="rounded-[20px] border border-line-soft bg-surface p-4">
                <span className="flex items-center gap-2 text-[13px] font-extrabold text-family-action">
                  <span aria-hidden className="grid size-7 place-items-center rounded-full bg-family-action-soft">{index + 1}</span>
                  <Icon aria-hidden className="size-4"/>
                </span>
                <h3 className="mt-2 text-[16px] font-extrabold text-navy-strong">{title}</h3>
                <p className="mt-1 text-[14px] leading-6 text-ink-2">{body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="worlds-title" className="mt-12 grid gap-3 md:grid-cols-2" data-testid="family-two-worlds">
          <h2 id="worlds-title" className="sr-only">Pretend and real, never mixed</h2>
          <div className="rounded-[20px] border border-yellow/50 bg-yellow-soft p-5">
            <p className="text-[12px] font-extrabold uppercase tracking-[0.08em] text-orange-text">Pretend</p>
            <h3 className="mt-1 text-[19px] font-extrabold text-navy-strong">100 pretend credits, six invented companies</h3>
            <p className="mt-1 text-[14px] leading-6 text-navy">This is where the Key applies: small choices alone, bigger ones go to the Parent, who can approve exactly once.</p>
          </div>
          <div className="rounded-[20px] border border-blue/30 bg-blue-soft p-5">
            <p className="flex items-center gap-1.5 text-[12px] font-extrabold uppercase tracking-[0.08em] text-blue-strong"><Building2 aria-hidden className="size-4"/>Real company · paper $</p>
            <h3 className="mt-1 text-[19px] font-extrabold text-navy-strong">Apple, Microsoft, Costco, Shopify</h3>
            <p className="mt-1 text-[14px] leading-6 text-navy">Official, dated SEC figures and an optional chart, then a paper trade with $1,000 of imaginary dollars. No orders, no accounts.</p>
          </div>
        </section>

        <p className="mt-6 flex items-start gap-2 rounded-[16px] border border-line-soft bg-surface p-4 text-[13px] leading-6 text-ink-2">
          <ShieldCheck aria-hidden className="mt-1 size-4 shrink-0 text-green-strong" />
          <span>The demo is a single-browser simulation: one person can play both roles. It does not prove separate accounts, legal guardianship, custody or authority over real funds. Nothing is saved after you close the tab.</span>
        </p>
        <FamilyParentTrustCenter />
      </div>
    </main>
  );
}
