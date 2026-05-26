import { useQuery } from "@tanstack/react-query";
import { Copy, Wallet } from "lucide-react";
import toast from "react-hot-toast";
import { blockchainApi } from "../../api/blockchainApi";
import useAuthStore from "../../store/authStore";

/**
 * RentDirect platform wallet — created with your email account (no extension required).
 */
export default function PlatformSuiWallet({ compact = false, className = "" }) {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["platform-sui-wallet", user?.id],
    queryFn: () => blockchainApi.ensureWallet(),
    enabled: !!user?.id,
    staleTime: 60_000,
  });

  const address = data?.sui_address || user?.sui_address;
  const label = data?.wallet_name || "RentDirect Wallet";

  const copy = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    toast.success("Sui address copied");
  };

  if (isLoading && !address) {
    return <p className={`text-xs text-white/45 ${className}`}>Loading your Sui wallet…</p>;
  }

  if (!address) {
    return (
      <button
        type="button"
        onClick={() => refetch()}
        className={`text-xs font-semibold text-cyan-300 hover:underline ${className}`}
      >
        Activate Sui wallet
      </button>
    );
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={copy}
        className={`inline-flex max-w-full items-center gap-1.5 rounded-lg border border-cyan-500/25 bg-cyan-500/10 px-2 py-1 text-[10px] font-mono text-cyan-100 ${className}`}
        title={address}
      >
        <Wallet size={12} />
        <span className="truncate">{address.slice(0, 8)}…{address.slice(-6)}</span>
        <Copy size={10} />
      </button>
    );
  }

  return (
    <div className={`rounded-xl border border-cyan-500/25 bg-cyan-500/10 p-3 ${className}`}>
      <div className="flex items-center gap-2 text-xs font-bold text-cyan-200">
        <Wallet size={14} />
        {label}
        <span className="rounded-full border border-cyan-500/30 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-cyan-100/80">
          {data?.auto_provisioned === false ? "Linked" : "Auto · account"}
        </span>
      </div>
      <p className="mt-2 break-all font-mono text-[11px] text-white/80">{address}</p>
      <p className="mt-1.5 text-[10px] leading-snug text-white/45">
        Created when you signed up — no separate “connect wallet” step. Pay rent on-chain from this address
        (testnet gas via faucet when needed).
      </p>
      <button
        type="button"
        onClick={copy}
        className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-300 hover:underline"
      >
        <Copy size={12} />
        Copy address
      </button>
    </div>
  );
}
