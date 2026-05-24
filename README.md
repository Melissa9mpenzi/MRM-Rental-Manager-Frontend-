# MRM Rental Manager — Web Frontend

React + Vite single-page application for **RentDirect UG**: the public marketplace, landlord/tenant/agent dashboards, system admin console, and Uganda government oversight portal.

| Environment | URL |
|-------------|-----|
| **Production** | https://mrm-rental-manager-frontend-pink.vercel.app |
| **Backend API** | https://mrm-rental-manager-backend.vercel.app |
| **Mobile web** | https://mrm-rental-manager-mobile.vercel.app |

**Related repos**

| App | Repo |
|-----|------|
| Backend API | [MRM-Rental-Manager-Backend-](https://github.com/Melissa9mpenzi/MRM-Rental-Manager-Backend-) |
| Flutter mobile | [MRM-Rental-Manager-Mobile-](https://github.com/Melissa9mpenzi/MRM-Rental-Manager-Mobile-) |

---

## What this app includes

### Public & marketing

- Landing page, about, pricing, contact
- Property marketplace — browse, search, listing details
- Registration and login for all user types

### Role-based portals

| Role | Routes | Features |
|------|--------|----------|
| **Tenant** | `/tenant/*` | Dashboard, saved listings, applications, wallet, rent payments, contract, messages |
| **Landlord** | `/landlord/*` | Properties, applicants, contracts, analytics, wallet, reports |
| **Agent** | `/agent/*` | Client and listing management |
| **System admin** | `/system/*` | Platform users, properties, payments, wallets, announcements |
| **Government** | `/government/*` | NIRA, KCCA, URA dashboards — fraud, approvals, inspections, audit |

Authentication flows include OTP verification, KYC upload, and two-factor authentication for government and system admin users.

---

## Tech stack

- **React 19** + **Vite 7**
- **React Router** for navigation
- **TanStack Query** for server state
- **Zustand** for auth state
- **Tailwind CSS** for styling
- **Axios** API clients
- **Firebase** for social login (optional)
- Deployed on **Vercel** as a static SPA

---

## Local development

### Prerequisites

- Node.js 18+
- Backend API running on port 8000 (see backend README)

### Setup

```bash
cd MRM-Rental-Manager-Frontend-
npm install
cp .env.example .env
```

Default `.env` points at local API:

```env
VITE_API_URL=http://localhost:8000
VITE_GOV_API_URL=http://localhost:8000
```

Optional Firebase keys for Google/Apple sign-in:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
```

### Run

```bash
npm run dev
```

Open http://localhost:5173

### Build

```bash
npm run build
npm run preview   # preview production build locally
```

---

## API configuration

Production URLs are baked in at build time from `.env.production`:

```env
VITE_API_URL=https://mrm-rental-manager-backend.vercel.app
VITE_GOV_API_URL=https://mrm-rental-manager-backend.vercel.app
```

Logic in `src/api/config.js`:

- On **localhost**, uses `VITE_API_URL` or falls back to `http://localhost:8000`
- On **`.vercel.app` hosts**, ignores any localhost URL and uses the production backend

If the live site cannot reach the API, check Vercel → Environment Variables and ensure `VITE_API_URL` is **not** set to `localhost`.

---

## Deploying to Vercel

1. Import this repo into Vercel.
2. Framework preset: **Vite**
3. Build command: `npm run build`
4. Output directory: `dist`
5. Set env vars (optional overrides):

| Variable | Value |
|----------|--------|
| `VITE_API_URL` | `https://mrm-rental-manager-backend.vercel.app` |
| `VITE_GOV_API_URL` | `https://mrm-rental-manager-backend.vercel.app` |

6. Redeploy after changing env vars.

See [docs/DEPLOY_VERCEL.md](docs/DEPLOY_VERCEL.md) for details.

---

## Branding & favicon

The browser tab icon uses the **MRM / RentDirect** logo from `src/assets/MRM-LOGO.png`, copied to `public/` as favicons:

- `public/favicon.ico`, `favicon-16.png`, `favicon-32.png`
- `public/apple-touch-icon.png`
- `public/site.webmanifest`

After updating the source logo, regenerate icons from the PNG and redeploy.

---

## Project structure

```
src/
  api/              # Axios clients, config, API modules
  components/       # Shared UI, layouts, role-specific widgets
  pages/            # Route pages (tenant, landlord, government, system, marketing)
  store/            # Zustand auth store
  lib/              # Helpers (errors, payments, formatting)
  assets/           # MRM logo and static images
public/             # Favicons, payment icons, geo data
index.html          # SPA shell, meta tags, favicon links
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve production build locally |
| `npm run lint` | ESLint |

---

## License

Private — MRM Rental Manager / RentDirect UG.
