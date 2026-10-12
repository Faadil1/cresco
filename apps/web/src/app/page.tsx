import { CheckCircle2, KeyRound, ShieldCheck, Sprout } from "lucide-react";
import { Wordmark } from "@/components/shell";
import { ActionButton } from "@/components/ui/primitives";

const PILLARS = [
  { icon: KeyRound, title: "Inside", body: "Act independently inside a standing mandate", tone: "text-blue bg-blue-soft" },
  { icon: ShieldCheck, title: "Boundary", body: "A clear refusal when a limit is crossed", tone: "text-orange-text bg-[#fff0e6]" },
  { icon: CheckCircle2, title: "Once", body: "Approve one exact exception; keep the mandate", tone: "text-green-strong bg-green-soft" },
  { icon: Sprout, title: "Evolve", body: "Change standing limits only by explicit decision", tone: "text-lavender bg-lavender-soft" },
];

export default function WelcomePage() {
  return (
    <main id="main" className="min-h-dvh bg-bg">
      <div className="mx-auto max-w-[1180px] px-5 pb-16 pt-8 md:px-10">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <Wordmark size="md" />
          <nav aria-label="CRESCO product" className="flex flex-wrap gap-2 text-[13px] font-extrabold">
            <a href="/start" className="rounded-full border border-line bg-white px-4 py-2 text-navy hover:border-blue/40">Family</a>
            <a href="/worlds-fair/desk" className="rounded-full border border-line bg-white px-4 py-2 text-navy hover:border-blue/40">Delegated capital</a>
            <a href="/worlds-fair" className="rounded-full border border-line bg-white px-4 py-2 text-navy hover:border-blue/40">Live proof</a>
          </nav>
        </header>

        <section aria-labelledby="welcome-title" className="mt-12 grid gap-8 lg:grid-cols-[1fr_0.92fr] lg:items-center lg:gap-14">
          <div>
            <p className="text-[12px] font-black uppercase tracking-[0.13em] text-blue">One CRESCO · Two real-world settings</p>
            <h1 id="welcome-title" className="mt-4 max-w-[16ch] text-[42px] font-black leading-[1.04] tracking-[-0.035em] text-navy-strong md:text-[60px]">
              Act alone inside the rules. <span className="text-green">Ask once at the boundary.</span>
            </h1>
            <p className="mt-5 max-w-[57ch] text-[17px] font-semibold leading-relaxed text-ink-2">
              CRESCO gives a person or an automated strategy standing authority inside clear limits. The responsible person can approve one exact exception without silently widening those limits.
            </p>
            <p className="mt-3 max-w-[57ch] text-[13px] font-semibold text-ink-3">
              A shared Solana authority mechanism powers Family and Delegated capital. On-chain execution uses Devnet demo assets, not real funds or mainnet custody.
            </p>
          </div>

          <div aria-label="Choose your CRESCO experience" className="grid gap-4">
            <section aria-labelledby="family-title" className="rounded-[26px] border border-line bg-white p-5 shadow-card md:p-6">
              <p className="text-[11px] font-black uppercase tracking-[0.11em] text-ink-3">CRESCO · Family</p>
              <h2 id="family-title" className="mt-2 text-[25px] font-black text-navy-strong">Freedom inside a family Key</h2>
              <p className="mt-2 text-[14px] font-semibold leading-relaxed text-ink-2">
                A teenager acts inside a parent-set allowance, and asks only when a boundary is reached.
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <ActionButton href="/start" arrow>Enter Family</ActionButton>
                <ActionButton href="/parent/sign-in" variant="secondary">Parent sign-in</ActionButton>
              </div>
            </section>

            <section aria-labelledby="capital-title" className="rounded-[26px] border border-line bg-white p-5 shadow-card md:p-6">
              <p className="text-[11px] font-black uppercase tracking-[0.11em] text-ink-3">CRESCO · Delegated capital</p>
              <h2 id="capital-title" className="mt-2 text-[25px] font-black text-navy-strong">Authority for strategies and agents</h2>
              <p className="mt-2 text-[14px] font-semibold leading-relaxed text-ink-2">
                An operator works within an allocator&apos;s mandate. A principal can approve one exact exception, with a durable decision and execution receipt.
              </p>
              <div className="mt-4">
                <ActionButton href="/worlds-fair/desk" arrow>Enter Delegated capital</ActionButton>
              </div>
              <p className="mt-3 text-[12px] font-semibold text-ink-3">The shared workspace also offers a Family presentation. Roles and permissions remain workspace-scoped.</p>
            </section>
          </div>
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
            Want to inspect the enforcement evidence? <a href="/worlds-fair" className="text-blue underline underline-offset-4">Open the technical proof lab</a>.
          </p>
        </section>
      </div>
    </main>
  );
}
