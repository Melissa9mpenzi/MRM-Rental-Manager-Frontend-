import GovernmentOverviewPage from "./GovernmentOverviewPage";

/** National analytics — same data layer as overview until dedicated URA reports ship. */
export default function GovAnalyticsPage() {
  return (
    <div>
      <h2 className="mb-4 text-lg font-bold text-white">Reports & Analytics</h2>
      <GovernmentOverviewPage />
    </div>
  );
}
