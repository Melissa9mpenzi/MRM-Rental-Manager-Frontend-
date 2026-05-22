import { X, AlertCircle } from "lucide-react";

// ── MODAL ─────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/12 bg-rd-elevated/95 p-6 shadow-modal backdrop-blur-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <button type="button" onClick={onClose} className="text-white/45 transition-colors hover:text-white">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── BADGE ─────────────────────────────────────────────────────────
export function Badge({ children, color = "teal" }) {
  const colors = {
    teal: "bg-brand-tealLt/50 text-brand-teal",
    green: "bg-emerald-500/15 text-emerald-300",
    red: "bg-red-500/15 text-red-300",
    amber: "bg-amber-500/15 text-amber-200",
    gray: "bg-white/10 text-white/55",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${colors[color] || colors.teal}`}>
      {children}
    </span>
  );
}

// ── EMPTY STATE ───────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {Icon && (
        <div className="w-14 h-14 rounded-full bg-brand-tealLt flex items-center justify-center mb-4">
          <Icon size={26} className="text-brand-teal" />
        </div>
      )}
      <h3 className="font-bold text-brand-dark mb-1">{title}</h3>
      {description && <p className="text-brand-mid text-sm mb-4 max-w-xs">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}

// ── STAT CARD ─────────────────────────────────────────────────────
export function StatCard({ icon: Icon, label, value, sub, color = "teal" }) {
  const colors = {
    teal: "bg-brand-tealLt text-brand-teal",
    blue: "bg-sky-500/15 text-sky-300",
    red:  "bg-red-500/15 text-red-300",
    gray: "bg-white/10 text-white/55",
  };
  return (
    <div className="card flex items-start gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <div className="text-2xl font-bold text-brand-dark leading-tight truncate">{value}</div>
        <div className="text-xs font-semibold text-brand-mid mt-0.5">{label}</div>
        {sub && <div className="text-xs text-brand-mid/70 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

// ── CONFIRM DIALOG ────────────────────────────────────────────────
export function ConfirmDialog({ open, title, message, confirmLabel = "Confirm", variant = "danger", onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm rounded-3xl border border-white/12 bg-rd-elevated/95 p-6 shadow-modal backdrop-blur-2xl">
        <div className="mb-4 flex items-start gap-3">
          <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${variant === "danger" ? "bg-red-500/20 text-red-300" : "bg-brand-teal/15 text-brand-teal"}`}>
            <AlertCircle size={20} className={variant === "danger" ? "text-red-300" : "text-brand-teal"} />
          </div>
          <div>
            <h3 className="font-bold text-white">{title}</h3>
            {message && <p className="mt-1 text-sm text-white/60">{message}</p>}
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-white/80 transition-colors hover:bg-white/10">
            Cancel
          </button>
          <button onClick={onConfirm}
            className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-colors
              ${variant === "danger" ? "bg-red-600 hover:bg-red-500" : "bg-brand-teal text-[#041208] hover:brightness-110"}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── SELECT ────────────────────────────────────────────────────────
export function Select({ label, options = [], error, className = "", ...props }) {
  const selectClass = ["select-field", className].filter(Boolean).join(" ");
  return (
    <div className="w-full">
      {label && <label className="input-label">{label}</label>}
      <select className={selectClass} {...props}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}