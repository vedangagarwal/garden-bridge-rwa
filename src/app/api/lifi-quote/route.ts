import { NextRequest, NextResponse } from "next/server";

/**
 * Server-side proxy for LiFi quote endpoint.
 *
 * LiFi's free tier works without an API key; set LIFI_API_KEY for higher rate limits.
 * The quote response includes a serialized Solana transaction in
 * transactionRequest.data — no separate swap-transaction endpoint is needed.
 *
 * Client calls: /api/lifi-quote?fromChain=SOL&toChain=SOL&fromToken=...&toToken=...
 *               &fromAmount=...&fromAddress=...&toAddress=...&slippage=0.03
 */
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;

  const apiKey = process.env.LIFI_API_KEY ?? "";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Accept": "application/json",
  };
  if (apiKey) headers["x-lifi-api-key"] = apiKey;

  try {
    const upstream = await fetch(
      `https://li.quest/v1/quote?${params}`,
      { headers, cache: "no-store" }
    );

    const data = await upstream.json();

    if (!upstream.ok) {
      return NextResponse.json(data, { status: upstream.status });
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 502 });
  }
}
