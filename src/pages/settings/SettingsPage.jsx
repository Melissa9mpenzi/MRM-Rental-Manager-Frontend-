import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { User, Bell, Lock, Wallet, Receipt, Shield, Palette, Eye } from "lucide-react";
import toast from "react-hot-toast";
import useAuthStore from "../../store/authStore";
import { Input } from "../../components/ui/Input";
import AppPageScaffold from "../../components/layout/AppPageScaffold";
import { usersApi } from "../../api/usersApi";
import { tenantPortalApi } from "../../api/tenantPortalApi";

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const [tab, setTab] = useState("profile");
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [curPw, setCurPw] = useState("");
  const [newPw, setNewPw] = useState("");

  useEffect(() => {
    setFullName(user?.full_name || "");
    setPhone(user?.phone || "");
  }, [user?.full_name, user?.phone]);

  const profileMut = useMutation({
    mutationFn: () => usersApi.putMe({ full_name: fullName.trim(), phone: phone.trim() || undefined }),
    onSuccess: (u) => {
      updateUser(u);
      toast.success("Profile saved.");
    },
    onError: () => toast.error("Could not save profile."),
  });

  const pwMut = useMutation({
    mutationFn: () => usersApi.changePassword(curPw, newPw),
    onSuccess: () => {
      toast.success("Password updated.");
      setCurPw("");
      setNewPw("");
    },
    onError: () => toast.error("Password update failed. Check your current password."),
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ["tenant-my-invoices-settings"],
    queryFn: () => tenantPortalApi.myInvoices(),
    enabled: user?.role === "tenant" && tab === "billing",
    retry: false,
  });
  const invRows = Array.isArray(invoices) ? invoices : [];

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
      description="Profile and security are saved to your API."
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
                Role <span className="font-bold text-brand-teal">{user?.role || "—"}</span> comes from your JWT. Use{" "}
                <span className="font-mono text-[10px]">PUT /users/me</span> for name and phone.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/[0.04] text-xs font-semibold text-white/45">
                  Avatar
                </div>
                <button type="button" className="text-sm font-bold text-brand-teal/50" disabled>
                  Change photo
                </button>
              </div>
              <Input label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              <Input label="Email" value={user?.email || ""} readOnly className="opacity-80" />
              <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+256 …" />
              <Input label="Date of birth" type="date" disabled className="opacity-50" />
              <button
                type="button"
                disabled={profileMut.isPending}
                onClick={() => profileMut.mutate()}
                className="rounded-xl bg-brand-teal px-5 py-2.5 text-sm font-bold text-[#041208] disabled:opacity-50"
              >
                {profileMut.isPending ? "Saving…" : "Save changes"}
              </button>
            </div>
          )}

          {tab === "security" && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white">Security</h2>
              <p className="text-sm text-white/50">Uses POST /users/me/change-password.</p>
              <Input type="password" label="Current password" value={curPw} onChange={(e) => setCurPw(e.target.value)} placeholder="••••••••" />
              <Input type="password" label="New password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="Min. 6 characters" />
              <button
                type="button"
                disabled={pwMut.isPending || !curPw || !newPw}
                onClick={() => pwMut.mutate()}
                className="rounded-xl border border-white/15 px-5 py-2.5 text-sm font-bold text-white hover:bg-white/10 disabled:opacity-50"
              >
                {pwMut.isPending ? "Updating…" : "Update password"}
              </button>
            </div>
          )}

          {tab === "mfa" && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white">Two-factor authentication</h2>
              <p className="text-sm text-white/50">Not configured in the API yet.</p>
              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 opacity-50">
                <span className="text-sm font-semibold text-white">Authenticator app (TOTP)</span>
                <input type="checkbox" disabled className="rounded border-white/20 text-brand-teal" />
              </label>
              <Input label="SMS backup number" placeholder="+256 700 123 456" disabled className="opacity-50" />
              <button type="button" disabled className="rounded-xl bg-brand-teal/40 px-5 py-2.5 text-sm font-bold text-[#041208]">
                Save 2FA settings
              </button>
            </div>
          )}

          {tab === "notifications" && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white">Notifications</h2>
              <p className="text-sm text-white/50">Preference API not wired — toggles are local only.</p>
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
              <p className="text-sm text-white/50">Open your role wallet page for balances from the ledger API.</p>
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4">
                <div className="text-xs font-bold uppercase tracking-wide text-white/40">Available</div>
                <div className="mt-1 text-2xl font-extrabold text-white">—</div>
              </div>
            </div>
          )}

          {tab === "billing" && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white">Billing</h2>
              <p className="text-sm text-white/50">
                {user?.role === "tenant" ? "Invoices from GET /tenant/my-invoices." : "Landlord billing is under Payments in the sidebar."}
              </p>
              {user?.role === "tenant" ? (
                invRows.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-8 text-center text-sm text-white/45">
                    No invoices yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-white/[0.08]">
                    <table className="w-full text-left text-sm text-white/80">
                      <thead className="border-b border-white/[0.08] text-xs uppercase text-white/40">
                        <tr>
                          <th className="px-3 py-2">#</th>
                          <th className="px-3 py-2">Due</th>
                          <th className="px-3 py-2">Balance</th>
                          <th className="px-3 py-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.06]">
                        {invRows.map((inv) => (
                          <tr key={inv.id}>
                            <td className="px-3 py-2 font-mono text-xs">{inv.invoice_number}</td>
                            <td className="px-3 py-2">{inv.due_date}</td>
                            <td className="px-3 py-2">UGX {Number(inv.balance_due || 0).toLocaleString()}</td>
                            <td className="px-3 py-2">{inv.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              ) : (
                <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-8 text-center text-sm text-white/45">
                  Use landlord payments and invoices in the app menu.
                </div>
              )}
            </div>
          )}

          {tab === "appearance" && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white">Appearance</h2>
              <p className="text-sm text-white/50">Theme follows your RentDirect layout (dark glass).</p>
              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 opacity-60">
                <span className="text-sm font-semibold text-white">Compact density</span>
                <input type="checkbox" className="rounded border-white/20 text-brand-teal" />
              </label>
            </div>
          )}

          {tab === "privacy" && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white">Privacy</h2>
              <p className="text-sm text-white/50">Data export is not exposed on the API yet.</p>
              <button type="button" disabled className="rounded-xl border border-white/15 px-5 py-2.5 text-sm font-bold text-white/40">
                Request data export
              </button>
            </div>
          )}
        </div>
      </div>
    </AppPageScaffold>
  );
}
