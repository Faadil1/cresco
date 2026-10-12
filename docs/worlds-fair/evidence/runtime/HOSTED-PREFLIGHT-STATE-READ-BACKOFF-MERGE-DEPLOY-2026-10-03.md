# CRESCO World’s Fair — PR #18 Merge + Cloudflare Deploy

Date: 2026-10-03  
Status: **MERGED + CLOUDFLARE DEPLOYED**  
Post-deploy live repeatability: **NOT YET RE-PROVEN**

## Exact source promotion

- product repository: `Faadil1/cresco`
- PR: #18 — `fix: harden World’s Fair preflight state reads`
- authorized exact head: `494818b67b0e2ab8cdb304c64422e36d89dc67f0`
- base main before merge: `27300a396d9f3049f19e7aed228acdb2f0bdf9d9`
- merge commit: `1266756fb6a00318618daefe9db3d875387411b5`
- merged at: `2026-10-03T20:22:51Z`

Authorized scope:
- merge PR #18 at the exact proven head;
- redeploy affected CRESCO Cloudflare Workers only for the World’s Fair preflight/state + Orca quote read-backoff repair;
- no mainnet;
- no broader product-scope change.

## Pre-merge live proof carried into promotion

Exact-head Devnet proof:
- workflow run: `37149230540`
- job: `111279373905`
- result: **PASS**
- canonical scenarios: **7/7 PASS**
- Mandate nonce: `11 → 12`
- receipt artifact: `11283376180`
- artifact digest: `sha256:383773aa09db6d5fe8cd562fc4ef80cb08aac3693181d2b7cdf216f871960f19`

The successful run encountered substantial public Solana Devnet HTTP 429 throttling and completed with the bounded read-side recovery repair active.

## Cloudflare production builds

Cloudflare Git integration automatically built/deployed the merge commit.

Backend:
- Worker: `keys-api-stocklana`
- result: **SUCCESS**
- build id: `d53d266e-6e95-4bf0-8b04-1da9fd57dc73`
- version id: `89081162-c598-421c-a782-713a4c254176`

Frontend:
- Worker: `cresco`
- result: **SUCCESS**
- build id: `69e33e84-bc5d-4c78-bdf6-39bc33e5f93d`
- version id: `85118cba-c28e-4270-9bad-b3d941785564`

Legacy:
- `Cloudflare Pages / cresco-visual-lab` failed again.
- This legacy project is obsolete and is not the current CRESCO frontend runtime.

## Merge checks

Observed on merge commit `1266756fb6a00318618daefe9db3d875387411b5`:
- root `test` run `37151328912`: PASS
- `cloudflare-worker-ci` run `37151328955`: PASS
- backend Worker build: PASS
- frontend Worker build: PASS
- legacy Cloudflare Pages build: FAIL / obsolete

No mainnet workflow or newly authorized live World’s Fair execution was started by this checkpoint.

## Read-only public verification

After deployment, direct public reads observed:

Frontend:
- `https://cresco.faadil-casecraft.workers.dev/worlds-fair`
- route served successfully;
- World’s Fair product content is present;
- no live sequence was triggered by this verification.

Backend runtime:
- `https://keys-api-stocklana.faadil-casecraft.workers.dev/api/v0.3/worlds-fair/runtime`
- status: `READY`
- network: `solana-devnet`
- Program ID: `7pgPuPZSUUtFcvFtVGmS3piCE1bHY35kjb14vct9v45Z`
- program SHA-256: `084a3f7aad8a5772d773816579f5d2b98542c4b966dbb0dd7c60cb397db21f61`
- delegate: `4VLFryH36ed8Mc7ByBMLwvtrtYMgo2hKmAicDU2oRfj7`
- Mandate nonce: `12`
- truth boundary still reports `mainnet: false`.

## PR #17 structural side effect

The authorization explicitly excluded any separate action on PR #17.

However, PR #18 was based on the exact PR #17 head and added two commits on top of it:
- PR #17 head: `6af66d051493b4c3d8ce820ee4f615d5723e1ea8`
- PR #18 head: `494818b67b0e2ab8cdb304c64422e36d89dc67f0`

Therefore merging PR #18 necessarily placed the three PR #17 commits on `main` as part of PR #18’s five-commit history. GitHub then automatically marked PR #17 as merged/closed at `2026-10-03T20:22:53Z`.

No separate merge command, close command, review mutation or other explicit action was issued against PR #17.

This is recorded as a **branch-topology side effect**. Future protected replacement PRs should be rebased/cherry-picked onto `main` rather than stacked on a superseded open PR when the authorization explicitly excludes action on that earlier PR.

## Protected boundary

The PR #18 merge/redeploy authorization is consumed.

This checkpoint did **not** authorize:
- any mainnet action;
- a post-deploy live World’s Fair 7/7 run;
- a browser-triggered live repeatability campaign;
- custody/security-scope expansion;
- broader product changes.

## Truth boundary

The repair is now:
- non-live tested;
- exact-head live-validated on Solana Devnet;
- merged to `main`;
- deployed to both current Cloudflare Workers;
- read-proven publicly after deployment.

Stable hosted judge/self-serve reliability remains **PARTIAL / INTERMITTENT** until a separately authorized post-deploy live repeatability campaign succeeds.

No adoption, WTP, independent external-human validation, mainnet readiness, custody or audited-security claim follows from this deployment receipt.
