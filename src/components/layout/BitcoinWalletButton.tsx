"use client";

import { useState } from "react";
import { useBitcoinWallet } from "@/hooks/useBitcoinWallet";
import { BitcoinWalletSelector } from "@/components/swap/BitcoinWalletSelector";

// Shared button style used by both wallet buttons
export const walletBtnStyle = {
  background: "#ffffff",
  border: "2px solid #1a1028",
  color: "#1a1028",
} as const;

export function BitcoinWalletButton() {
  const { isConnected, address, disconnect, truncateAddress } = useBitcoinWallet();
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [showDisconnect, setShowDisconnect] = useState(false);

  if (isConnected && address) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDisconnect((v) => !v)}
          className="flex items-center gap-2.5 px-4 py-[9px] rounded-xl transition-all hover:opacity-80"
          style={walletBtnStyle}
        >
          <div className="w-5 h-5 rounded-full bg-[#f7931a] flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] font-bold text-white">₿</span>
          </div>
          <span className="text-sm font-semibold font-mono" style={{ color: "#1a1028" }}>
            {truncateAddress(address)}
          </span>
        </button>

        {showDisconnect && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowDisconnect(false)} />
            <div
              className="absolute right-0 top-full mt-1 z-50 rounded-xl shadow-xl p-1 min-w-[140px]"
              style={{ background: "#ffffff", border: "1.5px solid #e8e4f2", boxShadow: "0 8px 24px rgba(0,0,0,0.10)" }}
            >
              <button
                onClick={() => { disconnect(); setShowDisconnect(false); }}
                className="w-full text-left px-3 py-2 text-xs text-red-500 hover:bg-red-50 rounded-lg transition"
              >
                Disconnect BTC
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setSelectorOpen(true)}
        className="flex items-center gap-2.5 px-4 py-[9px] rounded-xl transition-all hover:opacity-80"
        style={walletBtnStyle}
      >
        <div className="w-5 h-5 rounded-full bg-[#f7931a] flex items-center justify-center flex-shrink-0">
          <span className="text-[10px] font-bold text-white">₿</span>
        </div>
        <span className="text-sm font-semibold" style={{ color: "#1a1028" }}>Connect BTC</span>
      </button>

      <BitcoinWalletSelector
        open={selectorOpen}
        onClose={() => setSelectorOpen(false)}
      />
    </>
  );
}
