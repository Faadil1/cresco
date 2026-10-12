# CRESCO World’s Fair — Hosted Browser→API→Solana Live PASS

Date: 2026-10-03  
Status: **PROVEN LIVE HOSTED BROWSER CAUSAL PATH**  
Truth state: **OBSERVED**

## Public product

Frontend:
`https://cresco.faadil-casecraft.workers.dev`

API:
`https://keys-api-stocklana.faadil-casecraft.workers.dev`

Solana network:
`devnet`

Program:
`7pgPuPZSUUtFcvFtVGmS3piCE1bHY35kjb14vct9v45Z`

## Browser-triggered live proof

Workflow:
- repository: `Faadil1/cresco-worlds-fair`
- run: `37124741369`
- job: `111207650592`
- result: **SUCCESS**
- artifact: `11274434523`
- artifact digest: `sha256:ee3b8da1eeeb3a107f0a9e27b4bb5adc72484cd3dae24428cce0b1927b1dafe8`

Observed completion:
`2026-10-03T13:02:54.501Z`

Starting Mandate nonce:
`6`

Browser behavior:
- public `/worlds-fair` loaded;
- runtime state observed `Ready`;
- browser clicked **Run live authority sequence**;
- browser observed the real hosted `POST /api/v0.3/worlds-fair/run`;
- HTTP response status: PASS;
- receipt status: PASS;
- product state: `WORLD_FAIR_OPERATOR_LAB_LIVE`;
- UI rendered **7/7 live checks proven**;
- five Solana Explorer transaction links were visible in the browser;
- browser request failures observed: **0**.

## Canonical consequence ledger

All seven scenarios passed:

1. `standingAutonomy` — PASS
2. `softBoundary` — PASS / REFUSE / `PythNotionalExceeded`
3. `exactException` — PASS
4. `hardBoundary` — PASS / REFUSE / `InvalidOrcaProgram`
5. `evidenceFailure` — PASS / REFUSE / `PythMessageInvalid`
6. `rollback` — PASS / REFUSE / `AmountOutBelowMinimum`
7. `staleAuthority` — PASS / REFUSE / `StaleNonce`

Representative Devnet signatures exposed through the browser receipt:

Standing autonomy:
- `4L1MdH1JMsVdriVTpHfbmD7ZdeVnc4qXtWjvysmZjhXmsPj29eGUZaDd2H15WKH559bLNohW7NA6DisiQ8wihSjp`
- `2CGb1LTxnn3pYrJzndWLjoteYKUh9w8j44TvL6eDLpp52bg6ehsn3rVVTsjbcuUtA4C6VtmkViQnwD2paK4sHvqp`

Exact exception:
- execution: `4LyFADJekx6XTBjAjmScpD8Zh6MUUVraDYvuCKDDmdSA1vgQX52cGaVNRK9WBY2VWwCjJ2uMopf89BpfLMXRfY14`
- grant: `VDKKKNJdnMTic35vnoRbMajW8FyNEptUNdEC4h7TRvSEjtrQd2vjusSh1E5uL8mkHxEns3FnS7i4sL15RzXHX8z`

Policy transition:
- `as1KYWFQxmMRoFcmPET5oN4EKgts6kb54RSBRGr4KJ8Gxo7EDx8UaGhGpKtU4LX4RR41k32GArVkeJWuRptjuGw`

## Fresh-context self-serve check

A second Chromium context was created with:
- no cookies;
- no prior storage state;
- no reused browser session.

Observed in that fresh context:
- public CRESCO home reachable;
- public `/worlds-fair` reachable;
- runtime state `Ready`;
- live-run control visible.

Result:
`CLEAN_ROOM_BROWSER_SURFACE=PASS`

The clean-room step intentionally did **not** trigger a second live authority sequence.

## Truth boundary

This proves the complete technical causal path:

**public browser UI → public CRESCO API → live CRESCO/Orca Solana Devnet execution → bound receipt → browser-rendered 7/7 consequence ledger.**

It also proves that a fresh browser with no prior state can reach the product and the live-run control.

It does **not** prove:
- an independent human judge has personally used the product;
- representative operator demand;
- willingness to pay;
- adoption;
- mainnet readiness;
- production custody;
- audited production security.

External-human/operator validation remains a distinct validation gap.
