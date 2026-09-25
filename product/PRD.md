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
