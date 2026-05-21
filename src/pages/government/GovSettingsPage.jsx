export default function GovSettingsPage() {
  return (
    <div className="gov-glass max-w-xl space-y-4 p-6">
      <h2 className="text-lg font-bold text-white">System Settings</h2>
      <p className="text-sm text-white/55">Government portal security (enterprise policy):</p>
      <ul className="space-y-2 text-sm text-white/70">
        <li>✓ Mandatory 2FA each session (web)</li>
        <li>✓ Role-scoped agency modules (NIRA / KCCA / URA)</li>
        <li>✓ Audit logging on all verification actions</li>
        <li>○ IP allowlist — configure in production deployment</li>
        <li>○ Walrus / Sui audit anchors — blockchain phase</li>
      </ul>
    </div>
  );
}
