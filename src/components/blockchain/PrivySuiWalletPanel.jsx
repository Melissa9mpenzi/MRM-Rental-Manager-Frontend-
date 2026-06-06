import { usePrivy } from "@privy-io/react-auth";
import { Copy, Wallet } from "lucide-react";
import toast from "react-hot-toast";
import { findPrivySuiWallet } from "../../lib/privySocialSignIn";
import { isPrivyConfigured } from "../../lib/privyConfig";
import PlatformSuiWallet from "./PlatformSuiWallet";

/**
 * Shows Privy embedded Sui wallet when configured; otherwise platform wallet fallback.
 */
export default function PrivySuiWalletPanel({ compact = false, className = "" }) {
  const { authenticated, login, user: privyUser } = usePrivy();
  const privyWallet = findPrivySuiWallet(privyUser);

  if (!isPrivyConfigured()) {
    return <PlatformSuiWallet compact={compact} className={className} />;
  }

  const address = privyWallet?.address;

  const copy = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    toast.success("Sui address copied");
  };

  if (!authenticated) {
    return (
      <div className={`rounded-xl border border-violet-500/25 bg-violet-500/10 p-3 ${className}`}>
        <p className="text-xs font-bold text-violet-100">Privy Sui wallet</p>
        <p className="mt-1.5 text-[11px] leading-snug text-white/55">
          Sign in with Google, Apple, or email to get an embedded Sui wallet — no browser extension.
        </p>
        <button
          type="button"
          onClick={() => login()}
          className="mt-2 text-[11px] font-semibold text-violet-200 hover:underline"
        >
          Connect Privy wallet
        </button>
      </div>
    );
  }

  if (!address) {
    return (
      <div className={`rounded-xl border border-violet-500/25 bg-violet-500/10 p-3 ${className}`}>
        <p className="text-xs font-bold text-violet-100">Privy Sui wallet</p>
        <p className="mt-1.5 text-[11px] text-white/55">
          Your embedded wallet will be created when you pay with Sui.
        </p>
      </div>
    );
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={copy}
        className={`inline-flex max-w-full items-center gap-1.5 rounded-lg border border-violet-500/25 bg-violet-500/10 px-2 py-1 text-[10px] font-mono text-violet-100 ${className}`}
        title={address}
      >
        <Wallet size={12} />
        <span className="truncate">{address.slice(0, 8)}…{address.slice(-6)}</span>
        <Copy size={10} />
      </button>
    );
  }

  return (
    <div className={`rounded-xl border border-violet-500/25 bg-violet-500/10 p-3 ${className}`}>
      <div className="flex items-center gap-2 text-xs font-bold text-violet-100">
        <Wallet size={14} />
        Privy Sui wallet
        <span className="rounded-full border border-violet-400/30 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-violet-100/80">
          Embedded · Privy
        </span>
      </div>
      <p className="mt-2 break-all font-mono text-[11px] text-white/80">{address}</p>
      <p className="mt-1.5 text-[10px] leading-snug text-white/45">
        Created with your Google / Apple / email login. Payments are signed in your browser via Privy — no
        server-side pysui required.
      </p>
      <button
        type="button"
        onClick={copy}
        className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-violet-200 hover:underline"
      >
        <Copy size={12} />
        Copy address
      </button>
    </div>
  );
}
