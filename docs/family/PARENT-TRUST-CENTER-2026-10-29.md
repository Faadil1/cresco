# Family Trust Center — first parent comprehension gate

**Date:** 2026-10-29  
**Status:** SOURCE + TESTS, no hosted Family build. **Never merge to Colosseum main.**

## Why this exists

The first Family-only screen must not ask parents to trust an unexplained crypto app. The initial team/coaching hypothesis is that guardians should know what is fictitious, what is technical Devnet work, what a child may practice independently, and what a parent approval actually authorizes.

It should be testable with consenting **adult** caregivers even before a real youth onboarding pathway exists.

## Implemented source

- `apps/web/src/components/family-parent-trust-center.tsx` — six expandable disclosures and a three-question local comprehension self-check.
- `apps/web/src/components/family-only-home.tsx` — new Trust Center section before the existing local Teen/Parent practice example; main CTA goes to the trust section.
- `apps/web/src/components/family-parent-trust-center.test.tsx` — disclosure visibility, correction of misunderstandings, no false consent and no network calls.
- No new URL, API integration, credential, analytics, storage, transaction, funding, legal-status or parent-identity state.

## The six topics

1. **Imaginary credits are not money.** No deposits, withdrawals, yield, stock purchase or brokerage service in the practice illustration.
2. **Blockchain explained.** Solana Devnet technical work exists but is not financial production clearance.
3. **Teen agency is scoped.** Safe pretend saving is independent; parent may approve or decline a conversation, not a securities order.
4. **Role versus identity.** Wallet possession ≠ legal guardianship; no claim of age verification.
5. **Potential real risks.** Stablecoin/crypto/securities loss, issuer/custody/rights/fees/eligibility would require separate disclosures and legal gates.
6. **Privacy without overclaiming.** Trust Center doesn't request names, ages, wallets or contact details; its own quiz is in-memory. The separate technical desk is NOT being represented as a privacy-cleared child account. Do not enter a child's information.

## Adult feedback tasks, not yet performed

Offer this component to 5–8 consenting *adult* caregivers using fictional youth scenarios and record, without children's information:
- Can they tell the difference between fake practice credits and a USDC holding?
- What do they think approving a request does?
- Can they explain why a wallet signature doesn't establish guardianship?
- Which disclosure was unclear, especially on mobile?
- Would they prefer a real staffed human route, scripted help, or a clearly identified optional AI tutor, and why?
- Which fact would stop them from letting a young person try an eventual privacy-cleared learning app?

The three yes/no questions are a **self-check**, NOT a scored regulator-certified assessment, not verified guardian consent and not permission to invest. They do not persist or transmit answers.

## Explicitly out of scope

- No real financial service, custody, yield, KYC, identity verification or agent.
- No login, cross-device role proof, backend action or financial API.
- No false “live human chat” or AI product button. Those need separately approved support/privacy plans and actual staffing.
- No lifting the Family-only route guard to expose historical /start, /home or /parent routes.
- No data or genuine minors enrolled.

## Release / communication gates

- New branch `family/parent-trust-center-2026-10-29` is based on PR #99's validated draft head; PR should target that branch, not main.
- CI of this exact head must pass Node, Web, Family Cloudflare dry-run; success validates source/build only.
- The independent Family Cloudflare deployment remains blocked by issue #95 pending identity/secrets/role/security/recovery validation. Product loop and adult tests tracked in #98.
- Any X update must say “prototype / work in progress” and not give a live Family URL or imply real parent accounts.

**Truth: PARENT_DISCLOSURE_SOURCE_READY; HOSTED_NOT_VERIFIED; FAMILY_FINANCE_NOT_AUTHORIZED.**
