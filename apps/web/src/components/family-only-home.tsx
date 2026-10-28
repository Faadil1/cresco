import Link from "next/link";
import { ArrowRight, KeyRound, ShieldCheck, Users, Wallet } from "lucide-react";
import { Wordmark } from "@/components/shell";

const steps = [
  { title: "Parent sets the rules", text: "Create a private Family workspace and receive a separate one-time wallet setup code." },
  { title: "Each person gets a link", text: "Share separate Teen and second-parent links. A role link is not proof of real identity." },
  { title: "Protect the Parent account", text: "Secure the Parent recovery wallet with your creator code and an exact signed message." },
];

export function FamilyOnlyHome() {
  return (
    <main id="main" className="cresco-app-workspace min-h-dvh">
      <div className="mx-auto max-w-[1120px] px-5 pb-20 pt-7 md:px-10">
        <header className="flex items-center justify-between gap-4">
          <Wordmark size="md" />
          <span className="rounded-full border border-green/40 bg-green-soft px-4 py-2 text-[12px] font-bold text-green-strong">Family · Separate early access</span>
        </header>
        <section className="mt-16 grid gap-10 md:grid-cols-[1.05fr_0.95fr] md:items-center">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-green-strong">Cresco Family</p>
            <h1 className="mt-5 max-w-[12ch] font-display text-[clamp(54px,6.3vw,88px)] leading-[0.97] text-navy-strong">
              Room to learn. <em className="text-green-strong">Rules you control.</em>
            </h1>
            <p className="mt-7 max-w-[55ch] text-[16px] leading-7 text-ink-2">
              A dedicated space for a Parent, a Teen and a second parent to understand delegated financial decisions. This early-access environment is separate from the Colosseum submission and uses no real money.
            </p>
            <Link href="/worlds-fair/desk?case=family" className="mt-8 inline-flex min-h-12 items-center gap-3 rounded-full bg-green-strong px-6 text-[14px] font-bold text-white hover:bg-green">
              Open Family desk <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="rounded-[28px] border border-green/20 bg-surface p-7 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="rounded-[16px] bg-green-soft p-3 text-green-strong"><Users className="size-6" /></div>
              <div><p className="text-[13px] font-bold text-navy">One family, separate roles</p><p className="text-[12px] text-ink-2">Role security first</p></div>
            </div>
            <div className="mt-7 grid gap-5">
              {steps.map((step, i) => (
                <div key={step.title} className="flex gap-4">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-green-soft text-[13px] font-bold text-green-strong">{i + 1}</span>
                  <div><p className="text-[15px] font-bold text-navy-strong">{step.title}</p><p className="mt-1 text-[13px] leading-6 text-ink-2">{step.text}</p></div>
                </div>
              ))}
            </div>
            <div className="mt-7 flex gap-3 rounded-[18px] bg-yellow-soft p-4">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-orange-text" />
              <p className="text-[12px] leading-5 text-navy">Setup-only preview: Devnet trading and financial actions are disabled until separately reviewed and authorized. Not a custody, brokerage or verified-guardian service.</p>
            </div>
            <div className="mt-4 flex items-center gap-2 text-[11px] font-semibold text-ink-3"><KeyRound className="size-4" /><Wallet className="size-4" /> No wallet transaction required to start setup.</div>
          </div>
        </section>
      </div>
    </main>
  );
}
