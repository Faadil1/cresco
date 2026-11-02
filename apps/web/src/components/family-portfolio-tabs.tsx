import Link from "next/link";

export function FamilyPortfolioTabs({ active }: { active: "practice" | "real" }) {
  return (
    <nav aria-label="Portfolio sections" data-testid="portfolio-sections">
      <div className="grid grid-cols-2 gap-2 rounded-[16px] border border-line-soft bg-surface-soft p-1.5">
        <Link href="/try/portfolio" aria-current={active === "practice" ? "page" : undefined}
          className={`flex min-h-12 items-center justify-center rounded-[12px] px-2 text-center text-[13px] font-extrabold ${active === "practice" ? "bg-surface text-family-action shadow-sm" : "text-ink-2"}`}>
          Fictional practice
        </Link>
        <Link href="/try/portfolio/companies" aria-current={active === "real" ? "page" : undefined}
          className={`flex min-h-12 items-center justify-center rounded-[12px] px-2 text-center text-[13px] font-extrabold ${active === "real" ? "bg-surface text-family-action shadow-sm" : "text-ink-2"}`}>
          Real companies
        </Link>
      </div>
    </nav>
  );
}
