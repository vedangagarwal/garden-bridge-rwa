"use client";

import { useSwapStore } from "@/store/swapStore";
import { OUTPUT_TOKENS } from "@/config/tokens";

function Row({ label, value, mono = false, highlight = false }: { label: string; value: string; mono?: boolean; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-[11px]" style={{ color: "#8b88a0" }}>{label}</span>
      <span
        className={`text-[11px] ${mono ? "font-mono" : ""}`}
        style={{ color: highlight ? "#6B5DD3" : "#1a1028" }}
      >
        {value}
      </span>
    </div>
  );
}

export function QuoteDisplay() {
  const { quote, inputAmount, inputToken, outputToken } = useSwapStore();
  if (!quote || !inputAmount) return null;

  const tokenConfig = OUTPUT_TOKENS[outputToken];
  const isSolana = tokenConfig.network === "solana";

  const totalTime = quote.estimatedTimeSeconds;
  const mins = Math.floor(totalTime / 60);
  const secs = totalTime % 60;
  const timeStr = mins > 0 ? `~${mins}m ${secs}s` : `~${secs}s`;

  // gardenReceiveAmount is raw intermediate (WBTC sats or USDC μUSDC)
  const intermediateOut = isSolana
    ? (parseFloat(quote.gardenReceiveAmount) / 1e6).toFixed(2) + " USDC"
    : (parseFloat(quote.gardenReceiveAmount) / 1e8).toFixed(6) + " WBTC";

  const outputOut = (
    parseFloat(quote.xautAmount) / 10 ** tokenConfig.decimals
  ).toFixed(Math.min(tokenConfig.decimals, 6));

  return (
    <div
      className="rounded-2xl px-4 py-1 divide-y divide-[#e8e4f2]"
      style={{ background: "#f5f3fc", border: "1px solid #e8e4f2" }}
    >
      <Row label="Garden bridge fee" value={`${quote.gardenFee} bps`} mono />
      <Row label={isSolana ? "Jupiter fee" : "DEX swap fee"} value={`${quote.dexFee}%`} mono />
      <Row
        label={isSolana ? "USDC intermediate" : "WBTC intermediate"}
        value={intermediateOut}
        mono
      />
      <Row
        label="Rate"
        value={`1 ${inputToken} ≈ ${quote.pricePerBtc} ${tokenConfig.symbol}`}
        highlight
      />
      {parseFloat(quote.priceImpact) > 1 && (
        <Row label="Price impact" value={`${quote.priceImpact}%`} mono />
      )}
      <Row label="You receive" value={`${outputOut} ${tokenConfig.symbol}`} mono />
      <Row label="Est. time" value={timeStr} />
    </div>
  );
}
