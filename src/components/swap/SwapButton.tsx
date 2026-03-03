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
  awaiting_deposit: "Waiting for deposit…",
  confirming: "Confirming on Bitcoin…",
  bridging: "Bridging to Arbitrum…",
  bridge_complete: "Bridge complete…",
  approving: "Approving USDC…",
  swapping: "Swapping to XAUt0…",
};

export function SwapButton({ onSwap, loading }: Props) {
  const { isConnected } = useAccount();
  const { inputAmount, quote, session } = useSwapStore();
  const { status } = session;

  const isActive = status !== "idle" && status !== "complete" && status !== "failed";
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
