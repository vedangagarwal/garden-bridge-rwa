"use client";

import { useMemo } from "react";
import { GardenProvider } from "@gardenfi/react-hooks";
import { Network } from "@gardenfi/utils";
import { useWalletClient } from "wagmi";
import { useWallet } from "@solana/wallet-adapter-react";
import type { SignerWalletAdapter } from "@solana/wallet-adapter-base";
import { buildAnchorProvider } from "@/lib/solana/anchorProvider";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

const ssrStore = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export function GardenConfigWrapper({ children }: Props) {
  const { data: walletClient } = useWalletClient();
  const { wallet } = useWallet();

  const anchorProvider = useMemo(() => {
    const adapter = wallet?.adapter;
    if (!adapter || !adapter.publicKey || !adapter.connected) return undefined;
    // Require signTransaction capability (Phantom, Solflare support this)
    if (!("signTransaction" in adapter)) return undefined;
    try {
      return buildAnchorProvider(adapter as SignerWalletAdapter);
    } catch {
      return undefined;
    }
  }, [wallet?.adapter, wallet?.adapter?.publicKey?.toString()]);  // eslint-disable-line react-hooks/exhaustive-deps

  const environment =
    process.env.NEXT_PUBLIC_GARDEN_ENV === "mainnet"
      ? Network.MAINNET
      : Network.TESTNET;

  return (
    <GardenProvider
      config={{
        environment,
        apiKey: process.env.NEXT_PUBLIC_GARDEN_APP_ID ?? "",
        wallets: {
          evm: walletClient ?? undefined,
          solana: anchorProvider,
        },
      }}
      store={typeof window !== "undefined" ? localStorage : ssrStore}
    >
      {children}
    </GardenProvider>
  );
}
