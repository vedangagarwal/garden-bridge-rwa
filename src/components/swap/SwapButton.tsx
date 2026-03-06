"use client";

import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/Button";
import { useSwapStore } from "@/store/swapStore";

interface Props {
  onSwap: () => void;
  loading?: boolean;
}

const LOADING_LABELS: Record<string, string> = {
  quoting: "Fetching quote…",
  initiating: "Creating order…",
  awaiting_deposit: "Waiting for deposit…",
  confirming: "Confirming on Bitcoin…",
  bridging: "Bridging…",
  bridge_complete: "Bridge complete…",
  approving: "Approving…",
  swapping: "Swapping…",
};

const TERMINAL_STATUSES = new Set(["idle", "complete", "failed", "bridge_lifi_failed"]);

export function SwapButton({ onSwap, loading }: Props) {
  const { isConnected } = useAccount();
  const { inputAmount, quote, session } = useSwapStore();
  const { status } = session;

  const isActive = !TERMINAL_STATUSES.has(status);
  const activeLabel = LOADING_LABELS[status];

  if (!isConnected) {
    return (
      <ConnectButton.Custom>
        {({ openConnectModal }) => (
          <Button size="lg" onClick={openConnectModal}>
            Connect Wallet
          </Button>
        )}
      </ConnectButton.Custom>
    );
  }

  const disabled = !inputAmount || !quote || parseFloat(inputAmount) <= 0;

  return (
    <Button
      size="lg"
      onClick={onSwap}
      disabled={disabled}
      loading={loading || isActive}
      className="tracking-wide"
    >
      {isActive && activeLabel
        ? activeLabel
        : !inputAmount || parseFloat(inputAmount) <= 0
        ? "Enter an amount"
        : !quote
        ? "Fetching quote…"
        : "Swap to Real Assets"}
    </Button>
  );
}
