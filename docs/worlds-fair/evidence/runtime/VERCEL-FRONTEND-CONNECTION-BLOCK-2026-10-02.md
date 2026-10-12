# CRESCO World’s Fair — Vercel Frontend Connection Block

Date: 2026-10-02 local / 2026-10-03 UTC  
Status: **BLOCKED_EXTERNAL_CONNECTION_VISIBILITY**  
Truth state: **OBSERVED**

## Expected frontend project

Historical Benita handoff and frontend provenance confirm:

- frontend owner / hosting owner: `Benita2001`
- source PR: `Faadil1/cresco#1` — “feat: build Cresco consumer frontend experience”
- Vercel project name: `cresco`
- production URL: `https://cresco-lac.vercel.app`
- root directory: `apps/web`
- repository: `Faadil1/cresco`
- historical handoff: `docs/BENITA-FRONTEND-HANDOFF.md`
- deployment gate: `docs/CRESCO-BENITA-DEPLOYMENT-GATE.md`

The handoff explicitly assigns Benita ownership of the judge-facing frontend and **final frontend hosting**.

Source:
- `apps/web/README.md` on product main.

## Connector visibility check

Two Vercel connections are currently available in ChatGPT:

1. team `team_twDc66jGM0sPvNM4I5Huc0x7` (`faadil1's projects`)
2. team `team_b8hypzENtczjR7lfxn2y8L6Q` (`faadil's projects`)

Observed:
- direct lookup of project slug `cresco` in team 1 → `404 Project not found`;
- direct lookup of project slug `cresco` in team 2 → `404 Project not found`;
- direct lookup/fetch of `https://cresco-lac.vercel.app/worlds-fair` through both Vercel connections → deployment not found / connector may not have access;
- the currently visible `faadil1's projects` list contains other active projects but not `cresco`;
- the currently visible `faadil's projects` team exposes no projects.

## Interpretation

The frontend code is not the current blocker.

The blocker is that the frontend was historically hosted from Benita's deployment ownership context, while the currently connected Vercel accounts do not expose that project/team. No Vercel `projectId`, `teamId`, or committed `.vercel/project.json` is present in the repository history inspected, so the hosting account identifier was never transferred into GitHub.

No replacement project was silently created because doing so could:
- lose the existing production hostname;
- create a parallel deployment with a different origin;
- require a new CORS change/redeploy on the proven Cloudflare Worker;
- weaken runtime/commit binding.

## Required next action

Recover or reconnect the Vercel account/team used by Benita2001 so access includes:
- project `cresco`;
- domain `cresco-lac.vercel.app`.

The preferred path is to restore access to the existing Benita-owned deployment rather than silently creating a replacement project.

Once visible, the intended publication is:
- repository: `Faadil1/cresco`;
- branch: `main`;
- frontend root: `apps/web`;
- publish current World’s Fair route;
- verify `/worlds-fair`;
- execute browser UI→public API→Solana proof.

## Truth boundary

Hosted API→Solana is already proven live.

Judge self-serve remains blocked only by the public browser deployment edge and subsequent clean-room proof.
