import axios from "axios";
import { TOKENS } from "@/config/tokens";

// Route through the server-side proxy to avoid CORS failures when calling
// api.1inch.dev directly from the browser.
const ONE_INCH_PROXY = "/api/1inch";

export interface OneInchQuoteResult {
  toAmount: string;
  estimatedGas: number;
  priceImpact: string;
}

export interface OneInchSwapResult {
  tx: {
    to: `0x${string}`;
    data: `0x${string}`;
    value: string;
    gas: number;
  };
  toAmount: string;
}

export async function getOneInchQuote(
  wbtcAmount: string,
  outputAddress: `0x${string}` = TOKENS.XAUT.address
): Promise<OneInchQuoteResult> {
  const res = await axios.get(ONE_INCH_PROXY, {
    params: {
      endpoint: "quote",
      src: TOKENS.WBTC.address,
      dst: outputAddress,
      amount: wbtcAmount,
      includeGas: true,
    },
  });
  // 1inch v6.0 uses dstAmount (not toAmount)
  return {
    toAmount: res.data.dstAmount,
    estimatedGas: res.data.gas,
    priceImpact: res.data.priceImpact ?? "0",
  };
}

export async function getOneInchSwapCalldata(params: {
  wbtcAmount: string;
  fromAddress: `0x${string}`;
  slippage: number;
  outputAddress?: `0x${string}`;
}): Promise<OneInchSwapResult> {
  const dst = params.outputAddress ?? TOKENS.XAUT.address;
  const res = await axios.get(ONE_INCH_PROXY, {
    params: {
      endpoint: "swap",
      src: TOKENS.WBTC.address,
      dst,
      amount: params.wbtcAmount,
      from: params.fromAddress,
      slippage: params.slippage,
      disableEstimate: false,
      allowPartialFill: false,
      receiver: params.fromAddress,
    },
  });
  return {
    tx: {
      to: res.data.tx.to as `0x${string}`,
      data: res.data.tx.data as `0x${string}`,
      value: res.data.tx.value ?? "0",
      gas: res.data.tx.gas,
    },
    toAmount: res.data.dstAmount,
  };
}
