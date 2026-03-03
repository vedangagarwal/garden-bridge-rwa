"use client";

import { useSwapStore } from "@/store/swapStore";
import { Spinner } from "@/components/ui/Spinner";
import { useSwapQuote } from "@/hooks/useSwapQuote";
import { OUTPUT_TOKENS } from "@/config/tokens";

export function TokenOutputPanel() {
  const { quote, outputToken } = useSwapStore();
  const { isLoading } = useSwapQuote();

  const tokenConfig = OUTPUT_TOKENS[outputToken];
  const isSolana = tokenConfig.network === "solana";

  // Parse output amount using the correct decimals for the selected token
  const outputAmount = quote
    ? (parseFloat(quote.xautAmount) / 10 ** tokenConfig.decimals).toFixed(
        Math.min(tokenConfig.decimals, 6)
      )
    : null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-medium text-white/40 uppercase tracking-widest">
          You receive
        </span>
        <span className={`text-[11px] ${isSolana ? "text-purple-400/50" : "text-white/20"}`}>
          {isSolana ? "Solana" : "Arbitrum"}
        </span>
      </div>

      <div className="relative rounded-2xl border border-white/5 bg-[#0f0f0f] p-4">
        <div className="flex items-center gap-3">
          {/* Token badge */}
          <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2 flex-shrink-0">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px]
              ${isSolana
                ? "bg-gradient-to-br from-purple-500 to-blue-600"
                : "bg-gradient-to-br from-[#d4af37] to-[#7a5c08]"
              }`}
            >
              {tokenConfig.icon}
            </div>
            <span className="text-sm font-semibold text-white">{tokenConfig.symbol}</span>
          </div>

          {/* Amount */}
          <div className="flex-1 text-right">
            {isLoading ? (
              <div className="flex justify-end">
                <Spinner size="sm" gold />
              </div>
            ) : outputAmount ? (
              <span
                className={`text-2xl font-light ${isSolana ? "text-purple-300" : "text-[#d4af37]"}`}
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {outputAmount}
              </span>
            ) : (
              <span className="text-2xl font-light text-white/15">—</span>
            )}
          </div>
        </div>

        {outputAmount && (
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[11px] text-white/25">{tokenConfig.name}</span>
            <span className="text-[11px] text-white/20">
              {isSolana ? "via Jupiter V6" : "via 1inch / Uniswap"}
            </span>
          </div>
        )}

        {/* Shimmer */}
        {outputAmount && (
          <div className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden">
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                background: isSolana
                  ? "linear-gradient(135deg, #a855f7 0%, transparent 50%, #3b82f6 100%)"
                  : "linear-gradient(135deg, #d4af37 0%, transparent 50%, #d4af37 100%)",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
