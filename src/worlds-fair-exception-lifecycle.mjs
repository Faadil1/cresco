import { createHash, randomUUID } from 'node:crypto';

// LOCAL product-domain capability. No HTTP route, wallet custody, chain write or public authority.
const TERMINAL = new Set(['REFUSED', 'STALE', 'CONSUMED', 'RECONCILIATION_REQUIRED']);
const ACTION_FIELDS = [
  'amountBaseUnits', 'inputMint', 'kind', 'minOutputBaseUnits',
  'outputMint', 'pool', 'receiver'
];
const STATES = new Set([
  'PENDING_REVIEW', 'APPROVED_PENDING_GRANT', 'GRANTED_PENDING_EXECUTION',
  ...TERMINAL
]);
function fail(code) { const e = new Error(code); e.code = code; throw e; }
function text(value, label) {
  if (typeof value !== 'string' || !value.trim() || value.length > 256) fail('INVALID_' + label);
  return value;
}
function amount(value, label) {
  if (typeof value !== 'string' || !/^[1-9][0-9]*$/.test(value)) fail('INVALID_' + label);
  return value;
}
export function normalizeWorldFairAction(action) {
  if (!action || typeof action !== 'object' || Array.isArray(action)) fail('INVALID_ACTION');
  if (Object.keys(action).sort().join('|') !== ACTION_FIELDS.join('|')) fail('INVALID_ACTION_SHAPE');
  if (action.kind !== 'SWAP_EXACT_IN') fail('UNSUPPORTED_ACTION_KIND');
  return Object.freeze({
    kind: action.kind,
    pool: text(action.pool, 'POOL'),
    inputMint: text(action.inputMint, 'INPUT_MINT'),
    outputMint: text(action.outputMint, 'OUTPUT_MINT'),
    receiver: text(action.receiver, 'RECEIVER'),
    amountBaseUnits: amount(action.amountBaseUnits, 'AMOUNT'),
    minOutputBaseUnits: amount(action.minOutputBaseUnits, 'MIN_OUTPUT')
  });
}
export function worldFairExactActionHash({ mandate, nonce, policyVersion, action }) {
  text(mandate, 'MANDATE');
  text(policyVersion, 'POLICY_VERSION');
  if (!Number.isSafeInteger(nonce) || nonce < 0) fail('INVALID_NONCE');
  const a=normalizeWorldFairAction(action);
  const canonical=JSON.stringify([
    'CRESCO_WORLD_FAIR_EXACT_ACTION_V1', mandate, nonce, policyVersion,
    a.kind,a.pool,a.inputMint,a.outputMint,a.receiver,a.amountBaseUnits,a.minOutputBaseUnits
  ]);
  return createHash('sha256').update(canonical).digest('hex');
}
function onlyServerDecision(value, allowed) {
  if (!allowed.includes(value)) fail('INVALID_ATTESTED_DECISION');
  return value;
}
function safeRecord(record) {
  return structuredClone(record);
}

export function createWorldFairExceptionLifecycle({
  store, authenticate, evaluateStandingPolicy, readMandate, verifyChainReceipt,
  now = () => new Date().toISOString(), newId = randomUUID
}) {
  if (!store || !['read','create','compareAndSwap'].every(k => typeof store[k] === 'function')
      || ![authenticate,evaluateStandingPolicy,readMandate,verifyChainReceipt].every(f => typeof f === 'function')) {
    fail('LIFECYCLE_TRUSTED_DEPENDENCY_REQUIRED');
  }
  async function actor(context, role) {
    const identity=await authenticate(context);
    if (!identity || identity.authenticated !== true || typeof identity.id !== 'string'
        || !identity.id || !Array.isArray(identity.roles) || !identity.roles.includes(role)) {
      fail('AUTHENTICATED_ROLE_REQUIRED');
    }
    return identity;
  }
  async function load(id) {
    const found=await store.read(id);
    if (!found || !STATES.has(found.state)) fail('REQUEST_NOT_FOUND');
    return found;
  }
  async function transition(id, expectedState, mapper) {
    const current=await load(id);
    if (current.state !== expectedState) fail('REQUEST_STATE_CONFLICT');
    const next={...safeRecord(current),...mapper(current),version:current.version+1,updatedAt:now()};
    if (!await store.compareAndSwap(id,current.version,next)) fail('REQUEST_CONCURRENT_UPDATE');
    return safeRecord(next);
  }
  async function assertLineage(record) {
    const latest=await readMandate(record.mandate);
    if (!latest || latest.nonce !== record.nonce || latest.policyVersion !== record.policyVersion
        || latest.principal !== record.principal) fail('STALE_MANDATE_REQUIRES_REVIEW');
    return latest;
  }
  return Object.freeze({
    async request(context,{mandate,action}) {
      const operator=await actor(context,'OPERATOR');
      text(mandate,'MANDATE');
      const normalized=normalizeWorldFairAction(action);
      const current=await readMandate(mandate);
      if (!current || !current.principal || current.principal===operator.id) fail('INVALID_ROLE_SEPARATION');
      if (!Number.isSafeInteger(current.nonce) || current.nonce < 0) fail('INVALID_NONCE');
      const assessment=await evaluateStandingPolicy({mandate,current,action:normalized,operator:operator.id});
      if (assessment?.decision !== 'REFUSE' || assessment?.reason !== 'MAX_ACTION_NOTIONAL'
          || assessment?.exceptionEligible !== true || !assessment.policyDiff) {
        fail('NO_EXCEPTION_REQUEST_FOR_THIS_BOUNDARY');
      }
      const fingerprint=worldFairExactActionHash({
        mandate,nonce:current.nonce,policyVersion:current.policyVersion,action:normalized
      });
      const stamp=now();
      const record={
        id:newId(),version:1,state:'PENDING_REVIEW',operator:operator.id,
        principal:current.principal,mandate,nonce:current.nonce,
        policyVersion:current.policyVersion,action:normalized,
        exactActionHash:fingerprint,policyDiff:assessment.policyDiff,
        grantSignature:null,executionSignature:null,reason:null,
        createdAt:stamp,updatedAt:stamp
      };
      if (!await store.create(record.id,safeRecord(record))) fail('REQUEST_ID_COLLISION');
      return safeRecord(record);
    },
    async review(context,{id,decision,reason=null}) {
      const principal=await actor(context,'PRINCIPAL');
      const record=await load(id);
      if (record.principal!==principal.id || record.operator===principal.id) fail('PRINCIPAL_OWNERSHIP_REQUIRED');
      onlyServerDecision(decision,['APPROVE','REFUSE']);
      // Read latest lineage before changing a request. A stale request is never approvable.
      await assertLineage(record);
      return transition(id,'PENDING_REVIEW',()=>({
        state:decision==='APPROVE'?'APPROVED_PENDING_GRANT':'REFUSED',
        reason:decision==='REFUSE'?text(reason,'REFUSAL_REASON'):null,
        reviewedBy:principal.id
      }));
    },
    async attestGrant({id,receipt}) {
      const record=await load(id);
      await assertLineage(record);
      const verified=await verifyChainReceipt({kind:'GRANT',record:safeRecord(record),receipt});
      if (!verified || verified.confirmed!==true || verified.exactActionHash!==record.exactActionHash
          || typeof verified.signature!=='string' || !verified.signature) fail('ONCHAIN_GRANT_NOT_VERIFIED');
      return transition(id,'APPROVED_PENDING_GRANT',()=>({
        state:'GRANTED_PENDING_EXECUTION',grantSignature:verified.signature
      }));
    },
    async attestExecution({id,receipt}) {
      const record=await load(id);
      if (record.state!=='GRANTED_PENDING_EXECUTION') fail('REQUEST_STATE_CONFLICT');
      const verified=await verifyChainReceipt({kind:'EXECUTION',record:safeRecord(record),receipt});
      // No blind retry when confirmation is uncertain.
      const confirmed=verified?.confirmed===true &&
        verified.exactActionHash===record.exactActionHash &&
        typeof verified.signature==='string' && !!verified.signature &&
        verified.allowanceConsumed===true;
      return transition(id,'GRANTED_PENDING_EXECUTION',()=>({
        state:confirmed?'CONSUMED':'RECONCILIATION_REQUIRED',
        reason:confirmed?null:'CHAIN_OUTCOME_UNKNOWN',
        executionSignature:confirmed?verified.signature:null
      }));
    },
    async inspect(context,id) {
      const identity=await authenticate(context);
      if (!identity?.authenticated) fail('AUTHENTICATED_ROLE_REQUIRED');
      const r=await load(id);
      if (!((identity.id===r.operator && identity.roles?.includes('OPERATOR'))
          || (identity.id===r.principal && identity.roles?.includes('PRINCIPAL')))) {
        fail('REQUEST_ACCESS_REFUSED');
      }
      return safeRecord(r);
    }
  });
}
