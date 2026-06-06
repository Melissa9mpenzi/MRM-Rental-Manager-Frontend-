/** Privy app config — https://dashboard.privy.io */

export const PRIVY_APP_ID = (import.meta.env.VITE_PRIVY_APP_ID || "").trim();

export function isPrivyConfigured() {
  return Boolean(PRIVY_APP_ID);
}

export function privyProviderConfig() {
  return {
    loginMethods: ["google", "apple", "email"],
    appearance: {
      theme: "dark",
      accentColor: "#14b8a6",
    },
    embeddedWallets: {
      showWalletUIs: false,
      // Sui wallet is created via extended-chains (useCreateWallet) on pay / login — not EVM.
      ethereum: {
        createOnLogin: "off",
      },
      solana: {
        createOnLogin: "off",
      },
    },
    // Do not pass supportedChains: [] — Privy requires at least one chain or omit for defaults.
    // Sui payments use @privy-io/react-auth/extended-chains + useSignRawHash.
  };
}
