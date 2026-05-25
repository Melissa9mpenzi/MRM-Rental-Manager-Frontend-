import { useNavigate } from "react-router-dom";
import { Menu, Bell, Moon } from "lucide-react";
import { ConnectButton } from "@mysten/dapp-kit";
import toast from "react-hot-toast";
import { SUI_NETWORKS } from "../../config/suiPortalNav";
import { notificationsPathForRole } from "../../config/access";
import useAuthStore from "../../store/authStore";

export default function SuiTopbar({ title, network, onMenuClick }) {
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.user?.role) || "landlord";
  const netLabel = SUI_NETWORKS.find((n) => n.id === network)?.label || `Sui ${network || "testnet"}`;
  const notifPath = notificationsPathForRole(role);

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
      <button
        type="button"
        className="rounded-lg p-2 text-white/50 hover:text-white"
        title="Notifications"
        aria-label="Notifications"
        onClick={() => navigate(notifPath)}
      >
        <Bell size={18} />
      </button>
      <button
        type="button"
        className="rounded-lg p-2 text-white/50 hover:text-white"
        title="Theme (light mode coming soon)"
        aria-label="Theme"
        onClick={() => toast("Dark theme is active in the Sui portal.", { icon: "🌙" })}
      >
        <Moon size={18} />
      </button>
    </header>
  );
}
