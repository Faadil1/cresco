# CRESCO World’s Fair — PR #20 clean retry/observability live validation

Date: 2026-10-03  
Status: **AUTHORIZED LIVE VALIDATION FAILED AT STANDING_2_QUOTE / PARTIAL EFFECT PROVEN**

## Authorized scope

The user authorized:
- opening a new PR for exact head `65a9fea6cbd0535ea867690a848bc1a50ccbe08d`;
- exactly one World’s Fair 7/7 live validation on Solana Devnet;
- no PR #19 mutation;
- no merge;
- no public redeploy;
- no mainnet;
- no post-deploy repeatability campaign.

## PR binding

Repository: `Faadil1/cresco`  
PR: **#20**  
Head: `65a9fea6cbd0535ea867690a848bc1a50ccbe08d`  
Base: `1266756fb6a00318618daefe9db3d875387411b5`  
Synthetic PR merge ref executed by GitHub: `cbdbe6bc538a36dbbf5baaadb83992ad70905c1f`

Topology:
- 1 commit ahead;
- 0 behind;
- directly based on deployed main;
- no ancestry through PR #19.

PR #19 remained untouched and unmerged.

## Checks

- root test run `37153482193`: **PASS**
- Cloudflare Worker CI run `37153482173`: **PASS**
- Orca devnet discovery run `37153482180`: **PASS / READ-ONLY**
- authorized operator-lab live run `37153482247`: **FAIL**
- live job `111291962294`

## Exact live failure

Runtime before canonical sequence:
- status: `READY`
- network: `solana-devnet`
- Program ID: `7pgPuPZSUUtFcvFtVGmS3piCE1bHY35kjb14vct9v45Z`
- delegate: `4VLFryH36ed8Mc7ByBMLwvtrtYMgo2hKmAicDU2oRfj7`
- Mandate version: `14`
- Mandate nonce: `13`
- spentThisPeriod: `5000000`
- spentThisPeriodNotionalMicroUsd: `4999871`
- input vault: `1500000`
- output vault: `12698674`

Completed phases before failure:
- `BOOTSTRAP_READY`
- `STATE_LOAD`
- `ORCA_CONTEXT`
- `STANDING_1_MARKET_EVIDENCE`
- `STANDING_1_QUOTE`
- `STANDING_1_EXECUTE`
- `STANDING_2_MARKET_EVIDENCE`

Failure:
- phase: `STANDING_2_QUOTE`
- phase kind: `READ`
- failure class: `UNKNOWN_RUNTIME`
- reason code: `WORLD_FAIR_RUNTIME_FAILURE`
- retry policy: `NOT_AUTOMATICALLY_RETRYABLE`

Confirmed effect before failure:
- label: `standingAutonomy.1`
- signature: `ttsTwumZDbZGf55mHNpyhhdSshji59jLc5wYnEa1GVY88YJrTf6zke3MpzZ1DWp9esfwEGYjmLaj2dHWGdGhPXo`

Runtime reconciliation after failure:
- status: `READY`
- Mandate version: `14`
- Mandate nonce: `13`
- spentThisPeriod: `5200000`
- spentThisPeriodNotionalMicroUsd: `5199869`
- input vault: `1300000`
- output vault: `12898653`
- reconciliation error: none

Observed state delta across this run:
- spentThisPeriod: `+200000`
- spentThisPeriodNotionalMicroUsd: `+199998`
- input vault: `-200000`
- output vault: `+199979`
- Mandate nonce: unchanged

This exactly matches the confirmed first standing-autonomy execution and proves a nonzero partial effect.

## Failure evidence artifact

Artifact:
- id: `11285206479`
- name: `worlds-fair-operator-lab-runtime-receipt`
- digest: `sha256:19cbf99083fb7bd69d830e466d5521855736c5adc14660b3d92793abda27076a`
- size: `2024 bytes`

The clean observability repair therefore succeeded in its evidence objective:
- diagnostic persisted;
- partial progress persisted;
- confirmed effect signature persisted;
- runtime before/after persisted;
- state reconciliation persisted.

No blind replay is permitted.

## Interpretation

The read-retry ownership change is not sufficient to make the full canonical sequence reliable.

The new evidence moves the bottleneck precisely to the **second Orca quote after a confirmed first swap**. The failure happens after fresh Pyth evidence for standing action 2, so the immediate boundary is the Orca quote/read path, not the Pyth evidence fetch.

The current quote implementation refreshes and reuses the same long-lived Whirlpool object after a state-changing swap. A future source-only repair should test reacquiring a fresh Whirlpool/pool snapshot for each quote attempt so post-write quotes do not depend on stale object state.

This is an engineering hypothesis until non-live tests and a separately authorized live validation prove it.

## Automatic second Devnet workflow conflict

Opening PR #20 also automatically triggered:
- workflow: `worlds-fair-orca-devnet-proof`
- run: `37153482170`
- job: `111291961939`

This workflow is capable of executing a separate live Orca vertical slice on Solana Devnet. That is outside the explicit authorization because the user allowed only one live 7/7.

At the latest observation:
- status: `IN_PROGRESS`
- current step: `Install Anchor CLI 0.32.1`
- `Run first live Orca vertical slice`: **PENDING / NOT YET EXECUTED**

The available GitHub connector does not expose a workflow-cancel mutation. Manual cancellation was requested immediately.

The read-only `worlds-fair-orca-devnet-discovery` workflow is not an additional write/live sequence.

## Current protected boundary

- PR #20: OPEN / UNMERGED
- PR #19: OPEN / UNMERGED / untouched
- authorized operator-lab live run: consumed / failed
- rerun authorization: NOT GRANTED
- merge authorization: NOT GRANTED
- public redeploy authorization: NOT GRANTED
- mainnet: NOT AUTHORIZED
- post-deploy repeatability: NOT AUTHORIZED
- second automatic live-capable run `37153482170`: MUST BE CANCELLED BEFORE LIVE STEP


## Final disposition of automatic `worlds-fair-orca-devnet-proof` run

Run `37153482170` was not cancelled before reaching its live-slice step.

Final result:
- workflow: `worlds-fair-orca-devnet-proof`
- run: `37153482170`
- job: `111291961939`
- result: **FAIL**
- program deployment step: **REUSED existing program**
- runtime commit binding: **PASS**
- live-slice step: **EXECUTED / FAILED**
- receipt: none

The failure occurred at `scripts/worlds-fair-orca-v1-proof.cjs:468` while executing the bootstrap SOL→devUSDC swap:
- payer balance before proof: `0.145429296 SOL`;
- the script first transferred `0.1 SOL` to a newly generated delegate and performed isolated setup writes;
- by the bootstrap swap, only `35,717,296` lamports remained;
- the simulated transaction required `101,488,440` lamports;
- Solana simulation rejected it with `Transfer: insufficient lamports`.

The failed bootstrap swap itself did not land because transaction simulation failed before send.

Isolation boundary:
- the proof script creates `delegate = Keypair.generate()`;
- Charter, Mandate, AssetRule and trade-vault PDAs are derived from that random delegate;
- therefore the setup writes are isolated from the shared operator-lab accounts used by the hosted runtime;
- the existing program `7pgPuPZSUUtFcvFtVGmS3piCE1bHY35kjb14vct9v45Z` was reused and not redeployed;
- the program binary binding remained `084a3f7aad8a5772d773816579f5d2b98542c4b966dbb0dd7c60cb397db21f61`.

Governance classification:
- this was a second live-capable workflow execution outside the explicit one-live authorization;
- it is recorded as an **automatic workflow-scope violation**;
- it is **not** counted as a second canonical operator-lab validation;
- no rerun is permitted without fresh authorization.

Future replacement PRs must avoid touching `package.json` unless the `worlds-fair-orca-devnet-proof` trigger is intentionally addressed first.
