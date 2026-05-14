import { Navigate, useParams } from "react-router-dom";

export default function ListingIdRedirect() {
  const { id } = useParams();
  return <Navigate to={`/property/${id}`} replace />;
}
