/** Individual, expiring, single-use fictional Family research invitations.
 * This module runs in Cloudflare Workers and in Node fake-response tests.
 * No tester identity, age, email or wallet is part of the code.
 */
export const MAX_INVITE_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;
const valid = /^fi1\.([0-9a-z]{5,9})\.([a-f0-9]{32})\.([a-f0-9]{64})$/;
export async function verifyFamilyPracticeInvite(code, master, now = Date.now()) {
  if (typeof master !== 'string' || master.length < 32 || master.length > 256 ||
      typeof code !== 'string' || code.length > 160) return false;
  const parts = code.match(valid);
  if (!parts) return false;
  const expires = Number.parseInt(parts[1], 36) * 1000;
  if (!Number.isSafeInteger(expires) || now >= expires ||
      expires - now > MAX_INVITE_LIFETIME_MS) return false;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(master),
    {name:'HMAC', hash:'SHA-256'}, false, ['sign']);
  const body = 'fi1.' + parts[1] + '.' + parts[2];
  const signed = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body)));
  const submitted = parts[3];
  let mismatch = 0;
  for(let i=0;i<signed.length;i++){
    const h = signed[i].toString(16).padStart(2,'0');
    mismatch |= h.charCodeAt(0) ^ submitted.charCodeAt(i*2);
    mismatch |= h.charCodeAt(1) ^ submitted.charCodeAt(i*2+1);
  }
  return mismatch === 0;
}
