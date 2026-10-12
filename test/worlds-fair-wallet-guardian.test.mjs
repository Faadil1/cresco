import test from 'node:test';
import assert from 'node:assert/strict';
import { Keypair, Transaction } from '@solana/web3.js';

import {
  base58Encode,
  createWorldFairWorkspaceChain,
  deriveWorldFairWorkspaceDelegate
} from '../src/worlds-fair-orca-provider.mjs';

const guardian = Keypair.fromSeed(new Uint8Array(32).fill(7));
const principal = Keypair.fromSeed(new Uint8Array(32).fill(9));
const BLOCKHASH = 'GHtXQBsoZHVnNFa9YevAzFr17DJjgHXk3ycTKD5xD3Zi';

function fakeConnection() {
  const sent = [];
  return {
    sent,
    async getMultipleAccountsInfo(keys) {
      return keys.map(() => null);
    },
    async getLatestBlockhash() {
      return { blockhash: BLOCKHASH, lastValidBlockHeight: 1_000 };
    },
    async sendRawTransaction(raw) {
      sent.push(Buffer.from(raw));
      return 'ignored';
    },
    async getSignatureStatuses() {
      return { value: [{ confirmationStatus: 'confirmed', err: null }] };
    },
    async getBlockHeight() {
      return 10;
    }
  };
}

function walletChain(connection) {
  return createWorldFairWorkspaceChain({
    guardian,
    pythApiKey: 'k',
    workspaceId: 'ws-wallet01',
    policy: {},
    connection,
    guardianWallet: principal.publicKey.toBase58()
  });
}

test('principal-wallet mode: the wallet is the guardian and gets a separate delegate', () => {
  const chain = walletChain(fakeConnection());
  assert.equal(chain.walletGuardian, true);
  assert.equal(chain.ids.guardian, principal.publicKey.toBase58());
  assert.notEqual(chain.ids.delegate, deriveWorldFairWorkspaceDelegate(guardian, 'ws-wallet01').publicKey.toBase58());
});

test('principal-wallet bootstrap is ONE transaction the server cannot complete alone', async () => {
  const connection = fakeConnection();
  const chain = walletChain(connection);
  const out = await chain.bootstrapWorkspace();
  assert.equal(out.status, 'NEEDS_GUARDIAN_SIGNATURE');
  const request = out.guardianSignature;
  assert.equal(request.guardian, principal.publicKey.toBase58());
  const raw = Buffer.from(request.transaction, 'base64');
  const tx = Transaction.from(raw);
  assert.ok(tx.feePayer.equals(principal.publicKey), 'the wallet pays and signs');
  // charter, mandate, review, transition, asset rule, 2 vaults, policy
  assert.equal(tx.instructions.length, 8);
  assert.ok(raw.length <= 1232, `fits a Solana packet (${raw.length} bytes)`);
  const walletSig = tx.signatures.find((s) => s.publicKey.equals(principal.publicKey));
  assert.equal(walletSig.signature, null, 'server never signs as guardian');
  assert.equal(tx.signatures.filter((s) => s.signature).length, 1, 'only the workspace delegate pre-signed (charter beneficiary)');
  assert.ok(!tx.signatures.some((s) => s.publicKey.equals(guardian.publicKey)), 'server key is not a signer');
  assert.equal(connection.sent.length, 0, 'nothing was sent');
});

test('submit: only the exact prepared message with a valid wallet signature is sent', async () => {
  const connection = fakeConnection();
  const chain = walletChain(connection);
  const { guardianSignature: request } = await chain.bootstrapWorkspace();

  const unsigned = Transaction.from(Buffer.from(request.transaction, 'base64'));
  await assert.rejects(
    chain.submitGuardianTransaction({ signedTransaction: request.transaction, expectedMessage: request.message }),
    /GUARDIAN_SIGNATURE_INVALID/
  );

  const altered = Transaction.from(Buffer.from(request.transaction, 'base64'));
  altered.instructions.pop();
  altered.partialSign(principal);
  await assert.rejects(
    chain.submitGuardianTransaction({ signedTransaction: altered.serialize({ requireAllSignatures: false, verifySignatures: false }).toString('base64'), expectedMessage: request.message }),
    /GUARDIAN_TRANSACTION_ALTERED/
  );
  assert.equal(connection.sent.length, 0);

  unsigned.partialSign(principal);
  const res = await chain.submitGuardianTransaction({ signedTransaction: unsigned.serialize().toString('base64'), expectedMessage: request.message, lastValidBlockHeight: 1_000 });
  assert.equal(res.status, 'CONFIRMED');
  assert.equal(res.signature, base58Encode(unsigned.signatures[0].signature));
  assert.equal(connection.sent.length, 1);
});

test('server-guardian workspaces cannot accept wallet submissions', async () => {
  const chain = createWorldFairWorkspaceChain({ guardian, pythApiKey: 'k', workspaceId: 'ws-server01', policy: {}, connection: fakeConnection() });
  assert.equal(chain.walletGuardian, false);
  assert.equal(chain.ids.guardian, guardian.publicKey.toBase58());
  await assert.rejects(chain.submitGuardianTransaction({ signedTransaction: 'x', expectedMessage: 'y' }), /NOT_A_WALLET_GUARDIAN/);
});

test('wallet-signed lifecycle and grant transactions carry a server co-signature so wallets cannot rewrite them', async () => {
  const connection = fakeConnection();
  const chain = walletChain(connection);
  const out = await chain.setMandateStatus({ status: 'PAUSED', expectedNonce: 3 });
  assert.equal(out.status, 'NEEDS_GUARDIAN_SIGNATURE');
  const tx = Transaction.from(Buffer.from(out.guardianSignature.transaction, 'base64'));
  assert.ok(tx.feePayer.equals(principal.publicKey));
  const signed = tx.signatures.filter((s) => s.signature).map((s) => s.publicKey.toBase58());
  assert.deepEqual(signed, [guardian.publicKey.toBase58()], 'only the lab memo co-signature is present');
  assert.equal(tx.signatures.find((s) => s.publicKey.equals(principal.publicKey)).signature, null);
  const memo = tx.instructions.at(-1);
  assert.equal(memo.programId.toBase58(), 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');
  assert.match(memo.data.toString('utf8'), /set_mandate_status/);
  // The wallet signs; the submit check still accepts the exact message.
  tx.partialSign(principal);
  const res = await chain.submitGuardianTransaction({ signedTransaction: tx.serialize().toString('base64'), expectedMessage: out.guardianSignature.message, lastValidBlockHeight: 1_000 });
  assert.equal(res.status, 'CONFIRMED');
});
