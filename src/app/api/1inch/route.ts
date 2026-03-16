import { NextRequest, NextResponse } from "next/server";

/**
 * Server-side proxy for 1inch Swap API v6.0 (Arbitrum, chain 42161).
 *
 * Proxies both /quote and /swap endpoints.
 * Client calls: /api/1inch?endpoint=quote&src=...&dst=...&amount=...
 *               /api/1inch?endpoint=swap&src=...&dst=...&amount=...&from=...&slippage=...
 *
 * The API key is kept server-side (no NEXT_PUBLIC_ needed) to avoid CORS
 * failures when calling api.1inch.dev directly from the browser.
 */
export async function GET(req: NextRequest) {
  const params = new URLSearchParams(req.nextUrl.searchParams);
  const endpoint = params.get("endpoint");
  params.delete("endpoint");

  if (endpoint !== "quote" && endpoint !== "swap") {
    return NextResponse.json({ error: "Invalid endpoint" }, { status: 400 });
  }

  const apiKey =
    process.env.ONE_INCH_API_KEY ??
    process.env.NEXT_PUBLIC_ONE_INCH_API_KEY ??
    "";

  try {
    const upstream = await fetch(
      `https://api.1inch.dev/swap/v6.0/42161/${endpoint}?${params}`,
      {
        headers: {
          "Accept": "application/json",
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
        cache: "no-store",
      }
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
