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
        <span className="text-xs font-medium uppercase tracking-widest" style={{ color: "#8b88a0" }}>
          You receive
        </span>
        <span className="text-[11px]" style={{ color: isSolana ? "#a78bfa" : "#8b88a0" }}>
          {isSolana ? "Solana" : "Arbitrum"}
        </span>
      </div>

      <div
        className="relative rounded-2xl p-4"
        style={{ background: "#f5f3fc", border: "1.5px solid #e8e4f2" }}
      >
        <div className="flex items-center gap-3">
          {/* Token badge */}
          <div
            className="flex items-center gap-2 rounded-xl px-3 py-2 flex-shrink-0"
            style={{ background: "#ede9f7", border: "1px solid #e8e4f2" }}
          >
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-[11px]"
              style={{
                background: isSolana
                  ? "linear-gradient(135deg, #a78bfa, #818cf8)"
                  : "linear-gradient(135deg, #6B5DD3, #4e42b0)",
              }}
            >
              {tokenConfig.icon}
            </div>
            <span className="text-sm font-semibold" style={{ color: "#1a1028" }}>{tokenConfig.symbol}</span>
          </div>

          {/* Amount */}
          <div className="flex-1 text-right">
            {isLoading ? (
              <div className="flex justify-end">
                <Spinner size="sm" gold />
              </div>
            ) : outputAmount ? (
              <span
                className="text-2xl font-light"
                style={{ color: isSolana ? "#7c6fd6" : "#6B5DD3", fontVariantNumeric: "tabular-nums" }}
              >
                {outputAmount}
              </span>
            ) : (
              <span className="text-2xl font-light" style={{ color: "#d8d2ef" }}>—</span>
            )}
          </div>
        </div>

        {outputAmount && (
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[11px]" style={{ color: "#b0adc4" }}>{tokenConfig.name}</span>
            <span className="text-[11px]" style={{ color: "#b0adc4" }}>
              {isSolana ? "via Jupiter V6" : "via 1inch / Uniswap"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
