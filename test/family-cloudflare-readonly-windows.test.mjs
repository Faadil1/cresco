import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const script=readFileSync(new URL('../scripts/family-cloudflare-readonly-windows.ps1', import.meta.url),'utf8');

test('Windows owner flow requires exact Family inventory branch and fake-API tests before prompting for secrets', () => {
  assert.match(script,/family\/cloudflare-windows-owner-audit-2026-10-29/);
  assert.match(script,/git branch --show-current/);
  assert.match(script,/node --test \$nodeTest/);
  assert.ok(script.indexOf('node --test $nodeTest') < script.indexOf("Read-Host 'Cloudflare account ID"));
  assert.match(script,/\[switch\]\$TestsOnly/);
});

test('Token is read hidden, only inherited to read-only Node child, and cleared on exit', () => {
  assert.match(script,/Read-Host '[^']*API token[^']*' -AsSecureString/);
  assert.match(script,/SecureStringToBSTR/);
  assert.match(script,/ZeroFreeBSTR/);
  assert.match(script,/Remove-Item Env:\\CLOUDFLARE_READONLY_API_TOKEN/);
  assert.match(script,/Remove-Item Env:\\CLOUDFLARE_ACCOUNT_ID/);
  assert.match(script,/node \$nodeScript/);
  assert.doesNotMatch(script,/Write-(?:Host|Output|Information)[^\n]*\$plainToken/);
});

test('Script does not alter the account, submit secrets, or run deployments', () => {
  for(const forbidden of ['wrangler deploy','wrangler publish','git push','git merge','Invoke-RestMethod','Invoke-WebRequest','New-Item Env:','Set-ExecutionPolicy']) {
    assert.equal(script.toLowerCase().includes(forbidden.toLowerCase()),false, forbidden);
  }
  assert.match(script,/No Worker, route, Access, or Durable Object will be modified/);
  assert.match(script,/CRESCO_CF_ACCOUNT_AUDIT_NO_GO/);
});
