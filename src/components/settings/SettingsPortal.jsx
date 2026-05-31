import { Link } from "react-router-dom";

export function SettingsLayout({ activeTab, onTabChange, tabs, children, className = "" }) {
  return (
    <div className={`settings-portal settings-portal__shell ${className}`.trim()}>
      <nav className="settings-portal__nav" aria-label="Settings sections">
        <p className="settings-portal__nav-label">Configuration</p>
        {tabs.map(({ id, label, icon: Icon, description }) => (
          <button
            key={id}
            type="button"
            onClick={() => onTabChange(id)}
            className={`settings-portal__tab ${activeTab === id ? "settings-portal__tab--active" : ""}`}
          >
            {Icon ? <Icon size={15} className="settings-portal__tab-icon" /> : null}
            <span>
              <span className="settings-portal__tab-title">{label}</span>
              {description ? <span className="settings-portal__tab-desc">{description}</span> : null}
            </span>
          </button>
        ))}
      </nav>
      <div className="settings-portal__main">{children}</div>
    </div>
  );
}

export function SettingsPanel({ kicker, title, description, children }) {
  return (
    <div className="settings-portal__panel">
      <header className="settings-portal__panel-head">
        {kicker ? <p className="settings-portal__panel-kicker">{kicker}</p> : null}
        <h2 className="settings-portal__panel-title">{title}</h2>
        {description ? <p className="settings-portal__panel-desc">{description}</p> : null}
      </header>
      <div className="settings-portal__panel-body">{children}</div>
    </div>
  );
}

export function SettingsSection({ title, subtitle, tone = "emerald", badge, children }) {
  const toneClass =
    tone === "violet"
      ? "settings-portal__section--violet"
      : tone === "amber"
        ? "settings-portal__section--amber"
        : tone === "cyan"
          ? "settings-portal__section--cyan"
          : tone === "red"
            ? "settings-portal__section--red"
            : "";

  return (
    <section className={`settings-portal__section ${toneClass}`.trim()}>
      <div className="settings-portal__section-head">
        <div>
          <h3 className="settings-portal__section-title">{title}</h3>
          {subtitle ? <p className="settings-portal__section-sub">{subtitle}</p> : null}
        </div>
        {badge}
      </div>
      <div className="settings-portal__section-body">{children}</div>
    </section>
  );
}

export function SettingsFieldRow({ label, value, mono, badge }) {
  return (
    <div className="settings-portal__row">
      <span className="settings-portal__row-label">{label}</span>
      <span className="flex items-center gap-2">
        {badge}
        <span className={`settings-portal__row-value ${mono ? "settings-portal__row-value--mono" : ""}`.trim()}>
          {value ?? "—"}
        </span>
      </span>
    </div>
  );
}

export function SettingsStatusBadge({ status = "neutral", children }) {
  const cls =
    status === "ok"
      ? "settings-portal__badge--ok"
      : status === "warn"
        ? "settings-portal__badge--warn"
        : status === "err"
          ? "settings-portal__badge--err"
          : "settings-portal__badge--neutral";

  return (
    <span className={`settings-portal__badge ${cls}`}>
      <span className="settings-portal__badge-dot" aria-hidden />
      {children}
    </span>
  );
}

export function SettingsMetricGrid({ items }) {
  return (
    <div className="settings-portal__metrics">
      {items.map(({ label, value }) => (
        <div key={label} className="settings-portal__metric">
          <p className="settings-portal__metric-label">{label}</p>
          <p className="settings-portal__metric-value">{value}</p>
        </div>
      ))}
    </div>
  );
}

export function SettingsPolicyCard({ icon: Icon, title, items, tone = "emerald" }) {
  const iconTone =
    tone === "cyan"
      ? "text-cyan-300"
      : tone === "purple"
        ? "text-purple-300"
        : tone === "amber"
          ? "text-amber-300"
          : tone === "red"
            ? "text-red-300"
            : "text-emerald-300";

  return (
    <article className="settings-portal__policy">
      <div className={`settings-portal__policy-icon ${iconTone}`}>
        <Icon size={16} />
      </div>
      <h4 className="settings-portal__policy-title">{title}</h4>
      <ul className="settings-portal__policy-list">
        {items.map((item) => (
          <li key={item.text} className="settings-portal__policy-item">
            <span aria-hidden>{item.done === false ? "○" : "✓"}</span>
            <span>{item.text}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

export function SettingsActions({ children }) {
  return <div className="settings-portal__actions">{children}</div>;
}

export function SettingsEmpty({ children }) {
  return <div className="settings-portal__empty">{children}</div>;
}

export function SettingsLinkGrid({ links = [] }) {
  return (
    <div className="settings-portal__link-grid">
      {links.map(({ label, description, to, soon, external }) => {
        const cls = `settings-portal__link-card ${soon ? "settings-portal__link-card--soon" : ""}`.trim();
        const inner = (
          <>
            <span className="settings-portal__link-label">{label}</span>
            {description ? <span className="settings-portal__link-desc">{description}</span> : null}
            {soon ? <span className="settings-portal__link-soon">Planned</span> : null}
          </>
        );
        if (soon || !to) {
          return (
            <div key={label} className={cls}>
              {inner}
            </div>
          );
        }
        if (external) {
          return (
            <a key={label} href={to} target="_blank" rel="noreferrer" className={cls}>
              {inner}
            </a>
          );
        }
        return (
          <Link key={label} to={to} className={cls}>
            {inner}
          </Link>
        );
      })}
    </div>
  );
}
