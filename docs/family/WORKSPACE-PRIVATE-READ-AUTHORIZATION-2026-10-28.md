# Cresco v0.4 — authenticated workspace request and event reads

Status: **source and CI candidate only**, dependent on the integration PR #85. This is not a hosted production/security audit.

## Observed vulnerability in source

GET /workspaces/{id}/requests and GET /workspaces/{id}/history previously accepted the workspace ID without a role bearer credential. Both can include request details, actor activity, execution status and Explorer signatures. GET /requests/{id}/approval-message also constructed a request-derived signing message without checking the caller's role. A client-side Family role switcher did not protect these server routes.

## Bounded server and UI repair

- Require that the role bearer token belongs to the exact workspace before returning requests or history, for all operator, principal and risk roles. Invalid/missing/foreign bearer yields an authorization error.
- Only the principal role receives the exact approval-message read, including request-specific details.
- Update the v0.4 API contract and the desk client so both initial load and focus/timer refresh carry the current viewer's token. No credentials are placed in URLs, persisted response payloads or logs by this patch.
- Preserve separate v0.2 learning-demo and v0.4 workflow authority. This does not authenticate legal guardians or perform wallet identity verification.
- The read auth change is intentionally distinct from PR #85 and uses its branch as the integration base.

## Evidence and security gates

| Gate | State | Required proof |
| --- | --- | --- |
| Anonymous read denial | TEST CANDIDATE | HTTP tests for requests and history |
| Cross-workspace bearer isolation | TEST CANDIDATE | Foreign workspace token refused |
| Principal approval-message read | TEST CANDIDATE | Anonymous/Teen refused, principal accepted |
| UI role-bound fetches | TEST CANDIDATE | Web tests and browser compatibility |
| No unseen data exposure via other v0.4 GET paths | BLOCKED | Independent audit of workspace metadata, mandate and public OpenAPI |
| Backend side effect and irreversible action boundaries | ACTIVE | Integration PR #85 UNKNOWN and replay tests |
| Exact HEAD CI | PENDING | Node + web + mobile WebKit |
| Exact hosted runtime binding | BLOCKED | Explicit authorized deployment and SHA proof |
| Live Devnet role and recovery validation | BLOCKED | Separate explicitly authorized protocol |
| Production identity / brokerage / mainnet | N/A | Explicitly not claimed |

## Next priority

Review every v0.4 read endpoint and upstream proxy/CORS/cache policy as a separate security gate; role matching for requests/history is necessary but not a complete privacy audit. In particular evaluate public workspace metadata, GET mandate and any request-derived signing material. Never ship based solely on typecheck and mocked API tests.
