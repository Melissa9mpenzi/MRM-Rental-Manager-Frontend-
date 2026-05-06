export function Modal({ open, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="card w-full max-w-lg">
        {title ? <div className="mb-3 text-lg font-semibold">{title}</div> : null}
        {children}
      </div>
    </div>
  )
}

