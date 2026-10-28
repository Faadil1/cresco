#!/usr/bin/env node
/**
 * Read-only public Web build observation. GET only, never signs, writes,
 * sends role bearer tokens, cookies or triggers a Devnet transaction.
 * Evidence from HTML is only a 7-character on-page build hint, NOT a
 * cryptographically verified source-to-deployment binding.
 */
import { pathToFileURL } from 'node:url';

function bareHttps(value) {
  if (!value) throw new Error('web origin required');
  const u = new URL(value);
  if (u.protocol !== 'https:' || u.origin !== value || u.username || u.password ||
      u.search || u.hash || u.pathname !== '/') throw new Error('Require bare HTTPS web origin');
  return value;
}

export async function probeFamilyWebReadOnly(webOrigin, fetchImpl = fetch) {
  const origin = bareHttps(webOrigin);
  const checks = [];
  let buildHint = null;
  for (const path of ['/', '/worlds-fair/desk']) {
    try {
      const res = await fetchImpl(origin + path, {
        method: 'GET', redirect: 'manual', credentials: 'omit',
        headers: { accept: 'text/html' }
      });
      checks.push({ path, status: res.status, ok: res.status === 200,
        contentTypeIsHtml: (res.headers.get('content-type') || '').includes('text/html') });
      if (path === '/' && res.status === 200) {
        // The public page source prints "build <7-char commit>" in the footer.
        // Reporting only the parsed hint prevents uploading pages, cookies or
        // other response material to GitHub logs.
        const html = await res.text();
        const match = html.match(/\bbuild\s+([a-f0-9]{7}|unknown)\b/i);
        buildHint = match ? match[1] : null;
      }
    } catch {
      checks.push({ path, ok: false, error: 'Host unreachable or probe failed' });
    }
  }
  return {
    result: checks.every(x => x.ok && x.contentTypeIsHtml) ? 'REACHABLE' : 'FAIL',
    methods: ['GET'], credentialsSent: false, chainWrites: false,
    buildHint, immutableDeploymentIdVerified: false, sourceCommitVerified: false,
    checks
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const [flag, webOrigin] = process.argv.slice(2);
    if (flag !== '--web-origin' || !webOrigin || process.argv.length !== 4) throw new Error('Usage: --web-origin https://domain');
    const result = await probeFamilyWebReadOnly(webOrigin);
    console.log(JSON.stringify(result, null, 2));
    if (result.result !== 'REACHABLE') process.exitCode = 1;
  } catch (err) {
    console.error('READ_ONLY_WEB_PROBE_ERROR:', err instanceof Error ? err.message : String(err));
    process.exitCode = 2;
  }
}
