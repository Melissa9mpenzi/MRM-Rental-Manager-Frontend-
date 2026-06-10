import PlatformSuiWallet from "./PlatformSuiWallet";
import PrivySuiWalletPanel from "./PrivySuiWalletPanel";

/**
 * Sui pay wallet UI — default is platform wallet (no second login).
 * @param {"platform" | "privy"} mode
 */
export default function TenantSuiPayWallet({ mode = "platform", className = "" }) {
  if (mode === "privy") {
    return <PrivySuiWalletPanel className={className} />;
  }
  return <PlatformSuiWallet className={className} />;
}
