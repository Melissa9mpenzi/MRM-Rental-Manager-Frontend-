# RentDirect UG — Web Application

Official **React** single-page application for **RentDirect UG** (MRM Rental Manager): Uganda’s rental marketplace, landlord and tenant operations, hybrid payments (MTN MoMo, Airtel, card, Sui), enterprise receipts, and government oversight portals.

<p align="center">
  <strong>Smart Rentals. Secure Payments.</strong>
</p>

| Environment | URL |
|-------------|-----|
| **Production (web)** | [mrm-rental-manager-frontend-pink.vercel.app](https://mrm-rental-manager-frontend-pink.vercel.app) |
| **Backend API** | [mrm-rental-manager-backend.vercel.app](https://mrm-rental-manager-backend.vercel.app) |
| **Mobile (Flutter web)** | [mrm-rental-manager-mobile.vercel.app](https://mrm-rental-manager-mobile.vercel.app) |

---

## Related repositories

| Repository | Purpose |
|------------|---------|
| [MRM-Rental-Manager-Backend-](https://github.com/Melissa9mpenzi/MRM-Rental-Manager-Backend-) | FastAPI API, Postgres, payments, receipts, Sui layer |
| [MRM-Rental-Manager-Mobile-](https://github.com/Melissa9mpenzi/MRM-Rental-Manager-Mobile-) | Flutter app (Android / iOS / web) |

---

## Features at a glance

### Public & marketing

- Landing, about, pricing, contact
- Property marketplace — search, filters, listing detail
- Self-service registration and login (tenant, landlord, agent)

### Tenant portal (`/tenant/*`)

- Dashboard, saved properties, lease applications
- **Pay rent** — MTN MoMo, Pesapal (Airtel / card), **Sui wallet** (on-chain)
- **Payments & receipts** — official PDF receipts, QR verification, email/share
- Wallet, contract, messages, notifications, profile

### Landlord portal (`/landlord/*`)

- Properties, applicants, tenants, contracts
- Payments, analytics, reports, maintenance
- **Receipts** — view and download tenant payment receipts
- Wallet and messaging

### Agent portal (`/agent/*`)

- Leads, clients, schedules, deals, commissions
- Shared marketplace browse

### Sui blockchain portal (`/sui/*`)

Dedicated dark-theme console for hybrid Web3 (works alongside fiat, does not replace it):

| Route | Purpose |
|-------|---------|
| `/sui/dashboard` | Balances, volume charts, network status |
| `/sui/transactions` | On-chain and anchored payment activity |
| `/sui/escrow` | Escrow contracts |
| `/sui/contracts` | Smart contract registry |
| `/sui/wallets` | Linked Sui wallets |
| `/sui/receipts` | Blockchain receipt anchors |
| `/sui/analytics` | Aggregated metrics |
| `/sui/settings` | Network / RPC configuration |

Uses [@mysten/dapp-kit](https://sdk.mystenlabs.com/dapp-kit) for wallet connect (Slush, Nightly, Suiet, etc.).

### Enterprise receipts

| Route | Who | Purpose |
|-------|-----|---------|
| `/tenant/receipts` | Tenant | Receipt list with filters (rent, deposit, tax, …) |
| `/tenant/receipts/:id` | Tenant | Printable receipt + blockchain proof sidebar |
| `/landlord/receipts` | Landlord | All issued receipts |
| `/system/receipts` | System admin | Receipt management center |
| `/verify/receipt/:token` | **Public** | QR verification — no login required |

Receipt types: rent payment, security deposit (escrow), commission, URA tax, blockchain (Sui).

### System admin (`/system/*`)

- Global overview, users & roles, properties, contracts
- Payments & escrow, wallets, announcements, support
- Receipt center and platform settings

### Government portal (`/government/*`)

Invitation-only access for Uganda agencies:

- **NIRA** — identity / KYC oversight  
- **KCCA** — property & municipal compliance  
- **URA** — tax compliance  
- Fraud, approvals, inspections, audit logs, analytics  

Separate auth layout at `/government/login` with 2FA.

---

## Tech stack

| Layer | Technology |
|-------|------------|
| UI | React 19, Tailwind CSS 3 |
| Build | Vite 7 |
| Routing | React Router 6 |
| Server state | TanStack Query 5 |
| Client state | Zustand |
| Forms | React Hook Form + Zod |
| HTTP | Axios |
| Charts | Recharts |
| Web3 | Mysten dapp-kit, Sui SDK |
| Auth (optional) | Firebase Auth |
| Toasts | react-hot-toast |
| Icons | Lucide React |
| Hosting | Vercel (static SPA) |

---

## Prerequisites

- **Node.js** 18+ (20 LTS recommended)
- **npm** 9+
- **Backend API** running locally or deployed ([backend README](https://github.com/Melissa9mpenzi/MRM-Rental-Manager-Backend-))

---

## Quick start

```bash
git clone https://github.com/Melissa9mpenzi/MRM-Rental-Manager-Frontend-.git
cd MRM-Rental-Manager-Frontend-
npm install
cp .env.example .env
npm run dev
```

Open **http://localhost:5173**

Ensure the backend is up at `http://localhost:8000` (or point `VITE_API_URL` at your deployed API).

---

## Environment variables

Create `.env` from `.env.example`:

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes (dev) | Platform API base URL, no trailing slash. Example: `http://localhost:8000` |
| `VITE_GOV_API_URL` | No | Government routes API; defaults to `VITE_API_URL` |
| `VITE_SUI_NETWORK` | No | Sui network for dapp-kit: `devnet` (default), `testnet`, `mainnet` |
| `VITE_FIREBASE_API_KEY` | No | Firebase Web SDK — Google/Apple sign-in |
| `VITE_FIREBASE_AUTH_DOMAIN` | No | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | No | Firebase project ID |
| `VITE_FIREBASE_APP_ID` | No | Firebase app ID |

Production values live in `.env.production` and Vercel project settings:

```env
VITE_API_URL=https://mrm-rental-manager-backend.vercel.app
VITE_GOV_API_URL=https://mrm-rental-manager-backend.vercel.app
```

### API URL resolution (`src/api/config.js`)

- **Local dev** — uses `VITE_API_URL` or falls back to `http://localhost:8000`
- **Vercel / production hosts** — ignores accidental `localhost` in env and uses the production backend URL

If the deployed site shows API errors mentioning `localhost`, fix **Vercel → Settings → Environment Variables** and redeploy.

---

## NPM scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server with HMR (port 5173) |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Serve `dist/` locally |
| `npm run lint` | ESLint |

---

## Project structure

```
MRM-Rental-Manager-Frontend-/
├── public/                 # Favicons, payment icons, PWA manifest
├── src/
│   ├── api/                # Axios clients (platform, gov, payments, receipts, blockchain)
│   ├── assets/             # MRM logo, marketing images
│   ├── components/
│   │   ├── layout/         # App shell, sidebar, protected routes
│   │   ├── payments/       # Method icons, checkout UI
│   │   ├── receipts/       # ReceiptDocument, verify, success overlay
│   │   ├── blockchain/     # Wallet connect, escrow, receipt cards
│   │   ├── government/     # Gov branding, agency UI
│   │   ├── sui/            # Sui portal chrome
│   │   └── system/         # Super-admin components
│   ├── config/             # Roles, gov access, Sui nav, system admin nav
│   ├── layouts/            # Auth, gov, system, Sui portal layouts
│   ├── lib/                # Checkout, Sui pay, receipt themes, errors
│   ├── pages/              # Route-level screens by domain
│   ├── providers/          # SuiProvider (dapp-kit)
│   ├── store/              # Auth store (Zustand)
│   └── styles/             # receipt-portal.css, sui-portal.css, global
├── index.html              # SPA entry, meta, favicon links
├── vite.config.js
├── tailwind.config.js
└── .env.example
```

---

## Key routes (cheat sheet)

| Area | Entry path |
|------|------------|
| Home | `/` |
| Browse properties | `/browse-properties` |
| Login | `/login` |
| Tenant home | `/tenant/dashboard` |
| Pay rent | `/tenant/pay` |
| Tenant receipts | `/tenant/receipts` |
| Landlord home | `/landlord/dashboard` |
| Sui portal | `/sui/dashboard` |
| System admin | `/system/dashboard` |
| Government login | `/government/login` |
| Public receipt verify | `/verify/receipt/:token` |

After login, users are redirected to the dashboard for their role (`src/config/access.js`).

---

## Payments (tenant)

Hybrid flow — fiat gateways stay primary; Sui is additive settlement.

1. Tenant opens **Pay rent** (`/tenant/pay`).
2. Chooses **MTN MoMo**, **Pesapal** (Airtel/card), or **Sui wallet**.
3. Backend confirms payment and issues an **enterprise receipt** (PDF + QR).
4. Success overlay offers download, share, and link to full receipt.

Backend must have payment keys configured — see backend `docs/PAYMENT_GATEWAY.md` and `docs/SUI_PAYMENTS.md`.

---

## Deploying to Vercel

1. Import this repository in [Vercel](https://vercel.com).
2. **Framework preset:** Vite  
3. **Build command:** `npm run build`  
4. **Output directory:** `dist`  
5. **Environment variables** (Production):

   | Name | Value |
   |------|--------|
   | `VITE_API_URL` | `https://mrm-rental-manager-backend.vercel.app` |
   | `VITE_GOV_API_URL` | Same as above (unless gov API is split later) |

6. Redeploy after any env change (Vite bakes env at build time).

More detail: [docs/DEPLOY_VERCEL.md](docs/DEPLOY_VERCEL.md)

### CORS

The backend must list this frontend origin in `ALLOWED_ORIGINS` (comma-separated). Example:

```env
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174,https://mrm-rental-manager-frontend-pink.vercel.app
```

---

## Branding & favicon

Brand logo and PWA assets use `src/assets/rentdirect-logo.png`, copied under `public/`:

- `favicon.ico`, `favicon-16.png`, `favicon-32.png`
- `apple-touch-icon.png`
- `site.webmanifest`

After updating the logo, replace those files and redeploy.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| API calls go to `localhost` on Vercel | Set `VITE_API_URL` to production backend in Vercel env; redeploy |
| Pay rent disabled / gateway error | Configure MTN or Pesapal on backend `.env`; check `/payments/gateway/status` |
| Sui pay unavailable | Set `SUI_TREASURY_ADDRESS` on backend; connect wallet in browser |
| CORS errors in browser console | Add your frontend URL to backend `ALLOWED_ORIGINS` |
| Firebase social login fails | Fill all `VITE_FIREBASE_*` vars; enable providers in Firebase Console |
| Receipt PDF 401 | User must own the receipt; tenants use `/tenant/receipts/:id` |

---

## Contributing

1. Branch from `feature-fix` or `main` per team convention.
2. Run `npm run lint` and `npm run build` before opening a PR.
3. Do not commit `.env` (secrets). Use `.env.example` for documentation only.

---

## License

Private — **RentDirect UG** / MRM Rental Manager. All rights reserved.
