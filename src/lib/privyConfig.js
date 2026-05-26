/** Privy app config — https://dashboard.privy.io */

export const PRIVY_APP_ID = (import.meta.env.VITE_PRIVY_APP_ID || "").trim();

export function isPrivyConfigured() {
  return Boolean(PRIVY_APP_ID);
}

export function privyProviderConfig() {
  const suiNetwork = import.meta.env.VITE_SUI_NETWORK || "testnet";
  return {
    loginMethods: ["google", "apple", "email"],
    appearance: {
      theme: "dark",
      accentColor: "#14b8a6",
    },
    embeddedWallets: {
      createOnLogin: "users-without-wallets",
      showWalletUIs: false,
    },
    // Sui embedded wallet on social login (Privy extended chains)
    supportedChains: [],
    defaultChain: undefined,
    // Documented in Privy dashboard: enable Sui under Embedded wallets → Extended chains
    _suiNetworkHint: suiNetwork,
  };
}
