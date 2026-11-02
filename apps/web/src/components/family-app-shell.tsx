"use client";

/**
 * The durable Cresco Family app shell, restored from the original Cresco
 * AppShell (apps/web/src/components/shell.tsx): five real destinations with a
 * bottom bar on phones and a side rail on larger screens. It deliberately does
 * NOT use the legacy store, child name or money mode: everything comes from
 * the in-memory Family story state.
 *
 * Frames by route (see shellModeOfPath):
 * - intro / onboarding: no app navigation, one decision per screen;
 * - focus: a lesson being read, with a close button instead of tabs;
 * - child: Home / Learn / Explore / Portfolio / Profile;
 * - parent: the simulated Parent's own small dashboard navigation.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  ArrowLeftRight, BookOpen, ChartPie, Compass, House, KeyRound, LayoutDashboard, ShieldCheck, UserRound, X, Inbox, GraduationCap,
  type LucideIcon,
} from "lucide-react";
import { Wordmark } from "@/components/shell";
import { CrescoMark } from "@/components/illustrations/objects";
import { useFamilyStory } from "@/components/family-story-provider";
import {
  FAMILY_APP_TABS, PARENT_APP_TABS, lensOfPath, parentTabOfPath, shellModeOfPath, tabOfPath,
  type FamilyTabId, type ParentTabId,
} from "@/lib/family-story-routes";
import { remainingPeriod } from "@/lib/family-public-practice";

const TAB_ICONS: Record<FamilyTabId, LucideIcon> = {
  home: House, learn: BookOpen, explore: Compass, portfolio: ChartPie, profile: UserRound,
};
const PARENT_ICONS: Record<ParentTabId, LucideIcon> = {
  overview: LayoutDashboard, request: Inbox, key: KeyRound, learn: GraduationCap,
};

export function LensChip({ pathname }: { pathname: string }) {
  const lens = lensOfPath(pathname);
  return (
    <span data-testid="story-lens" data-lens={lens}
      className={`inline-flex min-h-8 items-center rounded-full px-3 text-[11px] font-bold ${lens === "parent" ? "bg-lavender-soft text-navy-strong" : lens === "both" ? "bg-yellow-soft text-navy-strong" : "bg-green-soft text-green-strong"}`}>
      {lens === "parent" ? "Parent's view · simulated" : lens === "both" ? "Child + Parent · together" : "Child's view · practice"}
    </span>
  );
}

function SafetyFooter({ compact = false }: { compact?: boolean }) {
  return (
    <footer className={`${compact ? "mt-8" : "mt-12"} space-y-1.5 border-t border-line-soft pt-4 text-[12px] leading-5 text-ink-3`}>
      <p className="flex items-start gap-2">
        <ShieldCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-green-strong"/>
        <span>Fictional practice in this browser tab only. Refreshing starts the story again. No sign-in, wallet, server write, real money or verified Parent. Sample companies and prices are invented and are not advice.</span>
      </p>
      <p><Link href="/try/lab" className="font-semibold text-green-strong underline underline-offset-4">Prefer the free practice lab with all tabs?</Link></p>
    </footer>
  );
}

function ChildSideNav({ current }: { current: FamilyTabId | null }) {
  const { story } = useFamilyStory();
  const p = story.practice;
  const pending = p.requests.filter(r => r.status === "pending").length;
  return (
    <aside className="sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-line-soft bg-surface/90 px-3 py-6 md:flex md:w-[96px] lg:w-[244px] lg:px-5">
      <Link href="/try/home" className="mb-8 flex min-h-11 items-center justify-center lg:justify-start" aria-label="Cresco Family home">
        <span className="lg:hidden"><CrescoMark className="size-9"/></span>
        <span className="hidden lg:block"><Wordmark size="sm"/></span>
      </Link>
      <nav aria-label="Main">
        <ul className="space-y-1.5">
          {FAMILY_APP_TABS.map(tab => {
            const Icon = TAB_ICONS[tab.id];
            const active = tab.id === current;
            return (
              <li key={tab.id}>
                <Link href={tab.path} aria-current={active ? "page" : undefined}
                  className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-[14px] px-2 py-2 text-[11.5px] font-semibold transition-colors lg:flex-row lg:justify-start lg:gap-3 lg:px-3.5 lg:text-[15px] ${active ? "bg-family-action-soft text-family-action" : "text-ink-2 hover:bg-surface-soft hover:text-navy"}`}>
                  <Icon aria-hidden className="size-[22px]" strokeWidth={active ? 2.6 : 2.1}/>
                  {tab.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="mt-auto space-y-2">
        <Link href="/try/parent" data-testid="switch-to-parent"
          className="flex min-h-11 flex-col items-center gap-1 rounded-[14px] border border-line-soft px-2 py-2 text-[11px] font-semibold text-navy-strong hover:bg-lavender-soft lg:flex-row lg:gap-2 lg:px-3 lg:text-[13px]">
          <ArrowLeftRight aria-hidden className="size-4"/>
          <span>Parent&apos;s view{pending ? <span className="ml-1 rounded-full bg-orange px-1.5 text-[10px] text-white">{pending}</span> : null}</span>
        </Link>
        <div className="hidden rounded-[16px] bg-surface-soft p-3 lg:block" data-testid="shell-key-summary">
          <p className="flex items-center gap-1.5 text-[13px] font-bold text-navy-strong"><KeyRound aria-hidden className="size-4 text-green-strong"/>My Key</p>
          <p className="mt-0.5 text-[12px] leading-5 text-ink-2">Up to {p.key.maxPerAction} credits a choice · {remainingPeriod(p)} left. Pretend credits only.</p>
        </div>
      </div>
    </aside>
  );
}

function ChildBottomNav({ current }: { current: FamilyTabId | null }) {
  return (
    <nav aria-label="Main" className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line-soft bg-surface/95 backdrop-blur md:hidden" data-testid="bottom-nav">
      <ul className="mx-auto grid h-[var(--nav-height)] max-w-[520px] grid-cols-5 px-1">
        {FAMILY_APP_TABS.map(tab => {
          const Icon = TAB_ICONS[tab.id];
          const active = tab.id === current;
          return (
            <li key={tab.id}>
              <Link href={tab.path} aria-current={active ? "page" : undefined}
                className={`flex h-full min-h-11 flex-col items-center justify-center gap-1 text-[11px] font-semibold ${active ? "text-family-action" : "text-ink-3 hover:text-navy"}`}>
                <span className={`grid h-7 w-12 place-items-center rounded-full ${active ? "bg-family-action-soft" : ""}`}>
                  <Icon aria-hidden className="size-[21px]" strokeWidth={active ? 2.6 : 2.1}/>
                </span>
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function ChildShell({ pathname, children }: { pathname: string; children: ReactNode }) {
  const current = tabOfPath(pathname);
  const { story } = useFamilyStory();
  const pending = story.practice.requests.filter(r => r.status === "pending").length;
  return (
    <div className="flex min-h-dvh">
      <ChildSideNav current={current}/>
      <div className="min-w-0 flex-1">
        <header className="flex items-center justify-between gap-2 px-4 pt-3 md:justify-end md:px-10 md:pt-6">
          <Link href="/try/home" aria-label="Cresco Family home" className="inline-flex min-h-11 items-center md:hidden"><Wordmark size="sm"/></Link>
          <div className="flex items-center gap-2">
            <LensChip pathname={pathname}/>
            <Link href="/try/parent" aria-label={`Parent's view${pending ? `, ${pending} waiting` : ""}`}
              className="relative grid size-11 place-items-center rounded-full border border-line bg-surface text-navy-strong md:hidden">
              <ArrowLeftRight aria-hidden className="size-4"/>
              {pending ? <span aria-hidden className="absolute -right-0.5 -top-0.5 grid size-5 place-items-center rounded-full bg-orange text-[10px] font-bold text-white">{pending}</span> : null}
            </Link>
          </div>
        </header>
        <main id="main" className="pb-nav mx-auto w-full max-w-[1080px] px-4 pt-3 md:px-8 md:pt-2 lg:px-10">
          {children}
          <SafetyFooter/>
        </main>
      </div>
      <ChildBottomNav current={current}/>
    </div>
  );
}

function ParentShell({ pathname, children }: { pathname: string; children: ReactNode }) {
  const current = parentTabOfPath(pathname);
  const { story } = useFamilyStory();
  const pending = story.practice.requests.filter(r => r.status === "pending").length;
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-line-soft bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1080px] items-center justify-between gap-2 px-4 pt-2 md:px-8">
          <Link href="/try/parent" aria-label="Parent overview" className="inline-flex min-h-11 items-center gap-2">
            <Wordmark size="sm"/><span className="rounded-full bg-lavender-soft px-2 py-0.5 text-[11px] font-bold text-lavender">Parent</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/try/home" data-testid="switch-to-child"
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-line bg-surface px-3 text-[13px] font-bold text-family-action">
              <ArrowLeftRight aria-hidden className="size-4"/>Child&apos;s view
            </Link>
          </div>
        </div>
        <nav aria-label="Parent" className="mx-auto max-w-[1080px] px-2 md:px-6">
          <ul className="no-scrollbar flex gap-1 overflow-x-auto">
            {PARENT_APP_TABS.map(tab => {
              const Icon = PARENT_ICONS[tab.id];
              const active = tab.id === current;
              return (
                <li key={tab.id} className="shrink-0">
                  <Link href={tab.path} aria-current={active ? "page" : undefined}
                    className={`flex min-h-11 items-center gap-1.5 border-b-[3px] px-2.5 text-[14px] font-semibold sm:px-3 ${active ? "border-lavender text-navy-strong" : "border-transparent text-ink-2 hover:text-navy"}`}>
                    <Icon aria-hidden className="hidden size-4 sm:block"/>{tab.label}
                    {tab.id === "request" && pending ? <span className="rounded-full bg-orange px-1.5 text-[10px] font-bold text-white">{pending}</span> : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>
      <main id="main" className="mx-auto w-full max-w-[1080px] px-4 pb-12 pt-4 md:px-8 md:pt-6">
        <LensChip pathname={pathname}/>
        <div className="mt-3">{children}</div>
        <SafetyFooter/>
      </main>
    </div>
  );
}

function FocusShell({ pathname, children }: { pathname: string; children: ReactNode }) {
  const parent = lensOfPath(pathname) === "parent";
  const close = parent ? "/try/parent/learn" : "/try/learn";
  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex max-w-[720px] items-center justify-between gap-3 px-4 pt-3 md:pt-6">
        <Link href={close} aria-label={parent ? "Close lesson, back to Parent lessons" : "Close lesson, back to Learn"}
          className="grid size-11 place-items-center rounded-full border border-line bg-surface text-navy-strong hover:bg-surface-soft">
          <X aria-hidden className="size-5"/>
        </Link>
        <LensChip pathname={pathname}/>
      </header>
      <main id="main" className="mx-auto w-full max-w-[720px] px-4 pb-10 pt-3">
        {children}
        <SafetyFooter compact/>
      </main>
    </div>
  );
}

function SetupShell({ pathname, children, intro }: { pathname: string; children: ReactNode; intro: boolean }) {
  return (
    <div className={intro ? "mx-auto max-w-[1040px] px-4 pb-10 pt-3 md:px-10 md:pt-6" : "mx-auto max-w-[700px] px-4 pb-10 pt-3 md:px-7 md:pt-5"}>
      <header className="flex items-center justify-between gap-3">
        <Link href="/try" aria-label="Cresco Family start" className="inline-flex min-h-11 items-center"><Wordmark size="sm"/></Link>
        {intro ? null : <LensChip pathname={pathname}/>}
      </header>
      <main id="main" className="mt-4 md:mt-6">{children}</main>
      <SafetyFooter/>
    </div>
  );
}

export function FamilyAppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/try";
  const mode = shellModeOfPath(pathname);
  return (
    <div className="cresco-app-workspace cresco-family-app min-h-dvh" data-shell-mode={mode}>
      {mode === "child" ? <ChildShell pathname={pathname}>{children}</ChildShell>
        : mode === "parent" ? <ParentShell pathname={pathname}>{children}</ParentShell>
          : mode === "focus" ? <FocusShell pathname={pathname}>{children}</FocusShell>
            : <SetupShell pathname={pathname} intro={mode === "intro"}>{children}</SetupShell>}
    </div>
  );
}
