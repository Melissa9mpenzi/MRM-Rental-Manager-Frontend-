import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  optimizeDeps: {
    include: [
      "@privy-io/react-auth",
      "@privy-io/react-auth/extended-chains",
      "@noble/hashes/blake2.js",
      "@mysten/sui/jsonRpc",
      "@mysten/sui/transactions",
      "@mysten/sui/cryptography",
      "@mysten/sui/verify",
      "@mysten/sui/utils",
    ],
  },
})
