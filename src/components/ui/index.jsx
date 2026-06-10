import { X, AlertCircle } from "lucide-react";

// ── MODAL ─────────────────────────────────────────────────────────
const MODAL_SIZES = {
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-3xl",
};

export function Modal({ open, onClose, title, children, size = "md" }) {
  if (!open) return null;
  const maxW = MODAL_SIZES[size] || MODAL_SIZES.md;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div
        className={`relative max-h-[90vh] w-full ${maxW} overflow-y-auto rounded-3xl border border-gray-100 bg-white p-6 shadow-modal`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 id="modal-title" className="text-lg font-bold text-gray-900">{title}</h3>
          <button type="button" onClick={onClose} className="text-gray-400 transition-colors hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── BADGE ─────────────────────────────────────────────────────────
export function Badge({ children, label, color = "teal", variant }) {
  const text = children || label;

  // Support variant="active"|"archived" for PropertyCard
  if (variant === "active") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700">
        {text}
      </span>
    );
  }
  if (variant === "archived") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-500">
        {text}
      </span>
    );
  }

  const colors = {
    teal:  "bg-teal-50 text-teal-700",
    green: "bg-teal-50 text-teal-700",
    red:   "bg-red-50 text-red-600",
    amber: "bg-amber-50 text-amber-700",
    gray:  "bg-gray-100 text-gray-500",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${colors[color] || colors.teal}`}>
      {text}
    </span>
  );
}

// ── EMPTY STATE ───────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="state-panel state-panel--empty !py-12">
      {Icon && <Icon size={28} className="state-panel__icon text-teal-400" />}
      <h3 className="state-panel__title">{title}</h3>
      {description && <p className="state-panel__desc">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export { ErrorPanel, EmptyPanel, LoadingPanel } from "./StatePanel";

// ── STAT CARD ─────────────────────────────────────────────────────
export function StatCard({ icon: Icon, label, value, sub, color = "teal" }) {
  const colors = {
    teal: "bg-teal-50 text-teal-600",
    blue: "bg-sky-50 text-sky-600",
    red:  "bg-red-50 text-red-500",
    gray: "bg-gray-100 text-gray-400",
  };
  return (
    <div className="card flex items-start gap-3">
      <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${colors[color]}`}>
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <div className="truncate text-2xl font-bold leading-tight text-gray-900">{value}</div>
        <div className="mt-0.5 text-xs font-semibold text-gray-500">{label}</div>
        {sub && <div className="mt-0.5 text-xs text-gray-400">{sub}</div>}
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
      <div className="relative w-full max-w-sm rounded-3xl border border-gray-100 bg-white p-6 shadow-modal">
        <div className="mb-4 flex items-start gap-3">
          <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
            variant === "danger" ? "bg-red-50 text-red-500" : "bg-teal-50 text-teal-600"
          }`}>
            <AlertCircle size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{title}</h3>
            {message && <p className="mt-1 text-sm text-gray-500">{message}</p>}
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-colors
              ${variant === "danger" ? "bg-red-600 hover:bg-red-500" : "bg-teal-600 hover:bg-teal-700"}`}
          >
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
