import type { OutputTokenKey } from "@/config/tokens";

export type SwapStatus =
  | "idle"
  | "quoting"
  | "awaiting_deposit"
  | "confirming"
  | "bridging"
  | "bridge_complete"
  | "approving"
  | "swapping"
  | "complete"
  | "bridge_lifi_failed"
  | "failed"
  | "refunding";

export interface SwapSession {
  status: SwapStatus;
  gardenOrderId: string | null;
  depositAddress: string | null;
  depositAmountSats: number | null;
  gardenReceiveAmount: string | null;
  dexTxHash: `0x${string}` | null;
  /** Human-readable output token amount received (XAUt0, PAXG, or TSLAx) */
  xautReceived: string | null;
  errorMessage: string | null;
  bridgeTxHash: string | null;
  createdAt: number | null;
  btcConfirmations: number;
  btcRequiredConfirmations: number;
  btcSentTxId: string | null;
  /** Solana path: LiFi transaction signature */
  solanaSignature: string | null;
  /** Solana path: USDC amount sitting in wallet after bridge, pending LiFi swap */
  usdcInWallet: string | null;
}

export const DEFAULT_SESSION: SwapSession = {
  status: "idle",
  gardenOrderId: null,
  depositAddress: null,
  depositAmountSats: null,
  gardenReceiveAmount: null,
  dexTxHash: null,
  xautReceived: null,
  errorMessage: null,
  bridgeTxHash: null,
  createdAt: null,
  btcConfirmations: 0,
  btcRequiredConfirmations: 1,
  btcSentTxId: null,
  solanaSignature: null,
  usdcInWallet: null,
};

export interface CombinedQuote {
  gardenReceiveAmount: string;
  /** Raw output token amount in token's smallest unit */
  xautAmount: string;
  gardenFee: number;
  dexFee: string;
  estimatedTimeSeconds: number;
  solverId: string;
  pricePerBtc: string;
  priceImpact: string;
  /** Which output token this quote is for */
  outputToken: OutputTokenKey;
  /** Raw DEX quote response (Solana path only) */
  dexQuote?: unknown;
}
