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
import type { OutputTokenKey } from "@/config/tokens";

const TOKEN_DISCLAIMERS: Record<OutputTokenKey, string> = {
  XAUT: "XAUt0 is Tether Gold bridged to Arbitrum via LayerZero OFT. Verify contract addresses before transacting.",
  PAXG: "PAXG is PAX Gold on Arbitrum. Verify contract addresses before transacting.",
  TSLAX: "TSLAx is a tokenized Tesla equity on Solana. Verify contract addresses before transacting.",
  USDG: "USDG is a Garden Finance USD stablecoin on Solana. Verify contract addresses before transacting.",
};

// Arrow down icon
function ArrowDown() {
  return (
    <div className="flex items-center justify-center my-1">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center"
        style={{ background: "#f5f3fc", border: "1px solid #e8e4f2" }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 2V12M7 12L3.5 8.5M7 12L10.5 8.5" stroke="#6B5DD3" strokeOpacity="0.6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
      <div
        className="relative rounded-3xl overflow-hidden"
        style={{
          background: "#ffffff",
          border: "1px solid #e8e4f2",
          boxShadow: "0 4px 32px rgba(107,93,211,0.10)",
        }}
      >
        {/* Top accent stripe */}
        <div
          className="h-0.5 w-full"
          style={{
            background: isSolana
              ? "linear-gradient(90deg, transparent, #a78bfa, #818cf8, transparent)"
              : "linear-gradient(90deg, transparent, #6B5DD3, #8a7de0, transparent)",
          }}
        />

        <div className="p-5 space-y-3">
          <TokenInputPanel />
          <ArrowDown />

          {/* Output token selector */}
          <div className="flex flex-col gap-2 px-1">
            <span className="text-xs font-medium uppercase tracking-widest" style={{ color: "#8b88a0" }}>
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
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: isSolana ? "#a78bfa" : "#6B5DD3", opacity: 0.7 }}
          />
          <span className="text-[10px] tracking-wide" style={{ color: "#b0adc4" }}>
            {isSolana
              ? "Powered by Garden Finance · Solana · LiFi"
              : "Powered by Garden Finance · Arbitrum · 1inch"
            }
          </span>
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

      {/* Per-token disclaimer */}
      <p className="text-center text-[10px] leading-relaxed pt-2" style={{ color: "#b0adc4" }}>
        {TOKEN_DISCLAIMERS[outputToken]}
      </p>
    </>
  );
}
