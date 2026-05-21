import { Link } from "react-router-dom";
import { Building2, Shield, Users, UserPlus } from "lucide-react";
import useAuthStore from "../../store/authStore";

const LINKS = [
  {
    to: "/government/officers",
    icon: UserPlus,
    title: "Government officers",
    desc: "Invite NIRA, KCCA, and URA officers",
  },
  {
    to: "/government/users",
    icon: Users,
    title: "Platform users",
    desc: "Tenants, landlords, agents, moderation",
  },
  {
    to: "/government/overview",
    icon: Shield,
    title: "Government portal",
    desc: "National verification & compliance",
  },
  {
    to: "/browse-properties",
    icon: Building2,
    title: "Marketplace",
    desc: "Public listings view",
  },
];

export default function SystemDashboardPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold text-white">System administration</h1>
      <p className="mt-1 text-sm text-white/55">
        Signed in as {user?.full_name} — platform operator (seed account).
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {LINKS.map(({ to, icon: Icon, title, desc }) => (
          <Link
            key={to}
            to={to}
            className="rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-emerald-500/40 hover:bg-white/[0.08]"
          >
            <Icon className="text-emerald-400" size={22} />
            <p className="mt-2 font-semibold text-white">{title}</p>
            <p className="mt-1 text-xs text-white/45">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
