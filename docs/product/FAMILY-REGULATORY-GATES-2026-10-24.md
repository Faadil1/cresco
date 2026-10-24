# CRESCO Family — Canadian/Québec regulatory gates
Date: 2026-10-24 | Status: ISSUES_TO_RESOLVE, NOT LEGAL ADVICE | Draft PR #66, no production authorizations.
Start with Canada/Québec because user is located in Québec; international expansion is OUT_OF_SCOPE and NOT automatically licensed.
This document lists official authority sources and questions, not a determination of CRESCO's legal classification. Product already uses Devnet demo credits, not real banking/brokerage.

## 1. Three legally different product configurations
| Mode | Actual user capability | Main unresolved classification and authority questions | Practical release state |
| --- | --- | --- | --- |
| Practice-only education and simulation | Mock balances, sample market data, lessons, no financial asset purchased or money accepted | Children's data consent and privacy, youth-oriented claims, misleading simulation or personalized advice | Can test with consenting adult users; real account still requires privacy/security design |
| Partner-led parent-funded experience | Parent opens/owns relevant account at eligible licensed financial institution; CRESCO could offer teaching, preflight controls and family permissions | Are API instructions discretionary investment advice, order origination, dealer activity or securities facilitation? Who is registered? Asset suitability, ownership and custody? Can minors participate or only see simulations? | Concept only until licensed partner and counsel confirm actual product and role allocation |
| CRESCO directly receives/trades/holds money or crypto | Direct fiat/card on-ramp, deposits, asset purchase, wallet custody or money services | Québec AMF/CSA dealer/platform/securities and virtual-currency regulations; FINTRAC money services classification; KYC/AML sanctions; withdrawals, safeguarding and dispute liability; minors' rights | NO-GO for real assets absent counsel, registration/authorized provider and independent code audit |

There is no legal exemption merely because money flows through Solana or a product uses a non-custodial label. Tokenized “stocks” may or may not convey share ownership; exact rights and licensing must be verified issuer-by-issuer.

## 2. Privacy of children — immediate design gate EVEN WITH ZERO REAL MONEY
- **Québec Law 25 / CAI private-business guidance:** collection of personal information from a minor below 14 requires parent/tutor authorization except limited manifest-benefit exception; for 14+ the legal framework permits consent by adolescent or parent subject to meaning/sensitivity. Primary: https://www.cai.gouv.qc.ca/protection-renseignements-personnels/information-entreprises-privees/consentement-personnes-entreprises and https://www.cai.gouv.qc.ca/protection-renseignements-personnels/sujets-et-domaines-dinteret/principaux-changements-loi-25 .
- Québec also requires privacy impact assessment (EFVP/PIA) for development/refactoring of a system processing personal data. https://www.quebec.ca/nouvelles/actualites/details/loi-25-sur-la-protection-des-renseignements-personnels-des-citoyens-du-quebec-entree-en-vigueur-de-nouvelles-dispositions-qui-font-du-quebec-un-chef-de-file-mondial-50726
- **NEW, October 20, 2026:** Office of Privacy Commissioner of Canada published Canada's first Children's Privacy Code as privacy **expectations/guidance under applicable privacy law**, not a blanket claim of a standalone new Act: https://www.priv.gc.ca/en/opc-news/news-and-announcements/2026/nr-c_261020/ and https://www.priv.gc.ca/en/privacy-topics/privacy-for-businesses/protection-of-children-for-businesses/childrens-privacy-code/children-code-final-report-2026/ .
- Implement: adult first, valid consent before child profile collection, opt-in optional processing, minimal child info, default private, separation of guardian authority and child account, household deletion/retention/access rights, no public onchain raw child event logs, no “earned trust” score on minors. Do not store passphrase/bank ID in third-party LLM research packets.
- Scope note: cross-border processing and personal data of children in other provinces/US require a separate applicability analysis. This memo is not complete multi-jurisdiction advice.

## 3. Tokenized equities and investing — conditional gate
- AMF on crypto platforms and dealer registration: https://lautorite.qc.ca/grand-public/registres/plateformes-de-negociation-de-cryptoactifs
- AMF on innovative financial companies: https://lautorite.qc.ca/professionnels/fintech-technologie-financiere/entreprises-ayant-un-projet-novateur . Relevant official channel for **regulatory clarification**, not pre-approval.
- CSA Project Tokenization launched in 2026, research on tokenized financial instruments and investor protections: https://www.securities-administrators.ca/news/csa-invites-stakeholders-to-participate-in-tokenization-initiative/ ; status https://www.securities-administrators.ca/csa-activities/csa-finhub/collaboratory/
- Before any customer asset purchase or ‘Money Mode’ real: enumerate share/beneficial-rights/loan participation rights for each token, geographical eligibility, whether parental brokerage account may legally authorize action of a minor, custody, settlement and investor disclosures, registered intermediary duties, suitability/financial advice/advertising boundaries, cancellation/refund rights.
- Simulation and Devnet demo tokens do not demonstrate compliance, securities ownership or actual money transfer.

## 4. Transfers / virtual currency / money services — conditional gate
- FINTRAC activity-based MSB/FMSB assessment: https://fintrac-canafe.canada.ca/msb-esm/questions/2-eng and https://fintrac-canafe.canada.ca/msb-esm/register-inscrire/reg-ins-eng .
- Determine actor, flow of funds, custody, exchange, fiat on/off ramps, redemption, support and thresholds; engage qualified counsel for specific offering before choosing payment connector.
- No automatic ‘Stripe solves it’ assumption. Mock settlement lifecycle `INITIATED -> PENDING -> SETTLED / FAILED / UNKNOWN` with idempotency, refund/reversal and withdrawal cases before any authorization to accept funds.
- Security independent review of onchain and backend authority is a separate launch precondition; static audit has unresolved legacy exception binding, cap, counter-reset, guardian and recovery gaps.

## 5. Company financing — deliberately private
Fundraising, the award invoice/allocation, budgets, founder governance, grants, debt or investor positioning are separate from production/legal product readiness. Their due diligence is stored exclusively in private `Faadil1/cresco-company`; no sensitive personal/team financing decisions are placed in this public repository. Funding never itself grants authority to use real money, securities or minors' personal data.

## Concrete regulatory questions for a qualified Québec securities/privacy lawyer / potential regulated partner
1. Is our proposed first paid product solely a parenting simulation/education service, or does any UI/API functionality cross into advising, trading, custody, transfer, delegated order origination or dealer activity?
2. How may a verified parent invite a user aged 10–15 and control/view account info under Québec Law 25 / federal law without disclosing more data than necessary?
3. If asset representation uses tokenized equities, who owns underlying rights, what limits minors from participating, and what jurisdiction/customer eligibility controls exist?
4. Which regulator licenses/registers which exact counterparties and whose KYC/AML/recordkeeping system applies?
5. Who holds custody and withdrawal authority? What recourse, refunds, chargebacks or reversals exist? What happens on provider insolvency or lost credentials?
6. What can we **test in a production-like sandbox without accepting user money** and what consent/disclaimer/privacy instrument is necessary?

## Decision
PRIORITY_0 = finish **adult-first Family auth, consent, household binding and demo comprehension**; parallel counsel/partner discovery; separate company fundraising in private. Do NOT block pure Practice testing on a premature brokerage build. Real deposit/payout remains BLOCKED. Keep Family/Capital product possibilities open, no silent market pivot and no confidential founder money facts in public Git.
