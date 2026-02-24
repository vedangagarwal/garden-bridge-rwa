import { useAccount } from "wagmi";
import { useSwapStore } from "@/store/swapStore";
import { useHistoryStore } from "@/store/historyStore";
import { useGardenBridge } from "./useGardenBridge";
import { useOrderPoller } from "./useOrderPoller";
import { useDexSwap } from "./useDexSwap";
import { useBitcoinWalletStore } from "@/store/bitcoinWalletStore";
import type { InputTokenSymbol } from "@/config/tokens";

export function useSwapOrchestrator() {
  const { address } = useAccount();
  const {
    session,
    inputToken,
    slippage,
    quote,
    setSession,
    setStatus,
    resetSwap,
  } = useSwapStore();
  const btcAddress = useBitcoinWalletStore((s) => s.address);
  const { addRecord } = useHistoryStore();

  const { initiateSwap } = useGardenBridge(inputToken as InputTokenSymbol);
  const { pollUntilBridgeComplete } = useOrderPoller();
  const { executeXautSwap } = useDexSwap();

  async function startSwap() {
    if (!address || !quote) return;

    const inputAmount = useSwapStore.getState().inputAmount;
    const amountSats = Math.round(parseFloat(inputAmount) * 1e8);

    try {
      setSession({
        status: "awaiting_deposit",
        createdAt: Date.now(),
        errorMessage: null,
        depositAmountSats: amountSats,
        btcSentTxId: null,
      });

      const swapResult = await initiateSwap({
        sendAmount: amountSats.toString(),
        receiveAmount: quote.gardenReceiveAmount,
        solverId: quote.solverId,
        userAddress: address,
        btcRefundAddress: btcAddress ?? undefined,
      });

      // For BTC swaps, result has `to` (deposit address)
      const orderResponse = swapResult as { order_id?: string; to?: string } & { order_id: string };
      const orderId = orderResponse.order_id ?? (typeof swapResult === "string" ? swapResult : "");
      const depositAddress = (swapResult as { to?: string }).to ?? null;

      setSession({
        gardenOrderId: orderId,
        depositAddress,
        status: depositAddress ? "awaiting_deposit" : "bridging",
      });

      const completedOrder = await pollUntilBridgeComplete(orderId, {
        onConfirming: (current, required) => {
          setSession({ status: "confirming", btcConfirmations: current, btcRequiredConfirmations: required });
        },
        onBridging: () => setStatus("bridging"),
      });

      const wbtcAmount = completedOrder.destination_swap.filled_amount;
      const wbtcHuman = (parseFloat(wbtcAmount) / 1e8).toFixed(8);

      setSession({
        status: "bridge_complete",
        gardenReceiveAmount: wbtcHuman,
        bridgeTxHash: completedOrder.destination_swap.redeem_tx_hash,
      });

      await executeXautSwap({
        wbtcAmount: wbtcHuman,
        userAddress: address,
        slippage,
        onApproving: () => setStatus("approving"),
        onSwapping: () => setStatus("swapping"),
        onComplete: (txHash, xautAmount) => {
          setSession({ status: "complete", dexTxHash: txHash, xautReceived: xautAmount });
          // Save to history
          const s = useSwapStore.getState().session;
          addRecord({
            id: s.gardenOrderId ?? `swap-${Date.now()}`,
            createdAt: s.createdAt ?? Date.now(),
            inputToken: inputToken as InputTokenSymbol,
            inputAmountSats: amountSats,
            wbtcReceived: s.gardenReceiveAmount,
            xautReceived: xautAmount,
            btcSentTxId: s.btcSentTxId,
            bridgeTxHash: s.bridgeTxHash,
            dexTxHash: txHash,
            gardenOrderId: s.gardenOrderId,
            status: "complete",
            errorMessage: null,
          });
        },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Swap failed";
      const finalStatus = msg.includes("refund") ? "refunding" : "failed";
      setSession({ status: finalStatus, errorMessage: msg });
      // Save failed/refunding swap to history
      const s = useSwapStore.getState().session;
      addRecord({
        id: s.gardenOrderId ?? `swap-${Date.now()}`,
        createdAt: s.createdAt ?? Date.now(),
        inputToken: inputToken as InputTokenSymbol,
        inputAmountSats: amountSats,
        wbtcReceived: s.gardenReceiveAmount,
        xautReceived: null,
        btcSentTxId: s.btcSentTxId,
        bridgeTxHash: s.bridgeTxHash,
        dexTxHash: null,
        gardenOrderId: s.gardenOrderId,
        status: finalStatus,
        errorMessage: msg,
      });
    }
  }

  return { session, startSwap, resetSwap };
}
