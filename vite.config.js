import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      "@mysten/sui/jsonRpc",
      "@mysten/sui/transactions",
      "@mysten/sui/cryptography",
      "@mysten/sui/verify",
      "@mysten/sui/utils",
    ],
  },
})
