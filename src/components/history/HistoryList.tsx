"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useHistoryStore } from "@/store/historyStore";
import { useSwapStore } from "@/store/swapStore";
import { HistoryRow } from "./HistoryRow";

type Filter = "all" | "complete" | "failed" | "refunding";

/** Map any SwapStatus → a history-compatible terminal status */
function resolveStatus(
  session: ReturnType<typeof useSwapStore.getState>["session"]
): "complete" | "failed" | "refunding" | null {
  switch (session.status) {
    case "complete":
      return "complete";
    case "failed":
      return "failed";
    case "refunding":
      return "refunding";
    // Bridge finished + xaut received → complete even if status label is mid-way
    case "bridge_complete":
    case "approving":
    case "swapping":
      return session.xautReceived ? "complete" : "failed";
    // Stuck mid-bridge → treat as failed/abandoned
    case "awaiting_deposit":
    case "confirming":
    case "bridging":
      return "failed";
    // No real transaction started
    default:
      return null;
  }
}

export function HistoryList() {
  const { records, clearHistory, addRecord } = useHistoryStore();
  const [filter, setFilter] = useState<Filter>("all");
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Auto-import any prior session from swapStore that isn't in historyStore yet
  useEffect(() => {
    const session = useSwapStore.getState().session;
    if (!session.gardenOrderId) return; // no real transaction
    const alreadyExists = useHistoryStore.getState().records.some(
      (r) => r.id === session.gardenOrderId
    );
    if (alreadyExists) return;

    const terminalStatus = resolveStatus(session);
    if (!terminalStatus) return; // genuinely idle / quoting — skip

    addRecord({
      id: session.gardenOrderId,
      createdAt: session.createdAt ?? Date.now(),
      inputToken: "BTC", // swapStore doesn't persist inputToken; BTC is the common case
      inputAmountSats: session.depositAmountSats ?? 0,
      wbtcReceived: session.gardenReceiveAmount,
      xautReceived: session.xautReceived,
      btcSentTxId: session.btcSentTxId,
      bridgeTxHash: session.bridgeTxHash,
      dexTxHash: session.dexTxHash,
      gardenOrderId: session.gardenOrderId,
      status: terminalStatus,
      errorMessage: session.errorMessage,
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = filter === "all" ? records : records.filter((r) => r.status === filter);

  const counts = {
    all: records.length,
    complete: records.filter((r) => r.status === "complete").length,
    failed: records.filter((r) => r.status === "failed").length,
    refunding: records.filter((r) => r.status === "refunding").length,
  };

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        {/* Empty vault icon */}
        <div className="relative">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{ border: "1px solid #e8e4f2", background: "#f5f3fc" }}
          >
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <rect x="4" y="6" width="28" height="22" rx="3" stroke="#6B5DD3" strokeWidth="1.5" strokeOpacity="0.4" />
              <circle cx="18" cy="17" r="5" stroke="#6B5DD3" strokeWidth="1.5" strokeOpacity="0.4" />
              <circle cx="18" cy="17" r="2" fill="#6B5DD3" fillOpacity="0.2" />
              <path d="M18 28v2M14 30h8" stroke="#6B5DD3" strokeWidth="1.5" strokeOpacity="0.4" strokeLinecap="round" />
            </svg>
          </div>
          <div
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
            style={{ background: "#ffffff", border: "1px solid #e8e4f2" }}
          >
            <span className="text-[10px]" style={{ color: "#b0adc4" }}>0</span>
          </div>
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-medium" style={{ color: "#8b88a0" }}>Vault is empty</p>
          <p className="text-xs" style={{ color: "#b0adc4" }}>Your completed swaps will appear here</p>
        </div>
        <Link
          href="/"
          className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl transition text-sm font-medium"
          style={{
            background: "rgba(107,93,211,0.08)",
            border: "1px solid rgba(107,93,211,0.20)",
            color: "#6B5DD3",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M6 3L2 7l4 4M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Start a Swap
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter tabs + clear button */}
      <div className="flex items-center justify-between">
        <div
          className="flex items-center gap-1 p-1 rounded-xl"
          style={{ background: "#f5f3fc", border: "1px solid #e8e4f2" }}
        >
          {(["all", "complete", "failed", "refunding"] as Filter[]).map((f) => (
            counts[f] > 0 || f === "all" ? (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filter === f
                    ? f === "complete"
                      ? "bg-emerald-500/15 text-emerald-600 border border-emerald-500/20"
                      : f === "failed"
                      ? "bg-red-500/15 text-red-500 border border-red-500/20"
                      : f === "refunding"
                      ? "bg-amber-500/15 text-amber-600 border border-amber-500/20"
                      : ""
                    : ""
                }`}
                style={
                  filter === f && f === "all"
                    ? { background: "rgba(107,93,211,0.10)", color: "#6B5DD3", border: "1px solid rgba(107,93,211,0.20)" }
                    : filter !== f
                    ? { color: "#8b88a0" }
                    : {}
                }
              >
                {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
                {counts[f] > 0 && (
                  <span className="ml-1.5 opacity-60">{counts[f]}</span>
                )}
              </button>
            ) : null
          ))}
        </div>

        {/* Clear history */}
        {showClearConfirm ? (
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: "#8b88a0" }}>Confirm clear?</span>
            <button
              onClick={() => { clearHistory(); setShowClearConfirm(false); }}
              className="text-xs text-red-500 hover:text-red-600 font-medium transition"
            >
              Yes, clear
            </button>
            <button
              onClick={() => setShowClearConfirm(false)}
              className="text-xs transition"
              style={{ color: "#b0adc4" }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="text-xs transition"
            style={{ color: "#b0adc4" }}
          >
            Clear all
          </button>
        )}
      </div>

      {/* Records */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center text-sm" style={{ color: "#b0adc4" }}>
          No {filter} transactions
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((record, i) => (
            <HistoryRow key={record.id} record={record} index={i} />
          ))}
        </div>
      )}

      <p className="text-center text-[10px] pt-2" style={{ color: "#b0adc4" }}>
        History is stored locally in your browser · {records.length} record{records.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
