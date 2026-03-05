"use client";

import { Modal } from "@/components/ui/Modal";
import { StepIndicator } from "@/components/status/StepIndicator";
import { BridgeStatusCard } from "@/components/status/BridgeStatusCard";
import { DexSwapStatusCard } from "@/components/status/DexSwapStatusCard";
import { Button } from "@/components/ui/Button";
import { useSwapStore } from "@/store/swapStore";
import { OUTPUT_TOKENS } from "@/config/tokens";
import type { SwapSession } from "@/types/swap";

interface Props {
  open: boolean;
  session: SwapSession;
  onClose: () => void;
  onReset: () => void;
}

export function SwapStatusModal({ open, session, onClose, onReset }: Props) {
  const { outputToken, setSession } = useSwapStore();
  const { status, errorMessage, xautReceived, usdcInWallet } = session;

  const isDone = status === "complete";
  const isFailed = status === "failed" || status === "refunding";
  const isJupiterFailed = status === "bridge_jupiter_failed";
  const canDismiss = isDone || isFailed || isJupiterFailed;

  const tokenConfig = OUTPUT_TOKENS[outputToken];
  const isSolana = tokenConfig.network === "solana";

  const modalTitle = isDone
    ? "Swap Complete 🎉"
    : isJupiterFailed
    ? "Bridge Succeeded ⚠️"
    : isFailed
    ? "Swap Failed"
    : "Swap in Progress";

  return (
    <Modal
      open={open}
      onClose={canDismiss ? onClose : undefined}
      title={modalTitle}
    >
      <div className="space-y-4">
        <StepIndicator status={status} />

        <div className="space-y-3">
          <BridgeStatusCard
            session={session}
            onBtcSent={(txid) => setSession({ btcSentTxId: txid })}
          />
          <DexSwapStatusCard session={session} />
        </div>

        {/* ── Full success ── */}
        {isDone && xautReceived && (
          <div style={{
            borderRadius: 16,
            border: isSolana ? "1.5px solid rgba(107,93,211,0.25)" : "1.5px solid rgba(212,175,55,0.3)",
            background: isSolana ? "rgba(107,93,211,0.06)" : "rgba(212,175,55,0.06)",
            padding: "20px",
            textAlign: "center",
          }}>
            <div style={{
              fontSize: 28,
              fontWeight: 300,
              color: isSolana ? "#6B5DD3" : "#b8860b",
              marginBottom: 4,
              fontVariantNumeric: "tabular-nums",
            }}>
              {parseFloat(xautReceived).toFixed(6)}
            </div>
            <div style={{ fontSize: 13, color: "#8b88a0" }}>
              {tokenConfig.symbol} received on {isSolana ? "Solana" : "Arbitrum"}
            </div>
            <div style={{ fontSize: 11, color: "#b0adc4", marginTop: 2 }}>{tokenConfig.name}</div>
            {isSolana && session.solanaSignature && (
              <a
                href={`https://solscan.io/tx/${session.solanaSignature}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 11, color: "#6B5DD3", opacity: 0.7, marginTop: 8, display: "block" }}
              >
                View on Solscan ↗
              </a>
            )}
          </div>
        )}

        {/* ── Bridge succeeded but LiFi swap failed — USDC is safe ── */}
        {isJupiterFailed && (
          <div style={{
            borderRadius: 16,
            border: "1.5px solid rgba(245,158,11,0.35)",
            background: "rgba(245,158,11,0.06)",
            padding: "16px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 18 }}>⚠️</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#92400e" }}>
                Your USDC is safe
              </span>
            </div>

            {usdcInWallet && (
              <div style={{
                borderRadius: 10,
                background: "rgba(245,158,11,0.1)",
                border: "1px solid rgba(245,158,11,0.2)",
                padding: "10px 14px",
                marginBottom: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}>
                <span style={{ fontSize: 12, color: "#78350f" }}>USDC in your Solana wallet</span>
                <span style={{ fontSize: 15, fontWeight: 600, color: "#92400e", fontVariantNumeric: "tabular-nums" }}>
                  ${usdcInWallet}
                </span>
              </div>
            )}

            <p style={{ fontSize: 12, color: "#78350f", margin: "0 0 10px" }}>
              The bridge completed successfully. The LiFi swap failed — your USDC is waiting in your Solana wallet.
            </p>

            <a
              href={`https://app.li.fi/swap?fromChain=SOL&fromToken=USDC&toChain=SOL&toToken=${tokenConfig.symbol}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: "9px 14px",
                borderRadius: 10,
                border: "1.5px solid rgba(107,93,211,0.35)",
                background: "rgba(107,93,211,0.08)",
                color: "#6B5DD3",
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Swap on LiFi ↗
            </a>

            {errorMessage && (
              <details style={{ marginTop: 10 }}>
                <summary style={{ fontSize: 11, color: "#b0adc4", cursor: "pointer" }}>
                  Technical details
                </summary>
                <p style={{ fontSize: 11, color: "#b0adc4", marginTop: 6, whiteSpace: "pre-wrap" }}>
                  {errorMessage}
                </p>
              </details>
            )}
          </div>
        )}

        {/* ── Generic error state ── */}
        {isFailed && errorMessage && (
          <div style={{
            borderRadius: 12,
            background: "rgba(239,68,68,0.05)",
            border: "1.5px solid rgba(239,68,68,0.2)",
            padding: "12px 14px",
          }}>
            <p style={{ fontSize: 12, color: "#dc2626", margin: 0 }}>{errorMessage}</p>
          </div>
        )}

        {canDismiss && (
          <div className="flex gap-3">
            <Button variant="secondary" size="md" onClick={onClose} className="flex-1">
              Close
            </Button>
            {isDone && (
              <Button variant="primary" size="md" onClick={onReset} className="flex-1">
                New Swap
              </Button>
            )}
            {(isFailed || isJupiterFailed) && (
              <Button variant="primary" size="md" onClick={onReset} className="flex-1">
                Try Again
              </Button>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
