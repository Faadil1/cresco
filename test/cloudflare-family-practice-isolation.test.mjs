import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CrescoFamilyPracticeState } from '../src/cloudflare-family-practice-state.mjs';
import { handleCrescoFamilyOnlyRequest } from '../src/cloudflare-family-only-worker.mjs';

const ORIGIN = 'https://cresco-family-web.faadil-casecraft.workers.dev';
const HOST = 'https://cresco-family-api.faadil-casecraft.workers.dev';
const PREFIX = '/api/family-practice/v1';
const INVITE = 'a-long-private-research-invitation-token';
const id = (n) => '00000000-0000-4000-8000-' + String(n).padStart(12, '0');

function env() {
  const backing = new Map();
  return {
    CRESCO_FAMILY_WEB_ORIGIN: ORIGIN,
    CRESCO_FAMILY_PRACTICE_INVITE_TOKEN: INVITE,
    FAMILY_PRACTICE_STATE: {
      idFromName: (key) => key,
      get: (key) => {
        if (!backing.has(key)) {
          const records = new Map();
          backing.set(key, new CrescoFamilyPracticeState({
            storage: {
              get: async (name) => records.get(name),
              put: async (name, value) => { records.set(name, structuredClone(value)); }
            }
          }));
        }
        return backing.get(key);
      }
    }
  };
}

async function api(e, method, path, options = {}) {
  const req = new Request(HOST + PREFIX + path, {
    method,
    headers: {
      origin: options.origin ?? ORIGIN,
      ...(options.body === undefined ? {} : { 'content-type': 'application/json' }),
      ...(options.token ? { authorization: 'Bearer ' + options.token } : {}),
      ...(options.invite ? { 'x-cresco-family-practice-invite': options.invite } : {}),
      ...(options.actionId ? { 'x-practice-action-id': options.actionId } : {})
    },
    ...(options.body === undefined ? {} : { body: JSON.stringify(options.body) })
  });
  const response = await handleCrescoFamilyOnlyRequest(req, e);
  return { status: response.status, headers: response.headers, body: response.status === 204 ? null : await response.json() };
}

async function create(e) {
  const r = await api(e, 'POST', '/sessions', { invite: INVITE, body: {} });
  assert.equal(r.status, 201);
  return r.body;
}

test('Config binds a separate real-fictional DO and no secret or historic config is modified', () => {
  const isolated = JSON.parse(readFileSync(new URL('../wrangler.family-api.jsonc',import.meta.url)));
  assert.equal(isolated.name, 'cresco-family-api');
  assert.deepEqual(isolated.durable_objects.bindings.map(x => x.name), ['FAMILY_STATE', 'FAMILY_PRACTICE_STATE']);
  assert.equal(isolated.durable_objects.bindings[1].class_name, 'CrescoFamilyPracticeState');
  assert.ok(isolated.exports.CrescoFamilyPracticeState);
  assert.equal(Object.hasOwn(isolated.vars, 'CRESCO_FAMILY_PRACTICE_INVITE_TOKEN'), false);
  assert.ok(!JSON.stringify(isolated).includes('keys-api-stocklana'));
});

test('Two distinct roles share durable imaginary history, without money, custody or child data', async () => {
  const e = env();
  const codes = await create(e);
  assert.match(codes.parentToken, /^pr_[0-9a-f]{64}$/);
  assert.notEqual(codes.parentToken, codes.teenToken);
  const state = (role, token) => api(e,'GET','/sessions/' + codes.practiceId,{token});
  let teen = await state('teen', codes.teenToken);
  assert.equal(teen.body.role, 'teen');
  assert.equal(teen.body.availableCredits, 100);
  assert.equal(teen.body.truthBoundary.realMoney, false);
  assert.equal(teen.body.truthBoundary.guardianIdentityVerified, false);
  const saved = await api(e,'POST','/sessions/'+codes.practiceId+'/save',{
    token:codes.teenToken,body:{credits:20},actionId:id(1)
  });
  assert.equal(saved.status, 200);
  assert.equal(saved.body.availableCredits, 80);
  assert.equal(saved.body.savedCredits, 20);
  const parent = await state('parent', codes.parentToken);
  assert.equal(parent.body.role,'parent');
  assert.equal(parent.body.savedCredits,20);
  const asked = await api(e,'POST','/sessions/'+codes.practiceId+'/request',{
    token:codes.teenToken,body:{topic:'DIVERSIFIED_FUNDS'},actionId:id(2)
  });
  assert.equal(asked.status,200);
  const request = asked.body.requests[0];
  assert.equal(request.status,'PENDING');
  assert.equal((await state('teen', codes.teenToken)).body.requests[0].status,'PENDING');
  const declined = await api(e,'POST','/sessions/'+codes.practiceId+'/requests/'+request.id+'/decision',{
    token:codes.parentToken,body:{decision:'DECLINE',reason:'NEEDS_MORE_INFORMATION'},actionId:id(3)
  });
  assert.equal(declined.status,200);
  assert.equal((await state('teen',codes.teenToken)).body.requests[0].status,'DECLINE');
  assert.equal(declined.body.savedCredits,20);
  assert.equal(declined.body.availableCredits,80);
  assert.equal(declined.body.events.at(-1).type,'DISCUSSION_DECLINED');
  assert.ok(!JSON.stringify(declined.body).includes(codes.parentToken));
  assert.ok(!JSON.stringify(declined.body).includes(codes.teenToken));
  assert.deepEqual(declined.body.truthBoundary, {
    realMoney:false,crypto:false,stocks:false,yield:false,blockchainWrites:false,
    guardianIdentityVerified:false,thisIsLegalConsent:false
  });
});

test('Cannot cross roles, use untrusted origins, guess tokens, alter amounts or replay changed actions', async () => {
  const e=env(), codes=await create(e), path='/sessions/'+codes.practiceId;
  assert.equal((await api(e,'POST',path+'/save',{token:codes.parentToken,body:{credits:20},actionId:id(4)})).status,403);
  assert.equal((await api(e,'POST',path+'/request',{token:codes.parentToken,body:{topic:'DIVERSIFIED_FUNDS'},actionId:id(5)})).status,403);
  assert.equal((await api(e,'POST',path+'/save',{token:codes.teenToken,body:{credits:25},actionId:id(6)})).status,400);
  assert.equal((await api(e,'GET',path,{token:'pr_'+'a'.repeat(64)})).status,403);
  assert.equal((await api(e,'GET',path,{token:codes.teenToken,origin:'https://attacker.invalid'})).status,403);
  assert.equal((await api(e,'GET',path)).status,401);
  const first=await api(e,'POST',path+'/save',{token:codes.teenToken,body:{credits:20},actionId:id(7)});
  assert.equal(first.status,200);
  const again=await api(e,'POST',path+'/save',{token:codes.teenToken,body:{credits:20},actionId:id(7)});
  assert.equal(again.status,200);
  assert.equal(again.body.savedCredits,20);
  const changed=await api(e,'POST',path+'/request',{token:codes.teenToken,body:{topic:'DIVERSIFIED_FUNDS'},actionId:id(7)});
  assert.equal(changed.status,409);
  assert.equal(changed.body.error,'IDEMPOTENCY_CONFLICT');
  assert.equal((await api(e,'POST',path+'/request',{token:codes.teenToken,body:{topic:'DIVERSIFIED_FUNDS'},actionId:id(8)})).status,200);
  assert.equal((await api(e,'POST',path+'/request',{token:codes.teenToken,body:{topic:'DIVERSIFIED_FUNDS'},actionId:id(9)})).status,409);
  const request=(await api(e,'GET',path,{token:codes.parentToken})).body.requests[0];
  assert.equal((await api(e,'POST',path+'/requests/'+request.id+'/decision',{
    token:codes.teenToken,body:{decision:'APPROVE_DISCUSSION',reason:'LEARN_TOGETHER'},actionId:id(10)
  })).status,403);
  assert.equal((await api(e,'POST',path+'/requests/'+request.id+'/decision',{
    token:codes.parentToken,body:{decision:'APPROVE_DISCUSSION',reason:'LEARN_TOGETHER'},actionId:id(11)
  })).status,200);
  assert.equal((await api(e,'POST',path+'/requests/'+request.id+'/decision',{
    token:codes.parentToken,body:{decision:'APPROVE_DISCUSSION',reason:'LEARN_TOGETHER'},actionId:id(12)
  })).status,409);
});

test('Fail closed without role secret, approved invite, private DO or allowed CORS origin', async () => {
  const e=env();
  assert.equal((await api(e,'POST','/sessions',{invite:'wrong-secret-but-long',body:{}})).status,401);
  assert.equal((await api({...e,CRESCO_FAMILY_PRACTICE_INVITE_TOKEN:null},'POST','/sessions',{invite:INVITE,body:{}})).status,503);
  assert.equal((await api({...e,FAMILY_PRACTICE_STATE:null},'POST','/sessions',{invite:INVITE,body:{}})).status,503);
  assert.equal((await api(e,'POST','/sessions',{invite:INVITE,body:{},origin:'https://attacker.invalid'})).status,403);
  const preflight = await api(e,'OPTIONS','/sessions',{origin:ORIGIN});
  assert.equal(preflight.status,204);
  assert.equal(preflight.headers.get('access-control-allow-origin'),ORIGIN);
  assert.match(preflight.headers.get('access-control-allow-headers'),/x-practice-action-id/);
  assert.equal((await api(e,'GET','/sessions/../../api/v0.4/worlds-fair')).status,404);
});
