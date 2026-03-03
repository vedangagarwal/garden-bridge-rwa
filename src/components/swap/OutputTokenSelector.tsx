"use client";

import { useState } from "react";
import { useSwapStore } from "@/store/swapStore";
import { OUTPUT_TOKENS } from "@/config/tokens";
import type { OutputTokenKey } from "@/config/tokens";

const ARBITRUM_TOKENS: OutputTokenKey[] = ["XAUT", "PAXG"];
const SOLANA_TOKENS: OutputTokenKey[] = ["TSLAX", "USDG"];

function ArbitrumLogo({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 37" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Hexagon border (light blue) */}
      <path d="M16 0.5L30.5 8.5V24.5L16 32.5L1.5 24.5V8.5L16 0.5Z" fill="#96BEDC" />
      {/* Hexagon inner fill (dark navy) */}
      <path d="M16 3L28.5 10V24L16 31L3.5 24V10L16 3Z" fill="#213147" />
      {/* Diagonal slash lines (white) */}
      <path d="M10 24L16.5 10.5L17.5 13.5L12 24H10Z" fill="white" />
      <path d="M13.5 24L20 10.5L21 13.5L15.5 24H13.5Z" fill="white" />
      {/* Blue A right side */}
      <path d="M20.5 24L17.5 17L19.5 13L24 24H20.5Z" fill="#12AAFF" />
      <path d="M17.5 17L16.5 14.5L21 24H19L17.5 17Z" fill="#12AAFF" />
    </svg>
  );
}

function SolanaLogo({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#1a1a2e" />
      <defs>
        <linearGradient id="sol-g1" x1="7" y1="10" x2="25" y2="10" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9945FF" /><stop offset="1" stopColor="#14F195" />
        </linearGradient>
        <linearGradient id="sol-g2" x1="7" y1="16" x2="25" y2="16" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9945FF" /><stop offset="1" stopColor="#14F195" />
        </linearGradient>
        <linearGradient id="sol-g3" x1="7" y1="22" x2="25" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9945FF" /><stop offset="1" stopColor="#14F195" />
        </linearGradient>
      </defs>
      {/* Top bar */}
      <path d="M8 8.5h13.5l2.5 3H8v-3Z" fill="url(#sol-g1)" />
      {/* Middle bar */}
      <path d="M24 14.5H10.5L8 17.5h16l-2.5-3H24Z" fill="url(#sol-g2)" />
      {/* Bottom bar */}
      <path d="M8 20.5h13.5l2.5 3H8v-3Z" fill="url(#sol-g3)" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="10" height="10" viewBox="0 0 10 10" fill="none"
      style={{ transition: "transform 0.15s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
    >
      <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

interface NetworkDropdownProps {
  label: string;
  logo: React.ReactNode;
  tokens: OutputTokenKey[];
  activeToken: OutputTokenKey;
  onSelect: (key: OutputTokenKey) => void;
}

function NetworkDropdown({ label, logo, tokens, activeToken, onSelect }: NetworkDropdownProps) {
  const [open, setOpen] = useState(false);
  const isNetworkActive = tokens.includes(activeToken);
  const selectedToken = isNetworkActive ? OUTPUT_TOKENS[activeToken] : null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-150"
        style={
          isNetworkActive
            ? { background: "rgba(107,93,211,0.10)", border: "1.5px solid rgba(107,93,211,0.35)", color: "#6B5DD3" }
            : { background: "#f5f3fc", border: "1.5px solid #e8e4f2", color: "#8b88a0" }
        }
      >
        {logo}
        <span className="font-semibold">{label}</span>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className="absolute left-0 top-full mt-1.5 z-20 rounded-2xl p-1.5 min-w-[140px]"
            style={{ background: "#ffffff", border: "1px solid #e8e4f2", boxShadow: "0 8px 24px rgba(107,93,211,0.12)" }}
          >
            {tokens.map((key) => {
              const t = OUTPUT_TOKENS[key];
              const active = activeToken === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => { onSelect(key); setOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all"
                  style={
                    active
                      ? { background: "rgba(107,93,211,0.08)", color: "#6B5DD3" }
                      : { color: "#1a1028" }
                  }
                >
                  <span className="text-base leading-none">{t.icon}</span>
                  <div className="flex flex-col items-start">
                    <span className="font-semibold leading-tight">{t.symbol}</span>
                    <span className="text-[9px] leading-tight" style={{ color: active ? "rgba(107,93,211,0.6)" : "#8b88a0" }}>
                      {t.name}
                    </span>
                  </div>
                  {active && (
                    <svg className="ml-auto" width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="#6B5DD3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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

export function OutputTokenSelector() {
  const { outputToken, setOutputToken } = useSwapStore();

  return (
    <div className="flex gap-2">
      <NetworkDropdown
        label="Arbitrum"
        logo={<ArbitrumLogo size={16} />}
        tokens={ARBITRUM_TOKENS}
        activeToken={outputToken}
        onSelect={setOutputToken}
      />
      <NetworkDropdown
        label="Solana"
        logo={<SolanaLogo size={16} />}
        tokens={SOLANA_TOKENS}
        activeToken={outputToken}
        onSelect={setOutputToken}
      />
    </div>
  );
}
