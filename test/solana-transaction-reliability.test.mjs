import test from 'node:test';
import assert from 'node:assert/strict';

import {
  confirmSignatureOverRpc,
  executeTransactionBuilderOverRpc,
  isBlockhashExpiryError,
  isTransientSolanaRpcError
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


test('transient RPC classifier recognizes rate limiting and transport failures', () => {
  assert.equal(
    isTransientSolanaRpcError(new Error('429 Too Many Requests')),
    true
  );
  assert.equal(
    isTransientSolanaRpcError(new Error('ECONNRESET')),
    true
  );
  assert.equal(
    isTransientSolanaRpcError(new Error('semantic policy refusal')),
    false
  );
});

test('confirmation tolerates a transient RPC poll failure before success', async () => {
  let calls = 0;
  const rpc = {
    async getSignatureStatuses() {
      calls += 1;
      if (calls === 1) {
        throw new Error('429 Too Many Requests');
      }
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
    signature: 'sig-after-429',
    lastValidBlockHeight: 100,
    timeoutMs: 5_000,
    pollMs: 0
  });

  assert.equal(result.confirmationStatus, 'confirmed');
  assert.equal(calls, 2);
});

test('confirmation reconciles a late historical signature before declaring expiry', async () => {
  let historicalCalls = 0;
  const rpc = {
    async getSignatureStatuses(_signatures, options) {
      if (!options?.searchTransactionHistory) {
        return { value: [null] };
      }

      historicalCalls += 1;
      if (historicalCalls < 2) {
        return { value: [null] };
      }

      return {
        value: [
          {
            err: null,
            confirmationStatus: 'finalized'
          }
        ]
      };
    },
    async getBlockHeight() {
      return 101;
    }
  };

  const result = await confirmSignatureOverRpc({
    rpc,
    signature: 'sig-late-history',
    lastValidBlockHeight: 100,
    timeoutMs: 0,
    pollMs: 0
  });

  assert.equal(result.confirmationStatus, 'finalized');
  assert.equal(historicalCalls, 2);
});
