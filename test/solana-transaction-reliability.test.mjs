import test from 'node:test';
import assert from 'node:assert/strict';

import {
  confirmSignatureOverRpc,
  executeTransactionBuilderOverRpc,
  isBlockhashExpiryError
} from '../src/solana-transaction-reliability.mjs';

test('blockhash expiry classifier recognizes Solana SDK expiry wording', () => {
  assert.equal(
    isBlockhashExpiryError(
      new Error('Signature abc has expired: block height exceeded.')
    ),
    true
  );
  assert.equal(isBlockhashExpiryError(new Error('other failure')), false);
});

test('confirmation accepts an already confirmed signature', async () => {
  const rpc = {
    async getSignatureStatuses() {
      return {
        value: [
          {
            err: null,
            confirmationStatus: 'confirmed'
          }
        ]
      };
    }
  };

  const result = await confirmSignatureOverRpc({
    rpc,
    signature: 'sig-confirmed',
    lastValidBlockHeight: 100
  });

  assert.equal(result.confirmationStatus, 'confirmed');
});

test('confirmation reports explicit blockhash expiry after final history check', async () => {
  const rpc = {
    async getSignatureStatuses() {
      return { value: [null] };
    },
    async getBlockHeight() {
      return 101;
    }
  };

  await assert.rejects(
    confirmSignatureOverRpc({
      rpc,
      signature: 'sig-expired',
      lastValidBlockHeight: 100,
      timeoutMs: 0,
      pollMs: 0
    }),
    /SOLANA_BLOCKHASH_EXPIRED:sig-expired/
  );
});

test('transaction builder path signs, sends and confirms without SDK confirmTransaction', async () => {
  const signed = [];
  const transaction = {
    partialSign(...signers) {
      signed.push(...signers);
    },
    serialize() {
      return Buffer.from('tx');
    }
  };
  const payer = {
    publicKey: {
      toBase58() {
        return 'payer';
      }
    }
  };
  const extra = {
    publicKey: {
      toBase58() {
        return 'extra';
      }
    }
  };
  const builder = {
    async build({ latestBlockhash }) {
      assert.equal(latestBlockhash.blockhash, 'fresh');
      return {
        transaction,
        signers: [extra],
        recentBlockhash: latestBlockhash
      };
    }
  };
  const rpc = {
    async getLatestBlockhash() {
      return { blockhash: 'fresh', lastValidBlockHeight: 100 };
    },
    async sendRawTransaction() {
      return 'sig-ok';
    },
    async getSignatureStatuses() {
      return {
        value: [
          {
            err: null,
            confirmationStatus: 'confirmed'
          }
        ]
      };
    }
  };

  const signature = await executeTransactionBuilderOverRpc({
    rpc,
    builder,
    payerSigner: payer
  });

  assert.equal(signature, 'sig-ok');
  assert.equal(signed.length, 2);
});
