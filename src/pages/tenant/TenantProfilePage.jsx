import { Link } from "react-router-dom";
import { User, Mail, Phone, ShieldCheck, MapPin, Briefcase, GraduationCap, Camera } from "lucide-react";
import useAuthStore from "../../store/authStore";
import { Input } from "../../components/ui/Input";
import AppPageScaffold from "../../components/layout/AppPageScaffold";

export default function TenantProfilePage() {
  const user = useAuthStore((s) => s.user);

  return (
    <AppPageScaffold
      variant="vault"
      icon={User}
      title="Your profile"
      description="How landlords and agents see you. Details sync from your account when the API is connected."
      actions={
        <Link
          to="/tenant/settings"
          className="inline-flex items-center justify-center rounded-xl border border-white/15 px-4 py-2 text-sm font-bold text-white/80 transition hover:bg-white/10"
        >
          Edit in Settings
        </Link>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="card-glass space-y-4 p-6">
          <div className="relative mx-auto flex h-32 w-32 items-center justify-center rounded-2xl border border-dashed border-white/20 bg-gradient-to-br from-brand-teal/20 to-transparent">
            <Camera className="h-10 w-10 text-white/35" />
            <span className="absolute bottom-2 rounded-full bg-black/60 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white/70">
              Photo
            </span>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-white">{user?.full_name || "Tenant"}</div>
            <div className="mt-0.5 text-xs text-white/45">{user?.email}</div>
            <div className="mt-3 inline-flex items-center gap-1 rounded-full border border-brand-teal/30 bg-brand-teal/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-teal">
              <ShieldCheck size={12} /> Verified tenant
            </div>
          </div>
          <div className="space-y-2 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 text-xs text-white/55">
            <div className="flex justify-between font-semibold text-white/70">
              <span>Profile strength</span>
              <span className="text-brand-teal">82%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-[82%] rounded-full bg-brand-teal" />
            </div>
            <p className="pt-1 text-[11px] leading-snug">Add employer and emergency contact to reach 100%.</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card-glass p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white/40">Contact</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="flex gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                <Mail className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-teal" />
                <div>
                  <div className="text-xs font-semibold text-white/45">Email</div>
                  <div className="mt-0.5 text-sm font-semibold text-white">{user?.email || "—"}</div>
                  <div className="mt-1 text-[11px] text-brand-teal">Verified</div>
                </div>
              </div>
              <div className="flex gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                <Phone className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-teal" />
                <div>
                  <div className="text-xs font-semibold text-white/45">Phone</div>
                  <div className="mt-0.5 text-sm font-semibold text-white">+256 700 000 000</div>
                  <div className="mt-1 text-[11px] text-amber-300/90">Pending SMS verify</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card-glass p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white/40">About you</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/60">
              I work in finance and am looking for a quiet two-bedroom near Ntinda or Kololo. Non-smoker, no pets.
              Prefer gated parking and backup power. Move-in flexible from June.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Input readOnly label="Occupation" value="Finance — Treasury analyst" className="opacity-90" />
              <Input readOnly label="Employer" value="East Africa Holdings Ltd" className="opacity-90" />
            </div>
          </div>

          <div className="card-glass p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white/40">Household & preferences</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="flex gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                <User className="h-5 w-5 text-brand-teal" />
                <div>
                  <div className="text-xs text-white/45">Household</div>
                  <div className="text-sm font-bold text-white">2 adults</div>
                </div>
              </div>
              <div className="flex gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                <MapPin className="h-5 w-5 text-brand-teal" />
                <div>
                  <div className="text-xs text-white/45">Preferred areas</div>
                  <div className="text-sm font-bold text-white">Ntinda, Kololo</div>
                </div>
              </div>
              <div className="flex gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                <GraduationCap className="h-5 w-5 text-brand-teal" />
                <div>
                  <div className="text-xs text-white/45">Budget</div>
                  <div className="text-sm font-bold text-white">UGX 2.5M – 4.5M / mo</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card-glass p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white/40">Emergency contact</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Input readOnly label="Name" value="Mary Nambi" />
              <Input readOnly label="Relationship" value="Spouse" />
              <Input readOnly label="Phone" value="+256 701 111 222" className="sm:col-span-2" />
            </div>
          </div>

          <div className="card-glass flex flex-wrap items-center gap-3 border-brand-teal/20 bg-brand-teal/5 p-4 text-sm text-white/70">
            <Briefcase className="h-5 w-5 text-brand-teal" />
            <span>
              Reference checks and payslips will attach here once your landlord starts an application workflow in
              production.
            </span>
          </div>
        </div>
      </div>
    </AppPageScaffold>
  );
}
