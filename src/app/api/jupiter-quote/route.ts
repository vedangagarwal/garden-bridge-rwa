import { NextRequest, NextResponse } from "next/server";

const JUPITER_BASE = "https://api.jup.ag/swap/v1";

/**
 * Server-side proxy for Jupiter quote endpoint.
 * Keeps the API key server-side (JUPITER_API_KEY, not NEXT_PUBLIC_).
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

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (apiKey) headers["x-api-key"] = apiKey;

  try {
    const upstream = await fetch(`${JUPITER_BASE}/quote?${params}`, {
      headers,
      next: { revalidate: 10 }, // cache for 10 s
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
