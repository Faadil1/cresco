import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorldFairExceptionLifecycle, normalizeWorldFairAction,
  worldFairExactActionHash } from '../src/worlds-fair-exception-lifecycle.mjs';

const action={
  kind:'SWAP_EXACT_IN',pool:'pool1',inputMint:'a',outputMint:'b',
  receiver:'vaultCanonical',amountBaseUnits:'600000',minOutputBaseUnits:'590000'
};
function fixture() {
  const db=new Map();
  let nonce=13;
  let receiptResult=null;
  const workflow=createWorldFairExceptionLifecycle({
    store:{
      async read(id){return db.get(id)?structuredClone(db.get(id)):null},
      async create(id,value){if(db.has(id))return false;db.set(id,structuredClone(value));return true},
      async compareAndSwap(id,version,next){
        if(db.get(id)?.version!==version)return false;
        db.set(id,structuredClone(next));return true;
      }
    },
    authenticate:async ctx=>ctx?.serverIdentity??null,
    readMandate:async()=>({nonce,policyVersion:'v14',principal:'principal1'}),
    evaluateStandingPolicy:async()=>({
      decision:'REFUSE',reason:'MAX_ACTION_NOTIONAL',
      exceptionEligible:true,policyDiff:{max:'500000',requested:'600000'}
    }),
    verifyChainReceipt:async()=>receiptResult,
    newId:()=> 'req1',
    now:()=> '2026-10-11T10:00:00Z'
  });
  const op={serverIdentity:{id:'operator1',authenticated:true,roles:['OPERATOR']}};
  const pr={serverIdentity:{id:'principal1',authenticated:true,roles:['PRINCIPAL']}};
  return {workflow,db,op,pr,setNonce:n=>nonce=n,setReceipt:r=>receiptResult=r};
}
const rejectCode=code=>err=>{assert.equal(err.code,code);return true};
test('exact action hash changes on destination, amount and nonce',()=>{
  const x={mandate:'m',nonce:13,policyVersion:'v14',action};
  const hash=worldFairExactActionHash(x);
  assert.equal(hash,worldFairExactActionHash({...x,action:{...action}}));
  assert.notEqual(hash,worldFairExactActionHash({...x,action:{...action,receiver:'other'}}));
  assert.notEqual(hash,worldFairExactActionHash({...x,action:{...action,amountBaseUnits:'700000'}}));
  assert.notEqual(hash,worldFairExactActionHash({...x,nonce:14}));
});
test('unknown fields and invalid amounts fail closed',()=>{
  assert.throws(()=>normalizeWorldFairAction({...action,arbitraryProgram:'x'}),rejectCode('INVALID_ACTION_SHAPE'));
  assert.throws(()=>normalizeWorldFairAction({...action,amountBaseUnits:'0'}),rejectCode('INVALID_AMOUNT'));
});
test('distinct operator request, principal approval, real receipt binding and consumed terminal state',async()=>{
  const f=fixture();
  const r=await f.workflow.request(f.op,{mandate:'mandate1',action});
  assert.equal(r.state,'PENDING_REVIEW');
  assert.equal(r.policyDiff.max,'500000');
  await assert.rejects(f.workflow.review(f.op,{id:r.id,decision:'APPROVE'}),rejectCode('AUTHENTICATED_ROLE_REQUIRED'));
  const approval=await f.workflow.review(f.pr,{id:r.id,decision:'APPROVE'});
  assert.equal(approval.state,'APPROVED_PENDING_GRANT');
  assert.equal(approval.grantSignature,null);
  await assert.rejects(f.workflow.attestGrant({id:r.id,receipt:{}}),rejectCode('ONCHAIN_GRANT_NOT_VERIFIED'));
  f.setReceipt({confirmed:true,exactActionHash:r.exactActionHash,signature:'grantSig'});
  const granted=await f.workflow.attestGrant({id:r.id,receipt:{signed:true}});
  assert.equal(granted.state,'GRANTED_PENDING_EXECUTION');
  f.setReceipt({confirmed:true,exactActionHash:r.exactActionHash,signature:'executionSig',allowanceConsumed:true});
  const done=await f.workflow.attestExecution({id:r.id,receipt:{signed:true}});
  assert.equal(done.state,'CONSUMED');
  assert.equal(done.executionSignature,'executionSig');
  await assert.rejects(f.workflow.attestExecution({id:r.id,receipt:{}}),rejectCode('REQUEST_STATE_CONFLICT'));
});
test('principal refusal is terminal; inaccessible records remain private',async()=>{
  const f=fixture(),r=await f.workflow.request(f.op,{mandate:'m',action});
  const refused=await f.workflow.review(f.pr,{id:r.id,decision:'REFUSE',reason:'RISK'});
  assert.equal(refused.state,'REFUSED');
  await assert.rejects(f.workflow.review(f.pr,{id:r.id,decision:'APPROVE'}),rejectCode('REQUEST_STATE_CONFLICT'));
  await assert.rejects(f.workflow.inspect({serverIdentity:{id:'stranger',authenticated:true,roles:['OPERATOR']}},r.id),rejectCode('REQUEST_ACCESS_REFUSED'));
});
test('stale mandate blocks approval and grant',async()=>{
  const f=fixture(),r=await f.workflow.request(f.op,{mandate:'m',action});
  f.setNonce(14);
  await assert.rejects(f.workflow.review(f.pr,{id:r.id,decision:'APPROVE'}),rejectCode('STALE_MANDATE_REQUIRES_REVIEW'));
});
test('unconfirmed or mismatched execution stays quarantined; no replay',async()=>{
  const f=fixture(),r=await f.workflow.request(f.op,{mandate:'m',action});
  await f.workflow.review(f.pr,{id:r.id,decision:'APPROVE'});
  f.setReceipt({confirmed:true,exactActionHash:r.exactActionHash,signature:'grant'});
  await f.workflow.attestGrant({id:r.id,receipt:{}});
  f.setReceipt({confirmed:true,exactActionHash:'wrong-hash',signature:'exec',allowanceConsumed:true});
  const unknown=await f.workflow.attestExecution({id:r.id,receipt:{}});
  assert.equal(unknown.state,'RECONCILIATION_REQUIRED');
  await assert.rejects(f.workflow.attestExecution({id:r.id,receipt:{}}),rejectCode('REQUEST_STATE_CONFLICT'));
});
test('CAS conflict refuses concurrent approvals, never double advances',async()=>{
  const f=fixture(),r=await f.workflow.request(f.op,{mandate:'m',action});
  const results=await Promise.allSettled([
    f.workflow.review(f.pr,{id:r.id,decision:'APPROVE'}),
    f.workflow.review(f.pr,{id:r.id,decision:'APPROVE'})
  ]);
  assert.equal(results.filter(x=>x.status==='fulfilled').length,1);
});
test('caller cannot substitute arbitrary role claims for server-authenticated identity',async()=>{
  const f=fixture();
  await assert.rejects(f.workflow.request({roles:['OPERATOR'],id:'operator1'},{
    mandate:'m',action
  }),rejectCode('AUTHENTICATED_ROLE_REQUIRED'));
});
