"use client";

import { useAccount } from "wagmi";
import { useSwapStore } from "@/store/swapStore";
import { Spinner } from "@/components/ui/Spinner";
import { useSwapQuote } from "@/hooks/useSwapQuote";
import { useTokenBalances } from "@/hooks/useTokenBalances";

export function TokenOutputPanel() {
  const { address } = useAccount();
  const { quote } = useSwapStore();
  const { isLoading } = useSwapQuote();
  const { xautBalance } = useTokenBalances();

  const xautAmount = quote ? (parseFloat(quote.xautAmount) / 1e6).toFixed(6) : null;
  const xautBalanceFormatted = address ? (Number(xautBalance) / 1e6).toFixed(4) : null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-medium text-white/40 uppercase tracking-widest">You receive</span>
        <div className="flex items-center gap-2">
          {xautBalanceFormatted && (
            <span className="text-[11px] text-white/30">
              Balance: {xautBalanceFormatted} XAUt0
            </span>
          )}
          <span className="text-[11px] text-white/20">Arbitrum</span>
        </div>
      </div>

      <div className="relative rounded-2xl border border-white/5 bg-[#0f0f0f] p-4">
        <div className="flex items-center gap-3">
          {/* XAUt0 icon */}
          <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2 flex-shrink-0">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#d4af37] to-[#7a5c08] flex items-center justify-center">
              <span className="text-[8px] font-bold text-black">Au</span>
            </div>
            <span className="text-sm font-semibold text-white">XAUt0</span>
          </div>

          {/* Amount */}
          <div className="flex-1 text-right">
            {isLoading ? (
              <div className="flex justify-end">
                <Spinner size="sm" gold />
              </div>
            ) : xautAmount ? (
              <span
                className="text-2xl font-light text-[#d4af37]"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {xautAmount}
              </span>
            ) : (
              <span className="text-2xl font-light text-white/15">—</span>
            )}
          </div>
        </div>

        {xautAmount && (
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[11px] text-white/25">Tether Gold (OFT)</span>
            {quote && (
              <span className="text-[11px] text-white/25 font-mono">
                1 troy oz gold ≈ {xautAmount} XAUt0
              </span>
            )}
          </div>
        )}

        {/* Gold shimmer */}
        {xautAmount && (
          <div className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden">
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                background: "linear-gradient(135deg, #d4af37 0%, transparent 50%, #d4af37 100%)",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
