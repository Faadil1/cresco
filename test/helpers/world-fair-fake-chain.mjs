// Shared fake of the CRESCO chain adapter (mirrors program decisions).
export 
function fakeChain({ price = 1, behaviour = {} } = {}) {
  const st = {
    nonce: 7,
    version: 7,
    status: 'ACTIVE',
    maxAction: 500_000,
    maxPeriod: 10_000_000,
    maxActionAmount: 5_000_000,
    maxPeriodAmount: 10_000_000,
    spent: 0,
    spentNotional: 0,
    enabled: true,
    sigs: 0,
    calls: [],
    usedAllowances: new Set()
  };
  const sig = (label) => `${label}Sig${++st.sigs}`.padEnd(64, 'x');
  const view = () => ({
    accounts: { mandate: 'MandatePda' },
    guardian: 'Guardian',
    delegate: 'Delegate',
    mandate: { stage: 3, status: st.status, version: st.version, nonce: st.nonce, maxActionNotionalMicroUsd: st.maxAction, maxPeriodNotionalMicroUsd: st.maxPeriod },
    assetRule: { enabled: st.enabled, maxActionAmount: st.maxActionAmount, maxPeriodAmount: st.maxPeriodAmount, periodSeconds: 86_400, periodStartedAt: Math.floor(Date.now() / 1000) - 60, spentThisPeriod: st.spent, spentThisPeriodNotionalMicroUsd: st.spentNotional }
  });
  const advance = () => { st.nonce += 1; st.version += 1; };
  const quote = (amount, bps) => ({ inputAmount: amount, slippageBps: bps, notionalMicroUsd: Math.floor(amount * price), estimatedOutput: amount, minOutput: Math.floor(amount * (1 - bps / 10_000)) });
  const chain = {
    st,
    async bootstrapWorkspace() {
      st.calls.push('bootstrap');
      if (behaviour.bootstrapThrows) throw new Error('blockhash expired');
      return { bootstrap: { initializeCharter: sig('charter'), initializeMandate: sig('mandate') }, ...view() };
    },
    async readMandate() {
      return view();
    },
    async executeIntent({ inputAmount, slippageBps }) {
      st.calls.push(['intent', inputAmount]);
      if (behaviour.busy) throw Object.assign(new Error('WORLD_FAIR_MANDATE_BUSY'), { worldFairBusy: true });
      if (behaviour.intentThrows) throw new Error('fetch failed: socket hang up');
      const q = quote(inputAmount, slippageBps);
      const before = view().mandate;
      if (st.status !== 'ACTIVE') return { decision: 'REFUSE', boundary: 'HARD', code: 'MandateNotActive', quote: q, mandateBefore: before };
      if (inputAmount > st.maxActionAmount) return { decision: 'REFUSE', boundary: 'HARD', code: 'ActionAmountExceeded', quote: q, mandateBefore: before, refusalEvidence: 'PROGRAM_PREFLIGHT_SIMULATION' };
      if (q.notionalMicroUsd > st.maxAction) {
        return { decision: 'REFUSE', boundary: 'SOFT', code: 'PythNotionalExceeded', refusalEvidence: 'PROGRAM_PREFLIGHT_SIMULATION', quote: q, standingMaxNotionalMicroUsd: st.maxAction, policyDiff: { perActionNotional: 'VIOLATED', violatedDimensions: ['MAX_ACTION_NOTIONAL'] }, mandateBefore: before };
      }
      st.spent += inputAmount;
      st.spentNotional += q.notionalMicroUsd;
      return { decision: 'ALLOW', boundary: 'STANDING', signature: sig('standing'), quote: q, standingMaxNotionalMicroUsd: st.maxAction, effectObserved: true, mandateBefore: before, mandateAfter: view().mandate, assetRuleAfter: view().assetRule };
    },
    async approveAndExecuteException({ inputAmount, slippageBps, expectedNonce }) {
      st.calls.push(['approve', inputAmount, expectedNonce]);
      if (behaviour.approveThrows) {
        const grant = { signature: sig('grant') };
        throw Object.assign(new Error(`SOLANA_CONFIRMATION_TIMEOUT:${'7'.repeat(88)}`), { worldFairGrant: grant, worldFairExecutionSignature: '7'.repeat(88) });
      }
      if (st.nonce !== expectedNonce) return { status: 'STALE', code: 'StaleNonce', currentNonce: st.nonce, requestNonce: expectedNonce };
      if (st.status !== 'ACTIVE') return { status: 'REFUSED', boundary: 'HARD', code: 'MandateNotActive' };
      const q = quote(inputAmount, slippageBps);
      if (q.notionalMicroUsd <= st.maxAction) return { status: 'NOT_REQUIRED', code: 'ExceptionNotRequired', quote: q };
      const grant = { signature: sig('grant'), allowance: `Allowance${st.sigs}`, requestHash: 'ab'.repeat(32), maxNotionalMicroUsd: q.notionalMicroUsd, mandateNonce: st.nonce };
      if (behaviour.rollback) return { status: 'ROLLED_BACK', code: 'AmountOutBelowMinimum', boundary: 'VENUE', grant, allowanceConsumed: false, quote: q };
      if (st.usedAllowances.has(grant.requestHash + expectedNonce + inputAmount)) return { status: 'EXECUTION_REFUSED', code: 'AllowanceAlreadyUsed', boundary: 'HARD', grant };
      st.usedAllowances.add(grant.requestHash + expectedNonce + inputAmount);
      const versionBefore = st.version;
      st.spent += inputAmount;
      st.spentNotional += q.notionalMicroUsd;
      return { status: 'EXECUTED', grant, executionSignature: sig('exec'), allowanceConsumed: true, quote: q, standingMandateVersionBefore: versionBefore, standingMandateVersionAfter: st.version, standingAuthorityChanged: false, assetRuleAfter: view().assetRule };
    },
    async setMandateStatus({ status, expectedNonce }) {
      if (expectedNonce !== st.nonce) return { status: 'REFUSED', code: 'StaleNonce' };
      if (st.status === 'REVOKED') return { status: 'REFUSED', code: 'MandateRevoked' };
      st.status = status;
      advance();
      return { status: 'CONFIRMED', signature: sig('status'), mandate: view().mandate };
    },
    async revisePolicy({ values, expectedNonce }) {
      if (expectedNonce !== st.nonce) return { status: 'REFUSED', code: 'StaleNonce' };
      st.maxAction = values.maxActionNotionalMicroUsd;
      st.maxPeriod = values.maxPeriodNotionalMicroUsd;
      advance();
      return { status: 'CONFIRMED', signature: sig('policy'), mandate: view().mandate };
    },
    async updateRule({ values, expectedNonce }) {
      if (expectedNonce !== st.nonce) return { status: 'REFUSED', code: 'StaleNonce' };
      st.maxActionAmount = values.maxActionAmount;
      st.maxPeriodAmount = values.maxPeriodAmount;
      st.enabled = values.enabled;
      st.spent = 0;
      st.spentNotional = 0;
      advance();
      return { status: 'CONFIRMED', signature: sig('rule'), mandate: view() };
    },
    async signatureStatus(signature) {
      return behaviour.signatureStatus?.(signature) ?? { status: 'CONFIRMED' };
    }
  };
  return chain;
}
