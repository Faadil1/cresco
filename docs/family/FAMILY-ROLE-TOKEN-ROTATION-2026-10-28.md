# Family role link replacement — source candidate

Date: 2026-10-28  
Status: **DRAFT — source-only**; depends on PR #89 and the original #85–#88 chain. No merge, deploy or chain writes.

## Problem / action / consequence

Family role links carry bearer capabilities. Before this patch, a leaked Teen or second-parent link remained valid until the workspace was lost. The Parent had no self-service way to invalidate a copied URL, including links still available in browser history, messages and screenshots.

A Parent-only role rotation API replaces the hashed token for a single **Family** workspace. The old link immediately stops authorizing future server reads/writes. The replacement token is generated with cryptographic randomness and exposed in the HTTP response **once**; only its SHA-256 hash is persisted. No bearer is written into event history, logs or onchain state.

API: `POST /api/v0.4/worlds-fair/workspaces/{id}/roles/{role}/rotate` with exact-workspace principal bearer, target `operator` (Teen) or `risk` (second parent). `principal` token self-rotation is **not implemented**; it needs stronger guardian/wallet or account recovery identity. Capital workspace rotation is unavailable.

The Cloudflare per-workspace write lease includes both role rotation paths, serializing against writes under this runtime. There is no Solana transaction, payout, wallet transaction or onchain mandate authority change. Invalidated bearer access does **not** undo a previously submitted or already-signed transaction; its actual state remains governed by the onchain program and the UNKNOWN recovery hold.

## Family product UX

The Parent desk shows a two-step **Replace Teen access / Replace second-parent access** control with an irreversible effect warning. The new link is kept only in the current UI session and offered via a copy button. The Parent's browser does not acquire the Teen or second-parent capability, and the new bearer is not placed in persistent localStorage.

If the replacement response is lost after the server commits, the prior link can already be invalid while the new link was never received. The Parent should initiate another replacement to get a fresh link; do not infer a failure from a lost response or reuse the old link. Client exceptions must be surfaced; there is no unsafe automatic retry.

## Evidence gate register

| Gate | State | Evidence |
| --- | --- | --- |
| Valid Parent may replace Teen or second parent | TEST CANDIDATE | HTTP regression |
| Wrong role, wrong workspace and anonymous blocked | TEST CANDIDATE | HTTP regression |
| Prior token fails reads and intended writes after replacement | TEST CANDIDATE | HTTP regression |
| New token shown once, only hash stored, audit token-free | TEST CANDIDATE | Durable store + history tests |
| Cloudflare per-workspace mutation lease | TEST CANDIDATE | workflowWriteScope regression |
| Parent can confirm and copy without merging privileges | TEST CANDIDATE | Web Vitest |
| Loss of HTTP response | SOURCE REVIEW REQUIRED | Repeat rotation manually; explicit product notice |
| Actual hosted runtime revocation / cache boundaries | BLOCKED | Independent review, authorized exact-SHA deploy |
| Stolen principal bearer, account recovery, wallet verification | BLOCKED | Separate stronger identity protocol |
| Person / age / legal guardian identity | BLOCKED | Identity model not established |
| Actual two-device Devnet Family lifecycle | BLOCKED | Authorized proof, signatures and receipts |
| Mainnet and real asset operations | N/A | No mainnet or brokerage claim |

Security caveat: a compromised *principal* bearer can invoke this endpoint; it is not a substitute for account identity. Role-token rotation is revocation of offchain API capability only; it is not revocation of an onchain grant or past signature. The Parent must use separate user devices and avoid accidental sharing, XSS, browser extensions and untrusted clipboard workflows. The original issue #87 remains open until the additional identity and hosted-runtime gates are independently proven.
