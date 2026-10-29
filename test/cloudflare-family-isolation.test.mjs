import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createWorldFairWorkflow, createMemoryWorkflowStore } from '../src/worlds-fair-workflow.mjs';
import { handleCrescoFamilyOnlyRequest, familyWorkerPolicy } from '../src/cloudflare-family-only-worker.mjs';

const P = 'https://family.example.test/api/v0.4/worlds-fair';
const ORIGIN = 'https://cresco-family-web.faadil-casecraft.workers.dev';
function env() {
  return {
    CRESCO_FAMILY_WEB_ORIGIN: ORIGIN,
    CRESCO_FAMILY_STAGING_REQUIRE_ACCESS: '1',
    CRESCO_FAMILY_CREATE_TOKEN: 'private-invite',
    FAMILY_STATE: {
      idFromName: (s) => s,
      get: () => ({
        fetch: async (input) => {
          const path = new URL(typeof input === 'string' ? input : input.url).pathname;
          return Response.json(path === '/lease/acquire' ? {acquired:true} : {released:true});
        }
      })
    }
  };
}
const call = (method, path, body, headers = {}, environment = env(), services = {}) =>
  handleCrescoFamilyOnlyRequest(new Request(P + path, {
    method, headers: {
      origin: ORIGIN, ...(body === undefined ? {} : {'content-type':'application/json'}),
      ...headers
    },
    ...(body === undefined ? {} : {body:JSON.stringify(body)})
  }),environment,services,{access:{aud:'test-family-access'}});

const readConfig = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));

test('Family uses distinct Worker names and Durable Object binding, preserving Colosseum config byte-for-byte', () => {
  const oldApi = readConfig('../wrangler.jsonc');
  const isolatedApi = readConfig('../wrangler.family-api.jsonc');
  const oldWeb = readConfig('../apps/web/wrangler.jsonc');
  const isolatedWeb = readConfig('../apps/web/wrangler.family.jsonc');
  assert.equal(oldApi.name,'cresco-api-stocklana');
  assert.equal(oldWeb.name,'cresco');
  assert.equal(isolatedApi.name,'cresco-family-api');
  assert.equal(isolatedWeb.name,'cresco-family-web');
  assert.equal(isolatedApi.main,'src/cloudflare-family-only-worker.mjs');
  assert.equal(isolatedApi.durable_objects.bindings[0].class_name,'CrescoFamilyIsolatedState');
  assert.notEqual(isolatedApi.durable_objects.bindings[0].class_name,oldApi.durable_objects.bindings[0].class_name);
  assert.notEqual(isolatedApi.name,oldApi.name);
  assert.notEqual(isolatedWeb.name,oldWeb.name);
  assert.ok(!JSON.stringify(isolatedApi).includes('keys-api-stocklana'));
  assert.ok(!JSON.stringify(isolatedWeb).includes('cresco-api-stocklana'));
  assert.ok(!Object.keys(isolatedApi.vars).some(k=>/DEVNET_KEYPAIR|SOLANA_DEVNET_RPC|PYTH_PRO_API_KEY/.test(k)));
});

test('Family invitation preflight is accepted only for the dedicated frontend Origin', async () => {
  const cfg=env();
  const res=await handleCrescoFamilyOnlyRequest(
    new Request(P+'/workspaces',{method:'OPTIONS',headers:{
      origin:ORIGIN,'access-control-request-method':'POST',
      'access-control-request-headers':'x-cresco-create-token'
    }}),cfg);
  assert.equal(res.status,204);
  assert.equal(res.headers.get('access-control-allow-origin'),ORIGIN);
  assert.match(res.headers.get('access-control-allow-headers')||'',/x-cresco-create-token/);
  const bad=await handleCrescoFamilyOnlyRequest(new Request(P+'/workspaces',{method:'OPTIONS',headers:{
    origin:'https://attacker.example','access-control-request-method':'POST'
  }}),cfg);
  assert.equal(bad.status,403);
  assert.equal(bad.headers.get('access-control-allow-origin'),null);
});

test('Family-only Worker refuses Capital/legacy APIs, unconfigured origin, invite and Devnet writes', async () => {
  const cfg=env();
  assert.equal((await call('POST','/workspaces',{useCase:'capital'},{'x-cresco-create-token':'private-invite'},cfg)).status,403);
  assert.equal((await call('POST','/workspaces',{useCase:'family'}, {}, cfg)).status,401);
  assert.equal((await call('POST','/workspaces',{useCase:'family'},{'x-cresco-create-token':'bad'},cfg)).status,401);
  assert.equal((await call('POST','/workspaces/ws-abc123/bootstrap',{}, {}, cfg)).status,423);
  assert.equal((await call('POST','/workspaces/ws-abc123/intents',{inputAmount:200000}, {}, cfg)).status,423);
  assert.equal((await call('GET','/api/v0.3/worlds-fair/run',undefined,{},cfg)).status,404);
  assert.equal((await call('GET','/workspaces',undefined,{origin:'https://untrusted.test'},cfg)).status,403);
  assert.equal((await call('POST','/workspaces',{useCase:'family'},{'x-cresco-create-token':'private-invite'}, {...cfg,CRESCO_FAMILY_WEB_ORIGIN:null})).status,503);
  assert.equal((await call('POST','/workspaces',{useCase:'family'},{'x-cresco-create-token':'private-invite'}, {...cfg,FAMILY_STATE:null})).status,503);
  assert.equal((await call('POST','/workspaces',{useCase:'family'}, {'x-cresco-create-token':'private-invite'}, {...cfg,CRESCO_FAMILY_CREATE_TOKEN:null})).status,503);
});

test('Family-only Worker issues only Family roles and exposes isolated contract, with chain blocked', async () => {
  const cfg=env();
  const store=createMemoryWorkflowStore();
  const workflow=createWorldFairWorkflow({store,chainFactory:null});
  const services={worldFairWorkflow:workflow};
  const created=await call('POST','/workspaces',{useCase:'family',guardianMode:'server'},
    {'x-cresco-create-token':'private-invite'},cfg,services);
  assert.equal(created.status,201);
  const family=await created.json();
  assert.equal(family.useCase,'family');
  assert.ok(family.recoveryEnrollmentCode?.startsWith('fec_'));
  for(const role of ['operator','principal','risk']){
    const who=await call('GET',`/workspaces/${family.id}/whoami`,undefined,
      {authorization:`Bearer ${family.tokens[role]}`},cfg,services);
    assert.equal(who.status,200);
    assert.equal((await who.json()).role,role);
  }
  const locked=await call('POST',`/workspaces/${family.id}/bootstrap`,{},
    {authorization:`Bearer ${family.tokens.principal}`},cfg,services);
  assert.equal(locked.status,423);
  const api=await call('GET','/openapi',undefined,{},cfg,services);
  assert.equal(api.status,200);
  const spec=await api.json();
  assert.equal(spec['x-cresco-family-only'],true);
  assert.equal(spec['x-cresco-devnet-writes-enabled'],false);
  assert.ok(Object.keys(spec.paths).some(p=>p.includes('/principal/recovery/challenge')));
  const saved=await store.get(`wf:ws:${family.id}`);
  assert.ok(!JSON.stringify(saved).includes(family.recoveryEnrollmentCode));
  assert.equal(saved.useCase,'family');
  assert.equal((await call('GET',`/workspaces/${family.id}`,undefined,{},cfg,services)).status,401);
});

test('Family policy refuses all Devnet money-mutating endpoints while allowing safe account recovery endpoint', async () => {
  const e=env();
  const deny=['/bootstrap','/intents','/requests/req-aabbcc/decision',
    '/mandate/status','/mandate/policy','/asset-rule','/vault/topup',
    '/guardian/submit','/reconcile'];
  for(const path of deny){
    const req=new Request(P+'/workspaces/ws-abc123'+path,{method:'POST',headers:{origin:ORIGIN}});
    assert.equal(familyWorkerPolicy(req,e)?.status,423,path);
  }
  for(const path of ['/principal/wallet','/principal/recovery/challenge','/principal/recovery/complete','/roles/operator/rotate']){
    const req=new Request(P+'/workspaces/ws-abc123'+path,{method:'POST',headers:{origin:ORIGIN}});
    assert.equal(familyWorkerPolicy(req,e),null,path);
  }
});
