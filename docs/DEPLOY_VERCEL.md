# Frontend on Vercel

- **App:** https://mrm-rental-manager-frontend-pink.vercel.app
- **API:** https://mrm-rental-manager-backend.vercel.app

Production API URLs are in `.env.production` (baked in at `vite build`).

Optional Vercel env overrides:

| Variable | Value |
|----------|--------|
| `VITE_API_URL` | `https://mrm-rental-manager-backend.vercel.app` |
| `VITE_GOV_API_URL` | `https://mrm-rental-manager-backend.vercel.app` |

Redeploy after changing env vars.
