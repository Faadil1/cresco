# Cresco — Benita Deployment Gate

Date: 2026-09-25
Status: REQUIRED BEFORE PROMOTING THE SUBMISSION BUILD

## Deployment base

Deployment candidate = **Benita's Cresco version + all proven deltas already merged since her baseline**.

Do not deploy a Visual Lab branch as the product.
Do not rebuild Cresco from a visual concept.
Do not remove an existing Benita capability because a visual concept does not show it.

## Gate A — Benita structure preserved

Verify every item before promotion:

- Welcome / onboarding / goal setup
- Home
- Practice / Money mode switch
- My Key
- Explore
- Learn / lessons
- Practice portfolio
- Money portfolio
- AAPL invest flow
- Boundary refusal
- Ask for more room
- Request status
- Parent / guardian sign-in
- Parent dashboard
- Guardian request decision
- Limits
- Pause / resume
- Widen the Key
- 7 / 30 day parent view
- Learning-minute bars
- Profile
- Goals
- Parent link
- Wins / badges
- About / proof
- Tessera representation learning
- Pyth states: FRESH / STALE / UNAVAILABLE
- Confirmed Devnet receipt + Explorer
- Loading / empty / error / pending / unknown states
- Mobile layouts
- Keyboard / focus behavior
- Reduced motion

A missing item is a BLOCKER unless its removal was explicitly approved and its replacement covers the same job.

## Gate B — post-Benita product deltas present

- Visible Key vN standing-authority object
- Inside = independent action
- Boundary = loud, understandable refusal
- Adjust / Practice / Ask next actions
- Not this time
- Allow once
- Widen the Key
- Allow once leaves standing Key unchanged
- Widen creates Key vN+1
- Learning / XP / P&L / AI never widen authority
- Contextual learning at useful moments
- My Key history focuses on boundary events
- Parent experience avoids surveillance framing
- Practice unmistakably separate from Money
- Pyth can restrict / stop, never grant authority
- Representation != eligibility != authority

## Gate C — canonical exact-action proof represented truthfully

Canonical Devnet run: 36150024852

Required truth:
- guardian-approved exact $12 request
- changed $11 attempt -> REFUSE / AllowanceActionMismatch
- exact $12 -> ALLOW
- standing Key v7 -> v7
- permission -> USED
- replay -> REFUSE / AllowanceAlreadyUsed

The UI may simplify the explanation, but it must not contradict this behavior.

## Gate D — backend/runtime truth

- Production API points to the current KEYS Cloudflare backend
- Current program id remains ABjE6V5q9VbD3CAHDXxvztY5kXQmDXHRcEP1kZ4KSSfk
- Money execution remains demo SPL token / Solana Devnet
- AAPL remains the current proven Money execution lane
- No mainnet claim
- No real brokerage / custody / minor securities claim
- Pending or unknown execution never renders as confirmed success
- Unavailable market data is never labeled live

## Gate E — visual preservation

Before replacing any Benita visual mechanism, answer:
1. What job does the current Benita element perform?
2. What replaces it?
3. Is the replacement clearer, more memorable or more coherent?
4. Does it preserve mobile/accessibility behavior?
5. Does it preserve the same functional state coverage?

If any answer is unclear, keep Benita's implementation for the submission build.

## Gate F — final smoke

The promoted deployment must complete:

My Key
-> source-backed Learn / Practice
-> in-bounds ALLOW
-> boundary REFUSE
-> Ask for more room
-> Guardian Allow once
-> changed-action REFUSE
-> exact-action ALLOW
-> permission USED
-> replay REFUSE
-> proof / receipt

Widen remains available as a separate path and must visibly create a new standing Key version.

## Promotion rule

**No deploy is considered final until every gate is checked against the actual deployed URL, not only the repository.**

Final operating rule:

> Benita's complete product first. Merge every proven improvement. Verify no regression. Then improve the visual system without losing anything.
