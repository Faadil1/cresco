# CRESCO World’s Fair — Operator Lab Architecture

Date: 2026-10-02  
Status: **LOCKED FOR PRODUCT EXPLOITATION IMPLEMENTATION**  
Gate: `PRODUCT_EXPLOITATION_LOOP__REAL_USER_SURFACE_AND_SHARED_CORE`

## Objective

Turn the proven CRESCO→Orca Devnet mechanism into a judge/operator-usable product surface without creating a second policy engine or downgrading live behavior into replay.

## Runtime

Reuse the already bound live program:

`7pgPuPZSUUtFcvFtVGmS3piCE1bHY35kjb14vct9v45Z`

Runtime binary SHA-256:

`084a3f7aad8a5772d773816579f5d2b98542c4b966dbb0dd7c60cb397db21f61`

The Operator Lab must not deploy a new program for ordinary user runs.

## Actors

### Guardian / principal

Server-held Devnet principal from `DEVNET_KEYPAIR_JSON`.

### Strategy / delegate

A stable, distinct Devnet keypair is deterministically derived server-side from the guardian secret plus a domain-separated World’s Fair label.

Purpose:
- distinct on-chain principal and delegate addresses;
- no second browser/private-key setup;
- stable reusable demo state;
- no secret transmitted to the client.

Truth boundary:
this is a **server-held Devnet demo actor**, not a production custody/key-management design.

## Shared product core

Create a server-only World’s Fair Orca runtime provider that owns:

- deterministic account derivation;
- first-run bootstrap of Charter / Mandate / AssetRule / trade vaults;
- Pyth Lazer evidence retrieval;
- Orca quote/account resolution;
- standing execution;
- Policy Diff for the soft boundary;
- exact semantic swap hash;
- exact one-use exceptional authority;
- replay/stale/refusal interpretation;
- receipts and Explorer references;
- fail-closed UNKNOWN/REFUSE behavior.

The judge-facing API and CI proof must converge on these primitives rather than maintain separate behavioral implementations.

## API

Bounded World’s Fair namespace:

- `GET /api/v0.3/worlds-fair/runtime`
- `POST /api/v0.3/worlds-fair/run`

### Runtime

Returns only public state:
- network;
- program ID;
- program binary hash;
- Orca program/pool/pair;
- guardian public key;
- delegate public key;
- Mandate version/nonce;
- standing limits;
- current counters;
- truth boundary.

### Run

Runs the canonical bounded live sequence and returns a receipt.

No user-supplied:
- Program ID;
- pool;
- token mint;
- arbitrary CPI accounts;
- arbitrary instruction bytes.

The only accepted action is the locked canonical lab sequence.

## Canonical judge sequence

1. **Standing autonomy**
   - real Orca exact-input swap;
   - no guardian approval for the action.

2. **Policy Diff**
   - same program/pool/pair/evidence;
   - only `MAX_ACTION_NOTIONAL` violated.

3. **Exact exception**
   - principal grants one exact semantic action;
   - mutation refuses;
   - exact action executes;
   - standing Mandate remains unchanged;
   - replay refuses.

4. **Hard boundary**
   - unsupported execution target has no exceptional path.

5. **Evidence failure**
   - missing Pyth evidence fails closed.

6. **Rollback**
   - impossible Orca min-output threshold refuses;
   - allowance remains unused;
   - counters remain unchanged.

7. **Stale authority**
   - a Mandate nonce transition invalidates the still-unused exception.

## Resource / reset strategy

- Program deployment is reused.
- Stable actor/account state is reused where compatible.
- Input trade vault is topped up only when below a bounded threshold.
- No faucet dependency in the normal judge path.
- Each one-use exception uses a unique semantic request hash.
- Period counters remain visible rather than silently reset.
- If the bounded demo state cannot safely continue, API returns a truthful unavailable state rather than mutating policy behind the judge’s back.

## UI

Add a dedicated World’s Fair operator/judge surface.

Above the fold:
- LIVE / Solana Devnet label;
- bound CRESCO Program ID;
- Orca pool/pair;
- Mandate nonce/version;
- standing limit;
- current stage;
- one action: **Run live authority sequence**.

Result surface:
- step timeline;
- Policy Diff;
- ALLOW / REFUSE / EXECUTED / ROLLED_BACK states;
- one-use allowance state;
- standing-authority-before/after;
- Solana signatures with Explorer links;
- explicit live vs replay label.

## Safety / truth boundaries

MUST NOT claim:
- mainnet;
- brokerage/custody;
- audited production security;
- institutional capital execution;
- operator validation;
- WTP;
- adoption.

MUST fail closed on:
- missing server secrets;
- RPC uncertainty;
- Pyth evidence failure;
- stale nonce;
- malformed runtime state;
- unknown transaction confirmation.

## Acceptance criteria

The gate can advance when:

- the judge can initiate the canonical live sequence from the product surface;
- no source-code editing or GitHub Actions use is required;
- the same live CRESCO→Orca mechanism is used;
- Program ID/pool/pair/CPI scope remain hard-bound;
- private keys/Pyth key remain server-side;
- live transaction receipts are visible;
- rollback/replay/stale paths remain first-class;
- frontend/backend regression checks pass;
- hosted runtime is proven independently after deployment.
