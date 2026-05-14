import { useState } from "react";
import { User, Bell, Lock, Wallet, Receipt, Shield, Palette, Eye } from "lucide-react";
import useAuthStore from "../../store/authStore";
import { Input } from "../../components/ui/Input";
import AppPageScaffold from "../../components/layout/AppPageScaffold";

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const [tab, setTab] = useState("profile");

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Lock },
    { id: "mfa", label: "Two-factor auth", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "wallet", label: "Wallet", icon: Wallet },
    { id: "billing", label: "Billing", icon: Receipt },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "privacy", label: "Privacy", icon: Eye },
  ];

  return (
    <AppPageScaffold
      variant="vault"
      icon={Shield}
      title="Account & preferences"
      description="Profile, security, billing, and notification controls."
    >
      <div className="flex flex-col gap-6 lg:flex-row">
      <aside className="card-glass h-fit w-full flex-shrink-0 space-y-1 p-2 lg:w-56">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-bold transition ${
              tab === id ? "bg-brand-teal/15 text-brand-teal" : "text-white/55 hover:bg-white/[0.06] hover:text-white"
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </aside>

      <div className="card-glass min-w-0 flex-1 p-6">
        {tab === "profile" && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-white">Profile information</h2>
            <p className="text-xs text-white/45">
              Role <span className="font-bold text-brand-teal">{user?.role || "—"}</span> is assigned by the platform after
              verification (JWT). It cannot be changed from the browser alone.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/[0.04] text-xs font-semibold text-white/45">
                Avatar
              </div>
              <button type="button" className="text-sm font-bold text-brand-teal hover:underline">
                Change photo
              </button>
            </div>
            <Input label="Full name" value={user?.full_name || ""} readOnly className="opacity-80" />
            <Input label="Email" value={user?.email || ""} readOnly className="opacity-80" />
            <Input label="Phone" placeholder="+256 …" />
            <Input label="Date of birth" type="date" />
            <button type="button" className="rounded-xl bg-brand-teal px-5 py-2.5 text-sm font-bold text-[#041208]">
              Save changes
            </button>
          </div>
        )}

        {tab === "security" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white">Security</h2>
            <p className="text-sm text-white/50">Password and active sessions.</p>
            <Input type="password" label="Current password" placeholder="••••••••" />
            <Input type="password" label="New password" placeholder="Min. 8 characters" />
            <button
              type="button"
              className="rounded-xl border border-white/15 px-5 py-2.5 text-sm font-bold text-white hover:bg-white/10"
            >
              Update password
            </button>
          </div>
        )}

        {tab === "mfa" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white">Two-factor authentication</h2>
            <p className="text-sm text-white/50">Add an authenticator app or SMS backup for sensitive actions.</p>
            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3">
              <span className="text-sm font-semibold text-white">Authenticator app (TOTP)</span>
              <input type="checkbox" className="rounded border-white/20 text-brand-teal" />
            </label>
            <Input label="SMS backup number" placeholder="+256 700 123 456" />
            <button type="button" className="rounded-xl bg-brand-teal px-5 py-2.5 text-sm font-bold text-[#041208]">
              Save 2FA settings
            </button>
          </div>
        )}

        {tab === "notifications" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white">Notifications</h2>
            {["Rent reminders", "Maintenance updates", "Marketing & tips"].map((label) => (
              <label
                key={label}
                className="flex cursor-pointer items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3"
              >
                <span className="text-sm font-semibold text-white">{label}</span>
                <input type="checkbox" defaultChecked className="rounded border-white/20 text-brand-teal" />
              </label>
            ))}
          </div>
        )}

        {tab === "wallet" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white">Wallet</h2>
            <p className="text-sm text-white/50">MoMo, bank, cards, and on-chain wallets when your ledger API exposes them.</p>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-white/40">Available</div>
              <div className="mt-1 text-2xl font-extrabold text-white">UGX 0</div>
              <p className="mt-2 text-xs text-white/45">Connect payout methods in production.</p>
            </div>
          </div>
        )}

        {tab === "billing" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white">Billing</h2>
            <p className="text-sm text-white/50">Invoices, service fees, and payment history.</p>
            <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-8 text-center text-sm text-white/45">
              No invoices yet.
            </div>
          </div>
        )}

        {tab === "appearance" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white">Appearance</h2>
            <p className="text-sm text-white/50">Theme follows your RentDirect layout (dark glass). Light mode ships later.</p>
            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 opacity-60">
              <span className="text-sm font-semibold text-white">Compact density</span>
              <input type="checkbox" className="rounded border-white/20 text-brand-teal" />
            </label>
          </div>
        )}

        {tab === "privacy" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white">Privacy</h2>
            <p className="text-sm text-white/50">Control marketing data, download your archive, and manage cookie preferences.</p>
            <button type="button" className="rounded-xl border border-white/15 px-5 py-2.5 text-sm font-bold text-white hover:bg-white/10">
              Request data export
            </button>
          </div>
        )}
      </div>
    </div>
    </AppPageScaffold>
  );
}
