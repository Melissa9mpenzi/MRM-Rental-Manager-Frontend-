import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, X, FileText } from "lucide-react";
import toast from "react-hot-toast";
import { propertiesApi } from "../../api/propertiesApi";
import { tenantsApi } from "../../api/tenantsApi";
import { Modal } from "../ui/index.jsx";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

export default function AddTenantModal({ open, onClose }) {
  const qc = useQueryClient();
  const [step, setStep] = useState(1);
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [receiptFile, setReceiptFile] = useState(null);
  const [form, setForm] = useState({
    unit_id: "",
    full_name: "",
    phone: "",
    email: "",
    national_id: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    lease_start: "",
    lease_end: "",
    monthly_rent: "",
    deposit_amount: "",
    deposit_paid: false,
    notes: "",
  });

  // Load all properties
  const { data: properties = [], isError: propertiesError } = useQuery({
    queryKey: ["properties"],
    queryFn: () => propertiesApi.list({ include_archived: false }),
    enabled: open,
  });

  // Load units when property selected
  const { data: propertyDetail, isError: propertyDetailError } = useQuery({
    queryKey: ["property", selectedPropertyId],
    queryFn: () => propertiesApi.get(Number(selectedPropertyId)),
    enabled: !!selectedPropertyId,
  });

  const vacantUnits = propertyDetail?.units?.filter((u) => u.status === "vacant") || [];

  // Auto-fill rent when unit selected
  useEffect(() => {
    if (!form.unit_id) return;
    const unit = vacantUnits.find((u) => String(u.id) === String(form.unit_id));
    if (unit) setForm((f) => ({ ...f, monthly_rent: String(unit.rent_amount) }));
  }, [form.unit_id]);

  const mutation = useMutation({
    mutationFn: (fd) => tenantsApi.create(fd),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tenants"] });
      qc.invalidateQueries({ queryKey: ["property", selectedPropertyId] });
      qc.invalidateQueries({ queryKey: ["properties"] });
      toast.success("Tenant added successfully!");
      handleClose();
    },
    onError: (err) => toast.error(err.response?.data?.detail || "Failed to add tenant."),
  });

  function handleClose() {
    setStep(1);
    setSelectedPropertyId("");
    setReceiptFile(null);
    setForm({
      unit_id: "", full_name: "", phone: "", email: "", national_id: "",
      emergency_contact_name: "", emergency_contact_phone: "",
      lease_start: "", lease_end: "", monthly_rent: "",
      deposit_amount: "", deposit_paid: false, notes: "",
    });
    onClose();
  }

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit() {
    if (!form.full_name || !form.phone || !form.lease_start || !form.monthly_rent) {
      toast.error("Please fill in all required fields.");
      return;
    }
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v !== "" && v !== null && v !== undefined) fd.append(k, v);
    });
    if (receiptFile) fd.append("deposit_receipt", receiptFile);
    mutation.mutate(fd);
  }

  const inputClass = "input-field rounded-lg";
  const labelClass = "input-label";

  return (
    <Modal open={open} onClose={handleClose} title="Add New Tenant">
      <div className="space-y-4">

        {/* Step 1 — Property & Unit */}
        <div className="bg-brand-bg rounded-xl p-4 space-y-3">
          <p className="text-xs font-bold text-brand-teal uppercase tracking-wide">1. Property & Unit</p>
          {propertiesError && (
            <p className="text-xs text-red-400">Could not load properties from the server.</p>
          )}
          {selectedPropertyId && propertyDetailError && (
            <p className="text-xs text-red-400">Could not load units for this property.</p>
          )}

          <div>
            <label className={labelClass}>Property</label>
            <select
              className={inputClass}
              value={selectedPropertyId}
              onChange={(e) => {
                setSelectedPropertyId(e.target.value);
                set("unit_id", "");
              }}
            >
              <option value="">— Select property —</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Unit {!selectedPropertyId && <span className="text-white/40">(select property first)</span>}</label>
            <select
              className={inputClass}
              value={form.unit_id}
              onChange={(e) => set("unit_id", e.target.value)}
              disabled={!selectedPropertyId}
            >
              <option value="">— Select unit —</option>
              {vacantUnits.length === 0 && selectedPropertyId && (
                <option disabled>No vacant units available</option>
              )}
              {vacantUnits.map((u) => (
                <option key={u.id} value={u.id}>
                  Unit {u.unit_number} — UGX {Number(u.rent_amount).toLocaleString("en-UG")}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Step 2 — Tenant Details */}
        <div className="bg-brand-bg rounded-xl p-4 space-y-3">
          <p className="text-xs font-bold text-brand-teal uppercase tracking-wide">2. Tenant Details</p>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className={labelClass}>Full Name *</label>
              <input className={inputClass} value={form.full_name} onChange={(e) => set("full_name", e.target.value)} placeholder="John Doe" />
            </div>
            <div>
              <label className={labelClass}>Phone *</label>
              <input className={inputClass} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="0771234567" />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input className={inputClass} value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="optional" />
            </div>
            <div className="col-span-2">
              <label className={labelClass}>National ID</label>
              <input className={inputClass} value={form.national_id} onChange={(e) => set("national_id", e.target.value)} placeholder="CM12345678UG" />
            </div>
            <div>
              <label className={labelClass}>Emergency Contact Name</label>
              <input className={inputClass} value={form.emergency_contact_name} onChange={(e) => set("emergency_contact_name", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Emergency Contact Phone</label>
              <input className={inputClass} value={form.emergency_contact_phone} onChange={(e) => set("emergency_contact_phone", e.target.value)} />
            </div>
          </div>
        </div>

        {/* Step 3 — Lease & Financials */}
        <div className="bg-brand-bg rounded-xl p-4 space-y-3">
          <p className="text-xs font-bold text-brand-teal uppercase tracking-wide">3. Lease & Financials</p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Lease Start *</label>
              <input type="date" className={inputClass} value={form.lease_start} onChange={(e) => set("lease_start", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Lease End</label>
              <input type="date" className={inputClass} value={form.lease_end} onChange={(e) => set("lease_end", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Monthly Rent (UGX) *</label>
              <input type="number" className={inputClass} value={form.monthly_rent} onChange={(e) => set("monthly_rent", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Deposit Amount (UGX)</label>
              <input type="number" className={inputClass} value={form.deposit_amount} onChange={(e) => set("deposit_amount", e.target.value)} />
            </div>
          </div>

          {/* Deposit paid + receipt upload */}
          <div className="flex items-center gap-2 mt-1">
            <input
              type="checkbox"
              id="deposit_paid"
              className="w-4 h-4 accent-brand-teal"
              checked={form.deposit_paid}
              onChange={(e) => set("deposit_paid", e.target.checked)}
            />
            <label htmlFor="deposit_paid" className="text-sm text-brand-mid font-semibold cursor-pointer">
              Deposit has been paid
            </label>
          </div>

          {form.deposit_paid && (
            <div>
              <label className={labelClass}>Upload Deposit Receipt (optional)</label>
              {receiptFile ? (
                <div className="flex items-center gap-2 rounded-lg border border-white/12 bg-white/[0.06] px-3 py-2 text-sm">
                  <FileText size={16} className="flex-shrink-0 text-brand-teal" />
                  <span className="flex-1 truncate text-white/90">{receiptFile.name}</span>
                  <button onClick={() => setReceiptFile(null)} className="text-red-400 hover:text-red-600">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label className="flex items-center gap-2 border border-dashed border-brand-teal rounded-lg px-3 py-3 cursor-pointer hover:bg-brand-tealLt/20 transition-colors">
                  <Upload size={16} className="text-brand-teal" />
                  <span className="text-sm text-brand-mid">Click to upload receipt (PDF, JPG, PNG)</span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setReceiptFile(e.target.files[0] || null)}
                  />
                </label>
              )}
            </div>
          )}

          <div>
            <label className={labelClass}>Notes</label>
            <textarea className={inputClass} rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Any additional notes..." />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <Button variant="outline" onClick={handleClose} fullWidth>Cancel</Button>
          <Button onClick={handleSubmit} loading={mutation.isPending} fullWidth>Add Tenant</Button>
        </div>
      </div>
    </Modal>
  );
}