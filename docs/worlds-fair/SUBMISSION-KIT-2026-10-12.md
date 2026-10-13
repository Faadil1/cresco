# CRESCO · Colosseum submission kit (2026-10-12)

Deadline: **Oct 12, 11:59 pm PT = Oct 13, 2:59 am ET**. Target: submitted by **2:00 am ET**.
Everything submitted must be in English. Colosseum asks for a 2 to 3 minute presentation video and a product demo video of 3 minutes or less.

Deck: the "CRESCO pitch deck" artifact (14 slides). Fill the Team slide (Benita's role) before recording. Share it from the deck's Share menu, or export it to PDF, before pasting a link in Arena.

---

## 0. Timeline tonight (ET)

| Time | What |
| --- | --- |
| 20:45 to 21:00 | Site check: home footer shows `build` + latest commit, quick visual pass. Phantom on Devnet with some SOL. Do not merge anything after this. |
| 21:00 to 21:30 | Record the pitch video (deck on screen, your voice). Two takes maximum. |
| 21:30 to 22:45 | Record the demo video on a **fresh** workspace. Rehearse once without recording. |
| 22:45 to 23:30 | Light edit (trim only), upload both videos (YouTube unlisted or Loom), check they play logged out. |
| 23:30 to 01:00 | Fill Arena with section 3, attach logo, links. |
| 01:00 to 02:00 | Re-read, submit. Screenshot the confirmation. |

---

## 1. Pitch video script (target 2:40)

Deck on screen, full screen. Speak slowly. Lines in quotes are what you say.

**[Slide 1 · Cover] 0:00 to 0:15**
"Hi, I'm Faadil, from Gatineau, Québec. This is CRESCO: act alone inside the rules, ask once above them."

**[Slide 2 · Problem] 0:15 to 0:40**
"When you hand someone money that isn't fully theirs, a teenager's allowance, or capital you give to a trading strategy or an AI agent, you get three bad options. Give full access and hope. Approve every small action yourself. Or raise the limit to allow one bigger action, and that exception quietly becomes permanent."

**[Slide 3 · One product, two settings] 0:40 to 0:55**
"CRESCO is one mechanism for both: a Solana program, code on the blockchain that holds the rules. Parent and teen, or allocator and agent: only the words change."

**[Slide 4 · How it works] 0:55 to 1:25**
"The parent, or the allocator, sets a line, here fifty cents per trade. Thirty cents: the teen or the agent acts alone, on Solana, nobody is asked. Seventy-five cents: the program refuses, and CRESCO writes one exact request. The parent approves that one action with their own wallet. It runs once, and the line is still fifty cents. Approving never widens the mandate."

**[Slide 6 · What is live] 1:25 to 1:50**
"This is live on Solana Devnet. Five out of five full cycles in a repeatability run, a median of 2.7 seconds to execute inside the mandate, and a live run where a parent's own Phantom wallet created the mandate, approved twice, paused and resumed it. Every step has a transaction receipt."

**[Slide 9 · What is new] 1:50 to 2:10**
"Spending limits exist: Squads, Safe, wallet policy engines. What's new is an exception that cannot grow: one exact action, used once, enforced in the same program that executes the swap, and invalidated on-chain when the rules change."

**[Slide 10 · Validation] 2:10 to 2:25**
"We're early and honest about it. Eric Lovold, founder of Sanction, who builds agent authorization, told us this one-exact-exception boundary is what excites him. Our first user tests opened today. No customers yet."

**[Slide 11 · Go to market] 2:25 to 2:40**
"Next, we test a fee per active mandate or per approved exception with agent builders and small funds, and a family plan once regulated partners hold real money. In 90 days: user tests, the wallet guardian by default, design partners, then a security review before any mainnet step."

**[Slide 13 · Team] 2:40 to 2:50**
"I'm a business performance analyst with an MBA in business analytics and a finance background, and I built CRESCO end to end. [One line on Benita.]"

**[Slide 14 · Close] 2:50 to 2:58**
"CRESCO: freedom inside the line, one exact yes above it. We're looking for design partners. Thanks."

Skipped slides (5, 7, 8, 12) stay in the deck for judges who read it. If you run long, shorten slide 2 first.

---

## 2. Demo video script (target 2:50, hard limit 3:00)

Technical and direct: what you built, how it uses Solana.

**Before recording**
- Private browser window, zoom 110 %, notifications off, only the CRESCO tab and Phantom.
- Phantom on **Devnet**, the guardian wallet has some SOL (if not, run the manual `devnet-fund-wallet` workflow first).
- Never show a workspace link or role token on screen (they are private). Blur them in the edit if they appear.
- Do one full dry run off camera, then record on a **new** workspace.

**Shots**

1. **0:00 to 0:08 · Home.** Scroll the home page once. "CRESCO has two settings, Family and Delegated capital, on one Anchor program, with Pyth, Orca, a Cloudflare Workers API and an MCP server. I'll run the Family setting on Devnet with my own wallet as guardian; for an agent, every step is the same."
2. **0:15 to 0:40 · Set the line.** Open the live family mandate (`/worlds-fair/desk?case=family`). Keep Maya (16), limit 0.50. Tick **"My wallet is the on-chain guardian (non-custodial)"**. Click **Create workspace**. The handoff screen shows private role links: scroll past fast or blur them in the edit. Click **Continue to the desk**. "Each person gets their own private link. The parent's wallet will be the guardian of the mandate on-chain, so the server cannot grant or change anything."
3. **0:40 to 1:05 · Create the mandate.** Parent view: **Connect the guardian wallet**, then **Create the mandate on Solana Devnet**. Phantom opens: sign. Wait for READY. "One wallet-signed transaction creates the charter, the mandate, the asset rule and the vaults in the CRESCO Anchor program."
4. **1:05 to 1:25 · Act alone.** **View as** Teen. Submit **$0.30**. Executed. Talk while it confirms (it can take several seconds). "Under the line the teen, or an agent, acts alone: an Orca swap, with the dollar limit checked against a Pyth price inside the program. No approval, no wallet prompt."
5. **1:25 to 1:45 · Refused, asks once.** Submit **$0.75**. Refused, request created, show the policy diff. "Above the line the program refuses. CRESCO turns the refusal into one exact request: amount, minimum output, price limit, deadline."
6. **1:45 to 2:10 · Approve exactly once.** **View as** Parent. **Approve exactly once**. Phantom: sign. Executed. Point at the limit: still $0.50. "The parent's wallet, or the allocator's, signs a one-use allowance bound to that request's hash. It executes once. The standing limit has not moved."
7. **2:10 to 2:30 · Receipts.** Open **History**, click one receipt, Solana Explorer opens on Devnet; point at the CRESCO program id `ABjE6V…` in the instructions. "Every step is a public Devnet transaction. An uncertain result shows as unknown, never as success."
8. **2:25 to 2:50 · Same program for agents.** Switch the use case to **Delegated capital** on the setup screen and show the role names (allocator, strategy or AI agent, risk owner). "For delegated capital it's the same program: an allocator, a strategy or AI agent, a risk owner. Agents can act through our MCP server, whose tools cannot approve or widen their own limit."
9. **2:50 to 2:58 · Close.** "Code, receipts and who enforces what are in the GitHub repo. Thanks."

Not in the video: after recording, on the same workspace, click **Revoke** in the Parent view (Phantom signs), then try $0.30 as the Teen: it must be refused. Screenshot the history with the transaction links; that proves revoke in wallet mode live.

**Words to avoid:** "mainnet", "real money", "customers", "production", "audited". Say "Devnet", "demo tokens".
**Prices:** say "live Pyth" only if the screen shows "Live · Pyth"; otherwise "last published Pyth price".

---

## 3. Arena fields (copy and paste)

**Product name**
CRESCO

**One-liner**
Act alone inside the rules. Ask once.

**Short summary**
CRESCO lets a teenager, a trading strategy or an AI agent act alone with money that is not fully theirs, inside limits enforced by a Solana program. Above the limit, it asks once: the parent or allocator approves one exact action with their wallet, it executes once, and the standing limit never moves.

**Description (long)**
Handing over money today is all or nothing: give full access, approve every action, or raise the limit for one exception and keep it raised forever.

CRESCO is one mechanism for two settings. In Family, a parent sets a line and a teen invests alone under it. In Delegated capital, an allocator sets a mandate and a strategy or AI agent trades alone inside it. Same program, same flow.

How it works: an action under the line executes directly (Orca swap, dollar limit checked against a Pyth price inside the CRESCO Anchor program). An action above the line is refused by the program and becomes one exact request. The principal approves it with their own wallet: the program creates a one-use allowance bound to the request hash (amount, minimum output, price limit, deadline, mandate nonce). It executes once. The standing mandate is unchanged, and any rule change invalidates older allowances (proven in the live 7-scenario lab run). A paused mandate is a hard stop with no exception path (proven live with Phantom).

Live on Solana Devnet (Oct 12, 2026): 5 of 5 full cycles in a repeatability run against the deployed API; median 2.7 s to execute inside the mandate; an opt-in wallet-guardian mode verified with Phantom, where the parent's wallet created the mandate, approved two exact exceptions, paused and resumed, and a paused mandate was refused on-chain. Receipts and a "who enforces what" table are in the repo.

Product: a Family app (learn, explore, practice, parent controls), a live multi-role workspace for Family and Delegated capital with one private link per role, an API, and an MCP server so AI agents can act without being able to approve or widen their own authority.

Truth boundary: Devnet only, demo tokens, no custody, no customers or revenue claimed yet.

**Blockchains and tools**
Solana (Devnet), Anchor, Pyth (price verified on-chain; Hermes for learning prices), Orca Whirlpools, Phantom, SPL Token, Cloudflare Workers and Durable Objects, Next.js (vinext), Model Context Protocol (MCP).

**Team**
- Faadil Boussari, founder. Business performance analyst in public transit (Gatineau). MBA in Business Analytics (Université Laval), B.Sc. in Finance (UQO). Designed and built CRESCO end to end: Solana program integration, API, web app, MCP server.
- Benita [last name], [role]. [Background in one or two lines.]

**Location**
Gatineau, Québec, Canada

**Logo**
The CRESCO mark from the site (sprout + wordmark). Export a square PNG at 512 × 512 or larger.

**GitHub**
https://github.com/Faadil1/cresco (public; start at `docs/worlds-fair/README.md`)

**Live product**
https://cresco.faadil-casecraft.workers.dev

**Go-to-market**
Delegated capital first for revenue: builders of trading bots and AI agents, small funds and DAO treasuries, reached through the API and MCP server so an agent gets a bounded mandate in a few calls. Model to test: a fee per active mandate or per approved exception. Family for reach: a free learning and practice app where parents join to set the Key; a paid family plan once real-money accounts can run through regulated partners.

**Demand validation**
Expert interview and written testimony from Eric Lovold, founder of Sanction (agent authorization): "What I find exciting about CRESCO is the ability to approve one exact exception without widening the agent's standing mandate." Public discovery on delegated trading, treasury operations and agent builders (in the repo, contacts redacted). First round of external user tests opened on Oct 12 (comprehension, navigation, blockers); results pending. No customers, revenue or willingness to pay are claimed yet.

**Distribution**
Developer channels first: open-source repo, MCP server listing for agent frameworks, API docs and example client; Solana ecosystem communities and wallet partners for the non-custodial guardian mode; parents through the free learning app.

---

## 4. Final checks before you click Submit

- [ ] Both video links open in a logged-out window and are under 3:00.
- [ ] Deck link opens for someone else (shared or PDF).
- [ ] GitHub repo is public (or hackathon@colosseum.com has access).
- [ ] No role token, workspace link or private key in any video, screenshot or text.
- [ ] Every claim matches: Devnet only, Phantom LIVE, 5 of 5, 2.7 s, no customers.
- [ ] Team slide and Arena team field filled for Benita.
- [ ] Submitted by the team leader, confirmation screenshot saved.
