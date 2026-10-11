import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const protectedWorkflows = [
  '.github/workflows/worlds-fair-operator-lab-live.yml',
  '.github/workflows/devnet-execution-bridge.yml',
  '.github/workflows/solana-devnet-authority-proof.yml',
  '.github/workflows/cloudflare-hosted-execution-smoke.yml',
  '.github/workflows/devnet-funding-topup.yml'
];

for (const workflow of protectedWorkflows) {
  test(`${workflow} is manual-only because it can mutate external or Devnet state`, () => {
    const yaml = fs.readFileSync(workflow, 'utf8');
    assert.match(yaml, /\non:\n\s+workflow_dispatch:\s*(?:\n|$)/);
    assert.doesNotMatch(yaml, /\n\s{2}push:\s*(?:\n|$)/);
    assert.doesNotMatch(yaml, /\n\s{2}pull_request:\s*(?:\n|$)/);
  });
}
