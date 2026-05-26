import { Link } from "react-router-dom";
import { Users, Building2, Briefcase, Shield, AlertTriangle, Database, Server, Cpu, Boxes } from "lucide-react";

const QUICK = [
  { label: "Tenant", to: "/tenant/dashboard", icon: Users, tone: "text-emerald-400" },
  { label: "Landlord", to: "/landlord/dashboard", icon: Building2, tone: "text-blue-400" },
  { label: "Agent", to: "/agent/dashboard", icon: Briefcase, tone: "text-purple-400" },
  { label: "Government Portal", to: "/government/overview", icon: Shield, tone: "text-cyan-400" },
  { label: "Moderation Center", to: "/system/users", icon: Users, tone: "text-amber-400" },
  { label: "Fraud Detection", to: "/government/fraud", icon: AlertTriangle, tone: "text-red-400" },
];

const ALERTS = [
  { text: "High fraud detected in Mukono", time: "2m ago" },
  { text: "NIRA verification limit reached", time: "7m ago" },
  { text: "KCCA property pending review", time: "15m ago" },
  { text: "URA tax report generated", time: "24m ago" },
];

const STATUS = [
  { label: "Server Load", value: "32%", ok: true, icon: Server },
  { label: "Database", value: "Healthy", ok: true, icon: Database },
  { label: "Blockchain (Sui)", value: "Connected", ok: true, icon: Boxes },
  { label: "Walrus Storage", value: "Online", ok: true, icon: Database },
  { label: "AI Services", value: "Active", ok: true, icon: Cpu },
];

export default function SystemRightPanel() {
  return (
    <aside className="sys-right-panel hidden min-h-0 flex-col gap-4 overflow-y-auto p-4">
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wide text-white/50">Quick Access</h2>
        <p className="text-[10px] text-white/35">Super Admin</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {QUICK.map(({ label, to, icon: Icon, tone }) => (
            <Link key={label} to={to} className="sys-quick-btn">
              <Icon size={20} className={tone} />
              <span className="text-center leading-tight">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="gov-glass p-3">
        <h2 className="text-xs font-bold text-white/80">Recent System Alerts</h2>
        <ul className="mt-3 space-y-2">
          {ALERTS.map((a) => (
            <li key={a.text} className="border-b border-white/5 pb-2 text-[11px] last:border-0">
              <p className="text-white/80">{a.text}</p>
              <p className="mt-0.5 text-white/35">{a.time}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="gov-glass flex flex-col items-center p-4">
        <h2 className="w-full text-xs font-bold text-white/80">Platform Status</h2>
        <div className="sys-health-ring mt-4">98.7%</div>
        <p className="mt-2 text-xs font-semibold text-emerald-400">Operational</p>
        <ul className="mt-4 w-full space-y-2 text-[11px]">
          {STATUS.map((s) => {
            const Icon = s.icon;
            return (
              <li key={s.label} className="flex items-center justify-between text-white/60">
                <span className="flex items-center gap-1.5">
                  <Icon size={12} className="text-white/40" />
                  {s.label}
                </span>
                <span className={`flex items-center gap-1 ${s.ok ? "text-emerald-400" : "text-amber-400"}`}>
                  {s.ok && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
                  {s.value}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
