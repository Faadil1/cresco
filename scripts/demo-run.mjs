import {
  ActionDecision,
  MandateStatus,
  buildBoundaryRequest,
  evaluateBoundedAction
} from '../src/bounded-autonomy.mjs';

const mandate = {
  status: MandateStatus.ACTIVE,
  version: 7,
  nonce: 6,
  expiresAt: '2026-12-01T00:00:00Z'
};

const assetRule = {
  enabled: true,
  asset: 'AAPL',
  allowedActions: ['BUY'],
  quoteUnit: 'USD',
  maxActionNotional: 10,
  maxPeriodNotional: 50,
  spentThisPeriod: 0,
  requiresMarketEvidence: false
};

function evaluate(notional) {
  return evaluateBoundedAction({
    mandate,
    assetRule,
    action: {
      type: 'BUY',
      asset: 'AAPL',
      notional,
      expectedNonce: mandate.nonce
    }
  });
}

console.log('\nKEYS v0.2 deterministic product slice');

const inside = evaluate(5);
console.log('1) $5 inside Key v7');
console.log('   ', inside.decision, inside.reasonCode);
if (inside.decision !== ActionDecision.ALLOW) process.exitCode = 1;

const boundary = evaluate(12);
console.log('2) $12 reaches the standing boundary');
console.log('   ', boundary.decision, boundary.reasonCode);
if (boundary.decision !== ActionDecision.REFUSE) process.exitCode = 1;

const request = buildBoundaryRequest({
  mandate,
  assetRule,
  action: {
    type: 'BUY',
    asset: 'AAPL',
    notional: 12
  },
  reasoningCommitmentHash: 'demo-private-reason-hash'
});

console.log('3) Boundary request');
console.log('   ', request.status, request.decisions.join(' | '));

console.log('4) Canonical Devnet exact-action proof');
console.log('   guardian approves $12 once');
console.log('   $11 -> REFUSE / AllowanceActionMismatch');
console.log('   $12 -> ALLOW');
console.log('   standing Key v7 -> v7');
console.log('   replay -> REFUSE / AllowanceAlreadyUsed');
console.log('   proof: https://github.com/Faadil1/keys/actions/runs/36150024852');

console.log('5) Truth boundary');
console.log('   Solana Devnet + demo SPL token + live Pyth market truth');
console.log('   no brokerage, custody, mainnet, or real minor securities claim');

console.log('\nReal failure > fake success.\n');
