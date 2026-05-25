# Build and deploy RentDirect web frontend (Sui testnet + production API).
# Requires: Node.js, Vercel CLI login (`npx vercel login`) once.

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot/..

if (-not (Test-Path .env.production)) {
  Write-Error "Missing .env.production — copy from .env.example and set VITE_SUI_NETWORK=testnet"
}

Write-Host "Building production bundle (testnet)..."
npm run build

Write-Host "Deploying to Vercel (production)..."
npx --yes vercel deploy --prod --yes

Write-Host "Done. Confirm VITE_SUI_NETWORK=testnet in Vercel project Environment Variables."
