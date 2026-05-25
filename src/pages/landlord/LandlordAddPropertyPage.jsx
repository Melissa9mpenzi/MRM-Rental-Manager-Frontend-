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
      description="Step 1: building details. Step 2: listing fields that match marketplace filters (price, beds, type, amenities)."
    >
      <AddPropertyModal open onClose={() => navigate("/landlord/properties")} />
    </AppPageScaffold>
  );
}
