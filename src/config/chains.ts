import { arbitrum } from "wagmi/chains";

export const SUPPORTED_CHAINS = [arbitrum] as const;

export const ARBITRUM_RPC_URL =
  process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL ?? "https://arb1.arbitrum.io/rpc";

export const ARBISCAN_BASE = "https://arbiscan.io";
