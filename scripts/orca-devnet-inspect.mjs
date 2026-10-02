import { inspectOrcaDevnetUsdcUsdt } from "../src/orca-devnet.mjs";

const result = await inspectOrcaDevnetUsdcUsdt();

console.log(JSON.stringify({ status: "PASS", ...result }, null, 2));

if (result.inputMint !== "BRjpCHtyQLNCo8gqRUr8jtdAj5AjPYQaoqbvcZiHok1k") {
  throw new Error("ORCA_DEVNET_INPUT_MINT_NOT_USDC");
}
if (result.outputMint !== "H8UekPGwePSmQ3ttuYGPU1szyFfjZR4N53rymSFwpLPm") {
  throw new Error("ORCA_DEVNET_OUTPUT_MINT_NOT_USDT");
}
if (!result.amountSpecifiedIsInput) {
  throw new Error("ORCA_DEVNET_QUOTE_NOT_EXACT_INPUT");
}

console.log("ORCA_DEVNET_POOL_DISCOVERY=PASS");
