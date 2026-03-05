import { NextRequest, NextResponse } from "next/server";

/**
 * Server-side proxy for Jupiter swap transaction endpoint.
 *
 * Uses api.jup.ag (requires JUPITER_API_KEY) when the key is set,
 * otherwise falls back to lite-api.jup.ag which works without auth.
 */
export async function POST(req: NextRequest) {
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
    const body = await req.json();

    const upstream = await fetch(`${JUPITER_BASE}/swap`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
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
