"use client";

import { useState } from "react";
import type { SwapRecord } from "@/store/historyStore";

interface Props {
  record: SwapRecord;
  index: number;
}

const ARBISCAN = "https://arbiscan.io/tx";
const MEMPOOL = "https://mempool.space/tx";

function ExternalLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 font-mono text-[11px] transition-colors"
      style={{ color: "#6B5DD3" }}
    >
      {label}
      <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
        <path d="M1 8L8 1M8 1H3.5M8 1V5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  );
}

function StatusBadge({ status }: { status: SwapRecord["status"] }) {
  const cfg = {
    complete: {
      dot: "bg-emerald-500",
      text: "text-emerald-600",
      bg: "bg-emerald-500/10 border-emerald-500/20",
      label: "Complete",
    },
    failed: {
      dot: "bg-red-500",
      text: "text-red-500",
      bg: "bg-red-500/10 border-red-500/20",
      label: "Failed",
    },
    refunding: {
      dot: "bg-amber-500",
      text: "text-amber-600",
      bg: "bg-amber-500/10 border-amber-500/20",
      label: "Refunding",
    },
  }[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${cfg.bg} ${cfg.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

export function HistoryRow({ record, index }: Props) {
  const [expanded, setExpanded] = useState(false);

  const btcAmount = record.inputAmountSats
    ? (record.inputAmountSats / 1e8).toFixed(6)
    : "—";

  const xautDisplay = record.xautReceived
    ? parseFloat(record.xautReceived).toFixed(4)
    : null;

  const wbtcDisplay = record.wbtcReceived
    ? parseFloat(record.wbtcReceived).toFixed(6)
    : null;

  const date = record.createdAt
    ? new Date(record.createdAt)
    : null;

  const dateStr = date
    ? date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "—";

  const timeStr = date
    ? date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    : "";

  const shortId = record.gardenOrderId
    ? `${record.gardenOrderId.slice(0, 6)}…${record.gardenOrderId.slice(-4)}`
    : `#${index + 1}`;

  const cardStyle =
    record.status === "complete"
      ? { border: "1px solid rgba(16,185,129,0.25)", background: "#ffffff" }
      : record.status === "failed"
      ? { border: "1px solid rgba(239,68,68,0.20)", background: "#ffffff" }
      : { border: "1px solid rgba(245,158,11,0.25)", background: "#ffffff" };

  const cardHoverClass =
    record.status === "complete"
      ? "hover:border-emerald-300"
      : record.status === "failed"
      ? "hover:border-red-300"
      : "hover:border-amber-300";

  return (
    <div
      className={`rounded-2xl transition-all duration-200 overflow-hidden ${cardHoverClass}`}
      style={{ ...cardStyle, boxShadow: "0 1px 8px rgba(107,93,211,0.06)" }}
    >
      {/* Main row — always visible */}
      <button
        className="w-full text-left px-4 py-3.5 flex items-center gap-4"
        onClick={() => setExpanded((e) => !e)}
      >
        {/* Row number / index */}
        <span className="text-[11px] font-mono w-5 flex-shrink-0 text-right" style={{ color: "#b0adc4" }}>
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* Flow: BTC → Token */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold font-mono" style={{ color: "#1a1028" }}>
              {btcAmount}
            </span>
            <span className="text-xs font-medium uppercase tracking-widest" style={{ color: "#8b88a0" }}>
              {record.inputToken}
            </span>

            {/* Arrow */}
            <svg width="16" height="10" viewBox="0 0 16 10" fill="none" className="flex-shrink-0" style={{ color: "#b0adc4" }}>
              <path d="M0 5h14M10 1l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>

            {xautDisplay ? (
              <>
                <span
                  className="text-sm font-semibold font-mono"
                  style={{ color: "#6B5DD3" }}
                >
                  {xautDisplay}
                </span>
                <span className="text-xs font-medium uppercase tracking-widest" style={{ color: "rgba(107,93,211,0.5)" }}>
                  XAUt0
                </span>
              </>
            ) : (
              <span className="text-xs" style={{ color: "#b0adc4" }}>—</span>
            )}
          </div>

          {/* Date + order id */}
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px]" style={{ color: "#b0adc4" }}>{dateStr}</span>
            <span style={{ color: "#e8e4f2" }}>·</span>
            <span className="text-[11px]" style={{ color: "#b0adc4" }}>{timeStr}</span>
            <span style={{ color: "#e8e4f2" }}>·</span>
            <span className="text-[11px] font-mono" style={{ color: "#b0adc4" }}>{shortId}</span>
          </div>
        </div>

        {/* Status + chevron */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <StatusBadge status={record.status} />
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
            style={{ color: "#b0adc4" }}
          >
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </button>

      {/* Expanded detail panel */}
      {expanded && (
        <div className="px-4 pb-4 pt-3 space-y-3" style={{ borderTop: "1px solid #e8e4f2" }}>
          {/* Amounts grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl p-3" style={{ background: "#f5f3fc", border: "1px solid #e8e4f2" }}>
              <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "#8b88a0" }}>BTC Sent</p>
              <p className="text-sm font-mono font-semibold" style={{ color: "#1a1028" }}>{btcAmount}</p>
              <p className="text-[10px] mt-0.5" style={{ color: "#b0adc4" }}>{record.inputAmountSats?.toLocaleString()} sats</p>
            </div>
            {wbtcDisplay && (
              <div className="rounded-xl p-3" style={{ background: "#f5f3fc", border: "1px solid #e8e4f2" }}>
                <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "#8b88a0" }}>WBTC Received</p>
                <p className="text-sm font-mono font-semibold" style={{ color: "#1a1028" }}>{wbtcDisplay}</p>
                <p className="text-[10px] mt-0.5" style={{ color: "#b0adc4" }}>via Garden Bridge</p>
              </div>
            )}
            {xautDisplay && (
              <div className="rounded-xl p-3" style={{ background: "#f5f3fc", border: "1px solid rgba(107,93,211,0.25)" }}>
                <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "rgba(107,93,211,0.55)" }}>XAUt0 Received</p>
                <p className="text-sm font-mono font-semibold" style={{ color: "#6B5DD3" }}>{xautDisplay}</p>
                <p className="text-[10px] mt-0.5" style={{ color: "#b0adc4" }}>via 1inch on Arbitrum</p>
              </div>
            )}
            {record.errorMessage && (
              <div className="col-span-2 rounded-xl p-3 bg-red-50 border border-red-200">
                <p className="text-[10px] text-red-400 uppercase tracking-widest mb-1">Error</p>
                <p className="text-xs text-red-500 break-all">{record.errorMessage}</p>
              </div>
            )}
          </div>

          {/* Transaction links */}
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-widest" style={{ color: "#8b88a0" }}>Transactions</p>
            <div className="flex flex-col gap-1.5">
              {record.btcSentTxId && (
                <div className="flex items-center justify-between">
                  <span className="text-[11px]" style={{ color: "#8b88a0" }}>BTC sent</span>
                  <ExternalLink
                    href={`${MEMPOOL}/${record.btcSentTxId}`}
                    label={`${record.btcSentTxId.slice(0, 8)}…${record.btcSentTxId.slice(-6)}`}
                  />
                </div>
              )}
              {record.bridgeTxHash && (
                <div className="flex items-center justify-between">
                  <span className="text-[11px]" style={{ color: "#8b88a0" }}>Bridge redeem</span>
                  <ExternalLink
                    href={`${ARBISCAN}/${record.bridgeTxHash}`}
                    label={`${record.bridgeTxHash.slice(0, 8)}…${record.bridgeTxHash.slice(-6)}`}
                  />
                </div>
              )}
              {record.dexTxHash && (
                <div className="flex items-center justify-between">
                  <span className="text-[11px]" style={{ color: "#8b88a0" }}>DEX swap</span>
                  <ExternalLink
                    href={`${ARBISCAN}/${record.dexTxHash}`}
                    label={`${record.dexTxHash.slice(0, 8)}…${record.dexTxHash.slice(-6)}`}
                  />
                </div>
              )}
              {record.gardenOrderId && (
                <div className="flex items-center justify-between">
                  <span className="text-[11px]" style={{ color: "#8b88a0" }}>Garden order</span>
                  <ExternalLink
                    href={`https://app.garden.finance/orders/${record.gardenOrderId}`}
                    label={`${record.gardenOrderId.slice(0, 8)}…${record.gardenOrderId.slice(-6)}`}
                  />
                </div>
              )}
              {!record.btcSentTxId && !record.bridgeTxHash && !record.dexTxHash && !record.gardenOrderId && (
                <p className="text-[11px]" style={{ color: "#b0adc4" }}>No transaction hashes recorded</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
