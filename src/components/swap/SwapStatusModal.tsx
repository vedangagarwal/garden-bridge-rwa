"use client";

import { Modal } from "@/components/ui/Modal";
import { StepIndicator } from "@/components/status/StepIndicator";
import { BridgeStatusCard } from "@/components/status/BridgeStatusCard";
import { DexSwapStatusCard } from "@/components/status/DexSwapStatusCard";
import { Button } from "@/components/ui/Button";
import type { SwapSession } from "@/types/swap";

interface Props {
  open: boolean;
  session: SwapSession;
  onClose: () => void;
  onReset: () => void;
}

export function SwapStatusModal({ open, session, onClose, onReset }: Props) {
  const { status, errorMessage, xautReceived } = session;
  const isDone = status === "complete";
  const isFailed = status === "failed" || status === "refunding";
  const canDismiss = isDone || isFailed;

  return (
    <Modal
      open={open}
      onClose={canDismiss ? onClose : undefined}
      title={isDone ? "Swap Complete 🎉" : isFailed ? "Swap Failed" : "Swap in Progress"}
    >
      <div className="p-6 pt-4 space-y-4">
        <StepIndicator status={status} />

        <div className="space-y-3 pt-2">
          <BridgeStatusCard session={session} />
          <DexSwapStatusCard session={session} />
        </div>

        {/* Success state */}
        {isDone && xautReceived && (
          <div className="rounded-2xl bg-gradient-to-br from-[#d4af37]/10 to-transparent border border-[#d4af37]/20 p-5 text-center">
            <div className="text-3xl font-light text-[#d4af37] mb-1" style={{ fontVariantNumeric: "tabular-nums" }}>
              {parseFloat(xautReceived).toFixed(6)}
            </div>
            <div className="text-sm text-white/50">XAUt0 received on Arbitrum</div>
            <div className="text-[11px] text-white/25 mt-1">Tether Gold (troy oz)</div>
          </div>
        )}

        {/* Error state */}
        {isFailed && errorMessage && (
          <div className="rounded-2xl bg-red-500/5 border border-red-500/20 p-4">
            <p className="text-xs text-red-400">{errorMessage}</p>
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
            {isFailed && (
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
