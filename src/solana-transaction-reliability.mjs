export function isBlockhashExpiryError(error) {
  const message = String(error?.message ?? error ?? '');
  return (
    message.includes('SOLANA_BLOCKHASH_EXPIRED') ||
    message.includes('block height exceeded') ||
    message.includes('Blockhash not found') ||
    message.includes('TransactionExpiredBlockheightExceededError')
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

export async function confirmSignatureOverRpc({
  rpc,
  signature,
  lastValidBlockHeight,
  timeoutMs = 60_000,
  pollMs = 750
}) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const statuses = await rpc.getSignatureStatuses([signature]);
    const status = statuses?.value?.[0] ?? null;

    if (status?.err) {
      throw new Error(
        `SOLANA_CONFIRMATION_FAILED:${JSON.stringify(status.err)}`
      );
    }
    if (isConfirmed(status)) return status;
    await sleep(pollMs);
  }

  const historical = await rpc
    .getSignatureStatuses(
      [signature],
      { searchTransactionHistory: true }
    )
    .catch(() => null);
  const historicalStatus = historical?.value?.[0] ?? null;

  if (historicalStatus?.err) {
    throw new Error(
      `SOLANA_CONFIRMATION_FAILED:${JSON.stringify(historicalStatus.err)}`
    );
  }
  if (isConfirmed(historicalStatus)) return historicalStatus;

  const blockHeight = await rpc.getBlockHeight('confirmed');
  if (
    Number.isFinite(lastValidBlockHeight) &&
    blockHeight > lastValidBlockHeight
  ) {
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
