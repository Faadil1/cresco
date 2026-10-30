import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { FamilyAgencyPreview } from "@/components/family-agency-preview";
import { Wordmark } from "@/components/shell";

export const metadata: Metadata = {
  title: "Try Cresco Family - free learning demo",
  description: "Try a fictional Teen and Parent decision in one browser. No account, no invitation, no wallet, no money.",
};

export default function TryFamilyPage() {
  // Completely separate from the historical Colosseum deployment.
  if (process.env.NEXT_PUBLIC_CRESCO_FAMILY_ONLY !== "1") notFound();
  return (
    <main id="main" className="cresco-app-workspace min-h-dvh">
      <div className="mx-auto max-w-[1120px] px-5 pb-20 pt-7 md:px-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Wordmark size="md"/>
          <Link href="/" className="inline-flex items-center gap-2 text-[13px] font-bold text-green-strong underline underline-offset-4">
            <ArrowLeft aria-hidden className="size-4"/> About Cresco Family
          </Link>
        </header>
        <section className="mt-10 md:mt-14" aria-label="Public demonstration introduction">
          <span className="inline-flex items-center gap-2 rounded-full border border-green/30 bg-green-soft px-4 py-2 text-[12px] font-bold text-green-strong">
            <ShieldCheck aria-hidden className="size-4"/> Free public demo · no sign-in
          </span>
          <h1 className="mt-5 max-w-[21ch] font-display text-[clamp(42px,5.5vw,72px)] leading-tight text-navy-strong">
            Experience Cresco in one minute.
          </h1>
          <p className="mt-3 max-w-[65ch] text-[15px] leading-7 text-ink-2">
            No invitation. No Parent or Teen codes. No wallet. Try both fictional
            roles on this page, then start again whenever you want.
          </p>
          <div className="mt-6 grid gap-3 md:grid-cols-3" aria-label="Three simple practice steps">
            {[
              {number: "01", title: "Teen saves", detail: "Set aside 20 of 100 pretend credits."},
              {number: "02", title: "Teen asks", detail: "Ask to learn about diversified funds."},
              {number: "03", title: "Parent responds", detail: "Approve or decline the discussion, not an investment."},
            ].map((step) => (
              <div key={step.number} className="rounded-[18px] border border-line bg-surface p-4">
                <span className="text-[12px] font-bold text-green-strong">{step.number}</span>
                <h2 className="mt-1 text-[15px] font-bold text-navy-strong">{step.title}</h2>
                <p className="mt-1 text-[12px] leading-5 text-ink-2">{step.detail}</p>
              </div>
            ))}
          </div>
        </section>
        <FamilyAgencyPreview/>
        <p className="mt-7 rounded-[18px] border border-line bg-surface-soft p-4 text-[12px] leading-6 text-ink-2">
          This is a browser-only learning simulation. It does not save progress,
          connect two devices, collect your identity, or perform any financial
          transaction. Closing or refreshing the tab resets the practice.
          No real child accounts or financial services are available.
        </p>
        <Link href="/" className="mt-6 inline-flex min-h-11 items-center gap-2 text-[13px] font-bold text-green-strong underline underline-offset-4">
          <ArrowLeft aria-hidden className="size-4"/> Back to Cresco Family
        </Link>
      </div>
    </main>
  );
}
