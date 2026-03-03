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

  // "BTC" = user types BTC, "USD" = user types USD
  const [primaryCurrency, setPrimaryCurrency] = useState<"BTC" | "USD">("BTC");
  const [rawInput, setRawInput] = useState(""); // what the user is actually typing
  const [btcPrice, setBtcPrice] = useState<number | null>(null);

  // Fetch price on mount, refresh every 60s
  useEffect(() => {
    fetchBtcPrice().then(setBtcPrice);
    const t = setInterval(() => fetchBtcPrice().then(setBtcPrice), 60_000);
    return () => clearInterval(t);
  }, []);

  // Keep store inputAmount (always BTC) in sync
  useEffect(() => {
    if (primaryCurrency === "BTC") {
      setInputAmount(rawInput);
    } else {
      if (rawInput && btcPrice) {
        const btc = parseFloat(rawInput) / btcPrice;
        setInputAmount(isNaN(btc) ? "" : btc.toFixed(8));
      } else {
        setInputAmount("");
      }
    }
  }, [rawInput, primaryCurrency, btcPrice, setInputAmount]);

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

  function handleAmountChange(val: string) {
    if (val === "" || /^\d*\.?\d*$/.test(val)) setRawInput(val);
  }

  // Flip primary/secondary — convert current value to the new unit
  function flip() {
    if (primaryCurrency === "BTC") {
      // Switch to USD: convert current BTC raw value → USD
      if (btcPrice && rawInput && parseFloat(rawInput) > 0) {
        setRawInput((parseFloat(rawInput) * btcPrice).toFixed(2));
      } else {
        setRawInput("");
      }
      setPrimaryCurrency("USD");
    } else {
      // Switch to BTC: inputAmount is already BTC in the store
      if (inputAmount && parseFloat(inputAmount) > 0) {
        setRawInput(parseFloat(inputAmount).toFixed(8).replace(/\.?0+$/, ""));
      } else {
        setRawInput("");
      }
      setPrimaryCurrency("BTC");
    }
  }

  // Secondary line values
  const secondaryLabel = (() => {
    const v = parseFloat(rawInput);
    if (!rawInput || isNaN(v) || v <= 0) {
      if (primaryCurrency === "BTC") return btcPrice ? `$0.00` : null;
      return "₿ 0.00";
    }
    if (primaryCurrency === "BTC") {
      if (!btcPrice) return null;
      return `$${(v * btcPrice).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
      if (!btcPrice) return null;
      const btc = v / btcPrice;
      return `₿ ${btc.toFixed(6)}`;
    }
  })();

  // Balance display
  const balanceDisplay = (() => {
    if (inputToken === "BTC") {
      if (!btcConnected) return null;
      if (btcBalanceBtc === null) return "loading…";
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
      const maxBtc = Math.max(0, btcBalanceSats - 2000) / 1e8;
      if (primaryCurrency === "USD" && btcPrice) {
        setRawInput((maxBtc * btcPrice).toFixed(2));
      } else {
        setRawInput(maxBtc.toFixed(8));
      }
    } else if (inputToken === "WBTC") {
      const maxBtc = Number(wbtcBalance) / 1e8;
      if (primaryCurrency === "USD" && btcPrice) {
        setRawInput((maxBtc * btcPrice).toFixed(2));
      } else {
        setRawInput(maxBtc.toFixed(8));
      }
    }
  }

  return (
    <div className="space-y-2">
      {/* Label row */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-medium uppercase tracking-widest" style={{ color: "#8b88a0" }}>
          You send
        </span>
        <div className="flex items-center gap-2">
          {balanceDisplay && (
            <span className="text-[11px]" style={{ color: "#b0adc4" }}>
              Balance: {balanceDisplay}
            </span>
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

      {/* Input card */}
      <div
        className="rounded-2xl transition-all duration-200"
        style={{
          background: "#f5f3fc",
          border: focused ? "1.5px solid #6B5DD3" : "1.5px solid #e8e4f2",
          boxShadow: focused ? "0 0 0 3px rgba(107,93,211,0.08)" : "none",
        }}
      >
        {/* Top row: token selector + amount */}
        <div className="flex items-center gap-3 px-4 pt-4 pb-2">
          <TokenSelector
            value={inputToken as InputTokenSymbol}
            onChange={(t) => { setInputToken(t); setRawInput(""); setQuote(null); }}
          />

          <div className="flex-1 flex items-center justify-end gap-1 min-w-0 relative">
            {primaryCurrency === "USD" && (
              <span className="text-2xl font-light flex-shrink-0" style={{ color: "#b0adc4" }}>$</span>
            )}
            <input
              type="text"
              inputMode="decimal"
              placeholder="0"
              value={rawInput}
              onChange={(e) => handleAmountChange(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              className="bg-transparent text-right text-2xl font-light outline-none min-w-0 w-full"
              style={{ color: "#1a1028", caretColor: "#6B5DD3", fontVariantNumeric: "tabular-nums" }}
            />
            {isLoading && (
              <div className="flex-shrink-0">
                <Spinner size="sm" gold />
              </div>
            )}
          </div>
        </div>

        {/* Bottom row: secondary currency + flip button */}
        <div className="flex items-center justify-end gap-1.5 px-4 pb-3">
          {secondaryLabel && (
            <button
              onClick={flip}
              className="flex items-center gap-1.5 rounded-lg px-2 py-1 transition-all group"
              style={{ color: "#8b88a0" }}
              title="Flip input currency"
            >
              <span className="text-[12px] font-mono">{secondaryLabel}</span>
              {/* ↕ flip icon */}
              <svg
                width="12" height="12" viewBox="0 0 12 12" fill="none"
                className="group-hover:scale-110 transition-transform"
                style={{ color: "#6B5DD3" }}
              >
                <path d="M3 1v10M3 1L1 3.5M3 1l2 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 11V1M9 11l-2-2.5M9 11l2-2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {quoteError && (
        <p className="text-[11px] text-red-500 px-1">{quoteError}</p>
      )}
    </div>
  );
}
