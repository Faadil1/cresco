import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
      <nav aria-label="CRESCO product" className="order-3 col-span-2 -mx-1 flex min-w-0 items-center gap-1 overflow-x-auto px-1 pb-1 text-[13px] lg:order-none lg:col-span-1 lg:justify-center lg:pb-0">
        {LINKS.map((item) => (
          <Link key={item.href} href={item.href} aria-current={current === item.href ? "page" : undefined}
            className={`shrink-0 rounded-full px-3 py-2 font-medium transition-colors hover:bg-green-soft ${current === item.href ? "bg-green-soft text-green-strong" : "text-ink-2 hover:text-green-strong"}`}>
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="flex shrink-0 items-center gap-3">
        <Link href="/parent/sign-in" className="hidden text-[13px] font-semibold text-navy-strong hover:text-green-strong sm:inline">Sign in</Link>
        <Link href="/start" className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-green-strong px-4 text-[13px] font-semibold text-white hover:bg-green">Get started <ArrowRight aria-hidden className="size-3.5"/></Link>
      </div>
    </header>
  );
}
