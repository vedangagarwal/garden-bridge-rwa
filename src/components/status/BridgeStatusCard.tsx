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

  const isDone = [
    "bridge_complete", "approving", "swapping", "complete", "bridge_lifi_failed",
  ].includes(status);
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

  const cardStyle: React.CSSProperties = {
    borderRadius: 16,
    border: isDone
      ? "1.5px solid rgba(34,197,94,0.25)"
      : isActive
      ? "1.5px solid rgba(107,93,211,0.2)"
      : "1.5px solid #e8e4f2",
    background: isDone
      ? "rgba(34,197,94,0.04)"
      : isActive
      ? "rgba(107,93,211,0.04)"
      : "#fafafa",
    padding: "14px 16px",
    opacity: !isDone && !isActive ? 0.5 : 1,
    transition: "all 0.3s",
  };

  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "#8b88a0" }}>
          Step 1 — Garden Bridge
        </span>
        {isDone ? (
          <span style={{ fontSize: 12, color: "#22c55e", fontWeight: 600 }}>✓ Done</span>
        ) : isActive ? (
          <Spinner size="sm" />
        ) : null}
      </div>

      {status === "awaiting_deposit" && depositAddress && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <p style={{ fontSize: 12, color: "#4a4568", margin: 0 }}>Send BTC to this address:</p>

          {/* Address + copy */}
          <div style={{
            background: "#f5f3fc",
            borderRadius: 10,
            padding: "10px 12px",
            border: "1px solid #e8e4f2",
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
          }}>
            <p style={{ fontSize: 11, fontFamily: "monospace", color: "#6B5DD3", wordBreak: "break-all", lineHeight: 1.5, flex: 1, margin: 0 }}>
              {depositAddress}
            </p>
            <button
              onClick={copyAddress}
              style={{
                flexShrink: 0,
                fontSize: 11,
                color: "#8b88a0",
                background: "white",
                border: "1px solid #e8e4f2",
                borderRadius: 6,
                padding: "2px 8px",
                cursor: "pointer",
              }}
            >
              {copied ? "✓" : "Copy"}
            </button>
          </div>

          {/* Amount */}
          {depositAmountSats != null && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#8b88a0" }}>
              <span>Amount:</span>
              <span style={{ fontFamily: "monospace", color: "#1a1028", fontWeight: 600 }}>
                {(depositAmountSats / 1e8).toFixed(8)} BTC
              </span>
              <span style={{ color: "#b0adc4" }}>({depositAmountSats.toLocaleString()} sats)</span>
            </div>
          )}

          {/* Send via connected BTC wallet */}
          {isConnected && !txId && (
            <button
              onClick={handleSendViaWallet}
              disabled={sending}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "10px",
                borderRadius: 10,
                background: "rgba(247,147,26,0.08)",
                border: "1.5px solid rgba(247,147,26,0.3)",
                color: "#f7931a",
                fontSize: 13,
                fontWeight: 600,
                cursor: sending ? "not-allowed" : "pointer",
                opacity: sending ? 0.6 : 1,
              }}
            >
              {sending ? (
                <><Spinner size="sm" /> Confirm in wallet…</>
              ) : (
                <><span>₿</span> Send via Wallet</>
              )}
            </button>
          )}

          {/* Tx sent confirmation */}
          {txId && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
              <span style={{ color: "#22c55e" }}>✓ Sent:</span>
              <a
                href={`https://mempool.space/tx/${txId}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontFamily: "monospace", color: "#6B5DD3", opacity: 0.8 }}
              >
                {txId.slice(0, 8)}…{txId.slice(-6)}
              </a>
            </div>
          )}

          {sendingError && (
            <p style={{ fontSize: 12, color: "#dc2626", margin: 0 }}>{sendingError}</p>
          )}

          <p style={{ fontSize: 11, color: "#b0adc4", margin: 0 }}>
            Waiting for your transaction to appear on-chain…
          </p>
        </div>
      )}

      {status === "confirming" && (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: "#4a4568" }}>Confirmations</span>
            <span style={{ fontSize: 12, fontFamily: "monospace", color: "#6B5DD3", fontWeight: 600 }}>
              {btcConfirmations} / {btcRequiredConfirmations}
            </span>
          </div>
          <div style={{ height: 6, background: "#f0edf8", borderRadius: 99, overflow: "hidden" }}>
            <div style={{
              height: "100%",
              background: "linear-gradient(90deg, #6B5DD3, #a096e8)",
              borderRadius: 99,
              transition: "width 0.5s",
              width: `${Math.min(100, (btcConfirmations / btcRequiredConfirmations) * 100)}%`,
            }} />
          </div>
          {/* Show mempool link + reassurance when BTC tx is known but confirmations still 0 */}
          {txId && (
            <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 11, color: "#22c55e" }}>✓ BTC sent:</span>
              <a
                href={`https://mempool.space/tx/${txId}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 11, fontFamily: "monospace", color: "#6B5DD3" }}
              >
                {txId.slice(0, 8)}…{txId.slice(-6)} ↗
              </a>
            </div>
          )}
          <p style={{ fontSize: 11, color: "#b0adc4", marginTop: 6, marginBottom: 0 }}>
            Waiting for Garden Finance to detect the confirmation. This can take up to 15 minutes — keep this tab open.
          </p>
        </div>
      )}

      {status === "bridging" && (
        <p style={{ fontSize: 12, color: "#4a4568", margin: 0 }}>Solver executing bridge…</p>
      )}

      {isDone && bridgeTxHash && (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 12, color: "#8b88a0" }}>Redeem tx:</span>
          <TxHashLink hash={bridgeTxHash} />
        </div>
      )}

      {isDone && session.gardenReceiveAmount && (
        <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 12, color: "#8b88a0" }}>Received:</span>
          <span style={{ fontSize: 12, fontFamily: "monospace", color: "#22c55e", fontWeight: 600 }}>
            {/* Solana path: show raw USDC units converted; Arbitrum: show WBTC */}
            {session.gardenReceiveAmount}
          </span>
        </div>
      )}
    </div>
  );
}
