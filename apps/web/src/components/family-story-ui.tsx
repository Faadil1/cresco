"use client";

/**
 * Shared presentation for the /try Family app: headings, result card, scene
 * footer and small art helpers. The persistent navigation lives in
 * family-app-shell.tsx. Pure presentation; state comes from the provider.
 */
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { LessonIllustration } from "@/components/illustrations/scenes";
import { sampleTrendPath, type FamilyExploreCase } from "@/lib/family-public-explore-data";
import type { IllustrationKey } from "@/domain/types";

export const panel = "rounded-[24px] border border-line-soft bg-surface p-5 shadow-sm md:p-6";
export const small = "text-[13px] leading-6 text-ink-2";
export const primaryBtn = "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-family-action px-6 py-3 text-[14px] font-bold text-white shadow-[0_12px_26px_-17px_rgba(31,95,214,.7)] hover:bg-family-action-hover disabled:cursor-not-allowed disabled:opacity-50";
export const secondaryBtn = "inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-line bg-surface px-6 py-3 text-[14px] font-bold text-navy-strong hover:bg-family-action-soft disabled:cursor-not-allowed disabled:opacity-50";

/** Page heading with optional art. Art is decorative; its title says what it shows. */
export function ChapterHeading({ kicker, title, intro, art }: { kicker?: string; title: string; intro?: ReactNode; art?: ReactNode }) {
  return (
    <header className="grid items-center gap-4 md:grid-cols-[1fr_auto] md:gap-8">
      <div>
        {kicker ? <p className="cresco-section-kicker mb-2">{kicker}</p> : null}
        <h1 className="font-display text-[clamp(26px,4.4vw,38px)] leading-[1.1] text-navy-strong">{title}</h1>
        {intro ? <div className="mt-2 max-w-[60ch] text-[14px] leading-6 text-ink-2">{intro}</div> : null}
      </div>
      {art ? <div className="mx-auto hidden w-full max-w-[260px] md:block">{art}</div> : null}
    </header>
  );
}

/** The one live region of a story page: what just happened, and what to do next. */
export function ResultCard({ tone = "info", title, children, testId = "result-card" }: {
  tone?: "good" | "wait" | "info" | "stop"; title: string; children?: ReactNode; testId?: string;
}) {
  const tones = {
    good: "border-green/40 bg-green-soft", wait: "border-orange/40 bg-yellow-soft",
    info: "border-line bg-surface", stop: "border-loss/30 bg-loss-soft",
  } as const;
  return (
    <section data-testid={testId} className={`rounded-[22px] border p-4 md:p-5 ${tones[tone]}`}>
      <p role="status" aria-live="polite" className="text-[16px] font-bold leading-6 text-navy-strong">{title}</p>
      {children ? <div className="mt-2 text-[13px] leading-6 text-navy">{children}</div> : null}
    </section>
  );
}

export function ChapterNav({ back, next }: {
  back?: { href: string; label: string };
  next?: { href: string; label: string; onClick?: () => void; disabled?: boolean };
}) {
  return (
    <nav aria-label="Previous and next chapter" className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
      {back ? <Link href={back.href} className={`${secondaryBtn} sm:w-auto`}><ArrowLeft aria-hidden className="size-4"/>{back.label}</Link> : <span/>}
      {next ? (
        next.disabled ? <span className={`${primaryBtn} opacity-50`} aria-disabled="true">{next.label}</span> :
        <Link href={next.href} onClick={next.onClick} className={primaryBtn}>{next.label}<ArrowRight aria-hidden className="size-4"/></Link>
      ) : null}
    </nav>
  );
}

export const COMPANY_ART: Record<string, IllustrationKey> = {
  orchard: "storefront", markets: "pizza", basket: "basket", river: "chart", greenroof: "shares", harbor: "scale",
};
export function CompanyArt({ id, name, className }: { id: string; name: string; className?: string }) {
  return <LessonIllustration kind={COMPANY_ART[id] ?? "storefront"} title={`Illustration for the invented company ${name}`} className={className}/>;
}

export function TeachingTrend({ item }: { item: FamilyExploreCase }) {
  const values = item.examplePath;
  const direction = values[values.length - 1] - values[0];
  return (
    <figure className="rounded-[16px] border border-line-soft bg-surface-soft px-3 py-2">
      <svg viewBox="0 0 320 112" role="img" aria-label={`Invented eight-point example trend for ${item.name}; ${direction > 0 ? "ends higher" : direction < 0 ? "ends lower" : "ends unchanged"} relative to its invented starting value`}
        className="h-[88px] w-full" preserveAspectRatio="none">
        {[30, 60, 90].map(y => <path key={y} d={`M0 ${y} H320`} stroke="currentColor" opacity=".12" strokeDasharray="3 5"/>)}
        <path d={sampleTrendPath(values, 320, 112)} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-green-strong"/>
      </svg>
      <figcaption className="text-[11px] leading-5 text-ink-2">Invented 8-step line for discussion only. No real price, date, trend history or forecast.</figcaption>
    </figure>
  );
}
