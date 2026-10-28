# CRESCO Family: bounded cross-device request and decision synchronization

**Status:** source/CI candidate; dependent on unmerged PRs #82 and #83. This change does not prove a live Devnet transaction or hosted release.

## Observed gap

The v0.4 desk currently performs a full request/history read on initial load or manual Refresh, while a separate 10-second loop only fetches the guardian notification count. A request from a Teen session may change the badge on a Parent device without updating the decision cards. Parent decisions likewise do not automatically update a separate Teen screen. This obstructs the product's Parent -> Teen -> Request -> Decision -> Observed Result loop.

## Product change

- Refresh request and history reads on role-tab entry, browser focus and while a role tab stays visible (15-second interval).
- Do **not** poll `/mandate`, sign, approve or submit intents in this background sync. All refresh network operations are GET.
- Guard against overlapping reads, unmounted components and stale results from another workspace.
- An unreadable/invalid requests or history response marks the snapshot **unverified** rather than displaying "nothing waiting" as a trusted fact.
- While reads are unverified, the client blocks new intents and decision actions, preserving the last known snapshot only as a possibly-stale reference. Server and onchain authority remain necessary and decisive.
- Resume writes only after a successful read, with explicit red offline status and a manual Refresh path.
- Preserve the v0.2 Family demo / v0.4 workspace split and role-token boundaries: no session merging, private-token copying, wallet authority or keychain mutation.

## Scope and test contract

- Unit: Parent regains focus and sees a new request; Teen regains focus and sees changed status; failed reads disable decisions; successful retry restores the actions.
- Browser WebKit: two **isolated** browser contexts with different role tokens, mocked v0.4 API and a shared test state, Teen creates request, Parent approves, Teen observes result without page reload.
- This is a **mocked API browser scenario**, not evidence that real Solana Devnet settlement/one-use allowance was verified. Prior real Devnet receipts do not automatically apply to this branch.
- PR #81 UNKNOWN quarantine must be integrated and independently reviewed separately before final shipping: it changes the same desk and server write/reconciliation paths.
- Existing unauthenticated read endpoints for workspace requests/history should receive separate security/privacy review. This patch does not extend their authority or claim those public read contracts are production suitable.

## Conditional gates

| Gate | Status | Evidence needed |
| --- | --- | --- |
| Parent/Teen role separation | ACTIVE | Independent security review |
| Cross-device request visibility | SOURCE/TEST CANDIDATE | Exact-head unit + WebKit CI |
| Negative/recovery path | SOURCE/TEST CANDIDATE | Outage and reconnect tests; independent review |
| Transaction UNKNOWN recovery | BLOCKED | Merge/integrate PR #81 with authoritative receipt proof |
| Real Devnet request/approval/replay | BLOCKED | Owner-authorized separate-device Devnet run |
| Current hosted commit binding | BLOCKED | Explicit authorized deploy + exact runtime SHA |
| External customer observation and first value | BLOCKED | PR #80 research with consenting participants |
| Mainnet/brokerage/real securities | N/A | Excluded from present product claims |

## Next workstream

After source review, reconcile overlapping draft desk changes from #81/#82/#83 and this PR without dropping negative-path tests. Bind an authorized preview to its exact commit, run separate-device consented role tasks and protected Devnet rejection/recovery protocol. Do not promote any gate from code or CI to LIVE without observed product consequences.
