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
  const isActive = ["bridge_complete", "approving", "swapping"].includes(status);
  const isPending = ["idle", "quoting", "awaiting_deposit", "confirming", "bridging"].includes(status);

  const stepLabel = isSolana
    ? `Step 2 — Swap to ${tokenConfig.symbol} on Solana`
    : `Step 2 — Swap to ${tokenConfig.symbol}`;

  return (
    <div className={`rounded-2xl border p-4 transition-all duration-300 ${
      isDone ? "border-emerald-500/20 bg-emerald-500/5" :
      isActive ? "border-[#d4af37]/20 bg-[#d4af37]/5" :
      "border-white/5 bg-white/2 opacity-40"
    }`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-white/40">
          {stepLabel}
        </span>
        {isDone ? (
          <span className="text-xs text-emerald-400 font-medium">✓ Done</span>
        ) : isActive ? (
          <Spinner size="sm" gold />
        ) : null}
      </div>

      {isPending && (
        <p className="text-xs text-white/25">Waiting for bridge to complete…</p>
      )}

      {status === "bridge_complete" && (
        <p className="text-xs text-white/50">
          {isSolana ? "USDC received. Preparing Jupiter swap…" : "WBTC received. Preparing DEX swap…"}
        </p>
      )}

      {status === "approving" && (
        <div>
          <p className="text-xs text-white/60">Approving WBTC for 1inch router…</p>
          <p className="text-[11px] text-white/30 mt-1">Confirm transaction in your wallet</p>
        </div>
      )}

      {status === "swapping" && (
        <div>
          <p className="text-xs text-white/60">
            {isSolana
              ? `Swapping USDC → ${tokenConfig.symbol} on Solana…`
              : `Swapping WBTC → ${tokenConfig.symbol} on Arbitrum…`
            }
          </p>
          <p className="text-[11px] text-white/30 mt-1">Confirm transaction in your wallet</p>
        </div>
      )}

      {isDone && (
        <div className="space-y-2">
          {dexTxHash && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/40">Swap tx:</span>
              <TxHashLink hash={dexTxHash} />
            </div>
          )}
          {isSolana && solanaSignature && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/40">Jupiter tx:</span>
              <a
                href={`https://solscan.io/tx/${solanaSignature}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-purple-400/70 hover:text-purple-400 truncate max-w-[160px]"
              >
                {solanaSignature.slice(0, 8)}…{solanaSignature.slice(-6)}
              </a>
            </div>
          )}
          {xautReceived && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/40">{tokenConfig.symbol} received:</span>
              <span className="text-xs font-mono text-emerald-400">
                {parseFloat(xautReceived).toFixed(6)} {tokenConfig.symbol}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
