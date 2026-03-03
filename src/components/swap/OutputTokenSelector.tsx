"use client";

import { useSwapStore } from "@/store/swapStore";
import { OUTPUT_TOKENS } from "@/config/tokens";
import type { OutputTokenKey } from "@/config/tokens";

const TOKENS: OutputTokenKey[] = ["XAUT", "PAXG", "TSLAX"];

export function OutputTokenSelector() {
  const { outputToken, setOutputToken } = useSwapStore();

  return (
    <div className="flex gap-1.5">
      {TOKENS.map((key) => {
        const t = OUTPUT_TOKENS[key];
        const active = outputToken === key;
        return (
          <button
            key={key}
            onClick={() => setOutputToken(key)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-150"
            style={
              active
                ? {
                    background: "rgba(107,93,211,0.10)",
                    border: "1.5px solid rgba(107,93,211,0.35)",
                    color: "#6B5DD3",
                  }
                : {
                    background: "#f5f3fc",
                    border: "1.5px solid #e8e4f2",
                    color: "#8b88a0",
                  }
            }
          >
            <span>{t.icon}</span>
            <span>{t.symbol}</span>
            <span
              className="text-[9px]"
              style={{ color: active ? "rgba(107,93,211,0.55)" : "#b0adc4" }}
            >
              {t.network === "solana" ? "SOL" : "ARB"}
            </span>
          </button>
        );
      })}
    </div>
  );
}
