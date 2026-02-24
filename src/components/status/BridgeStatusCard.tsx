"use client";

import { useState } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { TxHashLink } from "./TxHashLink";
import { useBitcoinWallet } from "@/hooks/useBitcoinWallet";
import { useBitcoinWalletStore } from "@/store/bitcoinWalletStore";
import type { SwapSession } from "@/types/swap";

interface Props {
  session: SwapSession;
  onBtcSent?: (txid: string) => void;
}

export function BridgeStatusCard({ session, onBtcSent }: Props) {
  const {
    status,
    depositAddress,
    depositAmountSats,
    btcConfirmations,
    btcRequiredConfirmations,
    bridgeTxHash,
    btcSentTxId,
  } = session;

  const { isConnected, sendBitcoin } = useBitcoinWallet();
  const sendingError = useBitcoinWalletStore((s) => s.error);

  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [localTxId, setLocalTxId] = useState<string | null>(btcSentTxId);

  const isDone = ["bridge_complete", "approving", "swapping", "complete"].includes(status);
  const isActive = ["awaiting_deposit", "confirming", "bridging"].includes(status);

  async function copyAddress() {
    if (!depositAddress) return;
    await navigator.clipboard.writeText(depositAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSendViaWallet() {
    if (!depositAddress || !depositAmountSats) return;
    setSending(true);
    try {
      const txid = await sendBitcoin(depositAddress, depositAmountSats);
      setLocalTxId(txid);
      onBtcSent?.(txid);
    } catch {
      // error shown via store
    } finally {
      setSending(false);
    }
  }

  const txId = localTxId ?? btcSentTxId;

  return (
    <div className={`rounded-2xl border p-4 transition-all duration-300 ${
      isDone ? "border-emerald-500/20 bg-emerald-500/5" :
      isActive ? "border-[#d4af37]/20 bg-[#d4af37]/5" :
      "border-white/5 bg-white/2 opacity-40"
    }`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-white/40">
          Step 1 — Garden Bridge
        </span>
        {isDone ? (
          <span className="text-xs text-emerald-400 font-medium">✓ Done</span>
        ) : isActive ? (
          <Spinner size="sm" gold />
        ) : null}
      </div>

      {status === "awaiting_deposit" && depositAddress && (
        <div className="space-y-3">
          <p className="text-xs text-white/50">Send BTC to this address:</p>

          {/* Address + copy */}
          <div className="bg-black/40 rounded-xl p-3 border border-white/5 flex items-start gap-2">
            <p className="text-xs font-mono text-[#d4af37] break-all leading-relaxed flex-1">
              {depositAddress}
            </p>
            <button
              onClick={copyAddress}
              className="flex-shrink-0 text-xs text-white/30 hover:text-white/70 transition px-2 py-0.5 rounded border border-white/10 hover:border-white/20"
            >
              {copied ? "✓" : "Copy"}
            </button>
          </div>

          {/* Amount */}
          {depositAmountSats != null && (
            <div className="flex items-center gap-2 text-xs text-white/40">
              <span>Amount:</span>
              <span className="font-mono text-white/70">
                {(depositAmountSats / 1e8).toFixed(8)} BTC
              </span>
              <span className="text-white/25">({depositAmountSats.toLocaleString()} sats)</span>
            </div>
          )}

          {/* Send via connected BTC wallet */}
          {isConnected && !txId && (
            <button
              onClick={handleSendViaWallet}
              disabled={sending}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#f7931a]/10 border border-[#f7931a]/30 hover:bg-[#f7931a]/20 transition text-sm font-medium text-[#f7931a] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <>
                  <Spinner size="sm" />
                  Confirm in wallet…
                </>
              ) : (
                <>
                  <span>₿</span>
                  Send via Wallet
                </>
              )}
            </button>
          )}

          {/* Tx sent confirmation */}
          {txId && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-emerald-400">✓ Sent:</span>
              <a
                href={`https://mempool.space/tx/${txId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[#d4af37]/70 hover:text-[#d4af37] truncate max-w-[160px]"
              >
                {txId.slice(0, 8)}…{txId.slice(-6)}
              </a>
            </div>
          )}

          {sendingError && (
            <p className="text-xs text-red-400">{sendingError}</p>
          )}

          <p className="text-[11px] text-white/30">
            Waiting for your transaction to appear on-chain…
          </p>
        </div>
      )}

      {status === "confirming" && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-white/60">Confirmations</span>
            <span className="text-xs font-mono text-[#d4af37]">
              {btcConfirmations} / {btcRequiredConfirmations}
            </span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#d4af37] to-[#f5c518] rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (btcConfirmations / btcRequiredConfirmations) * 100)}%` }}
            />
          </div>
          <p className="text-[11px] text-white/30 mt-2">Bitcoin network confirming your transaction…</p>
        </div>
      )}

      {status === "bridging" && (
        <p className="text-xs text-white/50">Solver executing bridge to Arbitrum…</p>
      )}

      {isDone && bridgeTxHash && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/40">Redeem tx:</span>
          <TxHashLink hash={bridgeTxHash} />
        </div>
      )}

      {isDone && session.gardenReceiveAmount && (
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs text-white/40">WBTC received:</span>
          <span className="text-xs font-mono text-emerald-400">
            {parseFloat(session.gardenReceiveAmount).toFixed(8)} WBTC
          </span>
        </div>
      )}
    </div>
  );
}
