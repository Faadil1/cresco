# CRESCO World’s Fair — PR #29 Exact-Head 7/7 Live PASS

Date: 2026-10-04  
Status: **PRE-MERGE EXACT-HEAD 7/7 PROVEN / NO MERGE / NO PUBLIC REDEPLOY**

## Authorized scope

The user authorized:
- opening one new PR for exact head `b77b5378c6088c50c2912a4b4254c43b28f549fd`;
- exactly one World’s Fair 7/7 live validation on Solana Devnet;
- no mutation of PR #19/#20/#21/#22/#23/#24/#25/#26/#27/#28;
- no merge;
- no public redeploy;
- no mainnet;
- no post-deploy repeatability campaign.

## PR binding

Repository: `Faadil1/cresco`  
PR: **#29**  
Branch: `fix/worlds-fair-orca-quote-pool-null-retry-v1-clean`  
Exact head: `b77b5378c6088c50c2912a4b4254c43b28f549fd`  
Base main: `1266756fb6a00318618daefe9db3d875387411b5`

PR remains OPEN and UNMERGED.

## CI + live result

- root test run `37214175228`: **PASS**
- Cloudflare Worker CI `37214175272`: **PASS**
- single authorized operator-lab live run `37214175230`: **PASS**
- live job: `111471209923`
- receipt verification: **PASS**
- additional live workflows: **NONE**

Artifact:
- id: `11307628144`
- name: `worlds-fair-operator-lab-runtime-receipt`
- digest: `sha256:e2f93357e79d89a40ae864df76b7f7dce81ea837de1b12fab06a689cfb5a65ce`
- size: `2487 bytes`

Receipt:
- schemaVersion: `2`
- type: `CRESCO_WORLD_FAIR_OPERATOR_LAB_RECEIPT`
- status: **PASS**
- network: `solana-devnet`
- program: `7pgPuPZSUUtFcvFtVGmS3piCE1bHY35kjb14vct9v45Z`
- program SHA-256: `084a3f7aad8a5772d773816579f5d2b98542c4b966dbb0dd7c60cb397db21f61`
- delegate: `4VLFryH36ed8Mc7ByBMLwvtrtYMgo2hKmAicDU2oRfj7`
- mandate: `CPdat8L1kNUZXAHd6smzeK14nRXD9p1kXU4pF6SSMBXG`
- starting nonce: `13`
- completed nonce: `14`
- productState: `WORLD_FAIR_OPERATOR_LAB_LIVE`
- bootstrap delegate funding: none
- bootstrap input-vault funding: none

## Seven live scenarios

### 1. standingAutonomy — PASS

Two standing-authority swaps executed without guardian approval.

Signatures:
- `2DrhXGfBN7wfke6TFYMh3rryMsUrnHad3bDBJJF2Pi57jjzHPxdUgwHpRfKiN5VNuzbHZSTLGpkjvfhqreEwQz64`
- `5EaSJBjteoHoHrKzdsFav1gHuo9mMn4R3YhZHDNFmS1uUUsZB8RfwwtoarKm6W9FCiHZcJBQJ3nLcfkZxZDscfTp`

Guardian approval required: `false`.

### 2. softBoundary — PASS

Decision: `REFUSE`  
Reason: `PythNotionalExceeded`  
Requested notional: `749965` micro-USD  
Standing max notional: `500000` micro-USD

Policy diff:
- supported program: PASS
- supported pool: PASS
- supported pair: PASS
- market evidence: PASS
- per-action notional: VIOLATED
- violated dimension: `MAX_ACTION_NOTIONAL`

### 3. exactException — PASS

Allowance:
`2zZ3NvKtDbC1BKbmfXsq9hp6ZmRQZS4v5KhYxPs5Lo4t`

Request hash:
`daa0fc4c326aacf6a65b1300024349e9f8cb06b29d4437a868c7f0bd22f85ada`

Grant signature:
`5ee9AngLGBEzKwQ6udLjnDh7xadtyy1vgreJgFnyP6LnoJaP81FT8ZDq24Br4duHY8gWMMzCvvJ55UaDHRSbyQ6c`

Mutation:
- decision: REFUSE
- reason: `AllowanceActionMismatch`

Execution signature:
`fNm9RuUdWyazeaR9pj38w4aHQAYGqsnqFXcCEUAkeRcjdcdeHv7RV15832Dtfz89JXBGTvXWdemk7ymsinFcUoY`

Postconditions:
- consumed: true
- replay: REFUSE / `AllowanceAlreadyUsed`
- standing mandate version: `14 -> 14`
- standing authority changed: false

### 4. hardBoundary — PASS

Decision: `REFUSE`  
Reason: `InvalidOrcaProgram`  
Exception path: false

### 5. evidenceFailure — PASS

Decision: `REFUSE`  
Reason: `PythMessageInvalid`  
Dependency: `PYTH_LAZER`  
Evidence status: `MISSING`

### 6. rollback — PASS

Decision: `REFUSE`  
Reason: `AmountOutBelowMinimum`

Allowance:
`GZ5LMPrgpUKEH9YqHrPbm5DWdKGnNdhD5bdDzDrsyLdp`

Postconditions:
- allowance consumed: false
- counters changed: false

Grant signature:
`F7Pd1Q8rqfRG3xFw56LvvYbn1qf3LQskeb6JoKTZeFpvh4WzygTcDBK18s4Y6wssZdvggejdTWGbsKmgwkd3jtc`

### 7. staleAuthority — PASS

Policy transition signature:
`5ip16267fPUdKAe182UDJfQUyPeMdeKsx5p3sjYLh6seBYua7m4Hf16RvPMnrqgQpDgRRzKP9m5nCFnPCjy2oDzh`

Nonce:
- source nonce: `13`
- current nonce: `14`

Decision: `REFUSE`  
Reason: `StaleNonce`

## Confirmed live effects

The receipt contains six confirmed effect signatures:
1. `standingAutonomy.1` — `2DrhXGfBN7wfke6TFYMh3rryMsUrnHad3bDBJJF2Pi57jjzHPxdUgwHpRfKiN5VNuzbHZSTLGpkjvfhqreEwQz64`
2. `standingAutonomy.2` — `5EaSJBjteoHoHrKzdsFav1gHuo9mMn4R3YhZHDNFmS1uUUsZB8RfwwtoarKm6W9FCiHZcJBQJ3nLcfkZxZDscfTp`
3. `exactException.grant` — `5ee9AngLGBEzKwQ6udLjnDh7xadtyy1vgreJgFnyP6LnoJaP81FT8ZDq24Br4duHY8gWMMzCvvJ55UaDHRSbyQ6c`
4. `exactException.execute` — `fNm9RuUdWyazeaR9pj38w4aHQAYGqsnqFXcCEUAkeRcjdcdeHv7RV15832Dtfz89JXBGTvXWdemk7ymsinFcUoY`
5. `rollback.grant` — `F7Pd1Q8rqfRG3xFw56LvvYbn1qf3LQskeb6JoKTZeFpvh4WzygTcDBK18s4Y6wssZdvggejdTWGbsKmgwkd3jtc`
6. `staleAuthority.policyTransition` — `5ip16267fPUdKAe182UDJfQUyPeMdeKsx5p3sjYLh6seBYua7m4Hf16RvPMnrqgQpDgRRzKP9m5nCFnPCjy2oDzh`

## Completed live phase chain

The receipt reached `COMPLETE` after all expected phases, including:
- both standing swaps and observed effects;
- soft-boundary refusal;
- exact-exception quote, grant, mutation refusal, execute, effect observation, allowance verification and replay refusal;
- hard-boundary refusal;
- evidence-failure refusal;
- rollback grant, expected refusal, allowance/post-state/invariant verification;
- stale-authority policy transition and stale-nonce refusal.

## Truth boundary

This run proves:
- the **exact PR #29 head** passes the full 7/7 live operator-lab scenario suite on Solana Devnet;
- the retry/read-reliability repair is sufficient for this one authorized complete run;
- all seven canonical behaviors were observed in one live run;
- the runtime program binary remains bound to the expected SHA-256.

This run does **not** prove:
- PR #29 is merged;
- `main` contains this repair;
- the public hosted runtime has been redeployed with this repair;
- repeatability after merge/deployment;
- independent external-human usage, adoption, WTP or market validation;
- mainnet readiness.

Canonical classification:
`PREMERGE_EXACT_HEAD_7_OF_7_LIVE_PROVEN`.

## Protected next boundary

Fresh authorization is required for any of:
- merging PR #29;
- public redeploy;
- post-deploy live validation;
- repeatability campaign;
- mainnet;
- mutation/closure of earlier PRs.
