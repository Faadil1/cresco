import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Wordmark } from "@/components/shell";

const LINKS = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/start", label: "For parents & teens" },
  { href: "/worlds-fair/desk?case=capital", label: "Delegated capital" },
  { href: "/worlds-fair", label: "Technical proof" },
];

/** One navigation language across the public Family and Delegated Capital surfaces. */
export function SiteHeader({ current }: { current?: string }) {
  return (
    <header className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-2 border-b border-line-soft pb-4 lg:grid-cols-[auto_1fr_auto] lg:gap-x-8">
      <Link href="/" aria-label="CRESCO home" className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-0.5">
        <Wordmark size="md" />
        <span className="hidden border-l border-line pl-3 text-[11px] text-ink-2 sm:inline">Your Key. Your decisions.</span>
      </Link>
      <nav aria-label="CRESCO product" className="hidden min-w-0 items-center justify-center gap-1 text-[13px] lg:flex">
        {LINKS.map((item) => (
          <Link key={item.href} href={item.href} aria-current={current === item.href ? "page" : undefined}
            className={`shrink-0 rounded-full px-3 py-2 font-medium transition-colors hover:bg-green-soft ${current === item.href ? "bg-green-soft text-green-strong" : "text-ink-2 hover:text-green-strong"}`}>
            {item.label}
          </Link>
        ))}
      </nav>
      <details className="group order-3 col-span-2 lg:hidden">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between rounded-[13px] border border-line-soft bg-surface px-4 py-2.5 text-[13px] font-semibold text-navy-strong marker:hidden">
          Explore CRESCO <ChevronDown aria-hidden className="size-4 text-green-strong transition-transform group-open:rotate-180" />
        </summary>
        <nav aria-label="CRESCO mobile navigation" className="mt-2 grid gap-1 rounded-[16px] border border-line-soft bg-surface p-2 shadow-soft">
          {LINKS.map((item) => (
            <Link key={item.href} href={item.href} aria-current={current === item.href ? "page" : undefined}
              className={`min-h-11 rounded-[10px] px-3 py-3 text-[13px] font-semibold transition-colors hover:bg-green-soft ${current === item.href ? "bg-green-soft text-green-strong" : "text-navy-strong"}`}>
              {item.label}
            </Link>
          ))}
          <Link href="/parent/sign-in" className="min-h-11 rounded-[10px] px-3 py-3 text-[13px] font-semibold text-navy-strong hover:bg-green-soft">Parent sign-in</Link>
        </nav>
      </details>
      <div className="flex shrink-0 items-center gap-3">
        <Link href="/parent/sign-in" className="hidden text-[13px] font-semibold text-navy-strong hover:text-green-strong sm:inline">Sign in</Link>
        <Link href="/start" className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-green-strong px-4 text-[13px] font-semibold text-white hover:bg-green">Get started <ArrowRight aria-hidden className="size-3.5"/></Link>
      </div>
    </header>
  );
}
