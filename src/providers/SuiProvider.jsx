import { createNetworkConfig, SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import "@mysten/dapp-kit/dist/index.css";

const SUI_RPC = {
  devnet: "https://fullnode.devnet.sui.io:443",
  testnet: "https://fullnode.testnet.sui.io:443",
  mainnet: "https://fullnode.mainnet.sui.io:443",
};

const { networkConfig } = createNetworkConfig({
  devnet: { url: SUI_RPC.devnet },
  testnet: { url: SUI_RPC.testnet },
  mainnet: { url: SUI_RPC.mainnet },
});

const defaultNetwork = import.meta.env.VITE_SUI_NETWORK || "devnet";

export default function SuiProvider({ children }) {
  return (
    <SuiClientProvider networks={networkConfig} defaultNetwork={defaultNetwork}>
      <WalletProvider autoConnect>{children}</WalletProvider>
    </SuiClientProvider>
  );
}

export { defaultNetwork };
