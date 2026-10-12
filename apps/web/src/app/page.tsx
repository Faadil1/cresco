import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { SiteHeader } from "@/components/site-header";

// One CRESCO, two settings. The home page only answers "what is this, and
// where do I go": the explanation lives on /how-it-works, the evidence on
// /worlds-fair, and each setting has its own short path.
const btn = "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-[15px] font-medium transition-colors";

export default function WelcomePage() {
  return (
    <main id="main" className="flex min-h-dvh flex-col bg-bg">
      <div className="mx-auto flex w-full max-w-[1264px] flex-1 flex-col px-5 pb-10 pt-6 md:px-11">
        <SiteHeader current="/" />

        <section aria-labelledby="welcome-title" className="mt-14 md:mt-20">
          <p className="flex items-center gap-2.5 text-[12px] font-medium uppercase tracking-[0.14em] text-ink-3">
            <span aria-hidden className="size-1.5 rounded-full bg-blue" /> Live on Solana Devnet
          </p>
          <h1 id="welcome-title" className="mt-6 max-w-[14ch] font-display text-[52px] font-normal leading-[0.95] tracking-[-0.03em] text-navy-strong md:text-[88px]">
            Act alone inside the rules. <em className="text-blue">Ask once.</em>
          </h1>
          <p className="mt-6 max-w-[54ch] text-[18px] leading-relaxed text-ink-2">
            CRESCO sets a spending line. Under it, a teenager or an AI agent acts on its own. Above it, they ask once, and the answer covers that one action. The line never moves by itself.
          </p>
          <Link href="/how-it-works" className="mt-5 inline-flex items-center gap-1.5 text-[15px] font-medium text-blue hover:underline">
            See how it works in 3 steps <ArrowRight aria-hidden className="size-4" />
          </Link>
        </section>

        <section aria-label="Choose your CRESCO setting" className="mt-12 grid gap-4 md:mt-16 md:grid-cols-2">
          <section aria-labelledby="family-title" className="flex flex-col rounded-[28px] border border-line bg-surface p-7 md:p-8">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-3">For families</p>
            <h2 id="family-title" className="mt-3 font-display text-[38px] font-normal leading-[1.02] tracking-[-0.02em] text-navy-strong">Freedom inside a family Key</h2>
            <p className="mt-3 max-w-[42ch] text-[15px] leading-relaxed text-ink-2">
              Your teen invests on their own inside the allowance you set, and asks you only when they want to go further.
            </p>
            <div className="mt-auto flex flex-wrap gap-3 pt-7">
              <Link href="/start" className={`${btn} bg-navy-strong text-bg hover:bg-navy`}>Enter Family <ArrowRight aria-hidden className="size-4" /></Link>
              <Link href="/parent/sign-in" className={`${btn} border border-line text-navy-strong hover:bg-bg`}>Parent sign-in</Link>
            </div>
            <p className="mt-4 text-[12px] text-ink-3">
              Or try the <Link href="/worlds-fair/desk?case=family" className="text-navy underline underline-offset-4">Live family mandate on Solana</Link>, with your own wallet as guardian.
            </p>
          </section>

          <section aria-labelledby="capital-title" className="flex flex-col rounded-[28px] border border-line bg-surface p-7 md:p-8">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-3">For capital and AI agents</p>
            <h2 id="capital-title" className="mt-3 font-display text-[38px] font-normal leading-[1.02] tracking-[-0.02em] text-navy-strong">Authority for strategies and agents</h2>
            <p className="mt-3 max-w-[42ch] text-[15px] leading-relaxed text-ink-2">
              Your strategy or AI agent trades on its own inside your mandate. You approve one exact exception, and the mandate stays the same.
            </p>
            <div className="mt-auto flex flex-wrap gap-3 pt-7">
              <Link href="/worlds-fair/desk?case=capital" className={`${btn} bg-navy-strong text-bg hover:bg-navy`}>Enter Delegated capital <ArrowRight aria-hidden className="size-4" /></Link>
            </div>
            <p className="mt-4 text-[12px] text-ink-3">AI agents can join through MCP, with no way to approve or widen their own limit.</p>
          </section>
        </section>

        <footer className="mt-12 flex flex-wrap justify-between gap-3 border-t border-line pt-5 text-[12px] text-ink-3">
          <span>Solana Devnet only · no real funds or custody</span>
          <Link href="/worlds-fair" className="hover:text-navy-strong">Inspect the enforcement evidence →</Link>
        </footer>
      </div>
    </main>
  );
}
