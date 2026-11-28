"use client";

/**
 * The older all-tabs practice lab, kept for review but demoted: it is linked
 * only from Profile and points back to the main app. Client component so the
 * lucide icons never render in the server runtime (cause of the HTTP 500).
 */
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FamilyPublicStudio } from "@/components/family-public-studio";
import { Wordmark } from "@/components/shell";

export function FamilyClassicLab() {
  return (
    <main id="main" className="cresco-app-workspace min-h-dvh">
      <div className="mx-auto max-w-[1200px] px-4 pb-20 pt-3 md:px-10 md:pt-6">
        <header className="flex items-center justify-between gap-2 md:gap-4">
          <Wordmark size="md"/>
          <Link href="/try/home" className="inline-flex min-h-11 items-center gap-1 text-[13px] font-bold text-green-strong underline underline-offset-4 md:gap-2">
            <ArrowLeft aria-hidden className="size-4"/> Back to the Cresco Family app
          </Link>
        </header>
        <section className="mt-3 rounded-[16px] border border-line-soft bg-surface-soft p-4 md:mt-6" aria-label="Classic practice lab">
          <h1 className="font-display text-[24px] leading-tight text-navy-strong md:text-[30px]">Classic practice lab</h1>
          <p className="mt-1 max-w-[72ch] text-[14px] leading-6 text-ink-2">
            An older layout with every tab in one place, kept for comparison. It shares the same pretend credits and Key as the main app.
            For the guided experience, <Link href="/try" className="font-bold text-green-strong underline underline-offset-4">take the illustrated story</Link>.
          </p>
        </section>
        <FamilyPublicStudio/>
      </div>
    </main>
  );
}
