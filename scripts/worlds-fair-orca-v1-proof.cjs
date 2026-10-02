const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');

const anchor = require('@coral-xyz/anchor');
const {
  TOKEN_PROGRAM_ID,
  NATIVE_MINT,
  getAccount,
  getOrCreateAssociatedTokenAccount,
  transfer,
} = require('@solana/spl-token');
const {
  WhirlpoolContext,
  buildWhirlpoolClient,
  swapQuoteByInputToken,
  ORCA_WHIRLPOOL_PROGRAM_ID,
  PDAUtil,
} = require('@orca-so/whirlpools-sdk');
const { Percentage } = require('@orca-so/common-sdk');
const { createEd25519Instruction } = require('@pythnetwork/pyth-lazer-solana-sdk');

const {
  PublicKey,
  Keypair,
  SystemProgram,
  Transaction,
  SYSVAR_INSTRUCTIONS_PUBKEY,
} = anchor.web3;

const ORCA_POOL = new PublicKey('63cMwvN8eoaD39os9bKP8brmA7Xtov9VxahnPufWCSdg');
const ORCA_SOL_USDC_POOL = new PublicKey('3KBZiL2g8C7tiJ32hTv5v3KM7aK9htpqTw4cTXz1HvPt');
const DEV_USDC = new PublicKey('BRjpCHtyQLNCo8gqRUr8jtdAj5AjPYQaoqbvcZiHok1k');
const DEV_USDT = new PublicKey('H8UekPGwePSmQ3ttuYGPU1szyFfjZR4N53rymSFwpLPm');
const PYTH_LAZER_PROGRAM_ID = new PublicKey('pytd2yyk641x7ak7mkaasSJVXh6YYZnC7wTmtgAyxPt');
const PYTH_LAZER_STORAGE_ID = new PublicKey('3rdJbqfnagQ4yx9HXJViD4zc4xpiSqmFsKpPuSCQVyQL');

const STANDING_MAX_NOTIONAL_MICRO_USD = 500_000;
const PERIOD_MAX_NOTIONAL_MICRO_USD = 10_000_000;
const MAX_ACTION_AMOUNT = 5_000_000;
const MAX_PERIOD_AMOUNT = 10_000_000;
const MAX_UNIT_PRICE_MICRO_USD = 2_000_000;
const PERIOD_SECONDS = 24 * 60 * 60;
const ACTION_SWAP_EXACT_IN = 2;

const STANDING_INPUT = 200_000; // 0.20 devUSDC
const EXCEPTION_INPUT = 750_000; // 0.75 devUSDC
const ROLLBACK_INPUT = 700_000; // 0.70 devUSDC

function hash32(value) {
  return Array.from(crypto.createHash('sha256').update(value).digest());
}

function u64le(value) {
  const out = Buffer.alloc(8);
  out.writeBigUInt64LE(BigInt(value));
  return out;
}

function i64le(value) {
  const out = Buffer.alloc(8);
  out.writeBigInt64LE(BigInt(value));
  return out;
}

function u128le(value) {
  let n = BigInt(value);
  const out = Buffer.alloc(16);
  for (let i = 0; i < 16; i += 1) {
    out[i] = Number(n & 0xffn);
    n >>= 8n;
  }
  return out;
}

function semanticSwapHash({
  mandate,
  pool,
  inputMint,
  outputMint,
  inputAmount,
  minOutputAmount,
  sqrtPriceLimit,
  deadline,
  mandateNonce,
}) {
  return crypto.createHash('sha256').update(Buffer.concat([
    Buffer.from('CRESCO_SWAP_V0'),
    mandate.toBuffer(),
    ORCA_WHIRLPOOL_PROGRAM_ID.toBuffer(),
    pool.toBuffer(),
    inputMint.toBuffer(),
    outputMint.toBuffer(),
    u64le(inputAmount),
    u64le(minOutputAmount),
    u128le(sqrtPriceLimit),
    i64le(deadline),
    u64le(mandateNonce),
    Buffer.from([1]),
    Buffer.from([1]),
  ])).digest();
}

function errorCode(error) {
  return (
    error?.error?.errorCode?.code ||
    error?.error?.errorMessage ||
    error?.logs?.find((x) => /Error Code:/.test(x)) ||
    String(error?.message || error)
  );
}

async function expectRefusal(label, fn, expectedMarkers = []) {
  try {
    await fn();
  } catch (error) {
    const code = errorCode(error);
    const text = [String(code), String(error?.message || ''), ...(error?.logs || [])].join('\n');
    if (expectedMarkers.length > 0 && !expectedMarkers.some((m) => text.includes(m))) {
      throw new Error(`${label}: unexpected refusal: ${text.slice(0, 1800)}`);
    }
    console.log(`PROOF ${label}=REFUSE code=${String(code).replace(/\s+/g, '_').slice(0, 160)}`);
    return { code: String(code), text };
  }
  throw new Error(`${label}: expected refusal but execution succeeded`);
}

function extractSymbolRows(body) {
  if (Array.isArray(body)) return body;
  for (const key of ['symbols', 'data', 'result', 'items']) {
    if (Array.isArray(body?.[key])) return body[key];
  }
  return [];
}

async function resolvePythUsdcFeed(apiKey) {
  const urls = [
    'https://pyth.dourolabs.app/v1/symbols?query=USDC&asset_type=crypto',
    'https://pyth.dourolabs.app/v1/symbols?query=Crypto.USDC%2FUSD',
  ];

  let diagnostics = [];
  for (const url of urls) {
    const response = await fetch(url, {
      headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
    });
    const text = await response.text();
    diagnostics.push({ url, status: response.status, sample: text.slice(0, 500) });
    if (!response.ok) continue;

    let body;
    try {
      body = JSON.parse(text);
    } catch {
      continue;
    }

    const rows = extractSymbolRows(body);
    const row = rows.find((item) => {
      const symbol = String(
        item?.symbol ?? item?.ticker ?? item?.display_symbol ?? item?.name ?? ''
      );
      return symbol.toLowerCase() === 'crypto.usdc/usd' ||
        (symbol.toLowerCase().includes('usdc') && symbol.toLowerCase().includes('usd'));
    });
    if (!row) continue;

    // Pyth's current symbols API names the numeric Lazer feed field
    // `pyth_lazer_id` (observed for Crypto.USDC/USD on 2026-10-02).
    // Keep older aliases for forward/backward compatibility without guessing.
    const feedId = Number(
      row.pyth_lazer_id ??
        row.pythLazerId ??
        row.price_feed_id ??
        row.priceFeedId ??
        row.feed_id ??
        row.feedId ??
        row.id
    );
    const minChannel =
      row.min_channel ?? row.minChannel ?? row.minimum_channel ?? 'fixed_rate@200ms';

    if (Number.isInteger(feedId) && feedId > 0 && feedId <= 0xffffffff) {
      return {
        symbol: 'Crypto.USDC/USD',
        feedId,
        exponent: Number(row.exponent ?? -8),
        minChannel,
        source: url,
      };
    }
  }

  throw new Error(`PYTH_USDC_LAZER_FEED_NOT_RESOLVED:${JSON.stringify(diagnostics)}`);
}

async function main() {
  assert(process.env.PYTH_PRO_API_KEY, 'PYTH_PRO_API_KEY is required');

  anchor.setProvider(anchor.AnchorProvider.env());
  const provider = anchor.getProvider();
  const program = anchor.workspace.Keys;
  const payer = provider.wallet.payer;
  assert(payer, 'Anchor NodeWallet payer is required');

  const delegate = Keypair.generate();
  const [charter] = PublicKey.findProgramAddressSync(
    [Buffer.from('charter'), delegate.publicKey.toBuffer()],
    program.programId,
  );
  const [mandate] = PublicKey.findProgramAddressSync(
    [Buffer.from('mandate'), charter.toBuffer()],
    program.programId,
  );
  const [assetRule] = PublicKey.findProgramAddressSync(
    [Buffer.from('asset-rule'), mandate.toBuffer(), DEV_USDC.toBuffer()],
    program.programId,
  );
  const [legacyVault] = PublicKey.findProgramAddressSync(
    [Buffer.from('vault'), mandate.toBuffer(), DEV_USDC.toBuffer()],
    program.programId,
  );
  const [inputTradeVault] = PublicKey.findProgramAddressSync(
    [Buffer.from('trade-vault'), mandate.toBuffer(), DEV_USDC.toBuffer()],
    program.programId,
  );
  const [outputTradeVault] = PublicKey.findProgramAddressSync(
    [Buffer.from('trade-vault'), mandate.toBuffer(), DEV_USDT.toBuffer()],
    program.programId,
  );

  const receipt = {
    schemaVersion: 1,
    project: 'CRESCO_WORLD_FAIR_ORCA_V1',
    observedAt: new Date().toISOString(),
    commit: process.env.GITHUB_SHA || null,
    network: 'solana-devnet',
    programId: program.programId.toBase58(),
    principal: payer.publicKey.toBase58(),
    delegate: delegate.publicKey.toBase58(),
    orca: {
      programId: ORCA_WHIRLPOOL_PROGRAM_ID.toBase58(),
      pool: ORCA_POOL.toBase58(),
      inputMint: DEV_USDC.toBase58(),
      outputMint: DEV_USDT.toBase58(),
    },
    truthBoundary: {
      executionAsset: 'ORCA_DEVNET_TOKENS',
      mainnet: false,
      productionTrading: false,
      customerValidation: false,
      institutionalCapital: false,
      auditedIntegration: false,
      replayPrimary: false,
    },
    scenarios: {},
  };

  // Give the delegate enough SOL to pay Pyth verifier CPI fees.
  const fundDelegateSig = await provider.sendAndConfirm(
    new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: payer.publicKey,
        toPubkey: delegate.publicKey,
        lamports: 100_000_000,
      }),
    ),
  );
  receipt.delegateFundingSignature = fundDelegateSig;

  const pythFeed = await resolvePythUsdcFeed(process.env.PYTH_PRO_API_KEY);
  receipt.pyth = {
    symbol: pythFeed.symbol,
    feedId: pythFeed.feedId,
    minChannel: pythFeed.minChannel,
    authorityEffect: 'NONE',
    symbologySource: pythFeed.source,
  };

  const { fetchPythProSolanaPayload } = await import('../src/pyth-adapter.mjs');

  async function livePyth() {
    const snapshot = await fetchPythProSolanaPayload({
      apiKey: process.env.PYTH_PRO_API_KEY,
      feed: pythFeed,
      channel: pythFeed.minChannel,
      maxAgeSeconds: 120,
      maxConfidenceBps: 100,
    });
    assert.equal(snapshot.status, 'FRESH', `Pyth status: ${snapshot.status}`);
    assert.equal(snapshot.solanaPayload?.status, 'AVAILABLE');
    const encoding = snapshot.solanaPayload.encoding === 'base64' ? 'base64' : 'hex';
    const message = Buffer.from(snapshot.solanaPayload.data, encoding);
    assert(message.length > 100, 'Pyth signed payload should be non-trivial');
    const unitPriceMicroUsd = Math.round(Number(snapshot.price) * 1_000_000);
    assert(unitPriceMicroUsd > 0);
    return { snapshot, message, unitPriceMicroUsd };
  }

  // Bootstrap authority state with technically distinct principal/delegate roles.
  const initCharterSig = await program.methods
    .initializeCharter(hash32('CRESCO-WORLDS-FAIR-DEVNET'), new anchor.BN(10_000_000), new anchor.BN(10_000_000))
    .accountsStrict({
      charter,
      guardian: payer.publicKey,
      beneficiary: delegate.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .signers([delegate])
    .rpc();

  const initMandateSig = await program.methods
    .initializeMandate()
    .accountsStrict({
      charter,
      mandate,
      guardian: payer.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  const [reviewReceipt] = PublicKey.findProgramAddressSync(
    [Buffer.from('review'), mandate.toBuffer(), u64le(0)],
    program.programId,
  );
  const reviewSig = await program.methods
    .recordReview(hash32('CRESCO-WF-DELEGATED-CAPITAL'), true)
    .accountsStrict({
      charter,
      mandate,
      reviewReceipt,
      guardian: payer.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  const transitionSig = await program.methods
    .transitionMandate(3, new anchor.BN(0))
    .accountsStrict({
      charter,
      mandate,
      reviewReceipt,
      guardian: payer.publicKey,
    })
    .rpc();

  let mandateState = await program.account.mandate.fetch(mandate);
  assert.equal(mandateState.nonce.toNumber(), 1);

  const initRuleSig = await program.methods
    .initializeAssetRule(
      new anchor.BN(1),
      ACTION_SWAP_EXACT_IN,
      new anchor.BN(MAX_ACTION_AMOUNT),
      new anchor.BN(MAX_PERIOD_AMOUNT),
      new anchor.BN(PERIOD_SECONDS),
      new anchor.BN(MAX_UNIT_PRICE_MICRO_USD),
      pythFeed.feedId,
    )
    .accountsStrict({
      charter,
      mandate,
      assetRule,
      vaultTokenAccount: legacyVault,
      mint: DEV_USDC,
      guardian: payer.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  mandateState = await program.account.mandate.fetch(mandate);
  assert.equal(mandateState.nonce.toNumber(), 2);

  const initInputVaultSig = await program.methods
    .initializeTradeVault()
    .accountsStrict({
      charter,
      mandate,
      tradeVaultTokenAccount: inputTradeVault,
      mint: DEV_USDC,
      guardian: payer.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  const initOutputVaultSig = await program.methods
    .initializeTradeVault()
    .accountsStrict({
      charter,
      mandate,
      tradeVaultTokenAccount: outputTradeVault,
      mint: DEV_USDT,
      guardian: payer.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  const configureSig = await program.methods
    .configureMandatePolicy(
      new anchor.BN(2),
      new anchor.BN(STANDING_MAX_NOTIONAL_MICRO_USD),
      new anchor.BN(PERIOD_MAX_NOTIONAL_MICRO_USD),
      new anchor.BN(0),
      120,
      100,
    )
    .accountsStrict({ charter, mandate, guardian: payer.publicKey })
    .rpc();

  mandateState = await program.account.mandate.fetch(mandate);
  const executionNonce = mandateState.nonce.toNumber();
  assert.equal(executionNonce, 3);

  receipt.bootstrap = {
    initCharterSig,
    initMandateSig,
    reviewSig,
    transitionSig,
    initRuleSig,
    initInputVaultSig,
    initOutputVaultSig,
    configureSig,
    mandate: mandate.toBase58(),
    assetRule: assetRule.toBase58(),
    inputTradeVault: inputTradeVault.toBase58(),
    outputTradeVault: outputTradeVault.toBase58(),
    mandateVersion: mandateState.version.toNumber(),
    mandateNonce: executionNonce,
    maxActionNotionalMicroUsd: mandateState.maxActionNotional.toNumber(),
  };

  // Orca SDK context is used for quotes and for a small SOL→devUSDC bootstrap
  // swap if the CI payer does not already hold enough official devUSDC.
  const orcaCtx = WhirlpoolContext.from(provider.connection, provider.wallet);
  const orcaClient = buildWhirlpoolClient(orcaCtx);
  const targetPool = await orcaClient.getPool(ORCA_POOL);
  const targetPoolData = targetPool.getData();

  assert(targetPoolData.tokenMintA.equals(DEV_USDC), 'Target pool token A must be devUSDC for V1 A→B');
  assert(targetPoolData.tokenMintB.equals(DEV_USDT), 'Target pool token B must be devUSDT for V1 A→B');

  const payerUsdc = await getOrCreateAssociatedTokenAccount(
    provider.connection,
    payer,
    DEV_USDC,
    payer.publicKey,
  );

  // Successful scenarios consume 1.15 devUSDC total; keep a bounded margin\n  // without overfunding the CI wallet or depending on repeated faucet-like swaps.\n  const requiredFunding = 1_500_000;
  let payerUsdcState = await getAccount(provider.connection, payerUsdc.address);
  if (Number(payerUsdcState.amount) < requiredFunding) {
    const solUsdcPool = await orcaClient.getPool(ORCA_SOL_USDC_POOL);
    const quote = await swapQuoteByInputToken(
      solUsdcPool,
      NATIVE_MINT,
      new anchor.BN(100_000_000),
      Percentage.fromFraction(1, 100),
      ORCA_WHIRLPOOL_PROGRAM_ID,
      orcaCtx.fetcher,
    );
    const fundingTx = await solUsdcPool.swap(quote);
    receipt.orca.bootstrapSwapSignature = await fundingTx.buildAndExecute();
    payerUsdcState = await getAccount(provider.connection, payerUsdc.address);
  }

  assert(
    Number(payerUsdcState.amount) >= requiredFunding,
    `Need at least ${requiredFunding} devUSDC base units, have ${payerUsdcState.amount}`,
  );

  receipt.inputVaultFundingSignature = await transfer(
    provider.connection,
    payer,
    payerUsdc.address,
    inputTradeVault,
    payer,
    requiredFunding,
  );

  const storageInfo = await provider.connection.getAccountInfo(PYTH_LAZER_STORAGE_ID, 'confirmed');
  assert(storageInfo && storageInfo.data.length >= 72, 'Pyth Lazer storage unavailable');
  const pythTreasury = new PublicKey(storageInfo.data.subarray(40, 72));
  receipt.pyth.treasury = pythTreasury.toBase58();

  function quoteFor(inputAmount) {
    return swapQuoteByInputToken(
      targetPool,
      DEV_USDC,
      new anchor.BN(inputAmount),
      Percentage.fromFraction(1, 100),
      ORCA_WHIRLPOOL_PROGRAM_ID,
      orcaCtx.fetcher,
    );
  }

  async function buildAccounts(quote, orcaProgram = ORCA_WHIRLPOOL_PROGRAM_ID) {
    return {
      charter,
      mandate,
      assetRule,
      inputTradeVault,
      outputTradeVault,
      inputMint: DEV_USDC,
      outputMint: DEV_USDT,
      beneficiary: delegate.publicKey,
      orcaProgram,
      whirlpool: ORCA_POOL,
      orcaTokenVaultA: targetPoolData.tokenVaultA,
      orcaTokenVaultB: targetPoolData.tokenVaultB,
      tickArray0: quote.tickArray0,
      tickArray1: quote.tickArray1,
      tickArray2: quote.tickArray2,
      orcaOracle: PDAUtil.getOracle(ORCA_WHIRLPOOL_PROGRAM_ID, ORCA_POOL).publicKey,
      pythProgram: PYTH_LAZER_PROGRAM_ID,
      pythStorage: PYTH_LAZER_STORAGE_ID,
      pythTreasury,
      instructionsSysvar: SYSVAR_INSTRUCTIONS_PUBKEY,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    };
  }

  async function executeStanding(inputAmount, pyth, quote) {
    const deadline = Math.floor(Date.now() / 1000) + 300;
    const ed = createEd25519Instruction(pyth.message, 1, 12);
    return program.methods
      .executeSwapWithinMandateWithPyth(
        pyth.message,
        new anchor.BN(inputAmount),
        quote.otherAmountThreshold,
        quote.sqrtPriceLimit,
        new anchor.BN(deadline),
        new anchor.BN(executionNonce),
      )
      .accountsStrict(await buildAccounts(quote))
      .preInstructions([ed])
      .signers([delegate])
      .rpc();
  }

  // SUCCESS 1 + 2: autonomous real Orca swaps inside standing authority.
  const pyth1 = await livePyth();
  const quote1 = await quoteFor(STANDING_INPUT);
  const standingSig1 = await executeStanding(STANDING_INPUT, pyth1, quote1);

  await targetPool.refreshData();
  const pyth2 = await livePyth();
  const quote2 = await quoteFor(STANDING_INPUT);
  const standingSig2 = await executeStanding(STANDING_INPUT, pyth2, quote2);

  receipt.scenarios.standingAutonomy = {
    status: 'PASS',
    signatures: [standingSig1, standingSig2],
    inputAmountBaseUnits: STANDING_INPUT,
    guardianApprovalRequired: false,
  };

  // BOUNDARY: legitimate trade crosses only the standing notional boundary.
  await targetPool.refreshData();
  const boundaryPyth = await livePyth();
  const boundaryQuote = await quoteFor(EXCEPTION_INPUT);
  const boundaryRefusal = await expectRefusal(
    'soft_notional_boundary',
    () => executeStanding(EXCEPTION_INPUT, boundaryPyth, boundaryQuote),
    ['PythNotionalExceeded', 'Pyth notional'],
  );
  const boundaryNotionalMicroUsd =
    (BigInt(EXCEPTION_INPUT) * BigInt(boundaryPyth.unitPriceMicroUsd)) / 1_000_000n;
  receipt.scenarios.softBoundary = {
    status: 'PASS',
    decision: 'REFUSE',
    reason: boundaryRefusal.code,
    standingMaxNotionalMicroUsd: STANDING_MAX_NOTIONAL_MICRO_USD,
    requestedNotionalMicroUsd: Number(boundaryNotionalMicroUsd),
    policyDiff: {
      supportedProgram: 'PASS',
      supportedPool: 'PASS',
      supportedPair: 'PASS',
      marketEvidence: 'PASS',
      perActionNotional: 'VIOLATED',
      violatedDimensions: ['MAX_ACTION_NOTIONAL'],
    },
  };

  async function grantSwapException({
    inputAmount,
    quote,
    pyth,
    deadline,
    expectedNonce = executionNonce,
  }) {
    const minOutputAmount = BigInt(quote.otherAmountThreshold.toString());
    const sqrtPriceLimit = BigInt(quote.sqrtPriceLimit.toString());
    const requestHash = semanticSwapHash({
      mandate,
      pool: ORCA_POOL,
      inputMint: DEV_USDC,
      outputMint: DEV_USDT,
      inputAmount,
      minOutputAmount,
      sqrtPriceLimit,
      deadline,
      mandateNonce: expectedNonce,
    });
    const exactNotional = (
      BigInt(inputAmount) * BigInt(pyth.unitPriceMicroUsd)
    ) / 1_000_000n;
    const [allowance] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('allowance'),
        mandate.toBuffer(),
        DEV_USDC.toBuffer(),
        requestHash,
      ],
      program.programId,
    );
    const grantSig = await program.methods
      .grantAllowanceOnce(
        requestHash,
        new anchor.BN(expectedNonce),
        new anchor.BN(exactNotional.toString()),
        new anchor.BN(Math.floor(Date.now() / 1000) + 600),
      )
      .accountsStrict({
        charter,
        mandate,
        mint: DEV_USDC,
        allowance,
        guardian: payer.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    return {
      requestHash,
      exactNotional,
      allowance,
      grantSig,
      deadline,
      minOutputAmount,
      sqrtPriceLimit,
      quote,
      pyth,
    };
  }

  async function executeException(exception, overrides = {}) {
    const inputAmount = overrides.inputAmount ?? EXCEPTION_INPUT;
    const quote = overrides.quote ?? exception.quote;
    const deadline = overrides.deadline ?? exception.deadline;
    const pyth = overrides.pyth ?? exception.pyth;
    const ed = createEd25519Instruction(pyth.message, 1, 12);
    return program.methods
      .executeSwapOnceWithPyth(
        pyth.message,
        new anchor.BN(inputAmount),
        quote.otherAmountThreshold,
        quote.sqrtPriceLimit,
        new anchor.BN(deadline),
        new anchor.BN(overrides.expectedNonce ?? executionNonce),
        exception.requestHash,
      )
      .accountsStrict({
        ...(await buildAccounts(quote, overrides.orcaProgram ?? ORCA_WHIRLPOOL_PROGRAM_ID)),
        allowance: exception.allowance,
      })
      .preInstructions([ed])
      .signers([delegate])
      .rpc();
  }

  // EXACT EXCEPTION.
  await targetPool.refreshData();
  const exactPyth = await livePyth();
  const exactQuote = await quoteFor(EXCEPTION_INPUT);
  const exactDeadline = Math.floor(Date.now() / 1000) + 300;
  const exact = await grantSwapException({
    inputAmount: EXCEPTION_INPUT,
    quote: exactQuote,
    pyth: exactPyth,
    deadline: exactDeadline,
  });

  // MUTATION: change one material semantic field, reusing the approved hash.
  const mutatedQuote = {
    ...exactQuote,
    otherAmountThreshold: exactQuote.otherAmountThreshold.sub(new anchor.BN(1)),
  };
  const mutation = await expectRefusal(
    'semantic_mutation',
    () => executeException(exact, { quote: mutatedQuote }),
    ['AllowanceActionMismatch', 'does not match'],
  );
  let allowanceState = await program.account.allowanceReceipt.fetch(exact.allowance);
  assert.equal(allowanceState.used, false, 'Mutation must not consume exception');

  const mandateBeforeExact = await program.account.mandate.fetch(mandate);
  const exactSig = await executeException(exact);
  allowanceState = await program.account.allowanceReceipt.fetch(exact.allowance);
  assert.equal(allowanceState.used, true, 'Exact successful action must consume exception');
  const mandateAfterExact = await program.account.mandate.fetch(mandate);
  assert.equal(
    mandateAfterExact.version.toNumber(),
    mandateBeforeExact.version.toNumber(),
    'Exceptional execution must not widen standing Mandate',
  );

  const replay = await expectRefusal(
    'exception_replay',
    () => executeException(exact),
    ['AllowanceAlreadyUsed', 'already used'],
  );

  receipt.scenarios.exactException = {
    status: 'PASS',
    allowance: exact.allowance.toBase58(),
    requestHash: exact.requestHash.toString('hex'),
    grantSignature: exact.grantSig,
    mutationDecision: 'REFUSE',
    mutationReason: mutation.code,
    executionSignature: exactSig,
    consumed: allowanceState.used,
    replayDecision: 'REFUSE',
    replayReason: replay.code,
    standingMandateVersionBefore: mandateBeforeExact.version.toNumber(),
    standingMandateVersionAfter: mandateAfterExact.version.toNumber(),
    standingAuthorityChanged:
      mandateBeforeExact.version.toNumber() !== mandateAfterExact.version.toNumber(),
  };

  // HARD BOUNDARY: unsupported program exposes no exceptional execution route.
  await targetPool.refreshData();
  const hardPyth = await livePyth();
  const hardQuote = await quoteFor(STANDING_INPUT);
  const hardDeadline = Math.floor(Date.now() / 1000) + 300;
  const hardEd = createEd25519Instruction(hardPyth.message, 1, 12);
  const hardBoundary = await expectRefusal(
    'hard_unsupported_program',
    async () =>
      program.methods
        .executeSwapWithinMandateWithPyth(
          hardPyth.message,
          new anchor.BN(STANDING_INPUT),
          hardQuote.otherAmountThreshold,
          hardQuote.sqrtPriceLimit,
          new anchor.BN(hardDeadline),
          new anchor.BN(executionNonce),
        )
        .accountsStrict(await buildAccounts(hardQuote, SystemProgram.programId))
        .preInstructions([hardEd])
        .signers([delegate])
        .rpc(),
    ['InvalidOrcaProgram', 'Unexpected Orca'],
  );
  receipt.scenarios.hardBoundary = {
    status: 'PASS',
    decision: 'REFUSE',
    reason: hardBoundary.code,
    exceptionPath: false,
  };

  // EXTERNAL EVIDENCE FAILURE: the same otherwise-valid standing action must
  // fail closed when required Pyth evidence is absent.
  await targetPool.refreshData();
  const evidenceFailureQuote = await quoteFor(STANDING_INPUT);
  const evidenceFailureDeadline = Math.floor(Date.now() / 1000) + 300;
  const evidenceFailure = await expectRefusal(
    'missing_pyth_evidence',
    async () =>
      program.methods
        .executeSwapWithinMandateWithPyth(
          Buffer.alloc(0),
          new anchor.BN(STANDING_INPUT),
          evidenceFailureQuote.otherAmountThreshold,
          evidenceFailureQuote.sqrtPriceLimit,
          new anchor.BN(evidenceFailureDeadline),
          new anchor.BN(executionNonce),
        )
        .accountsStrict(await buildAccounts(evidenceFailureQuote))
        .signers([delegate])
        .rpc(),
    ['PythMessageInvalid', 'Pyth signed message is invalid'],
  );
  receipt.scenarios.evidenceFailure = {
    status: 'PASS',
    decision: 'REFUSE',
    reason: evidenceFailure.code,
    dependency: 'PYTH_LAZER',
    evidenceStatus: 'MISSING',
  };

  // FAILURE / ROLLBACK: authority is valid but Orca cannot satisfy the
  // impossible min-output threshold. The whole transaction must roll back.
  await targetPool.refreshData();
  const rollbackPyth = await livePyth();
  const rollbackQuoteBase = await quoteFor(ROLLBACK_INPUT);
  const impossibleQuote = {
    ...rollbackQuoteBase,
    otherAmountThreshold: rollbackQuoteBase.estimatedAmountOut.mul(new anchor.BN(100)),
  };
  const rollbackDeadline = Math.floor(Date.now() / 1000) + 300;
  const rollback = await grantSwapException({
    inputAmount: ROLLBACK_INPUT,
    quote: impossibleQuote,
    pyth: rollbackPyth,
    deadline: rollbackDeadline,
  });
  const ruleBeforeRollback = await program.account.assetRule.fetch(assetRule);
  const rollbackRefusal = await expectRefusal(
    'orca_failure_rollback',
    () => executeException(rollback, { inputAmount: ROLLBACK_INPUT }),
    ['OrcaSwapFailed', 'Orca swap CPI failed'],
  );
  const rollbackAllowanceAfter =
    await program.account.allowanceReceipt.fetch(rollback.allowance);
  const ruleAfterRollback = await program.account.assetRule.fetch(assetRule);
  assert.equal(rollbackAllowanceAfter.used, false, 'Failed Orca CPI must not consume exception');
  assert.equal(
    ruleAfterRollback.spentThisPeriod.toString(),
    ruleBeforeRollback.spentThisPeriod.toString(),
    'Failed Orca CPI must roll back amount counter',
  );
  assert.equal(
    ruleAfterRollback.spentThisPeriodNotional.toString(),
    ruleBeforeRollback.spentThisPeriodNotional.toString(),
    'Failed Orca CPI must roll back notional counter',
  );

  receipt.scenarios.rollback = {
    status: 'PASS',
    decision: 'REFUSE',
    reason: rollbackRefusal.code,
    allowance: rollback.allowance.toBase58(),
    allowanceConsumed: rollbackAllowanceAfter.used,
    countersChanged:
      ruleAfterRollback.spentThisPeriod.toString() !== ruleBeforeRollback.spentThisPeriod.toString() ||
      ruleAfterRollback.spentThisPeriodNotional.toString() !==
        ruleBeforeRollback.spentThisPeriodNotional.toString(),
  };

  // STALE: a principal policy transition advances the Mandate nonce, making
  // the still-unused rollback exception stale.
  const preStaleMandate = await program.account.mandate.fetch(mandate);
  const staleSourceNonce = preStaleMandate.nonce.toNumber();
  const policyTransitionSig = await program.methods
    .configureMandatePolicy(
      new anchor.BN(staleSourceNonce),
      new anchor.BN(STANDING_MAX_NOTIONAL_MICRO_USD),
      new anchor.BN(PERIOD_MAX_NOTIONAL_MICRO_USD),
      new anchor.BN(0),
      120,
      100,
    )
    .accountsStrict({ charter, mandate, guardian: payer.publicKey })
    .rpc();

  const postStaleMandate = await program.account.mandate.fetch(mandate);
  assert.equal(postStaleMandate.nonce.toNumber(), staleSourceNonce + 1);
  const staleRefusal = await expectRefusal(
    'stale_exception',
    () => executeException(rollback, {
      inputAmount: ROLLBACK_INPUT,
      expectedNonce: staleSourceNonce,
    }),
    ['StaleNonce', 'stale'],
  );

  receipt.scenarios.staleAuthority = {
    status: 'PASS',
    policyTransitionSignature: policyTransitionSig,
    sourceNonce: staleSourceNonce,
    currentNonce: postStaleMandate.nonce.toNumber(),
    decision: 'REFUSE',
    reason: staleRefusal.code,
  };

  receipt.status = 'PASS';
  receipt.productState = 'FIRST_LIVE_VERTICAL_SLICE';
  receipt.observedAtCompleted = new Date().toISOString();

  const outputPath = path.resolve(
    'evidence/worlds-fair/orca-v1-runtime-receipt.json',
  );
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(receipt, null, 2) + '\n');

  console.log(JSON.stringify(receipt, null, 2));
  console.log('WORLD_FAIR_ORCA_FIRST_LIVE_SLICE=PASS');
  console.log(`WORLD_FAIR_ORCA_RECEIPT=${outputPath}`);
}

main().catch((error) => {
  console.error(error?.stack || error);
  process.exitCode = 1;
});
