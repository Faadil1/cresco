#!/usr/bin/env bash
# Only ephemeral localnet. This never connects to Devnet, Mainnet or a public RPC.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

PROGRAM_ID="ABjE6V5q9VbD3CAHDXxvztY5kXQmDXHRcEP1kZ4KSSfk"
RPC_URL="http://127.0.0.1:18899"
mkdir -p target

for exe in anchor solana solana-keygen solana-test-validator node; do
  if ! command -v "$exe" >/dev/null 2>&1; then
    echo "BLOCKED: local tool missing: $exe" >&2
    exit 2
  fi
done

if [[ ! -x ./node_modules/.bin/mocha ]]; then
  echo "BLOCKED: npm dependencies missing. Run npm ci first." >&2
  exit 2
fi

echo "Local-only V1 gate: build SBF and preload the declared program ID $PROGRAM_ID"
echo "NOTE: Anchor.toml has a different [programs.localnet] key."
echo "Do NOT run anchor keys sync; that can rewrite the production declare_id."
echo "We will load the exact SBF into a fresh ephemeral validator at the Rust declare_id."

# Solana 2.3.0 SBF toolchain includes Cargo 1.84, which cannot parse crates using
# edition2024. Resolve the test-only workspace graph with a compatible zeroize.
# A workspace Cargo.lock is absent on this branch. Do not silently persist a
# production dependency migration through this isolated validation run.
cargo generate-lockfile
cargo update -p zeroize --precise 1.8.2
# Pin transitive proc-macro-crate to its toml_edit 0.22 dependency, avoiding
# toml_parser 1.1.5 that requires Cargo edition2024 unsupported by SBF Cargo 1.84.
cargo update -p proc-macro-crate@3.5.0 --precise 3.3.0
cargo update -p indexmap@2.14.2 --precise 2.13.1
cargo update -p zeroize_derive@1.5.0 --precise 1.4.2
if ! grep -A1 -F 'name = "zeroize"' Cargo.lock | grep -Fq 'version = "1.8.2"'; then
  echo "BLOCKED: incompatible zeroize version selected for Solana 2.3.0" >&2
  exit 2
fi
echo "Compiling SBF with temporary Cargo pins: zeroize 1.8.2 / zeroize_derive 1.4.2 / proc-macro-crate 3.3.0 / indexmap 2.13.1"
anchor build

if [[ ! -s target/deploy/keys.so || ! -s target/idl/keys.json ]]; then
  echo "BLOCKED: anchor build did not produce a program SBF and IDL." >&2
  exit 2
fi

node -e '
const fs=require("fs");
const idl=JSON.parse(fs.readFileSync("target/idl/keys.json","utf8"));
const expected="ABjE6V5q9VbD3CAHDXxvztY5kXQmDXHRcEP1kZ4KSSfk";
if(idl.address!==expected) throw Error("BLOCKED: IDL has different program address");
for(const method of ["grant_allowance_once_v1","execute_once_with_pyth_v1"]){
 if(!idl.instructions?.some(x=>x.name===method || x.name===method.replaceAll("_",""))) {
  throw Error("BLOCKED: generated IDL missing "+method);
 }
}
'

TMP="$(mktemp -d)"
PID=""
cleanup() {
  if [[ -n "$PID" ]]; then
    kill "$PID" 2>/dev/null || true
    wait "$PID" 2>/dev/null || true
  fi
  rm -rf "$TMP"
}
trap cleanup EXIT

solana-keygen new --no-bip39-passphrase --silent --outfile "$TMP/local-payer.json" >/dev/null
LOCAL_PUBKEY="$(solana-keygen pubkey "$TMP/local-payer.json")"

solana-test-validator \
  --ledger "$TMP/ledger" \
  --reset \
  --rpc-port 18899 \
  --faucet-port 19900 \
  --bpf-program "$PROGRAM_ID" "$ROOT/target/deploy/keys.so" \
  >"$TMP/local-validator.log" 2>&1 &
PID=$!

READY=0
for i in $(seq 1 80); do
  if solana --url "$RPC_URL" block-height >/dev/null 2>&1; then READY=1; break; fi
  if ! kill -0 "$PID" 2>/dev/null; then break; fi
  sleep 1
done
if [[ "$READY" != "1" ]]; then
  echo "BLOCKED: local validator did not start; last lines follow" >&2
  tail -n 30 "$TMP/local-validator.log" >&2
  exit 3
fi

solana airdrop 20 "$LOCAL_PUBKEY" --url "$RPC_URL" >/dev/null
solana program show "$PROGRAM_ID" --url "$RPC_URL" >/dev/null || {
  echo "BLOCKED: expected program not loaded in local ledger." >&2
  exit 3
}

echo "Running negative-path assertions against the isolated local validator..."
CRESCO_V1_EPHEMERAL_LOCALNET="1" \
ANCHOR_PROVIDER_URL="$RPC_URL" \
ANCHOR_WALLET="$TMP/local-payer.json" \
  ./node_modules/.bin/mocha --timeout 120000 tests/anchor-v1-refusal-proof.cjs

echo "PROVEN IN THIS RUN: local SBF V1 guardian grant + pre-Pyth refusal behavior."
echo "NOT PROVEN: Pyth CPI, successful V1 transfer, replay of a consumed receipt, or public deployment."
