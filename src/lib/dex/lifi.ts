import { SOLANA_USDC_MINT } from "@/lib/solana/config";
import { TOKENS } from "@/config/tokens";

const SOLANA_CHAIN = "SOL";
const ARBITRUM_CHAIN = "ARB";

/** EVM transaction returned by LiFi for Arbitrum swaps */
export interface LiFiEvmRoute {
  transactionRequest?: {
    to: string;
    data: string;
    value: string;
    gasLimit?: string;
    gasPrice?: string;
    from?: string;
    chainId?: number;
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
  message?: string;
  code?: number;
}

export interface LiFiEvmQuoteResult {
  rawQuote: LiFiEvmRoute;
  amountOutHuman: string;
}

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

/**
 * Fetch a LiFi swap quote for Arbitrum EVM: WBTC → output token.
 * Uses the same /api/lifi-quote server-side proxy.
 *
 * For quote preview, pass a dummy EVM address. For the actual swap,
 * pass the user's real address so LiFi builds the correct calldata.
 */
export async function fetchLiFiEvmQuote(
  wbtcAmountRaw: bigint,   // WBTC in satoshis (8 decimals)
  toTokenAddress: string,
  toDecimals: number,
  fromAddress: string,
  slippage = "0.005",      // 0.5% default for liquid EVM pairs
): Promise<LiFiEvmQuoteResult> {
  const params = new URLSearchParams({
    fromChain: ARBITRUM_CHAIN,
    toChain: ARBITRUM_CHAIN,
    fromToken: TOKENS.WBTC.address,
    toToken: toTokenAddress,
    fromAmount: wbtcAmountRaw.toString(),
    fromAddress,
    toAddress: fromAddress,
    slippage,
    integrator: "garden-rwa-bridge",
    order: "RECOMMENDED",
  });

  const res = await fetch(`/api/lifi-quote?${params}`, { cache: "no-store" });
  const route: LiFiEvmRoute = await res.json();

  if (!res.ok) {
    throw new Error(
      `LiFi EVM quote failed (${res.status}): ${route.message ?? JSON.stringify(route)}`
    );
  }

  if (!route.transactionRequest?.to || !route.transactionRequest?.data) {
    throw new Error("LiFi returned no EVM transaction for this pair.");
  }

  const toAmount = route.estimate?.toAmount ?? "0";
  const amountOutHuman = (Number(toAmount) / Math.pow(10, toDecimals)).toFixed(
    Math.min(toDecimals, 8)
  );

  return { rawQuote: route, amountOutHuman };
}
