import { useNavigate } from "react-router-dom";
import { Building2 } from "lucide-react";
import AddPropertyModal from "../../components/domain/AddPropertyModal";
import AppPageScaffold from "../../components/layout/AppPageScaffold";

export default function LandlordAddPropertyPage() {
  const navigate = useNavigate();

  return (
    <AppPageScaffold
      variant="registry"
      icon={Building2}
      title="Add property"
      description="Register a new building or compound, then add units and invite tenants. The form matches the dashboard flow."
    >
      <AddPropertyModal open onClose={() => navigate("/landlord/properties")} />
    </AppPageScaffold>
  );
}
