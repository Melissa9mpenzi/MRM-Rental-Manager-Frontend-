# RentDirect UG — Hackathon positioning

## Track strategy

| Priority | Track | Why |
|----------|--------|-----|
| **Primary** | **DeFi & Payments** | Escrow, Sui wallet, hybrid MTN/Pesapal, Move contracts, on-chain receipts — strongest differentiation vs swap-only DeFi projects. |
| **Secondary** | **Special — Walrus** | Receipts, contracts, KYC hashes, property docs, escrow proofs, gov audit blobs — makes storage real, not decorative. |
| **Optional** | **The Agentic Web** | Fraud alerts, dashboard insights, compliance copy — enter if AI demo is polished. |
| **Avoid** | **DeepBook** | Trading / order-book infra — not a rental payments platform. |

## One-line pitch

> RentDirect UG is government-integrated rental infrastructure on **Sui Testnet** — hybrid finance, blockchain escrow, **Walrus** proofs, and AI-assisted verification (NIRA · KCCA · URA).

## Sui network: use **Testnet**

```env
# Backend (.env)
SUI_NETWORK=testnet
SUI_RPC_URL=https://fullnode.testnet.sui.io:443

# Frontend (.env)
VITE_SUI_NETWORK=testnet
```

- **Devnet** — experiments only; less stable for judges.
- **Mainnet** — real cost + production risk during the event.

## DeFi demo flow (5 minutes)

1. Tenant registers → NIRA approves KYC (`/government/nira`)
2. Landlord lists property → KCCA verifies (`/government/kcca`)
3. Tenant pays rent — **MTN** or **Sui wallet** (`/tenant/pay`)
4. Escrow activates (`/sui/escrow`)
5. Receipt with **tx hash + Walrus blob** (`/sui/receipts` or `/receipts`)
6. URA sees rental income (`/government/ura`)

Full credentials: open **`/demo`** in the web app.

## Walrus talking points

When `WALRUS_PUBLISHER_URL` is set, blobs are published to Walrus. Otherwise the API returns deterministic `hash:…` anchors for demo (still verifiable narrative).

**Wired in product (not slides only):**

| Artifact | When anchored |
|----------|----------------|
| KYC manifest | Landlord/agent uploads ID + selfie (`POST /users/me/kyc-documents`) |
| Property packet | KCCA verify/reject/illegal (`POST /government/kcca/decision`) |
| Gov audit entry | Every NIRA/KCCA officer action (`audit_logs.walrus_blob_id`) |
| Audit bundle | `POST /government/audit/export-walrus` on Audit page |
| Payment receipt | Sui / hybrid checkout (existing) |
| Escrow lease / release | Create / release escrow |

Inventory API: `GET /blockchain/walrus/inventory` (also on `/blockchain/status`).

## What makes this “real-world DeFi”

Most hackathon DeFi = wallets + swaps. RentDirect = **rental cash flow**:

- Fiat rails (Uganda MoMo / Pesapal)
- Programmable escrow (Move on Sui)
- Verifiable receipts (chain + Walrus)
- Regulatory layer (gov officers, not admins)

## Pre-demo checklist

- [ ] `python -m app.utils.seed_data` on demo database
- [ ] `SUI_NETWORK=testnet` on backend + Vercel env
- [ ] Treasury wallet funded on testnet (`sui client faucet`)
- [ ] Optional: Walrus publisher URL configured
- [ ] Walk `/demo` once on production URLs (same API for landlord + NIRA)
