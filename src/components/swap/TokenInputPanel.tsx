"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useAccount } from "wagmi";
import { TokenSelector } from "./TokenSelector";
import { Spinner } from "@/components/ui/Spinner";
import { useSwapStore } from "@/store/swapStore";
import { useSwapQuote } from "@/hooks/useSwapQuote";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { useBitcoinWallet } from "@/hooks/useBitcoinWallet";
import type { InputTokenSymbol } from "@/config/tokens";

const DEBOUNCE_MS = 600;

/** Fetch live BTC/USD price from mempool.space */
async function fetchBtcPrice(): Promise<number | null> {
  try {
    const res = await fetch("https://mempool.space/api/v1/prices");
    const data = await res.json();
    return typeof data.USD === "number" ? data.USD : null;
  } catch {
    return null;
  }
}

export function TokenInputPanel() {
  const { address } = useAccount();
  const { inputToken, outputToken, inputAmount, setInputToken, setInputAmount, setQuote } = useSwapStore();
  const { fetchQuote, isLoading, error: quoteError } = useSwapQuote();
  const { wbtcBalance } = useTokenBalances();
  const { isConnected: btcConnected, btcBalanceBtc, btcBalanceSats } = useBitcoinWallet();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [focused, setFocused] = useState(false);

  // Currency toggle state
  const [inputCurrency, setInputCurrency] = useState<"BTC" | "USD">("BTC");
  const [usdValue, setUsdValue] = useState(""); // raw USD string user types
  const [btcPrice, setBtcPrice] = useState<number | null>(null);

  // Fetch BTC price on mount and every 60s
  useEffect(() => {
    fetchBtcPrice().then(setBtcPrice);
    const timer = setInterval(() => fetchBtcPrice().then(setBtcPrice), 60_000);
    return () => clearInterval(timer);
  }, []);

  // Debounced quote fetch
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!inputAmount || parseFloat(inputAmount) <= 0) { setQuote(null); return; }
    debounceRef.current = setTimeout(async () => {
      const q = await fetchQuote(inputToken, inputAmount, outputToken);
      setQuote(q);
    }, DEBOUNCE_MS);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [inputAmount, inputToken, outputToken, fetchQuote, setQuote]);

  // Derived USD equivalent of current BTC amount (for BTC mode subtext)
  const btcInUsd =
    inputCurrency === "BTC" && btcPrice && inputAmount && parseFloat(inputAmount) > 0
      ? (parseFloat(inputAmount) * btcPrice).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 })
      : null;

  // BTC equivalent when user is typing in USD mode (for subtext)
  const usdInBtc =
    inputCurrency === "USD" && btcPrice && usdValue && parseFloat(usdValue) > 0
      ? (parseFloat(usdValue) / btcPrice).toFixed(8)
      : null;

  function handleAmountChange(val: string) {
    if (val !== "" && !/^\d*\.?\d*$/.test(val)) return;

    if (inputCurrency === "USD") {
      setUsdValue(val);
      if (val && btcPrice) {
        const btc = parseFloat(val) / btcPrice;
        setInputAmount(isNaN(btc) ? "" : btc.toFixed(8));
      } else {
        setInputAmount("");
      }
    } else {
      setInputAmount(val);
    }
  }

  function toggleCurrency() {
    if (inputCurrency === "BTC") {
      // Switch to USD — prefill USD value if we have a BTC amount
      if (btcPrice && inputAmount && parseFloat(inputAmount) > 0) {
        setUsdValue((parseFloat(inputAmount) * btcPrice).toFixed(2));
      } else {
        setUsdValue("");
      }
      setInputCurrency("USD");
    } else {
      // Switch back to BTC — inputAmount is already BTC (kept in sync)
      setUsdValue("");
      setInputCurrency("BTC");
    }
  }

  // Display value inside the input
  const displayValue = inputCurrency === "USD" ? usdValue : inputAmount;
  const placeholder = inputCurrency === "USD" ? "0.00" : "0.00";

  // Balance display
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
      const maxSats = Math.max(0, btcBalanceSats - 2000);
      const btc = (maxSats / 1e8).toFixed(8);
      if (inputCurrency === "USD" && btcPrice) {
        setUsdValue((parseFloat(btc) * btcPrice).toFixed(2));
      }
      setInputAmount(btc);
    } else if (inputToken === "WBTC") {
      const btc = (Number(wbtcBalance) / 1e8).toFixed(8);
      if (inputCurrency === "USD" && btcPrice) {
        setUsdValue((parseFloat(btc) * btcPrice).toFixed(2));
      }
      setInputAmount(btc);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-medium uppercase tracking-widest" style={{ color: "#8b88a0" }}>You send</span>
        <div className="flex items-center gap-2">
          {balanceDisplay && (
            <span className="text-[11px]" style={{ color: "#b0adc4" }}>Balance: {balanceDisplay}</span>
          )}
          {hasBalance && (
            <button
              onClick={handleMax}
              className="text-[10px] font-semibold rounded px-1.5 py-0.5 transition-all"
              style={{ color: "#6B5DD3", border: "1px solid rgba(107,93,211,0.25)" }}
            >
              MAX
            </button>
          )}
        </div>
      </div>

      <div
        className="relative rounded-2xl transition-all duration-200"
        style={{
          background: "#f5f3fc",
          border: focused ? "1.5px solid #6B5DD3" : "1.5px solid #e8e4f2",
          boxShadow: focused ? "0 0 0 3px rgba(107,93,211,0.08)" : "none",
        }}
      >
        <div className="flex items-center gap-3 p-4">
          {/* Left side: token selector + currency toggle */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {inputCurrency === "USD" ? (
              /* USD mode label */
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold"
                style={{ background: "rgba(107,93,211,0.08)", color: "#6B5DD3" }}
              >
                <span className="text-base leading-none">$</span>
                <span>USDC</span>
              </div>
            ) : (
              <TokenSelector
                value={inputToken as InputTokenSymbol}
                onChange={(t) => { setInputToken(t); setInputAmount(""); setQuote(null); }}
              />
            )}

            {/* Toggle button */}
            <button
              onClick={toggleCurrency}
              title={inputCurrency === "BTC" ? "Switch to USD input" : "Switch to BTC input"}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-semibold transition-all"
              style={{
                background: inputCurrency === "USD" ? "rgba(107,93,211,0.10)" : "transparent",
                color: "#6B5DD3",
                border: "1px solid rgba(107,93,211,0.20)",
              }}
            >
              {/* Swap arrows icon */}
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <path d="M1 3.5h9M7.5 1 10 3.5 7.5 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 7.5H1M3.5 5 1 7.5 3.5 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {inputCurrency === "BTC" ? "USD" : "BTC"}
            </button>
          </div>

          {/* Amount input */}
          <div className="flex-1 flex items-center justify-end gap-1 min-w-0">
            {inputCurrency === "USD" && (
              <span className="text-2xl font-light flex-shrink-0" style={{ color: "#b0adc4" }}>$</span>
            )}
            <input
              type="text"
              inputMode="decimal"
              placeholder={placeholder}
              value={displayValue}
              onChange={(e) => handleAmountChange(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              className="bg-transparent text-right text-2xl font-light outline-none min-w-0 w-full"
              style={{ color: "#1a1028", caretColor: "#6B5DD3", fontVariantNumeric: "tabular-nums" }}
            />
          </div>

          {isLoading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <Spinner size="sm" gold />
            </div>
          )}
        </div>

        {/* Subtext row */}
        <div className="px-4 pb-3 flex items-center justify-between">
          <span className="text-[11px]" style={{ color: "#b0adc4" }}>
            {inputCurrency === "USD" ? "USD value" : "Bitcoin Mainnet"}
          </span>
          <span className="text-[11px] font-mono" style={{ color: "#b0adc4" }}>
            {inputCurrency === "BTC" && inputAmount && parseFloat(inputAmount) > 0 && (
              <>
                {btcInUsd && <span>{btcInUsd}</span>}
                {!btcInUsd && <span>≈ {Math.round(parseFloat(inputAmount) * 1e8).toLocaleString()} sats</span>}
              </>
            )}
            {inputCurrency === "USD" && usdInBtc && (
              <span>≈ ₿ {usdInBtc}</span>
            )}
            {inputCurrency === "USD" && !usdInBtc && btcPrice && (
              <span>1 BTC ≈ ${btcPrice.toLocaleString()}</span>
            )}
          </span>
        </div>
      </div>

      {quoteError && (
        <p className="text-[11px] text-red-500 px-1">{quoteError}</p>
      )}
    </div>
  );
}
