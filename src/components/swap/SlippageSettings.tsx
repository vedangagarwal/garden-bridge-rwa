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
      <span className="text-[11px]" style={{ color: "#8b88a0" }}>Slippage (DEX swap)</span>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1.5 text-[11px] transition-colors"
          style={{ color: "#6B5DD3" }}
        >
          <span className="font-mono">{slippage}%</span>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div
              className="absolute right-0 top-full mt-2 z-20 rounded-2xl p-3 w-44"
              style={{
                background: "#ffffff",
                border: "1px solid #e8e4f2",
                boxShadow: "0 8px 24px rgba(107,93,211,0.12)",
              }}
            >
              <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: "#8b88a0" }}>Slippage</p>
              <div className="flex gap-1.5 mb-2">
                {PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => { setSlippage(p); setCustom(""); setOpen(false); }}
                    className="flex-1 py-1.5 text-[11px] rounded-lg font-mono transition-all"
                    style={
                      slippage === p && !custom
                        ? {
                            background: "rgba(107,93,211,0.10)",
                            color: "#6B5DD3",
                            border: "1px solid rgba(107,93,211,0.30)",
                          }
                        : {
                            background: "#f5f3fc",
                            color: "#8b88a0",
                            border: "1px solid #e8e4f2",
                          }
                    }
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
                  className="flex-1 rounded-lg px-2 py-1.5 text-[11px] font-mono outline-none"
                  style={{
                    background: "#f5f3fc",
                    border: "1px solid #e8e4f2",
                    color: "#1a1028",
                  }}
                />
                <span className="text-[11px]" style={{ color: "#8b88a0" }}>%</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
