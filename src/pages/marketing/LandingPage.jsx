import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  Shield,
  CreditCard,
  Sparkles,
  ArrowRight,
  Menu,
  X,
  Users,
  Cpu,
  Check,
  Zap,
} from "lucide-react";
import BrandMark from "../../components/brand/BrandMark";
import SuiTrustLayerSection from "../../components/marketing/SuiTrustLayerSection";

const EMERALD = "#10B981";
const EMERALD_DARK = "#059669";
const VIOLET = "#7C3AED";
const AMBER = "#F59E0B";

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

const HERO_BG = "/images/hero-villa.jpg";

const TRUST_PILLS = [
  { icon: Shield, title: "NIRA Verified", subtitle: "National ID & anti-fraud compliance", color: "from-emerald-500 to-teal-500" },
  { icon: Building2, title: "KCCA Approved", subtitle: "Property legality & inspections", color: "from-violet-500 to-purple-600" },
  { icon: CreditCard, title: "URA Compliant", subtitle: "Rental tax & revenue tracking", color: "from-amber-400 to-orange-500" },
  { icon: Sparkles, title: "Sui + Walrus", subtitle: "On-chain escrow, receipts & decentralized proofs", color: "from-sky-500 to-blue-600" },
];

const GOV_FLOW = [
  { agency: "NIRA", desc: "Identity verification for every landlord, tenant, and agent.", gradient: "from-emerald-500 to-teal-600", light: "bg-emerald-50 border-emerald-200" },
  { agency: "KCCA", desc: "Property approval before listings go live on the marketplace.", gradient: "from-violet-500 to-purple-600", light: "bg-violet-50 border-violet-200" },
  { agency: "URA", desc: "Tax monitoring when rent flows through the platform.", gradient: "from-amber-400 to-orange-500", light: "bg-amber-50 border-amber-200" },
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
    <div className="min-h-screen bg-white text-gray-900">
      {/* ── Sticky navbar ── */}
      <header className="sticky top-0 z-50 border-b border-emerald-100 bg-white/95 backdrop-blur-xl shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3.5 lg:px-6">
          <Link to="/" className="flex min-w-0 items-center">
            <BrandMark imgClassName="h-10 w-auto max-w-[220px] object-contain sm:h-11" />
          </Link>

          <nav className="hidden items-center gap-5 text-[13px] font-semibold text-gray-600 lg:flex">
            {NAV.map((n) =>
              n.to.startsWith("/") && !n.to.includes("#") ? (
                <Link
                  key={n.label}
                  to={n.to}
                  className="whitespace-nowrap transition hover:text-emerald-600"
                >
                  {n.label}
                </Link>
              ) : (
                <a key={n.label} href={n.to} className="whitespace-nowrap transition hover:text-emerald-600">
                  {n.label}
                </a>
              ),
            )}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="hidden rounded-xl border border-gray-200 px-3.5 py-2 text-xs font-bold text-gray-700 transition hover:border-emerald-300 hover:text-emerald-600 sm:inline-block sm:px-4 sm:text-sm"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-xl px-3.5 py-2 text-xs font-bold text-white transition hover:opacity-90 sm:px-4 sm:text-sm"
              style={{ background: `linear-gradient(135deg, ${EMERALD}, ${EMERALD_DARK})`, boxShadow: `0 4px 14px ${EMERALD}55` }}
            >
              Register
            </Link>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-500 lg:hidden"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-emerald-100 bg-white px-4 py-4 lg:hidden">
            <div className="flex flex-col gap-1">
              {NAV.map((n) =>
                n.to.startsWith("/") && !n.to.includes("#") ? (
                  <Link
                    key={n.label}
                    to={n.to}
                    className="rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-600"
                    onClick={() => setMobileOpen(false)}
                  >
                    {n.label}
                  </Link>
                ) : (
                  <a
                    key={n.label}
                    href={n.to}
                    className="rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-600"
                    onClick={() => setMobileOpen(false)}
                  >
                    {n.label}
                  </a>
                ),
              )}
              <Link
                to="/login"
                className="mt-2 rounded-xl border border-gray-200 py-2.5 text-center text-sm font-bold text-gray-700"
                onClick={() => setMobileOpen(false)}
              >
                Login
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ── Hero: vibrant gradient with photo overlay ── */}
      <section className="relative min-h-[min(88vh,820px)] overflow-hidden">
        {/* Photo layer */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${HERO_BG})` }}
        />
        {/* Vivid gradient overlay — teal-to-violet, not dark black */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(5,150,105,0.82) 0%, rgba(16,185,129,0.72) 30%, rgba(124,58,237,0.65) 70%, rgba(15,23,42,0.80) 100%)",
          }}
        />
        {/* Bright radial highlight at top */}
        <div
          className="absolute inset-0 opacity-40"
          style={{ background: "radial-gradient(ellipse 70% 45% at 50% 0%, #34d39966, transparent 60%)" }}
        />
        {/* Subtle animated shimmer dots */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "40px 40px" }}
        />

        <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-4 pb-6 pt-16 text-center sm:pt-20 lg:pt-28">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur-md sm:text-xs"
            style={{ boxShadow: "0 0 20px rgba(52,211,153,0.3)" }}>
            <Sparkles size={14} className="text-yellow-300" />
            DeFi & Payments · Walrus · GovTech on Sui Testnet
          </div>

          <h1 className="text-balance text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl lg:leading-[1.06]">
            Find. Rent. Pay.{" "}
            <span className="block sm:inline">
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(90deg, #6ee7b7, #fbbf24, #a78bfa)" }}
              >
                All in One Place.
              </span>
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
            <strong className="text-white">Africa&apos;s trusted rental infrastructure</strong> — government-enabled
            PropTech with NIRA, KCCA, and URA compliance, Sui escrow, and hybrid MTN + wallet payments for Kampala and
            beyond.
          </p>

          <div className="mt-10 flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
            <Link
              to="/browse-properties"
              className="inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-3.5 text-base font-bold text-white transition hover:scale-[1.03] active:scale-100"
              style={{
                background: "linear-gradient(135deg, #10B981, #059669)",
                boxShadow: "0 8px 32px rgba(16,185,129,0.45), inset 0 1px 0 rgba(255,255,255,0.2)",
              }}
            >
              Browse Properties
              <ArrowRight size={18} />
            </Link>
            <a
              href="#how"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/40 bg-white/15 px-8 py-3.5 text-base font-bold text-white backdrop-blur-sm transition hover:bg-white/25"
            >
              How It Works
            </a>
          </div>
        </div>

        {/* Trust pills strip on hero */}
        <div className="relative z-10 mt-10 sm:mt-14 lg:mt-20">
          <div className="mx-auto max-w-6xl px-4 pb-10 lg:px-6">
            <div className="grid gap-3 rounded-2xl border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur-xl sm:grid-cols-2 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-white/15">
              {TRUST_PILLS.map(({ icon: Icon, title, subtitle, color }) => (
                <div key={title} className="flex gap-3 rounded-xl px-3 py-3 lg:flex-col lg:items-center lg:text-center lg:py-4">
                  <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${color} text-white shadow-lg`}>
                    <Icon size={20} strokeWidth={2} />
                  </div>
                  <div className="min-w-0 text-left lg:text-center">
                    <div className="text-sm font-bold text-white">{title}</div>
                    <p className="mt-0.5 text-xs leading-snug text-white/65">{subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" className="py-16 lg:py-24" style={{ background: "linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)" }}>
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-emerald-700">
              <Zap size={12} /> Simple &amp; Fast
            </div>
            <h2 className="mt-4 text-2xl font-extrabold text-gray-900 sm:text-3xl">How RentDirect works</h2>
            <p className="mt-3 text-sm text-gray-500 sm:text-base">
              Sign up, verify with OTP, choose your role, complete KYC — then access a dashboard tailored to how you use
              the platform.
            </p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            {[
              { step: "01", t: "Discover", d: "Browse verified listings with filters that match how people actually search.", grad: "from-emerald-400 to-teal-500" },
              { step: "02", t: "Transact", d: "Applications, leases, and rent — structured flows instead of scattered chats.", grad: "from-violet-500 to-purple-600" },
              { step: "03", t: "Stay aligned", d: "Notifications, messages, and audit-friendly records for every party.", grad: "from-amber-400 to-orange-500" },
            ].map((x) => (
              <div
                key={x.step}
                className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-md transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${x.grad} text-white text-lg font-black shadow-lg`}>
                  {x.step}
                </div>
                <h3 className="text-lg font-bold text-gray-900">{x.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{x.d}</p>
                {/* Decorative corner blob */}
                <div className={`pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br ${x.grad} opacity-10`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Platform distribution ── */}
      <section id="platform" className="scroll-mt-24 py-16 lg:py-24" style={{ background: "linear-gradient(135deg, #7c3aed08 0%, #10b98108 50%, #f59e0b08 100%)" }}>
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-violet-700">
              Best platform distribution
            </div>
            <h2 className="mt-4 text-2xl font-extrabold text-gray-900 sm:text-3xl">Built for how each user works</h2>
            <p className="mt-3 text-sm text-gray-500 sm:text-base">
              RentDirect ships on <strong className="text-gray-900">mobile and web</strong> — with a clear "home" platform per role.
              Admins stay on the web for control and auditability.
            </p>
          </div>

          <div className="mt-10 overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-lg">
            <table className="w-full min-w-[520px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-[11px] font-bold uppercase tracking-widest text-gray-400"
                  style={{ background: "linear-gradient(90deg, #f0fdf4, #f5f3ff)" }}>
                  <th className="px-4 py-3.5 pl-5">User type</th>
                  <th className="px-4 py-3.5">Mobile app</th>
                  <th className="px-4 py-3.5">Web app</th>
                  <th className="px-4 py-3.5 pr-5">Main platform</th>
                </tr>
              </thead>
              <tbody>
                {PLATFORM_DISTRIBUTION.map((row) => (
                  <tr key={row.userType} className="border-b border-gray-50 last:border-0 transition-colors hover:bg-emerald-50/50">
                    <td className="px-4 py-3.5 pl-5 font-bold text-gray-800">{row.userType}</td>
                    <td className="px-4 py-3.5">
                      {row.mobile ? (
                        <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600">
                          <Check size={16} strokeWidth={3} /> Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 font-semibold text-gray-400">
                          <X size={16} strokeWidth={2.5} /> No
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      {row.web ? (
                        <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600">
                          <Check size={16} strokeWidth={3} /> Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 font-semibold text-gray-400">
                          <X size={16} strokeWidth={2.5} /> No
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 pr-5">
                      <span className="rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-2.5 py-1 text-xs font-extrabold tracking-wide text-white shadow-sm">
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
      <section className="py-16 lg:py-20" style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #065f46 100%)" }}>
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white/90 backdrop-blur-sm">
              Government-enabled PropTech
            </div>
            <h2 className="mt-4 text-2xl font-extrabold text-white sm:text-3xl">NIRA, KCCA, and URA</h2>
            <p className="mt-3 text-sm text-white/65">
              Compliance authorities — not ordinary admins. Listings earn trust badges only after each agency approves its lane.
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {GOV_FLOW.map((g) => (
              <div
                key={g.agency}
                className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur-sm transition hover:bg-white/15"
              >
                <div className={`mb-3 inline-flex items-center justify-center rounded-xl bg-gradient-to-br ${g.gradient} px-4 py-1.5 text-lg font-black text-white shadow-lg`}>
                  {g.agency}
                </div>
                <p className="text-sm text-white/75">{g.desc}</p>
                <div className={`pointer-events-none absolute -bottom-4 -right-4 h-16 w-16 rounded-full bg-gradient-to-br ${g.gradient} opacity-20 blur-md`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <SuiTrustLayerSection />

      {/* ── Demo narrative ── */}
      <section className="py-16" style={{ background: "linear-gradient(180deg, #fafff9 0%, #f0fdf4 100%)" }}>
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <div className="inline-flex w-full justify-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-emerald-700 mb-3">
              <Zap size={12} /> 5-minute walkthrough
            </div>
          </div>
          <h2 className="text-center text-2xl font-extrabold text-gray-900">End-to-end demo flow</h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-sm text-gray-500">
            Run seed data, then walk this story in under five minutes.
          </p>
          <ol className="mx-auto mt-10 flex max-w-3xl flex-col gap-2">
            {DEMO_STEPS.map((label, i) => (
              <li
                key={label}
                className="flex items-center gap-4 rounded-xl border border-emerald-100 bg-white px-4 py-3 shadow-sm transition hover:border-emerald-300 hover:shadow-md hover:-translate-x-1"
              >
                <span
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-black text-white shadow-md"
                  style={{ background: `linear-gradient(135deg, ${EMERALD}, ${EMERALD_DARK})` }}
                >
                  {i + 1}
                </span>
                <span className="text-sm font-semibold text-gray-700">{label}</span>
              </li>
            ))}
          </ol>
          <div className="mt-8 flex justify-center gap-3">
            <Link
              to="/register"
              className="rounded-2xl px-6 py-3 text-sm font-bold text-white transition hover:opacity-90"
              style={{ background: `linear-gradient(135deg, ${EMERALD}, ${EMERALD_DARK})`, boxShadow: `0 8px 24px ${EMERALD}45` }}
            >
              Get started
            </Link>
            <Link
              to="/browse-properties"
              className="rounded-2xl border border-emerald-200 bg-white px-6 py-3 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50"
            >
              Browse Kampala listings
            </Link>
          </div>
        </div>
      </section>

      {/* ── Agents CTA ── */}
      <section id="agents" className="py-16 lg:py-20" style={{ background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #0891b2 100%)" }}>
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 text-center lg:flex-row lg:items-center lg:justify-between lg:px-6 lg:text-left">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white backdrop-blur-sm">
              <Users size={14} />
              For agents
            </div>
            <h2 className="mt-4 text-2xl font-extrabold text-white sm:text-3xl">Pipeline, clients, commissions</h2>
            <p className="mt-3 text-sm text-white/70 sm:text-base">
              A web-first workspace for leads, scheduling, and deal tracking — aligned with how agencies operate day to
              day.
            </p>
          </div>
          <Link
            to="/register"
            className="flex-shrink-0 rounded-2xl bg-white px-8 py-3.5 text-sm font-bold text-violet-700 shadow-lg transition hover:shadow-xl hover:scale-[1.03] active:scale-100"
          >
            Get started as an agent
          </Link>
        </div>
      </section>

      {/* ── Capabilities strip ── */}
      <section className="border-t border-gray-100 bg-white py-12">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-x-10 gap-y-6 px-4 text-center lg:px-6">
          {[
            { icon: Building2, l: "Listings", grad: "from-emerald-400 to-teal-500" },
            { icon: Shield, l: "Fraud signals", grad: "from-red-400 to-rose-500" },
            { icon: Cpu, l: "AI-ready", grad: "from-violet-500 to-purple-600" },
            { icon: CreditCard, l: "Multi-pay", grad: "from-amber-400 to-orange-500" },
            { icon: Sparkles, l: "Smart contracts", grad: "from-sky-400 to-blue-500" },
          ].map(({ icon: Icon, l, grad }) => (
            <div key={l} className="flex w-[100px] flex-col items-center gap-2">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${grad} text-white shadow-md transition hover:scale-110 hover:shadow-lg`}>
                <Icon size={22} strokeWidth={2} />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wide text-gray-500">{l}</span>
            </div>
          ))}
        </div>
      </section>

      <div id="pricing" className="scroll-mt-20" />

      <footer id="contact" className="border-t border-gray-100 bg-white py-12 text-center">
        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()} RentDirect UG · Poppins · Lucide · Glass UI · Primary{" "}
          <span className="font-mono text-emerald-600">#10B981</span>
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs font-semibold">
          <Link to="/browse-properties" className="text-emerald-600 hover:underline">
            Browse
          </Link>
          <Link to="/pricing" className="text-gray-400 hover:text-emerald-600">
            Pricing
          </Link>
          <Link to="/login" className="text-gray-400 hover:text-emerald-600">
            Login
          </Link>
        </div>
      </footer>
    </div>
  );
}
