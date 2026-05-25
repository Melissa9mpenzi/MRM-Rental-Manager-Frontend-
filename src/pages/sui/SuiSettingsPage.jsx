import { useQuery } from "@tanstack/react-query";
import { blockchainApi } from "../../api/blockchainApi";
import SuiStatusBadge from "../../components/sui/SuiStatusBadge";

export default function SuiSettingsPage() {
  const { data } = useQuery({ queryKey: ["blockchain-status"], queryFn: () => blockchainApi.status() });

  return (
    <section className="max-w-2xl space-y-4">
      <article className="sui-panel space-y-3">
        <p className="sui-panel__title">Sui configuration</p>
        <Row label="Network" value={data?.network} />
        <Row label="RPC" value={data?.rpc_url} mono />
        <Row label="Treasury" value={data?.treasury_configured ? "Configured" : "Missing SUI_TREASURY_ADDRESS"} />
        <Row label="Package ID" value={data?.package_id || "Not deployed"} mono />
        <Row label="Walrus" value={data?.walrus_configured ? "Connected" : "Optional — not set"} />
        <Row label="Fiat gateway" value={`${data?.fiat_gateway?.provider} (${data?.fiat_gateway?.mode})`} />
      </article>
      <article className="sui-panel">
        <p className="text-sm text-white/60">
          See <code className="rounded bg-black/30 px-1">docs/SUI_PAYMENTS.md</code> for devnet treasury, Move deploy, and Walrus setup.
        </p>
      </article>
    </section>
  );
}

function Row({ label, value, mono }) {
  return (
    <div className="flex justify-between gap-3 text-sm">
      <span className="text-white/45">{label}</span>
      <span className={`font-semibold text-white ${mono ? "sui-hash text-xs" : ""}`}>{value || "—"}</span>
    </div>
  );
}
