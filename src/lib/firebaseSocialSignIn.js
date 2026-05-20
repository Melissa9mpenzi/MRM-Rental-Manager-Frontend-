/**
 * Google / Apple via Firebase Auth popup → POST /api/v1/auth/firebase.
 * Requires VITE_FIREBASE_* in `.env` and Google (and Apple) enabled in Firebase Console.
 */
import { GoogleAuthProvider, OAuthProvider, signInWithPopup } from "firebase/auth";
import { authApi } from "../api/authApi";
import { getFirebaseAuth, isFirebaseConfigured } from "./firebase";

export function isFirebaseSocialAvailable() {
  return isFirebaseConfigured();
}

/** User-friendly message; returns null if the user cancelled the popup. */
export function firebaseAuthErrorMessage(err, fallback = "Sign-in failed.") {
  const code = err?.code || "";
  if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
    return null;
  }
  if (code === "auth/unauthorized-domain") {
    return "This site is not in Firebase authorized domains. Add localhost (and your host) under Authentication → Settings.";
  }
  if (code === "auth/operation-not-allowed") {
    return "This provider is disabled in Firebase Authentication → Sign-in method.";
  }
  return err?.message || fallback;
}

async function exchangeProviderPopup(provider) {
  const auth = getFirebaseAuth();
  if (!auth) {
    throw new Error(
      "Firebase is not configured. Copy VITE_FIREBASE_* from .env.example into your .env file.",
    );
  }
  const result = await signInWithPopup(auth, provider);
  const idToken = await result.user.getIdToken();
  if (!idToken) {
    throw new Error("No Firebase ID token. Check Firebase Authentication settings.");
  }
  return authApi.firebaseSignIn({ id_token: idToken });
}

export function signInWithGoogleFirebase() {
  return exchangeProviderPopup(new GoogleAuthProvider());
}

export function signInWithAppleFirebase() {
  const provider = new OAuthProvider("apple.com");
  provider.addScope("email");
  provider.addScope("name");
  return exchangeProviderPopup(provider);
}
