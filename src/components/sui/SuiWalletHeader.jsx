import { ConnectButton } from "@mysten/dapp-kit";
import { defaultNetwork } from "../../providers/SuiProvider";
import { SUI_NETWORKS } from "../../config/suiPortalNav";

/** Wallet + network chip for the main app top bar (Sui routes only). */
export default function SuiWalletHeader() {
  const netLabel = SUI_NETWORKS.find((n) => n.id === defaultNetwork)?.label || `Sui ${defaultNetwork}`;

  return (
    <div className="flex items-center gap-2 border-r border-white/10 pr-2 mr-0.5">
      <span className="sui-network-pill hidden sm:inline-flex">
        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
        {netLabel}
      </span>
      <div className="sui-connect-btn [&_button]:!rounded-xl [&_button]:!text-xs [&_button]:!font-bold">
        <ConnectButton />
      </div>
    </div>
  );
}
