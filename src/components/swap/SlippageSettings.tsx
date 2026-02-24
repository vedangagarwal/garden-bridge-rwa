"use client";

import { useState } from "react";
import { useSwapStore } from "@/store/swapStore";

const PRESETS = [0.5, 1, 2];

export function SlippageSettings() {
  const { slippage, setSlippage } = useSwapStore();
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState("");

  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] text-white/30">Slippage (DEX swap)</span>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1.5 text-[11px] text-white/50 hover:text-white/80 transition-colors"
        >
          <span className="font-mono text-[#d4af37]/80">{slippage}%</span>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-full mt-2 z-20 bg-[#1a1a1a] border border-white/10 rounded-2xl p-3 shadow-2xl w-44">
              <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2">Slippage</p>
              <div className="flex gap-1.5 mb-2">
                {PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => { setSlippage(p); setCustom(""); setOpen(false); }}
                    className={`flex-1 py-1.5 text-[11px] rounded-lg font-mono transition-all ${
                      slippage === p && !custom
                        ? "bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40"
                        : "bg-white/5 text-white/50 hover:bg-white/8"
                    }`}
                  >
                    {p}%
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="Custom"
                  value={custom}
                  onChange={(e) => {
                    const v = e.target.value;
                    setCustom(v);
                    const n = parseFloat(v);
                    if (!isNaN(n) && n > 0 && n <= 50) setSlippage(n);
                  }}
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-[11px] font-mono text-white placeholder-white/20 outline-none focus:border-[#d4af37]/40"
                />
                <span className="text-[11px] text-white/30">%</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
