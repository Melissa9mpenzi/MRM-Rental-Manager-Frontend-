import { Link } from "react-router-dom";
import { Input } from "../ui/Input";
import {
  SettingsActions,
  SettingsEmpty,
  SettingsFieldRow,
  SettingsSection,
  SettingsStatusBadge,
} from "./SettingsPortal";

export function ProfileSettingsSection({
  user,
  profilePath,
  fullName,
  setFullName,
  phone,
  setPhone,
  nationalId,
  setNationalId,
  profileMut,
}) {
  return (
    <>
      <SettingsSection
        title="Account identity"
        subtitle="Legal name and contact details synced to your RentDirect profile."
        badge={<SettingsStatusBadge status="ok">{user?.role || "user"}</SettingsStatusBadge>}
      >
        <SettingsFieldRow label="Account role" value={user?.role?.replace(/_/g, " ")} />
        <SettingsFieldRow label="Email" value={user?.email} mono />
        {profilePath ? (
          <p className="pt-2 text-xs text-white/45">
            Need KYC or role-specific fields?{" "}
            <Link to={profilePath} className="font-bold text-[#00C896] hover:underline">
              Open full profile editor
            </Link>
          </p>
        ) : null}
      </SettingsSection>

      <SettingsSection title="Profile details" subtitle="Updates are saved immediately to the API.">
        <div className="mb-4 flex flex-wrap items-center gap-4">
          <div className="settings-portal__avatar">Photo</div>
          <p className="text-xs text-white/40">Avatar upload — coming in a future release.</p>
        </div>
        <div className="space-y-4">
          <Input label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+256 …" />
          <Input
            label="National ID"
            value={nationalId}
            onChange={(e) => setNationalId(e.target.value)}
            placeholder="CM…"
          />
        </div>
        <SettingsActions>
          <button
            type="button"
            disabled={profileMut.isPending}
            onClick={() => profileMut.mutate()}
            className="settings-portal__btn-primary"
          >
            {profileMut.isPending ? "Saving…" : "Save profile"}
          </button>
        </SettingsActions>
      </SettingsSection>
    </>
  );
}

export function SecuritySettingsSection({
  curPw,
  setCurPw,
  newPw,
  setNewPw,
  pwMut,
  totpEnabled,
  totpSetup,
  totpCode,
  setTotpCode,
  disableCode,
  setDisableCode,
  setupTotpMut,
  enableTotpMut,
  disableTotpMut,
}) {
  return (
    <>
      <SettingsSection title="Password" subtitle="Rotate credentials used for email sign-in." tone="amber">
        <div className="space-y-4">
          <Input type="password" label="Current password" value={curPw} onChange={(e) => setCurPw(e.target.value)} placeholder="••••••••" />
          <Input type="password" label="New password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="Min. 6 characters" />
        </div>
        <SettingsActions>
          <button
            type="button"
            disabled={pwMut.isPending || !curPw || !newPw}
            onClick={() => pwMut.mutate()}
            className="settings-portal__btn-secondary"
          >
            {pwMut.isPending ? "Updating…" : "Update password"}
          </button>
        </SettingsActions>
      </SettingsSection>

      <SettingsSection
        title="Two-factor authentication"
        subtitle="TOTP authenticator required at sign-in when enabled."
        tone="violet"
        badge={
          <SettingsStatusBadge status={totpEnabled ? "ok" : "neutral"}>
            {totpEnabled ? "Enabled" : "Disabled"}
          </SettingsStatusBadge>
        }
      >
        {totpEnabled ? (
          <>
            <p className="mb-4 text-sm text-white/55">
              Your account requires a 6-digit code from your authenticator app after password entry.
            </p>
            <Input
              label="Authenticator code to disable"
              value={disableCode}
              onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
            />
            <SettingsActions>
              <button
                type="button"
                disabled={disableTotpMut.isPending || disableCode.length < 6}
                onClick={() => disableTotpMut.mutate()}
                className="settings-portal__btn-danger"
              >
                {disableTotpMut.isPending ? "Disabling…" : "Disable 2FA"}
              </button>
            </SettingsActions>
          </>
        ) : totpSetup ? (
          <div className="space-y-4">
            {totpSetup.qr_png_base64 ? (
              <img
                src={`data:image/png;base64,${totpSetup.qr_png_base64}`}
                alt="2FA QR code"
                className="mx-auto h-44 w-44 rounded-xl border border-white/10 bg-white p-2"
              />
            ) : null}
            <SettingsFieldRow label="Manual key" value={totpSetup.secret} mono />
            <Input
              label="Verification code"
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
            />
            <SettingsActions>
              <button
                type="button"
                disabled={enableTotpMut.isPending || totpCode.length < 6}
                onClick={() => enableTotpMut.mutate()}
                className="settings-portal__btn-primary"
              >
                {enableTotpMut.isPending ? "Enabling…" : "Confirm & enable 2FA"}
              </button>
            </SettingsActions>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-white/55">
              Compatible with Google Authenticator, Authy, 1Password, and other TOTP apps.
            </p>
            <SettingsActions>
              <button
                type="button"
                disabled={setupTotpMut.isPending}
                onClick={() => setupTotpMut.mutate()}
                className="settings-portal__btn-secondary"
              >
                {setupTotpMut.isPending ? "Preparing…" : "Begin 2FA setup"}
              </button>
            </SettingsActions>
          </>
        )}
      </SettingsSection>
    </>
  );
}

export function PrivacySettingsSection({ exporting, downloadExport }) {
  return (
    <SettingsSection
      title="Personal data export"
      subtitle="Machine-readable JSON containing profile, leases, payments, and messages stored for your account."
      tone="red"
    >
      <SettingsFieldRow label="Format" value="JSON" />
      <SettingsFieldRow label="Scope" value="Account-linked records" />
      <SettingsActions>
        <button
          type="button"
          disabled={exporting}
          onClick={downloadExport}
          className="settings-portal__btn-secondary"
        >
          {exporting ? "Preparing export…" : "Download my data"}
        </button>
      </SettingsActions>
    </SettingsSection>
  );
}

export function TenantBillingSection({ invRows }) {
  return (
    <SettingsSection title="Billing & invoices" subtitle="Outstanding rent invoices linked to your tenancy." tone="cyan">
      {invRows.length === 0 ? (
        <SettingsEmpty>No invoices on record.</SettingsEmpty>
      ) : (
        <div className="settings-portal__table-wrap">
          <table className="settings-portal__table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Due</th>
                <th>Balance</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {invRows.map((inv) => (
                <tr key={inv.id}>
                  <td className="font-mono text-xs">{inv.invoice_number}</td>
                  <td>{inv.due_date}</td>
                  <td>UGX {Number(inv.balance_due || 0).toLocaleString()}</td>
                  <td>{inv.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SettingsSection>
  );
}
