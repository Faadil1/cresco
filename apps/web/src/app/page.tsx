import Link from "next/link";

import { Wordmark } from "@/components/shell";
import { HowItWorks, MandateRail, ProofStrip } from "./worlds-fair/desk/desk-ui";

// One CRESCO. Family and Delegated capital are two settings of the same
// workspace and the same Solana program; both enter the live workspace.
const RULES = [
  { title: "Inside", body: "Act independently inside a standing mandate." },
  { title: "Boundary", body: "A clear refusal, and the exact limit that was crossed." },
  { title: "Once", body: "Approve one exact exception. The mandate stays the same." },
  { title: "Evolve", body: "Limits change only by an explicit decision, which stales old requests." },
];

const btn = "inline-flex min-h-12 items-center justify-center rounded-full px-6 text-[15px] font-medium transition-colors";

export default function WelcomePage() {
  return (
    <main id="main" className="min-h-dvh bg-bg">
      <div className="mx-auto max-w-[1264px] px-5 pb-20 pt-6 md:px-11">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Wordmark size="md" />
          <nav aria-label="CRESCO product" className="flex flex-wrap items-center gap-1 text-[14px]">
            <Link href="/start" className="rounded-full px-3.5 py-2 text-navy-strong hover:bg-surface">Family</Link>
            <Link href="/worlds-fair/desk?case=capital" className="rounded-full px-3.5 py-2 text-ink-2 hover:bg-surface hover:text-navy-strong">Delegated capital</Link>
            <Link href="/worlds-fair" className="rounded-full px-3.5 py-2 text-ink-2 hover:bg-surface hover:text-navy-strong">Technical proof</Link>
          </nav>
        </header>

        <section aria-labelledby="welcome-title" className="mt-14 grid gap-12 lg:mt-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-16">
          <div>
            <p className="flex items-center gap-2.5 text-[12px] font-medium uppercase tracking-[0.14em] text-ink-3">
              <span aria-hidden className="size-1.5 rounded-full bg-blue" /> Live on Solana Devnet · wallet guardian verified
            </p>
            <h1 id="welcome-title" className="mt-7 max-w-[13ch] font-display text-[56px] font-normal leading-[0.94] tracking-[-0.03em] text-navy-strong md:text-[96px] lg:text-[108px]">
              Act alone inside the rules. <em className="text-blue">Ask once.</em>
            </h1>
            <p className="mt-7 max-w-[46ch] text-[18px] leading-relaxed text-ink-2">
              CRESCO gives a teenager, a strategy or an AI agent standing authority inside a clear limit. Above it, they ask once. The answer covers that exact action, and the limit never moves.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="/start" className={`${btn} bg-navy-strong text-bg hover:bg-navy`}>Try Family</Link>
              <Link href="/worlds-fair/desk?case=capital" className={`${btn} border border-line text-navy-strong hover:bg-surface`}>Try Delegated capital</Link>
            </div>
          </div>

          <section aria-label="Example request" className="rounded-[28px] border border-line bg-surface p-6 shadow-card md:p-7">
            <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.14em]">
              <span className="text-ink-3">Request · one use</span>
              <span className="text-blue">Waiting for her parent</span>
            </div>
            <div className="mt-6 flex items-center gap-3.5">
              <span aria-hidden className="grid size-11 place-items-center rounded-full bg-blue-soft font-display text-[22px] text-navy-strong">M</span>
              <div>
                <p className="text-[16px] font-medium text-navy-strong">Maya asks for one exact trade</p>
                <p className="text-[13px] text-ink-3">devUSDC to devUSDT · expires in 30 min</p>
              </div>
            </div>
            <p className="mt-6 font-display text-[80px] leading-none tracking-[-0.03em] text-navy-strong">
              $0.75<span className="ml-3 font-sans text-[16px] tracking-normal text-ink-3">above her $0.50 line</span>
            </p>
            <dl className="mt-6 grid grid-cols-2 border-t border-line text-[13px]">
              <div className="py-3.5 text-ink-3"><dt>Covers</dt><dd className="mt-0.5 text-[15px] font-medium text-navy-strong">This trade, once</dd></div>
              <div className="border-l border-line py-3.5 pl-4 text-ink-3"><dt>After approval</dt><dd className="mt-0.5 text-[15px] font-medium text-navy-strong">Limit stays $0.50</dd></div>
            </dl>
            <div className="mt-4 flex gap-2.5" aria-hidden>
              <span className="flex-1 rounded-[16px] bg-blue py-3.5 text-center text-[15px] font-medium text-white">Approve with my wallet</span>
              <span className="rounded-[16px] border border-line px-5 py-3.5 text-[15px] text-ink-3">Refuse</span>
            </div>
            <p className="mt-3.5 font-mono text-[11px] text-ink-3">signed by the parent&apos;s wallet on-chain, never by the server</p>
          </section>
        </section>

        <section aria-label="How the line works" className="mt-16 border-t border-line pt-6 lg:mt-24">
          <MandateRail
            limitMicroUsd={500_000}
            operator="Maya"
            principal="her parent"
            points={[
              { id: "a", amountMicroUsd: 240_000, kind: "alone" },
              { id: "b", amountMicroUsd: 300_000, kind: "alone" },
              { id: "c", amountMicroUsd: 750_000, kind: "approved" },
              { id: "d", amountMicroUsd: 900_000, kind: "pending" },
            ]}
          />
          <p className="mt-2 text-[13px] text-ink-3">The line is enforced by the CRESCO program on Solana, not by this page.</p>
        </section>

        <section aria-label="Choose your CRESCO setting" className="mt-20 grid gap-4 md:grid-cols-2">
          <section aria-labelledby="family-title" className="rounded-[28px] border border-line bg-surface p-7 md:p-8">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-3">CRESCO · Family</p>
            <h2 id="family-title" className="mt-3 font-display text-[40px] font-normal leading-[1.02] tracking-[-0.02em] text-navy-strong">Freedom inside a family Key</h2>
            <p className="mt-3 max-w-[44ch] text-[15px] leading-relaxed text-ink-2">
              A teenager invests alone inside a parent-set allowance and asks only when a boundary is reached. A second parent can watch and decide too.
            </p>
            <p className="mt-3 text-[13px] text-ink-3">Your Key, Learn, Explore, Portfolio and Profile for the teen; limits and requests for the parent.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/start" className={`${btn} bg-navy-strong text-bg hover:bg-navy`}>Enter Family</Link>
              <Link href="/parent/sign-in" className={`${btn} border border-line text-navy-strong hover:bg-bg`}>Parent sign-in</Link>
            </div>
            <p className="mt-5 text-[12px] text-ink-3">
              <Link href="/worlds-fair/desk?case=family" className="text-navy underline underline-offset-4">Live family mandate on Solana</Link>, with the parent&apos;s own wallet as guardian.
            </p>
          </section>
          <section aria-labelledby="capital-title" className="rounded-[28px] border border-line bg-surface p-7 md:p-8">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-3">CRESCO · Delegated capital</p>
            <h2 id="capital-title" className="mt-3 font-display text-[40px] font-normal leading-[1.02] tracking-[-0.02em] text-navy-strong">Authority for strategies and agents</h2>
            <p className="mt-3 max-w-[44ch] text-[15px] leading-relaxed text-ink-2">
              A strategy or AI agent trades alone inside an allocator&apos;s mandate. The allocator approves one exact exception, with a durable decision and an execution receipt.
            </p>
            <Link href="/worlds-fair/desk?case=capital" className={`${btn} mt-7 bg-navy-strong text-bg hover:bg-navy`}>Enter Delegated capital</Link>
            <p className="mt-5 text-[12px] text-ink-3">AI agents can join as the operator through MCP, with no tool to approve or widen their own limit.</p>
          </section>
        </section>

        <section aria-labelledby="steps-title" className="mt-20">
          <h2 id="steps-title" className="mb-6 text-[12px] font-medium uppercase tracking-[0.14em] text-ink-3">Three steps · shown with Maya, identical for a strategy or an AI agent</h2>
          <HowItWorks useCase="family" />
        </section>

        <section className="mt-12">
          <ProofStrip />
        </section>

        <section aria-labelledby="rules-title" className="mt-20">
          <h2 id="rules-title" className="font-display text-[40px] font-normal tracking-[-0.02em] text-navy-strong">The same rules in every CRESCO setting</h2>
          <ul className="mt-6 grid border-t border-line sm:grid-cols-2 lg:grid-cols-4">
            {RULES.map(({ title, body }, i) => (
              <li key={title} className={`border-b border-line py-5 sm:pr-6 lg:border-b-0 ${i > 0 ? "lg:border-l lg:pl-6" : ""}`}>
                <p className="text-[16px] font-semibold text-navy-strong">{title}</p>
                <p className="mt-1.5 text-[14px] leading-relaxed text-ink-2">{body}</p>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-[14px] text-ink-2">
            Want to inspect the enforcement evidence? <Link href="/worlds-fair" className="text-blue underline underline-offset-4">Open the technical proof lab</Link>.
          </p>
        </section>

        <footer className="mt-16 flex flex-wrap justify-between gap-3 border-t border-line pt-5 font-mono text-[11px] uppercase tracking-[0.06em] text-ink-3">
          <span>Solana Devnet only · no mainnet funds or custody</span>
          <span>Program ABjE…SSfk</span>
        </footer>
      </div>
    </main>
  );
}
