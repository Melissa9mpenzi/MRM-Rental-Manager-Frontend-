import { Link } from "react-router-dom";
import { Users, Building2, Briefcase, Shield, LayoutDashboard } from "lucide-react";
import PortalPageHeader from "../../components/system/PortalPageHeader";

const DASHBOARDS = [
  { label: "Tenant", desc: "Rent, wallet, applications", to: "/tenant/dashboard", icon: Users, tone: "text-emerald-400" },
  { label: "Landlord", desc: "Properties & collections", to: "/landlord/dashboard", icon: Building2, tone: "text-blue-400" },
  { label: "Agent", desc: "Leads & commissions", to: "/agent/dashboard", icon: Briefcase, tone: "text-purple-400" },
  { label: "Government", desc: "NIRA · KCCA · URA", to: "/government/overview", icon: Shield, tone: "text-cyan-400" },
];

export default function SystemDashboardsPage() {
  return (
    <div className="space-y-5">
      <PortalPageHeader
        title="All Dashboards"
        description="Open any role workspace for support, QA, or moderation. Read-only unless you act as that user."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {DASHBOARDS.map(({ label, desc, to, icon: Icon, tone }) => (
          <Link key={label} to={to} className="gov-glass group p-5 transition hover:border-emerald-500/30">
            <Icon size={28} className={`${tone} opacity-90`} />
            <p className="mt-3 font-bold text-white group-hover:text-emerald-300">{label}</p>
            <p className="mt-1 text-xs text-white/45">{desc}</p>
          </Link>
        ))}
      </div>
      <Link to="/system/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-400 hover:underline">
        <LayoutDashboard size={16} />
        Back to Global Overview
      </Link>
    </div>
  );
}
