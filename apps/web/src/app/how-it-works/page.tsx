import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { HowItWorksStepper } from "./how-it-works";

export const metadata = { title: "How CRESCO works" };

export default function HowItWorksPage() {
  return (
    <main id="main" className="cresco-editorial-backdrop min-h-dvh">
      <div className="mx-auto max-w-[1264px] px-5 pb-14 pt-5 md:px-11">
        <SiteHeader current="/how-it-works" />
        <section className="mt-12 max-w-[840px] md:mt-16">
          <p className="cresco-section-kicker">A simple idea · One standing Key</p>
          <h1 className="mt-3 font-display text-[clamp(52px,6vw,78px)] leading-[.96] text-navy-strong">Real freedom, <em className="text-green-strong">clear boundaries.</em></h1>
          <div aria-hidden className="cresco-rule-accent mt-4 w-36"/>
          <p className="mt-5 max-w-[58ch] text-[17px] leading-relaxed text-ink-2">
            Inside the Key, your teen or agent acts on their own. When a decision crosses the line, they can request one exact exception. The Key stays the same.
          </p>
        </section>
        <HowItWorksStepper />
        <div className="cresco-editorial-panel mt-10 flex flex-wrap items-center justify-between gap-4 p-5 md:p-6">
          <div><p className="cresco-section-kicker">Evidence you can inspect</p><p className="mt-1 text-[14px] text-ink-2">The underlying three-step capital workflow has been exercised live on Solana Devnet. Illustrated explanations are not transaction receipts.</p></div>
          <Link href="/worlds-fair" className="inline-flex items-center gap-2 text-[13px] font-semibold text-green-strong hover:underline">See the on-chain evidence <ArrowRight aria-hidden className="size-4"/></Link>
        </div>
      </div>
    </main>
  );
}
