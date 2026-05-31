/**
 * Legacy wrapper — workspace modules now use WorkspaceModulePage directly.
 */
import WorkspaceModulePage from "../../components/workspace/WorkspaceModulePage";

export default function ModuleShell({ title, subtitle, children, variant = "registry", icon }) {
  return (
    <WorkspaceModulePage variant={variant} icon={icon} title={title} subtitle={subtitle}>
      {children}
    </WorkspaceModulePage>
  );
}
