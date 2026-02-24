import { Assets } from "@gardenfi/orderbook";

export const TOKENS = {
  BTC: {
    symbol: "BTC",
    name: "Bitcoin",
    decimals: 8,
    address: null as null,
    icon: "₿",
    network: "bitcoin" as const,
    gardenAsset: Assets.bitcoin.BTC,
  },
  WBTC: {
    symbol: "WBTC",
    name: "Wrapped Bitcoin",
    decimals: 8,
    address: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f" as `0x${string}`,
    icon: "🟠",
    network: "arbitrum" as const,
    gardenAsset: Assets.arbitrum.WBTC,
  },
  USDC: {
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831" as `0x${string}`,
    icon: "💵",
    network: "arbitrum" as const,
    gardenAsset: Assets.arbitrum.USDC,
  },
  XAUT: {
    symbol: "XAUt0",
    name: "Tether Gold",
    decimals: 6,
    address: "0x40461291347e1ecbb09499f3371d3f17f10d7159" as `0x${string}`,
    icon: "🥇",
    network: "arbitrum" as const,
    gardenAsset: null,
  },
} as const;

export type InputTokenSymbol = "BTC" | "WBTC";
export const INPUT_TOKENS: InputTokenSymbol[] = ["BTC", "WBTC"];
