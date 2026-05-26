export function Select({ label, children, className = "", ...props }) {
  const selectClass = ["select-field", className].filter(Boolean).join(" ");
  return (
    <label className="block">
      {label ? <div className="mb-1 text-sm text-brand-mid">{label}</div> : null}
      <select className={selectClass} {...props}>
        {children}
      </select>
    </label>
  );
}

