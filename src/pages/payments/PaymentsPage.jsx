import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  CreditCard, Download, Plus, Search,
  Filter, FileText, Upload,
} from "lucide-react";
import { paymentsApi } from "../../api/paymentsApi";
import AppPageScaffold from "../../components/layout/AppPageScaffold";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const METHOD_LABELS = {
  mtn_momo: "MTN MoMo", airtel: "Airtel", cash: "Cash",
  bank: "Bank", other: "Other",
};
const METHOD_COLORS = {
  mtn_momo: "bg-yellow-500/15 text-yellow-200 ring-1 ring-yellow-500/25",
  airtel:   "bg-red-500/12 text-red-200 ring-1 ring-red-500/25",
  cash:     "bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-500/25",
  bank:     "bg-sky-500/15 text-sky-200 ring-1 ring-sky-500/25",
  other:    "bg-white/10 text-white/60 ring-1 ring-white/15",
};
const TYPE_COLORS = {
  rent:    "bg-brand-tealLt text-brand-teal ring-1 ring-brand-teal/30",
  deposit: "bg-violet-500/15 text-violet-200 ring-1 ring-violet-500/25",
  penalty: "bg-red-500/12 text-red-200 ring-1 ring-red-500/25",
  other:   "bg-white/10 text-white/60 ring-1 ring-white/15",
};

function MethodBadge({ method }) {
  const m = typeof method === "string" ? method : method?.value ?? "";
  const color = METHOD_COLORS[m] || "bg-white/10 text-white/60 ring-1 ring-white/15";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>
      {METHOD_LABELS[m] || m}
    </span>
  );
}

function TypeBadge({ type }) {
  const t = typeof type === "string" ? type : type?.value ?? "";
  const color = TYPE_COLORS[t] || "bg-white/10 text-white/60 ring-1 ring-white/15";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${color}`}>
      {t}
    </span>
  );
}

export default function PaymentsPage() {
  const [search, setSearch]       = useState("");
  const [filterMethod, setMethod] = useState("");

  const { data: payments = [], isLoading, isError } = useQuery({
    queryKey: ["all-payments"],
    queryFn: () => paymentsApi.list({ limit: 500 }),
  });

  // Client-side filter
  const payMethod = (p) =>
    typeof p.payment_method === "string" ? p.payment_method : p.payment_method?.value ?? "";
  const filtered = payments.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.tenant_name?.toLowerCase().includes(q) || p.property_name?.toLowerCase().includes(q) || p.unit_number?.toLowerCase().includes(q);
    const matchMethod = !filterMethod || payMethod(p) === filterMethod;
    return matchSearch && matchMethod;
  });

  const total = filtered.reduce((s, p) => s + parseFloat(p.amount), 0);

  return (
    <AppPageScaffold
      variant="ledger"
      icon={CreditCard}
      title="Payments"
      description={`${filtered.length} records · Total UGX ${total.toLocaleString()}`}
      actions={
        <Link to="/landlord/payments/new" className="btn-primary">
          <Plus size={16} /> Record Payment
        </Link>
      }
    >

      {/* Filter bar */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-mid" />
          <input
            className="input-field pl-9 text-sm"
            placeholder="Search tenant, property…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-mid pointer-events-none" />
          <select
            className="input-field pl-9 pr-3 text-sm"
            value={filterMethod}
            onChange={(e) => setMethod(e.target.value)}
          >
            <option value="">All methods</option>
            <option value="mtn_momo">MTN MoMo</option>
            <option value="airtel">Airtel</option>
            <option value="cash">Cash</option>
            <option value="bank">Bank</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="card h-48 animate-pulse bg-brand-tealLt/30" />
      ) : isError ? (
        <div className="card py-12 text-center">
          <p className="font-bold text-brand-dark">Could not load payments</p>
          <p className="mt-1 text-sm text-brand-mid">Check your API connection and try again.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16 space-y-3">
          <div className="w-14 h-14 rounded-full bg-brand-tealLt flex items-center justify-center mx-auto">
            <CreditCard size={24} className="text-brand-teal" />
          </div>
          <p className="font-bold text-brand-dark">No payments found</p>
          <p className="text-brand-mid text-sm">
            {search || filterMethod ? "Try adjusting your filters." : "Record your first payment to get started."}
          </p>
          {!search && !filterMethod && (
            <Link to="/landlord/payments/new" className="btn-primary mx-auto">
              <Plus size={15} /> Record Payment
            </Link>
          )}
        </div>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-brand-mid text-xs border-b border-brand-tealLt">
                <th className="text-left px-5 py-3 font-semibold">Tenant</th>
                <th className="text-left px-3 py-3 font-semibold">Property · Unit</th>
                <th className="text-left px-3 py-3 font-semibold">Date</th>
                <th className="text-left px-3 py-3 font-semibold">Period</th>
                <th className="text-left px-3 py-3 font-semibold">Method</th>
                <th className="text-left px-3 py-3 font-semibold">Type</th>
                <th className="text-right px-3 py-3 font-semibold">Amount</th>
                <th className="text-right px-5 py-3 font-semibold">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-tealLt/40">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-brand-tealLt/10 transition-colors group">
                  <td className="px-5 py-3">
                    <Link
                      to={`/landlord/tenants/${p.tenant_id}`}
                      className="font-semibold text-brand-dark hover:text-brand-teal transition-colors"
                    >
                      {p.tenant_name}
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-brand-mid text-xs">
                    {p.property_name && <span>{p.property_name}</span>}
                    {p.unit_number && <span className="ml-1">· {p.unit_number}</span>}
                  </td>
                  <td className="px-3 py-3 text-brand-mid text-xs whitespace-nowrap">{p.payment_date}</td>
                  <td className="px-3 py-3 font-semibold text-brand-dark text-xs whitespace-nowrap">
                    {MONTHS[(p.period_month || 1) - 1]} {p.period_year}
                  </td>
                  <td className="px-3 py-3"><MethodBadge method={p.payment_method} /></td>
                  <td className="px-3 py-3"><TypeBadge type={p.payment_type} /></td>
                  <td className="px-3 py-3 text-right font-bold text-brand-dark whitespace-nowrap">
                    UGX {parseFloat(p.amount).toLocaleString()}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <a
                      href={paymentsApi.receiptUrl(p.id)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-brand-teal transition-colors hover:text-white"
                    >
                      <Download size={13} /> PDF
                    </a>
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