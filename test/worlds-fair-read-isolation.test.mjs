import test from 'node:test';
import assert from 'node:assert/strict';
import { routeCrescoHttp } from '../src/http-api.mjs';
import { createMemoryWorkflowStore, createWorldFairWorkflow } from '../src/worlds-fair-workflow.mjs';

const P = '/api/v0.4/worlds-fair';
function call(wf, method, path, token, body) {
  return routeCrescoHttp({
    method, path, body,
    headers: token ? { authorization: 'Bearer ' + token } : {},
    services: { worldFairWorkflow: wf }
  });
}

// These cases never make a Devnet call. Any chain method invocation would be a
// test failure: validating protected reads must not write state or cost fees.
function noChain() {
  return new Proxy({}, { get: (_target, property) => {
    throw new Error('UNEXPECTED_CHAIN_USE:' + String(property));
  } });
}

test('all workspace reads refuse missing or cross-workspace role credentials', async () => {
  const wf = createWorldFairWorkflow({ store: createMemoryWorkflowStore(), chainFactory: noChain });
  const first = (await call(wf, 'POST', P + '/workspaces', null, { name: 'Alpha' })).body;
  const other = (await call(wf, 'POST', P + '/workspaces', null, { name: 'Beta' })).body;

  const routes = [
    '',
    '/requests',
    '/history',
    '/mandate',
    '/principal/wallet-message',
    '/requests/req-guess/approval-message'
  ];
  for (const suffix of routes) {
    const path = P + '/workspaces/' + first.id + suffix;
    const anon = await call(wf, 'GET', path);
    assert.equal(anon.status, 401, path + ' missing bearer');
    assert.equal(anon.body.error, 'AUTH_REQUIRED');

    const stolenLocator = await call(wf, 'GET', path, other.tokens.principal);
    assert.equal(stolenLocator.status, 401, path + ' cross workspace');
    assert.equal(stolenLocator.body.error, 'AUTH_INVALID');
  }

  for (const role of ['operator', 'principal', 'risk']) {
    const who = await call(wf, 'GET', P + '/workspaces/' + first.id, first.tokens[role]);
    assert.equal(who.status, 200, role);
    assert.equal(who.body.name, 'Alpha');
    const history = await call(wf, 'GET', P + '/workspaces/' + first.id + '/history', first.tokens[role]);
    assert.equal(history.status, 200);
    const requests = await call(wf, 'GET', P + '/workspaces/' + first.id + '/requests', first.tokens[role]);
    assert.equal(requests.status, 200);
  }

  for (const role of ['operator', 'risk']) {
    for (const suffix of ['/principal/wallet-message', '/requests/req-guess/approval-message']) {
      const denied = await call(wf, 'GET', P + '/workspaces/' + first.id + suffix, first.tokens[role]);
      assert.equal(denied.status, 403, role + ' cannot fetch principal messages');
      assert.equal(denied.body.error, 'ROLE_FORBIDDEN');
    }
  }
  const signedMessage = await call(wf, 'GET', P + '/workspaces/' + first.id + '/principal/wallet-message', first.tokens.principal);
  assert.equal(signedMessage.status, 200);
  assert.match(signedMessage.body.message, /principal wallet binding/);
  assert.equal((await call(wf, 'GET', P + '/openapi')).status, 200);
});
