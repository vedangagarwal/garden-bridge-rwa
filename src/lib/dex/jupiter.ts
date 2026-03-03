import { JUPITER_API_URL, JUPITER_API_KEY, SOLANA_USDC_MINT } from "@/lib/solana/config";

export interface JupiterQuote {
  rawQuote: unknown;
  amountOut: string;
  amountOutHuman: string;
  priceImpact: string;
}

function jupiterHeaders(): HeadersInit {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (JUPITER_API_KEY) headers["x-api-key"] = JUPITER_API_KEY;
  return headers;
}

export async function fetchJupiterQuote(
  usdcAmountRaw: bigint,
  outputMint: string,
  outputDecimals: number
): Promise<JupiterQuote> {
  const params = new URLSearchParams({
    inputMint: SOLANA_USDC_MINT,
    outputMint,
    amount: usdcAmountRaw.toString(),
    slippageBps: "50",
  });

  const res = await fetch(`${JUPITER_API_URL}/quote?${params}`, {
    headers: jupiterHeaders(),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Jupiter quote failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  const amountOut = data.outAmount as string;
  const amountOutHuman = (Number(amountOut) / 10 ** outputDecimals).toFixed(outputDecimals);
  const priceImpact = (Number(data.priceImpactPct ?? 0) * 100).toFixed(3);

  return { rawQuote: data, amountOut, amountOutHuman, priceImpact };
}

export async function fetchJupiterSwapTransaction(
  quoteResponse: unknown,
  userPublicKey: string
): Promise<string> {
  const res = await fetch(`${JUPITER_API_URL}/swap`, {
    method: "POST",
    headers: jupiterHeaders(),
    body: JSON.stringify({
      quoteResponse,
      userPublicKey,
      wrapAndUnwrapSol: false,
      dynamicComputeUnitLimit: true,
      prioritizationFeeLamports: "auto",
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Jupiter swap transaction failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  return data.swapTransaction as string;
}
