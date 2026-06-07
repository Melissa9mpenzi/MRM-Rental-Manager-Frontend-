import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const privyEsm = path.resolve(root, "node_modules/@privy-io/react-auth/dist/esm");

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  resolve: {
    alias: {
      // Privy does not export these modules; extended-chains uses them for raw_sign.
      "privy-sign-internal/context": path.join(privyEsm, "internal-context-DyNFsPl6.mjs"),
      "privy-sign-internal/user-signer": path.join(
        privyEsm,
        "use-sign-with-user-signer-CgSNwxWB.mjs",
      ),
    },
  },
  optimizeDeps: {
    include: [
      "@privy-io/react-auth",
      "@privy-io/react-auth/extended-chains",
      "@privy-io/js-sdk-core",
      "@mysten/sui/jsonRpc",
      "@mysten/sui/transactions",
      "@mysten/sui/cryptography",
      "@mysten/sui/verify",
      "@mysten/sui/utils",
    ],
  },
})
