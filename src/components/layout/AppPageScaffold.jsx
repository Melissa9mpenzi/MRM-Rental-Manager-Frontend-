/**
 * Distinct page “personalities” inside the authenticated shell so routes don’t all read as the same dashboard.
 * Use one variant per screen archetype: dashboard home, registries, ledger, ops, inbox, account, command, showcase.
 */
const STYLES = {
  dashboard: {
    shell: "relative z-[1] space-y-6",
    header: "",
    title: "",
    desc: "",
    iconWrap: "",
    /** Subtle atmosphere for role home screens (`hideHeader` or `variant="dashboard"`) */
    dashboardShell:
      "before:pointer-events-none before:absolute before:inset-x-0 before:-top-10 before:z-0 before:h-44 before:bg-[radial-gradient(ellipse_75%_55%_at_50%_-10%,rgba(0,200,150,0.16),transparent_58%)]",
  },
  registry: {
    shell: "space-y-6",
    header:
      "rounded-2xl border border-white/[0.1] border-l-[4px] border-l-[#00C896] bg-rd-elevated/80 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl sm:p-6",
    title: "text-xl font-extrabold tracking-tight text-white sm:text-2xl",
    desc: "mt-1.5 max-w-2xl text-sm leading-relaxed text-white/55",
    iconWrap:
      "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-[#00C896]/25 bg-[#00C896]/12 text-[#00C896]",
  },
  ledger: {
    shell: "space-y-6",
    header:
      "rounded-2xl border border-emerald-500/25 border-b-2 border-b-emerald-500/35 bg-gradient-to-br from-emerald-950/50 via-[#0b141c] to-rd-elevated/90 p-5 backdrop-blur-xl sm:p-6",
    title: "text-xl font-extrabold tracking-tight text-emerald-50 sm:text-2xl",
    desc: "mt-1.5 max-w-2xl text-sm leading-relaxed text-emerald-100/70",
    iconWrap:
      "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-500/15 text-emerald-300",
  },
  tickets: {
    shell: "space-y-6",
    header:
      "rounded-2xl border border-amber-500/25 border-l-[4px] border-l-amber-400/90 bg-gradient-to-br from-amber-950/35 to-rd-elevated/90 p-5 backdrop-blur-xl sm:p-6",
    title: "text-xl font-extrabold tracking-tight text-amber-50 sm:text-2xl",
    desc: "mt-1.5 max-w-2xl text-sm leading-relaxed text-amber-100/65",
    iconWrap:
      "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-amber-400/35 bg-amber-500/15 text-amber-200",
  },
  concierge: {
    shell: "space-y-5",
    header:
      "rounded-2xl border border-sky-500/25 border-l-[4px] border-l-sky-400/80 bg-gradient-to-br from-sky-950/40 to-rd-elevated/90 p-5 backdrop-blur-xl sm:p-6",
    title: "text-xl font-extrabold tracking-tight text-sky-50 sm:text-2xl",
    desc: "mt-1.5 max-w-2xl text-sm leading-relaxed text-sky-100/65",
    iconWrap:
      "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-sky-400/30 bg-sky-500/15 text-sky-200",
  },
  vault: {
    shell: "space-y-6",
    header:
      "rounded-2xl border border-violet-500/25 border-l-[4px] border-l-violet-400/80 bg-gradient-to-br from-violet-950/35 to-rd-elevated/90 p-5 backdrop-blur-xl sm:p-6",
    title: "text-xl font-extrabold tracking-tight text-violet-50 sm:text-2xl",
    desc: "mt-1.5 max-w-2xl text-sm leading-relaxed text-violet-100/65",
    iconWrap:
      "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-violet-400/30 bg-violet-500/15 text-violet-200",
  },
  command: {
    shell: "relative z-[1] space-y-6",
    header:
      "rounded-2xl border border-slate-400/20 border-l-[4px] border-l-red-400/70 bg-gradient-to-br from-slate-950/80 via-[#0c1018] to-rd-elevated/95 p-5 backdrop-blur-xl sm:p-6",
    title: "text-xl font-extrabold tracking-tight text-slate-50 sm:text-2xl",
    desc: "mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-300/80",
    iconWrap:
      "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-red-400/25 bg-red-500/10 text-red-300",
    dashboardShell:
      "before:pointer-events-none before:absolute before:inset-x-0 before:-top-10 before:z-0 before:h-44 before:bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(248,113,113,0.12),transparent_55%)]",
  },
  showcase: {
    shell: "space-y-6",
    header:
      "rounded-2xl border border-fuchsia-500/20 border-l-[4px] border-l-fuchsia-400/80 bg-gradient-to-br from-fuchsia-950/30 to-rd-elevated/90 p-5 backdrop-blur-xl sm:p-6",
    title: "text-xl font-extrabold tracking-tight text-fuchsia-50 sm:text-2xl",
    desc: "mt-1.5 max-w-2xl text-sm leading-relaxed text-fuchsia-100/65",
    iconWrap:
      "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-fuchsia-400/30 bg-fuchsia-500/12 text-fuchsia-200",
  },
  insights: {
    shell: "relative z-[1] space-y-6",
    header:
      "rounded-2xl border border-indigo-500/25 border-l-[4px] border-l-indigo-400/80 bg-gradient-to-br from-indigo-950/40 to-rd-elevated/90 p-5 backdrop-blur-xl sm:p-6",
    title: "text-xl font-extrabold tracking-tight text-indigo-50 sm:text-2xl",
    desc: "mt-1.5 max-w-2xl text-sm leading-relaxed text-indigo-100/65",
    iconWrap:
      "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-indigo-400/30 bg-indigo-500/15 text-indigo-200",
    dashboardShell:
      "before:pointer-events-none before:absolute before:inset-x-0 before:-top-10 before:z-0 before:h-44 before:bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(99,102,241,0.2),transparent_55%)]",
  },
};

/**
 * @param {Object} props
 * @param {keyof typeof STYLES} [props.variant="registry"]
 * @param {boolean} [props.hideHeader] — role dashboards that already carry their own hero layout
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
    const ambient = cfg.dashboardShell;
    return (
      <div className={[cfg.shell, ambient].filter(Boolean).join(" ")}>{children}</div>
    );
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
            {actions ? <div className="flex flex-shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
          </div>
        </header>
      )}
      {children}
    </div>
  );
}
