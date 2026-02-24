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
      className="inline-flex items-center gap-1 text-[#d4af37] hover:text-[#f5c518] transition-colors font-mono text-[11px]"
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
      dot: "bg-emerald-400",
      text: "text-emerald-400",
      bg: "bg-emerald-500/8 border-emerald-500/15",
      label: "Complete",
    },
    failed: {
      dot: "bg-red-400",
      text: "text-red-400",
      bg: "bg-red-500/8 border-red-500/15",
      label: "Failed",
    },
    refunding: {
      dot: "bg-amber-400",
      text: "text-amber-400",
      bg: "bg-amber-500/8 border-amber-500/15",
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

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
        record.status === "complete"
          ? "border-emerald-500/10 bg-emerald-500/3 hover:border-emerald-500/20"
          : record.status === "failed"
          ? "border-red-500/10 bg-red-500/3 hover:border-red-500/20"
          : "border-amber-500/10 bg-amber-500/3 hover:border-amber-500/20"
      }`}
    >
      {/* Main row — always visible */}
      <button
        className="w-full text-left px-4 py-3.5 flex items-center gap-4"
        onClick={() => setExpanded((e) => !e)}
      >
        {/* Row number / index */}
        <span className="text-[11px] text-white/15 font-mono w-5 flex-shrink-0 text-right">
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* Flow: BTC → XAUt */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-white font-mono">
              {btcAmount}
            </span>
            <span className="text-white/30 text-xs font-medium uppercase tracking-widest">
              {record.inputToken}
            </span>

            {/* Arrow */}
            <svg width="16" height="10" viewBox="0 0 16 10" fill="none" className="text-white/15 flex-shrink-0">
              <path d="M0 5h14M10 1l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>

            {xautDisplay ? (
              <>
                <span
                  className="text-sm font-semibold font-mono"
                  style={{
                    background: "linear-gradient(135deg, #d4af37 0%, #f5c518 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {xautDisplay}
                </span>
                <span className="text-[#d4af37]/50 text-xs font-medium uppercase tracking-widest">
                  XAUt0
                </span>
              </>
            ) : (
              <span className="text-xs text-white/20">—</span>
            )}
          </div>

          {/* Date + order id */}
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] text-white/25">{dateStr}</span>
            <span className="text-white/10">·</span>
            <span className="text-[11px] text-white/20">{timeStr}</span>
            <span className="text-white/10">·</span>
            <span className="text-[11px] text-white/20 font-mono">{shortId}</span>
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
            className={`text-white/20 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          >
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </button>

      {/* Expanded detail panel */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-white/4 pt-3 space-y-3">
          {/* Amounts grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-black/20 rounded-xl p-3 border border-white/4">
              <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">BTC Sent</p>
              <p className="text-sm font-mono font-semibold text-white">{btcAmount}</p>
              <p className="text-[10px] text-white/25 mt-0.5">{record.inputAmountSats?.toLocaleString()} sats</p>
            </div>
            {wbtcDisplay && (
              <div className="bg-black/20 rounded-xl p-3 border border-white/4">
                <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">WBTC Received</p>
                <p className="text-sm font-mono font-semibold text-white">{wbtcDisplay}</p>
                <p className="text-[10px] text-white/25 mt-0.5">via Garden Bridge</p>
              </div>
            )}
            {xautDisplay && (
              <div className="bg-black/20 rounded-xl p-3 border border-[#d4af37]/10">
                <p className="text-[10px] text-[#d4af37]/50 uppercase tracking-widest mb-1">XAUt0 Received</p>
                <p className="text-sm font-mono font-semibold text-[#d4af37]">{xautDisplay}</p>
                <p className="text-[10px] text-white/25 mt-0.5">via 1inch on Arbitrum</p>
              </div>
            )}
            {record.errorMessage && (
              <div className="col-span-2 bg-red-500/5 rounded-xl p-3 border border-red-500/10">
                <p className="text-[10px] text-red-400/60 uppercase tracking-widest mb-1">Error</p>
                <p className="text-xs text-red-400 break-all">{record.errorMessage}</p>
              </div>
            )}
          </div>

          {/* Transaction links */}
          <div className="space-y-2">
            <p className="text-[10px] text-white/20 uppercase tracking-widest">Transactions</p>
            <div className="flex flex-col gap-1.5">
              {record.btcSentTxId && (
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-white/30">BTC sent</span>
                  <ExternalLink
                    href={`${MEMPOOL}/${record.btcSentTxId}`}
                    label={`${record.btcSentTxId.slice(0, 8)}…${record.btcSentTxId.slice(-6)}`}
                  />
                </div>
              )}
              {record.bridgeTxHash && (
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-white/30">Bridge redeem</span>
                  <ExternalLink
                    href={`${ARBISCAN}/${record.bridgeTxHash}`}
                    label={`${record.bridgeTxHash.slice(0, 8)}…${record.bridgeTxHash.slice(-6)}`}
                  />
                </div>
              )}
              {record.dexTxHash && (
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-white/30">DEX swap</span>
                  <ExternalLink
                    href={`${ARBISCAN}/${record.dexTxHash}`}
                    label={`${record.dexTxHash.slice(0, 8)}…${record.dexTxHash.slice(-6)}`}
                  />
                </div>
              )}
              {record.gardenOrderId && (
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-white/30">Garden order</span>
                  <ExternalLink
                    href={`https://app.garden.finance/orders/${record.gardenOrderId}`}
                    label={`${record.gardenOrderId.slice(0, 8)}…${record.gardenOrderId.slice(-6)}`}
                  />
                </div>
              )}
              {!record.btcSentTxId && !record.bridgeTxHash && !record.dexTxHash && !record.gardenOrderId && (
                <p className="text-[11px] text-white/20">No transaction hashes recorded</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
