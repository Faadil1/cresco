# Cresco Family public practice — feature-parity and evidence ledger

**Status:** DRAFT candidate in PR #114; not merged, not deployed. Updated 2026-10-30.
**Comparators:** original source paths in the same `Faadil1/cresco` repository; owner-recorded 2026-10-30 video showing rich Cresco UI; existing public Family PR #111.
**Isolation:** This document describes the new Family-only **browser simulation**. It does not establish authenticated Parent/Child profiles, custody, tradable securities, current market data, real financial permission, or a dual-device product.

| Product capability | Historical Cresco source | Candidate PR #114 | Remaining gaps / limitations |
| --- | --- | --- | --- |
| Parent/Child profile spaces | `(child)/home`, `parent/(dash)/page` | Two independent visible role workspaces, role switcher, shared in-tab state | No verified identities, independent devices, sessions, email or invitations |
| Child learning | `mocks/learning.ts`, `lesson/[id]/player.tsx`, `illustrations/scenes.tsx` | Three intro modules plus six **original multi-concept, illustrated, official-source-linked** lessons and real quiz completion | Full sequential historical lesson-player animations, all curricula, optional XP details and all past screens remain incomplete |
| Parent learning | Parent dashboard previously summarized child's progress only | Five separate Parent lessons, individual progress and role-specific explanations | Parental learning content needs hands-on external parent feedback and further vetted jurisdiction-specific references |
| Explore | `(child)/explore` company list, market integrations | Three explicitly fictional educational instruments, categories, risk descriptions and practice amounts | Search/filter, deep companies, full historical discovery and live market data intentionally not present |
| Practice execution | Historical practice/money execution services and bounded policies | In-memory fixed-price practice buys, independent in-bounds action, blocked out-of-bounds request and receipt with non-execution label | No backend writes, finance rails, market quotations or account persistence by design |
| My Key and exact exception | `domain/policy.ts`, Parent limits/requests | Version/nonce standing practice Key; asset/amount exact request; approval once, refusal, explicit parent changes, stale/replay protection | No legal authorization, cryptographic enforcement, actual wallet or guardian credentials |
| Practice Portfolio | `(child)/portfolio`, `components/finance.tsx` | Holdings by original fictional practice-cost, percentages and hypothetical stress scenarios; live practice receipts | Historical multi-period portfolio charts and market data integration excluded; scenario assumptions are entirely hypothetical |
| Progression and goals | Goal art, missions, streaks, badge illustrations | Bike goal, child/parent learning counts, earned illustrated badges linked to actual choices | Custom goals, authentic calendar streaks, complete missions and account-based longitudinal progress missing |
| Learn Together | No separate complete interactive loop identified | Separate Child and Parent discussion answers with a shared review/check-in, independent from Key | Real cross-device family collaboration and durable plans not implemented |
| Public access | Family PR #111 allows `/`, `/try` only | Same route allowlist; full studio rendered inside `/try`, one-click, no sign-in | Must pass phone/desktop tester comprehension review |

## Release and risk controls
- Do not edit or deploy the Colosseum Worker or historical `main` deployment configurations.
- Do not merge PR #114 or redeploy `cresco-family-web` without subsequent review and explicit authorization.
- Legacy web routes remain denied on the independent Family Worker; adding UI does **not** authorize simply unlocking `/learn`, `/home`, `/parent` or `/invest`.
- Personal data: no newly introduced cookies, login, location, API calls, wallet access or per-user persistence. Family role switch is **fictional**. Refresh resets the studio.
- The parent and child contributions to Learn Together are practice prompts, never permissions. Parent learning completion must never automatically widen the practice Key.
- Portfolio scenario prices and percentages are intentionally invented for education, not market data, advice, investment returns or executable transactions.
- Original educational-source verification dates from existing curriculum remain visible, with U.S.-educational-context disclosures. A later formal product requires revalidation of claims, jurisdiction and literacy testing.

## Test evidence to check before release
The draft branch executes the following in GitHub Actions:
1. Node unit tests of exact permissions, financial non-execution, role-separated learning and portfolio scenario calculations.
2. Family isolation compilation; historical API route-deny tests.
3. Local Cloudflare Worker `family-public-browser-no-login` iPhone WebKit tests: independent learning, parent/child discussion, original curriculum, allowance approval, no backend requests, and reload reset.
4. Web lint/copy-lint/typecheck/build/Playwright.
Record exact **HEAD SHA** and CI conclusions in PR #114 after the final run; green checks on earlier commits are insufficient.
5. Independent human tester observations: can a child explain Practice vs Money, can a parent distinguish Approve Once from raising the standing Key, and can both find their Learning Paths without instructions?

**Current verdict:** Better feature coverage than the 1-minute preview; **not yet proven as full historical Cresco parity or production-ready service.**
