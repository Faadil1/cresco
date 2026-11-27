# CRESCO Product Requirements

Version: 0.2
Status: current

## User promise

**Financial independence should not happen all at once.**

A young person should be able to learn in context, practice safely, and act independently inside explicit family-set boundaries without asking for permission on every in-bounds action.

## Product principle

> Learn in context. Act freely inside bounds. Ask for more freedom only at the boundary.

## Primary user model

A guardian creates a versioned **Key**, technically represented by a Mandate.

The Key defines:

- allowed assets;
- allowed actions;
- per-action limit;
- per-period limit;
- expiry;
- status;
- optional market conditions;
- version;
- nonce.

Inside the Key, the young person acts without per-action approval.

At the boundary, the action refuses and the user can adjust, practice, or ask.

The guardian has three explicit choices:

1. Not this time.
2. Allow this exact request once.
3. Widen the standing Key.

Only the third choice expands standing authority.

## Exact Allow once

Allow once is not a smaller temporary Key and not a ceiling.

It is bound to one request and one exact action.

Canonical proof:

- standing action limit: $10;
- requested action: $12;
- guardian approves $12 once;
- changed $11 attempt: REFUSE;
- exact $12 attempt: ALLOW;
- permission: USED;
- standing Key: v7 to v7;
- replay: REFUSE.

## Main journey

1. User sees My Key in plain language.
2. Contextual learning and Practice are available without changing authority.
3. User performs an in-bounds action.
4. CRESCO evaluates standing authority and required market evidence.
5. In-bounds action ALLOWs without guardian approval.
6. User attempts an out-of-bounds action.
7. CRESCO REFUSEs in the execution path.
8. User may adjust, practice, or create a private boundary request.
9. Guardian chooses Not this time, Allow once, or Widen the Key.
10. Exact one-time permission can execute once without changing the standing Key.
11. Widen creates a new Key version and invalidates stale authorization material.
12. Pyth may price, restrict, expire, or invalidate. It never grants authority.

## Product invariants

- Proposal is not authority.
- Evidence is not maturity.
- Profit is not decision quality.
- Silence is not consent.
- UNKNOWN is not eligible.
- Practice is not custody.
- Learning completion is not authority.
- Learning, XP, P&L, badges, and AI scores never auto-widen authority.
- Market evidence may restrict or stop. It never grants or widens authority.
- Old authorization material cannot survive a new Mandate version or nonce.
- Allow once must bind the exact approved action and be consumed after one successful use.
- A token representation is not automatically conventional shareholder title.
- User eligibility is separate from asset representation.
- Private family reasoning is not public-chain data.
- Pending or unknown execution is never shown as confirmed success.

## Learning

Learning is short and contextual.

Useful moments include:

- first use of an unfamiliar asset or action;
- Practice;
- a boundary refusal;
- a market-condition change;
- representation literacy;
- post-action review.

Learning can improve understanding. It cannot mint permission.

## Representation literacy

CRESCO separates four questions:

1. What company or asset is this?
2. What does this token or representation legally/economically represent?
3. Is this user eligible to use it?
4. Does the current Key authorize this action?

A positive answer to one question does not imply the others.

## Technical success criteria

The build must truthfully prove:

1. an in-bounds action executes without guardian approval;
2. an out-of-bounds action refuses in the capital path;
3. a guardian can authorize one exact exception without widening the standing Key;
4. a changed exception refuses;
5. the exact exception executes once;
6. replay refuses;
7. explicit widening changes version/nonce;
8. stale authorization refuses;
9. required market evidence fails closed when stale or unavailable;
10. no learning or market score can widen authority;
11. uncertain execution remains PENDING or UNKNOWN;
12. at least one real negative event remains in the public evidence record.

## Build-quality requirement

Every build follows the five-part failure pattern defined in [docs/BUILD-QUALITY-RULES.md](../docs/BUILD-QUALITY-RULES.md).

**Real failure > fake success.**

---

## Family simulation — v0.3 addendum (DRAFT, pending owner review)

Status: PROPOSED by PBPD workspace R2, 2026-11-27. Additive to `product/PRD.md` v0.2; removes or weakens nothing.
Prepared for owner review on an isolated Cresco draft branch. This draft does not adopt or expand authority. Source: [PBPD R2 proposed addendum](https://github.com/Faadil1/faadil-agent-system/blob/528edd1a8f10529291222e2d9f7bb1bd8e5576bf/projects/cresco-family-canon-pbpd-continuity-2026-11-23/artifacts/FAMILY-PRD-ADDENDUM-v0.3.PROPOSED.md).
Every number below was read from the code at `e351ea3`. None of it is new scope.

## Why
v0.2 defines the Key, Allow once and the invariants. The Family obligations that #129/#131 build and test exist only in
`docs/family/*.md` and in the code. A PRD-level completeness check therefore can't see them.

### A. Two strictly separate practice ledgers
| Ledger | Initial | Source |
|---|---|---|
| Fictional practice credits | **100** invented credits (`remainingCredits = 100 - saved - spent`) | `apps/web/src/lib/family-public-practice.ts` |
| Real-company paper portfolio | **$1,000 imaginary USD** (`INITIAL_PAPER_CASH_CENTS = 100000`) | `apps/web/src/lib/family-real-market-sandbox.ts` |

- A paper trade never moves credits, and a credit action never moves paper cash.
- Ledger transactions do not expand the standing Key or Parent limits. An explicitly confirmed new-family reset is the separate, simulated session-initialization action below.

### B. Simulated Parent / My Key defaults
Key v1, nonce 1, `maxPerAction` 15, `maxPeriod` 60, allowed `ORC, MKT, BKT`. It is an educational simulation, not a verified guardian identity or real authority.

### C. Paper-practice rules (from REAL_MARKET_PAPER_PRACTICE_V1)
- Prices are user-entered, dated, labelled USER-ENTERED, NOT VERIFIED. There is no scraping and no live quote.
- A dormant licensed end-of-day path exists (`apps/web/src/lib/family-market-approved-snapshot.json`, importer per `docs/family/REAL_MARKET_COMPACT_PROVIDER_V2.md`). It is `DISABLED` with no quotes, so **no automatic price is currently shown**. Enabling it requires separately verified display, derived-data and cache rights plus owner approval. When enabled, it is labelled DATED CLOSE, NOT LIVE. This addendum does not authorize it.
- Trades fail closed on: missing price, overspend, selling shares not owned, invalid, future or reversed dates.
- No persistence, cookies, server writes, identities, market requests or telemetry.

### D. Informed global reset
- A destructive reset of both tracks requires an explicit dialog. **Cancel**, Escape or the backdrop are a no-op: the paper book, credits and Key stay unchanged.
- **Confirm** clears both tracks: credits back to 100 / Key v1, paper back to $1,000 with no holdings.
- Profile reset returns to `/try`; starting again follows the onboarding path (goal → interests → ready → Home). Lab reset stays in Lab and returns to Child/Home and Parent Overview; entering the illustrated story after reset starts onboarding.
- The paper portfolio can also be restarted on its own.

### E. Acceptance additions (Technical success criteria 13–16)
13. Paper actions leave the credit ledger unchanged, and the reverse holds.
14. Cancel on the global reset mutates nothing on either track.
15. Confirmed reset restores both initial states; Profile returns to `/try`, Lab remains in Lab, and the next illustrated-story start requires onboarding.
16. Each criterion passes on iPhone WebKit and desktop Chromium at the exact candidate tree.

### F. Scope clarification
- Criteria 9 (market evidence fails closed), 11 (PENDING/UNKNOWN execution) and 12 (public negative event) belong to the capital / World Fair path. The offline Family simulation does **not** satisfy them, and they stay OPEN at the overall Cresco/capital program level; no global descope or eligibility change is authorized.
- World Fair `docs/worlds-fair/product/PRD.md` is a distinct program. Its evidence is never Family proof.

### G. Open launch gates carried forward unchanged
Paper-practice gates 1–5; founder visual and physical-device acceptance; minors' privacy review; no child-facing public deployment without separate authorization.
