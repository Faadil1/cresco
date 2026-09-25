# Architecture

Status: current public architecture

## System map

~~~
Cresco web app
  |
  | HTTPS
  v
CRESCO Cloudflare API
  |
  +-- role-scoped demo sessions
  +-- Family state
  +-- boundary requests
  +-- guardian decisions
  +-- balances and portfolio
  +-- durable reservations / idempotency
  |
  +--------------------+
  |                    |
  v                    v
Pyth market truth      CRESCO Solana program
                       |
                       +-- Mandate
                       +-- AssetRule
                       +-- exact Allow once
                       +-- version / nonce
                       +-- pause / resume
                       +-- fail-closed checks
                       |
                       v
                    demo SPL token
~~~

## Authority source

The browser is not the authority source.

The frontend can preview and explain a boundary, but a Money action is gated by backend/server state and the Solana execution path.

The client does not get to widen its own Mandate.

## Mandate

A Mandate is the standing permission envelope.

Core fields:

- principal / guardian;
- delegate / beneficiary;
- asset scope;
- actions;
- per-action limit;
- period limit;
- status;
- expiry;
- market conditions;
- version;
- nonce.

## AssetRule

AssetRule narrows a Mandate for a specific asset/action combination.

It can require current market evidence and enforce notional or condition checks.

## Boundary request

A boundary request is a human-decision object, not authority by itself.

It records the requested action and current Mandate lineage.

The guardian may refuse, allow that exact request once, or create a new standing Mandate.

## Allow once

The one-time permission is request-scoped and exact-action bound.

The canonical Devnet proof binds:

- request;
- mint / execution asset;
- Mandate nonce;
- approved notional;
- one successful use.

A changed action refuses before allowance consumption.

A successful exact action consumes the permission.

Replay refuses.

Standing authority does not change.

## Pyth

Pyth is market truth, not authority.

Pyth can be load-bearing for:

- price;
- notional;
- freshness;
- confidence;
- precommitted market conditions.

Pyth can stop an action.

Pyth cannot widen a human Key.

## Durable state and concurrency

The hosted Family flow uses Cloudflare Durable Object state to coordinate:

- family state;
- balances;
- boundary requests;
- guardian decisions;
- reservations;
- idempotency.

This prevents the frontend from treating separate tabs or devices as independent authority sources.

## Execution outcomes

The runtime distinguishes:

- ALLOW;
- REFUSE;
- PENDING;
- UNKNOWN.

Only confirmed execution can be rendered as success.

## Truth boundary

The current proof uses Solana Devnet and a demo SPL token.

See [TRUTH-BOUNDARY.md](TRUTH-BOUNDARY.md).
