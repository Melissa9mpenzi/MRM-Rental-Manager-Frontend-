import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Building2, Search, MapPin, ExternalLink, DoorOpen } from "lucide-react";
import { workspaceApi } from "../../api/workspaceApi";
import PortalPageHeader from "../../components/system/PortalPageHeader";

const API_ORIGIN = import.meta.env.VITE_API_URL || "http://localhost:8000";

function photoUrl(path) {
  if (!path) return null;
  return path.startsWith("http") ? path : `${API_ORIGIN}${path}`;
}

function govStatusClass(status) {
  const s = (status || "pending").toLowerCase();
  if (s === "verified") return "bg-emerald-500/20 text-emerald-300";
  if (s === "rejected" || s === "illegal") return "bg-red-500/20 text-red-300";
  if (s === "inspection") return "bg-amber-500/20 text-amber-200";
  return "bg-white/10 text-white/55";
}

export default function SystemPropertiesPage() {
  const [search, setSearch] = useState("");
  const [district, setDistrict] = useState("");
  const [activeOnly, setActiveOnly] = useState(false);
  const [page, setPage] = useState(0);
  const limit = 25;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["workspace-admin-properties", search, district, activeOnly, page],
    queryFn: () =>
      workspaceApi.adminProperties({
        limit,
        offset: page * limit,
        ...(search.trim() ? { search: search.trim() } : {}),
        ...(district.trim() ? { district: district.trim() } : {}),
        ...(activeOnly ? { active_only: true } : {}),
      }),
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-5">
      <PortalPageHeader
        title="Properties"
        description={`${total} listing${total === 1 ? "" : "s"} on the platform — view inventory without leaving the admin portal.`}
      >
        <Link
          to="/government/kcca"
          className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-emerald-400 hover:border-emerald-500/30"
        >
          KCCA queue →
        </Link>
      </PortalPageHeader>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
          <input
            className="w-full rounded-xl border border-white/[0.1] bg-white/[0.06] py-2 pl-9 pr-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-emerald-500/40"
            placeholder="Search name, address, parish…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
          />
        </div>
        <input
          className="w-full rounded-xl border border-white/[0.1] bg-white/[0.06] px-3 py-2 text-sm text-white outline-none placeholder:text-white/35 sm:max-w-[10rem]"
          placeholder="District filter"
          value={district}
          onChange={(e) => {
            setDistrict(e.target.value);
            setPage(0);
          }}
        />
        <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-white/60">
          <input
            type="checkbox"
            checked={activeOnly}
            onChange={(e) => {
              setActiveOnly(e.target.checked);
              setPage(0);
            }}
            className="rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500/40"
          />
          Active only
        </label>
      </div>

      <div className="gov-glass overflow-hidden">
        {isLoading ? (
          <p className="p-6 text-sm text-white/45">Loading properties…</p>
        ) : isError ? (
          <p className="p-6 text-sm text-red-300">
            Could not load properties. Ensure the API is running and you are signed in as system admin.
          </p>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 p-10 text-center">
            <Building2 size={40} className="text-white/20" />
            <p className="text-sm text-white/50">No properties found. Landlords add listings from their dashboard.</p>
            <Link to="/browse-properties" className="text-sm font-semibold text-emerald-400 hover:underline">
              Browse public marketplace
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="gov-table w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Location</th>
                  <th>Landlord</th>
                  <th>Units</th>
                  <th>KCCA</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {items.map((p) => {
                  const img = photoUrl(p.photo_path);
                  return (
                    <tr key={p.id} className="border-t border-white/5">
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]">
                            {img ? (
                              <img src={img} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <Building2 size={18} className="text-emerald-400/60" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-white">{p.name}</p>
                            <p className="truncate text-[11px] text-white/40">ID #{p.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-white/70">
                        <div className="flex items-start gap-1">
                          <MapPin size={12} className="mt-0.5 shrink-0 text-white/35" />
                          <span className="line-clamp-2 text-xs">
                            {p.address}
                            {p.district ? ` · ${p.district}` : ""}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <p className="text-xs font-medium text-white/85">{p.owner_name || "—"}</p>
                        <p className="truncate text-[10px] text-white/40">{p.owner_email}</p>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1 text-xs text-white/75">
                          <DoorOpen size={12} className="text-white/40" />
                          {p.occupied_units}/{p.total_units} occ.
                        </div>
                        <p className="text-[10px] text-white/40">{p.vacant_units} vacant</p>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${govStatusClass(p.gov_verification_status)}`}
                        >
                          {p.gov_verification_status}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                            p.is_active ? "bg-emerald-500/15 text-emerald-400" : "bg-white/10 text-white/45"
                          }`}
                        >
                          {p.is_active ? "Active" : "Archived"}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right">
                        {p.listing_unit_id ? (
                          <a
                            href={`/property/${p.listing_unit_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:underline"
                          >
                            Listing <ExternalLink size={12} />
                          </a>
                        ) : (
                          <span className="text-[10px] text-white/35">No units</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {total > limit && (
        <div className="flex items-center justify-between text-xs text-white/50">
          <span>
            Page {page + 1} of {totalPages} · {total} total
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="rounded-lg border border-white/10 px-3 py-1.5 font-semibold text-white/70 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-white/10 px-3 py-1.5 font-semibold text-white/70 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
