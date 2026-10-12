import Link from "next/link";

import { Wordmark } from "@/components/shell";

const LINKS = [
  { href: "/start", label: "Family" },
  { href: "/worlds-fair/desk?case=capital", label: "Delegated capital" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/worlds-fair", label: "Technical proof" },
];

/** Header shared by the CRESCO public pages (home, how it works). */
export function SiteHeader({ current }: { current?: string }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <Link href="/" aria-label="CRESCO home">
        <Wordmark size="md" />
      </Link>
      <nav aria-label="CRESCO product" className="flex flex-wrap items-center gap-1 text-[14px]">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            aria-current={current === l.href ? "page" : undefined}
            className={`rounded-full px-3.5 py-2 hover:bg-surface ${current === l.href ? "bg-surface text-navy-strong" : "text-ink-2 hover:text-navy-strong"}`}
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
