import { defineConfig } from "vite";
import vinext from "vinext";
import { cloudflare } from "@cloudflare/vite-plugin";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      // @solana/web3.js (loaded on demand in the browser to sign guardian
      // transactions) depends on rpc-websockets, which only exports "browser"
      // and "node" conditions. Worker builds have neither: use the browser build.
      "rpc-websockets": fileURLToPath(new URL("./node_modules/rpc-websockets/dist/index.browser.mjs", import.meta.url)),
    },
  },
  plugins: [
    vinext(),
    cloudflare({
      viteEnvironment: {
        name: "rsc",
        childEnvironments: ["ssr"],
      },
    }),
  ],
});
