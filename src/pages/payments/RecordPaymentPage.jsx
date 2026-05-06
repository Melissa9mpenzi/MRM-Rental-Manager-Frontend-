import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft, DollarSign, Calendar, CreditCard,
  FileText, Upload, CheckCircle2, User, Hash,
} from "lucide-react";
import toast from "react-hot-toast";
import { paymentsApi } from "../../api/paymentsApi";
import { tenantsApi } from "../../api/tenantsApi";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - 2 + i);
const METHODS = [
  { value: "mtn_momo",  label: "MTN MoMo" },
  { value: "airtel",   label: "Airtel Money" },
  { value: "cash",     label: "Cash" },
  { value: "bank",     label: "Bank Transfer" },
  { value: "other",    label: "Other" },
];
const TYPES = [
  { value: "rent",    label: "Rent" },
  { value: "deposit", label: "Deposit" },
  { value: "penalty", label: "Penalty / Fine" },
  { value: "other",   label: "Other" },
];

function Field({ label, required, children }) {
  return (
    <div>
      <label className="input-label">
        {label}{required && <span className="text-brand-teal ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

export default function RecordPaymentPage() {
  const navigate  = useNavigate();
  const qc        = useQueryClient();
  const today     = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    tenant_id:      "",
    amount:         "",
    payment_type:   "rent",
    payment_method: "cash",
    reference:      "",
    period_month:   new Date().getMonth() + 1,
    period_year:    CURRENT_YEAR,
    payment_date:   today,
    notes:          "",
  });
  const [proofFile, setProofFile]   = useState(null);
  const [createdId, setCreatedId]   = useState(null);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const { data: tenants = [], isLoading: tenantsLoading } = useQuery({
    queryKey: ["tenants"],
    queryFn:  () => tenantsApi.list({ status: "active" }),
  });

  const mutation = useMutation({
    mutationFn: (data) => paymentsApi.create(data),
    onSuccess: async (data) => {
      toast.success("Payment recorded!");
      setCreatedId(data.id);
      qc.invalidateQueries({ queryKey: ["all-payments"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });

      // Upload proof if selected
      if (proofFile) {
        try {
          const fd = new FormData();
          fd.append("file", proofFile);
          await paymentsApi.uploadProof(data.id, fd);
          toast.success("Proof of payment uploaded!");
        } catch {
          toast.error("Payment saved but proof upload failed.");
        }
      }
    },
    onError: (err) => toast.error(err.response?.data?.detail || "Failed to record payment."),
  });

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.tenant_id || !form.amount || !form.payment_date) {
      toast.error("Please fill in all required fields.");
      return;
    }
    mutation.mutate({
      tenant_id:      Number(form.tenant_id),
      amount:         Number(form.amount),
      payment_type:   form.payment_type,
      payment_method: form.payment_method,
      reference:      form.reference || null,
      period_month:   Number(form.period_month),
      period_year:    Number(form.period_year),
      payment_date:   form.payment_date,
      notes:          form.notes || null,
    });
  }

  const selectedTenant = tenants.find((t) => String(t.id) === String(form.tenant_id));

  // ── Success State ──────────────────────────────────────────────────
  if (createdId) {
    return (
      <div className="max-w-md mx-auto mt-12">
        <div className="card text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-brand-tealLt flex items-center justify-center mx-auto">
            <CheckCircle2 size={32} className="text-brand-teal" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-brand-dark">Payment Recorded!</h2>
            <p className="text-brand-mid text-sm mt-1">The payment has been saved successfully.</p>
          </div>
          <div className="flex flex-col gap-2">
            <a
              href={paymentsApi.receiptUrl(createdId)}
              target="_blank"
              rel="noreferrer"
              className="btn-primary"
            >
              <FileText size={16} /> Download Receipt PDF
            </a>
            <button
              className="btn-outline"
              onClick={() => { setCreatedId(null); setForm({ ...form, reference: "", notes: "", amount: "" }); setProofFile(null); }}
            >
              Record Another Payment
            </button>
            <Link to="/payments" className="btn-ghost">View All Payments</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/payments" className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-brand-tealLt text-brand-mid hover:text-brand-teal transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-brand-dark">Record Payment</h2>
          <p className="text-sm text-brand-mid">Log a rent or deposit payment</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Tenant + Amount */}
        <div className="card space-y-4">
          <h3 className="text-sm font-bold text-brand-dark border-b border-brand-tealLt pb-2">Payment Details</h3>

          <Field label="Tenant" required>
            <div className="relative">
              <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-mid" />
              <select className="input-field pl-9" required value={form.tenant_id}
                onChange={(e) => set("tenant_id", e.target.value)}>
                <option value="">— Select tenant —</option>
                {tenantsLoading
                  ? <option disabled>Loading…</option>
                  : tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.full_name} {t.unit_number ? `· Unit ${t.unit_number}` : ""}
                    </option>
                  ))
                }
              </select>
            </div>
            {selectedTenant && (
              <div className="mt-1.5 text-xs text-brand-mid bg-brand-tealLt/40 rounded-lg px-3 py-2">
                Monthly rent: <strong className="text-brand-dark">UGX {Number(selectedTenant.monthly_rent).toLocaleString()}</strong>
                {selectedTenant.balance > 0 && (
                  <span className="ml-3 text-red-600 font-semibold">
                    Arrears: UGX {Number(selectedTenant.balance).toLocaleString()}
                  </span>
                )}
              </div>
            )}
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Amount (UGX)" required>
              <div className="relative">
                <DollarSign size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-mid" />
                <input type="number" className="input-field pl-9" placeholder="500000" min="1" required
                  value={form.amount} onChange={(e) => set("amount", e.target.value)} />
              </div>
            </Field>
            <Field label="Payment Type" required>
              <select className="input-field" value={form.payment_type}
                onChange={(e) => set("payment_type", e.target.value)}>
                {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Payment Method" required>
              <div className="relative">
                <CreditCard size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-mid" />
                <select className="input-field pl-9" value={form.payment_method}
                  onChange={(e) => set("payment_method", e.target.value)}>
                  {METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
            </Field>
            <Field label="Reference / Transaction ID">
              <div className="relative">
                <Hash size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-mid" />
                <input className="input-field pl-9" placeholder="e.g. MoMo TXN123456"
                  value={form.reference} onChange={(e) => set("reference", e.target.value)} />
              </div>
            </Field>
          </div>
        </div>

        {/* Period + Date */}
        <div className="card space-y-4">
          <h3 className="text-sm font-bold text-brand-dark border-b border-brand-tealLt pb-2">Period & Date</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Month" required>
              <select className="input-field" value={form.period_month}
                onChange={(e) => set("period_month", e.target.value)}>
                {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
            </Field>
            <Field label="Year" required>
              <select className="input-field" value={form.period_year}
                onChange={(e) => set("period_year", e.target.value)}>
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </Field>
            <Field label="Payment Date" required>
              <div className="relative">
                <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-mid" />
                <input type="date" className="input-field pl-9" required
                  value={form.payment_date} onChange={(e) => set("payment_date", e.target.value)} />
              </div>
            </Field>
          </div>
        </div>

        {/* Proof of Payment */}
        <div className="card space-y-3">
          <h3 className="text-sm font-bold text-brand-dark border-b border-brand-tealLt pb-2">
            Proof of Payment <span className="text-brand-mid font-normal">(optional)</span>
          </h3>
          <p className="text-xs text-brand-mid">Upload the tenant's payment proof — screenshot, MoMo confirmation, or bank slip.</p>
          <label className={`flex items-center gap-3 cursor-pointer px-4 py-3 rounded-xl border-2 border-dashed transition-colors ${proofFile ? "border-brand-teal bg-brand-tealLt/20 text-brand-teal" : "border-brand-tealLt text-brand-mid hover:border-brand-teal"}`}>
            <Upload size={18} className="flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold">
                {proofFile ? proofFile.name : "Click to upload proof of payment"}
              </div>
              <div className="text-xs opacity-60">JPEG, PNG, WebP, PDF — max 10MB</div>
            </div>
            <input type="file" className="hidden" accept="image/*,.pdf"
              onChange={(e) => setProofFile(e.target.files[0] || null)} />
          </label>
        </div>

        {/* Notes */}
        <div className="card">
          <Field label="Notes">
            <div className="relative">
              <FileText size={15} className="absolute left-3 top-3 text-brand-mid" />
              <textarea className="input-field pl-9 resize-none min-h-[72px]"
                placeholder="Additional notes..."
                value={form.notes} onChange={(e) => set("notes", e.target.value)} />
            </div>
          </Field>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3 justify-end pb-6">
          <Link to="/payments" className="btn-outline">Cancel</Link>
          <button type="submit" className="btn-primary" disabled={mutation.isPending}>
            {mutation.isPending ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Saving…
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} /> Record Payment
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
