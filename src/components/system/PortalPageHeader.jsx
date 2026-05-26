export default function PortalPageHeader({ title, description, children }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="text-lg font-bold text-white">{title}</h2>
        {description && <p className="mt-1 max-w-2xl text-sm text-white/50">{description}</p>}
      </div>
      {children}
    </div>
  );
}
