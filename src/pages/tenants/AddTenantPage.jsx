import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  User, Phone, Mail, CreditCard, Calendar, FileText,
  Home, DollarSign, Shield, ArrowLeft, Upload, CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";
import { propertiesApi } from "../../api/propertiesApi";
import { tenantsApi } from "../../api/tenantsApi";
import AppPageScaffold from "../../components/layout/AppPageScaffold";

import { platformApiOrigin } from "../../api/config";

const BASE_URL = platformApiOrigin();

function FieldGroup({ title, children }) {
  return (
    <div className="card space-y-4">
      <h3 className="text-sm font-bold text-brand-dark border-b border-brand-tealLt pb-2">{title}</h3>
      {children}
    </div>
  );
}

function FormRow({ children }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>;
}

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

export default function AddTenantPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState({
    full_name: "", phone: "", email: "", national_id: "",
    emergency_contact_name: "", emergency_contact_phone: "",
    lease_start: "", lease_end: "",
    monthly_rent: "", deposit_amount: "0", deposit_paid: false,
    notes: "", unit_id: "",
  });
  const [depositFile, setDepositFile] = useState(null);

  // Load properties → units
  const { data: properties = [], isError: propertiesError } = useQuery({
    queryKey: ["properties"],
    queryFn: () => propertiesApi.list({}),
  });
  const [selectedProp, setSelectedProp] = useState("");
  const { data: units = [], isError: unitsError } = useQuery({
    queryKey: ["units", selectedProp],
    queryFn: () => propertiesApi.getUnits(selectedProp),
    enabled: !!selectedProp,
  });
  const vacantUnits = units.filter((u) => u.status === "vacant");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const mutation = useMutation({
    mutationFn: (fd) => tenantsApi.create(fd),
    onSuccess: (data) => {
      toast.success(`${data.full_name} added successfully!`);
      qc.invalidateQueries({ queryKey: ["tenants"] });
      navigate(`/landlord/tenants/${data.id}`);
    },
    onError: (err) => toast.error(err.response?.data?.detail || "Failed to add tenant."),
  });

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.full_name || !form.phone || !form.lease_start || !form.monthly_rent) {
      toast.error("Please fill in all required fields.");
      return;
    }
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v !== "" && v !== null && v !== undefined) fd.append(k, v);
    });
    if (depositFile) fd.append("deposit_receipt", depositFile);
    mutation.mutate(fd);
  }

  return (
    <AppPageScaffold
      variant="registry"
      icon={User}
      title="Add new tenant"
      description="Fill in the details below to register a new tenant."
      actions={
        <Link
          to="/landlord/tenants"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-brand-mid transition-colors hover:bg-brand-tealLt hover:text-brand-teal"
          aria-label="Back to tenants"
        >
          <ArrowLeft size={18} />
        </Link>
      }
    >
      <div className="mx-auto max-w-3xl space-y-5">
      <form onSubmit={handleSubmit} className="space-y-5">
        {propertiesError && (
          <div className="rounded-lg border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-800">
            Could not load your properties. Check the API connection and try again.
          </div>
        )}
        {selectedProp && unitsError && (
          <div className="rounded-lg border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-800">
            Could not load units for this property.
          </div>
        )}
        {/* Personal Info */}
        <FieldGroup title="Personal Information">
          <FormRow>
            <Field label="Full Name" required>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-mid" />
                <input className="input-field pl-9" placeholder="John Mukasa" required
                  value={form.full_name} onChange={(e) => set("full_name", e.target.value)} />
              </div>
            </Field>
            <Field label="Phone Number" required>
              <div className="relative">
                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-mid" />
                <input className="input-field pl-9" placeholder="+256 700 000000" required
                  value={form.phone} onChange={(e) => set("phone", e.target.value)} />
              </div>
            </Field>
          </FormRow>
          <FormRow>
            <Field label="Email Address">
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-mid" />
                <input type="email" className="input-field pl-9" placeholder="john@email.com"
                  value={form.email} onChange={(e) => set("email", e.target.value)} />
              </div>
            </Field>
            <Field label="National ID / Passport">
              <div className="relative">
                <CreditCard size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-mid" />
                <input className="input-field pl-9" placeholder="CM90000000XXXX"
                  value={form.national_id} onChange={(e) => set("national_id", e.target.value)} />
              </div>
            </Field>
          </FormRow>
        </FieldGroup>

        {/* Emergency Contact */}
        <FieldGroup title="Emergency Contact">
          <FormRow>
            <Field label="Contact Name">
              <div className="relative">
                <Shield size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-mid" />
                <input className="input-field pl-9" placeholder="Jane Nakato"
                  value={form.emergency_contact_name} onChange={(e) => set("emergency_contact_name", e.target.value)} />
              </div>
            </Field>
            <Field label="Contact Phone">
              <div className="relative">
                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-mid" />
                <input className="input-field pl-9" placeholder="+256 700 111111"
                  value={form.emergency_contact_phone} onChange={(e) => set("emergency_contact_phone", e.target.value)} />
              </div>
            </Field>
          </FormRow>
        </FieldGroup>

        {/* Unit Assignment */}
        <FieldGroup title="Unit Assignment">
          <FormRow>
            <Field label="Property">
              <div className="relative">
                <Home size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-mid" />
                <select className="input-field pl-9" value={selectedProp}
                  onChange={(e) => { setSelectedProp(e.target.value); set("unit_id", ""); }}>
                  <option value="">— Select property —</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </Field>
            <Field label="Unit">
              <select className="input-field" value={form.unit_id}
                onChange={(e) => set("unit_id", e.target.value)} disabled={!selectedProp}>
                <option value="">— Select unit —</option>
                {vacantUnits.map((u) => (
                  <option key={u.id} value={u.id}>
                    Unit {u.unit_number} — UGX {Number(u.rent_amount).toLocaleString()}
                  </option>
                ))}
                {selectedProp && vacantUnits.length === 0 && (
                  <option disabled>No vacant units</option>
                )}
              </select>
            </Field>
          </FormRow>
        </FieldGroup>

        {/* Lease Details */}
        <FieldGroup title="Lease Details">
          <FormRow>
            <Field label="Lease Start Date" required>
              <div className="relative">
                <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-mid" />
                <input type="date" className="input-field pl-9" required
                  value={form.lease_start} onChange={(e) => set("lease_start", e.target.value)} />
              </div>
            </Field>
            <Field label="Lease End Date">
              <div className="relative">
                <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-mid" />
                <input type="date" className="input-field pl-9"
                  value={form.lease_end} onChange={(e) => set("lease_end", e.target.value)} />
              </div>
            </Field>
          </FormRow>
          <FormRow>
            <Field label="Monthly Rent (UGX)" required>
              <div className="relative">
                <DollarSign size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-mid" />
                <input type="number" className="input-field pl-9" placeholder="500000" min="0" required
                  value={form.monthly_rent} onChange={(e) => set("monthly_rent", e.target.value)} />
              </div>
            </Field>
            <Field label="Deposit Amount (UGX)">
              <div className="relative">
                <DollarSign size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-mid" />
                <input type="number" className="input-field pl-9" placeholder="0" min="0"
                  value={form.deposit_amount} onChange={(e) => set("deposit_amount", e.target.value)} />
              </div>
            </Field>
          </FormRow>

          {/* Deposit paid checkbox + receipt upload */}
          <div className="flex flex-wrap gap-6 items-start">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-brand-dark">
              <input type="checkbox" className="w-4 h-4 accent-brand-teal rounded"
                checked={form.deposit_paid} onChange={(e) => set("deposit_paid", e.target.checked)} />
              Deposit already paid
            </label>
            <div className="flex-1 min-w-[240px]">
              <label className="input-label">Deposit Receipt (image/PDF)</label>
              <label className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg border-2 border-dashed text-sm font-semibold transition-colors ${depositFile ? "border-brand-teal text-brand-teal bg-brand-tealLt/30" : "border-brand-tealLt text-brand-mid hover:border-brand-teal"}`}>
                <Upload size={15} />
                {depositFile ? depositFile.name : "Choose file…"}
                <input type="file" className="hidden" accept="image/*,.pdf"
                  onChange={(e) => setDepositFile(e.target.files[0] || null)} />
              </label>
            </div>
          </div>
        </FieldGroup>

        {/* Notes */}
        <FieldGroup title="Additional Notes">
          <Field label="Notes">
            <div className="relative">
              <FileText size={15} className="absolute left-3 top-3 text-brand-mid" />
              <textarea className="input-field pl-9 min-h-[80px] resize-none" placeholder="Any additional notes about this tenant..."
                value={form.notes} onChange={(e) => set("notes", e.target.value)} />
            </div>
          </Field>
        </FieldGroup>

        {/* Submit */}
        <div className="flex items-center gap-3 justify-end pb-6">
          <Link to="/landlord/tenants" className="btn-outline">Cancel</Link>
          <button type="submit" className="btn-primary" disabled={mutation.isPending}>
            {mutation.isPending ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Saving…
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} /> Add Tenant
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
    </AppPageScaffold>
  );
}
