import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('../scripts/family-practice-operator-emergency-close.mjs', import.meta.url));
const id = '00000000-0000-4000-8000-000000000042';
const base = {
  ...process.env,
  CRESCO_FAMILY_PRACTICE_API_URL: 'https://cresco-family-api.faadil-casecraft.workers.dev',
  CRESCO_FAMILY_PRACTICE_OPERATOR_TOKEN: 'test-secret-never-used-in-production-0123456789'
};

function inspect(args, env = base) {
  return spawnSync(process.execPath, [script, ...args], {
    env, encoding: 'utf8', timeout: 5000
  });
}

test('Operator emergency command denies without explicit confirmation', () => {
  const r = inspect([id]);
  assert.equal(r.status, 2);
  assert.match(r.stderr, /confirmation|confirm-end/i);
  assert.ok(!r.stdout.includes(base.CRESCO_FAMILY_PRACTICE_OPERATOR_TOKEN));
});

test('Operator emergency command denies historical, wrong and HTTP Worker hosts without sending a request', () => {
  for (const url of [
    'https://keys-api-stocklana.faadil-casecraft.workers.dev',
    'https://cresco.faadil-casecraft.workers.dev',
    'https://cresco-family-api.attacker.workers.dev',
    'http://cresco-family-api.faadil-casecraft.workers.dev'
  ]) {
    const r = inspect([id, '--confirm-end-fictional-practice'], {
      ...base, CRESCO_FAMILY_PRACTICE_API_URL: url
    });
    assert.equal(r.status, 2, url);
    assert.match(r.stderr, /Refused/);
    assert.ok(!r.stdout.includes(base.CRESCO_FAMILY_PRACTICE_OPERATOR_TOKEN));
  }
});

test('Operator emergency command denies missing secrets and malformed IDs without sending a request', () => {
  const without = inspect([id, '--confirm-end-fictional-practice'], {
    ...base, CRESCO_FAMILY_PRACTICE_OPERATOR_TOKEN: ''
  });
  assert.equal(without.status, 2);
  const badId = inspect(['../../bad', '--confirm-end-fictional-practice']);
  assert.equal(badId.status, 2);
});

test('operator needs only the separate long action secret, not Cloudflare Access', () => {
  const attempted=inspect([id,'--confirm-end-fictional-practice'],{
    ...base,CRESCO_FAMILY_PRACTICE_API_URL:'https://cresco-family-api.attacker.workers.dev',
    CRESCO_FAMILY_ACCESS_SERVICE_CLIENT_ID:'',
    CRESCO_FAMILY_ACCESS_SERVICE_CLIENT_SECRET:''
  });
  assert.equal(attempted.status,2);
  assert.match(attempted.stderr,/only an independently identified/);
  assert.doesNotMatch(attempted.stderr,/Cloudflare Access/);
});
