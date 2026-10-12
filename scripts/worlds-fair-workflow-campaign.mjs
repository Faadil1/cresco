#!/usr/bin/env node
// Repeatability + operational-economics campaign for the World's Fair workflow.
//
// Runs N full product cycles against a deployed API and reports pass rate,
// per-step latency and (optionally) Devnet fees. One green run is not
// reliability: the report states the predeclared threshold and whether it held.
//
// Each cycle (operator + principal tokens of one bootstrapped workspace):
//   1. standing intent (expected ALLOW)
//   2. soft-boundary intent (expected PENDING_PRINCIPAL with Policy Diff)
//   3. principal APPROVE (expected EXECUTED, allowance consumed, mandate unchanged)
//   4. replay of the decision (expected 409 REQUEST_ALREADY_DECIDED)
//
// Live usage (writes to Devnet; a protected action, run it deliberately):
//   CRESCO_API=... WORKSPACE_ID=... OPERATOR_TOKEN=... PRINCIPAL_TOKEN=... \
//   [SOLANA_DEVNET_RPC_URL=...] node scripts/worlds-fair-workflow-campaign.mjs --cycles 5 --threshold 0.8
//
// Self-test without network (used by CI): --self-test

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const flag = (name, fallback = null) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] ?? true : fallback;
};

export async function runCampaign({ request, cycles, threshold, standingAmount, boundaryAmount, feeLookup = null, now = () => Date.now() }) {
  const results = [];
  const latency = {};
  const record = (step, ms) => (latency[step] ??= []).push(ms);
  const timed = async (step, fn) => {
    const t0 = now();
    const value = await fn();
    record(step, now() - t0);
    return value;
  };

  for (let i = 1; i <= cycles; i += 1) {
    const cycle = { cycle: i, steps: {}, pass: false, signatures: [] };
    try {
      const allow = await timed('standingIntent', () => request('POST', '/intents', 'operator', { action: 'SWAP_EXACT_IN', inputAmount: standingAmount, maxSlippageBps: 100 }, `campaign-${Date.now()}-${i}-a`));
      cycle.steps.standing = allow.body.decision ?? `HTTP_${allow.status}`;
      if (allow.body.receipt?.signature) cycle.signatures.push(allow.body.receipt.signature);

      const pending = await timed('boundaryIntent', () => request('POST', '/intents', 'operator', { action: 'SWAP_EXACT_IN', inputAmount: boundaryAmount, maxSlippageBps: 100 }, `campaign-${Date.now()}-${i}-b`));
      cycle.steps.boundary = pending.body.decision ?? `HTTP_${pending.status}`;
      const rid = pending.body.request?.id;

      let decided = null;
      if (rid) {
        decided = await timed('approve', () => request('POST', `/requests/${rid}/decision`, 'principal', { decision: 'APPROVE', note: `campaign cycle ${i}` }));
        cycle.steps.approve = decided.body.request?.status ?? `HTTP_${decided.status}`;
        for (const s of [decided.body.request?.grant?.signature, decided.body.request?.execution?.signature]) if (s) cycle.signatures.push(s);
        const replay = await timed('replay', () => request('POST', `/requests/${rid}/decision`, 'principal', { decision: 'APPROVE' }));
        cycle.steps.replay = replay.body.error ?? `HTTP_${replay.status}`;
      }

      cycle.pass =
        cycle.steps.standing === 'ALLOW' &&
        cycle.steps.boundary === 'PENDING_PRINCIPAL' &&
        cycle.steps.approve === 'EXECUTED' &&
        decided?.body.request?.execution?.allowanceConsumed === true &&
        decided?.body.request?.execution?.standingAuthorityChanged === false &&
        cycle.steps.replay === 'REQUEST_ALREADY_DECIDED';
    } catch (error) {
      cycle.error = String(error?.message ?? error).slice(0, 300);
    }
    results.push(cycle);
  }

  let fees = null;
  if (feeLookup) {
    const all = results.flatMap((c) => c.signatures);
    const lamports = [];
    for (const sig of all) {
      try {
        const fee = await feeLookup(sig);
        if (Number.isFinite(fee)) lamports.push(fee);
      } catch {
        /* fee lookup is best-effort */
      }
    }
    fees = lamports.length
      ? { transactions: lamports.length, totalLamports: lamports.reduce((a, b) => a + b, 0), meanLamportsPerTx: Math.round(lamports.reduce((a, b) => a + b, 0) / lamports.length) }
      : { transactions: 0 };
  }

  const pct = (list, p) => {
    if (!list?.length) return null;
    const sorted = [...list].sort((a, b) => a - b);
    return sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))];
  };
  const passes = results.filter((c) => c.pass).length;
  const passRate = cycles ? passes / cycles : 0;
  return {
    type: 'CRESCO_WORLD_FAIR_WORKFLOW_CAMPAIGN',
    cycles,
    passes,
    passRate,
    threshold,
    thresholdMet: passRate >= threshold,
    latencyMs: Object.fromEntries(Object.entries(latency).map(([k, v]) => [k, { n: v.length, p50: pct(v, 50), p95: pct(v, 95), max: Math.max(...v) }])),
    fees,
    results,
    claimBoundary: 'Devnet repeatability of the operator/principal loop only; not production reliability, adoption or WTP.'
  };
}

function liveRequester() {
  const api = (process.env.CRESCO_API ?? '').replace(/\/$/, '');
  const ws = process.env.WORKSPACE_ID;
  const tokens = { operator: process.env.OPERATOR_TOKEN, principal: process.env.PRINCIPAL_TOKEN };
  if (!api || !ws || !tokens.operator || !tokens.principal) {
    throw new Error('CRESCO_API, WORKSPACE_ID, OPERATOR_TOKEN and PRINCIPAL_TOKEN are required');
  }
  return async (method, sub, role, body, idempotencyKey) => {
    const res = await fetch(`${api}/api/v0.4/worlds-fair/workspaces/${ws}${sub}`, {
      method,
      headers: { 'content-type': 'application/json', authorization: `Bearer ${tokens[role]}`, ...(idempotencyKey ? { 'idempotency-key': idempotencyKey } : {}) },
      body: JSON.stringify(body ?? {})
    });
    return { status: res.status, body: await res.json().catch(() => ({})) };
  };
}

function rpcFeeLookup() {
  const rpc = process.env.SOLANA_DEVNET_RPC_URL;
  if (!rpc) return null;
  return async (signature) => {
    const res = await fetch(rpc, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getTransaction', params: [signature, { encoding: 'json', maxSupportedTransactionVersion: 0, commitment: 'confirmed' }] })
    });
    const json = await res.json();
    return json?.result?.meta?.fee ?? NaN;
  };
}

async function selfTestRequester() {
  const { createMemoryWorkflowStore, createWorldFairWorkflow } = await import('../src/worlds-fair-workflow.mjs');
  const st = { nonce: 1, max: 500_000, n: 0 };
  const chain = {
    async bootstrapWorkspace() { return { bootstrap: {}, accounts: {}, guardian: 'G', delegate: 'D', mandate: { nonce: st.nonce }, assetRule: {} }; },
    async readMandate() { return { mandate: { nonce: st.nonce, status: 'ACTIVE', maxActionNotionalMicroUsd: st.max, maxPeriodNotionalMicroUsd: 10_000_000 }, assetRule: {} }; },
    async executeIntent({ inputAmount }) {
      const q = { inputAmount, notionalMicroUsd: inputAmount };
      if (inputAmount > st.max) return { decision: 'REFUSE', boundary: 'SOFT', code: 'PythNotionalExceeded', quote: q, standingMaxNotionalMicroUsd: st.max, policyDiff: { violatedDimensions: ['MAX_ACTION_NOTIONAL'] }, mandateBefore: { nonce: st.nonce } };
      return { decision: 'ALLOW', signature: `s${++st.n}`.padEnd(64, 'x'), quote: q, effectObserved: true, mandateBefore: { nonce: st.nonce } };
    },
    async approveAndExecuteException() {
      return { status: 'EXECUTED', grant: { signature: `g${++st.n}`.padEnd(64, 'x') }, executionSignature: `e${++st.n}`.padEnd(64, 'x'), allowanceConsumed: true, standingAuthorityChanged: false };
    }
  };
  const wf = createWorldFairWorkflow({ store: createMemoryWorkflowStore(), chainFactory: () => chain });
  const created = await wf.createWorkspace({});
  const { id, tokens } = created.body;
  await wf.bootstrap(id, `Bearer ${tokens.principal}`);
  return async (method, sub, role, body, idempotencyKey) => {
    const auth = `Bearer ${tokens[role]}`;
    try {
      if (sub === '/intents') return await wf.submitIntent(id, auth, { ...body, idempotencyKey });
      const m = sub.match(/^\/requests\/([a-z0-9-]+)\/decision$/);
      if (m) return await wf.decide(id, m[1], auth, body);
    } catch (error) {
      return { status: error.httpStatus ?? 500, body: { error: error.code ?? 'ERROR' } };
    }
    return { status: 404, body: {} };
  };
}

async function main() {
  const cycles = Number(flag('cycles', '5'));
  const threshold = Number(flag('threshold', '0.8'));
  const selfTest = Boolean(flag('self-test'));
  const request = selfTest ? await selfTestRequester() : liveRequester();
  const report = await runCampaign({
    request,
    cycles,
    threshold,
    standingAmount: Math.round(Number(flag('standing', '0.2')) * 1_000_000),
    boundaryAmount: Math.round(Number(flag('boundary', '0.75')) * 1_000_000),
    feeLookup: selfTest ? null : rpcFeeLookup()
  });
  report.mode = selfTest ? 'SELF_TEST_NO_NETWORK' : 'LIVE_DEVNET';
  report.observedAt = new Date().toISOString();
  const out = flag('out', selfTest ? null : path.join('evidence', 'runtime', `worlds-fair-workflow-campaign-${Date.now()}.json`));
  if (out) {
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, JSON.stringify(report, null, 2));
  }
  const authFailures = report.results.filter((c) => c.steps.standing === 'HTTP_401' || c.steps.boundary === 'HTTP_401').length;
  if (authFailures) {
    console.error(`AUTH: ${authFailures} cycle(s) got HTTP 401. OPERATOR_TOKEN / PRINCIPAL_TOKEN must be the real wf_... tokens of WORKSPACE_ID (the text after "token=" in each role link), not placeholders.`);
  }
  console.log(JSON.stringify({ mode: report.mode, cycles, passes: report.passes, passRate: report.passRate, threshold, thresholdMet: report.thresholdMet, latencyMs: report.latencyMs, fees: report.fees, out }, null, 2));
  process.exit(report.thresholdMet ? 0 : 1);
}

// pathToFileURL keeps this entry check working on Windows (C:\\...) too.
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
