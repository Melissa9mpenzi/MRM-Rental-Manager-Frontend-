import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { Copy, Droplets, Wallet } from "lucide-react";
import toast from "react-hot-toast";
import { findPrivySuiWallet } from "../../lib/privySocialSignIn";
import { isPrivyConfigured } from "../../lib/privyConfig";
import { requestTestnetGas, suiFaucetWebUrl } from "../../lib/suiFaucet";
import PrivySuiConnect from "./PrivySuiConnect";
import PlatformSuiWallet from "./PlatformSuiWallet";

/**
 * Shows Privy embedded Sui wallet when configured; otherwise platform wallet fallback.
 */
export default function PrivySuiWalletPanel({ compact = false, className = "" }) {
  const { authenticated, user: privyUser } = usePrivy();
  const [faucetBusy, setFaucetBusy] = useState(false);
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

  async function fundWallet() {
    if (!address || faucetBusy) return;
    setFaucetBusy(true);
    try {
      const result = await requestTestnetGas(address, { network: "testnet", openOnFail: true });
      if (result.ok) {
        toast.success("Testnet SUI requested — wait about 60 seconds, then tap Pay again.", {
          duration: 8000,
        });
      } else {
        toast("Opened the Sui faucet in a new tab. Request SUI, wait a minute, then pay again.", {
          duration: 9000,
        });
      }
    } catch {
      window.open(suiFaucetWebUrl(address, "testnet"), "_blank", "noopener,noreferrer");
      toast("Use the faucet page to fund your wallet, then try paying again.", { duration: 8000 });
    } finally {
      setFaucetBusy(false);
    }
  }

  if (!authenticated) {
    return (
      <div
        className={`rounded-xl border border-brand-teal/25 bg-gradient-to-br from-brand-teal/10 to-white/[0.03] p-3 ${className}`}
      >
        <p className="text-xs font-bold text-brand-teal">Privy Sui wallet</p>
        <p className="mt-1.5 text-[11px] leading-snug text-white/55">
          Connect a wallet to pay with Sui. This is separate from your RentDirect login — sign in below
          only when you choose Sui as your payment method.
        </p>
        <PrivySuiConnect />
      </div>
    );
  }

  if (!address) {
    const label =
      privyUser?.email?.address ||
      privyUser?.google?.email ||
      privyUser?.apple?.email ||
      "Privy account";
    return (
      <div className={`rounded-xl border border-brand-teal/25 bg-brand-teal/10 p-3 ${className}`}>
        <p className="text-xs font-bold text-brand-teal">Privy Sui wallet</p>
        <p className="mt-1.5 text-[11px] text-white/70">
          Connected as <span className="font-semibold text-white">{label}</span>
        </p>
        <p className="mt-1 text-[10px] text-white/45">
          Your embedded Sui address is created when you tap Pay.
        </p>
      </div>
    );
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={copy}
        className={`inline-flex max-w-full items-center gap-1.5 rounded-lg border border-brand-teal/25 bg-brand-teal/10 px-2 py-1 text-[10px] font-mono text-brand-teal ${className}`}
        title={address}
      >
        <Wallet size={12} />
        <span className="truncate">{address.slice(0, 8)}…{address.slice(-6)}</span>
        <Copy size={10} />
      </button>
    );
  }

  return (
    <div className={`rounded-xl border border-brand-teal/25 bg-brand-teal/10 p-3 ${className}`}>
      <div className="flex items-center gap-2 text-xs font-bold text-brand-teal">
        <Wallet size={14} />
        Privy Sui wallet
        <span className="rounded-full border border-brand-teal/30 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-brand-teal/80">
          Embedded
        </span>
      </div>
      <p className="mt-2 break-all font-mono text-[11px] text-white/80">{address}</p>
      <p className="mt-1.5 text-[10px] leading-snug text-white/45">
        Sui pay needs a small amount of <strong className="text-white/70">testnet SUI</strong> for gas
        (rent is paid in SUI converted from UGX).
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={fundWallet}
          disabled={faucetBusy}
          className="inline-flex items-center gap-1 rounded-lg bg-brand-teal/20 px-3 py-1.5 text-[11px] font-bold text-brand-teal hover:bg-brand-teal/30 disabled:opacity-50"
        >
          <Droplets size={12} />
          {faucetBusy ? "Requesting…" : "Get testnet SUI"}
        </button>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-teal hover:underline"
        >
          <Copy size={12} />
          Copy address
        </button>
      </div>
    </div>
  );
}
