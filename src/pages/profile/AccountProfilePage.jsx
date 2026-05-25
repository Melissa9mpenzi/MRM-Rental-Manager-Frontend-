import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { User, Shield, Lock } from "lucide-react";
import toast from "react-hot-toast";
import useAuthStore from "../../store/authStore";
import { Input } from "../../components/ui/Input";
import AppPageScaffold from "../../components/layout/AppPageScaffold";
import { usersApi } from "../../api/usersApi";
import { tenantPortalApi } from "../../api/tenantPortalApi";
import { settingsPathForRole } from "../../config/access";
import { userInitials } from "../../lib/userInitials";
import { LoadingPanel } from "../../components/ui/StatePanel";

const ROLE_LABELS = {
  tenant: "Tenant",
  landlord: "Landlord",
  staff: "Agent",
  agent: "Agent",
};

export default function AccountProfilePage() {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const role = user?.role ?? "landlord";
  const settingsPath = settingsPathForRole(role);
  const isTenant = role === "tenant";

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [email, setEmail] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [tenantNationalId, setTenantNationalId] = useState("");

  const { data: me, isLoading: meLoading } = useQuery({
    queryKey: ["users-me"],
    queryFn: () => usersApi.getMe(),
    staleTime: 30_000,
  });

  const {
    data: tenantRecord,
    isLoading: tenantLoading,
    isError: tenantMissing,
  } = useQuery({
    queryKey: ["tenant-me-profile"],
    queryFn: () => tenantPortalApi.myProfile(),
    enabled: isTenant,
    retry: false,
  });

  useEffect(() => {
    const src = me || user;
    if (!src) return;
    setFullName(src.full_name || "");
    setPhone(src.phone || "");
    setNationalId(src.national_id_number || "");
    setEmail(src.email || "");
  }, [me, user]);

  useEffect(() => {
    if (!tenantRecord) return;
    if (tenantRecord.phone) setPhone(tenantRecord.phone);
    if (tenantRecord.email) setEmail(tenantRecord.email);
    setEmergencyName(tenantRecord.emergency_contact_name || "");
    setEmergencyPhone(tenantRecord.emergency_contact_phone || "");
    setTenantNationalId(tenantRecord.national_id || "");
  }, [tenantRecord]);

  const saveMut = useMutation({
    mutationFn: async () => {
      const name = fullName.trim();
      if (!name) throw new Error("Full name is required.");

      const updatedUser = await usersApi.putMe({
        full_name: name,
        phone: phone.trim() || undefined,
        national_id_number: nationalId.trim() || undefined,
      });

      if (isTenant && tenantRecord && !tenantMissing) {
        await tenantPortalApi.updateMe({
          phone: phone.trim() || undefined,
          email: email.trim() || undefined,
          national_id: tenantNationalId.trim() || undefined,
          emergency_contact_name: emergencyName.trim() || undefined,
          emergency_contact_phone: emergencyPhone.trim() || undefined,
        });
      }

      return updatedUser;
    },
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      qc.invalidateQueries({ queryKey: ["users-me"] });
      qc.invalidateQueries({ queryKey: ["tenant-me-profile"] });
      toast.success("Profile saved.");
    },
    onError: (err) => {
      toast.error(err?.message || "Could not save profile.");
    },
  });

  const loading = meLoading || (isTenant && tenantLoading && !tenantMissing);
  const initials = userInitials(fullName || user?.full_name);

  return (
    <AppPageScaffold
      variant="vault"
      icon={User}
      title="Your profile"
      description="Update your account details. Changes are saved to your RentDirect account."
      actions={
        <Link
          to={settingsPath}
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 px-4 py-2 text-sm font-bold text-white/80 transition hover:bg-white/10"
        >
          <Lock size={14} />
          Password & security
        </Link>
      }
    >
      {loading ? (
        <LoadingPanel className="h-48" />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <div className="card-glass space-y-4 p-6">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-teal/40 to-sky-500/30 text-2xl font-bold text-white ring-2 ring-white/10">
              {initials}
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-white">{fullName || user?.full_name || "—"}</div>
              <div className="mt-0.5 text-xs text-white/45">{user?.email}</div>
              <div className="mt-3 inline-flex items-center gap-1 rounded-full border border-brand-teal/30 bg-brand-teal/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-teal">
                <Shield size={12} />
                {ROLE_LABELS[role] || "User"}
              </div>
            </div>
            {isTenant && tenantMissing && (
              <p className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-[11px] leading-snug text-amber-100">
                No rental record linked yet. You can still update your login account below. Accept a landlord invite to
                link your tenant profile.
              </p>
            )}
          </div>

          <form
            className="card-glass space-y-6 p-6"
            onSubmit={(e) => {
              e.preventDefault();
              saveMut.mutate();
            }}
          >
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white/40">Account</h2>
              <p className="mt-1 text-xs text-white/45">Name and phone used across the platform.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
              <Input label="Email" value={user?.email || ""} readOnly className="opacity-80" />
              <Input
                label="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+256 700 000 000"
              />
              <Input
                label="National ID (account)"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                placeholder="CM…"
              />
            </div>

            {isTenant && tenantRecord && !tenantMissing && (
              <>
                <div className="border-t border-white/10 pt-6">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-white/40">Rental profile</h2>
                  <p className="mt-1 text-xs text-white/45">
                    Contact details your landlord sees on your tenancy record.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Contact email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                  />
                  <Input
                    label="National ID (tenancy)"
                    value={tenantNationalId}
                    onChange={(e) => setTenantNationalId(e.target.value)}
                  />
                  <Input
                    label="Emergency contact name"
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                  />
                  <Input
                    label="Emergency contact phone"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="flex flex-wrap gap-3 border-t border-white/10 pt-4">
              <button
                type="submit"
                disabled={saveMut.isPending}
                className="rounded-xl bg-brand-teal px-5 py-2.5 text-sm font-bold text-[#041208] disabled:opacity-50"
              >
                {saveMut.isPending ? "Saving…" : "Save profile"}
              </button>
              <Link
                to={settingsPath}
                className="inline-flex items-center rounded-xl border border-white/15 px-5 py-2.5 text-sm font-bold text-white/75 hover:bg-white/10"
              >
                Account settings
              </Link>
            </div>
          </form>
        </div>
      )}
    </AppPageScaffold>
  );
}
