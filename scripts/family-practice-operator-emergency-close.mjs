#!/usr/bin/env node
/**
 * Safe offline review template for a future owner-authorized emergency shutdown.
 * This script is NOT run by CI and never modifies the Colosseum Workers.
 * It acts ONLY when explicitly invoked with both named environment variables
 * and a full confirmation flag. Never print the operator token.
 */
const id = process.argv[2];
const confirm = process.argv[3];
const api = process.env.CRESCO_FAMILY_PRACTICE_API_URL;
const secret = process.env.CRESCO_FAMILY_PRACTICE_OPERATOR_TOKEN;
const accessId = process.env.CRESCO_FAMILY_ACCESS_SERVICE_CLIENT_ID;
const accessSecret = process.env.CRESCO_FAMILY_ACCESS_SERVICE_CLIENT_SECRET;

function refuse(message) {
  process.stderr.write(message + '\n');
  process.exitCode = 2;
}

if (confirm !== '--confirm-end-fictional-practice') {
  refuse('Refused: explicit --confirm-end-fictional-practice flag is required.');
} else if (!/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/.test(id || '')) {
  refuse('Refused: exact fictional practice UUID required.');
} else if (!api || !secret || secret.length < 32 || secret.length > 256 ||
  !accessId || !accessSecret || accessId.length < 12 || accessSecret.length < 20) {
  refuse('Refused: exact API, operator secret, and separate Cloudflare Access service credentials are all required.');
} else {
  let url;
  try { url = new URL(api); } catch { url = null; }
  if (!url || url.protocol !== 'https:' ||
    url.hostname !== 'cresco-family-api.faadil-casecraft.workers.dev' ||
    url.pathname !== '/' || url.search || url.hash ||
    url.hostname === 'keys-api-stocklana.faadil-casecraft.workers.dev') {
    refuse('Refused: only an independently identified cresco-family-api Workers.dev origin is allowed.');
  } else {
    try {
      const response = await fetch(
        url.origin + '/api/family-practice/v1/sessions/' + id + '/emergency-close',
        {
          method: 'POST',
          redirect: 'error',
          cache: 'no-store',
          headers: {
            'x-cresco-family-practice-operator': secret,
            'CF-Access-Client-Id': accessId,
            'CF-Access-Client-Secret': accessSecret,
            'content-type': 'application/json'
          },
          body: '{}',
          signal: AbortSignal.timeout(10000)
        }
      );
      const result = await response.json().catch(() => null);
      if (response.status === 200 && result?.closed === true &&
        result?.allRoleCodesRevoked === true && result?.fictionalHistoryCleared === true) {
        process.stdout.write('Confirmed: server reports fictional practice closed and both role codes revoked. Backup retention requires separate review.\n');
      } else {
        refuse('Closure NOT confirmed. Response status: ' + response.status + '. Escalate for private investigation.');
      }
    } catch {
      refuse('Closure NOT confirmed: request failed or timed out. Do not assume role codes are revoked.');
    }
  }
}
