# CRESCO Family — read-only hosted runtime observation (2026-10-28)

Status: **LIVE PUBLIC HTTP OBSERVED, FAMILY RECOVERY API CONTRACT DRIFT; NO GO FOR ONBOARDING**.
Environment: GitHub Actions ubuntu-latest outbound HTTPS. No API bearer, cookie, seed, workspace ID, POST, recovery challenge creation, wallet signature, role change or Devnet transaction.

## Canonical hosts (source evidence)

- **Current product**: `https://cresco.faadil-casecraft.workers.dev` (source `README.md`, `state/CURRENT.yaml`, Cloudflare Workers Builds).
- **Current API candidate**: `https://keys-api-stocklana.faadil-casecraft.workers.dev` (`wrangler.jsonc` name `cresco-api-stocklana`; legacy identifier).
- **Former September web host**: `https://cresco-lac.vercel.app`, NOT the canonical current product. Searching the two connected Vercel personal/team accounts yielded no Cresco project; this does not prove who owns the legacy domain.
- Both current Web and API immutable deployment versions / effective exact source SHAs are **UNKNOWN**. The frontend's on-page short build indicator was **not found** by the read-only HTML parser (this is not evidence of any particular SHA).

## Direct external observations

**First observation:** [GitHub Actions run 40725707121](https://github.com/Faadil1/cresco/actions/runs/40725707121), hosted-observation job, source `12cc2e2931f1646a7791381a5472c7499a087e60`:

- `GET /api/v0.4/worlds-fair/openapi`: **200**.
- `cache-control: no-store`: **present**.
- From historical Vercel frontend Origin: CORS **allowed** as configured; unrelated Origin: CORS **not allowed**.
- OPTIONS authorization preflight: **204**.
- The published OpenAPI **does not enumerate three expected v0.4 Family endpoints**:
  - `POST /workspaces/{id}/roles/{role}/rotate` (under `/api/v0.4/worlds-fair`)
  - `POST /workspaces/{id}/principal/recovery/challenge`
  - `POST /workspaces/{id}/principal/recovery/complete`
- Probe result **FAIL**, as intended for contract drift. A missing OpenAPI path is **NOT proof** that its HTTP handler was invoked and returned 404; no POST was sent.

**Second observation:** [GitHub Actions run 40726085096](https://github.com/Faadil1/cresco/actions/runs/40726085096), hosted-observation job, source `dce1958c0f2bd70043284c1ec90a2536947300e2`, now targeted at the **canonical Cloudflare frontend**:

- API `GET /openapi`: **200**, `no-store` present, CORS for **current Cloudflare frontend** allowed, unrelated Origin refused, OPTIONS **204**.
- All three Family routes remain **absent from the public OpenAPI contract**; probe **FAIL**.
- Canonical Web `GET /`: **200**, content-type HTML; `GET /worlds-fair/desk`: **200**, content-type HTML. Web probe **REACHABLE**.
- Frontend short build hint: **UNKNOWN** (not extracted from returned HTML). Immutable deployment ID and exact git SHA: **NOT VERIFIED**.
- No workspace ID was provided: anonymous private GET refusals and real role authorization **NOT TESTED**.
- Node CI checks remained successful. The observational hosted job is non-gating by design; **never infer release readiness from the parent workflow's green check alone**.

## Practical conclusion

The current Cloudflare **product is publicly reachable** at both tested pages, and the API responds to safe read-only probes. However the publicly served API contract **has not caught up to the unmerged Family security feature set** in draft PRs #90–#92. This is consistent with the PR stack not being released; no deployment problem is diagnosed without an exact version binding.

**NO-GO for telling test families that role link rotation / wallet-bound Parent recovery is live.** A public OpenAPI contract is not a complete proof of route behavior, but its missing supported routes is a contract compatibility blocker.

## Release sequence — owner and reviewer gates

1. **Owner:** identify Cloudflare Web and API Workers, the correct Cloudflare account, active versions, deployment SHAs/build IDs and domain routing. This must be obtained through the owner-controlled Cloudflare dashboard/logs; never copy auth tokens into issues.
2. **Independent reviewer:** audit full #81–#92 stack and threat model, with exact commit. Report approvals or changes, no assumed sign-off.
3. **Owner explicit approval only:** establish a protected/nonpublic preview or staged deployment using an independently reviewed exact source commit; do **not** auto-merge or redeploy public/main in this task.
4. Re-run `scripts/family-readonly-host-probe.mjs` with the actual preview API+current Web Origins and `scripts/family-readonly-web-probe.mjs`, compare signed contract and immutable host SHAs. A `PASS` would still be a **limited public HTTP contract observation**.
5. Only after separate authorization: disposable Devnet Parent/Teen/second-parent devices, real wallet signatures with consent, negative/replay/UNKNOWN recovery and redacted receipts; identity/privacy review before real users.

## Evidence integrity

- OBSERVED: public GET/OPTIONS status, CORS/cache headers, missing published OpenAPI paths, reachable current Cloudflare frontend routes.
- INFERRED: the deployment/API is behind unmerged PR #90–#92, but no exact revision proved.
- UNKNOWN: which exact API/Frontend SHA is active; live operational role handling; contract implementation details beyond OpenAPI; authenticated private reads; independent review; real Devnet validity at current hosted SHA.

Linked blocker: [Issue #93](https://github.com/Faadil1/cresco/issues/93). Security release gate: [Issue #87](https://github.com/Faadil1/cresco/issues/87).

**No deploy, merge, secret, wallet signature or funds moved in these observations.**
