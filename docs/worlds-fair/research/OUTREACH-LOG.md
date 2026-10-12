# Discovery Outreach Log

Status: FIRST_INTERVIEW_COMPLETED  
Date: 2026-09-27

| Priority | Lane | Target | Contact surface | Status | Sent | Response | Interview | Evidence |
|---|---|---|---|---|---|---|---|---|
| 1 | Agent / Competitor Discovery | Eric Lovold / Sanction | [contact redacted] | INTERVIEWED | 2026-09-26 · Gmail msg `[message id redacted]` | 2026-09-27 · Positive response | 2026-09-29 · Google Meet interrupted; continued on Zoom · full Meet + Zoom record synthesized | Founder/expert evidence only; not customer validation |
| 2 | Agent / Exception Shape | Session.money / LazorKit builders | [contact redacted] (route request) · Telegram @sessionmoney_wallet · X @session_money | SENT_EMAIL_ROUTE_REQUEST | 2026-09-26 · Gmail msg `[message id redacted]` | — | — | — |
| 3 | Treasury | Sean Ganser / Squads | [contact redacted] | SENT | 2026-09-26 · Gmail msg `[message id redacted]` | — | — | — |
| 4 | Trading | Ellipsis Labs / Phoenix | [contact redacted] | SENT | 2026-09-26 · Gmail msg `[message id redacted]` | — | — | — |
| 5 | Trading | Ergonia Trading | [contact redacted] | SENT | 2026-09-26 · Gmail msg `[message id redacted]` | — | — | — |
| 6 | Trading / Competitor Discovery | Primer Systems / Vault | [contact redacted] | SENT | 2026-09-26 · Gmail msg `[message id redacted]` | — | — | — |

## Eric Lovold / Sanction — response note

Eric accepted a 15-minute conversation and explicitly framed what he can provide:
- Sanction is still early;
- he can share design decisions;
- he can share what they are learning through testing;
- he cannot yet claim established user patterns;
- the approval → execution gap is one of the areas they are actively examining.

Interpretation:
- HIGH-VALUE expert/competitor discovery;
- NOT customer validation;
- NOT evidence of willingness to pay;
- NOT evidence that a recurring user workflow is established.

Interview focus:
1. policy change after approval but before grant redemption;
2. one-use grant vs temporary session;
3. attempt vs completion semantics;
4. whether Policy Diff/minimal authority delta matters;
5. whether enforcement should sit at the execution/capital path;
6. what Sanction intentionally does not solve.

## Message purposes

### Sanction
Kill/save the Agent lane by testing:
- one-use grant vs temporary session;
- policy change after approval but before redemption;
- Policy Diff value;
- attempt vs completion semantics;
- missing customer needs.

### Session.money / LazorKit
Run the Exception Shape Test:
- why session instead of exact action;
- common duration/cap/scope;
- policy/security change during active session;
- whether exact-once is ever preferred.

### Squads
Run the Treasury Reconstruction Test:
- last legitimate transaction above Spending Limit;
- Proposal vs Config Transaction;
- whether temporary standing authority is used;
- stale approvals after security/config changes;
- value of explicit exception delta.

### Ellipsis / Phoenix
Run the Trading Reality Gate:
- last legitimate order blocked by risk control;
- exact trade vs temporary risk envelope;
- override latency;
- current OMS/risk-engine adequacy;
- stale-policy semantics;
- value of atomic onchain override + execution.

### Primer Systems
Test:
- what happens when a legitimate trade exceeds a hard per-trade cap;
- exact one-trade exception vs policy edit / temporary envelope;
- why some Vault rules are hard rejects while others escalate.

## Status values

- READY
- SENT
- SENT_EMAIL_ROUTE_REQUEST
- RESPONDED
- TO_SCHEDULE
- SCHEDULED
- INTERVIEWED
- NO_RESPONSE
- DECLINED

## Evidence rule

An outreach being sent or accepted is **not** customer validation.

Only concrete workflow evidence may update:
- REAL_PROBLEM;
- EXCEPTION_SHAPE;
- COMPETITIVE_RESIDUAL;
- PULL;
- CONCEPT_LOCK readiness.


| 7 | Wallet / Execution | Fordefi | [contact redacted] | SENT | 2026-09-29 · Gmail msg `[message id redacted]` | — | — | Test exact exception vs policy edit / temporary limit |
| 8 | Trading Operator | Keyrock | [contact redacted] | SENT | 2026-09-29 · Gmail msg `[message id redacted]` | — | — | Direct operator workflow after legitimate risk/policy breach |
| 9 | Solana Institutional / Curator | Kamino | [contact redacted] | SENT | 2026-09-29 · Gmail msg `[message id redacted]` | — | — | Test mandate update vs temporary / one-off exception |

## Wave 2 — post-Sanction

### Fordefi
Core question:
What happens when a legitimate transaction breaches a standing policy limit but the team still wants that exact transaction to execute?

### Keyrock
Core question:
What does a real trading desk do after a legitimate action hits a wallet/risk/notional/approval boundary?

### Kamino
Core question:
If a curator wants an action outside the current risk mandate without permanently changing the mandate, what is the operating model?


### Eric follow-up sent 2026-10-01

- Recipient: `[contact redacted]`
- Gmail message: `[message id redacted]`
- Purpose:
  - thank him for the Sanction/CRESCO conversation;
  - reference the governance/ledger vs execution-layer distinction;
  - ask for the operator/dev-shop introductions he mentioned;
  - invite any additional follow-up thoughts after seeing CRESCO.
- Tone: light follow-up, no pressure, no pitch.
