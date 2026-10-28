# CRESCO Family — cumulative-stack integration audit and validation gate

Date: 2026-10-28
Source: draft PR #92, cumulative chain #81–#92; **not merged, not deployed**.
Reviewer level: code and CI inspection only, **not an independent external security certification**.

## Integration topology

- #81: UNKNOWN intent quarantine; #82–#84: Family workspace bridge, activity and refresh; #85 merges feature paths without landing on main.
- #86: scoped private requests/history authorization.
- #88: scoped private workspace and mandate reads; Parent-only message; CORS/cache tests.
- #89: one Family role per browser and fragment import; clears stale view.
- #90: Parent rotates Teen/second-parent bearer links.
- #91: previously bound wallet protects all-role API recovery; wallet binding made immutable.
- #92: independent **creator-issued** setup code for first Family wallet binding, reusable public recovery challenge. This branch carries these changes and the integration fixes below.

Do not confuse a stacked, cumulative PR's green tests with production: hosted app and API can still run a different SHA, and the Family UI bridges to a separate protocol surface, not a unified regulated custody product.

## Source findings and fixes in this review

1. **Recovery partial commit (P0).** Earlier code marked the recovery challenge consumed in a separate KV write BEFORE saving the new role hashes. A failed workspace write could leave the old credential set live with an unusable proof. The fix writes **new token hashes + `lastPrincipalRecoveryChallengeId`** in one durable workspace record. Only after this atomic authority marker does it update the secondary challenge record and append the audit event. The workspace marker is the canonical replay barrier even if later writes fail. A failed workspace write leaves the old credentials and challenge intact. The lost HTTP response is still **UNKNOWN**, never assume failure or automatically replay.
2. **One-time role handoff tied to metadata read (P0).** After a successful wallet recovery the Family screen saved only the Parent role and awaited an extra `getWorkspace` before showing Teen and second-parent replacement links. A failed read could discard those one-time links after the server had revoked all former credentials. The fix renders the replacement handoff immediately from the verified, committed recovery response; metadata/desk reads may fail separately without destroying the handoff.
3. **Contract-level tests.** Node tests inject a durable workspace write failure before commit and a secondary challenge-record write failure after commit, and verify rekey state, old/new credentials, fresh challenge and replay behavior. A Cloudflare Worker/Durable Object test runs first enrollment, Parent wallet signature recovery, old-link refusal, new-link authorization and anti-replay through the actual HTTP adapter. Browser unit test holds the one-time links even when metadata GET returns 503.

## Truth and release gates

| Gate | State | Evidence / external dependency |
| --- | --- | --- |
| Source roles + private reads | SOURCE+CI | #86, #88 and downstream |
| Role isolation and cross-tab import | SOURCE+MOCKED_BROWSER | #89; browser credentials are not accounts |
| Teen/second-parent link revocation | SOURCE+MOCKED_BROWSER | #90 |
| Signed Parent API recovery and first enrollment proof | SOURCE+CI | #91/#92, Ed25519; possession ≠ identity |
| Failure before durable rekey | TEST CANDIDATE | old access remains valid, challenge retryable |
| Failure after durable rekey | TEST CANDIDATE | old access revoked, original signature never replays; fresh challenge available |
| Failure of post-recovery metadata GET | TEST CANDIDATE | all new links still shown once |
| Exact-head CI (Node+WebKit) | PENDING at doc authoring | Must append run IDs and SHA when green |
| Independent security reviewer | BLOCKED | security/cryptographic, auth/privacy threat model |
| Production-style rate limits and anomaly monitoring | BLOCKED | challenge traffic, create-workspace abuse, enumeration |
| Verified parent/legal guardian/age + account ownership | BLOCKED | creator code and wallet prove possession only |
| Lost creator code / lost Parent wallet recovery | BLOCKED | no bypass or safe escalation designed |
| Real app+API SHA matching, secrets, origin/cache | BLOCKED | requires owner-approved controlled deployment |
| Physical Parent/Teen/second-parent devices | BLOCKED | no real-world dual-device proof |
| Solana Devnet end-to-end exception/UNKNOWN | BLOCKED | owner-authorized test, wallet consent, receipts |
| Public release / financial custody | BLOCKED / N/A | not a compliant family custody account |

## Proposed controlled live validation protocol (NOT executed)

With owner approval and disposable Devnet-only workspace and assets, do not reuse any historical hackathon funds or signatures:

1. Record the exact git SHA of both Web and API deployment; verify allowlisted Origin, `cache-control: no-store` and private GET refusals on the *deployed* host. Do not include bearer tokens in screenshots, logs or issue bodies.
2. In separate clean browser profiles/devices, create the Family workspace as Parent, retain creator enrollment code through a secure owner-managed handoff, and distribute only the Teen link to the Teen profile. Establish first Parent wallet enrollment with an explicit signed **message**, not an onchain transaction.
3. Exercise Teen → request → Parent sees pending → Parent refuses; verify Teen sees refusal. Exercise a bounded action only with explicitly authorized Devnet funding and wallet consent. No mainnet transfers.
4. Copy an old Teen link, rotate it from Parent and assert old bearer receives `401` for `whoami`, requests/history and any write; new bearer works and has no Parent tab. Use second-parent link separately.
5. Simulate a lost Parent API token while retaining the *previously enrolled wallet*. Request the short-lived challenge, sign the exact message, recover, then verify all old Parent/Teen/second-parent links return `401`. Fresh links work. Try replay and expiry and verify explicit refusal.
6. Inject a controlled transport failure during an intent and check the persistent `UNKNOWN` hold. Never submit a replacement trade until the signature and current mandate have been reconciled.
7. Capture redacted timestamps, response codes, role boundaries, chain signatures and resulting states tied to the deployed SHA; run independent privacy/security review; classify every gate PROVEN/BLOCKED/UNKNOWN.

## Release decision

**NO-GO for live families or production funds.** Keep the PRs in draft and issue #87 open. No auto-merge, automated deployment, Devnet signing or mainnet use authorized by this audit.
