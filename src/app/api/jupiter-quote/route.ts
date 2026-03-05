import { NextRequest, NextResponse } from "next/server";

/**
 * Server-side proxy for Jupiter quote endpoint.
 *
 * Uses api.jup.ag (requires JUPITER_API_KEY) when the key is set,
 * otherwise falls back to lite-api.jup.ag which works without auth.
 * Client calls /api/jupiter-quote?inputMint=...&outputMint=...&amount=...&slippageBps=...
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const params = new URLSearchParams();
  for (const [key, val] of searchParams.entries()) {
    params.set(key, val);
  }

  const apiKey =
    process.env.JUPITER_API_KEY ||
    process.env.NEXT_PUBLIC_JUPITER_API_KEY ||
    "";

  // Use the paid endpoint when we have an API key; lite-api otherwise (no auth needed)
  const JUPITER_BASE = apiKey
    ? "https://api.jup.ag/swap/v1"
    : "https://lite-api.jup.ag/swap/v1";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (apiKey) headers["x-api-key"] = apiKey;

  try {
    const upstream = await fetch(`${JUPITER_BASE}/quote?${params}`, {
      headers,
      cache: "no-store", // always fresh — a stale quote produces an aged blockhash in the swap tx
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      return NextResponse.json(data, { status: upstream.status });
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: String(err) },
      { status: 502 }
    );
  }
}
