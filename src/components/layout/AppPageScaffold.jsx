/**
 * Distinct page "personalities" inside the authenticated shell.
 * Light theme — white/turquoise/black palette matching Stitch mockup.
 */

const TEAL = "#0D9488";

const STYLES = {
  dashboard: {
    shell: "space-y-6",
    header: "",
    title: "",
    desc: "",
    iconWrap: "",
  },
  registry: {
    shell: "space-y-6",
    header:
      "rounded-2xl border border-gray-100 border-l-4 border-l-teal-500 bg-white p-5 shadow-card sm:p-6",
    title: "text-xl font-extrabold tracking-tight text-gray-900 sm:text-2xl",
    desc: "mt-1.5 max-w-2xl text-sm leading-relaxed text-gray-500",
    iconWrap:
      "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-teal-200 bg-teal-50 text-teal-600",
  },
  ledger: {
    shell: "space-y-6",
    header:
      "rounded-2xl border border-gray-100 border-l-4 border-l-teal-600 bg-white p-5 shadow-card sm:p-6",
    title: "text-xl font-extrabold tracking-tight text-gray-900 sm:text-2xl",
    desc: "mt-1.5 max-w-2xl text-sm leading-relaxed text-gray-500",
    iconWrap:
      "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-teal-200 bg-teal-50 text-teal-600",
  },
  tickets: {
    shell: "space-y-6",
    header:
      "rounded-2xl border border-gray-100 border-l-4 border-l-amber-400 bg-white p-5 shadow-card sm:p-6",
    title: "text-xl font-extrabold tracking-tight text-gray-900 sm:text-2xl",
    desc: "mt-1.5 max-w-2xl text-sm leading-relaxed text-gray-500",
    iconWrap:
      "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-600",
  },
  concierge: {
    shell: "space-y-5",
    header:
      "rounded-2xl border border-gray-100 border-l-4 border-l-sky-400 bg-white p-5 shadow-card sm:p-6",
    title: "text-xl font-extrabold tracking-tight text-gray-900 sm:text-2xl",
    desc: "mt-1.5 max-w-2xl text-sm leading-relaxed text-gray-500",
    iconWrap:
      "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 text-sky-600",
  },
  vault: {
    shell: "space-y-6",
    header:
      "rounded-2xl border border-gray-100 border-l-4 border-l-violet-400 bg-white p-5 shadow-card sm:p-6",
    title: "text-xl font-extrabold tracking-tight text-gray-900 sm:text-2xl",
    desc: "mt-1.5 max-w-2xl text-sm leading-relaxed text-gray-500",
    iconWrap:
      "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-violet-200 bg-violet-50 text-violet-600",
  },
  command: {
    shell: "space-y-6",
    header:
      "rounded-2xl border border-gray-100 border-l-4 border-l-red-400 bg-white p-5 shadow-card sm:p-6",
    title: "text-xl font-extrabold tracking-tight text-gray-900 sm:text-2xl",
    desc: "mt-1.5 max-w-2xl text-sm leading-relaxed text-gray-500",
    iconWrap:
      "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-red-200 bg-red-50 text-red-500",
  },
  showcase: {
    shell: "space-y-6",
    header:
      "rounded-2xl border border-gray-100 border-l-4 border-l-fuchsia-400 bg-white p-5 shadow-card sm:p-6",
    title: "text-xl font-extrabold tracking-tight text-gray-900 sm:text-2xl",
    desc: "mt-1.5 max-w-2xl text-sm leading-relaxed text-gray-500",
    iconWrap:
      "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-fuchsia-200 bg-fuchsia-50 text-fuchsia-600",
  },
  insights: {
    shell: "space-y-6",
    header:
      "rounded-2xl border border-gray-100 border-l-4 border-l-indigo-400 bg-white p-5 shadow-card sm:p-6",
    title: "text-xl font-extrabold tracking-tight text-gray-900 sm:text-2xl",
    desc: "mt-1.5 max-w-2xl text-sm leading-relaxed text-gray-500",
    iconWrap:
      "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-indigo-200 bg-indigo-50 text-indigo-600",
  },
};

/**
 * @param {Object} props
 * @param {keyof typeof STYLES} [props.variant="registry"]
 * @param {boolean} [props.hideHeader] — role dashboards that carry their own hero layout
 * @param {string} [props.title]
 * @param {string} [props.description]
 * @param {import('lucide-react').LucideIcon} [props.icon]
 * @param {import('react').ReactNode} [props.actions]
 * @param {import('react').ReactNode} props.children
 */
export default function AppPageScaffold({
  variant = "registry",
  hideHeader = false,
  title,
  description,
  icon: Icon,
  actions,
  children,
}) {
  const cfg = STYLES[variant] || STYLES.registry;

  if (hideHeader || variant === "dashboard") {
    return <div className={cfg.shell}>{children}</div>;
  }

  return (
    <div className={cfg.shell}>
      {(title || description || actions || Icon) && (
        <header className={cfg.header}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-4">
              {Icon ? (
                <div className={cfg.iconWrap}>
                  <Icon size={22} strokeWidth={2} />
                </div>
              ) : null}
              <div className="min-w-0">
                {title ? <h1 className={cfg.title}>{title}</h1> : null}
                {description ? <p className={cfg.desc}>{description}</p> : null}
              </div>
            </div>
            {actions ? (
              <div className="flex flex-shrink-0 flex-wrap items-center gap-2">{actions}</div>
            ) : null}
          </div>
        </header>
      )}
      {children}
    </div>
  );
}
