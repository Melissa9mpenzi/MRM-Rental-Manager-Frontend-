/** Privy app config — https://dashboard.privy.io */

import { PRODUCTION_FRONTEND_URL } from "../api/config";

export const PRIVY_APP_ID = (import.meta.env.VITE_PRIVY_APP_ID || "").trim();

/** Hosted PNG logo for Privy modal + OTP emails (Dashboard → UI components). */
export function privyLogoUrl() {
  const fromEnv = (import.meta.env.VITE_PRIVY_LOGO_URL || "").trim();
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined") {
    return `${window.location.origin}/rentdirect-logo.png`;
  }
  return `${PRODUCTION_FRONTEND_URL}/rentdirect-logo.png`;
}

export const PRIVY_BRAND = {
  name: "RentDirect",
  accent: "#00C076",
  accentDim: "rgba(0,192,118,0.16)",
};

export function isPrivyConfigured() {
  return Boolean(PRIVY_APP_ID);
}

export function privyProviderConfig() {
  return {
    loginMethods: ["google", "apple", "email"],
    appearance: {
      theme: "dark",
      accentColor: PRIVY_BRAND.accent,
      logo: privyLogoUrl(),
      landingHeader: "Welcome to RentDirect",
      loginMessage: "Sign in to pay rent, manage your lease, and use your embedded Sui wallet.",
      showWalletLoginFirst: false,
    },
    embeddedWallets: {
      showWalletUIs: false,
      ethereum: { createOnLogin: "off" },
      solana: { createOnLogin: "off" },
    },
  };
}
