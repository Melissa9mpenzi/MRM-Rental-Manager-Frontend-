import { defaultNetwork } from "../../providers/SuiProvider";
import { SUI_NETWORKS } from "../../config/suiPortalNav";
import PlatformSuiWallet from "../blockchain/PlatformSuiWallet";

/** Platform wallet chip for Sui routes — address comes with your account. */
export default function SuiWalletHeader() {
  const netLabel = SUI_NETWORKS.find((n) => n.id === defaultNetwork)?.label || `Sui ${defaultNetwork}`;

  return (
    <div className="flex items-center gap-2 border-r border-white/10 pr-2 mr-0.5">
      <span className="sui-network-pill hidden sm:inline-flex">
        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
        {netLabel}
      </span>
      <PlatformSuiWallet compact />
    </div>
  );
}
