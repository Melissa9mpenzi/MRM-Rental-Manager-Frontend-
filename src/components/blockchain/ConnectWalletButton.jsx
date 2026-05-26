import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";

/** Optional browser wallet — not required; every account already has a platform Sui address. */
export default function ConnectWalletButton({ className = "" }) {
  const account = useCurrentAccount();
  return (
    <div className={className}>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-white/40">
        External wallet (optional)
      </p>
      <ConnectButton />
      {account && (
        <p className="mt-2 truncate font-mono text-xs text-white/50">{account.address}</p>
      )}
    </div>
  );
}
