# Cresco Family V3 — restore the original Vercel **journey**, not another long-form page

**Source of truth identified:** https://cresco-lac.vercel.app/ is the earlier Vercel demo, associated with the canonical `Faadil1/cresco` source on `main` (see `apps/web/README.md`). The live Vercel page could not be fetched from this review environment; the analysis below is **grounded in the original source code** rather than an unverified live session. The user's 2026-11-01 video records the local V3 and confirms that its goal/learning screens behave like tall single forms.

## What to keep from the *original implementation* (verifiable source)

| Original file (main branch) | Confirmed UX pattern | V3 adaptation |
|---|---|---|
| `apps/web/src/components/onboarding.tsx` | `OnboardingFrame`: **max-width 620 px**, centered title, step counter/progress bar, real Back action, **sticky primary footer** | Create a **single-purpose scene frame** for the V3 Family entry, maintaining one choice per screen and a persistent next action |
| `apps/web/src/app/onboarding/goal/page.tsx` | Dedicated illustrated goal chooser; Next navigates to a different URL | Give the dream its **own scene** with immediate illustrated choices and a visible next action; do not stack interests and savings below |
| `apps/web/src/app/onboarding/interests/page.tsx` | Separate optional interests, explicit “Skip for now” | Separate optional interests and their consequence, preserving order-of-discovery without asking for names or age |
| `apps/web/src/app/onboarding/ready/page.tsx` | Distinct recap/“You're all set”, then one launch CTA | Warm transitional scene before the first child lesson; explain pretend credits and Parent simulation |
| `apps/web/src/components/learning.tsx` | `ModuleRow` distinguishes the current lesson, completed and locked; `LessonProgress` shows steps; lesson reading one item at a time | First lesson takes visual priority; full catalog under secondary access. Keep the existing correctness feedback and original authored lesson material |

## Why the draft V3 felt like “one page”

- `apps/web/src/components/family-story-goal.tsx` currently stacks **goal + interests + saving** within `/try/goal`.
- `apps/web/src/components/family-story-learn.tsx` shows next lesson plus **all nine lesson cards** on its hub.
- `apps/web/src/components/family-story-welcome.tsx` includes the intro, Parent/Teen role cards and **the full seven-chapter index**, which reads as navigation/documentation instead of an unfolding story.
- The shared `StoryFrame` adds a prominent seven-chapter rail to the opening experience, turning the narrative into a website sitemap even though the URLs technically differ.
- Automated Playwright tests prove routes, assertions and permission isolation, **not experiential parity**. Passing 44/44 was never evidence that the previous story was restored.

## V3 story-flow target (faithful to old *interaction grammar*, not old backend)

1. **Invitation (Parent/Child illustrated story)** — one hero and one “Begin” CTA. Optional exploration/admin tools remain discoverable but secondary.
2. **My dream** — three illustrated choices, then Next. Child should not see interests or credits on this screen.
3. **My world** — optional interests, then Next/Skip. Matching fictional character stories later in Explore.
4. **Ready for chapter one** — confirmation of selected dream, small narrative transition, one “Start learning” CTA. Practice-only disclaimer is visible.
5. **One lesson scene** — illustrated thought, question, immediate feedback; avoid a full course catalog above/beside the actual scene.
6. **Meet Mina** — a fictional character with a dilemma before financial data, with answer and reaction visible without losing her story.
7. **Choose / Parent's moment / Outcome / Together** — retain actual, tested 15/25 credit boundary, one-time simulated Parent approval, exact outcome and conversation; display each human decision as its own scene with clear next action.

**Not blindly carried from old:** Email entry, child name/age, real investment workflow, backend auth, wallets or Devnet. The Family V3 is a fictional browser-only prototype, no persistence across full reload, no verified guardian identity.

## Acceptance: stop calling V3 “story restored” until all are proven

- One single main action per *opening* scene at **390×844** and desktop. No goal+interests+savings stacked in the same DOM/page. Back and Next navigate to visibly distinct scenes, URL differs and in-browser story state remains intact.
- Progress resembles `OnboardingFrame`, not seven navigation tabs. After Next the next viewport must be a **new scene**, not a scroll to the next content section.
- Choice of dream changes the first learning moment; fictional characters remain recognizable in later scenes.
- The optional catalog, risks, references and research must remain reachable; **not** placed above the story.
- Keep exact-release isolation tests: no API, RPC, wallet, account, server write or unguarded route. Browser tests check both scene boundaries and user-facing screenshots, not just page headings.
- Manual Founder comparison of original Cresco Vercel versus locally built V3 and a real Parent/Child pilot. CI is not a substitute.

## Implementation/rollback boundary

As of **2026-11-01** the short-lived speculative three-scene goal edit was **fully reversed** on PR #119. Verified via GitHub compare: **no net code diff** versus baseline `46d4eaa04e108c4b65bd249b5b930655821eef87` before adding this document. This deliberately avoids leaving broken routes/tests between design directions. Next implementation should be an **old-source-derived** change with a targeted old-vs-new visual check and exact-commit CI.

**NO MERGE. NO PUBLIC V3 DEPLOY. NO alteration of V2 or historical Colosseum/Stocklana Workers.**
