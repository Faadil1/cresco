import test from 'node:test';
import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';

import { createCrescoMcpServer } from '../integrations/mcp/cresco-mcp.mjs';
import { createCrescoOperatorTools } from '../src/worlds-fair-mcp-tools.mjs';
import { createMemoryWorkflowStore, createWorldFairWorkflow } from '../src/worlds-fair-workflow.mjs';
import { routeWorldFairWorkflow } from '../src/worlds-fair-workflow-http.mjs';
import { fakeChain } from './helpers/world-fair-fake-chain.mjs';

// The real workflow + HTTP router behind a fetch, with a fake chain.
async function lab() {
  const chain = fakeChain();
  const workflow = createWorldFairWorkflow({ store: createMemoryWorkflowStore(), chainFactory: () => chain });
  const fetchImpl = async (url, init = {}) => {
    const u = new URL(url);
    const headers = Object.fromEntries(Object.entries(init.headers ?? {}).map(([k, v]) => [k.toLowerCase(), v]));
    const r = await routeWorldFairWorkflow({ method: init.method ?? 'GET', path: u.pathname, body: init.body ? JSON.parse(init.body) : null, headers, query: Object.fromEntries(u.searchParams), workflow });
    return { status: r.status, json: async () => r.body };
  };
  const created = await workflow.createWorkspace({ useCase: 'capital' });
  const id = created.body.id;
  const t = created.body.tokens;
  await workflow.bootstrap(id, `Bearer ${t.principal}`);
  return { chain, workflow, fetchImpl, id, t };
}

test('MCP operator tools: inside the limit executes, above it files ONE exact request, the agent cannot approve', async () => {
  const { fetchImpl, id, t, workflow } = await lab();
  const tools = createCrescoOperatorTools({ apiUrl: 'https://api.test', workspaceId: id, operatorToken: t.operator, fetchImpl, sleep: async () => {} });
  const byName = Object.fromEntries(tools.map((tool) => [tool.name, tool]));

  const mandate = await byName.cresco_get_mandate.run();
  assert.equal(mandate.status, 'ACTIVE');
  assert.equal(mandate.standingLimitPerAction, '$0.50');

  const allowed = await byName.cresco_submit_intent.run({ amountUsd: 0.3, reason: 'rebalance' });
  assert.equal(allowed.decision, 'ALLOW');
  assert.equal(allowed.executed, true);

  const pending = await byName.cresco_submit_intent.run({ amountUsd: 0.75 });
  assert.equal(pending.decision, 'PENDING_PRINCIPAL');
  assert.equal(pending.executed, false);
  assert.match(pending.next, /Do not split/);
  const rid = pending.request.requestId;

  // The operator token cannot decide its own exception.
  await assert.rejects(workflow.decide(id, rid, `Bearer ${t.operator}`, { decision: 'APPROVE' }), /requires role/);

  const waiting = await byName.cresco_wait_for_decision.run({ requestId: rid, timeoutSeconds: 5 });
  assert.equal(waiting.decided, false);

  await workflow.decide(id, rid, `Bearer ${t.principal}`, { decision: 'APPROVE' });
  const decided = await byName.cresco_wait_for_decision.run({ requestId: rid });
  assert.equal(decided.decided, true);
  assert.equal(decided.request.status, 'EXECUTED');
  assert.equal(decided.request.standingAuthorityChanged, false);

  const history = await byName.cresco_history.run({ limit: 10 });
  assert.ok(history.events.some((e) => e.type === 'EXCEPTION_EXECUTED'));
});

test('MCP server lists the operator tools and returns structured results over the protocol', async () => {
  const { fetchImpl, id, t } = await lab();
  const server = createCrescoMcpServer({ apiUrl: 'https://api.test', workspaceId: id, operatorToken: t.operator, fetchImpl });
  const client = new Client({ name: 'test', version: '0.0.0' });
  const [a, b] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(a), client.connect(b)]);
  const { tools } = await client.listTools();
  assert.deepEqual(tools.map((tool) => tool.name).sort(), ['cresco_get_mandate', 'cresco_get_request', 'cresco_history', 'cresco_submit_intent', 'cresco_wait_for_decision']);
  assert.ok(!tools.some((tool) => /approve|decide|policy|revoke/.test(tool.name)), 'no authority-widening tool');
  const res = await client.callTool({ name: 'cresco_submit_intent', arguments: { amountUsd: 0.75 } });
  assert.equal(res.isError, false);
  assert.equal(JSON.parse(res.content[0].text).decision, 'PENDING_PRINCIPAL');
  await client.close();
});

test('MCP tools refuse to start without workspace credentials', () => {
  assert.throws(() => createCrescoOperatorTools({ apiUrl: 'https://api.test', workspaceId: 'ws-abcdef12' }), /OPERATOR_TOKEN/);
  assert.throws(() => createCrescoOperatorTools({ apiUrl: '', workspaceId: 'ws-abcdef12', operatorToken: 'x' }), /API_URL/);
});
