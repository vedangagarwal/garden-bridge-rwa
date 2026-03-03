"use client";

import dynamic from "next/dynamic";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { wagmiConfig } from "@/lib/wagmi/config";
import { SOLANA_RPC } from "@/lib/solana/config";
import { useState, useMemo } from "react";
import "@rainbow-me/rainbowkit/styles.css";

// Garden SDK + Solana wallet adapter access localStorage at module-load time — must not SSR
const GardenConfigWrapper = dynamic(
  () => import("@/lib/garden/config").then((m) => m.GardenConfigWrapper),
  { ssr: false }
);

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  // No explicit wallet adapters needed — modern wallets (Phantom, Solflare)
  // register themselves via the Wallet Standard automatically.
  const wallets = useMemo(() => [], []);

  return (
    <ConnectionProvider endpoint={SOLANA_RPC}>
      <WalletProvider wallets={wallets} autoConnect>
        <WagmiProvider config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider
              theme={darkTheme({
                accentColor: "#d4af37",
                accentColorForeground: "#0a0a0a",
                borderRadius: "large",
              })}
            >
              <GardenConfigWrapper>{children}</GardenConfigWrapper>
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
