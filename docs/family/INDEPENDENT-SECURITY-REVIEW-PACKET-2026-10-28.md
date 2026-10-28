# CRESCO Family — independent security review packet

Date prepared: 2026-10-28  
Target: [draft PR #92](https://github.com/Faadil1/cresco/pull/92) and the complete stacked Family changes #81–#92.  
Status: **PREPARED, NOT SUBMITTED TO AN INDEPENDENT REVIEWER**. A source author/assistant is not an independent reviewer.

## Goal and authority boundary

Evaluate **Family-first, delegated-authority on Solana Devnet**. Audit the separation between offchain role bearer capabilities, authenticated wallet signature proofs, onchain guardian powers and actual user/legal guardian identity. There are no claims of KYC, real custodial suitability or real-money compliance.

No reviewer should receive a raw role token, creator enrollment secret, recovery challenge signature, seed phrase, wallet private key or Devnet funding credential. Do not paste sensitive payloads in a GitHub issue or review comment.

## Review target / reproducibility

- GitHub [PR #92](https://github.com/Faadil1/cresco/pull/92), stacked on #91 and preceding dependencies. Pin and record the exact HEAD commit **after** any further edits.
- Existing cumulative audit: `docs/family/CUMULATIVE-INTEGRATION-REVIEW-2026-10-28.md`.
- Cumulative regression tests: `test/worlds-fair-principal-recovery.test.mjs`, `test/worlds-fair-workflow-http.test.mjs`, `apps/web/src/app/worlds-fair/desk/page.test.tsx`, `apps/web/e2e/worlds-fair-desk.spec.mjs`.
- Local verification: `npm ci && npm test`; Web app build/lint/unit/WebKit checks from the actual workflow pinned to the PR HEAD. GitHub CI pass is evidence of **modelled code behavior**, not production proof.
- Do not compare #92 diff **only** against #91 when deciding release readiness. Review the entire #81–#92 stack and exact deployed API/Web versions together.

## Priority review assignments

| Severity hypothesis | Questions / attempted exploit | Mandatory evidence |
| --- | --- | --- |
| CRITICAL / P0 | Can a stolen Parent role link or browser localStorage token bind a replacement wallet without the separate creator enrollment proof? Can the code leak via logs, redirects, errors, the Family bridge, analytics or copyable URLs? | Trace creator response through storage, JS, HTTP and actual browser; demonstrate refusal |
| CRITICAL / P0 | Does wallet recovery rotate all three role tokens exactly once? Can a signed challenge be replayed, raced, copied to another workspace, or reused after a lost HTTP response? | Inject storage failures before and after durable commit; prove unalterable replay barrier |
| HIGH / P1 | Can a compromised Teen/second-parent bearer read private Parent information or access approved actions? Can an old link work after rotation/recovery? | Role-by-role GET/POST matrix on same and different workspaces |
| HIGH / P1 | Can a malicious website call read/write APIs with CORS, fetch without Origin or abuse public challenge endpoints? Is CSRF meaningful for explicit bearer auth? | Browser origin matrix, cache headers, deliberate missing/forged origin study |
| HIGH / P1 | Can an unauthenticated requester exhaust CPU/DO/KV or repeatedly create/retrieve recovery challenges for known workspace IDs? | Rate / provider guard behavior and production abuse budget, no load tests against shared live host without permission |
| HIGH / P1 | Does recovery of the offchain Parent bearer grant, widen, replay, or undo authority in the Solana onchain capital path? What happens with pending UNKNOWN transactions? | Real Devnet gated signatures and replay/mandate receipts with disposable accounts only |
| HIGH / P1 | Can replayed first-bind `walletBindingMessage` (timestamp but no nonce) cause any new security effect? Does wallet loss leave legitimate families locked out? | Threat model and documented fail-closed recovery policy |
| HIGH / P1 | Are Family **people** actually identified/consented or merely in possession of role links? What about guardian age/authority and shared devices? | Explicit product decision on identity and youth safeguarding; no ungrounded verified-parent labels |
| MEDIUM | Can the post-recovery one-time handoff survive metadata/network errors? Could browser history, clipboard extensions, telemetry or screenshots leak role URLs? | Targeted browser tests, private-device/manual review, no raw secret artifacts |
| MEDIUM | Are prod/preview frontend and backend commits mismatched, exposing old routes to new UI? | Deployment immutable IDs, source SHAs, contract compatibility matrix, live status |

## Safe hosted verification (READ ONLY)

A local operator with ordinary outbound HTTPS access can run:

```bash
node scripts/family-readonly-host-probe.mjs \
  --api-origin https://keys-api-stocklana.faadil-casecraft.workers.dev \
  --web-origin https://cresco-lac.vercel.app
```

If a **disposable, existing** Family workspace ID has been authorized for checking, append `--workspace-id ws-...`; it checks that private reads reject **anonymous** calls with HTTP 401. It **does not** send any bearer, creator code or wallet material. It makes only GET/OPTIONS, never POST, and does not issue challenges. Review the script source before running. The probe's `hostedCommitVerified` remains false because current code has no authoritative commit-binding endpoint, even if every HTTP check passes. A passing probe never counts as identity verification, live onchain execution or independent reviewer approval.

At authoring time the assistant could not access the public host from its available web/network environment and the connected Vercel accounts did not resolve the named Cresco deployment. **Do not claim this probe was run successfully against the hosted services.**

## Reviewer decision template

Reviewer: **PENDING**  
Reviewer affiliation/independence: **PENDING**  
Target commit: **PENDING FINAL EXACT-SHA**  
System: Family Devnet offchain API + Web app + Solana Anchor program  
Review method and exact dates: **PENDING**  
Findings severity / reproduction references: **PENDING**  
Secrets, credentials, onchain signatures: **REDACTED / NEVER POST**  
Approval: **NOT GRANTED**  
Residual risks / follow-up owner: **PENDING**

Decision must be one of `APPROVED_FOR_CONTROLLED_DEVNET_TEST`, `CHANGES_REQUESTED` or `INCONCLUSIVE`. Approval for controlled Devnet testing is **not** approval for external family use or mainnet.

## Release gates that stay BLOCKED

- Independent security review from a distinct qualified person.
- Hosted Web/API SHA and privacy/header evidence on owner-approved environment.
- Rate limiting/abuse mitigation at the ingress and visibility of failures.
- Real Parent/Teen/second-parent use on separate devices, with consent, disposable Devnet assets and redacted receipts.
- User/legal guardian identity and youth/privacy/financial product compliance.
- Recoverability if initial creator proof or bound signing wallet is lost.

**No release, merge, deployment, real-wallet signature or transfer is authorized by this packet.**
