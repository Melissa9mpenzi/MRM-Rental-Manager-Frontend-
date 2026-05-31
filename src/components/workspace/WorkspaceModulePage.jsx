import AppPageScaffold from "../../components/layout/AppPageScaffold";
import {
  SettingsFieldRow,
  SettingsLinkGrid,
  SettingsPanel,
  SettingsSection,
  SettingsStatusBadge,
} from "../settings/SettingsPortal";

/**
 * Industrial module shell for workspace / ops destinations.
 */
export default function WorkspaceModulePage({
  variant = "registry",
  icon: Icon,
  title,
  subtitle,
  kicker = "Workspace · Operations",
  status = "neutral",
  statusLabel = "Module",
  metrics = [],
  links = [],
  fields = [],
  children,
}) {
  return (
    <AppPageScaffold variant={variant} icon={Icon} title={title} description={subtitle || ""}>
      <div className="settings-portal">
        <SettingsPanel kicker={kicker} title={title} description={subtitle}>
          {metrics.length > 0 ? (
            <SettingsSection
              title="Module status"
              subtitle="Operational snapshot for this workspace area."
              badge={<SettingsStatusBadge status={status}>{statusLabel}</SettingsStatusBadge>}
            >
              <div className="settings-portal__metrics">
                {metrics.map(({ label, value }) => (
                  <div key={label} className="settings-portal__metric">
                    <p className="settings-portal__metric-label">{label}</p>
                    <p className="settings-portal__metric-value">{value}</p>
                  </div>
                ))}
              </div>
            </SettingsSection>
          ) : null}

          {fields.length > 0 ? (
            <SettingsSection title="Configuration" subtitle="Current module parameters.">
              {fields.map(({ label, value, mono }) => (
                <SettingsFieldRow key={label} label={label} value={value} mono={mono} />
              ))}
            </SettingsSection>
          ) : null}

          {links.length > 0 ? (
            <SettingsSection title="Actions & routes" subtitle="Live destinations and planned modules." tone="cyan">
              <SettingsLinkGrid links={links} />
            </SettingsSection>
          ) : null}

          {children}
        </SettingsPanel>
      </div>
    </AppPageScaffold>
  );
}
