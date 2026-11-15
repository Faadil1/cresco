# Cresco Family Market Lab V2 — Compact UX + licensed EOD adapter

**Status: REVIEW ONLY.** Stacked on draft PR #123, itself stacked on #122 / #120. Never deploy automatically. The public Workers, original 100-credit Fictional practice, Parent / My Key and wallet layer are untouched.

## What is ready in the code

- A 4-company real-paper-practice page with a **compact company selector**, a side-by-side **TradingView chart and paper-trade desk** on desktop and a stacked mobile layout. Official SEC financial figures and the learning mission follow the primary practice workflow.
- No duplicate chart. Third-party TradingView embeds still load only after the visitor clicks an explicit button; no cookies, analytics, identity or market requests are added by our paper ledger.
- The **separate $1,000 imaginary USD** ledger from #123, with fractional paper shares, P&L, paper activity and reset.
- A Marketstack EOD **offline import script** that performs a single multi-symbol HTTPS request after the operator explicitly confirms independently verified rights to display, redistribute, calculate derived P&L from and cache market data.
- STRICT fail closed: absent rights, API key, provider metadata, current timestamp, valid price or all four records, the importer stops without changing the last snapshot. Keys and private rights reference are never bundled or logged.
- Initial \`family-market-approved-snapshot.json\` is DISABLED / empty. **No automatic stock price is currently available in the app.** When an appropriately licensed snapshot is deliberately generated and reviewed, the browser-only Family bundle can use its latest EOD close automatically, labelled **dated close, not live**. Manual quotes remain supported and visibly unverified.

## Current pricing and legal gates

Marketstack Basic advertises 10,000 calls/month, **commercial use**, EOD data, historical data and IEX intraday at US$9.99/month. That is NOT, by itself, evidence that Cresco can redistribute quotes to minors, derive P&L, or bundle/copy a dataset. Seek explicit provider confirmation and applicable exchange rights **before** setting the license gates.

Official references:
- https://marketstack.com/pricing
- https://marketstack.com/agreement
- https://docs.apilayer.com/marketstack/docs/api-documentation
- https://docs.apilayer.com/apilayer/docs/getting-started-9

## How to use the adapter — operator only, not in CI

The *pure fixture self-test* requires neither credentials nor network:

    cd apps/web
    node scripts/family-marketstack-eod-import.mjs --self-test

Only **after legally verified permissions and an approved API key** should an operator supply these private environment variables, not paste them into GitHub commits:

    MARKETSTACK_API_KEY=<private_key>
    CRESCO_EOD_DISPLAY_RIGHTS=CONFIRMED
    CRESCO_EOD_DERIVED_RIGHTS=CONFIRMED
    CRESCO_EOD_CACHE_RIGHTS=CONFIRMED
    CRESCO_EOD_LICENSE_REFERENCE=<internal_approval_reference>

Then run:

    node scripts/family-marketstack-eod-import.mjs

The importer only handles these US NASDAQ USD tickers: AAPL, MSFT, COST and SHOP (not Canadian SHOP/TSX). It requests Marketstack v2 \`/eod/latest\`, requires exchange XNAS/NASDAQ and USD when provided, validates dates <= 7 days old and in the past, and requires exactly one valid closing quote for each ticker. This intentionally rejects incomplete or ambiguous data. Verify responses against actual provider metadata before treating this adapter as launch-ready; no live credentialed call has yet been verified.

IMPORTANT: Do not check in a price snapshot just because the importer succeeds. Human review, entitlement proof and operational refresh cadence must still be agreed. Automatic **browser network polling is not built**; future refreshes require an operator-managed scheduled import and approved deployment flow. A stale snapshot over 7 days will not prefill a paper portfolio.

## Testing / non-goals

- Typecheck, lint, copy lint, unit, isolated Family build, desktop Chromium + iPhone WebKit tests, Windows launch, no-deploy route checks.
- Marketstack importer self-test uses synthetic fixture records, **not fictional prices shown to users**.
- Existing tests still confirm no external requests before the optional TradingView action, original fictional credits unchanged and no real trades.
- No account, financial institution, buying shares, API market data redistribution, real-time intraday price, split/dividend/FX accounting, or public release.

## Founder acceptance

On the new local branch open \`http://127.0.0.1:3100/try/portfolio/companies\` (type URL exactly, no markdown asterisks), choose each company and confirm: chart and input desk near one another, no quote automatically prefilled before license, simulated buy and paper portfolio remaining independent, SEC official report lower on the page, no real-money controls. Check desktop and phone.
