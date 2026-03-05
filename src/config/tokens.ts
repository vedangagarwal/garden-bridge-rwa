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

/** Output tokens the user can swap into */
export const OUTPUT_TOKENS = {
  XAUT: {
    key: "XAUT" as const,
    symbol: "XAUt0",
    name: "Tether Gold",
    decimals: 6,
    network: "arbitrum" as const,
    address: "0x40461291347e1ecbb09499f3371d3f17f10d7159" as `0x${string}`,
    icon: "🥇",
    description: "Gold · Arbitrum",
  },
  PAXG: {
    key: "PAXG" as const,
    symbol: "PAXG",
    name: "PAX Gold",
    decimals: 18,
    network: "arbitrum" as const,
    address: "0xfEb4DfC8C4Cf7Ed305bb08065D08eC6ee6728429" as `0x${string}`,
    icon: "🏅",
    description: "Gold · Arbitrum",
  },
  TSLAX: {
    key: "TSLAX" as const,
    symbol: "TSLAx",
    name: "Tesla Token",
    decimals: 8,
    network: "solana" as const,
    mint: "XsDoVfqeBukxuZHWhdvWHBhgEHjGNst4MLodqsJHzoB",
    icon: "🚗",
    description: "Equity · Solana",
  },
  USDG: {
    key: "USDG" as const,
    symbol: "USDG",
    name: "Global Dollar",
    decimals: 6,
    network: "solana" as const,
    mint: "2u1tszSeqZ3qBWF3uNGPFc8TzMk2tdiwknnRMWGWjGWH",
    icon: "💲",
    description: "Stablecoin · Solana",
  },
} as const;

export type OutputTokenKey = keyof typeof OUTPUT_TOKENS;
export type OutputToken = (typeof OUTPUT_TOKENS)[OutputTokenKey];

export type InputTokenSymbol = "BTC" | "WBTC";
export const INPUT_TOKENS: InputTokenSymbol[] = ["BTC", "WBTC"];
