import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Users, CheckCircle2, Clock, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import { governmentApi } from "../../api/governmentApi";
import { GOVERNMENT_API_URL } from "../../api/config";
import GovModuleHeader from "../../components/government/GovModuleHeader";
import GovWorkflowBanner from "../../components/government/GovWorkflowBanner";
import GovModuleKpis from "../../components/government/GovModuleKpis";
import GovTablePagination from "../../components/government/GovTablePagination";
import WalrusProofBadge from "../../components/sui/WalrusProofBadge";
import VerifyQrBlock from "../../components/verify/VerifyQrBlock";
import { ExternalLink } from "lucide-react";

function badgeClass(status) {
  if (status === "approved") return "gov-badge gov-badge-verified";
  if (status === "rejected") return "gov-badge gov-badge-rejected";
  return "gov-badge gov-badge-pending";
}

export default function NiraDashboardPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("pending");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const { data: queueData, isLoading, isError, error } = useQuery({
    queryKey: ["gov-nira", filter, search],
    queryFn: () =>
      governmentApi.niraQueue({
        status: filter === "all" ? undefined : filter,
        search: search.trim() || undefined,
      }),
  });
  const rows = queueData?.items ?? [];
  const pendingInDatabase = queueData?.pendingInDatabase ?? 0;
  const repairedFromUploads = queueData?.repairedFromUploads ?? 0;

  const stats = useMemo(() => {
    const verified = rows.filter((r) => r.verification_status === "approved").length;
    const pending = rows.filter((r) => r.verification_status === "pending").length;
    const rejected = rows.filter((r) => r.verification_status === "rejected").length;
    return { total: rows.length, verified, pending, rejected };
  }, [rows]);

  const decide = useMutation({
    mutationFn: (body) => governmentApi.niraDecision(body),
    onSuccess: () => {
      toast.success("NIRA decision recorded");
      qc.invalidateQueries({ queryKey: ["gov-nira"] });
      qc.invalidateQueries({ queryKey: ["gov-overview"] });
    },
    onError: (e) => toast.error(e?.response?.data?.detail?.message || e.message || "Failed"),
  });

  const kpis = [
    { icon: Users, label: "Total Verifications", value: stats.total.toLocaleString(), trend: "+8.4%", tone: "emerald", spark: [4, 6, 5, 8, 7, 9, 10] },
    { icon: CheckCircle2, label: "Verified", value: stats.verified.toLocaleString(), trend: "+11.2%", tone: "cyan", spark: [3, 5, 6, 7, 8, 9, 10] },
    { icon: Clock, label: "Pending", value: stats.pending.toLocaleString(), trend: "-4.1%", tone: "purple", spark: [6, 5, 4, 5, 4, 3, 3] },
    { icon: XCircle, label: "Rejected", value: stats.rejected.toLocaleString(), trend: "+2.0%", tone: "red", spark: [1, 2, 1, 2, 2, 3, 2] },
  ];

  return (
    <div className="space-y-5">
      <GovModuleHeader
        title="NIRA — Identity Verification"
        subtitle="Compliance authority: identity verification, anti-fraud, and blacklist. You do not access payments or system configuration."
      />

      <GovWorkflowBanner highlightAgency="nira" />
      <GovModuleKpis items={kpis} />

      {isError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          Could not load the verification queue. Sign in again as a NIRA officer and ensure the API is running at{" "}
          <span className="font-mono text-xs">{GOVERNMENT_API_URL}</span>.
          {error?.message ? ` (${error.message})` : ""}
        </div>
      )}

      <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/60">
        <p>
          API: <span className="font-mono text-xs text-white/80">{GOVERNMENT_API_URL}</span>
          {queueData?.environment ? ` · ${queueData.environment}` : ""}
          {pendingInDatabase > 0 ? (
            <>
              {" "}
              · <strong className="text-emerald-300">{pendingInDatabase} pending</strong> in this database
            </>
          ) : null}
          {repairedFromUploads > 0 ? (
            <> · synced {repairedFromUploads} submission(s) from uploaded documents</>
          ) : null}
        </p>
        <p className="mt-2">
          Landlords only appear here after they <strong className="text-white/80">finish KYC upload</strong> (dashboard
          must say “Verification in progress”, not “Submit KYC”). Queue order: oldest first. Search by email if needed.
        </p>
      </div>

      <form
        className="flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setSearch(searchInput);
          setPage(1);
        }}
      >
        <input
          type="search"
          placeholder="Search by email or name…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="min-w-[220px] flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
        />
        <button
          type="submit"
          className="rounded-lg bg-emerald-600/90 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-600"
        >
          Search
        </button>
        {search ? (
          <button
            type="button"
            className="rounded-lg border border-white/15 px-3 py-2 text-xs text-white/70 hover:bg-white/10"
            onClick={() => {
              setSearch("");
              setSearchInput("");
              setPage(1);
            }}
          >
            Clear
          </button>
        ) : null}
      </form>

      <div className="flex flex-wrap gap-2">
        {["pending", "approved", "rejected", "all"].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setFilter(s);
              setPage(1);
            }}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize ${
              filter === s ? "bg-emerald-500/20 text-emerald-300" : "bg-white/5 text-white/55 hover:bg-white/10"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="gov-glass gov-table-wrap">
        <table className="gov-table w-full min-w-[880px]">
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>NIN</th>
              <th>Status</th>
              <th>Biometric</th>
              <th>Submitted</th>
              <th>Walrus</th>
              <th>Compliance QR</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={10} className="py-10 text-center text-white/45">
                  Loading…
                </td>
              </tr>
            )}
            {!isLoading && rows.length === 0 && (
              <tr>
                <td colSpan={10} className="py-10 text-center text-white/45">
                  No records in this queue. Confirm the landlord submitted KYC and you are on the same backend as
                  their login.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.user_id}>
                <td className="font-medium text-white">{r.full_name}</td>
                <td className="max-w-[180px] truncate text-xs text-white/55">{r.email || "—"}</td>
                <td className="text-xs capitalize text-white/70">{r.role?.replace("staff", "agent") || "—"}</td>
                <td className="font-mono text-xs text-white/70">{r.nin || "—"}</td>
                <td>
                  <span className={badgeClass(r.verification_status)}>{r.verification_status}</span>
                </td>
                <td className="text-white/80">
                  {r.face_match_pct != null ? `${r.face_match_pct}%` : "—"}
                </td>
                <td className="text-white/45">{r.submitted_at?.slice(0, 10) || "—"}</td>
                <td>
                  <WalrusProofBadge
                    blobId={r.walrus_blob_id}
                    contentHash={r.content_hash || r.kyc_manifest_hash}
                    url={r.walrus_url}
                    walrusLive={r.walrus_live}
                    storageType={r.storage_type}
                    label="KYC"
                  />
                </td>
                <td className="align-top">
                  {r.verification_status === "approved" && r.compliance_verify_token ? (
                    <div className="flex flex-col items-start gap-1">
                      <VerifyQrBlock
                        token={r.compliance_verify_token}
                        label="NIRA verified"
                        size={72}
                      />
                      {r.verification_url ? (
                        <a
                          href={r.verification_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-0.5 text-[9px] font-bold text-cyan-300 hover:text-white"
                        >
                          Open verify page <ExternalLink size={10} />
                        </a>
                      ) : null}
                    </div>
                  ) : (
                    <span className="text-[10px] text-white/35" title="Issued when NIRA approves KYC">
                      {r.verification_status === "approved" ? "Generating…" : "After approval"}
                    </span>
                  )}
                </td>
                <td>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      disabled={decide.isPending}
                      onClick={() => decide.mutate({ user_id: r.user_id, decision: "approved" })}
                      className="rounded-lg bg-emerald-600/90 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-emerald-600"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={decide.isPending}
                      onClick={() => decide.mutate({ user_id: r.user_id, decision: "rejected" })}
                      className="rounded-lg bg-red-600/90 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-red-600"
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <GovTablePagination page={page} totalPages={Math.max(1, Math.ceil((rows.length || 1) / 10))} onPage={setPage} />
      </div>
    </div>
  );
}
