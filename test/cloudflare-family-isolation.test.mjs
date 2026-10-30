import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { handleCrescoFamilyOnlyRequest, familyWorkerPolicy } from '../src/cloudflare-family-only-worker.mjs';

const ORIGIN='https://cresco-family-web.faadil-casecraft.workers.dev';
const ROOT='https://cresco-family-api.faadil-casecraft.workers.dev';
const config=()=>({
  CRESCO_FAMILY_WEB_ORIGIN:ORIGIN,
  CRESCO_FAMILY_RESEARCH_ONLY:'1'
});
const json=async(method,path,env=config())=>{
  const response=await handleCrescoFamilyOnlyRequest(new Request(ROOT+path,{
    method,headers:{origin:ORIGIN,...(method==='POST'?{'content-type':'application/json'}:{})},
    ...(method==='POST'?{body:'{}'}:{})
  }),env);
  return {status:response.status,body:await response.json()};
};

test('Family Worker is distinct from historically submitted Colosseum worker names and config blobs',()=>{
  const c=(path)=>JSON.parse(readFileSync(new URL('../'+path,import.meta.url),'utf8'));
  const oldApi=c('wrangler.jsonc'),oldWeb=c('apps/web/wrangler.jsonc');
  const api=c('wrangler.family-api.jsonc'),web=c('apps/web/wrangler.family.jsonc');
  assert.equal(oldApi.name,'cresco-api-stocklana');
  assert.equal(oldWeb.name,'cresco');
  assert.equal(api.name,'cresco-family-api');
  assert.equal(web.name,'cresco-family-web');
  assert.equal(api.vars.CRESCO_FAMILY_RESEARCH_ONLY,'1');
  assert.ok(!Object.hasOwn(api.vars,'CRESCO_FAMILY_STAGING_REQUIRE_ACCESS'));
  assert.equal(api.workers_dev,false);assert.equal(api.preview_urls,false);
  assert.equal(web.workers_dev,false);assert.equal(web.preview_urls,false);
});

test('No Cloudflare Access login required; legacy workspace, Solana and capital APIs blocked at router',async()=>{
  for(const [method,path] of [
    ['POST','/api/v0.4/worlds-fair/workspaces'],
    ['GET','/api/v0.4/worlds-fair/openapi'],
    ['POST','/api/v0.4/worlds-fair/workspaces/x/bootstrap'],
    ['POST','/api/v0.4/worlds-fair/workspaces/x/vault/topup'],
    ['GET','/api/v0.3/worlds-fair/run'],
    ['GET','/health'],
    ['OPTIONS','/api/v0.4/worlds-fair/workspaces']
  ]){
    const r=await json(method,path);
    assert.equal(r.status,404,path);
    assert.equal(r.body.error,'FAMILY_PRACTICE_ONLY');
  }
  const missing=await json('GET','/health',{...config(),CRESCO_FAMILY_RESEARCH_ONLY:null});
  assert.equal(missing.status,503);
  assert.equal(missing.body.error,'FAMILY_RESEARCH_GATE_UNCONFIGURED');
});

test('Legacy family policy still defaults all Devnet money writes to denied if evaluated separately',()=>{
  const e={...config(),FAMILY_STATE:{},CRESCO_FAMILY_CREATE_TOKEN:'test'};
  for(const segment of ['bootstrap','intents','mandate/status','mandate/policy',
    'asset-rule','vault/topup','guardian/submit','reconcile']){
    const req=new Request(ROOT+'/api/v0.4/worlds-fair/workspaces/ws-abc123/'+segment,{
      method:'POST',headers:{origin:ORIGIN}
    });
    assert.equal(familyWorkerPolicy(req,e)?.status,423,segment);
  }
});

test('Missing research flag rejects all traffic rather than opening an unauthenticated workspace',async()=>{
  const e={...config(),CRESCO_FAMILY_RESEARCH_ONLY:'0'};
  const r=await json('POST','/api/v0.4/worlds-fair/workspaces',e);
  assert.equal(r.status,503);
  assert.equal(r.body.error,'FAMILY_RESEARCH_GATE_UNCONFIGURED');
});
