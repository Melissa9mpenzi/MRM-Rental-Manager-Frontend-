export function Select({ label, children, className = '', ...props }) {
  return (
    <label className="block">
      {label ? <div className="mb-1 text-sm text-brand-mid">{label}</div> : null}
      <select className={`input-field ${className}`.trim()} {...props}>
        {children}
      </select>
    </label>
  )
}

