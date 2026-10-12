# CRESCO World’s Fair — First Hosted Public Runtime Attempt

Date: 2026-10-02 local / 2026-10-03 UTC  
Status: **PARTIAL — PUBLIC API DEPLOYED, SELF-SERVE NOT PROVEN**  
Truth state: **OBSERVED**

## Public deployment source

- Product repository: `Faadil1/cresco`
- PR #11: merged
- Merge commit: `fa26ff06028b57042c850bef4b9467b39e786ea6`
- Prior proven PR head: `cedfbb400f00f28fbe4268fde46ab68933d42e3c`

## Cloudflare Worker deployment

GitHub check:
- `Workers Builds: keys-api-stocklana`
- result: **SUCCESS**
- Cloudflare version ID: `ab366ebc-24d5-48c1-94b8-3163bba13293`

Public API:
`https://keys-api-stocklana.faadil-casecraft.workers.dev`

Hosted runtime proof:
- `GET /api/v0.3/worlds-fair/runtime` → HTTP 200
- expected World’s Fair Program ID matched:
  `7pgPuPZSUUtFcvFtVGmS3piCE1bHY35kjb14vct9v45Z`
- expected program SHA-256 matched:
  `084a3f7aad8a5772d773816579f5d2b98542c4b966dbb0dd7c60cb397db21f61`
- network: Solana Devnet
- verdict: **HOSTED_RUNTIME_READ = PASS**

## Hosted frontend attempt

Expected public path:
`https://cresco-lac.vercel.app/worlds-fair`

Proof workflow:
- run: `37083958650`
- job: `111090282877`
- artifact: `11259986116`

Observed:
- API became ready on attempt 1.
- Web path was checked 24 times over roughly six minutes.
- Every web request returned HTTP 404.
- final result: `HOSTED_WORLD_FAIR_WEB=NOT_READY`.

Therefore:
- World’s Fair frontend source exists and passed CI.
- It is **not proven deployed** at the expected Vercel production URL.
- judge self-serve remains unproven.

## Hosted API live-write attempt

Separate proof workflow:
- run: `37084475468`
- job: `111091794016`
- artifact: `11259677404`
- artifact digest: `sha256:b9fa8996f6bfa43c3952c3ba02859dd0555dac395e87beaadd2c22b69cbcb17d`

Observed:
- hosted runtime GET: HTTP 200 / PASS
- `POST /api/v0.3/worlds-fair/run`: HTTP 503
- response status: `UNKNOWN`
- response error: `WORLD_FAIR_LIVE_RUN_UNCONFIRMED`
- concrete runtime failure:
  `Signature ... has expired: block height exceeded.`

The API correctly failed closed. No PASS receipt was emitted.

## Root cause / repair workstream

The replenishment path used Orca legacy SDK `buildAndExecute()`, which internally confirms against the transaction’s blockhash validity window. Under the hosted Cloudflare/RPC path, the transaction confirmation exceeded that window.

Repair branch:
- `fix/worlds-fair-hosted-confirmation-v1`
- PR #12: `Fix hosted World’s Fair Solana confirmation expiry`

The repair introduces CRESCO-owned signature polling / blockhash-expiry handling and avoids blind duplicate funding by checking the token-balance postcondition before any retry.

A subsequent PR smoke also exposed public Solana Devnet RPC rate limiting:
- four HTTP 429 retries;
- then Orca vault fetch failure;
- treated as a separate transient RPC-read reliability issue and being hardened without weakening semantic/pool validation.

## Truth boundary

Proven:
- public Cloudflare World’s Fair runtime is deployed and bound to the expected program hash;
- public API reaches the World’s Fair runtime;
- fail-closed UNKNOWN behavior works on a real hosted transaction failure.

Not proven:
- hosted canonical live POST PASS;
- hosted `/worlds-fair` frontend;
- browser UI→API→Solana self-serve flow;
- clean-room judge execution.

No mainnet, production custody, audited security, demand, WTP or adoption claim follows from this attempt.
