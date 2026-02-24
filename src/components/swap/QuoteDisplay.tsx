"use client";

import { useSwapStore } from "@/store/swapStore";

function Row({ label, value, mono = false, highlight = false }: { label: string; value: string; mono?: boolean; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-[11px] text-white/35">{label}</span>
      <span className={`text-[11px] ${mono ? "font-mono" : ""} ${highlight ? "text-[#d4af37]" : "text-white/60"}`}>
        {value}
      </span>
    </div>
  );
}

export function QuoteDisplay() {
  const { quote, inputAmount, inputToken } = useSwapStore();
  if (!quote || !inputAmount) return null;

  const totalTime = quote.estimatedTimeSeconds;
  const mins = Math.floor(totalTime / 60);
  const secs = totalTime % 60;
  const timeStr = mins > 0 ? `~${mins}m ${secs}s` : `~${secs}s`;

  // gardenReceiveAmount is raw WBTC satoshis (8 decimals)
  const wbtcOut = (parseFloat(quote.gardenReceiveAmount) / 1e8).toFixed(6);
  const xautOut = (parseFloat(quote.xautAmount) / 1e6).toFixed(6);

  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-1 space-y-0 divide-y divide-white/5">
      <Row label="Garden bridge fee" value={`${quote.gardenFee} bps`} mono />
      <Row label="DEX swap fee" value={`${quote.dexFee}%`} mono />
      <Row label="WBTC intermediate" value={`${wbtcOut} WBTC`} mono />
      <Row label="Rate" value={`1 ${inputToken} ≈ ${quote.pricePerBtc} XAUt0`} highlight />
      {parseFloat(quote.priceImpact) > 1 && (
        <Row label="Price impact" value={`${quote.priceImpact}%`} mono />
      )}
      <Row label="Est. time" value={timeStr} />
    </div>
  );
}
