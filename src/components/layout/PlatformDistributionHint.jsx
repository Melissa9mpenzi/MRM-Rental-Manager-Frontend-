import { Smartphone, Monitor, Globe } from "lucide-react";
import { API_ROLES } from "../../config/access";

const HINTS = {
  tenant: {
    Icon: Smartphone,
    title: "Mobile-first for tenants",
    body: "This web app is full-featured. The RentDirect mobile app is the primary experience on the go — rent reminders, chat, and pay-from-phone. Use whichever fits your day.",
  },
  landlord: {
    Icon: Monitor,
    title: "Web-first for landlords",
    body: "Portfolio, units, arrears, and reporting are optimized on desktop. The mobile app is a companion for approvals and messages when you are away from the desk.",
  },
  agent: {
    Icon: Globe,
    title: "Web-first for agents",
    body: "Pipeline, leads, and commission views are built for a wide screen. Mobile supports viewings and quick client replies in the field.",
  },
  admin: {
    Icon: Monitor,
    title: "Web only for administrators",
    body: "Admin controls are not shipped on mobile apps — use this web dashboard in a desktop-class browser for audits, user management, and platform safety.",
  },
};

function variantForRole(role) {
  if (role === API_ROLES.admin) return "admin";
  if (role === API_ROLES.tenant) return "tenant";
  if (role === API_ROLES.staff || role === "agent") return "agent";
  if (role === API_ROLES.landlord) return "landlord";
  return "landlord";
}

/** Explains mobile vs web vs main platform for the signed-in role (product distribution). */
export default function PlatformDistributionHint({ role }) {
  const key = variantForRole(role);
  const { Icon, title, body } = HINTS[key];

  return (
    <div className="flex gap-3 rounded-2xl border border-brand-teal/25 bg-brand-teal/[0.07] px-4 py-3 text-sm text-white/80">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-brand-teal/30 bg-brand-teal/10 text-brand-teal">
        <Icon size={20} strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <p className="font-bold text-white">{title}</p>
        <p className="mt-1 text-xs leading-relaxed text-white/55">{body}</p>
      </div>
    </div>
  );
}
