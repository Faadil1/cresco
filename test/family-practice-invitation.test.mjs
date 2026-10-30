import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {verifyFamilyPracticeInvite} from '../src/cloudflare-family-practice-invitation.mjs';
const tool=fileURLToPath(new URL('../scripts/family-practice-mint-one-use-invite.mjs',import.meta.url));
const master='test-owner-master-key-never-live-0123456789-verylong';
const issue=(hours='72',key=master)=>spawnSync(process.execPath,[tool,'--hours',hours],{
  encoding:'utf8',timeout:5000,env:{...process.env,CRESCO_FAMILY_PRACTICE_INVITE_TOKEN:key}
});
test('individually minted invite verifies in Worker WebCrypto without shared token exposure',async()=>{
  const a=issue(),b=issue();
  assert.equal(a.status,0);
  assert.equal(b.status,0);
  const code=a.stdout.trim();
  assert.match(code,/^fi1\.[a-z0-9]{5,9}\.[a-f0-9]{32}\.[a-f0-9]{64}$/);
  assert.equal(await verifyFamilyPracticeInvite(code,master),true);
  assert.notEqual(code,b.stdout.trim());
  assert.ok(!code.includes(master));
  assert.equal(await verifyFamilyPracticeInvite(code,'another-very-long-test-owner-master-987654'),false);
  assert.equal(await verifyFamilyPracticeInvite(code.slice(0,-1)+'0',master),false);
});
test('expiry is enforced and cannot extend beyond 7 days',async()=>{
  const r=issue('1');assert.equal(r.status,0);
  const code=r.stdout.trim();
  assert.equal(await verifyFamilyPracticeInvite(code,master,Date.now()+2*3600000),false);
  assert.equal(await verifyFamilyPracticeInvite(code,master,Date.now()),true);
  assert.equal(issue('169').status,2);
  assert.equal(issue('0').status,2);
});
test('No master key, invalid arguments or malformed code are refused',async()=>{
  assert.equal(issue('72','').status,2);
  assert.equal(issue('bad').status,2);
  assert.equal(await verifyFamilyPracticeInvite('old-shared-invite-is-not-allowed',master),false);
  assert.equal(await verifyFamilyPracticeInvite(null,master),false);
});
