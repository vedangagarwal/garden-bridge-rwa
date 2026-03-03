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
            className={`
              flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium
              border transition-all duration-150
              ${active
                ? "border-[#d4af37]/60 bg-[#d4af37]/10 text-[#d4af37]"
                : "border-white/8 bg-white/[0.03] text-white/40 hover:text-white/60 hover:border-white/15"
              }
            `}
          >
            <span>{t.icon}</span>
            <span>{t.symbol}</span>
            <span className={`text-[9px] ${active ? "text-[#d4af37]/60" : "text-white/25"}`}>
              {t.network === "solana" ? "SOL" : "ARB"}
            </span>
          </button>
        );
      })}
    </div>
  );
}
