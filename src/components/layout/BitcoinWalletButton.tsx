"use client";

import { useState } from "react";
import { useBitcoinWallet } from "@/hooks/useBitcoinWallet";
import { BitcoinWalletSelector } from "@/components/swap/BitcoinWalletSelector";

export function BitcoinWalletButton() {
  const { isConnected, address, disconnect, truncateAddress } = useBitcoinWallet();
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [showDisconnect, setShowDisconnect] = useState(false);

  if (isConnected && address) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDisconnect((v) => !v)}
          className="flex items-center gap-2.5 px-4 py-[10px] rounded-xl border border-[#d4af37]/30 bg-[#d4af37]/5 hover:bg-[#d4af37]/10 transition-all"
        >
          <div className="w-5 h-5 rounded-full bg-[#f7931a] flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] font-bold text-white">₿</span>
          </div>
          <span className="text-sm font-semibold font-mono text-[#d4af37]">
            {truncateAddress(address)}
          </span>
        </button>

        {showDisconnect && (
          <>
            {/* backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowDisconnect(false)}
            />
            <div className="absolute right-0 top-full mt-1 z-50 bg-[#141414] border border-white/10 rounded-xl shadow-xl p-1 min-w-[140px]">
              <button
                onClick={() => {
                  disconnect();
                  setShowDisconnect(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-white/5 rounded-lg transition"
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
        className="flex items-center gap-2.5 px-4 py-[10px] rounded-xl border border-white/15 hover:border-[#f7931a]/50 hover:bg-[#f7931a]/5 transition-all"
      >
        <div className="w-5 h-5 rounded-full bg-[#f7931a]/20 flex items-center justify-center flex-shrink-0">
          <span className="text-[10px] font-bold text-[#f7931a]">₿</span>
        </div>
        <span className="text-sm font-semibold text-white/70">Connect BTC</span>
      </button>

      <BitcoinWalletSelector
        open={selectorOpen}
        onClose={() => setSelectorOpen(false)}
      />
    </>
  );
}
