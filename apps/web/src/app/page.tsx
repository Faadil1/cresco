import Link from "next/link";
import { Bell, CheckCircle2, KeyRound, ShieldCheck, Sprout, Zap } from "lucide-react";

import { Wordmark } from "@/components/shell";
import { ActionButton } from "@/components/ui/primitives";
import { HowItWorks, MandateRail, ProofStrip } from "./worlds-fair/desk/desk-ui";

// One CRESCO. Family and Delegated capital are two settings of the same
// workspace and the same Solana program; both enter the live workspace.
const PILLARS = [
  { icon: KeyRound, title: "Inside", body: "Act independently inside a standing mandate", tone: "text-blue bg-blue-soft" },
  { icon: ShieldCheck, title: "Boundary", body: "A clear refusal, and the exact limit that was crossed", tone: "text-orange-text bg-yellow-soft" },
  { icon: CheckCircle2, title: "Once", body: "Approve one exact exception; the mandate stays the same", tone: "text-green-strong bg-green-soft" },
  { icon: Sprout, title: "Evolve", body: "Limits change only by an explicit decision, which stales old requests", tone: "text-navy bg-lavender-soft" },
];

export default function WelcomePage() {
  return (
    <main id="main" className="min-h-dvh bg-bg">
      <div className="mx-auto max-w-[1180px] px-5 pb-16 pt-8 md:px-10">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <Wordmark size="md" />
          <nav aria-label="CRESCO product" className="flex flex-wrap gap-2 text-[13px] font-extrabold">
            <Link href="/worlds-fair/desk?case=family" className="rounded-full border border-line bg-white px-4 py-2 text-navy hover:border-blue/40">Family</Link>
            <Link href="/worlds-fair/desk?case=capital" className="rounded-full border border-line bg-white px-4 py-2 text-navy hover:border-blue/40">Delegated capital</Link>
            <Link href="/worlds-fair" className="rounded-full border border-line bg-white px-4 py-2 text-navy hover:border-blue/40">Technical proof</Link>
          </nav>
        </header>

        <section aria-labelledby="welcome-title" className="mt-12 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-green/30 bg-green-soft px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-green-strong">
              <span aria-hidden className="size-1.5 rounded-full bg-green" /> Live on Solana Devnet
            </p>
            <h1 id="welcome-title" className="mt-5 max-w-[16ch] text-[42px] font-black leading-[1.02] tracking-[-0.045em] text-navy-strong md:text-[60px]">
              Act alone inside the rules. <span className="text-blue">Ask once for the exception.</span>
            </h1>
            <p className="mt-5 max-w-[56ch] text-[17px] font-semibold leading-relaxed text-ink-2">
              CRESCO gives a teenager, a strategy or an AI agent standing authority inside a clear limit. Above it, they ask once. The responsible person approves that exact action, and the limit does not widen.
            </p>
            <p className="mt-3 max-w-[56ch] text-[13px] font-semibold text-ink-3">
              The limit is enforced by the CRESCO program on Solana. Devnet test assets only: no real funds, no mainnet custody.
            </p>
          </div>
          <section aria-label="How the line works" className="rounded-[26px] border border-line bg-white p-5 shadow-card md:p-7">
            <p className="text-[11px] font-black uppercase tracking-[0.12em] text-ink-3">How the line works · example</p>
            <div className="mt-6">
              <MandateRail limitMicroUsd={500_000} operator="Maya (16)" principal="her parent" points={[{ id: "a", amountMicroUsd: 300_000, kind: "alone" }, { id: "b", amountMicroUsd: 750_000, kind: "pending" }]} />
            </div>
            <ul className="mt-6 grid gap-2 text-[14px] font-bold">
              <li className="flex items-center justify-between rounded-[14px] bg-green-soft px-4 py-3 text-green-strong"><span>$0.30 · executed alone</span><Zap aria-hidden className="size-4" /></li>
              <li className="flex items-center justify-between rounded-[14px] bg-yellow-soft px-4 py-3 text-orange-text"><span>$0.75 · one exact request to her parent</span><Bell aria-hidden className="size-4" /></li>
              <li className="flex items-center justify-between rounded-[14px] bg-blue-soft px-4 py-3 text-blue"><span>Approved once · limit still $0.50</span><ShieldCheck aria-hidden className="size-4" /></li>
            </ul>
          </section>
        </section>

        <section aria-label="Choose your CRESCO setting" className="mt-12 grid gap-4 md:grid-cols-2">
          <section aria-labelledby="family-title" className="rounded-[26px] border border-line bg-white p-6 shadow-card md:p-7">
            <p className="text-[11px] font-black uppercase tracking-[0.11em] text-ink-3">CRESCO · Family</p>
            <h2 id="family-title" className="mt-2 text-[26px] font-black text-navy-strong">Freedom inside a family Key</h2>
            <p className="mt-2 text-[14px] font-semibold leading-relaxed text-ink-2">
              A teenager invests alone inside a parent-set allowance, and asks only when a boundary is reached. A second parent can watch and decide too.
            </p>
            <div className="mt-5">
              <ActionButton href="/worlds-fair/desk?case=family" arrow>Enter Family</ActionButton>
            </div>
            <p className="mt-4 text-[12px] font-semibold text-ink-3">
              Earlier Family app (separate sign-in, demo lane): <Link href="/start" className="text-blue underline underline-offset-4">Start</Link> · <Link href="/parent/sign-in" className="text-blue underline underline-offset-4">Parent sign-in</Link>
            </p>
          </section>
          <section aria-labelledby="capital-title" className="rounded-[26px] border border-line bg-white p-6 shadow-card md:p-7">
            <p className="text-[11px] font-black uppercase tracking-[0.11em] text-ink-3">CRESCO · Delegated capital</p>
            <h2 id="capital-title" className="mt-2 text-[26px] font-black text-navy-strong">Authority for strategies and agents</h2>
            <p className="mt-2 text-[14px] font-semibold leading-relaxed text-ink-2">
              A strategy or AI agent trades alone inside an allocator&apos;s mandate. The allocator approves one exact exception, with a durable decision and an execution receipt.
            </p>
            <div className="mt-5">
              <ActionButton href="/worlds-fair/desk?case=capital" arrow>Enter Delegated capital</ActionButton>
            </div>
            <p className="mt-4 text-[12px] font-semibold text-ink-3">AI agents can join as the operator through MCP, with no tool to approve or widen their own limit.</p>
          </section>
        </section>

        <section aria-labelledby="steps-title" className="mt-12">
          <h2 id="steps-title" className="text-[20px] font-black text-navy-strong">Three steps. Shown with Maya; identical for a strategy or an AI agent</h2>
          <div className="mt-5">
            <HowItWorks useCase="family" />
          </div>
        </section>

        <section className="mt-6">
          <ProofStrip />
        </section>

        <section aria-labelledby="rules-title" className="mt-12 border-t border-line-soft pt-8">
          <h2 id="rules-title" className="text-[20px] font-black text-navy-strong">The same rules in every CRESCO setting</h2>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PILLARS.map(({ icon: Icon, title, body, tone }) => (
              <li key={title} className="rounded-[20px] border border-line-soft bg-white p-4">
                <span className={`grid size-11 place-items-center rounded-[14px] ${tone}`}>
                  <Icon aria-hidden className="size-5" strokeWidth={2.4} />
                </span>
                <p className="mt-3 text-[16px] font-extrabold text-navy-strong">{title}</p>
                <p className="mt-1 text-[13px] font-semibold text-ink-2">{body}</p>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-[13px] font-bold text-ink-2">
            Want to inspect the enforcement evidence? <Link href="/worlds-fair" className="text-blue underline underline-offset-4">Open the technical proof lab</Link>.
          </p>
        </section>
      </div>
    </main>
  );
}
