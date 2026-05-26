import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import ConnectWalletButton from "../../components/blockchain/ConnectWalletButton";
import PlatformSuiWallet from "../../components/blockchain/PlatformSuiWallet";
import { useSuiDashboard, fmtSui } from "../../lib/useSuiDashboard";
import { useQuery } from "@tanstack/react-query";
import { blockchainApi } from "../../api/blockchainApi";

export default function SuiWalletsPage() {
  const { data } = useSuiDashboard();
  const walletQ = useQuery({ queryKey: ["sui-linked-wallet"], queryFn: () => blockchainApi.myWallet() });

  const address = walletQ.data?.sui_address;
  const isPlatform = walletQ.data?.auto_provisioned !== false;

  const tokens = [
    { sym: "SUI", bal: data?.wallet?.sui_balance ?? "—", usd: "—" },
    { sym: "Escrow", bal: fmtSui(data?.wallet?.escrow_balance ?? 0), usd: "Held" },
  ];

  return (
    <section className="space-y-5">
      <article className="sui-panel">
        <p className="sui-panel__title">RentDirect wallet</p>
        <p className="mt-2 text-3xl font-extrabold text-white">
          {data?.wallet?.sui_balance != null ? fmtSui(data.wallet.sui_balance) : "—"}
        </p>
        <p className="mt-1 text-sm text-white/45">Escrow held: {fmtSui(data?.wallet?.escrow_balance ?? 0)}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className="sui-btn-primary"
            onClick={() =>
              address
                ? toast("Pay rent from Tenant → Pay rent, or fund this address on testnet.", { icon: "💳" })
                : toast.error("Wallet is still activating — refresh in a moment.")
            }
          >
            Pay rent
          </button>
          <button
            type="button"
            className="rounded-lg border border-white/15 px-4 py-2 text-sm font-bold text-white"
            onClick={() => {
              if (!address) return toast.error("No address yet.");
              navigator.clipboard.writeText(address);
              toast.success("Address copied for receive.");
            }}
          >
            Receive
          </button>
          <Link to="/sui/transactions" className="rounded-lg border border-white/15 px-4 py-2 text-sm font-bold text-white hover:bg-white/5">
            History
          </Link>
        </div>
      </article>

      <article className="sui-panel">
        <p className="sui-panel__title mb-3">Your Sui address</p>
        <PlatformSuiWallet />
      </article>

      {!isPlatform && (
        <article className="sui-panel">
          <p className="sui-panel__title mb-3">External wallet (optional)</p>
          <ConnectWalletButton />
        </article>
      )}

      {isPlatform && (
        <article className="sui-panel border-white/10">
          <p className="sui-panel__title mb-2 text-sm">Advanced</p>
          <p className="mb-3 text-xs text-white/45">
            Link a browser wallet if you prefer self-custody signing instead of the platform wallet.
          </p>
          <ConnectWalletButton />
        </article>
      )}

      <article className="sui-panel">
        <p className="sui-panel__title mb-3">Tokens</p>
        <ul className="space-y-2">
          {tokens.map((t) => (
            <li key={t.sym} className="flex items-center justify-between rounded-lg border border-white/5 px-3 py-2.5">
              <span className="font-bold text-white">{t.sym}</span>
              <span className="text-sm text-white/70">{t.bal}</span>
              <span className="text-xs text-white/40">{t.usd}</span>
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
}
