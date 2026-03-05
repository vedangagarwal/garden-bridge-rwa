import { SOLANA_USDC_MINT } from "@/lib/solana/config";

const SOLANA_CHAIN = "SOL";

export interface LiFiRoute {
  transactionRequest?: {
    /** Base64-encoded serialized Solana VersionedTransaction */
    data: string;
  };
  estimate?: {
    toAmount: string;
    toAmountMin: string;
    fromAmount: string;
    executionDuration: number;
  };
  action?: {
    toToken?: { decimals: number; symbol: string };
    fromToken?: { decimals: number; symbol: string };
  };
  /** LiFi error fields */
  message?: string;
  code?: number;
}

export interface LiFiQuoteResult {
  rawQuote: LiFiRoute;
  amountOutHuman: string;
}

/**
 * Fetch a LiFi swap quote via the server-side proxy (/api/lifi-quote).
 *
 * LiFi returns the full route including a serialized Solana transaction in
 * `transactionRequest.data` (base64), so no separate "swap" call is needed.
 */
export async function fetchLiFiQuote(
  fromAmount: bigint,   // USDC micro-units (6 decimals)
  toMint: string,
  toDecimals: number,
  fromAddress: string,
): Promise<LiFiQuoteResult> {
  const params = new URLSearchParams({
    fromChain: SOLANA_CHAIN,
    toChain: SOLANA_CHAIN,
    fromToken: SOLANA_USDC_MINT,
    toToken: toMint,
    fromAmount: fromAmount.toString(),
    fromAddress,
    toAddress: fromAddress,
    slippage: "0.03",          // 3% slippage for exotic synthetic tokens
    integrator: "garden-rwa-bridge",
    order: "RECOMMENDED",
  });

  const res = await fetch(`/api/lifi-quote?${params}`, { cache: "no-store" });
  const route: LiFiRoute = await res.json();

  if (!res.ok) {
    throw new Error(
      `LiFi quote failed (${res.status}): ${route.message ?? JSON.stringify(route)}`
    );
  }

  if (!route.transactionRequest?.data) {
    throw new Error(
      "LiFi returned no transaction — this token pair may not be supported. " +
      "Try swapping manually at app.li.fi"
    );
  }

  const toAmount = route.estimate?.toAmount ?? "0";
  const amountOutHuman = (Number(toAmount) / Math.pow(10, toDecimals)).toFixed(6);

  return { rawQuote: route, amountOutHuman };
}
