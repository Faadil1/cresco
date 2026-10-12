import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

import { runCampaign } from '../scripts/worlds-fair-workflow-campaign.mjs';

test('campaign self-test runs the full loop without network and meets its threshold', () => {
  const out = execFileSync(process.execPath, ['scripts/worlds-fair-workflow-campaign.mjs', '--self-test', '--cycles', '2'], { encoding: 'utf8' });
  const report = JSON.parse(out);
  assert.equal(report.mode, 'SELF_TEST_NO_NETWORK');
  assert.equal(report.passes, 2);
  assert.equal(report.thresholdMet, true);
});

test('a cycle that widens standing authority or skips replay protection fails the campaign', async () => {
  let n = 0;
  const request = async (method, sub) => {
    if (sub === '/intents' && n++ % 2 === 0) return { status: 200, body: { decision: 'ALLOW', receipt: { signature: 'a' } } };
    if (sub === '/intents') return { status: 202, body: { decision: 'PENDING_PRINCIPAL', request: { id: 'req-1' } } };
    if (sub.endsWith('/decision') && method === 'POST') {
      return { status: 200, body: { request: { status: 'EXECUTED', execution: { allowanceConsumed: true, standingAuthorityChanged: true } } } };
    }
    return { status: 500, body: {} };
  };
  const report = await runCampaign({ request, cycles: 2, threshold: 0.5, standingAmount: 1, boundaryAmount: 2 });
  assert.equal(report.passes, 0);
  assert.equal(report.thresholdMet, false);
  assert.match(report.claimBoundary, /not production reliability/);
});
