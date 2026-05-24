# Frontend on Vercel

- **App:** https://mrm-rental-manager-frontend-pink.vercel.app
- **API:** https://mrm-rental-manager-backend.vercel.app

Production API URLs are in `.env.production` (baked in at `vite build`).

Optional Vercel env overrides (must **not** be `http://localhost:8000`):

| Variable | Value |
|----------|--------|
| `VITE_API_URL` | `https://mrm-rental-manager-backend.vercel.app` |
| `VITE_GOV_API_URL` | `https://mrm-rental-manager-backend.vercel.app` |

If `VITE_API_URL` is localhost, the live site cannot reach the API. Redeploy after changing env vars.

Backend must have `DATABASE_URL` set — test https://mrm-rental-manager-backend.vercel.app/health/db
