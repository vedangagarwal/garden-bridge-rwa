import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { arbitrum } from "wagmi/chains";
import { http } from "wagmi";
import { ARBITRUM_RPC_URL } from "@/config/chains";

export const wagmiConfig = getDefaultConfig({
  appName: "GardenFi Gold Swap",
  // WalletConnect project ID — required for wallet connect modal
  // Get yours at https://cloud.walletconnect.com
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "00000000000000000000000000000001",
  chains: [arbitrum],
  transports: {
    [arbitrum.id]: http(ARBITRUM_RPC_URL),
  },
  ssr: true,
});
