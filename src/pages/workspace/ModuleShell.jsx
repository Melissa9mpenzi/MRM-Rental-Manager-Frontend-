/**
 * Consistent “module coming online” shell for new sidebar destinations.
 */
import { LayoutGrid } from "lucide-react";
import AppPageScaffold from "../../components/layout/AppPageScaffold";

export default function ModuleShell({ title, subtitle, children }) {
  return (
    <AppPageScaffold variant="registry" icon={LayoutGrid} title={title} description={subtitle || ""}>
      {children ? (
        <div className="card-glass border border-white/[0.08] p-6 lg:p-8">{children}</div>
      ) : null}
    </AppPageScaffold>
  );
}
