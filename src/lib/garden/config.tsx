"use client";

import { GardenProvider } from "@gardenfi/react-hooks";
import { Network } from "@gardenfi/utils";
import { useWalletClient } from "wagmi";
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
        },
      }}
      store={typeof window !== "undefined" ? localStorage : ssrStore}
    >
      {children}
    </GardenProvider>
  );
}
