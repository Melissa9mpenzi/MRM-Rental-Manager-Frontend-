import { Outlet } from "react-router-dom";
import { useSuiDashboard } from "../lib/useSuiDashboard";
import "../styles/sui-portal.css";

/** Sui routes render inside the main app shell; this only supplies dashboard context + shared styles. */
export default function SuiPortalLayout() {
  const { data } = useSuiDashboard();

  return <Outlet context={{ dashboard: data }} />;
}
