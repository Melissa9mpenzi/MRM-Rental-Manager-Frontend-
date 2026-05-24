import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";

export default function ConnectWalletButton({ className = "" }) {
  const account = useCurrentAccount();
  return (
    <div className={className}>
      <ConnectButton />
      {account && (
        <p className="mt-2 truncate text-xs text-white/50">{account.address}</p>
      )}
    </div>
  );
}
