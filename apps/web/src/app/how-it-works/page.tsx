import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { HowItWorksStepper } from "./how-it-works";

export const metadata = { title: "How it works" };

export default function HowItWorksPage() {
  return (
    <main id="main" className="min-h-dvh bg-bg">
      <div className="mx-auto max-w-[1264px] px-5 pb-12 pt-6 md:px-11">
        <SiteHeader current="/how-it-works" />
        <p className="mt-14 text-[12px] font-medium uppercase tracking-[0.14em] text-ink-3 md:mt-20">How CRESCO works · 3 steps</p>
        <HowItWorksStepper />
        <p className="mt-10 text-[13px] text-ink-3">
          Every step above has run live on Solana Devnet, with Explorer receipts. <Link href="/worlds-fair" className="text-navy underline underline-offset-4">See the evidence</Link>.
        </p>
      </div>
    </main>
  );
}
