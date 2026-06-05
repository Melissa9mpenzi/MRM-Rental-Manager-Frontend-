import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Phone, Mail, Home, Calendar, Download,
         CreditCard, AlertCircle, Trash2, LogOut, Pencil, Send } from "lucide-react";
import toast from "react-hot-toast";
import { tenantsApi } from "../../api/tenantsApi.js";
import { paymentsApi } from "../../api/paymentsApi.js";
import ArrearsBadge from "../../components/domain/ArrearsBadge.jsx";
import PaymentForm from "../../components/domain/PaymentForm.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { ConfirmDialog } from "../../components/ui/index.jsx";
import { ErrorPanel } from "../../components/ui/StatePanel";
import PaymentMethodBadge from "../../components/payments/PaymentMethodBadge";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function payType(p) {
  const v = p?.payment_type;
  return typeof v === "string" ? v : v?.value ?? "";
}
function payMethod(p) {
  const v = p?.payment_method;
  return typeof v === "string" ? v : v?.value ?? "";
}

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2 text-sm">
      <Icon size={14} className="text-brand-teal mt-0.5 flex-shrink-0" />
      <div><span className="text-brand-mid">{label}: </span><span className="font-semibold text-brand-dark">{value}</span></div>
    </div>
  );
}

export default function TenantDetailPage() {
  const { id } = useParams();
  const tenantId = parseInt(id);
  const qc = useQueryClient();
  const [showPayForm, setShowPayForm] = useState(false);
  const [deletingId, setDeletingId]   = useState(null);
  const [moveOutOpen, setMoveOutOpen] = useState(false);
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editingContact, setEditingContact] = useState(false);

  const syncContactForm = (t) => {
    setEditEmail(t?.email || "");
    setEditPhone(t?.phone || "");
  };

  const { data: tenant, isLoading, isError } = useQuery({
    queryKey: ["tenant", tenantId],
    queryFn: () => tenantsApi.get(tenantId),
    enabled: !!tenantId && !Number.isNaN(tenantId),
  });

  const { data: payments = [], isError: paymentsError } = useQuery({
    queryKey: ["payments", tenantId],
    queryFn: () => paymentsApi.listForTenant(tenantId),
    enabled: !!tenantId && !Number.isNaN(tenantId),
  });

  const deleteMutation = useMutation({
    mutationFn: (pid) => paymentsApi.delete(pid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payments", tenantId] });
      qc.invalidateQueries({ queryKey: ["tenant", tenantId] });
      toast.success("Payment deleted");
      setDeletingId(null);
    },
  });

  const updateContactMutation = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      if (editEmail.trim()) fd.append("email", editEmail.trim());
      else fd.append("email", "");
      if (editPhone.trim()) fd.append("phone", editPhone.trim());
      return tenantsApi.update(tenantId, fd);
    },
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ["tenant", tenantId] });
      qc.invalidateQueries({ queryKey: ["tenants"] });
      syncContactForm(updated);
      setEditingContact(false);
      toast.success("Contact details updated.");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.detail?.message || err?.message || "Could not update tenant.");
    },
  });

  const inviteMutation = useMutation({
    mutationFn: () => {
      const email = editEmail.trim();
      if (!email) throw new Error("Enter an email before sending an invite.");
      return tenantsApi.sendPortalInvite(tenantId, email);
    },
    onSuccess: (res) => {
      const email = editEmail.trim();
      const sent = res?.data?.email_sent !== false;
      toast.success(
        sent
          ? `Portal invite emailed to ${email}. They can also accept it on the tenant dashboard after signing in.`
          : `Invite ready for ${email}. Ask them to sign in as a tenant with that email and tap Accept on the dashboard.`,
      );
    },
    onError: (err) => {
      toast.error(err?.response?.data?.detail?.message || err?.message || "Could not send invite.");
    },
  });

  const moveOutMutation = useMutation({
    mutationFn: () => tenantsApi.moveOut(tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tenant", tenantId] });
      qc.invalidateQueries({ queryKey: ["tenants"] });
      toast.success("Tenant moved out");
      setMoveOutOpen(false);
    },
  });

  useEffect(() => {
    if (tenant && !editingContact) syncContactForm(tenant);
  }, [tenant, editingContact]);

  if (isLoading) return <div className="card h-32 animate-pulse bg-brand-tealLt/30" />;
  if (isError) {
    return (
      <ErrorPanel
        title="Could not load this tenant"
        description="Check your connection and that the API is running, then try again."
      />
    );
  }
  if (!tenant)   return <div className="card text-center py-10 text-brand-mid">Tenant not found</div>;

  const balance      = parseFloat(tenant.balance_due || 0);
  const rentPaid     = payments.filter(p => payType(p) === "rent").reduce((s,p) => s + parseFloat(p.amount), 0);
  const isActive     = tenant.status === "active";

  return (
    <div className="space-y-5">
      <Link to="/landlord/tenants" className="inline-flex items-center gap-1.5 text-sm text-brand-mid hover:text-brand-teal transition-colors">
        <ArrowLeft size={14}/> All Tenants
      </Link>

      {/* Header card */}
      <div className="card">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-brand-teal flex items-center justify-center text-white font-bold text-xl">
              {(tenant.full_name || "T").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-brand-dark">{tenant.full_name}</h2>
                <ArrearsBadge months={tenant.months_in_arrears} balance={balance} />
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold
                  ${isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
                  {tenant.status}
                </span>
              </div>
              <div className="mt-1 space-y-0.5">
                <InfoRow icon={Phone}    label="Phone"    value={tenant.phone} />
                <InfoRow icon={Mail}     label="Email"    value={tenant.email} />
                <InfoRow icon={Home}     label="Unit"     value={tenant.unit_number && `${tenant.property_name} · ${tenant.unit_number}`} />
                <InfoRow icon={Calendar} label="Lease"    value={tenant.lease_start && `${tenant.lease_start} → ${tenant.lease_end || "ongoing"}`} />
              </div>
            </div>
          </div>
          {isActive && (
            <Button variant="ghost" className="text-red-500 hover:bg-red-50" onClick={() => setMoveOutOpen(true)}>
              <LogOut size={14}/> Move Out
            </Button>
          )}
        </div>
      </div>

      <div className="card">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-brand-dark flex items-center gap-2">
            <Pencil size={14} className="text-brand-teal" /> Contact & portal access
          </h3>
          {!editingContact && (
            <button
              type="button"
              className="text-xs font-bold text-brand-teal hover:underline"
              onClick={() => {
                syncContactForm(tenant);
                setEditingContact(true);
              }}
            >
              Edit email / phone
            </button>
          )}
        </div>
        <p className="mb-4 text-xs text-brand-mid">
          Portal login uses this <strong>email</strong>. After you change it, send a new invite so the tenant can link
          Pay rent to the correct address.
        </p>
        {editingContact ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-brand-mid">Email</label>
              <input
                type="email"
                className="input-field w-full"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="tenant@email.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-brand-mid">Phone</label>
              <input
                type="tel"
                className="input-field w-full"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="256700000000"
              />
            </div>
            <div className="flex flex-wrap gap-2 sm:col-span-2">
              <Button
                type="button"
                onClick={() => updateContactMutation.mutate()}
                disabled={updateContactMutation.isPending}
              >
                {updateContactMutation.isPending ? "Saving…" : "Save"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  syncContactForm(tenant);
                  setEditingContact(false);
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="inline-flex items-center gap-1.5 text-brand-teal"
                onClick={() => inviteMutation.mutate()}
                disabled={inviteMutation.isPending || !editEmail.trim()}
              >
                <Send size={14} />
                {inviteMutation.isPending ? "Sending…" : "Send portal invite"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-brand-dark">
            <p>
              <span className="text-brand-mid">Email: </span>
              {tenant.email || <span className="italic text-brand-mid">Not set — add email to enable portal</span>}
            </p>
            <p className="mt-1">
              <span className="text-brand-mid">Phone: </span>
              {tenant.phone || "—"}
            </p>
          </div>
        )}
      </div>

      {/* Balance + payment form row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Balance card */}
        <div className={`card border-2 ${balance > 0 ? "border-red-200 bg-red-50/30" : "border-emerald-200 bg-emerald-50/30"}`}>
          <h3 className="text-sm font-bold text-brand-dark mb-3">Account Balance</h3>
          <div className="space-y-2">
            {[
              { label: "Monthly rent",   value: `UGX ${parseFloat(tenant.monthly_rent).toLocaleString()}` },
              { label: "Total paid",     value: `UGX ${rentPaid.toLocaleString()}`, green: true },
              { label: "Balance due",    value: `UGX ${Math.max(0, balance).toLocaleString()}`, red: balance > 0 },
            ].map(({ label, value, green, red }) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-brand-mid">{label}</span>
                <span className={`font-bold ${green ? "text-emerald-600" : red ? "text-red-600" : "text-brand-dark"}`}>{value}</span>
              </div>
            ))}
          </div>
          {balance > 0 && (
            <div className="mt-3 flex items-center gap-2 text-xs text-red-600 bg-red-100 rounded-lg px-3 py-2">
              <AlertCircle size={13}/> {tenant.months_in_arrears} month{tenant.months_in_arrears !== 1 ? "s" : ""} in arrears
            </div>
          )}
        </div>

        {/* Payment form */}
        {isActive && (
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-brand-dark">Record Payment</h3>
              <CreditCard size={16} className="text-brand-teal" />
            </div>
            <PaymentForm tenant={tenant} onSuccess={() => setShowPayForm(false)} />
          </div>
        )}
      </div>

      {/* Payment history */}
      <div className="card">
        <h3 className="text-sm font-bold text-brand-dark mb-4">Payment History ({payments.length})</h3>
        {paymentsError ? (
          <p className="text-brand-mid text-sm text-center py-6">Could not load payment history from the server.</p>
        ) : payments.length === 0 ? (
          <p className="text-brand-mid text-sm text-center py-6">No payments recorded yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-brand-mid text-xs border-b border-brand-tealLt">
                  <th className="text-left pb-2">Date</th>
                  <th className="text-left pb-2">Period</th>
                  <th className="text-left pb-2">Type</th>
                  <th className="text-left pb-2">Method</th>
                  <th className="text-right pb-2">Amount</th>
                  <th className="text-right pb-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-tealLt/50">
                {payments.map(p => (
                  <tr key={p.id} className="hover:bg-brand-tealLt/20">
                    <td className="py-2.5 text-brand-mid">{p.payment_date}</td>
                    <td className="py-2.5 font-semibold text-brand-dark">{MONTHS[p.period_month-1]} {p.period_year}</td>
                    <td className="py-2.5 capitalize text-brand-mid">{payType(p)}</td>
                    <td className="py-2.5"><PaymentMethodBadge method={payMethod(p)} /></td>
                    <td className="py-2.5 text-right font-bold text-brand-dark">UGX {parseFloat(p.amount).toLocaleString()}</td>
                    <td className="py-2.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={paymentsApi.receiptUrl(p.id)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-brand-teal hover:text-brand-dark transition-colors"
                          title="Download receipt"
                        >
                          <Download size={14}/>
                        </a>
                        <button
                          onClick={() => setDeletingId(p.id)}
                          className="text-red-400 hover:text-red-600 transition-colors"
                          title="Delete payment"
                        >
                          <Trash2 size={14}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deletingId}
        title="Delete payment?"
        message="This will soft-delete the payment and recalculate the tenant's balance."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => deleteMutation.mutate(deletingId)}
        onCancel={() => setDeletingId(null)}
      />
      <ConfirmDialog
        open={moveOutOpen}
        title="Move out tenant?"
        message={`${tenant.full_name} will be marked as inactive and the unit freed up.`}
        confirmLabel="Move Out"
        variant="danger"
        onConfirm={() => moveOutMutation.mutate()}
        onCancel={() => setMoveOutOpen(false)}
      />
    </div>
  );
}