import { Link } from "react-router-dom";
import { Mail, MapPin, Users, Building2, Briefcase, Check, ArrowRight } from "lucide-react";
import SuiTrustLayerSection from "../../components/marketing/SuiTrustLayerSection";

const AC = "#10B981";

function Shell({ children, title, eyebrow }) {
  return (
    <div className="mx-auto max-w-4xl pb-12 pt-4 text-white lg:pt-6">
      {eyebrow && (
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/35">{eyebrow}</p>
      )}
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white lg:text-4xl">{title}</h1>
      <div className="mt-8 space-y-8">{children}</div>
      <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.08] pt-8">
        <Link to="/" className="text-sm font-semibold text-white/50 transition hover:text-[#00C896]">
          ← Back to home
        </Link>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/browse-properties"
            className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-bold text-white/80 transition hover:border-white/25 hover:bg-white/[0.06]"
          >
            Browse properties
          </Link>
          <Link
            to="/register"
            className="rounded-xl px-4 py-2.5 text-sm font-bold text-[#041208] transition hover:brightness-110"
            style={{ backgroundColor: AC }}
          >
            Create account <ArrowRight className="ml-1 inline" size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

function AboutContent() {
  return (
    <Shell title="About RentDirect UG" eyebrow="Company">
      <p className="max-w-2xl text-base leading-relaxed text-white/60">
        We connect verified tenants and landlords with UGX-native rent flows, contracts, and operational tools —
        built for Uganda first.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          "Verified listings and clearer rent expectations",
          "Payments and records in one place as you scale",
          "Role-based dashboards for tenants, landlords, and teams",
        ].map((t) => (
          <div
            key={t}
            className="flex gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4 text-sm text-white/65"
          >
            <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#00C896]" />
            {t}
          </div>
        ))}
      </div>

      <SuiTrustLayerSection embedded />
    </Shell>
  );
}

function PricingContent() {
  return (
    <Shell title="Pricing" eyebrow="Plans">
      <p className="max-w-2xl text-base leading-relaxed text-white/60">
        Tenants browse free. Landlords pay <strong className="text-white/80">1.5%</strong> on online rent
        collected plus <strong className="text-white/80">UGX 8,000</strong> per occupied unit per month.
        Agents: enterprise volume pricing — contact sales.
      </p>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="flex flex-col rounded-2xl border border-white/[0.1] bg-white/[0.04] p-6 backdrop-blur-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-500/25 bg-emerald-500/10 text-emerald-400">
            <Users size={22} />
          </div>
          <h2 className="mt-4 text-lg font-extrabold text-white">Tenants</h2>
          <p className="mt-2 text-sm leading-relaxed text-white/50">Search listings, compare areas, and explore verified properties at no cost.</p>
          <ul className="mt-4 space-y-2 text-sm text-white/55">
            <li className="flex gap-2">
              <Check size={16} className="mt-0.5 flex-shrink-0 text-[#00C896]" /> Browse &amp; shortlist
            </li>
            <li className="flex gap-2">
              <Check size={16} className="mt-0.5 flex-shrink-0 text-[#00C896]" /> Pay &amp; lease tools when you rent
            </li>
          </ul>
          <p className="mt-6 text-2xl font-extrabold text-white">
            Free <span className="text-sm font-semibold text-white/40">to browse</span>
          </p>
        </div>

        <div className="relative flex flex-col rounded-2xl border border-[#00C896]/35 bg-[#00C896]/10 p-6 shadow-[0_0_40px_rgba(0,200,150,0.08)]">
          <span className="absolute right-4 top-4 rounded-full bg-[#00C896]/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#00C896]">
            Popular
          </span>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#00C896]/30 bg-[#00C896]/15 text-[#00C896]">
            <Building2 size={22} />
          </div>
          <h2 className="mt-4 text-lg font-extrabold text-white">Landlords</h2>
          <p className="mt-2 text-sm leading-relaxed text-white/55">
            Per active unit pricing so your bill tracks real occupancy — not a flat fee for empty stock.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-white/60">
            <li className="flex gap-2">
              <Check size={16} className="mt-0.5 flex-shrink-0 text-[#00C896]" /> Properties, units &amp; tenants
            </li>
            <li className="flex gap-2">
              <Check size={16} className="mt-0.5 flex-shrink-0 text-[#00C896]" /> Payments &amp; arrears views
            </li>
            <li className="flex gap-2">
              <Check size={16} className="mt-0.5 flex-shrink-0 text-[#00C896]" /> Maintenance &amp; messaging
            </li>
          </ul>
          <p className="mt-6 text-2xl font-extrabold text-white">
            1.5% <span className="text-sm font-semibold text-white/40">online rent</span>
          </p>
          <p className="text-sm text-white/55">+ UGX 8,000 / occupied unit / month</p>
          <p className="mt-2 text-xs text-white/35">Example: UGX 3M rent → UGX 45,000 fee, landlord nets UGX 2.955M</p>
        </div>

        <div className="flex flex-col rounded-2xl border border-white/[0.1] bg-white/[0.04] p-6 backdrop-blur-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/[0.06] text-white/80">
            <Briefcase size={22} />
          </div>
          <h2 className="mt-4 text-lg font-extrabold text-white">Agents &amp; enterprise</h2>
          <p className="mt-2 text-sm leading-relaxed text-white/50">
            Commission tooling, pipeline visibility, and volume pricing for agencies and property managers.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-white/55">
            <li className="flex gap-2">
              <Check size={16} className="mt-0.5 flex-shrink-0 text-[#00C896]" /> Team workflows
            </li>
            <li className="flex gap-2">
              <Check size={16} className="mt-0.5 flex-shrink-0 text-[#00C896]" /> Custom reporting &amp; SLAs
            </li>
          </ul>
          <Link
            to="/contact"
            className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#00C896] hover:underline"
          >
            Contact sales for volume <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-4 text-sm text-white/50">
        Need a tailored quote? Email{" "}
        <a href="mailto:hello@rentdirect.ug" className="font-semibold text-[#00C896] hover:underline">
          hello@rentdirect.ug
        </a>{" "}
        with your unit count and team size.
      </div>
    </Shell>
  );
}

function ContactContent() {
  return (
    <Shell title="Contact" eyebrow="We are here to help">
      <p className="max-w-2xl text-base leading-relaxed text-white/60">
        Enterprise, press, partnerships, or volume pricing — reach the RentDirect UG team in Kampala.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <a
          href="mailto:hello@rentdirect.ug"
          className="group flex gap-4 rounded-2xl border border-white/[0.1] bg-white/[0.04] p-6 transition hover:border-[#00C896]/35 hover:bg-white/[0.06]"
        >
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-[#00C896]/25 bg-[#00C896]/10 text-[#00C896]">
            <Mail size={22} />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-white/40">Email</h2>
            <p className="mt-1 text-lg font-extrabold text-white group-hover:text-[#00C896]">hello@rentdirect.ug</p>
            <p className="mt-2 text-sm text-white/45">We reply within 1–2 business days.</p>
          </div>
        </a>

        <div className="flex gap-4 rounded-2xl border border-white/[0.1] bg-white/[0.04] p-6">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-white/12 bg-white/[0.06] text-white/70">
            <MapPin size={22} />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-white/40">Location</h2>
            <p className="mt-1 text-lg font-extrabold text-white">Kampala, Uganda</p>
            <p className="mt-2 text-sm text-white/45">Enterprise &amp; press enquiries welcome. On-site meetings by appointment.</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-6 text-center">
        <p className="text-sm text-white/55">
          Prefer a quick overview of landlord or agent pricing first?
        </p>
        <Link to="/pricing" className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-[#00C896] hover:underline">
          View pricing <ArrowRight size={14} />
        </Link>
      </div>
    </Shell>
  );
}

export default function StaticInfoPage({ page }) {
  if (page === "pricing") return <PricingContent />;
  if (page === "contact") return <ContactContent />;
  return <AboutContent />;
}
