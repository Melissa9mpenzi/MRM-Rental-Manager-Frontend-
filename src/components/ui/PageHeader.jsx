export function PageHeader({ title, subtitle, right }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <h1>{title}</h1>
        {subtitle ? <div className="mt-1 text-sm text-brand-mid">{subtitle}</div> : null}
      </div>
      {right ? <div>{right}</div> : null}
    </div>
  )
}

