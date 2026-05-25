import { useNavigate } from "react-router-dom";
import AddPropertyForm from "../../components/domain/AddPropertyForm";
import AppPageScaffold from "../../components/layout/AppPageScaffold";

export default function LandlordAddPropertyPage() {
  const navigate = useNavigate();

  return (
    <AppPageScaffold variant="registry" hideHeader>
      <div className="mx-auto w-full max-w-xl px-0 sm:px-2">
        <div className="add-property-page-card">
          <AddPropertyForm
            mode="page"
            onCancel={() => navigate("/landlord/properties")}
            onSuccess={(prop) => navigate(`/landlord/properties/${prop.id}`)}
          />
        </div>
      </div>
    </AppPageScaffold>
  );
}
