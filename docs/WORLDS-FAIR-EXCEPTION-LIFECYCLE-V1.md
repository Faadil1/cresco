# World Fair exception-request lifecycle — source-only contract

Status: **LOCAL DOMAIN CORE ONLY / NOT INTEGRATED / NO LIVE CLAIM**

This module creates a bounded, durable-store-agnostic lifecycle:
operator role -> exact action fingerprint -> soft-boundary Policy Diff ->
principal review -> approved-pending-onchain-grant -> externally verified grant ->
externally verified execution -> CONSUMED or RECONCILIATION_REQUIRED.

Non-negotiable security boundaries:
- server-side identity verification must back authenticate();
- the request and its Policy Diff must be derived from the trusted standing mandate evaluator;
- create() and compareAndSwap() must be backed by atomic durable storage;
- principal is distinct from operator and bound to the current mandate;
- APPROVE is not a chain grant; the grant signature must be independently verified;
- onchain receipts must be verified by an authoritative adapter that binds exact hash and consumed state;
- incorrect/uncertain outcomes remain quarantined; replay isn't enabled;
- absence of an HTTP/UI integration means the user workflow is still **NOT_IMPLEMENTED end-to-end**;
- this work makes no custody/mainnet/institutional-security claims.

This branch does not edit src/http-api.mjs or src/worlds-fair-orca-provider.mjs to avoid
automatically triggering the legacy protected Devnet PR workflow before PR #31 merges.

Next material integration step, separately tested:
1. Durable Object/KV transactional request store (CAS semantics proven).
2. Production-grade auth and role verification (not frontend-supplied roles).
3. Trusted policy evaluator + onchain verifier adapters.
4. Authenticated operator/principal UI and API routes, failure/recovery state.
5. Full negative, race, clean-room and external-user runs.
6. Protected live validation only with fresh authorization.
