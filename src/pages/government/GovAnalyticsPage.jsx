import GovModuleHeader from "../../components/government/GovModuleHeader";
import GovernmentOverviewPage from "./GovernmentOverviewPage";

/** National analytics — reuses overview charts and KPIs per mockup Reports & Analytics view. */
export default function GovAnalyticsPage() {
  return (
    <div className="space-y-5">
      <GovModuleHeader
        title="Reports & Analytics"
        subtitle="National rental infrastructure metrics, compliance trends, and regional performance."
      />
      <GovernmentOverviewPage />
    </div>
  );
}
