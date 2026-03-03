"use client";

import { useState } from "react";
import { INPUT_TOKENS, type InputTokenSymbol } from "@/config/tokens";

// Official Bitcoin icon — orange circle with white ₿
function BitcoinIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#F7931A" />
      <path
        d="M22.1 14.1c.3-2-1.2-3.1-3.3-3.8l.7-2.7-1.6-.4-.6 2.6-.5-.1.6-2.6L16 6.8l-.7 2.7-.4-.1c-.4-.1-.8-.2-1.1-.3l-2.1-.5-.4 1.7s1.2.3 1.2.3c.7.2.8.6.8 1l-.8 3.3c.1 0 .1 0 .2.1l-.2-.1-1.1 4.5c-.1.2-.3.6-.8.4 0 0-1.2-.3-1.2-.3l-.8 1.8 2 .5.5.1-.7 2.7 1.6.4.7-2.7.5.1-.6 2.7 1.6.4.7-2.7c2.8.5 4.9.3 5.8-2.2.7-2-.03-3.1-1.5-3.8.9-.4 1.6-1 1.8-2.4zm-3.2 4.5c-.5 2-3.8.9-4.8.6l.9-3.4c1.1.3 4.4.8 3.9 2.8zm.5-4.5c-.45 1.8-3.2.9-4.1.7l.8-3.1c.9.2 3.7.7 3.3 2.4z"
        fill="white"
      />
    </svg>
  );
}

// Wrapped Bitcoin icon — orange circle with "W" badge
function WBTCIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#F09242" />
      <path
        d="M22.1 14.1c.3-2-1.2-3.1-3.3-3.8l.7-2.7-1.6-.4-.6 2.6-.5-.1.6-2.6L16 6.8l-.7 2.7-.4-.1c-.4-.1-.8-.2-1.1-.3l-2.1-.5-.4 1.7s1.2.3 1.2.3c.7.2.8.6.8 1l-.8 3.3c.1 0 .1 0 .2.1l-.2-.1-1.1 4.5c-.1.2-.3.6-.8.4 0 0-1.2-.3-1.2-.3l-.8 1.8 2 .5.5.1-.7 2.7 1.6.4.7-2.7.5.1-.6 2.7 1.6.4.7-2.7c2.8.5 4.9.3 5.8-2.2.7-2-.03-3.1-1.5-3.8.9-.4 1.6-1 1.8-2.4zm-3.2 4.5c-.5 2-3.8.9-4.8.6l.9-3.4c1.1.3 4.4.8 3.9 2.8zm.5-4.5c-.45 1.8-3.2.9-4.1.7l.8-3.1c.9.2 3.7.7 3.3 2.4z"
        fill="white"
        opacity="0.9"
      />
      {/* "W" badge */}
      <circle cx="24" cy="8" r="7" fill="#1a1028" />
      <text x="24" y="11.5" textAnchor="middle" fill="white" fontSize="8" fontFamily="Arial, sans-serif" fontWeight="bold">W</text>
    </svg>
  );
}

const TOKEN_DATA = {
  BTC:  { Icon: BitcoinIcon,  label: "Bitcoin",         color: "#F7931A" },
  WBTC: { Icon: WBTCIcon,     label: "Wrapped Bitcoin", color: "#F09242" },
} as const;

interface Props {
  value: InputTokenSymbol;
  onChange: (token: InputTokenSymbol) => void;
}

export function TokenSelector({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const { Icon } = TOKEN_DATA[value];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-xl px-3 py-2 transition-all"
        style={{
          background: "#ffffff",
          border: "1.5px solid #e8e4f2",
          boxShadow: "0 1px 4px rgba(107,93,211,0.06)",
        }}
      >
        <Icon size={22} />
        <span className="text-sm font-semibold" style={{ color: "#1a1028" }}>{value}</span>
        <svg
          width="12" height="12" viewBox="0 0 12 12" fill="none"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
          style={{ color: "#8b88a0" }}
        >
          <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className="absolute top-full left-0 mt-2 z-20 rounded-2xl overflow-hidden w-48"
            style={{
              background: "#ffffff",
              border: "1px solid #e8e4f2",
              boxShadow: "0 8px 24px rgba(107,93,211,0.12)",
            }}
          >
            {INPUT_TOKENS.map((token) => {
              const t = TOKEN_DATA[token];
              const isSelected = token === value;
              return (
                <button
                  key={token}
                  type="button"
                  onClick={() => { onChange(token); setOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                  style={{
                    background: isSelected ? "rgba(107,93,211,0.06)" : "transparent",
                  }}
                  onMouseEnter={(e) => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = "#f5f3fc"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = isSelected ? "rgba(107,93,211,0.06)" : "transparent"; }}
                >
                  <t.Icon size={24} />
                  <div>
                    <div className="text-sm font-semibold" style={{ color: "#1a1028" }}>{token}</div>
                    <div className="text-[11px]" style={{ color: "#8b88a0" }}>{t.label}</div>
                  </div>
                  {isSelected && (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="ml-auto" style={{ color: "#6B5DD3" }}>
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
