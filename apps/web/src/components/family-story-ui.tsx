"use client";

/**
 * Shared presentation for the /try Family app: headings, result card, scene
 * footer and small art helpers. The persistent navigation lives in
 * family-app-shell.tsx. Pure presentation; state comes from the provider.
 */
import Link from "next/link";
import { useId, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronDown, Info } from "lucide-react";
import { LessonIllustration } from "@/components/illustrations/scenes";
import { sampleTrendPath, type FamilyExploreCase } from "@/lib/family-public-explore-data";
import type { IllustrationKey } from "@/domain/types";
import type { ChapterStatus } from "@/lib/family-story-state";

/*
 * Cresco Family design system (2026-11-16, issue #126).
 * Type: page title 26/30 -> 34/40, section 20/28, body 15/24, meta 13/20.
 * Nothing in the Family app is smaller than 12px. Spacing on an 8px grid.
 * One primary action per view. Reality is shown with ONE tag per world:
 * Pretend (yellow), Real company + paper $ (blue), Parent (lavender).
 */
export const panel = "rounded-[24px] border border-line-soft bg-surface p-5 shadow-[var(--cresco-shadow-card)] md:p-6";
export const small = "text-[13px] leading-6 text-ink-2";
export const pageTitle = "font-display text-[28px] leading-[1.12] text-navy-strong md:text-[36px]";
export const sectionTitle = "text-[20px] font-extrabold leading-7 text-navy-strong";
export const kicker = "text-[12px] font-extrabold uppercase tracking-[0.08em]";
export const textLink = "inline-flex min-h-11 items-center gap-1 text-[14px] font-bold text-family-action underline-offset-4 hover:underline";
export const primaryBtn = "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-family-action px-6 py-3 text-[15px] font-bold text-white shadow-[0_14px_28px_-16px_rgba(89,54,199,.75)] hover:bg-family-action-hover disabled:cursor-not-allowed disabled:opacity-50";
export const secondaryBtn = "inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-line bg-surface px-6 py-3 text-[15px] font-bold text-navy-strong hover:bg-family-action-soft disabled:cursor-not-allowed disabled:opacity-50";

/** Page heading with optional art. Art is decorative; its title says what it shows. */
export function ChapterHeading({ kicker, title, intro, art }: { kicker?: string; title: string; intro?: ReactNode; art?: ReactNode }) {
  return (
    <header className="grid items-center gap-4 md:grid-cols-[1fr_auto] md:gap-8">
      <div>
        {kicker ? <p className="cresco-section-kicker mb-2">{kicker}</p> : null}
        <h1 className={pageTitle}>{title}</h1>
        {intro ? <div className="mt-2 max-w-[60ch] text-[15px] leading-6 text-ink-2">{intro}</div> : null}
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
      <figcaption className="text-[12px] leading-5 text-ink-2">Invented 8-step line for discussion only. No real price, date, trend history or forecast.</figcaption>
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* Reality: one tag per world, one disclosure for sources and limits.  */
/* ------------------------------------------------------------------ */
export type Reality = "pretend" | "real" | "parent";
const REALITY: Record<Reality, { label: string; tone: string }> = {
  pretend: { label: "Pretend", tone: "bg-yellow-soft text-orange-text border-yellow/50" },
  real: { label: "Real company · paper $", tone: "bg-blue-soft text-blue-strong border-blue/30" },
  parent: { label: "Parent · simulated", tone: "bg-lavender-soft text-lavender border-lavender/30" },
};
export function RealityTag({ kind, label }: { kind: Reality; label?: string }) {
  const r = REALITY[kind];
  return (
    <span data-testid={`reality-${kind}`} data-reality={kind}
      className={`inline-flex min-h-7 items-center gap-1 rounded-full border px-2.5 text-[12px] font-extrabold ${r.tone}`}>
      {label ?? r.label}
    </span>
  );
}

/** The single place where a page keeps its full source and safety wording. Closed by default. */
export function SourcesNote({ title = "Sources and limits", children, testId = "sources-note" }: { title?: string; children: ReactNode; testId?: string }) {
  return (
    <details data-testid={testId} className="group rounded-[16px] border border-line-soft bg-surface-soft/60 px-4 py-1 text-[13px] leading-6 text-ink-2">
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 font-bold text-navy-strong">
        <Info aria-hidden className="size-4 shrink-0 text-ink-2"/>{title}
        <ChevronDown aria-hidden className="ml-auto size-4 transition-transform group-open:rotate-180"/>
      </summary>
      <div className="space-y-2 pb-3">{children}</div>
    </details>
  );
}

/** A two-way switch between pages (Story vs Real, Pretend credits vs Paper dollars). */
export function Segmented({ label, items, testId }: {
  label: string; testId?: string;
  items: readonly { href: string; label: string; active: boolean; reality?: Reality }[];
}) {
  return (
    <nav aria-label={label} data-testid={testId}>
      <ul className="grid grid-cols-2 gap-1 rounded-full border border-line-soft bg-surface-soft p-1">
        {items.map(item => (
          <li key={item.href}>
            <Link href={item.href} aria-current={item.active ? "page" : undefined}
              className={`flex min-h-11 items-center justify-center gap-2 rounded-full px-3 text-center text-[14px] font-extrabold transition-colors ${item.active ? "bg-surface text-navy-strong shadow-sm" : "text-ink-2 hover:text-navy-strong"}`}>
              {item.reality ? <span aria-hidden className={`size-2.5 rounded-full ${item.reality === "real" ? "bg-blue-strong" : "bg-yellow"}`}/> : null}
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** A numbered step inside a longer task (company page, real-company lab). */
export function StepHeader({ n, title, hint, done }: { n: number; title: string; hint?: ReactNode; done?: boolean }) {
  return (
    <header className="flex items-start gap-3">
      <span aria-hidden className={`grid size-8 shrink-0 place-items-center rounded-full text-[14px] font-extrabold ${done ? "bg-green-strong text-white" : "bg-family-action-soft text-family-action"}`}>
        {done ? <Check className="size-4"/> : n}
      </span>
      <div className="min-w-0">
        <h2 className="text-[18px] font-extrabold leading-7 text-navy-strong"><span className="sr-only">Step {n}: </span>{title}</h2>
        {hint ? <p className="text-[13px] leading-5 text-ink-2">{hint}</p> : null}
      </div>
    </header>
  );
}

export function Stat({ label, value, testId, hint }: { label: string; value: ReactNode; testId?: string; hint?: ReactNode }) {
  return (
    <div className="min-w-0 rounded-[16px] bg-surface-soft px-3 py-3">
      <dt className="text-[13px] font-semibold leading-5 text-ink-2">{label}</dt>
      <dd className="mt-0.5 text-[22px] font-extrabold leading-7 text-navy-strong" data-testid={testId}>{value}</dd>
      {hint ? <dd className="text-[12px] leading-5 text-ink-2">{hint}</dd> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The learning loop: Goal -> Learn -> Meet -> Decide -> Talk.          */
/* Done only because something real happened in state.                 */
/* ------------------------------------------------------------------ */
export const LOOP_STEPS = [
  { id: "goal", label: "Goal", child: "Pick a dream", parent: "Picks a dream", href: "/try/goal" },
  { id: "learn", label: "Learn", child: "One short lesson", parent: "Learns an idea", href: "/try/learn" },
  { id: "explore", label: "Meet", child: "Answer a dilemma", parent: "Answers a dilemma", href: "/try/explore" },
  { id: "decision", label: "Decide", child: "Make a choice", parent: "Decides in the Key", href: "/try/decision" },
  { id: "together", label: "Talk", child: "Talk it through", parent: "You talk together", href: "/try/together" },
] as const satisfies readonly { id: keyof ChapterStatus; label: string; child: string; parent: string; href: string }[];

export function JourneyTrack({ status, lens = "child", testId = "journey-track" }: { status: ChapterStatus; lens?: "child" | "parent"; testId?: string }) {
  const current = LOOP_STEPS.find(step => !status[step.id])?.id;
  const done = LOOP_STEPS.filter(step => status[step.id]).length;
  return (
    <nav aria-label={lens === "child" ? "My learning loop" : "Your child's learning loop"} data-testid={testId} data-done={done}>
      <ol className="grid grid-cols-5 gap-1.5">
        {LOOP_STEPS.map((step, i) => {
          const isDone = status[step.id];
          const isCurrent = step.id === current;
          return (
            <li key={step.id} className="relative min-w-0">
              {i < LOOP_STEPS.length - 1 ? <span aria-hidden className={`absolute left-[calc(50%+20px)] right-[calc(-50%+20px)] top-[25px] border-t-[3px] ${isDone ? "border-green-strong/60" : "border-dashed border-line"}`}/> : null}
              <Link href={step.href} aria-current={isCurrent ? "step" : undefined} data-step={step.id} data-done={isDone ? "true" : "false"}
                className="group flex min-h-11 flex-col items-center gap-1 rounded-[14px] px-1 py-1.5 text-center hover:bg-surface-soft">
                <span aria-hidden className={`relative grid size-9 place-items-center rounded-full border-[3px] text-[14px] font-extrabold shadow-sm ${isDone ? "border-white bg-green-strong text-white" : isCurrent ? "border-white bg-family-action text-white ring-4 ring-family-action/20" : "border-white bg-surface-soft text-ink-2"}`}>
                  {isDone ? <Check className="size-4" strokeWidth={3}/> : i + 1}
                </span>
                <span className={`text-[12px] font-extrabold leading-4 ${isCurrent ? "text-family-action" : "text-navy-strong"}`}>{step.label}</span>
                <span className="hidden text-[12px] leading-4 text-ink-2 sm:block">{lens === "child" ? step.child : step.parent}</span>
                <span className="sr-only">{isDone ? " (done)" : isCurrent ? " (you are here)" : " (not yet)"}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * One numbered step of a guided task. On phones only the current step is open
 * (an accordion: a heading that contains a button, with a one-line summary);
 * from the lg breakpoint every step is always open and the toggle is hidden.
 */
export function StepPanel({ n, title, hint, summary, done, open, onToggle, children, className = "", testId, ariaLabel }: {
  n: number; title: string; hint?: ReactNode; summary?: ReactNode; done?: boolean; open: boolean; onToggle: () => void;
  children: ReactNode; className?: string; testId?: string; ariaLabel?: string;
}) {
  const bodyId = `step-body-${n}`;
  return (
    <section data-testid={testId} aria-label={ariaLabel} data-step-open={open ? "true" : "false"}
      className={`min-w-0 rounded-[20px] border bg-surface p-4 md:p-5 ${open ? "border-family-action/30" : "border-line-soft"} lg:border-line-soft ${className}`}>
      <h2 className="lg:hidden">
        <button type="button" aria-expanded={open} aria-controls={bodyId} onClick={onToggle} data-testid={`step-toggle-${n}`}
          className="flex min-h-11 w-full items-center gap-3 text-left">
          <span aria-hidden className={`grid size-8 shrink-0 place-items-center rounded-full text-[14px] font-extrabold ${done ? "bg-green-strong text-white" : open ? "bg-family-action text-white" : "bg-family-action-soft text-family-action"}`}>
            {done ? <Check className="size-4"/> : n}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[17px] font-extrabold leading-6 text-navy-strong"><span className="sr-only">Step {n}: </span>{title}</span>
            {!open && summary ? <span className="block truncate text-[13px] leading-5 text-ink-2">{summary}</span> : null}
          </span>
          <ChevronDown aria-hidden className={`size-5 shrink-0 text-ink-2 transition-transform ${open ? "rotate-180" : ""}`}/>
        </button>
      </h2>
      <div className="hidden lg:block"><StepHeader n={n} title={title} hint={hint} done={done}/></div>
      <div id={bodyId} className={open ? "mt-3 space-y-3" : "hidden lg:mt-3 lg:block lg:space-y-3"}>
        {hint ? <p className="text-[13px] leading-5 text-ink-2 lg:hidden">{hint}</p> : null}
        {children}
      </div>
    </section>
  );
}

/**
 * A tap-to-explain word for first-time readers (revenue, profit, reference
 * price...). A real button with aria-expanded; the definition appears inline,
 * right under the sentence, so nothing opens elsewhere.
 */
export function Term({ word, definition, testId }: { word: string; definition: string; testId?: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <>
      <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen(v => !v)} data-testid={testId}
        className="inline min-h-0 cursor-help border-b-2 border-dotted border-family-action/60 font-bold text-navy-strong hover:text-family-action">
        {word}<span className="sr-only"> (what does this mean?)</span>
      </button>
      {open ? (
        <span id={id} role="note" className="mt-1 block rounded-[12px] bg-blue-soft px-3 py-2 text-[14px] font-normal leading-6 text-navy-strong">
          {definition}
        </span>
      ) : <span id={id} hidden/>}
    </>
  );
}
