import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
  CreditCard,
  Heart,
  MessageSquare,
  Bell,
  MapPin,
  Sparkles,
} from "lucide-react";
import useAuthStore from "../../store/authStore";
import { useSavedListingsStore } from "../../store/savedListingsStore";
import { PUBLIC_LISTINGS } from "../../data/publicListings";
import { tenantPortalApi } from "../../api/tenantPortalApi";
import { notificationsApi } from "../../api/notificationsApi";
import PlatformDistributionHint from "../../components/layout/PlatformDistributionHint";
import AppPageScaffold from "../../components/layout/AppPageScaffold";

const RECOMMENDED = PUBLIC_LISTINGS.slice(0, 6);

const FALLBACK_LEASE_IMAGE =
  PUBLIC_LISTINGS.find((l) => /ntinda/i.test(l.title) || /ntinda/i.test(l.address))?.image ??
  PUBLIC_LISTINGS[0]?.image ??
  "/images/hero-villa.jpg";

function fmtPaidYtd(n) {
  const v = Number(n) || 0;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${Math.round(v / 1_000)}K`;
  return String(Math.round(v));
}

export default function TenantDashboardRd() {
  const user = useAuthStore((s) => s.user);
  const hydrate = useSavedListingsStore((s) => s.hydrate);
  const savedCount = useSavedListingsStore((s) => s.ids.length);

  useEffect(() => {
    if (user?.role === "tenant" && user?.id != null) hydrate(user.id);
  }, [user?.id, user?.role, hydrate]);

  const leaseQuery = useQuery({
    queryKey: ["tenant-my-lease"],
    queryFn: () => tenantPortalApi.myLease(),
    enabled: user?.role === "tenant",
    retry: false,
  });

  const paymentsQuery = useQuery({
    queryKey: ["tenant-my-payments"],
    queryFn: () => tenantPortalApi.myPayments(),
    enabled: user?.role === "tenant",
    retry: false,
  });

  const unreadQuery = useQuery({
    queryKey: ["notif-count"],
    queryFn: () => notificationsApi.unreadCount(),
    enabled: user?.role === "tenant",
    retry: false,
  });

  const leasePayload = leaseQuery.data;
  const lease = leasePayload?.lease;
  const property = leasePayload?.property;
  const unit = leasePayload?.unit;

  const noTenantProfile =
    leaseQuery.isError && leaseQuery.error?.response?.status === 404;

  const ytdTotal = useMemo(() => {
    const y = new Date().getFullYear();
    const rows = Array.isArray(paymentsQuery.data) ? paymentsQuery.data : [];
    return rows.reduce((sum, p) => {
      if (!p?.payment_date) return sum;
      const d = new Date(p.payment_date);
      if (d.getFullYear() !== y) return sum;
      return sum + Number(p.amount || 0);
    }, 0);
  }, [paymentsQuery.data]);

  const activityRows = useMemo(() => {
    const rows = Array.isArray(paymentsQuery.data) ? paymentsQuery.data : [];
    return rows.slice(0, 5).map((p) => {
      const d = p.payment_date ? new Date(p.payment_date) : null;
      const t =
        d && !Number.isNaN(d.getTime())
          ? formatDistanceToNow(d, { addSuffix: true })
          : "";
      const label = p.property_name
        ? `Payment — ${p.property_name}`
        : `Payment (${p.payment_type || "rent"})`;
      const body = `UGX ${Number(p.amount || 0).toLocaleString()} · ${p.payment_method || "recorded"}`;
      return { t, title: label, body, ok: true };
    });
  }, [paymentsQuery.data]);

  const unread = unreadQuery.data ?? 0;

  const stats = [
    {
      icon: Sparkles,
      label: "Applications",
      value: "0",
      sub: "None yet",
      to: "/tenant/applications",
    },
    {
      icon: Heart,
      label: "Saved",
      value: String(savedCount),
      sub: "This device",
      to: "/tenant/saved",
    },
    {
      icon: CreditCard,
      label: "Total paid",
      value: paymentsQuery.isLoading ? "…" : fmtPaidYtd(ytdTotal),
      sub: "UGX (YTD)",
      to: "/tenant/wallet",
    },
    {
      icon: Bell,
      label: "Unread",
      value: unreadQuery.isLoading ? "…" : String(unread),
      sub: "Notifications",
      to: "/tenant/notifications",
    },
  ];

  return (
    <AppPageScaffold variant="dashboard" hideHeader>
      <PlatformDistributionHint role={user?.role} />

      <div>
        <h2 className="text-xl font-bold text-white">Tenant hub</h2>
        <p className="mt-0.5 text-sm text-white/55">Welcome back, {user?.full_name?.split(" ")[0]}</p>
      </div>

      <Link
        to="/tenant/saved"
        className="flex items-start gap-3 rounded-xl border border-brand-teal/25 bg-brand-teal/5 px-4 py-3 text-sm leading-snug text-white/75 transition hover:bg-brand-teal/10"
      >
        <Heart className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-teal" />
        <span>
          <span className="font-bold text-white">Save listings:</span> use the heart on search cards or{" "}
          <span className="font-semibold text-white">Save listing</span> on a property page — then open{" "}
          <span className="font-semibold text-brand-teal">Saved properties</span> in the sidebar to compare and message landlords.
        </span>
      </Link>

      <div className="card-glass overflow-hidden border-white/[0.12]">
        <div className="grid gap-6 md:grid-cols-[1.1fr_1fr]">
          <div className="relative h-44 overflow-hidden rounded-xl bg-[#0d1520] md:h-auto md:min-h-[200px]">
            <img
              src={FALLBACK_LEASE_IMAGE}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10" />
            <div className="absolute bottom-3 left-3 rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
              {lease ? "Active lease" : "Lease"}
            </div>
          </div>
          <div className="flex flex-col justify-center py-2">
            {leaseQuery.isLoading ? (
              <p className="text-sm text-white/50">Loading lease…</p>
            ) : noTenantProfile ? (
              <>
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#00C896]">Current lease</p>
                <h3 className="mt-1 text-lg font-bold text-white">No tenant profile linked</h3>
                <p className="mt-2 text-sm text-white/50">
                  Ask your landlord to send an invite, or accept one from your email. Then sign in again.
                </p>
                <Link
                  to="/tenant/accept-invite"
                  className="mt-4 inline-flex w-fit items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-sm font-bold text-white/85 transition hover:bg-white/10"
                >
                  Accept invite
                </Link>
              </>
            ) : !lease ? (
              <>
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#00C896]">Current lease</p>
                <h3 className="mt-1 text-lg font-bold text-white">No active lease on file</h3>
                <p className="mt-2 text-sm text-white/50">
                  When your landlord activates a lease for your account, rent and history will show here.
                </p>
                <Link
                  to="/browse-properties"
                  className="mt-4 inline-flex w-fit items-center gap-2 rounded-xl bg-[#00C896] px-5 py-2.5 text-sm font-bold text-[#041208] shadow-glow transition hover:brightness-110"
                >
                  Browse listings
                </Link>
              </>
            ) : (
              <>
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#00C896]">Current lease</p>
                <h3 className="mt-1 text-lg font-bold text-white">
                  {property?.name ?? "Your unit"}
                  {unit?.unit_number ? ` · Unit ${unit.unit_number}` : ""}
                </h3>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-white/50">
                  <MapPin size={14} className="text-[#00C896]" />
                  {property?.address ?? "Address on file"}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <div>
                    <div className="text-xs text-white/45">Monthly rent</div>
                    <div className="text-xl font-extrabold text-white">
                      UGX {Number(lease.monthly_rent || 0).toLocaleString()}
                    </div>
                  </div>
                  <Link
                    to="/tenant/pay"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#00C896] px-5 py-2.5 text-sm font-bold text-[#041208] shadow-glow transition hover:brightness-110"
                  >
                    <CreditCard size={16} /> Pay rent
                  </Link>
                  <Link to="/tenant/contract" className="text-sm font-semibold text-white/60 hover:text-[#00C896]">
                    View contract →
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map(({ icon: Icon, label, value, sub, to }) => (
          <Link key={label} to={to} className="stat-card block text-inherit no-underline">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#00C896]/15 text-[#00C896]">
              <Icon size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-2xl font-extrabold text-white">{value}</div>
              <div className="text-xs font-semibold text-white/45">{label}</div>
              <div className="text-[11px] text-white/35">{sub}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card-glass">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Recommended for you</h3>
            <Link to="/browse-properties" className="text-xs font-semibold text-[#00C896] hover:underline">
              Browse all
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {RECOMMENDED.map((l) => (
              <Link
                key={l.id}
                to={`/property/${l.id}`}
                className="w-[200px] flex-shrink-0 overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.04] transition hover:border-[#00C896]/35"
              >
                <div className="relative h-28 overflow-hidden bg-[#0d1520]">
                  <img src={l.image} alt="" className="h-full w-full object-cover" />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                </div>
                <div className="p-3">
                  <div className="line-clamp-1 text-sm font-bold text-white">{l.title}</div>
                  <div className="mt-0.5 line-clamp-1 text-xs text-white/45">{l.address}</div>
                  <div className="mt-2 text-sm font-extrabold text-[#00C896]">
                    UGX {l.price.toLocaleString()}
                    <span className="text-xs font-semibold text-white/40">/mo</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="card-glass">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Recent activity</h3>
            <Link to="/tenant/wallet" className="text-xs font-semibold text-[#00C896] hover:underline">
              Payment history
            </Link>
          </div>
          <div className="space-y-3">
            {paymentsQuery.isLoading ? (
              <p className="px-3 py-2 text-sm text-white/45">Loading…</p>
            ) : activityRows.length === 0 ? (
              <p className="px-3 py-2 text-sm text-white/45">No payments recorded yet for your account.</p>
            ) : (
              activityRows.map((a, i) => (
                <div
                  key={i}
                  className="flex gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5"
                >
                  <MessageSquare size={16} className={`mt-0.5 flex-shrink-0 ${a.ok ? "text-[#00C896]" : "text-sky-400"}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-white">{a.title}</span>
                      <span className="text-[10px] text-white/35">{a.t}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-white/50">{a.body}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AppPageScaffold>
  );
}
