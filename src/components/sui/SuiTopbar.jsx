import { Menu, Bell, Moon } from "lucide-react";
import { ConnectButton } from "@mysten/dapp-kit";
import { SUI_NETWORKS } from "../../config/suiPortalNav";

export default function SuiTopbar({ title, network, onMenuClick }) {
  const netLabel = SUI_NETWORKS.find((n) => n.id === network)?.label || `Sui ${network || "devnet"}`;

  return (
    <header className="sui-topbar">
      <button type="button" className="rounded-lg p-2 text-white/70 lg:hidden" onClick={onMenuClick} aria-label="Menu">
        <Menu size={20} />
      </button>
      <h1 className="sui-topbar__title">{title || "Sui Dashboard"}</h1>
      <div className="sui-topbar__spacer" />
      <span className="sui-network-pill hidden sm:inline-flex">
        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
        {netLabel}
      </span>
      <ConnectButton />
      <button type="button" className="rounded-lg p-2 text-white/50 hover:text-white" title="Notifications">
        <Bell size={18} />
      </button>
      <button type="button" className="rounded-lg p-2 text-white/50 hover:text-white" title="Theme">
        <Moon size={18} />
      </button>
    </header>
  );
}
