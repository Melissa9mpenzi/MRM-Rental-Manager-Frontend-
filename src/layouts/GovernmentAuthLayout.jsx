import { Outlet } from "react-router-dom";
import GovernmentAuthShell from "../components/government/GovernmentAuthShell";
import "../styles/government-auth.css";
import "../styles/government-portal.css";

export default function GovernmentAuthLayout() {
  return (
    <GovernmentAuthShell>
      <Outlet />
    </GovernmentAuthShell>
  );
}
