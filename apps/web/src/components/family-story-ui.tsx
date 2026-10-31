"use client";

/**
 * Shared chrome for the /try story: chapter rail, result card, chapter footer
 * and small art helpers. Pure presentation; state comes from the provider.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight, Check, Menu, ShieldCheck } from "lucide-react";
import { Wordmark } from "@/components/shell";
import { LessonIllustration } from "@/components/illustrations/scenes";
import { useFamilyStory } from "@/components/family-story-provider";
import { STORY_CHAPTERS, lensOfPath, type StoryChapterId } from "@/lib/family-story-routes";
import { chapterStatus } from "@/lib/family-story-state";
import { sampleTrendPath, type FamilyExploreCase } from "@/lib/family-public-explore-data";
import type { IllustrationKey } from "@/domain/types";

export const panel = "rounded-[24px] border border-line-soft bg-surface p-5 shadow-sm md:p-6";
export const small = "text-[13px] leading-6 text-ink-2";
export const primaryBtn = "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-green-strong px-6 py-3 text-[14px] font-bold text-white hover:bg-green disabled:cursor-not-allowed disabled:opacity-50";
export const secondaryBtn = "inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-line bg-surface px-6 py-3 text-[14px] font-bold text-navy-strong hover:bg-green-soft disabled:cursor-not-allowed disabled:opacity-50";

/** Which chapter a path belongs to (the Parent's pages are one chapter). */
export function chapterOfPath(pathname: string): StoryChapterId {
  if (pathname.startsWith("/try/goal")) return "goal";
  if (pathname.startsWith("/try/learn")) return "learn";
  if (pathname.startsWith("/try/explore")) return "explore";
  if (pathname.startsWith("/try/decision")) return "decision";
  if (pathname.startsWith("/try/parent")) return "parent";
  if (pathname.startsWith("/try/outcome")) return "outcome";
  if (pathname.startsWith("/try/together")) return "together";
  return "welcome";
}

export function StoryFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/try";
  const { story } = useFamilyStory();
  const current = chapterOfPath(pathname);
  const status = chapterStatus(story);
  const rail = STORY_CHAPTERS.filter(chapter => chapter.id !== "welcome");
  const index = rail.findIndex(chapter => chapter.id === current);
  const lens = lensOfPath(pathname);
  const doneCount = rail.filter(chapter => status[chapter.id as keyof typeof status]).length;
  return (
    <div className="cresco-app-workspace min-h-dvh">
      <div className="mx-auto max-w-[1040px] px-4 pb-24 pt-3 md:px-10 md:pt-6">
        <header className="flex items-center justify-between gap-3">
          <Link href="/try" aria-label="Cresco Family story start" className="inline-flex min-h-11 items-center"><Wordmark size="sm"/></Link>
          <div className="flex items-center gap-2">
            {current !== "welcome" ? (
              <span data-testid="story-lens" data-lens={lens} className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${lens === "parent" ? "bg-lavender-soft text-navy-strong" : lens === "both" ? "bg-yellow-soft text-navy-strong" : "bg-green-soft text-green-strong"}`}>
                {lens === "parent" ? "Parent's view · simulated" : lens === "both" ? "Child + Parent · together" : "Child's view · practice"}
              </span>
            ) : null}
            <details key={pathname} className="relative md:hidden">
              <summary aria-label="All chapters" className="flex min-h-11 min-w-11 cursor-pointer list-none items-center justify-center rounded-full border border-line bg-surface text-navy-strong [&::-webkit-details-marker]:hidden">
                <Menu aria-hidden className="size-5"/>
              </summary>
              <nav aria-label="All chapters" className="absolute right-0 z-30 mt-2 w-[min(86vw,320px)] rounded-[20px] border border-line-soft bg-surface p-3 shadow-soft">
                <ol className="space-y-1">
                  {STORY_CHAPTERS.map(chapter => {
                    const done = chapter.id !== "welcome" && status[chapter.id as keyof typeof status];
                    return (
                      <li key={chapter.id}>
                        <Link href={chapter.path} aria-current={chapter.id === current ? "page" : undefined}
                          className={`flex min-h-11 items-center justify-between gap-3 rounded-[12px] px-3 text-[14px] font-semibold ${chapter.id === current ? "bg-green-soft text-green-strong" : "text-navy-strong hover:bg-surface-soft"}`}>
                          <span>{chapter.label}</span>
                          {done ? <Check aria-label="done" className="size-4 text-green-strong"/> : null}
                        </Link>
                      </li>
                    );
                  })}
                  <li><Link href="/try/lab" className="flex min-h-11 items-center rounded-[12px] px-3 text-[14px] font-semibold text-ink-2 hover:bg-surface-soft">Free practice lab (all tabs)</Link></li>
                  <li><Link href="/" className="flex min-h-11 items-center rounded-[12px] px-3 text-[14px] font-semibold text-ink-2 hover:bg-surface-soft">About Cresco Family</Link></li>
                </ol>
              </nav>
            </details>
          </div>
        </header>

        {current !== "welcome" ? (
          <nav aria-label="Story chapters" data-testid="story-rail" className="mt-2">
            <ol className="flex gap-1.5 md:gap-2">
              {rail.map(chapter => {
                const done = status[chapter.id as keyof typeof status];
                const active = chapter.id === current;
                return (
                  <li key={chapter.id} className="min-w-0 flex-1">
                    <Link href={chapter.path} aria-current={active ? "page" : undefined} className="block pt-2 md:pb-1">
                      <span aria-hidden className={`block h-1.5 rounded-full ${active ? "bg-navy-strong" : done ? "bg-green-strong" : "bg-line"}`}/>
                      <span className={`mt-1.5 hidden text-[12px] font-bold md:block ${active ? "text-navy-strong" : "text-ink-2"}`}>
                        {done ? <Check aria-hidden className="mr-1 inline size-3.5 text-green-strong"/> : null}{chapter.short}
                      </span>
                      <span className="sr-only md:hidden">{chapter.label}{done ? " (done)" : ""}{active ? " (current)" : ""}</span>
                    </Link>
                  </li>
                );
              })}
            </ol>
            <p className="mt-1.5 text-[12px] font-semibold text-ink-2 md:hidden">
              {index >= 0 ? `Chapter ${index + 1} of ${rail.length} · ${rail[index].label}` : ""}
              <span className="ml-2 font-normal text-ink-3">{doneCount} done</span>
            </p>
          </nav>
        ) : null}

        <main id="main" className="mt-4 md:mt-6">{children}</main>

        <footer className="mt-10 space-y-2 border-t border-line-soft pt-4 text-[12px] leading-5 text-ink-3">
          <p className="flex items-start gap-2">
            <ShieldCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-green-strong"/>
            <span>Fictional practice in this browser tab only. Refreshing starts the story again. No sign-in, wallet, server write, real money or verified Parent. Sample companies and prices are invented and are not advice.</span>
          </p>
          <p><Link href="/try/lab" className="font-semibold text-green-strong underline underline-offset-4">Prefer the free practice lab with all tabs?</Link></p>
        </footer>
      </div>
    </div>
  );
}

/** Page heading with optional art. Art is decorative; its title says what it shows. */
export function ChapterHeading({ kicker, title, intro, art }: { kicker: string; title: string; intro?: ReactNode; art?: ReactNode }) {
  return (
    <header className="grid items-center gap-4 md:grid-cols-[1fr_auto] md:gap-8">
      <div>
        <p className="cresco-section-kicker">{kicker}</p>
        <h1 className="mt-2 font-display text-[clamp(30px,5vw,46px)] leading-[1.05] text-navy-strong">{title}</h1>
        {intro ? <div className="mt-2 max-w-[60ch] text-[14px] leading-6 text-ink-2">{intro}</div> : null}
      </div>
      {art ? <div className="mx-auto w-full max-w-[200px] md:max-w-[340px]">{art}</div> : null}
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
