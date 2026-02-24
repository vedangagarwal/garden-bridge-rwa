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
  | "failed"
  | "refunding";

export interface SwapSession {
  status: SwapStatus;
  gardenOrderId: string | null;
  depositAddress: string | null;
  depositAmountSats: number | null;
  gardenReceiveAmount: string | null;
  dexTxHash: `0x${string}` | null;
  xautReceived: string | null;
  errorMessage: string | null;
  bridgeTxHash: string | null;
  createdAt: number | null;
  btcConfirmations: number;
  btcRequiredConfirmations: number;
  /** txid after user sends BTC via connected wallet */
  btcSentTxId: string | null;
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
};

export interface CombinedQuote {
  gardenReceiveAmount: string;
  xautAmount: string;
  gardenFee: number;
  dexFee: string;
  estimatedTimeSeconds: number;
  solverId: string;
  pricePerBtc: string;
  priceImpact: string;
}
