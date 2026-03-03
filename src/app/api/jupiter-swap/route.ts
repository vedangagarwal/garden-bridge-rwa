import { NextRequest, NextResponse } from "next/server";

const JUPITER_BASE = "https://api.jup.ag/swap/v1";

/**
 * Server-side proxy for Jupiter swap transaction endpoint.
 * Keeps the API key server-side (JUPITER_API_KEY, not NEXT_PUBLIC_).
 */
export async function POST(req: NextRequest) {
  const apiKey =
    process.env.JUPITER_API_KEY ||
    process.env.NEXT_PUBLIC_JUPITER_API_KEY ||
    "";

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
