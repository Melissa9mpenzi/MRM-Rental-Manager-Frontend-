import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  Shield,
  CreditCard,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Menu,
  X,
  Users,
  Cpu,
  Check,
} from "lucide-react";
import BrandMark from "../../components/brand/BrandMark";
import SuiTrustLayerSection from "../../components/marketing/SuiTrustLayerSection";

/** Mockup primary — emerald green */
const AC = "#10B981";

const NAV = [
  { label: "Browse Properties", to: "/browse-properties" },
  { label: "How It Works", to: "/#how" },
  { label: "Platform", to: "/#platform" },
  { label: "Sui trust layer", to: "/#trust-layer" },
  { label: "Pricing", to: "/pricing" },
  { label: "Agents", to: "/#agents" },
  { label: "About Us", to: "/about" },
  { label: "Contact", to: "/contact" },
];

const PLATFORM_DISTRIBUTION = [
  { userType: "Tenant", mobile: true, web: true, main: "Mobile-first" },
  { userType: "Landlord", mobile: true, web: true, main: "Web-first" },
  { userType: "Agent", mobile: true, web: true, main: "Web-first" },
  { userType: "Admin", mobile: false, web: true, main: "Web only" },
];

/** Local asset in `public/images` */
const HERO_BG = "/images/hero-villa.jpg";

const TRUST_PILLS = [
  { icon: Shield, title: "NIRA Verified", subtitle: "National ID & anti-fraud compliance" },
  { icon: Building2, title: "KCCA Approved", subtitle: "Property legality & inspections" },
  { icon: CreditCard, title: "URA Compliant", subtitle: "Rental tax & revenue tracking" },
  { icon: Sparkles, title: "Sui + Walrus", subtitle: "On-chain escrow, receipts & decentralized proofs" },
];

const GOV_FLOW = [
  { agency: "NIRA", desc: "Identity verification for every landlord, tenant, and agent." },
  { agency: "KCCA", desc: "Property approval before listings go live on the marketplace." },
  { agency: "URA", desc: "Tax monitoring when rent flows through the platform." },
];

const DEMO_STEPS = [
  "Tenant registers",
  "NIRA verifies identity",
  "Landlord lists property",
  "KCCA approves listing",
  "Tenant books & pays (MTN / Sui)",
  "Escrow + receipt",
  "URA compliance updates",
];

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#060a0e] text-white">
      {/* ── Sticky glass navbar ── */}
      <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#060a0e]/70 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3.5 lg:px-6">
          <Link to="/" className="flex min-w-0 items-center">
            <BrandMark imgClassName="h-10 w-auto max-w-[220px] object-contain sm:h-11" />
          </Link>

          <nav className="hidden items-center gap-5 text-[13px] font-semibold text-white/65 lg:flex">
            {NAV.map((n) =>
              n.to.startsWith("/") && !n.to.includes("#") ? (
                <Link
                  key={n.label}
                  to={n.to}
                  className="whitespace-nowrap text-white/65 transition hover:text-[#10B981]"
                >
                  {n.label}
                </Link>
              ) : (
                <a key={n.label} href={n.to} className="whitespace-nowrap transition hover:text-[#10B981]">
                  {n.label}
                </a>
              ),
            )}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="hidden rounded-xl border border-white/18 px-3.5 py-2 text-xs font-bold text-white/90 transition hover:bg-white/[0.08] sm:inline-block sm:px-4 sm:text-sm"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-xl px-3.5 py-2 text-xs font-bold text-[#041208] shadow-lg transition hover:brightness-110 sm:px-4 sm:text-sm"
              style={{ backgroundColor: AC, boxShadow: `0 8px 28px ${AC}44` }}
            >
              Register
            </Link>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-white/70 lg:hidden"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-white/[0.06] bg-[#0a1018]/95 px-4 py-4 lg:hidden">
            <div className="flex flex-col gap-1">
              {NAV.map((n) =>
                n.to.startsWith("/") && !n.to.includes("#") ? (
                  <Link
                    key={n.label}
                    to={n.to}
                    className="rounded-lg px-3 py-2.5 text-sm font-semibold text-white/80 hover:bg-white/[0.06]"
                    onClick={() => setMobileOpen(false)}
                  >
                    {n.label}
                  </Link>
                ) : (
                  <a
                    key={n.label}
                    href={n.to}
                    className="rounded-lg px-3 py-2.5 text-sm font-semibold text-white/80 hover:bg-white/[0.06]"
                    onClick={() => setMobileOpen(false)}
                  >
                    {n.label}
                  </a>
                ),
              )}
              <Link
                to="/login"
                className="mt-2 rounded-xl border border-white/15 py-2.5 text-center text-sm font-bold text-white"
                onClick={() => setMobileOpen(false)}
              >
                Login
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ── Hero: villa imagery + gradient (mockup) ── */}
      <section className="relative min-h-[min(92vh,900px)] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${HERO_BG})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-[#060a0e]/75 to-[#060a0e]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-10%,rgba(16,185,129,0.18),transparent_55%)]" />

        <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-4 pb-6 pt-16 text-center sm:pt-20 lg:pt-28">
          <div
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white/90 backdrop-blur-md sm:text-xs"
            style={{ borderColor: `${AC}55` }}
          >
            <Sparkles size={14} style={{ color: AC }} />
            DeFi & Payments · Walrus · GovTech on Sui Testnet
          </div>

          <h1 className="text-balance text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl lg:leading-[1.06]">
            Find. Rent. Pay.{" "}
            <span className="block sm:inline">
              <span style={{ color: AC }}>All in One Place.</span>
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">
            <strong className="text-white">Africa&apos;s trusted rental infrastructure</strong> — government-enabled
            PropTech with NIRA, KCCA, and URA compliance, Sui escrow, and hybrid MTN + wallet payments for Kampala and
            beyond.
          </p>

          <div className="mt-10 flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
            <Link
              to="/browse-properties"
              className="inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-3.5 text-base font-bold text-[#041208] transition hover:brightness-110"
              style={{ backgroundColor: AC, boxShadow: `0 12px 40px ${AC}55` }}
            >
              Browse Properties
              <ArrowRight size={18} />
            </Link>
            <a
              href="#how"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/[0.06] px-8 py-3.5 text-base font-bold text-white backdrop-blur-sm transition hover:border-[#10B981]/40 hover:bg-white/[0.1]"
            >
              How It Works
            </a>
          </div>
        </div>

        {/* ── Bottom feature strip (glass bar on hero) ── */}
        <div className="relative z-10 mt-10 sm:mt-14 lg:mt-20">
          <div className="mx-auto max-w-6xl px-4 pb-10 lg:px-6">
            <div className="grid gap-3 rounded-2xl border border-white/[0.1] bg-black/35 p-4 shadow-2xl backdrop-blur-xl sm:grid-cols-2 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-white/[0.08]">
              {TRUST_PILLS.map(({ icon: Icon, title, subtitle }) => (
                <div key={title} className="flex gap-3 rounded-xl px-3 py-3 lg:flex-col lg:items-center lg:text-center lg:py-4">
                  <div
                    className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-white/10"
                    style={{ backgroundColor: `${AC}18`, color: AC }}
                  >
                    <Icon size={20} strokeWidth={2} />
                  </div>
                  <div className="min-w-0 text-left lg:text-center">
                    <div className="text-sm font-bold text-white">{title}</div>
                    <p className="mt-0.5 text-xs leading-snug text-white/50">{subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" className="border-t border-white/[0.06] bg-[#080d12] py-16 lg:py-24">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-extrabold sm:text-3xl">How RentDirect works</h2>
            <p className="mt-3 text-sm text-white/55 sm:text-base">
              Sign up, verify with OTP, choose your role, complete KYC — then access a dashboard tailored to how you use
              the platform.
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {[
              { step: "01", t: "Discover", d: "Browse verified listings with filters that match how people actually search." },
              { step: "02", t: "Transact", d: "Applications, leases, and rent — structured flows instead of scattered chats." },
              { step: "03", t: "Stay aligned", d: "Notifications, messages, and audit-friendly records for every party." },
            ].map((x) => (
              <div
                key={x.step}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm transition hover:border-[#10B981]/30"
              >
                <div className="text-xs font-black uppercase tracking-widest" style={{ color: AC }}>
                  {x.step}
                </div>
                <h3 className="mt-2 text-lg font-bold text-white">{x.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/50">{x.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Platform distribution (web product matrix) ── */}
      <section id="platform" className="scroll-mt-24 border-t border-white/[0.06] bg-[#080d12] py-16 lg:py-24">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white/50">
              Best platform distribution
            </div>
            <h2 className="mt-4 text-2xl font-extrabold sm:text-3xl">Built for how each user works</h2>
            <p className="mt-3 text-sm text-white/55 sm:text-base">
              RentDirect ships on <strong className="text-white">mobile and web</strong> — with a clear “home” platform per role.
              Admins stay on the web for control and auditability.
            </p>
          </div>

          <div className="mt-10 overflow-x-auto rounded-2xl border border-white/[0.1] bg-white/[0.03] backdrop-blur-sm">
            <table className="w-full min-w-[520px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.1] text-[11px] font-bold uppercase tracking-widest text-white/45">
                  <th className="px-4 py-3 pl-5">User type</th>
                  <th className="px-4 py-3">Mobile app</th>
                  <th className="px-4 py-3">Web app</th>
                  <th className="px-4 py-3 pr-5">Main platform</th>
                </tr>
              </thead>
              <tbody>
                {PLATFORM_DISTRIBUTION.map((row) => (
                  <tr key={row.userType} className="border-b border-white/[0.06] last:border-0">
                    <td className="px-4 py-3.5 pl-5 font-bold text-white">{row.userType}</td>
                    <td className="px-4 py-3.5">
                      {row.mobile ? (
                        <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-400">
                          <Check size={16} strokeWidth={3} /> Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 font-semibold text-white/35">
                          <X size={16} strokeWidth={2.5} /> No
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      {row.web ? (
                        <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-400">
                          <Check size={16} strokeWidth={3} /> Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 font-semibold text-white/35">
                          <X size={16} strokeWidth={2.5} /> No
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 pr-5">
                      <span className="rounded-lg bg-white/[0.06] px-2.5 py-1 text-xs font-extrabold tracking-wide text-white/90">
                        {row.main}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Government-enabled infrastructure ── */}
      <section className="border-t border-white/[0.06] bg-[#060a0e] py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-extrabold sm:text-3xl">Government-enabled PropTech</h2>
            <p className="mt-3 text-sm text-white/55">
              NIRA, KCCA, and URA officers are compliance authorities — not ordinary admins. Listings earn trust badges
              only after each agency approves its lane.
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {GOV_FLOW.map((g) => (
              <div
                key={g.agency}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 transition hover:border-emerald-500/30"
              >
                <div className="text-lg font-black text-emerald-400">{g.agency}</div>
                <p className="mt-2 text-sm text-white/55">{g.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SuiTrustLayerSection />

      {/* ── Demo narrative (judges) ── */}
      <section className="border-t border-white/[0.06] bg-gradient-to-b from-[#080d12] to-[#060a0e] py-16">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <h2 className="text-center text-2xl font-extrabold">End-to-end demo flow</h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-sm text-white/50">
            Run seed data, then walk this story in under five minutes.
          </p>
          <ol className="mx-auto mt-10 flex max-w-3xl flex-col gap-2">
            {DEMO_STEPS.map((label, i) => (
              <li
                key={label}
                className="flex items-center gap-4 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3"
              >
                <span
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-black text-[#041208]"
                  style={{ backgroundColor: AC }}
                >
                  {i + 1}
                </span>
                <span className="text-sm font-semibold text-white/85">{label}</span>
              </li>
            ))}
          </ol>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/register" className="enterprise-btn-primary rounded-2xl px-6 py-3">
              Get started
            </Link>
            <Link to="/browse-properties" className="enterprise-btn-ghost rounded-2xl px-6 py-3">
              Browse Kampala listings
            </Link>
          </div>
        </div>
      </section>

      {/* ── Agents CTA ── */}
      <section id="agents" className="border-t border-white/[0.06] py-16 lg:py-20">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 text-center lg:flex-row lg:items-center lg:justify-between lg:px-6 lg:text-left">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white/50">
              <Users size={14} style={{ color: AC }} />
              For agents
            </div>
            <h2 className="mt-4 text-2xl font-extrabold sm:text-3xl">Pipeline, clients, commissions</h2>
            <p className="mt-3 text-sm text-white/55 sm:text-base">
              A web-first workspace for leads, scheduling, and deal tracking — aligned with how agencies operate day to
              day.
            </p>
          </div>
          <Link
            to="/register"
            className="flex-shrink-0 rounded-2xl border border-[#10B981]/40 bg-[#10B981]/10 px-8 py-3.5 text-sm font-bold text-[#10B981] transition hover:bg-[#10B981]/20"
          >
            Get started as an agent
          </Link>
        </div>
      </section>

      {/* ── Capabilities strip (icons like mockup) ── */}
      <section className="border-t border-white/[0.06] bg-[#060a0e] py-12">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-x-10 gap-y-6 px-4 text-center lg:px-6">
          {[
            { icon: Building2, l: "Listings" },
            { icon: Shield, l: "Fraud signals" },
            { icon: Cpu, l: "AI-ready" },
            { icon: CreditCard, l: "Multi-pay" },
            { icon: Sparkles, l: "Smart contracts" },
          ].map(({ icon: Icon, l }) => (
            <div key={l} className="flex w-[100px] flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-white/70">
                <Icon size={22} style={{ color: AC }} />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wide text-white/45">{l}</span>
            </div>
          ))}
        </div>
      </section>

      <div id="pricing" className="scroll-mt-20" />

      <footer id="contact" className="border-t border-white/[0.06] py-12 text-center">
        <p className="text-xs text-white/40">
          © {new Date().getFullYear()} RentDirect UG · Poppins · Lucide · Glass UI · Primary{" "}
          <span className="font-mono text-[#10B981]">#10B981</span>
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs font-semibold">
          <Link to="/browse-properties" className="text-[#10B981] hover:underline">
            Browse
          </Link>
          <Link to="/pricing" className="text-white/50 hover:text-[#10B981]">
            Pricing
          </Link>
          <Link to="/login" className="text-white/50 hover:text-[#10B981]">
            Login
          </Link>
        </div>
      </footer>
    </div>
  );
}
