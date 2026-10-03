export function isBlockhashExpiryError(error) {
  const message = String(error?.message ?? error ?? '');
  return (
    message.includes('SOLANA_BLOCKHASH_EXPIRED') ||
    message.includes('block height exceeded') ||
    message.includes('Blockhash not found') ||
    message.includes('TransactionExpiredBlockheightExceededError')
  );
}

export function isTransientSolanaRpcError(error) {
  const message = String(error?.message ?? error ?? '');
  return (
    message.includes('429 Too Many Requests') ||
    message.includes('fetch failed') ||
    message.includes('ECONNRESET') ||
    message.includes('ETIMEDOUT') ||
    message.includes('UND_ERR_CONNECT_TIMEOUT') ||
    message.includes('socket hang up') ||
    message.includes('Service Unavailable') ||
    message.includes('Gateway Timeout')
  );
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isConfirmed(status) {
  return (
    status &&
    !status.err &&
    ['confirmed', 'finalized'].includes(status.confirmationStatus)
  );
}

async function getStatusesWithTransientRetry(
  rpc,
  signature,
  options = undefined,
  { attempts = 4, delayMs = 750 } = {}
) {
  let lastError = null;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await rpc.getSignatureStatuses(
        [signature],
        options
      );
    } catch (error) {
      lastError = error;
      if (!isTransientSolanaRpcError(error) || attempt === attempts) {
        throw error;
      }
      await sleep(delayMs * attempt);
    }
  }

  throw lastError;
}

async function reconcileHistoricalSignature({
  rpc,
  signature,
  attempts = 4,
  delayMs = 900
}) {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const historical = await getStatusesWithTransientRetry(
      rpc,
      signature,
      { searchTransactionHistory: true },
      { attempts: 3, delayMs }
    );
    const status = historical?.value?.[0] ?? null;

    if (status?.err) {
      throw new Error(
        `SOLANA_CONFIRMATION_FAILED:${JSON.stringify(status.err)}`
      );
    }
    if (isConfirmed(status)) return status;

    if (attempt < attempts) {
      await sleep(delayMs * attempt);
    }
  }

  return null;
}

async function getBlockHeightWithTransientRetry(
  rpc,
  { attempts = 4, delayMs = 750 } = {}
) {
  let lastError = null;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await rpc.getBlockHeight('confirmed');
    } catch (error) {
      lastError = error;
      if (!isTransientSolanaRpcError(error) || attempt === attempts) {
        throw error;
      }
      await sleep(delayMs * attempt);
    }
  }

  throw lastError;
}

export async function confirmSignatureOverRpc({
  rpc,
  signature,
  lastValidBlockHeight,
  timeoutMs = 60_000,
  pollMs = 750
}) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    let statuses;
    try {
      statuses = await rpc.getSignatureStatuses([signature]);
    } catch (error) {
      if (!isTransientSolanaRpcError(error)) throw error;
      await sleep(pollMs);
      continue;
    }

    const status = statuses?.value?.[0] ?? null;

    if (status?.err) {
      throw new Error(
        `SOLANA_CONFIRMATION_FAILED:${JSON.stringify(status.err)}`
      );
    }
    if (isConfirmed(status)) return status;
    await sleep(pollMs);
  }

  // A transaction can be confirmed on-chain while the public RPC index lags.
  // Reconcile the exact signature from history before declaring UNKNOWN.
  const reconciled = await reconcileHistoricalSignature({
    rpc,
    signature
  });
  if (reconciled) return reconciled;

  const blockHeight = await getBlockHeightWithTransientRetry(rpc);
  if (
    Number.isFinite(lastValidBlockHeight) &&
    blockHeight > lastValidBlockHeight
  ) {
    // One final history reconciliation after expiry avoids a false UNKNOWN
    // when the signature landed near the validity boundary.
    const postExpiry = await reconcileHistoricalSignature({
      rpc,
      signature,
      attempts: 2,
      delayMs: 500
    });
    if (postExpiry) return postExpiry;

    throw new Error(`SOLANA_BLOCKHASH_EXPIRED:${signature}`);
  }

  throw new Error(`SOLANA_CONFIRMATION_TIMEOUT:${signature}`);
}

function uniqueSigners(signers) {
  const seen = new Set();
  const out = [];

  for (const signer of signers.filter(Boolean)) {
    const key = signer.publicKey?.toBase58?.() ?? String(signer.publicKey);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(signer);
  }

  return out;
}

export async function executeTransactionBuilderOverRpc({
  rpc,
  builder,
  payerSigner,
  timeoutMs = 60_000
}) {
  const latest = await rpc.getLatestBlockhash('confirmed');
  const built = await builder.build({ latestBlockhash: latest });
  const transaction = built.transaction;
  const signers = uniqueSigners([
    payerSigner,
    ...(built.signers ?? [])
  ]);

  let signature;
  if (typeof transaction.partialSign === 'function') {
    transaction.partialSign(...signers);
    signature = await rpc.sendRawTransaction(transaction.serialize(), {
      skipPreflight: false,
      preflightCommitment: 'confirmed',
      maxRetries: 5
    });
  } else {
    transaction.sign(signers);
    signature = await rpc.sendTransaction(transaction, {
      skipPreflight: false,
      preflightCommitment: 'confirmed',
      maxRetries: 5
    });
  }

  await confirmSignatureOverRpc({
    rpc,
    signature,
    lastValidBlockHeight: built.recentBlockhash.lastValidBlockHeight,
    timeoutMs
  });

  return signature;
}
