import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { FamilyPublicStudio } from "@/components/family-public-studio";
import { Wordmark } from "@/components/shell";

export const metadata: Metadata = {
  title: "Try Cresco Family - Parent & Child learning practice",
  description: "Explore two distinct fictional Parent and Child profiles, lessons, an exact practice Key and consequences. No sign-in, invitation, wallet or real funds.",
};

export default function TryFamilyPage() {
  // Dedicated public browser-only experience; never expose historical API routes.
  if (process.env.NEXT_PUBLIC_CRESCO_FAMILY_ONLY !== "1") notFound();
  return (
    <main id="main" className="cresco-app-workspace min-h-dvh">
      <div className="mx-auto max-w-[1200px] px-4 pb-20 pt-6 md:px-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Wordmark size="md"/>
          <Link href="/" className="inline-flex items-center gap-2 text-[13px] font-bold text-green-strong underline underline-offset-4">
            <ArrowLeft aria-hidden className="size-4"/> About Cresco Family
          </Link>
        </header>
        <section className="mt-5 md:mt-7" aria-label="Public practice introduction">
          <span className="inline-flex items-center gap-2 rounded-full border border-green/30 bg-green-soft px-4 py-2 text-[12px] font-bold text-green-strong">
            <ShieldCheck aria-hidden className="size-4"/> Free public practice · No sign-in
          </span>
          <h1 className="mt-3 max-w-[30ch] font-display text-[clamp(30px,3.5vw,44px)] leading-[1.1] text-navy-strong">
            A whole family can learn to decide.
          </h1>
          <p className="mt-2 max-w-[78ch] text-[13px] leading-6 text-ink-2">
            No invitation. No Parent or Teen codes. No wallet. Enter the Child or Parent
            experience with one click, explore lessons, set fictional limits and see the
            consequences together. This is not a real financial account.
          </p>
        </section>
        <FamilyPublicStudio/>
        <Link href="/" className="mt-8 inline-flex min-h-11 items-center gap-2 text-[13px] font-bold text-green-strong underline underline-offset-4">
          <ArrowLeft aria-hidden className="size-4"/> Back to Cresco Family
        </Link>
      </div>
    </main>
  );
}
