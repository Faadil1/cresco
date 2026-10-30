#!/usr/bin/env node
/** Mint a one-use adult-only CRESCO Family code on the owner's device.
 * No network calls, no participant identity. DO NOT store the output in git.
 * The same HMAC signing secret must later be provisioned to the NEW Family API.
 */
import {createHmac,randomBytes} from 'node:crypto';
const args=process.argv.slice(2);
const secret=process.env.CRESCO_FAMILY_PRACTICE_INVITE_TOKEN;
const hours=Number(args[1] ?? '72');
if(args[0]!=='--hours'||args.length!==2||!Number.isInteger(hours)||
  hours<1||hours>168||!secret||secret.length<32||secret.length>256) {
  process.stderr.write('NO_INVITE_CREATED: use --hours 1..168 and set private CRESCO_FAMILY_PRACTICE_INVITE_TOKEN (32..256 chars) locally.\n');
  process.exitCode=2;
} else {
  const expires=Math.floor((Date.now()+hours*3600000)/1000).toString(36);
  const payload='fi1.'+expires+'.'+randomBytes(16).toString('hex');
  const mac=createHmac('sha256',secret).update(payload).digest('hex');
  process.stdout.write(payload+'.'+mac+'\n');
}
