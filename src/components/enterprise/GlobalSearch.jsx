import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, User, Building2, Wallet, Users } from "lucide-react";
import { platformApi } from "../../api/platformApi";
import useAuthStore from "../../store/authStore";
import { defaultDashboardPath } from "../../config/access";

const KIND_ICON = { user: User, property: Building2, payment: Wallet, tenant: Users };

function resultPath(kind, id, role) {
  if (kind === "property") {
    if (role === "tenant") return `/property/${id}`;
    return `/landlord/properties/${id}`;
  }
  if (kind === "payment") {
    if (role === "tenant") return `/tenant/wallet`;
    return `/landlord/payments`;
  }
  if (kind === "tenant") return `/landlord/tenants/${id}`;
  if (kind === "user") return role === "system_admin" ? `/system/users` : defaultDashboardPath(role);
  return defaultDashboardPath(role);
}

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const ref = useRef(null);
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.user?.role) || "landlord";

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 280);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const { data, isFetching } = useQuery({
    queryKey: ["global-search", debounced, role],
    queryFn: () => platformApi.search(debounced),
    enabled: debounced.length >= 2 && open,
  });

  const flat = [
    ...(data?.properties || []),
    ...(data?.tenants || []),
    ...(data?.payments || []),
    ...(data?.users || []),
  ];

  return (
    <div ref={ref} className="relative mx-2 hidden min-w-0 max-w-md flex-1 md:block">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/35" />
        <input
          type="search"
          placeholder="Search… (Ctrl+K)"
          value={q}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.06] py-2 pl-9 pr-3 text-xs text-white outline-none transition placeholder:text-white/35 focus:border-[#00C896]/40 focus:ring-1 focus:ring-[#00C896]/20"
        />
      </div>
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-white/10 bg-[#0c1218]/98 p-2 shadow-2xl backdrop-blur-xl">
          {debounced.length < 2 ? (
            <p className="px-3 py-4 text-xs text-white/45">Type at least 2 characters to search users, properties, payments…</p>
          ) : isFetching ? (
            <p className="px-3 py-4 text-xs text-white/45">Searching…</p>
          ) : flat.length === 0 ? (
            <p className="px-3 py-4 text-xs text-white/45">No results for “{debounced}”</p>
          ) : (
            flat.map((r) => {
              const Icon = KIND_ICON[r.kind] || Search;
              return (
                <button
                  key={`${r.kind}-${r.id}`}
                  type="button"
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-white/[0.06]"
                  onClick={() => {
                    navigate(resultPath(r.kind, r.id, role));
                    setOpen(false);
                    setQ("");
                  }}
                >
                  <Icon size={16} className="text-[#00C896]" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-bold text-white">{r.label}</div>
                    <div className="truncate text-[10px] text-white/45">{r.sub}</div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
