import * as anchor from "@coral-xyz/anchor";
import { Percentage } from "@orca-so/common-sdk";
import {
  IGNORE_CACHE,
  ORCA_WHIRLPOOL_PROGRAM_ID,
  PDAUtil,
  WhirlpoolContext,
  buildWhirlpoolClient,
  swapQuoteByInputToken,
} from "@orca-so/whirlpools-sdk";
import { PublicKey } from "@solana/web3.js";

export const ORCA_DEVNET_PROGRAM_ID = new PublicKey(
  "whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc",
);
export const ORCA_DEVNET_USDC_USDT_POOL = new PublicKey(
  "63cMwvN8eoaD39os9bKP8brmA7Xtov9VxahnPufWCSdg",
);
export const DEV_USDC_MINT = new PublicKey(
  "BRjpCHtyQLNCo8gqRUr8jtdAj5AjPYQaoqbvcZiHok1k",
);
export const DEV_USDT_MINT = new PublicKey(
  "H8UekPGwePSmQ3ttuYGPU1szyFfjZR4N53rymSFwpLPm",
);

function assertKey(actual, expected, label) {
  if (!actual.equals(expected)) {
    throw new Error(
      `ORCA_DEVNET_${label}_MISMATCH expected=${expected.toBase58()} actual=${actual.toBase58()}`,
    );
  }
}

export async function inspectOrcaDevnetUsdcUsdt({
  provider = anchor.AnchorProvider.env(),
  inputAmountBaseUnits = 100_000,
  slippageNumerator = 10,
  slippageDenominator = 1000,
} = {}) {
  assertKey(
    ORCA_WHIRLPOOL_PROGRAM_ID,
    ORCA_DEVNET_PROGRAM_ID,
    "PROGRAM_ID",
  );

  const ctx = WhirlpoolContext.withProvider(
    provider,
    undefined,
    undefined,
    {},
    ORCA_DEVNET_PROGRAM_ID,
  );
  const client = buildWhirlpoolClient(ctx);
  const whirlpool = await client.getPool(ORCA_DEVNET_USDC_USDT_POOL);
  const data = whirlpool.getData();

  const mintA = data.tokenMintA;
  const mintB = data.tokenMintB;
  const pairMatches =
    (mintA.equals(DEV_USDC_MINT) && mintB.equals(DEV_USDT_MINT)) ||
    (mintA.equals(DEV_USDT_MINT) && mintB.equals(DEV_USDC_MINT));

  if (!pairMatches) {
    throw new Error(
      `ORCA_DEVNET_POOL_PAIR_MISMATCH mintA=${mintA.toBase58()} mintB=${mintB.toBase58()}`,
    );
  }

  const swapQuote = await swapQuoteByInputToken(
    whirlpool,
    DEV_USDC_MINT,
    new anchor.BN(inputAmountBaseUnits),
    Percentage.fromFraction(slippageNumerator, slippageDenominator),
    ctx.program.programId,
    ctx.fetcher,
    IGNORE_CACHE,
  );

  const oracle = PDAUtil.getOracle(
    ctx.program.programId,
    ORCA_DEVNET_USDC_USDT_POOL,
  ).publicKey;

  return {
    endpoint: ctx.connection.rpcEndpoint,
    programId: ctx.program.programId.toBase58(),
    pool: ORCA_DEVNET_USDC_USDT_POOL.toBase58(),
    tokenMintA: mintA.toBase58(),
    tokenMintB: mintB.toBase58(),
    tokenVaultA: data.tokenVaultA.toBase58(),
    tokenVaultB: data.tokenVaultB.toBase58(),
    inputMint: DEV_USDC_MINT.toBase58(),
    outputMint: DEV_USDT_MINT.toBase58(),
    aToB: swapQuote.aToB,
    amountSpecifiedIsInput: swapQuote.amountSpecifiedIsInput,
    inputAmountBaseUnits: Number(swapQuote.amount.toString()),
    minimumOutputBaseUnits: Number(swapQuote.otherAmountThreshold.toString()),
    estimatedOutputBaseUnits: Number(swapQuote.estimatedAmountOut.toString()),
    sqrtPriceLimit: swapQuote.sqrtPriceLimit.toString(),
    tickArray0: swapQuote.tickArray0.toBase58(),
    tickArray1: swapQuote.tickArray1.toBase58(),
    tickArray2: swapQuote.tickArray2.toBase58(),
    oracle: oracle.toBase58(),
  };
}
