import { Link } from "react-router-dom";
import { FileText } from "lucide-react";
import AppPageScaffold from "../../components/layout/AppPageScaffold";

export default function TenantApplicationsPage() {
  return (
    <AppPageScaffold
      variant="registry"
      icon={FileText}
      title="Applications"
      description="Listing applications will appear here once the applications API is available."
    >
      <div className="card-glass flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
        <FileText className="text-white/25" size={40} />
        <p className="max-w-md text-sm text-white/55">
          You have no applications on record. When you submit interest from a listing, your landlord will see it here
          after the backend exposes an applications list.
        </p>
        <Link
          to="/browse-properties"
          className="mt-2 inline-flex items-center justify-center rounded-xl bg-brand-teal px-5 py-2.5 text-sm font-bold text-[#041208] transition hover:brightness-110"
        >
          Browse listings
        </Link>
      </div>
    </AppPageScaffold>
  );
}
