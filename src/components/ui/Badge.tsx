"use client";

import type { SwapStatus } from "@/types/swap";

interface BadgeProps {
  status: SwapStatus;
}

const labels: Record<SwapStatus, string> = {
  idle: "Ready",
  quoting: "Quoting...",
  awaiting_deposit: "Awaiting Deposit",
  confirming: "Confirming",
  bridging: "Bridging",
  bridge_complete: "Bridge Complete",
  approving: "Approving",
  swapping: "Swapping",
  complete: "Complete",
  bridge_lifi_failed: "Bridge OK / Swap Failed",
  failed: "Failed",
  refunding: "Refunding",
};

const styles: Record<SwapStatus, string> = {
  idle: "bg-white/5 text-white/40",
  quoting: "bg-amber-500/10 text-amber-400",
  awaiting_deposit: "bg-blue-500/10 text-blue-400",
  confirming: "bg-yellow-500/10 text-yellow-400",
  bridging: "bg-purple-500/10 text-purple-400",
  bridge_complete: "bg-teal-500/10 text-teal-400",
  approving: "bg-orange-500/10 text-orange-400",
  swapping: "bg-indigo-500/10 text-indigo-400",
  complete: "bg-emerald-500/10 text-emerald-400",
  bridge_lifi_failed: "bg-amber-500/10 text-amber-600",
  failed: "bg-red-500/10 text-red-400",
  refunding: "bg-rose-500/10 text-rose-400",
};

const dots: Record<SwapStatus, boolean> = {
  idle: false, quoting: true, awaiting_deposit: true, confirming: true,
  bridging: true, bridge_complete: false, approving: true, swapping: true,
  complete: false, bridge_lifi_failed: false, failed: false, refunding: true,
};

export function StatusBadge({ status }: BadgeProps) {
  const animate = dots[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide ${styles[status]}`}>
      {animate && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-current" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current" />
        </span>
      )}
      {labels[status]}
    </span>
  );
}
