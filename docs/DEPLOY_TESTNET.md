# Deploy web frontend on Sui Testnet

Production builds embed **testnet** via `.env.production` and Vercel env vars.

## Vercel environment variables

Set these on the **frontend** project (Production + Preview):

| Variable | Value |
|----------|--------|
| `VITE_API_URL` | `https://mrm-rental-manager-backend.vercel.app` |
| `VITE_GOV_API_URL` | Same as API URL |
| `VITE_SUI_NETWORK` | `testnet` |

## Backend (same testnet)

On the **backend** Vercel project:

| Variable | Value |
|----------|--------|
| `SUI_NETWORK` | `testnet` |
| `SUI_RPC_URL` | `https://fullnode.testnet.sui.io:443` |
| `SUI_TREASURY_ADDRESS` | Your funded testnet address |
| `SUI_PACKAGE_ID` | After `sui client publish --network testnet` |

## Deploy

```bash
cd MRM-Rental-Manager-Frontend-
npm ci
npm run build
npx vercel --prod
```

Or push to the branch connected to Vercel (auto-deploy).

## Verify

1. Open the deployed URL → **Sui Portal** → wallet connect should offer **Testnet**.
2. `GET {API}/api/v1/blockchain/status` → `"network": "testnet"`.
