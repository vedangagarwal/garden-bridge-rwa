"use client";

import { Spinner } from "@/components/ui/Spinner";
import { TxHashLink } from "./TxHashLink";
import { useSwapStore } from "@/store/swapStore";
import { OUTPUT_TOKENS } from "@/config/tokens";
import type { SwapSession } from "@/types/swap";

interface Props {
  session: SwapSession;
}

export function DexSwapStatusCard({ session }: Props) {
  const { outputToken } = useSwapStore();
  const { status, dexTxHash, xautReceived, solanaSignature } = session;

  const tokenConfig = OUTPUT_TOKENS[outputToken];
  const isSolana = tokenConfig.network === "solana";

  const isDone = status === "complete";
  const isError = status === "bridge_lifi_failed";
  const isActive = ["bridge_complete", "approving", "swapping"].includes(status);
  const isPending = ["idle", "quoting", "awaiting_deposit", "confirming", "bridging"].includes(status);

  const stepLabel = isSolana
    ? `Step 2 — Swap to ${tokenConfig.symbol} on Solana`
    : `Step 2 — Swap to ${tokenConfig.symbol}`;

  const cardStyle: React.CSSProperties = {
    borderRadius: 16,
    border: isDone
      ? "1.5px solid rgba(34,197,94,0.25)"
      : isError
      ? "1.5px solid rgba(239,68,68,0.25)"
      : isActive
      ? "1.5px solid rgba(107,93,211,0.2)"
      : "1.5px solid #e8e4f2",
    background: isDone
      ? "rgba(34,197,94,0.04)"
      : isError
      ? "rgba(239,68,68,0.04)"
      : isActive
      ? "rgba(107,93,211,0.04)"
      : "#fafafa",
    padding: "14px 16px",
    opacity: isPending ? 0.5 : 1,
    transition: "all 0.3s",
  };

  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "#8b88a0" }}>
          {stepLabel}
        </span>
        {isDone ? (
          <span style={{ fontSize: 12, color: "#22c55e", fontWeight: 600 }}>✓ Done</span>
        ) : isError ? (
          <span style={{ fontSize: 12, color: "#ef4444", fontWeight: 600 }}>✗ Failed</span>
        ) : isActive ? (
          <Spinner size="sm" />
        ) : null}
      </div>

      {isPending && (
        <p style={{ fontSize: 12, color: "#b0adc4", margin: 0 }}>Waiting for bridge to complete…</p>
      )}

      {status === "bridge_complete" && (
        <p style={{ fontSize: 12, color: "#4a4568", margin: 0 }}>
          {isSolana ? "USDC received. Preparing LiFi swap…" : "WBTC received. Preparing DEX swap…"}
        </p>
      )}

      {status === "approving" && (
        <div>
          <p style={{ fontSize: 12, color: "#4a4568", margin: "0 0 4px" }}>Approving WBTC for 1inch router…</p>
          <p style={{ fontSize: 11, color: "#8b88a0", margin: 0 }}>Confirm transaction in your wallet</p>
        </div>
      )}

      {status === "swapping" && (
        <div>
          <p style={{ fontSize: 12, color: "#4a4568", margin: "0 0 4px" }}>
            {isSolana
              ? `Swapping USDC → ${tokenConfig.symbol} via LiFi…`
              : `Swapping WBTC → ${tokenConfig.symbol} on Arbitrum…`
            }
          </p>
          <p style={{ fontSize: 11, color: "#8b88a0", margin: 0 }}>Confirm transaction in your wallet</p>
        </div>
      )}

      {isError && (
        <p style={{ fontSize: 12, color: "#dc2626", margin: 0 }}>
          LiFi swap failed — see the panel above to recover your USDC.
        </p>
      )}

      {isDone && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {dexTxHash && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 12, color: "#8b88a0" }}>Swap tx:</span>
              <TxHashLink hash={dexTxHash} />
            </div>
          )}
          {isSolana && solanaSignature && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 12, color: "#8b88a0" }}>LiFi tx:</span>
              <a
                href={`https://solscan.io/tx/${solanaSignature}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 12, fontFamily: "monospace", color: "#6B5DD3", opacity: 0.8 }}
              >
                {solanaSignature.slice(0, 8)}…{solanaSignature.slice(-6)}
              </a>
            </div>
          )}
          {xautReceived && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 12, color: "#8b88a0" }}>{tokenConfig.symbol} received:</span>
              <span style={{ fontSize: 12, fontFamily: "monospace", color: "#22c55e", fontWeight: 600 }}>
                {parseFloat(xautReceived).toFixed(6)} {tokenConfig.symbol}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
