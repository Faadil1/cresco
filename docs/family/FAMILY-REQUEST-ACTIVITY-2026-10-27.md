# CRESCO Family — verified request-activity preview

**Status:** source-only, stacked review candidate on Family continuity PR #82. No merge, deploy, wallet signature, chain operation or customer-usage claim.

## User job and observed gap

The Family entry bridge on PR #82 can confirm that this browser has a Family workspace and a matching role, but the Parent/Teen entry does not say whether a request is waiting or has recently changed. A parent must enter the live desk without knowing whether there is work to review. A teen sees a role link but no safe read-only update. The v0.4 API already supports authenticated role-scoped `GET /notifications?since=0`.

## Bounded capability

- After `GET /whoami` confirms an exact workspace and role, fetch `notifications` using **only that role's bearer token**.
- Parent or second-parent entry renders the returned `pendingDecisions` count as a **snapshot**, never as an approval action. A second-parent token is not promoted to principal.
- Teen entry renders a finite label for the last returned role-specific event, and never reproduces arbitrary server event summaries.
- If the notifications call fails, the declared role does not match, the count is malformed or the API is unavailable, display **activity unavailable**, not `0` pending.
- Keep the direct workspace navigation behind the separately verified role and workspace checks from PR #82. No new tokens in URL, React state outputs, logs or query parameters.
- No polling or automatic transaction. Use explicit **Check again** and instruct users to verify current status and receipts in the workspace before acting.

## Security and truth boundaries

- A fetched count can change immediately. It is a *role-scoped server snapshot*, not a guarantee of current chain execution or permanent approval authority.
- The role credential is a demo Devnet workspace capability, **not verified parental identity**, production custody, brokerage or mainnet.
- No data are migrated between v0.2 Family demo state and v0.4 Devnet roles.
- The underlying notification read must be independently reviewed for role filtering. The client must not interpret non-delivery as zero, or an event type as a fully verified on-chain receipt.
- This change **requires PR #82**, is based on its exact source head, and remains isolated from drafts #77–#81.

## Conditional gateway register

| Gate | State | Next evidence |
| --- | --- | --- |
| Family job-to-be-done and continuity | ACTIVE | Parent/Teen usability observation |
| Read-only authority, role separation | SOURCE CANDIDATE | Independent source review |
| Unknown and privacy negative paths | TEST CANDIDATE | CI on exact commit + security review |
| API contract and event semantics | SOURCE CANDIDATE | Confirm server notification contract |
| CI (Node, TS/lint/Vitest/build/WebKit) | PENDING | Github Actions exact head |
| Hosted version/runtime binding | BLOCKED | Owner-authorized preview/deploy and SHA proof |
| Real Devnet decision/recovery loop | BLOCKED | Owner-authorized test; no chain writes in this change |
| First-value/retention evidence | BLOCKED | Consented Family observations under PR #80 |
| Workspace switching and recovered access | NOT IMPLEMENTED | Separate security/recovery design |

**Post-slice next:** test the full Parent → Teen → request → decision → observed receipt/recovery journey across separate browser profiles. Prioritize on-chain V1 security proof and safe UNKNOWN handling before customer claims. Do not remove draft gates to make a shipping claim.
