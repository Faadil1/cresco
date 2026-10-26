"use strict";

// Dedicated local-validator negative-path proof. Runs only when explicitly invoked.
// No Pyth CPI is required: each execution is deliberately rejected BEFORE the CPI.
const anchor = require("@coral-xyz/anchor");
const spl = require("@solana/spl-token");
const { readFileSync } = require("node:fs");
const { resolve } = require("node:path");
const { createHash } = require("node:crypto");
const { strict: assert } = require("node:assert");
const {
  Keypair, PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL,
  SYSVAR_INSTRUCTIONS_PUBKEY,
} = anchor.web3;
const {
  TOKEN_PROGRAM_ID, createMint, createAccount,
  getOrCreateAssociatedTokenAccount, getAccount, mintTo,
} = spl;
// NOTE: This file is CommonJS; ESM helper is loaded via dynamic import below.

const PYTH_PROGRAM = new PublicKey("pytd2yyk641x7ak7mkaasSJVXh6YYZnC7wTmtgAyxPt");
const PYTH_STORAGE = new PublicKey("3rdJbqfnagQ4yx9HXJViD4zc4xpiSqmFsKpPuSCQVyQL");
const EXPECTED_PROGRAM_ID = "ABjE6V5q9VbD3CAHDXxvztY5kXQmDXHRcEP1kZ4KSSfk";
const hash32 = (x) => Array.from(createHash("sha256").update(x).digest());
const bn = (v) => new anchor.BN(v.toString());
const u64 = (v) => { const b = Buffer.alloc(8); b.writeBigUInt64LE(BigInt(v)); return b; };

async function expectRefusal(label, action, codes) {
  let err;
  try { await action(); } catch (e) { err = e; }
  assert(err, label + " unexpectedly succeeded");
  const actual = String(err?.error?.errorCode?.code ?? err?.error?.errorMessage ?? err?.message ?? "");
  assert(codes.some((code) => actual.includes(code)), label + ": unexpected error " + actual);
  console.log("PROOF " + label + "=REFUSED code=" + actual.split("\n")[0]);
}

if (process.env.CRESCO_V1_EPHEMERAL_LOCALNET !== "1") {
  throw new Error("BLOCKED: only the ephemeral scripts/run-v1-local-refusal.sh runner may invoke this proof");
}

describe("CRESCO V1 — isolated local-validator refusal proof (no Pyth CPI)", function () {
  this.timeout(120000);

  // Local validator confirms slots immediately, but does not finalize early slots.
  // SPL helper defaults can otherwise poll for a *new finalized* blockhash and
  // time out before testing any V1 instruction. Use confirmed consistently.
  const envProvider = anchor.AnchorProvider.env();
  const provider = new anchor.AnchorProvider(
    new anchor.web3.Connection(envProvider.connection.rpcEndpoint, "confirmed"),
    envProvider.wallet,
    { commitment: "confirmed", preflightCommitment: "confirmed" },
  );
  const rpcEndpoint = new URL(provider.connection.rpcEndpoint);
  assert.equal(rpcEndpoint.protocol, "http:", "BLOCKED: no public-network RPC for this proof");
  assert.equal(rpcEndpoint.hostname, "127.0.0.1", "BLOCKED: only loopback RPC is allowed");
  assert.equal(rpcEndpoint.port, "18899", "BLOCKED: wrong ephemeral local validator port");
  anchor.setProvider(provider);
  const idl = JSON.parse(readFileSync(resolve(__dirname, "../target/idl/keys.json"), "utf8"));
  assert.equal(idl.address, EXPECTED_PROGRAM_ID, "IDL address must match Rust declare_id / preloaded SBF");
  const program = new anchor.Program(idl, provider);
  assert.equal(program.programId.toBase58(), EXPECTED_PROGRAM_ID);

  const beneficiary = Keypair.generate();
  const guardian = provider.wallet.publicKey;
  let mint, destination, alternateDestination, assetRule, vault, charter, mandate;
  let allowanceV1, actionDigest, canonicalAllowOnceV1Hash;
  const amount = 400n, maxNotionalMicroUsd = 1000n, expiry = 0n;
  const nonce = 2n;

  const pda = (seeds) => PublicKey.findProgramAddressSync(seeds, program.programId)[0];
  const allowanceAddress = (digest) => pda([
    Buffer.from("allowance-v1"), mandate.toBuffer(), mint.toBuffer(), digest,
  ]);
  const digestFor = (values = {}) => canonicalAllowOnceV1Hash({
    programId: program.programId,
    mandate,
    mandateNonce: nonce,
    mint,
    beneficiary: beneficiary.publicKey,
    destinationTokenAccount: destination,
    amount,
    maxNotionalMicroUsd,
    expiry,
    guardian,
    ...values,
  });
  const grant = (digest, targetPda, approvedAmount = amount, approvedDestination = destination) =>
    program.methods.grantAllowanceOnceV1(
      bn(approvedAmount), bn(nonce), bn(maxNotionalMicroUsd), bn(expiry), [...digest],
    ).accountsStrict({
      charter, mandate, mint,
      beneficiary: beneficiary.publicKey,
      destinationTokenAccount: approvedDestination,
      allowanceV1: targetPda,
      guardian, tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    }).rpc();

  const attemptExecute = (requestedAmount, destinationAccount, requestedNonce = nonce, digest = actionDigest) =>
    program.methods.executeOnceWithPythV1(
      [1], bn(requestedAmount), bn(requestedNonce), [...digest],
    ).accountsStrict({
      charter, mandate, assetRule, allowanceV1, vaultTokenAccount: vault, mint,
      beneficiary: beneficiary.publicKey, delegateTokenAccount: destinationAccount,
      pythProgram: PYTH_PROGRAM, pythStorage: PYTH_STORAGE,
      pythTreasury: guardian,
      instructionsSysvar: SYSVAR_INSTRUCTIONS_PUBKEY,
      tokenProgram: TOKEN_PROGRAM_ID, systemProgram: SystemProgram.programId,
    }).signers([beneficiary]).rpc();

  const snapshot = async () => ({
    vaultAmount: (await getAccount(provider.connection, vault)).amount.toString(),
    destinationAmount: (await getAccount(provider.connection, destination)).amount.toString(),
    alternateAmount: (await getAccount(provider.connection, alternateDestination)).amount.toString(),
    spent: (await program.account.assetRule.fetch(assetRule)).spentThisPeriod.toString(),
    spentNotional: (await program.account.assetRule.fetch(assetRule)).spentThisPeriodNotional.toString(),
    used: (await program.account.allowanceReceiptV1.fetch(allowanceV1)).used,
  });
  const remainsUnchanged = async (before) => assert.deepEqual(await snapshot(), before);

  before(async () => {
    ({ canonicalAllowOnceV1Hash } = await import("../src/allow-once-v1-hash.mjs"));
    const payer = provider.wallet.payer;
    assert(payer, "This test needs a local generated payer, never a production key");
    const cluster = await provider.connection.getGenesisHash();
    assert(cluster, "Local validator must be reachable");
    const id = await provider.connection.getAccountInfo(program.programId);
    assert(id && id.executable, "V1 SBF program was not preloaded on the local validator");

    console.log('LOCALNET setup=beneficiary_funding');
    await provider.sendAndConfirm(new Transaction().add(SystemProgram.transfer({
      fromPubkey: guardian, toPubkey: beneficiary.publicKey,
      lamports: Math.floor(0.1 * LAMPORTS_PER_SOL),
    })));
    // Localnet-only, unfunded Pyth accounts would cause an RPC account-loading
    // failure before our onchain *pre-CPI* rejection is evaluated. These tiny
    // system-owned placeholders are NEVER treated as real Pyth price evidence.
    console.log('LOCALNET setup=pre_cpi_placeholder_accounts');
    await provider.sendAndConfirm(new Transaction().add(
      SystemProgram.transfer({ fromPubkey: guardian, toPubkey: PYTH_PROGRAM, lamports: 1000000 }),
      SystemProgram.transfer({ fromPubkey: guardian, toPubkey: PYTH_STORAGE, lamports: 1000000 }),
    ));
    console.log('LOCALNET setup=mint_creation');
    mint = await createMint(provider.connection, payer, guardian, null, 0,
      undefined, { commitment: 'confirmed', preflightCommitment: 'confirmed' });
    console.log('LOCALNET setup=beneficiary_associated_account');
    destination = (await getOrCreateAssociatedTokenAccount(
      provider.connection, payer, mint, beneficiary.publicKey,
      false, 'confirmed', { commitment: 'confirmed', preflightCommitment: 'confirmed' },
    )).address;
    alternateDestination = await createAccount(
      provider.connection, payer, mint, beneficiary.publicKey,
      undefined, { commitment: 'confirmed', preflightCommitment: 'confirmed' },
    );
    charter = pda([Buffer.from("charter"), beneficiary.publicKey.toBuffer()]);
    mandate = pda([Buffer.from("mandate"), charter.toBuffer()]);
    const review0 = pda([Buffer.from("review"), mandate.toBuffer(), u64(0)]);
    assetRule = pda([Buffer.from("asset-rule"), mandate.toBuffer(), mint.toBuffer()]);
    vault = pda([Buffer.from("vault"), mandate.toBuffer(), mint.toBuffer()]);

    console.log('LOCALNET setup=charter_creation');
    await program.methods.initializeCharter(hash32("CA-QC"), bn(10000), bn(5000))
      .accountsStrict({
        charter, guardian, beneficiary: beneficiary.publicKey,
        systemProgram: SystemProgram.programId,
      }).signers([beneficiary]).rpc();
    await program.methods.initializeMandate().accountsStrict({
      charter, mandate, guardian, systemProgram: SystemProgram.programId,
    }).rpc();
    await program.methods.recordReview(hash32("v1-isolated-review"), true)
      .accountsStrict({
        charter, mandate, reviewReceipt: review0, guardian,
        systemProgram: SystemProgram.programId,
      }).rpc();
    await program.methods.transitionMandate(3, bn(0)).accountsStrict({
      charter, mandate, reviewReceipt: review0, guardian,
    }).rpc();
    await program.methods.initializeAssetRule(
      bn(1), 1, bn(500), bn(1000), bn(3600), bn(0), 1435,
    ).accountsStrict({
      charter, mandate, assetRule, vaultTokenAccount: vault, mint, guardian,
      tokenProgram: TOKEN_PROGRAM_ID, systemProgram: SystemProgram.programId,
    }).rpc();
    console.log('LOCALNET setup=vault_funding');
    await mintTo(provider.connection, payer, mint, vault, payer, 2000,
      [], { commitment: 'confirmed', preflightCommitment: 'confirmed' });
    const state = await program.account.mandate.fetch(mandate);
    assert.equal(state.nonce.toString(), nonce.toString());
  });

  it("creates a guardian-signed V1 allowance bound to the exact action", async () => {
    actionDigest = digestFor();
    allowanceV1 = allowanceAddress(actionDigest);
    const tx = await grant(actionDigest, allowanceV1);
    const receipt = await program.account.allowanceReceiptV1.fetch(allowanceV1);
    assert.equal(receipt.amount.toString(), amount.toString());
    assert.equal(receipt.used, false);
    assert.equal(receipt.destinationTokenAccount.toBase58(), destination.toBase58());
    assert.equal(Buffer.from(receipt.actionDigest).toString("hex"), actionDigest.toString("hex"));
    console.log("PROOF v1_exact_guardian_grant=SUCCESS tx=" + tx);
  });

  it("rejects a forged approval digest without creating a receipt", async () => {
    const forged = digestFor({ amount: amount + 1n });
    const forgedPda = allowanceAddress(forged);
    await expectRefusal("v1_grant_forged_digest",
      () => grant(forged, forgedPda),
      ["AllowanceActionMismatch"]);
    assert.equal(await provider.connection.getAccountInfo(forgedPda), null);
  });

  it("refuses a non-guardian trying to create V1 allowance", async () => {
    const imposter = Keypair.generate();
    // Funding the imposter on this ephemeral validator isolates *authorization*
    // failure rather than an unrelated missing-fee-payer error.
    await provider.sendAndConfirm(new Transaction().add(SystemProgram.transfer({
      fromPubkey: guardian, toPubkey: imposter.publicKey, lamports: 10000000,
    })));
    const imposterDigest = digestFor({ amount: amount + 2n });
    const imposterReceipt = allowanceAddress(imposterDigest);
    await expectRefusal("v1_non_guardian_grant", () =>
      program.methods.grantAllowanceOnceV1(
        bn(amount + 2n), bn(nonce), bn(maxNotionalMicroUsd), bn(expiry),
        [...imposterDigest],
      ).accountsStrict({
        charter, mandate, mint, beneficiary: beneficiary.publicKey,
        destinationTokenAccount: destination,
        allowanceV1: imposterReceipt, guardian: imposter.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      }).signers([imposter]).rpc(),
      ["ConstraintHasOne", "has one"]);
    assert.equal(await provider.connection.getAccountInfo(imposterReceipt), null);
  });

  it("refuses already-expired V1 grants with no receipt created", async () => {
    const expiredAt = 1n;
    const expiredDigest = digestFor({ expiry: expiredAt });
    const expiredReceipt = allowanceAddress(expiredDigest);
    await expectRefusal("v1_expired_at_grant", () =>
      program.methods.grantAllowanceOnceV1(
        bn(amount), bn(nonce), bn(maxNotionalMicroUsd), bn(expiredAt),
        [...expiredDigest],
      ).accountsStrict({
        charter, mandate, mint, beneficiary: beneficiary.publicKey,
        destinationTokenAccount: destination,
        allowanceV1: expiredReceipt, guardian,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      }).rpc(),
      ["InvalidExpiry"]);
    assert.equal(await provider.connection.getAccountInfo(expiredReceipt), null);
  });

  it("rejects modified amount before Pyth CPI, preserving all balances and counters", async () => {
    const before = await snapshot();
    await expectRefusal("v1_execute_changed_amount",
      () => attemptExecute(amount + 1n, destination),
      ["AllowanceActionMismatch"]);
    await remainsUnchanged(before);
  });

  it("rejects changed destination even when its token owner and mint are valid", async () => {
    const before = await snapshot();
    await expectRefusal("v1_execute_changed_destination",
      () => attemptExecute(amount, alternateDestination),
      ["AllowanceActionMismatch"]);
    await remainsUnchanged(before);
  });

  it("rejects mismatched request nonce without using the allowance", async () => {
    const before = await snapshot();
    await expectRefusal("v1_execute_changed_nonce",
      () => attemptExecute(amount, destination, nonce + 1n),
      ["StaleNonce", "StaleAllowance"]);
    await remainsUnchanged(before);
  });

  it("preserves period spend across guardian rule edit and refuses exceeding remainder", async () => {
    // Standing transfers are the deterministic, Pyth-free way to seed a genuine
    // 600/1000 spending window on this isolated validator.
    const standing = (value, expectedNonce) => program.methods
      .executeWithinMandate(bn(value), bn(expectedNonce))
      .accountsStrict({
        charter, mandate, assetRule, vaultTokenAccount: vault, mint,
        beneficiary: beneficiary.publicKey, delegateTokenAccount: destination,
        tokenProgram: TOKEN_PROGRAM_ID,
      }).signers([beneficiary]).rpc();

    await standing(500, nonce);
    await standing(100, nonce);
    const preEdit = await program.account.assetRule.fetch(assetRule);
    assert.equal(preEdit.spentThisPeriod.toString(), "600");
    const mandateBeforeEdit = await program.account.mandate.fetch(mandate);
    await program.methods.updateAssetRule(
      bn(mandateBeforeEdit.nonce), true, 1,
      bn(500), bn(1000), bn(3600), bn(0), 1435,
    ).accountsStrict({ charter, mandate, assetRule, guardian }).rpc();
    const postEdit = await program.account.assetRule.fetch(assetRule);
    assert.equal(postEdit.spentThisPeriod.toString(), "600");
    assert.equal(postEdit.periodStartedAt.toString(), preEdit.periodStartedAt.toString());
    assert.equal(postEdit.spentThisPeriodNotional.toString(), preEdit.spentThisPeriodNotional.toString());

    const updatedNonce = (await program.account.mandate.fetch(mandate)).nonce;
    const before = await snapshot();
    await expectRefusal("v1_integration_period_cap_after_policy_edit",
      () => standing(401, updatedNonce),
      ["PeriodAmountExceeded"]);
    await remainsUnchanged(before);
    console.log("PROOF period_counter_preserved=600/1000 policy_edit=true refused_overage=401");
  });

  it("refuses execution after guardian pauses the mandate, with zero spend", async () => {
    const state = await program.account.mandate.fetch(mandate);
    await program.methods.setMandateStatus(bn(state.nonce), 1).accountsStrict({
      charter, mandate, guardian,
    }).rpc();
    const nextNonce = (await program.account.mandate.fetch(mandate)).nonce;
    const before = await snapshot();
    await expectRefusal("v1_paused_mandate",
      () => attemptExecute(amount, destination, BigInt(nextNonce.toString())),
      ["MandateNotActive"]);
    await remainsUnchanged(before);
    console.log("PROOF v1_local_negative_suite=COMPLETE_NO_PYTH_CPI");
  });
});
