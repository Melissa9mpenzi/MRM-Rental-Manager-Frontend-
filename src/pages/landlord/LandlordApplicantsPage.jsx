import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ClipboardList, MessageSquare, Search, UserPlus } from "lucide-react";
import AppPageScaffold from "../../components/layout/AppPageScaffold";
import { rentalHubApi } from "../../api/rentalHubApi";
import { ErrorPanel, EmptyPanel, LoadingPanel } from "../../components/ui/StatePanel";

const STAGE_FILTERS = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "review", label: "In review" },
  { value: "archived", label: "Archived" },
];

function applicantStage(thread) {
  if (thread.archived) return "archived";
  if ((thread.unread_count || 0) > 0) return "new";
  return "review";
}

function stageLabel(stage) {
  if (stage === "new") return "New";
  if (stage === "archived") return "Archived";
  return "In review";
}

function stageClass(stage) {
  if (stage === "new") return "bg-emerald-500/15 text-emerald-400";
  if (stage === "archived") return "bg-white/10 text-white/45";
  return "bg-amber-500/15 text-amber-300";
}

export default function LandlordApplicantsPage() {
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("all");

  const { data: threads = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["landlord-applicants", search],
    queryFn: () =>
      rentalHubApi.threads({
        folder: "inbox",
        thread_type: "inquiry",
        q: search.trim() || undefined,
      }),
  });

  const rows = useMemo(() => {
    let list = threads.map((t) => ({ ...t, stage: applicantStage(t) }));
    if (stage !== "all") list = list.filter((t) => t.stage === stage);
    return list.sort((a, b) => String(b.last_at || "").localeCompare(String(a.last_at || "")));
  }, [threads, stage]);

  return (
    <AppPageScaffold
      variant="ledger"
      icon={ClipboardList}
      title="Applicants"
      description={`${rows.length} enquiry${rows.length === 1 ? "" : "ies"} from Rental Hub — review, message, and onboard tenants`}
      actions={
        <Link
          to="/landlord/messages"
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-4 py-2 text-sm font-bold text-white/80 hover:border-[#00C896]/40 hover:text-[#00C896]"
        >
          <MessageSquare size={16} /> Open Rental Hub
        </Link>
      }
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-mid" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, listing, message…"
            className="input-field w-full pl-9"
            aria-label="Search applicants"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {STAGE_FILTERS.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => setStage(o.value)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                stage === o.value
                  ? "border-brand-teal/40 bg-brand-teal/15 text-[#00C896]"
                  : "border-white/10 bg-white/[0.04] text-white/50 hover:border-white/20"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <LoadingPanel />
      ) : isError ? (
        <ErrorPanel title="Could not load applicants" onRetry={() => refetch()} />
      ) : rows.length === 0 ? (
        <EmptyPanel
          icon={ClipboardList}
          title="No applicants yet"
          description="When renters message you about a listing, enquiries appear here and in Rental Hub."
          action={
            <Link to="/landlord/messages" className="btn-primary inline-flex rounded-lg px-5 py-2 text-sm font-bold">
              Go to Rental Hub
            </Link>
          }
        />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs text-white/50">
                <th className="pb-3 pr-4 font-semibold">Applicant</th>
                <th className="pb-3 pr-4 font-semibold">Listing</th>
                <th className="pb-3 pr-4 font-semibold">Last message</th>
                <th className="pb-3 pr-4 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.08]">
              {rows.map((t) => (
                <tr key={t.id} className="transition-colors hover:bg-white/[0.04]">
                  <td className="py-3 pr-4">
                    <div className="font-semibold text-white">{t.peer?.name || "Applicant"}</div>
                    <div className="text-xs text-brand-mid">
                      Trust {t.peer?.trust_score ?? 0}
                      {t.unread_count > 0 ? ` · ${t.unread_count} unread` : ""}
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-brand-mid">
                    {t.property?.title || t.title || "—"}
                    {t.property?.unit_number ? ` · ${t.property.unit_number}` : ""}
                  </td>
                  <td className="max-w-xs py-3 pr-4 text-xs text-white/55">
                    <span className="line-clamp-2">{t.last_preview || "—"}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${stageClass(t.stage)}`}>
                      {stageLabel(t.stage)}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        to={`/landlord/messages?thread=${t.id}`}
                        className="text-xs font-bold text-[#00C896] hover:underline"
                      >
                        Message
                      </Link>
                      <Link
                        to="/landlord/tenants/new"
                        className="inline-flex items-center gap-1 text-xs font-bold text-white/60 hover:text-white"
                      >
                        <UserPlus size={12} /> Add tenant
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppPageScaffold>
  );
}
