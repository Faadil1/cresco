import { ExternalLink, Search, ShieldAlert } from "lucide-react";
import { FamilyPortfolioTabs } from "@/components/family-portfolio-tabs";
import { FamilyRealWorldPanel } from "@/components/family-real-world-panel";
import { REAL_COMPANY_RESEARCH } from "@/lib/family-real-companies";

export function RealCompanyResearch() {
  return (
    <div className="mx-auto max-w-[920px] space-y-5" data-testid="real-companies-screen">
      <header className="space-y-1">
        <p className="text-[11px] font-extrabold uppercase tracking-wider text-green-strong">Discover and research</p>
        <h1 className="font-display text-[27px] text-navy-strong md:text-[34px]">Real companies</h1>
        <p className="max-w-[660px] text-[13px] leading-6 text-ink-2">
          Actual public companies to learn about, not fictional investments. Read how they earn money,
          ask what could go wrong, and explore their own published information.
        </p>
      </header>

      <FamilyPortfolioTabs active="real"/>

      <div role="note" className="rounded-[16px] border border-yellow/40 bg-yellow-soft p-4 text-[13px] leading-6 text-navy-strong" data-testid="real-company-boundary">
        <ShieldAlert aria-hidden className="mr-2 inline size-4 text-orange-text"/>
        <strong>Research only.</strong> These are real companies, but you have no shares here.
        Optional third-party market charts are display-only and load only when you ask. There are no buy buttons, real balances, accounts or portfolio positions.
        Your fictional credits and Parent Key work only in Fictional practice.
      </div>

      <section aria-label="Official-company learning cards" className="grid gap-3 md:grid-cols-2">
        {REAL_COMPANY_RESEARCH.map(company => (
          <article key={company.id} className="rounded-[22px] border border-line-soft bg-surface p-4 shadow-sm md:p-5"
            data-testid={`real-company-${company.id}`}>
            <p className="text-[11px] font-bold uppercase tracking-wider text-green-strong">{company.sector}</p>
            <div className="mt-1 flex items-start justify-between gap-2">
              <h2 className="text-[20px] font-extrabold text-navy-strong">{company.name}</h2>
              <span className="shrink-0 rounded-full bg-surface-soft px-2.5 py-1 text-[11px] font-bold text-ink-2">
                {company.exchange}: {company.ticker}
              </span>
            </div>
            <p className="mt-2 text-[13px] leading-6 text-navy">{company.model}</p>
            <div className="mt-3 rounded-[14px] bg-green-soft/70 p-3">
              <p className="flex items-center gap-2 text-[12px] font-extrabold text-green-strong"><Search aria-hidden className="size-4"/>Question to investigate</p>
              <p className="mt-1 text-[13px] leading-5 text-navy-strong">{company.researchQuestion}</p>
            </div>
            <details className="mt-3 rounded-[14px] border border-line-soft p-3">
              <summary className="min-h-7 cursor-pointer text-[13px] font-bold text-navy-strong">What should I check?</summary>
              <p className="mt-2 text-[12px] leading-5 text-ink-2"><strong>Customers:</strong> {company.customers}</p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-[12px] leading-5 text-ink-2">
                {company.risksToConsider.map(risk => <li key={risk}>{risk}</li>)}
              </ul>
            </details>
            <FamilyRealWorldPanel company={company} />
            <a href={company.officialSource} target="_blank" rel="noopener noreferrer"
              className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-[13px] font-extrabold text-family-action underline underline-offset-4">
              {company.sourceLabel}<ExternalLink aria-hidden className="size-4"/>
            </a>
          </article>
        ))}
      </section>

      <p className="rounded-[14px] border border-line-soft p-3 text-[12px] leading-5 text-ink-2">
        Company profiles are introductory, not investment advice. SEC annual figures are offline snapshots with fiscal-period and filing dates; the optional TradingView chart is owned by TradingView and may be delayed. Neither source affects fictional holdings or permissions.
      </p>
    </div>
  );
}
