import { useState } from "react";
import { Link } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import { CheckCircle2, Shield, Building2, Landmark, ArrowRight } from "lucide-react";
import { governmentApi } from "../../api/governmentApi";
import GovModuleHeader from "../../components/government/GovModuleHeader";
import GovStatCard from "../../components/government/GovStatCard";
import GovTablePagination from "../../components/government/GovTablePagination";

export default function GovApprovalsPage() {
  const [page, setPage] = useState(1);
  const [nira, kcca, ura] = useQueries({
    queries: [
      {
        queryKey: ["gov-nira", "pending"],
        queryFn: async () => (await governmentApi.niraQueue({ status: "pending" })).items,
      },
      { queryKey: ["gov-kcca", "pending"], queryFn: () => governmentApi.kccaProperties({ status: "pending" }) },
      {
        queryKey: ["gov-ura", "pending"],
        queryFn: async () => {
          const rows = await governmentApi.uraReports({ limit: 80 });
          return rows.filter((r) => r.tax_status !== "compliant");
        },
      },
    ],
  });

  const queues = [
    {
      agency: "NIRA",
      label: "Identity / KYC",
      count: (nira.data ?? []).length,
      to: "/government/nira",
      icon: Shield,
      tone: "border-emerald-500/40",
      rows: nira.data ?? [],
    },
    {
      agency: "KCCA",
      label: "Property validation",
      count: (kcca.data ?? []).length,
      to: "/government/kcca",
      icon: Building2,
      tone: "border-cyan-500/40",
      rows: kcca.data ?? [],
    },
    {
      agency: "URA",
      label: "Tax compliance",
      count: (ura.data ?? []).length,
      to: "/government/ura",
      icon: Landmark,
      tone: "border-amber-500/40",
      rows: ura.data ?? [],
    },
  ];

  const totalPending = queues.reduce((s, q) => s + q.count, 0);

  const unified = [
    ...(nira.data ?? []).map((r) => ({
      id: `nira-${r.user_id}`,
      agency: "NIRA",
      subject: r.full_name,
      detail: r.email || r.nin || "National ID review",
      status: r.verification_status,
      submitted: r.submitted_at,
      to: "/government/nira",
    })),
    ...(kcca.data ?? []).map((r) => ({
      id: `kcca-${r.property_id}`,
      agency: "KCCA",
      subject: r.name,
      detail: r.address,
      status: r.status,
      submitted: r.submitted_at,
      to: "/government/kcca",
    })),
    ...(ura.data ?? []).map((r) => ({
      id: `ura-${r.payment_id}`,
      agency: "URA",
      subject: r.landlord,
      detail: r.property,
      status: r.tax_status,
      submitted: r.paid_at,
      to: "/government/ura",
    })),
  ].sort((a, b) => {
    const ta = a.submitted ? Date.parse(a.submitted) : 0;
    const tb = b.submitted ? Date.parse(b.submitted) : 0;
    return ta - tb;
  });

  return (
    <div className="space-y-5">
      <GovModuleHeader
        title="Approvals"
        subtitle="Cross-agency queue — pending decisions across NIRA, KCCA, and URA."
      />

      <div className="grid gap-3 md:grid-cols-4">
        <GovStatCard
          icon={CheckCircle2}
          label="Total Pending"
          value={totalPending.toLocaleString()}
          trend="Live queue"
          tone="emerald"
          spark={[3, 4, 5, 4, 6, 5, totalPending || 7]}
        />
        {queues.map(({ agency, label, count, to, icon: Icon, tone }) => (
          <Link key={agency} to={to} className={`gov-glass block border-l-4 p-4 transition hover:bg-white/[0.04] ${tone}`}>
            <Icon size={20} className="text-white/80" />
            <p className="mt-2 text-[10px] font-bold uppercase text-emerald-400/90">{agency}</p>
            <p className="text-sm font-semibold text-white">{label}</p>
            <p className="mt-1 text-2xl font-bold text-white">{count}</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-white/45">
              Open queue <ArrowRight size={12} />
            </p>
          </Link>
        ))}
      </div>

      <div className="gov-glass gov-table-wrap">
        <table className="gov-table w-full min-w-[800px]">
          <thead>
            <tr>
              <th>Agency</th>
              <th>Subject</th>
              <th>Details</th>
              <th>Status</th>
              <th>Submitted</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {unified.length === 0 && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-white/45">
                  No pending approvals — all queues clear.
                </td>
              </tr>
            )}
            {unified.map((row) => (
              <tr key={row.id}>
                <td>
                  <span className="gov-badge gov-badge-pending">{row.agency}</span>
                </td>
                <td className="font-medium text-white">{row.subject}</td>
                <td className="max-w-xs truncate text-white/60">{row.detail}</td>
                <td>
                  <span className="gov-badge gov-badge-pending capitalize">{row.status}</span>
                </td>
                <td className="text-white/45">{row.submitted?.slice(0, 10) || "—"}</td>
                <td>
                  <Link to={row.to} className="text-xs font-semibold text-emerald-400 hover:underline">
                    Review
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <GovTablePagination page={page} totalPages={Math.max(1, Math.ceil(unified.length / 10) || 5)} onPage={setPage} />
      </div>
    </div>
  );
}
