# Cresco Family — Real-World Learning V1 (review branch)

Status: experimental, no release. This branch is stacked on draft PR #120 and must not be merged or deployed without founder review.

## Truth boundary

- Issuer profiles: official investor-relations links for Shopify, Microsoft, Costco and Apple.
- SEC annual metrics: extracted from SEC EDGAR Company Facts API OFFLINE then bundled as a reviewed snapshot. Each displayed value includes USD, fiscal-year end, filed date and form. Absent facts remain unavailable, not fabricated.
- TradingView: official display-only widget, loaded only after a user's explicit click. This third party receives page URL, viewed ticker and IP. Keep its branding visible; prices may be delayed, and Cresco cannot use chart prices in calculations.
- Mission: 100/90 and 120/130 credits are INVENTED examples, unrelated to any company's SEC figures. Answers never grant permission, trade, update balances or touch My Key.
- Not built: brokerage, accounts, positions in real securities, live numeric quotes, user tracking, persistent identity, automatic refresh, purchases.

## Refresh SEC figures offline

Prerequisites: Node 22+, network access to data.sec.gov, actual organization and contact email for the SEC User-Agent.

In a separate clean checkout of this branch, open PowerShell from the repository root:

    cd apps/web
    node scripts/family-sec-snapshot.mjs --self-test
    $env:SEC_USER_AGENT = "RealOrganization contact@your-real-domain.tld"
    node scripts/family-sec-snapshot.mjs
    git diff -- src/lib/family-sec-snapshot.json

Substitute your real organization and email (do not commit credentials). The User-Agent is only sent in the SEC request. The importer downloads four companyfacts records sequentially and accepts annual fiscal durations only. It rejects CIK mismatch and does not combine metrics from different fiscal year ends. Import failure leaves the prior snapshot unchanged. Review the generated JSON before committing it.

IMPORTANT: The branch ships with an empty SEC snapshot initially (generatedAt null). No current numeric revenue or income is claimed until the importer is executed and the results reviewed. SEC annual data is not realtime.

SEC API guide: https://www.sec.gov/search-filings/edgar-application-programming-interfaces

## Validation checklist

1. Open /try/portfolio/companies. Four research cards should appear.
2. Before opting into a chart, there must be zero third-party or SEC requests from the browser.
3. Try the hypothetical revenue/profit exercise. No changes to Parent Key or practice credits.
4. Click Load TradingView chart. Confirm third-party widget renders; fallback official TradingView links remain available.
5. Go to Fictional practice. It still uses invented prices and positions.
6. With the initial empty SEC snapshot, no company-specific income or sales numbers should be displayed.
7. Re-run E2E for both desktop Chromium and mobile WebKit, test the isolated build and compare with PR #120 behavior.

The original PR #120 Windows launcher intentionally refuses untested app-source changes. Do not bypass or weaken its pinned-source guard. This feature branch requires its OWN exact-SHA CI/local validation before another Windows pilot.

## Release gates

- Do not modify Colosseum, Stocklana, public Family Workers or Cloudflare release configuration.
- No API key, wallet, account, direct market-data API or authority dependency.
- Do not derive practice valuations or market decisions from TradingView visual widget data; display only.
- Review SEC numbers for accounting-period compatibility, data accuracy and source validity.
- Check child privacy and TradingView attribution before any public rollout.
- No automatic merge, Cloudflare deployment or retargeting of parent PR #120.
