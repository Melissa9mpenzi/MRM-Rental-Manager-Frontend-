/**
 * AuthLayout — premium split-screen with animated brand panel on the left.
 */
import { Outlet } from "react-router-dom";
import { Building2, CreditCard, BarChart2, Shield } from "lucide-react";
import mrmLogo from "../../assets/MRM-LOGO.png";

const FEATURES = [
  {
    icon: Building2,
    title: "All your properties in one place",
    desc: "Manage units, tenants and leases across every building you own.",
  },
  {
    icon: CreditCard,
    title: "Instant payment records & receipts",
    desc: "Log MTN MoMo, Airtel & cash payments and generate PDF receipts in seconds.",
  },
  {
    icon: BarChart2,
    title: "Real-time arrears & analytics",
    desc: "See exactly who owes what — no spreadsheets, no guesswork.",
  },
  {
    icon: Shield,
    title: "Secure, role-based access",
    desc: "Your data stays yours. OTP-verified accounts and JWT-protected APIs.",
  },
];

// Floating stat pill
function StatPill({ value, label }) {
  return (
    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full px-3 py-1.5">
      <span className="text-brand-teal font-bold text-sm">{value}</span>
      <span className="text-white/60 text-xs">{label}</span>
    </div>
  );
}

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex">
      {/* ── Left image panel (desktop only) ──────────────────────── */}
      <div className="hidden lg:flex lg:w-[46%] relative overflow-hidden">
        <img 
          src={mrmLogo} 
          alt="MRM Rental Management" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* ── Right form panel ──────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[#f0f5f4]">
        <div className="w-full max-w-[420px] animate-fade-in">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-brand-dark flex items-center justify-center">
              <img src={mrmLogo} alt="MRM" className="h-7 w-auto object-contain" />
            </div>
            <div>
              <div className="text-brand-dark font-bold text-lg leading-none">MRM</div>
              <div className="text-brand-teal text-[10px] font-semibold tracking-widest uppercase">Rental Manager</div>
            </div>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}