import { PrivyProvider } from "@privy-io/react-auth";
import { isPrivyConfigured, PRIVY_APP_ID, privyProviderConfig } from "../lib/privyConfig";

/**
 * Wraps the app when VITE_PRIVY_APP_ID is set.
 * Privy is used for Sui wallet connect + signing on the payment page only.
 */
export default function PrivyAppProvider({ children }) {
  if (!isPrivyConfigured()) {
    return children;
  }

  return (
    <PrivyProvider appId={PRIVY_APP_ID} config={privyProviderConfig()}>
      {children}
    </PrivyProvider>
  );
}
