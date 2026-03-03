"use client";

import { useEffect, useRef, useState } from "react";
import { useAccount } from "wagmi";
import { TokenSelector } from "./TokenSelector";
import { Spinner } from "@/components/ui/Spinner";
import { useSwapStore } from "@/store/swapStore";
import { useSwapQuote } from "@/hooks/useSwapQuote";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { useBitcoinWallet } from "@/hooks/useBitcoinWallet";
import type { InputTokenSymbol } from "@/config/tokens";

const DEBOUNCE_MS = 600;

export function TokenInputPanel() {
  const { address } = useAccount();
  const { inputToken, outputToken, inputAmount, setInputToken, setInputAmount, setQuote } = useSwapStore();
  const { fetchQuote, isLoading, error: quoteError } = useSwapQuote();
  const { wbtcBalance } = useTokenBalances();
  const { isConnected: btcConnected, btcBalanceBtc, btcBalanceSats } = useBitcoinWallet();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [focused, setFocused] = useState(false);

  // Debounced quote fetch — re-fetch when outputToken changes too
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!inputAmount || parseFloat(inputAmount) <= 0) { setQuote(null); return; }
    debounceRef.current = setTimeout(async () => {
      const q = await fetchQuote(inputToken, inputAmount, outputToken);
      setQuote(q);
    }, DEBOUNCE_MS);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [inputAmount, inputToken, outputToken, fetchQuote, setQuote]);

  function handleAmountChange(val: string) {
    if (val === "" || /^\d*\.?\d*$/.test(val)) setInputAmount(val);
  }

  // Balance display string
  const balanceDisplay = (() => {
    if (inputToken === "BTC") {
      if (!btcConnected) return null;
      if (btcBalanceBtc === null) return "Balance: loading…";
      return `${parseFloat(btcBalanceBtc).toFixed(6)} BTC`;
    }
    if (inputToken === "WBTC") {
      if (!address) return null;
      return `${(Number(wbtcBalance) / 1e8).toFixed(6)} WBTC`;
    }
    return null;
  })();

  const hasBalance =
    (inputToken === "BTC" && btcConnected && btcBalanceSats !== null) ||
    (inputToken === "WBTC" && !!address);

  function handleMax() {
    if (inputToken === "BTC" && btcBalanceSats !== null) {
      const maxSats = Math.max(0, btcBalanceSats - 2000); // reserve ~2000 sats for fee
      setInputAmount((maxSats / 1e8).toFixed(8));
    } else if (inputToken === "WBTC") {
      setInputAmount((Number(wbtcBalance) / 1e8).toFixed(8));
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-medium text-white/40 uppercase tracking-widest">You send</span>
        <div className="flex items-center gap-2">
          {balanceDisplay && (
            <span className="text-[11px] text-white/30">Balance: {balanceDisplay}</span>
          )}
          {hasBalance && (
            <button
              onClick={handleMax}
              className="text-[10px] font-semibold text-[#d4af37]/60 hover:text-[#d4af37] border border-[#d4af37]/20 hover:border-[#d4af37]/50 rounded px-1.5 py-0.5 transition-all"
            >
              MAX
            </button>
          )}
        </div>
      </div>

      <div className={`
        relative rounded-2xl border bg-[#111] transition-all duration-200
        ${focused ? "border-[#d4af37]/50 shadow-[0_0_20px_rgba(212,175,55,0.1)]" : "border-white/10"}
      `}>
        <div className="flex items-center gap-3 p-4">
          <TokenSelector
            value={inputToken as InputTokenSymbol}
            onChange={(t) => { setInputToken(t); setInputAmount(""); setQuote(null); }}
          />
          <input
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            value={inputAmount}
            onChange={(e) => handleAmountChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="flex-1 bg-transparent text-right text-2xl font-light text-white placeholder-white/15 outline-none min-w-0"
            style={{ fontVariantNumeric: "tabular-nums" }}
          />
          {isLoading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <Spinner size="sm" gold />
            </div>
          )}
        </div>
        {inputToken === "BTC" && inputAmount && parseFloat(inputAmount) > 0 && (
          <div className="px-4 pb-3 flex items-center justify-between">
            <span className="text-[11px] text-white/25">Bitcoin Mainnet</span>
            <span className="text-[11px] text-white/25 font-mono">
              ≈ {Math.round(parseFloat(inputAmount || "0") * 1e8).toLocaleString()} sats
            </span>
          </div>
        )}
      </div>

      {quoteError && (
        <p className="text-[11px] text-red-400/80 px-1">{quoteError}</p>
      )}
    </div>
  );
}
