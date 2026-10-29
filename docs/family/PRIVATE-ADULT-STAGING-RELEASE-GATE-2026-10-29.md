# CRESCO Family — Private Adult Research Staging Release Gate (NOT a deployment authorization)

**Date:** 2026-10-29 | Owner approval: **NOT YET RECEIVED**
**Current status:** CODE/CI CANDIDATE ONLY; no Family Worker is live, and no authentic two-device hosted proof exists.

## Immutable boundaries

Historical Colosseum Workers `cresco` and `keys-api-stocklana` remain FROZEN, as does their production-triggering `Faadil1/cresco:main`. All work here is **stacked, draft Family-only PRs** (#99, #100, #101, #102, #103, #104). Do not merge to `main`, alter those Workers, share a historic financial API token, or deploy a new Family product under a historic Worker service name or binding.

The only proposed *new* service identities are `cresco-family-web` and `cresco-family-api`. Family Practice uses its own `FAMILY_PRACTICE_STATE` DO and **separate** `FAMILY_PRACTICE_INVITE_GUARD` singleton DO; they are not aliases for a Colosseum vault or the Devnet Family lab.

## Gate A — cloud account and source attestation (currently NO-GO)

- [ ] Owner verifies live Cloudflare account ID, OAuth identity/permissions, exact existing Worker names, deploy triggers, routing, bindings, and private access policy using read-only API and dashboard evidence.
- [ ] Confirm no custom routes or deployment aliases overlap historical `cresco` or `keys-api-stocklana`.
- [ ] Lock a reviewed, full SHA that includes all required stacked Family PRs, never historical `main`.
- [ ] Explicitly document **which new branch/build configuration** will source each new Worker and how to roll back independently.
- [ ] Run a final historical Wrangler Git-blob fingerprint guard and diff original Workers again.
- [ ] Establish **non-public/private access controls** (e.g. vetted access identities and Cloudflare Access, or equivalent). The invite code alone is NOT enough to identify a caregiver or protect private endpoints from automated probes.

## Gate B — secrets and denial of abuse (currently NO-GO)

- [ ] Independently generate distinct high-entropy server secrets for `CRESCO_FAMILY_PRACTICE_INVITE_TOKEN` and `CRESCO_FAMILY_PRACTICE_OPERATOR_TOKEN`; do not reuse wallet signing seeds, Devnet credentials, historical API keys or Solana secrets.
- [ ] Provision as **encrypted Cloudflare secrets to the NEW Family API Worker only** after Gate A. Never put plaintext in git, Wrangler vars, web build, URL parameters, screenshot, X or project discussion.
- [ ] Verify server quotas: **6 valid invite issuances per UTC day, 20 per 32-day quota window**. Reservations are consumed even if creation later fails. New secret rotation does not bypass shared quota singleton.
- [ ] Deploy externally enforced WAF/rate controls for **invalid invite guesses, unauthenticated read/write probing, scripted request bursts**, and observability that redacts auth/invite/operator header values. Current in-app quota only limits *valid* invitations.
- [ ] Confirm operator close is CLI-only (no Origin), requires a separate secret, and targets only exact `cresco-family-api.faadil-casecraft.workers.dev`; never historic addresses.
- [ ] Threat review Parent code compromise, Teen code replacement, lost rotation response, operator compromise, session UUID disclosure, denial-of-service and potential account lockout.

## Gate C — privacy and legal research (currently NO-GO)

- [ ] Publish understandable FR/EN research notices covering fictional credits, crypto transparency, no custody, no real assets, who holds the role code, and no legal guardian identity verification.
- [ ] Document live data expiry: per-exercise DO schedules day-7 deletion; Parent can erase earlier; operator emergency closes a compromised practice. Verify deletion and old-code denial on deployed DO **without equating active deletion with backup/PITR erasure**.
- [ ] Obtain Cloudflare SQLite Durable Object PITR/recovery and logs retention information, plus legal review of research consent, purpose, records, deletion and data localization for the actual first adult research country.
- [ ] Run an invitation protocol with **consenting adults only and fictional children**. No collection of children's names, dates of birth, financial data, wallet keys, school, investment amounts or identity data. For real children, first perform jurisdiction-specific guardian/age/privacy/safeguarding work, which is still undone.
- [ ] Ensure there is a genuine feedback contact route with human staffing before advertising human support. No AI trading agent, financial advice or live youth investments.

## Gate D — exact SHA CI & physical test (currently incomplete)

- [ ] Node role, concurrent quota, invitation outage, token rotation, operator close and seven-day expiry suite passes on the selected SHA.
- [ ] Web typecheck, unit, lint, copy lint and existing WebKit pass.
- [ ] **Distinct Family WebKit two-context test** passes on Family-only build. This is a MOCKED API, not hosted proof.
- [ ] New Family Web and API Wrangler dry-runs pass; historic guard passes.
- [ ] After review and **separate explicit owner authorization**, create only *new staging* Workers on isolated names and verify exact SHA fingerprint, DO bindings, encrypted secrets and access.
- [ ] Use two separate physical devices and adult tester sessions; verify 100→80 / 0→20 fictional credits, request Parent can decline/approve **discussion only**, read history across sessions, app/background/refresh/reconnect, invalid Role 403, replay 409, unknown writes blocked, revoke Teen and operator emergency closure. No money or Solana writes.
- [ ] Capture privacy-safe evidence (SHA + task/result + timestamp + status, no access codes or identifiable participants) and record failures as regressions.

## Gate E — responsible user research

- [ ] Co-founders approve exact trial copy, adult-only recruitment method and consent information.
- [ ] Recruit 5–8 adult caregivers via networks such as Superteam, with no invitation to minors or request to post child's private details.
- [ ] Ask the unprompted first-impression question: “Who makes decisions in Cresco and who sets the bounds?”; capture misunderstandings, trust, completion, declined actions and requests for help.
- [ ] Fix the most consequential observed failure, retest, then publish only permissioned and anonymized factual learnings.
- [ ] X / Colosseum should state “adult-only fictional practice prototype; no real investment accounts.” Do not imply regulatory approval or users until evidence exists.

## Operator incident procedure — drafted, not executed

If a Parent code is suspected compromised during a future authorized private staging session, the owner either uses the still-secure Parent role to explicitly end the exercise or, if the Parent role itself is compromised, invokes the **CLI-only** `scripts/family-practice-operator-emergency-close.mjs` on that known fictional practice UUID, using a previously provisioned **separate** operator secret from the environment and the mandatory confirmation flag. The script pins the exact new Family API hostname, refuses historic Workers, never prints the token and requires server acknowledgment; if UNKNOWN, do not claim the code is revoked. No operator key is present in this repo or has been provisioned by these PRs.

## Verdict

- **Source capability:** Parent/Teen fictional practice + cleanup + bounded invitations + Teen-code rotation + emergency erasure.
- **CI:** use **exact PR SHA**, not an earlier green revision.
- **Cloudflare staging:** **NO-GO** until Gates A/B/C and release authorization.
- **Real minors / real money / worldwide financial launch:** **NO-GO** independently of the staging outcome.

**This runbook is not permission to deploy.**
