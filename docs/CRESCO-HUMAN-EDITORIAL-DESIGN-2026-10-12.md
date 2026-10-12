# CRESCO Human Editorial — implementation and truth boundaries

Date: 2026-10-12 · Branch: `design/cresco-human-editorial-unified-20261012` · PR #51

## Decision / owner-selected direction

CRESCO remains **one product**. The new visual direction inherits the approachable human illustrated character of the original Family/Teen Vercel site, in a more mature warm editorial system. The parent and teenager should be recognizable people rather than abstract fintech shapes. The interface must remain straightforward on mobile and accessible, never mistake an illustration for live proof.

This change is **authored SVG/React/CSS source**, not an AI-generated screenshot used as the application. No remote imagery, unsourced photography or hotlinked image dependencies. Illustrations are built into React and can be recolored, resized and reused. SVG depiction of fictional people is *illustrative*, never a verified photograph.

## Shared language

- Background ivory `#fbf8f1`; surfaces parchment `#fffdfa`; foreground deep navy `#10253d`.
- Forest primary `#195a3c` and sage `#367d56`; warm peach, ochre and lavender for emotion; muted blue for secondary information/evidence.
- Typography: Instrument Serif for empathetic editorial headings, Inter for readable body, UI and financial data.
- Human illustration: coherent parent/teen characters, warm sunlight, layered room setting, softly textured gradients, clean real UI cards separately rendered as HTML.
- Shared components: `family-story.tsx` exports `FamilyStoryScene` and reusable `StoryVignette`; illustration palette follows design tokens; `CrescoMark` combines growing leaves and a firm boundary.
- Truth/semantic colors: failure still red, warning still amber, success still green, UNKNOWN still explicitly labeled. Never use celebratory green to portray an unconfirmed financial event.
- Motion restrained; reduced-motion existing global rule stays active. All decorative storytelling must not block keyboard or screen-reader navigation.

## Implemented coverage in this PR

| Surface | Treatment | Operational boundary |
| --- | --- | --- |
| `/` | family/teen lead, original editorial hero illustration, HTML example cards, four-part guided story, equal access to Capital | Illustration is labeled; links preserve live vs legacy Family distinction |
| `/how-it-works` | editorial intro, role-specific contextual illustrations alongside the actual 3-step mandate rail | Keep interactive state machine and exact transaction logic unchanged |
| `/start`, `/parent/sign-in`, onboarding routes | contextual illustrated entry and shared warm onboarding frame | Demo session copy, auth, and navigation retained |
| `/home` and Teen app shell/navigation | warmer role surfaces and contextual Teen illustration on desktop | Practice/Money modes and their source data unchanged |
| `/parent` and parent routes | Family editorial banner, warm parent shell, navigation and role badge | Parent approvals and limit controls unchanged |
| `/learn`, lessons, investment, profile and other child routes | shared palette/illustration recoloring, shell and component surface consistency | Financial charts retain data semantics; no synthetic data |
| `/worlds-fair/desk` | warm shared workspace shell, contextual Family vs Capital entry illustration and token-isolated roles | No guardian/wallet/workflow logic altered |
| `/worlds-fair` | aligned palette in technical lab; proof and runtime states remain primary | No fake LIVE claim or visual substitute for receipts |

## Correctness and negative boundaries

- The chosen visual concept originally contained examples about driving, location or being home late. Those are **not** the current proven CRESCO Financial Key product. Implementation uses real applicable concepts: parent-set allowance, teen investment, program refusal, exact one-use exception.
- Illustrative UI amounts (`$0.50`, `$0.75`) describe the example used in the explanatory workflow, *not* real account balances, a bank card, production custody or a particular visitor's account.
- Family legacy onboarding and v0.4 Family workspaces are not automatically one identity or data store. The routes remain distinct and no cross-role authorization is introduced.
- Developer checks: Node/API, TypeScript, ESLint, copy lint, Vitest, production build, browser WebKit and mobile navigation. Resolve all failures on the final PR commit, not on an older successful SHA.
- No modification to Solana, API semantics, keys, Guardian workflow, signing, live transactions, mainnet or production deployment.

## Promotion / human QA still required

1. Confirm FINAL SHA CI checks are successful after all commits.
2. Verify desktop and iPhone sizing in real hosted preview (hero illustration crops, labels, CTA tap targets, role navigation, no horizontal overflow).
3. Verify Family onboarding, Parent sign-in and Parent/Teen dashboard interactions; check non-technical comprehension of the exact boundary, and role transitions.
4. Verify that Capital landing and desk still show mandates/permissions and that the technical lab is readable, with no unsourced promises.
5. Confirm public runtime deployment binding and review real browser screenshots *after* owner-authorized merge/deploy.
6. If the illustration rendering needs further visual polish, refine vector paths and CSS in code. Do **not** substitute a whole-page bitmap; text and actions must remain semantic React DOM.

## Canonical gate classification (design PR scope)

- Shared brand and accessible role navigation: ACTIVE -> LOCAL/CI verification required.
- Product reality/external transaction: NOT TOUCHED; prior receipts keep their original evidence classes.
- Negative path/UNKNOWN/recovery: NOT TOUCHED; must remain operationally proven on the specific runtime.
- Runtime commit binding: BLOCKED pending approved deployment.
- Live browser/real tester feedback: BLOCKED pending canonical site verification.
- Mainnet/real custody: N/A, not claimed.

This is a code implementation candidate. **Do not declare public deployment or merge until explicitly authorized.**
