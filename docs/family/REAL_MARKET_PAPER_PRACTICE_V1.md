# CRESCO Family — Real-company paper portfolio v1

Status: Review only. Separate draft PR stacked on #122 (itself stacked on #120).
No merge. No Cloudflare deploy. No live quote, brokerage, wallet or market-data key.

## The product loop

1. Open Portfolio > Real companies or Explore > Real companies.
2. Choose Apple, Microsoft, Costco or Shopify. The company research desk contains verified, *dated* annual SEC statements and an optional TradingView display-only widget.
3. Enter a stock-price reference **yourself**, including its USD amount, calendar date and where you looked. The UI labels it **USER-ENTERED, NOT VERIFIED**. It never populates a quote automatically.
4. Simulate paper buys and sells in increments of 0.01 imaginary shares against a separate **$1,000 USD imaginary budget**.
5. See holdings, imaginary cash, simulated equity, unrealized change, realized trades and an audit-like local activity list.
6. Enter a newer reference price to recalculate the mark-to-market value. No additional trades occur merely because a price changed.
7. Restart the paper portfolio independently or start a new Family story to clear it together with the original fictional-credit story.

## Why the user enters a price

TradingView's public display widgets do not supply a usable data API for our own calculations. A free personal-use stock API key generally does not grant display/redistribution rights in a public family product.

Therefore: **No pretending live prices.** There is no automatic current quote and no built-in prices for actual listed companies. The child supplies price/date/source; the result is an illustrative simulated P&L based on that input. It is not verifiable market performance.

When an appropriately licensed market data API is obtained, add a server-side validated snapshot provider and separate it from the user-entered reference flow. Keep secrets on the server, market-session and freshness labels, provider attribution, and a no-quote/no-trade state on API failure. Do NOT scrape TradingView or unofficial Yahoo endpoints.

Official TradingView FAQ: https://www.tradingview.com/widget/
Twelve Data external redistribution requirements: https://support.twelvedata.com/en/articles/9935903-us-equities-market-data

## Financial isolation and privacy

- Two separate ledgers: Fictional practice (100 invented credits + simulated Parent/My Key) is untouched; Real company paper practice ($1,000 imaginary USD) is an isolated reducer.
- No connection to brokerage, custody, banking, payments, wallet, Pyth, Solana, trading API or authority.
- No persistence, cookies, server writes, user identities, external market request or telemetry for the paper portfolio. In-app route navigation preserves session in memory; browser refresh or new-family reset clears it.
- Quotes are unverified user inputs, validated as finite positive USD cents, canonical non-future calendar dates, non-decreasing date for subsequent price updates and allowlisted reference labels. Invalid trades/quotes fail closed.
- Paper buys cannot overspend, sell nonexistent shares, create nonpositive fractional-cent costs or use missing reference prices.
- Market data availability does NOT confer financial authority; practice gains do not affect Child learning badges or Parent limits.
- TradingView chart itself remains opt-in and necessarily contacts a third party only when explicitly opened. Its display content is never scraped for valuation.
- This does not authorize child-facing public deployment; parent review and minors' privacy assessment remain required.

## Tests

- Pure Vitest: initial state, no fabricated quotes, invalid/future/reversed dates, no overdraw/short sale, fractional buys, mark-to-market, partial sell cost basis, realized/unrealized P&L, independent reset.
- Public Family Chromium/WebKit Playwright: market entry flow, paper buy/sell, before/after valuation, blocked actions, route continuity, no market/API outbound requests, original fictitious credits unchanged.
- Other inherited full Family tests must continue to pass, including Parent/My Key and the legacy lab shared-state test.
- Windows isolated build + localhost smoke is NO DEPLOY. No claim of licensed auto-price feed or real-device acceptance.

## Remaining launch gates

1. Validate behavior and visual clarity on founder's own Windows machine and a physical phone.
2. Obtain actual public display/redistribution/derived-data rights before replacing manual entry with any automatic US stock feed.
3. Review child-facing educational and privacy safeguards and Parent mode; do not imply that these practice actions represent parental approval.
4. Build safe handling of stock splits, dividends, adjustments and currency effects before providing historical investment-performance claims. V1 models no fees, dividends or corporate actions.
5. Avoid misleading live/up-to-date labels; dated input is all that this prototype has.
