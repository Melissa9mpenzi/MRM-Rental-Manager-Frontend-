/**
 * Firebase Auth (optional). Set VITE_FIREBASE_* in `.env` to enable client SDK.
 * Backend exchange: POST /api/v1/auth/firebase with { id_token } (requires FIREBASE_CREDENTIALS_PATH on API).
 */
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const cfg = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export function isFirebaseConfigured() {
  return Boolean(cfg.apiKey && cfg.authDomain && cfg.projectId);
}

export function getFirebaseAuth() {
  if (!isFirebaseConfigured()) return null;
  const app = getApps().length ? getApps()[0] : initializeApp(cfg);
  return getAuth(app);
}
