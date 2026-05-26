import { PrivyProvider } from "@privy-io/react-auth";
import { isPrivyConfigured, PRIVY_APP_ID, privyProviderConfig } from "../lib/privyConfig";

/**
 * Wraps the app when VITE_PRIVY_APP_ID is set.
 * Enables Google / Apple / email login + embedded Sui wallet (configure Sui in Privy Dashboard).
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
