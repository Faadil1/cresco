#!/usr/bin/env node
// Minimal delegated-strategy client for the CRESCO World's Fair workflow API (v0.4).
//
// The strategy only needs its operator token. It submits SWAP_EXACT_IN intents;
// inside the standing mandate they execute immediately, outside it the CRESCO
// program refuses and a principal decides. This client waits for that decision.
//
// Usage:
//   CRESCO_API=https://keys-api-stocklana.faadil-casecraft.workers.dev \
//   WORKSPACE_ID=ws-... OPERATOR_TOKEN=wf_operator_... \
//   node examples/worlds-fair-strategy-client.mjs --amount 0.75 --slippage 100 [--wait 600]
//
//   node examples/worlds-fair-strategy-client.mjs --create   # create a workspace, print role tokens once

const args = process.argv.slice(2);
const flag = (name, fallback = null) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] ?? true : fallback;
};

const API = (process.env.CRESCO_API ?? 'http://127.0.0.1:8787').replace(/\/$/, '');
const PREFIX = `${API}/api/v0.4/worlds-fair`;

async function call(method, path, { token, body, idempotencyKey } = {}) {
  const res = await fetch(`${PREFIX}${path}`, {
    method,
    headers: {
      ...(body ? { 'content-type': 'application/json' } : {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(idempotencyKey ? { 'idempotency-key': idempotencyKey } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, body: json };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function create() {
  const res = await call('POST', '/workspaces', { body: { name: flag('name', 'Strategy client desk') } });
  if (res.status !== 201) throw new Error(`create failed: ${res.status} ${JSON.stringify(res.body)}`);
  console.log(JSON.stringify({ workspaceId: res.body.id, tokens: res.body.tokens, next: 'POST /workspaces/{id}/bootstrap with the principal token' }, null, 2));
}

async function submit() {
  const workspaceId = process.env.WORKSPACE_ID;
  const token = process.env.OPERATOR_TOKEN;
  if (!workspaceId || !token) throw new Error('WORKSPACE_ID and OPERATOR_TOKEN are required');
  const inputAmount = Math.round(Number(flag('amount', '0.2')) * 1_000_000);
  const maxSlippageBps = Number(flag('slippage', '100'));
  const waitSeconds = Number(flag('wait', '600'));
  const idempotencyKey = flag('key', `strategy-${Date.now()}`);

  for (let attempt = 1; attempt <= 6; attempt += 1) {
    const res = await call('POST', `/workspaces/${workspaceId}/intents`, {
      token,
      idempotencyKey,
      body: { action: 'SWAP_EXACT_IN', inputAmount, maxSlippageBps }
    });

    if (res.status === 409 && res.body.error === 'BUSY') {
      const wait = Number(res.body.retryAfterMs ?? 5000);
      console.error(`BUSY, retrying in ${wait} ms with the same idempotency key`);
      await sleep(wait);
      continue;
    }
    if (res.body.decision === 'ALLOW') {
      console.log(`ALLOW  executed inside standing authority  ${res.body.receipt.explorer}`);
      return 0;
    }
    if (res.body.decision === 'REFUSE') {
      console.log(`REFUSE ${res.body.boundary} boundary (${res.body.code}); no exception path`);
      return 2;
    }
    if (res.body.decision === 'UNKNOWN') {
      console.log(`UNKNOWN ${res.body.message}`);
      console.log('Do not resubmit blindly: POST /reconcile and read /mandate first.');
      return 3;
    }
    if (res.body.decision === 'PENDING_PRINCIPAL') {
      const rid = res.body.request.id;
      console.log(`PENDING request ${rid}: ${res.body.policyDiff?.violatedDimensions?.join(', ')} exceeded; waiting for the principal`);
      const deadline = Date.now() + waitSeconds * 1000;
      while (Date.now() < deadline) {
        await sleep(5000);
        const list = await call('GET', `/workspaces/${workspaceId}/requests`, { token });
        if (list.status !== 200) {
          console.error(`Cannot read request status (${list.status}); no execution is claimed. ${list.body.error ?? 'UNKNOWN'}`);
          return 7;
        }
        const req = (list.body.requests ?? []).find((r) => r.id === rid);
        if (req && !['PENDING', 'EXECUTING'].includes(req.status)) {
          console.log(`${req.status}${req.execution?.signature ? `  https://explorer.solana.com/tx/${req.execution.signature}?cluster=devnet` : ''}`);
          return req.status === 'EXECUTED' ? 0 : 4;
        }
      }
      console.log('Still pending; the request expires on its own if nobody decides.');
      return 5;
    }
    throw new Error(`unexpected response ${res.status}: ${JSON.stringify(res.body)}`);
  }
  console.log('Gave up after repeated BUSY responses.');
  return 6;
}

const main = flag('create') ? create : submit;
main()
  .then((code) => process.exit(typeof code === 'number' ? code : 0))
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
