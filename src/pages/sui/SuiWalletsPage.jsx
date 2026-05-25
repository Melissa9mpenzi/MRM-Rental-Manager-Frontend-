import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import ConnectWalletButton from "../../components/blockchain/ConnectWalletButton";
import { useSuiDashboard, fmtSui } from "../../lib/useSuiDashboard";
import { useQuery } from "@tanstack/react-query";
import { blockchainApi } from "../../api/blockchainApi";

export default function SuiWalletsPage() {
  const { data } = useSuiDashboard();
  const walletQ = useQuery({ queryKey: ["sui-linked-wallet"], queryFn: () => blockchainApi.myWallet() });

  const tokens = [
    { sym: "SUI", bal: data?.wallet?.sui_balance ?? "—", usd: "—" },
    { sym: "Escrow", bal: fmtSui(data?.wallet?.escrow_balance ?? 0), usd: "Held" },
  ];

  return (
    <section className="space-y-5">
      <article className="sui-panel">
        <p className="sui-panel__title">Platform wallet</p>
        <p className="mt-2 text-3xl font-extrabold text-white">
          {data?.wallet?.sui_balance != null ? fmtSui(data.wallet.sui_balance) : "Connect wallet"}
        </p>
        <p className="mt-1 text-sm text-white/45">Escrow held: {fmtSui(data?.wallet?.escrow_balance ?? 0)}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className="sui-btn-primary"
            onClick={() =>
              walletQ.data?.linked
                ? toast("Use your connected wallet extension to sign transfers.")
                : toast.error("Connect your Sui wallet below first.")
            }
          >
            Send
          </button>
          <button
            type="button"
            className="rounded-lg border border-white/15 px-4 py-2 text-sm font-bold text-white"
            onClick={() =>
              walletQ.data?.linked
                ? toast("Share your linked address with the payer.", { icon: "📋" })
                : toast.error("Connect your Sui wallet below first.")
            }
          >
            Receive
          </button>
          <Link to="/sui/transactions" className="rounded-lg border border-white/15 px-4 py-2 text-sm font-bold text-white hover:bg-white/5">
            History
          </Link>
        </div>
      </article>

      <article className="sui-panel">
        <p className="sui-panel__title mb-3">Connect your Sui wallet</p>
        <ConnectWalletButton />
        {walletQ.data?.linked && (
          <p className="mt-3 break-all font-mono text-xs text-cyan-300">{walletQ.data.sui_address}</p>
        )}
      </article>

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
