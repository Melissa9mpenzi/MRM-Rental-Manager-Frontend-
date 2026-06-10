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
} from "lucide-react";
import BrandMark from "../../components/brand/BrandMark";
import SuiTrustLayerSection from "../../components/marketing/SuiTrustLayerSection";

const TEAL = "#0D9488";
const TEAL_LIGHT = "#F0FDFA";

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
    <div className="min-h-screen bg-white text-gray-900">
      {/* ── Sticky navbar ── */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-xl shadow-sm">
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
                  className="whitespace-nowrap transition hover:text-teal-600"
                >
                  {n.label}
                </Link>
              ) : (
                <a key={n.label} href={n.to} className="whitespace-nowrap transition hover:text-teal-600">
                  {n.label}
                </a>
              ),
            )}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="hidden rounded-xl border border-gray-200 px-3.5 py-2 text-xs font-bold text-gray-700 transition hover:border-teal-300 hover:text-teal-600 sm:inline-block sm:px-4 sm:text-sm"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-xl px-3.5 py-2 text-xs font-bold text-white transition hover:opacity-90 sm:px-4 sm:text-sm"
              style={{ backgroundColor: TEAL }}
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
          <div className="border-t border-gray-100 bg-white px-4 py-4 lg:hidden">
            <div className="flex flex-col gap-1">
              {NAV.map((n) =>
                n.to.startsWith("/") && !n.to.includes("#") ? (
                  <Link
                    key={n.label}
                    to={n.to}
                    className="rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-teal-600"
                    onClick={() => setMobileOpen(false)}
                  >
                    {n.label}
                  </Link>
                ) : (
                  <a
                    key={n.label}
                    href={n.to}
                    className="rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-teal-600"
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

      {/* ── Hero: villa imagery with overlay ── */}
      <section className="relative min-h-[min(88vh,820px)] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${HERO_BG})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/45 to-black/70" />
        <div
          className="absolute inset-0 opacity-25"
          style={{ background: `radial-gradient(ellipse 80% 50% at 50% 0%, ${TEAL}88, transparent 60%)` }}
        />

        <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-4 pb-6 pt-16 text-center sm:pt-20 lg:pt-28">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white/95 backdrop-blur-md sm:text-xs">
            <Sparkles size={14} className="text-teal-300" />
            DeFi & Payments · Walrus · GovTech on Sui Testnet
          </div>

          <h1 className="text-balance text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl lg:leading-[1.06]">
            Find. Rent. Pay.{" "}
            <span className="block sm:inline">
              <span className="text-teal-300">All in One Place.</span>
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
            <strong className="text-white">Africa&apos;s trusted rental infrastructure</strong> — government-enabled
            PropTech with NIRA, KCCA, and URA compliance, Sui escrow, and hybrid MTN + wallet payments for Kampala and
            beyond.
          </p>

          <div className="mt-10 flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
            <Link
              to="/browse-properties"
              className="inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-3.5 text-base font-bold text-white transition hover:opacity-90"
              style={{ backgroundColor: TEAL, boxShadow: `0 12px 40px ${TEAL}55` }}
            >
              Browse Properties
              <ArrowRight size={18} />
            </Link>
            <a
              href="#how"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-8 py-3.5 text-base font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              How It Works
            </a>
          </div>
        </div>

        {/* Feature strip on hero */}
        <div className="relative z-10 mt-10 sm:mt-14 lg:mt-20">
          <div className="mx-auto max-w-6xl px-4 pb-10 lg:px-6">
            <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur-xl sm:grid-cols-2 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-white/10">
              {TRUST_PILLS.map(({ icon: Icon, title, subtitle }) => (
                <div key={title} className="flex gap-3 rounded-xl px-3 py-3 lg:flex-col lg:items-center lg:text-center lg:py-4">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-white/20 bg-teal-600/25 text-teal-200">
                    <Icon size={20} strokeWidth={2} />
                  </div>
                  <div className="min-w-0 text-left lg:text-center">
                    <div className="text-sm font-bold text-white">{title}</div>
                    <p className="mt-0.5 text-xs leading-snug text-white/60">{subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" className="border-t border-gray-100 bg-gray-50 py-16 lg:py-24">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">How RentDirect works</h2>
            <p className="mt-3 text-sm text-gray-500 sm:text-base">
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
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:border-teal-200 hover:shadow-md"
              >
                <div className="text-xs font-black uppercase tracking-widest text-teal-600">{x.step}</div>
                <h3 className="mt-2 text-lg font-bold text-gray-900">{x.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{x.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Platform distribution ── */}
      <section id="platform" className="scroll-mt-24 border-t border-gray-100 bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-gray-500">
              Best platform distribution
            </div>
            <h2 className="mt-4 text-2xl font-extrabold text-gray-900 sm:text-3xl">Built for how each user works</h2>
            <p className="mt-3 text-sm text-gray-500 sm:text-base">
              RentDirect ships on <strong className="text-gray-900">mobile and web</strong> — with a clear "home" platform per role.
              Admins stay on the web for control and auditability.
            </p>
          </div>

          <div className="mt-10 overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
            <table className="w-full min-w-[520px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-[11px] font-bold uppercase tracking-widest text-gray-400">
                  <th className="px-4 py-3 pl-5">User type</th>
                  <th className="px-4 py-3">Mobile app</th>
                  <th className="px-4 py-3">Web app</th>
                  <th className="px-4 py-3 pr-5">Main platform</th>
                </tr>
              </thead>
              <tbody>
                {PLATFORM_DISTRIBUTION.map((row) => (
                  <tr key={row.userType} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3.5 pl-5 font-bold text-gray-800">{row.userType}</td>
                    <td className="px-4 py-3.5">
                      {row.mobile ? (
                        <span className="inline-flex items-center gap-1.5 font-semibold text-teal-600">
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
                        <span className="inline-flex items-center gap-1.5 font-semibold text-teal-600">
                          <Check size={16} strokeWidth={3} /> Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 font-semibold text-gray-400">
                          <X size={16} strokeWidth={2.5} /> No
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 pr-5">
                      <span className="rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-extrabold tracking-wide text-teal-700">
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
      <section className="border-t border-gray-100 bg-gray-50 py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">Government-enabled PropTech</h2>
            <p className="mt-3 text-sm text-gray-500">
              NIRA, KCCA, and URA officers are compliance authorities — not ordinary admins. Listings earn trust badges
              only after each agency approves its lane.
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {GOV_FLOW.map((g) => (
              <div
                key={g.agency}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:border-teal-200 hover:shadow-md"
              >
                <div className="text-lg font-black text-teal-600">{g.agency}</div>
                <p className="mt-2 text-sm text-gray-500">{g.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SuiTrustLayerSection />

      {/* ── Demo narrative ── */}
      <section className="border-t border-gray-100 bg-white py-16">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <h2 className="text-center text-2xl font-extrabold text-gray-900">End-to-end demo flow</h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-sm text-gray-500">
            Run seed data, then walk this story in under five minutes.
          </p>
          <ol className="mx-auto mt-10 flex max-w-3xl flex-col gap-2">
            {DEMO_STEPS.map((label, i) => (
              <li
                key={label}
                className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 transition hover:border-teal-200 hover:bg-teal-50"
              >
                <span
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-black text-white"
                  style={{ backgroundColor: TEAL }}
                >
                  {i + 1}
                </span>
                <span className="text-sm font-semibold text-gray-700">{label}</span>
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
      <section id="agents" className="border-t border-gray-100 bg-gray-50 py-16 lg:py-20">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 text-center lg:flex-row lg:items-center lg:justify-between lg:px-6 lg:text-left">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-gray-500">
              <Users size={14} className="text-teal-600" />
              For agents
            </div>
            <h2 className="mt-4 text-2xl font-extrabold text-gray-900 sm:text-3xl">Pipeline, clients, commissions</h2>
            <p className="mt-3 text-sm text-gray-500 sm:text-base">
              A web-first workspace for leads, scheduling, and deal tracking — aligned with how agencies operate day to
              day.
            </p>
          </div>
          <Link
            to="/register"
            className="flex-shrink-0 rounded-2xl border border-teal-200 bg-teal-50 px-8 py-3.5 text-sm font-bold text-teal-700 transition hover:bg-teal-100"
          >
            Get started as an agent
          </Link>
        </div>
      </section>

      {/* ── Capabilities strip ── */}
      <section className="border-t border-gray-100 bg-white py-12">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-x-10 gap-y-6 px-4 text-center lg:px-6">
          {[
            { icon: Building2, l: "Listings" },
            { icon: Shield, l: "Fraud signals" },
            { icon: Cpu, l: "AI-ready" },
            { icon: CreditCard, l: "Multi-pay" },
            { icon: Sparkles, l: "Smart contracts" },
          ].map(({ icon: Icon, l }) => (
            <div key={l} className="flex w-[100px] flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-100 bg-gray-50 transition hover:border-teal-200 hover:bg-teal-50">
                <Icon size={22} className="text-teal-600" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wide text-gray-400">{l}</span>
            </div>
          ))}
        </div>
      </section>

      <div id="pricing" className="scroll-mt-20" />

      <footer id="contact" className="border-t border-gray-100 bg-white py-12 text-center">
        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()} RentDirect UG · Poppins · Lucide · Light UI · Primary{" "}
          <span className="font-mono text-teal-600">#0D9488</span>
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs font-semibold">
          <Link to="/browse-properties" className="text-teal-600 hover:underline">
            Browse
          </Link>
          <Link to="/pricing" className="text-gray-400 hover:text-teal-600">
            Pricing
          </Link>
          <Link to="/login" className="text-gray-400 hover:text-teal-600">
            Login
          </Link>
        </div>
      </footer>
    </div>
  );
}
