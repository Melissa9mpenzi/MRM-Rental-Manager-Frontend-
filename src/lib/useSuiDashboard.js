import { useQuery } from "@tanstack/react-query";
import { blockchainApi } from "../api/blockchainApi";

export function useSuiDashboard() {
  return useQuery({
    queryKey: ["sui-dashboard"],
    queryFn: () => blockchainApi.dashboard(),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function fmtSui(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return "0 SUI";
  return `${v.toLocaleString(undefined, { maximumFractionDigits: 4 })} SUI`;
}

export function shortHash(h) {
  if (!h) return "—";
  const s = String(h);
  if (s.length <= 14) return s;
  return `${s.slice(0, 8)}…${s.slice(-6)}`;
}

export function statusTone(st) {
  const s = String(st || "").toLowerCase();
  if (s.includes("success") || s === "active" || s === "anchored" || s === "released") return "success";
  if (s.includes("fail") || s === "cancelled") return "danger";
  if (s.includes("pend") || s === "processing") return "warn";
  return "neutral";
}
