# Cresco Family Parent recovery — wallet proof before API capability

Date: 2026-10-28. Draft source candidate stacked on PR #90. **No hosted deployment, no onchain signing, no production guardianship claim**.

## Confirmed security defect

Previously, `POST /principal/wallet` permitted any bearer of the Parent API token to bind a new arbitrary signing wallet, even when a wallet was previously associated. That made any proposed wallet-rooted recovery channel vulnerable to a leaked Parent bearer. This branch makes binding one-time: same wallet is an idempotent no-op, different wallet is refused `PRINCIPAL_WALLET_ALREADY_BOUND`. Wallet change needs a separate reviewed old-wallet/new-wallet recovery process.

## User and API lifecycle

1. **Enroll before losing access**: from the Family Parent desk, register a wallet you control by signing the existing exact workspace-bound message; the public key becomes the immutable recovery anchor. This also means Family Parent approvals may require wallet signatures.
2. **No Parent bearer available**: from the Family landing page, supply the nonsecret workspace ID and request a recovery challenge. Unenrolled or non-Family workspaces fail closed.
3. Server writes one outstanding random challenge per workspace with a 120-second expiry; persistent storage holds its nonce **hash**. A second challenge while valid returns 429 rather than silently invalidating the first.
4. The browser requests a wallet `signMessage` for `CRESCO Family principal API access recovery`, binding exact workspace ID, challenge ID, unpredictable nonce, expiry, all-role API rotation and `onChainAuthorityEffect:NONE`. The server verifies Ed25519 against the **previously bound Parent key**.
5. On valid proof the challenge is marked consumed, and all three Family bearer token hashes (Parent, Teen, second parent) are replaced atomically in the single workspace record. The response shows replacement links only once; only the Parent bearer is persisted in the creator's browser. Previously issued links stop authorizing API operations. An audit event records the event without secrets.
6. Lost HTTP response or crash after commitment may mean role tokens changed without the browser receiving the new ones. The Parent can request a fresh challenge when permitted and sign again. The previous challenge cannot be replayed or blindly retried. This does not undo any onchain transaction, pending signature, standing mandate or `UNKNOWN` intent.

API:
- `POST /api/v0.4/worlds-fair/workspaces/{id}/principal/recovery/challenge`: no role token (required because lost), previously bound Family wallet required, 120s expiry, one active outstanding challenge. Workspace ID is a locator, not recovery authority.
- `POST /api/v0.4/worlds-fair/workspaces/{id}/principal/recovery/complete`: `challengeId`, `nonce`, `publicKey`, `signature`. No bearer required; *cryptographic wallet proof* is required and challenge is one-use. Both operations use the existing per-workspace Durable Object write lease.
- `POST /principal/wallet`: existing exact-workspace Parent bearer + self-signed message; first binding only, or identical-wallet idempotent success.

## Truth boundaries and remaining risks

| Gate | State | Notes |
| --- | --- | --- |
| Bearer-only wallet hijack blocked after first binding | SOURCE/TEST CANDIDATE | Tests reject other wallet despite valid stolen Parent bearer |
| Lost-bearer challenge replay, expiry, wrong-wallet and cross-workspace proof | SOURCE/TEST CANDIDATE | Ed25519 tests, nonce hash and consumed record |
| Full Family API role rekey and old-link invalidation | SOURCE/TEST CANDIDATE | All 3 role tokens replaced, old reads fail |
| Parent UI enrollment and handoff | SOURCE/TEST CANDIDATE | Wallet signMessage; only Parent persisted |
| Existing Family workspaces without enrolled wallet | **BLOCKED** | No self-service recovery. Do not silently initialize from old link after it is lost |
| Wallet loss or stolen signing capability | **BLOCKED** | No secure recovery fallback yet |
| Challenge exhaustion/denial-of-recovery | **BLOCKED/REVIEW** | One active challenge per workspace, 429 while active; unauthenticated request rate limit may be abused if workspace ID known. Consider independent abuse controls |
| First-binding impersonation | **BLOCKED** | A stolen Parent bearer BEFORE enrollment could bind attacker wallet. Requires proper identity assurance; not solved here |
| Principal wallet rotation/replacement | **N/A** | Explicitly prohibited by this change pending reviewed protocol |
| Production auth account, legal guardianship and minor age | **BLOCKED** | Wallet proof ≠ parent identity |
| Cache/CORS/real hosted runtime/physical two-device Devnet | **BLOCKED** | Separate reviewer and owner-authorized proof |
| Solana onchain mandate control | **UNCHANGED** | API recovery is offchain only; previously signed transfers unaffected |

### Operational warning

This remains a prototype Devnet workspace feature, **not a secure real-money family custody account**. A compromised Parent bearer can still use other API powers consistent with existing server rules (including a server-guardian Devnet workspace). Recovery rotates browser API tokens, not onchain authorities. Independent threat-model review is required before external onboarding.
