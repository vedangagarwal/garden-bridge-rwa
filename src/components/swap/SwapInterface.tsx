"use client";

import { useState, useEffect } from "react";
import { useSwapStore } from "@/store/swapStore";
import { useSwapOrchestrator } from "@/hooks/useSwapOrchestrator";
import { TokenInputPanel } from "./TokenInputPanel";
import { TokenOutputPanel } from "./TokenOutputPanel";
import { OutputTokenSelector } from "./OutputTokenSelector";
import { QuoteDisplay } from "./QuoteDisplay";
import { SlippageSettings } from "./SlippageSettings";
import { SwapButton } from "./SwapButton";
import { SwapStatusModal } from "./SwapStatusModal";
import { OUTPUT_TOKENS } from "@/config/tokens";

// Arrow down icon
function ArrowDown() {
  return (
    <div className="flex items-center justify-center my-1">
      <div className="w-8 h-8 rounded-full bg-[#1a1a1a] border border-white/10 flex items-center justify-center">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 2V12M7 12L3.5 8.5M7 12L10.5 8.5" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

export function SwapInterface() {
  const { session, startSwap, resetSwap } = useSwapOrchestrator();
  const { quote, inputAmount, outputToken } = useSwapStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [swapping, setSwapping] = useState(false);

  const tokenConfig = OUTPUT_TOKENS[outputToken];
  const isSolana = tokenConfig.network === "solana";

  // Open modal when swap starts
  useEffect(() => {
    if (session.status !== "idle" && session.status !== "complete" && session.status !== "failed") {
      setModalOpen(true);
    }
  }, [session.status]);

  async function handleSwap() {
    setSwapping(true);
    setModalOpen(true);
    try {
      await startSwap();
    } finally {
      setSwapping(false);
    }
  }

  function handleReset() {
    resetSwap();
    setModalOpen(false);
  }

  return (
    <>
      {/* Card with animated gold border on focus */}
      <div className="relative group">
        {/* Animated glow border */}
        <div
          className="absolute -inset-px rounded-3xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: isSolana
              ? "linear-gradient(135deg, #a855f7, #3b82f6, #a855f7)"
              : "linear-gradient(135deg, #d4af37, #7a5c08, #d4af37)",
            filter: "blur(1px)",
          }}
        />
        <div className="relative rounded-3xl bg-[#111111] border border-white/8 overflow-hidden">
          {/* Header stripe */}
          <div className={`h-0.5 w-full bg-gradient-to-r from-transparent to-transparent ${
            isSolana ? "via-purple-500/40" : "via-[#d4af37]/40"
          }`} />

          <div className="p-5 space-y-3">
            <TokenInputPanel />
            <ArrowDown />

            {/* Output token selector */}
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-medium text-white/40 uppercase tracking-widest">
                Receive
              </span>
              <OutputTokenSelector />
            </div>

            <TokenOutputPanel />

            <div className="pt-1 space-y-2">
              <SlippageSettings />
              <QuoteDisplay />
            </div>

            <div className="pt-1">
              <SwapButton onSwap={handleSwap} loading={swapping} />
            </div>
          </div>

          {/* Network notice */}
          <div className="px-5 pb-4 flex items-center justify-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${isSolana ? "bg-purple-400/70" : "bg-emerald-400/70"}`} />
            <span className="text-[10px] text-white/20 tracking-wide">
              {isSolana
                ? "Powered by Garden Finance · Solana · Jupiter V6"
                : "Powered by Garden Finance · Arbitrum · 1inch"
              }
            </span>
          </div>
        </div>
      </div>

      <SwapStatusModal
        open={modalOpen}
        session={session}
        onClose={() => {
          if (session.status === "complete" || session.status === "failed") setModalOpen(false);
        }}
        onReset={handleReset}
      />
    </>
  );
}
