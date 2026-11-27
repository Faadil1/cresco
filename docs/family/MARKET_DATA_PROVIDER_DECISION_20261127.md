# Cresco Family: market-data provider decision memo (issue #132)

Date: 2026-11-27. Status: **BLOCKED. No licensed automatic prices.** No subscription, key, trial or purchase was made. The approved snapshot (`apps/web/src/lib/family-market-approved-snapshot.json`) stays `DISABLED`, and no price is bundled.

## What Cresco Family actually needs
- **Tickers:** 4 US common stocks: AAPL, MSFT, COST (Nasdaq) and SHOP (the Nasdaq listing, in USD).
- **Frequency:** one **end-of-day close** per ticker per trading day. Real time is not needed for an educational MVP.
- **Use:** shown **publicly** to children and parents in a free web app, used to work out **paper P&L** (derived data), and **cached** as a dated daily snapshot built offline. The child's browser never calls the provider.
- **Volume:** about 4 requests per day, roughly 90 per month (one request per ticker per day). With a weekly backfill, still under 200 per month.

The decisive question is therefore **licensing, not price or volume**: public display (redistribution), derived values and caching, for a product used by minors.

## Evidence (read 2026-11-27 from the providers' own pages)

| | Marketstack (apilayer / Idera) | Twelve Data |
|---|---|---|
| Free tier | 100 requests/month, EOD, **non-commercial only** ([llms.txt](https://marketstack.com/llms.txt)) | Basic $0, 800/day; personal plans are **individual, non-commercial** ([EOD guide](https://support.twelvedata.com/en/articles/12682324-end-of-day-eod-pricing-market-data)) |
| Lowest paid plan that allows commercial use | Basic **$9.99/month** (10,000 requests), with commercial use ([llms.txt](https://marketstack.com/llms.txt)) | Business plans (commercial pricing tab on [pricing](https://twelvedata.com/pricing); personal Grow from $29/month for comparison) |
| Showing prices to end users | **Not addressed on public pages.** The [service agreement](https://marketstack.com/agreement) has no redistribution clause. US data is licensed from **Tiingo, Inc.**, so upstream terms may apply. | **Explicit:** business plans are for internal use; *"External distribution to end users requires the Redistribution Rights add-on, or a separate written agreement"* ([EOD guide](https://support.twelvedata.com/en/articles/12682324-end-of-day-eod-pricing-market-data), [terms](https://twelvedata.com/terms)). The add-on price is not public. |
| Derived P&L, caching | Not addressed publicly | Not addressed publicly beyond the redistribution note |
| Response shape | V2 `eod` returns `close`, `date`, `exchange`, `currency` per symbol. The existing importer `scripts/family-marketstack-eod-import.mjs` already validates XNAS/NASDAQ, USD, date and freshness. | `time_series` returns `meta.exchange` "NASDAQ", **`meta.mic_code` "XNGS"** (Nasdaq Global Select), `currency` and `values[].close` |
| Data source | Tiingo, Inc. for US equities | Exchange-sourced; unconfirmed vs confirmed EOD prices |

**Findings:**
1. **Exchange code mismatch.** Twelve Data labels AAPL with the segment MIC `XNGS`, while our snapshot schema and importer expect `XNAS` (the Nasdaq operating MIC). Switching to Twelve Data would require an explicit, tested mapping from XNGS/XNMS/XNCM to XNAS. **No change made.**
2. **Shopify's exchange label.** Our company data lists Shopify as "NASDAQ / TSX". The app uses only NASDAQ:SHOP in USD and refuses TSX rows. This is consistent; no change.

## Total cost: what we know and what we don't
- **Marketstack:** the subscription would be $9.99/month (about $102/year billed annually). Unknown: whether public display and derived P&L are allowed on Basic, or need an Enterprise/custom agreement and possibly Tiingo's consent.
- **Twelve Data:** a business plan plus the **Redistribution Rights add-on**, priced by quote. Unknown: the add-on price, and whether EOD-only display for 4 tickers qualifies for a small or educational tier. A 20% educator discount exists on plans; it is unclear whether it applies to redistribution.

Neither total cost can be stated honestly until both providers answer in writing.

## Recommendation
1. **Send the same written questions to both** (Marketstack: https://marketstack.com/contact; Twelve Data: sales). The founder sends these, not Claude.
   - May we show daily end-of-day closes for AAPL, MSFT, COST and SHOP (Nasdaq, USD) to the public, including minors, in a free educational web app?
   - May we calculate and show derived values (paper portfolio value and gain or loss) from those closes?
   - May we cache one dated close per ticker per day in a static file served to users, and for how long?
   - What attribution is required, and where?
   - Exact total yearly price for this use, including any redistribution add-on or upstream (Tiingo / exchange) fees.
   - Any restrictions for users under 18 or for educational use.
2. **Choose the cheapest provider whose written answer covers all six points.** On current public information, Marketstack is likely cheaper if its Basic plan's commercial rights extend to display; Twelve Data is clearer about what it requires.
3. Until then, keep the **manual, dated, "user-entered (not verified)" price flow**, and keep automatic data visibly marked as unavailable. Built in this round:
   - Step 2 now shows a **price status line**: automatic prices "not available yet" when the snapshot is DISABLED, and a warning when the child's own price is more than 7 days old.
   - No new quote stack was added. The existing offline importer stays the only route, and it activates only with written rights, a private key and an approval reference, as before.

## What was not done (on purpose)
- No account, API key, trial or paid plan.
- No scraping of TradingView or any chart.
- No unofficial feed.
- No price bundled.
- No secret placed in client code or git.
