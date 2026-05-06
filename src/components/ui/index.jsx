import { X, AlertCircle } from "lucide-react";

// ── MODAL ─────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-brand-dark">{title}</h3>
          <button onClick={onClose} className="text-brand-mid hover:text-brand-dark transition-colors">
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
    teal:   "bg-brand-tealLt text-brand-teal",
    green:  "bg-emerald-100 text-emerald-700",
    red:    "bg-red-100 text-red-600",
    amber:  "bg-amber-100 text-amber-700",
    gray:   "bg-gray-100 text-gray-600",
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
    blue: "bg-blue-50 text-blue-600",
    red:  "bg-red-50 text-red-600",
    gray: "bg-gray-100 text-gray-500",
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
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${variant === "danger" ? "bg-red-100" : "bg-brand-tealLt"}`}>
            <AlertCircle size={20} className={variant === "danger" ? "text-red-500" : "text-brand-teal"} />
          </div>
          <div>
            <h3 className="font-bold text-brand-dark">{title}</h3>
            {message && <p className="text-brand-mid text-sm mt-1">{message}</p>}
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 px-4 py-2 rounded-lg border border-brand-tealLt text-brand-mid font-semibold text-sm hover:bg-brand-tealLt transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm}
            className={`flex-1 px-4 py-2 rounded-lg text-white font-semibold text-sm transition-colors
              ${variant === "danger" ? "bg-red-500 hover:bg-red-600" : "bg-brand-teal hover:bg-brand-dark"}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── SELECT ────────────────────────────────────────────────────────
export function Select({ label, options = [], error, ...props }) {
  return (
    <div className="w-full">
      {label && <label className="input-label">{label}</label>}
      <select className="input-field" {...props}>
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}