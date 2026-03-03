import axios from "axios";
import { TOKENS } from "@/config/tokens";
import { CONTRACTS } from "@/config/contracts";

const ONE_INCH_BASE = "https://api.1inch.dev/swap/v6.0/42161";

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

function getHeaders() {
  const apiKey = process.env.NEXT_PUBLIC_ONE_INCH_API_KEY;
  return apiKey ? { Authorization: `Bearer ${apiKey}` } : {};
}

export async function getOneInchQuote(
  wbtcAmount: string,
  outputAddress: `0x${string}` = TOKENS.XAUT.address
): Promise<OneInchQuoteResult> {
  const res = await axios.get(`${ONE_INCH_BASE}/quote`, {
    params: {
      src: TOKENS.WBTC.address,
      dst: outputAddress,
      amount: wbtcAmount,
      includeGas: true,
    },
    headers: getHeaders(),
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
  const res = await axios.get(`${ONE_INCH_BASE}/swap`, {
    params: {
      src: TOKENS.WBTC.address,
      dst,
      amount: params.wbtcAmount,
      from: params.fromAddress,
      slippage: params.slippage,
      disableEstimate: false,
      allowPartialFill: false,
      receiver: params.fromAddress,
    },
    headers: getHeaders(),
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
