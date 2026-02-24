"use client";

import { useState } from "react";
import { INPUT_TOKENS, type InputTokenSymbol } from "@/config/tokens";

const TOKEN_DATA = {
  BTC: { icon: "₿", label: "Bitcoin", color: "#F7931A" },
  WBTC: { icon: "🟠", label: "Wrapped Bitcoin", color: "#F09242" },
} as const;

interface Props {
  value: InputTokenSymbol;
  onChange: (token: InputTokenSymbol) => void;
}

export function TokenSelector({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const selected = TOKEN_DATA[value];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 bg-white/5 hover:bg-white/8 border border-white/10 hover:border-white/20 rounded-xl px-3 py-2 transition-all"
      >
        <span className="text-base">{selected.icon}</span>
        <span className="text-sm font-semibold text-white">{value}</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={`text-white/40 transition-transform ${open ? "rotate-180" : ""}`}>
          <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-2 z-20 bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl w-48">
            {INPUT_TOKENS.map((token) => {
              const t = TOKEN_DATA[token];
              const isSelected = token === value;
              return (
                <button
                  key={token}
                  type="button"
                  onClick={() => { onChange(token); setOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors ${isSelected ? "bg-white/5" : ""}`}
                >
                  <span className="text-lg">{t.icon}</span>
                  <div>
                    <div className="text-sm font-semibold text-white">{token}</div>
                    <div className="text-[11px] text-white/40">{t.label}</div>
                  </div>
                  {isSelected && (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="ml-auto text-[#d4af37]">
                      <path d="M2.5 7L5.5 10L11.5 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
