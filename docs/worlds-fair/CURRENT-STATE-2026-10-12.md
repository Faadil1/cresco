# Current state, 2026-10-12

Network: Solana Devnet only. No mainnet, no custody, no customer or revenue claim.

## Live and verified today

Deployed: API Worker `keys-api-stocklana` (API v0.4) and frontend Worker `cresco`
(`/worlds-fair/desk`). Workspace `ws-e1693b5131164f13` (delegated-capital presentation).

| Step | Result | Devnet receipts |
|---|---|---|
| Bootstrap (charter, mandate, asset rule, vaults, funding) | MANDATE_BOOTSTRAPPED | vault funding `2WQkz2JbaKrNTCC19JPvYVdToMMbzvz9CimNYtvt2B9SgN6YZVgk2AnhC57MtJbJ1o2b1BTsXjhh5rrFSpgYcAMs` |
| 0.20 devUSDC inside the mandate | ALLOW, Orca swap executed | `34tm9xmeAzfvn2tckjsp3bwDAcKYGsbdFujY8rBqEXvDWCTdxDGDAUvfLQeF3YavNRFQRRTi9uayyeqMTnLetfrg` |
| 0.75 devUSDC above the $0.50 limit | Refused by the program (PythNotionalExceeded), request with Policy Diff | preflight, no state change |
| Principal approves once | EXECUTED, allowance consumed, standing mandate unchanged | grant `5xZGdXE5qzTRXKCNyybccERSMFDu24QtbgmLFgVfkcGNQAR27QAUkV29hXqiN1oz8pDCZ8wMX3zdapHCcxGg8UPX`, execution `3qbcpQEnvzPD5QuLYvBo2WZy3uUkjW9hgog18Je55w8TRCDW5gRxchu1m1Yw9qo6VBemiMr3iuk2yitLLLYAViyC` |

## Repeatability campaign (15:05 to 15:07 UTC)

Five consecutive full cycles (ALLOW, soft refusal and request, exact exception executed), 5 of 5,
after the vault auto-refill and dedicated RPC fixes:

| Cycle | Standing swap | Exception grant | Exception execution |
|---|---|---|---|
| 1 | `tQLtS32ijDGx1kVZ4sUy4XkNaQ8chkJm6z1BX9LEfUqRYYSQHL5hZexMCXXZUijvrgbnhiCSKSxL2GWtWiCEgih` | `4JyQBWbhxMkJbY2JLVQjLbQP4UNjFfdUgyoCspHC9ddAcWjmdCjWXEBJr3XJ1hMFpvXH6NudHggSUtUvA9cT2bvF` | `5JGb5PZKSFRHz3sz2DDS8nmX6WP4S9vzMw1AmhLZFyc3i7kERBU6PUAQGRyCSqXMC6KZerynNcVJJMTjEZwjepyF` |
| 2 | `2nuw8gU6AfBwMEBYhu2y4Hcpcqv5bWXGDUdLLPtCXshFtXRnaZdaAYZcMtgEuhX7zm5KLew1jSKaizHb3nzNQnbw` | `7UcqasSeL3uvxW1TCVMaF4ZJVM4e1jHPVS3c2gZTakv7mB7C5oPmc3ALZSCbjAVGpx7V1UXtcWJLvwEZfCx77ww` | `55C4T5rUCAZ4vGCG47ngJX4iWp6pxtnBisbknjoAWMvmx81zNv1tn7aChp8XnrvYJDuseszaUC2QMYWa8h2yobsX` |
| 3 | `4rr5GwqDVUFfJ3BMMVfrVtLb2dhKk2xZ5ts5jVb6C6ttDX2N6pJH3BrkkjAA2KskZ7A19FrZDbrZLyviKoiQeu6x` | `5c9WvBwms4QKB5UovWVtHNmrmS4czwCqRdzwSSegn12GoKRFvVjVPCkgirkKpJTAzdZ4YSppBZ8D4ZUaiAHUgE8V` | `5akiFQJJQego4BTApvmH1jdLS9zeJoaoXTzcfWGEuPufw2pWVGRxkDEz9KswxnUYrtPhbb9jAcGznShcJ3wdtq2H` |
| 4 | `4dCtGen5i2eaYoumkyFAspJUq9FZKAPjdtSwnQ3P7btfoyRzWuGEJ6SjbWCJ7yNVBiRjnrVMyiQywgh7mP7yERkf` | `3DFSQBrBRj2CJphGJnUmQqwG75sYJB76CVUJuQBcNckR2inGAU9QCre7jV2ZgN87fttZMLx6XKzMn8hSJbRUcDYf` | `2D9rP66TNcQyVKCcy1y1uNkNgkMzGyPWnXPGnbiLqRX6u39H7jBphX7bQQuur6jJDbjerDHmL5688YKqXqnjXKcY` |
| 5 | `4Jcz4xgz6A229sJ3gBCUKKkxTHsHWiLPZG4m2ZZH4M6eVWc4iJMgzu4Zz68GfJR828zCJftxt3vFfoBCvW4dQGVP` | `k4hCwYDNb5aVmKgSNFR7eCKWfPhdRci4WzSv45SQsZBupge7tpvyrLX4PSXgM8Bnh6y8WcNvGBLecp4XXjpcFbn` | `5tywCSMkeJ4HgzwdamGfwZNpo6CiPZpDU36bqAqDJExtmr8d5sA48XCg6UV5WSxsQ9cAeHUSKeMSVTrtXnJ9e9D5` |

Explorer: `https://explorer.solana.com/tx/<signature>?cluster=devnet`.

## Failures met today, and how the product behaved

Each was reported as UNKNOWN or refused, never as success, then fixed:
- guardian out of Devnet SOL (bootstrap refused by the system program); refilled;
- Pyth Pro key expired (PYTH_NOT_ENTITLED); new key installed;
- free RPC rate-limited (HTTP 429); dedicated RPC installed, campaign paced;
- workspace trade vault emptied (token program error 0x1); auto-refill added;
- production bundle stripped an Orca read error message; retry fixed.

## Not yet verified live

- Family presentation on a fresh workspace (code tested, same program path).
- Wallet-bound principal approval with Phantom (Ed25519 verification in the grant transaction is unit-tested).
- Pause then refusal path on the deployed API (unit-tested).

## Known limits

- Guardian and workspace delegates are server-held Devnet keys; the principal wallet signs approvals, the server signs the grant. Next step: principal wallet as on-chain guardian.
- Customer demand and pricing are not validated; discovery so far is expert evidence (see `research/`).
