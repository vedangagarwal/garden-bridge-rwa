import { useAccount } from "wagmi";
import { useSwapStore } from "@/store/swapStore";
import { useHistoryStore } from "@/store/historyStore";
import { useGardenBridge } from "./useGardenBridge";
import { useOrderPoller } from "./useOrderPoller";
import { useDexSwap } from "./useDexSwap";
import { useLiFiSwap } from "./useLiFiSwap";
import { useBitcoinWalletStore } from "@/store/bitcoinWalletStore";
import type { InputTokenSymbol } from "@/config/tokens";

export function useSwapOrchestrator() {
  const { address } = useAccount();
  const {
    session,
    inputToken,
    outputToken,
    slippage,
    quote,
    setSession,
    setStatus,
    resetSwap,
  } = useSwapStore();
  const btcAddress = useBitcoinWalletStore((s) => s.address);
  const { addRecord } = useHistoryStore();

  const { initiateSwap } = useGardenBridge(inputToken as InputTokenSymbol, outputToken);
  const { pollUntilBridgeComplete } = useOrderPoller();
  const { executeXautSwap } = useDexSwap();
  const { executeLiFiSwap } = useLiFiSwap();

  const isSolana = outputToken === "TSLAX" || outputToken === "USDG";

  async function startSwap() {
    if (!address || !quote) return;

    // BTC wallet is always required (Garden needs a valid BTC refund address)
    if (!btcAddress) {
      throw new Error("Please connect your Bitcoin wallet before swapping.");
    }

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

      // Race the Garden SDK call against a 30-second timeout so the UI
      // never hangs indefinitely if the API is slow or unresponsive.
      const swapResult = await Promise.race([
        initiateSwap({
          sendAmount: amountSats.toString(),
          receiveAmount: quote.gardenReceiveAmount,
          solverId: quote.solverId,
          userAddress: address,
          btcRefundAddress: btcAddress ?? undefined,
        }),
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error("Swap initiation timed out — please try again.")),
            30_000
          )
        ),
      ]);

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

      const filledAmount = completedOrder.destination_swap.filled_amount;

      setSession({
        status: "bridge_complete",
        gardenReceiveAmount: filledAmount,
        bridgeTxHash: completedOrder.destination_swap.redeem_tx_hash,
      });

      if (isSolana) {
        // Solana path: Solana USDC → TSLAx / USDG via LiFi
        setStatus("swapping");

        // Safe integer parsing — strip any decimal point Garden may include
        const rawStr = filledAmount.toString().split(".")[0];
        const usdcRaw = BigInt(rawStr);
        // Human-readable USDC amount (6 decimals) for user-facing messages
        const usdcHuman = (Number(rawStr) / 1e6).toFixed(2);

        try {
          const { signature, outputAmount } = await executeLiFiSwap(usdcRaw, outputToken);
          setSession({ status: "complete", solanaSignature: signature, xautReceived: outputAmount });
          const s = useSwapStore.getState().session;
          addRecord({
            id: s.gardenOrderId ?? `swap-${Date.now()}`,
            createdAt: s.createdAt ?? Date.now(),
            inputToken: inputToken as InputTokenSymbol,
            inputAmountSats: amountSats,
            wbtcReceived: s.gardenReceiveAmount,
            xautReceived: outputAmount,
            btcSentTxId: s.btcSentTxId,
            bridgeTxHash: s.bridgeTxHash,
            dexTxHash: null,
            gardenOrderId: s.gardenOrderId,
            status: "complete",
            errorMessage: null,
          });
        } catch (lifiErr: unknown) {
          // Bridge succeeded but LiFi swap failed.
          // The user's USDC is safely in their Solana wallet — inform them clearly.
          const lifiMsg = lifiErr instanceof Error ? lifiErr.message : "LiFi swap failed";
          const errMsg =
            `Bridge succeeded ✓ — ${usdcHuman} USDC is safe in your Solana wallet.\n` +
            `LiFi swap failed: ${lifiMsg}\n` +
            `Swap manually at app.li.fi using your Solana wallet.`;

          setSession({
            status: "bridge_lifi_failed",
            usdcInWallet: usdcHuman,
            errorMessage: errMsg,
          });

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
            status: "failed",
            errorMessage: `Bridge OK — ${usdcHuman} USDC in Solana wallet. LiFi failed: ${lifiMsg}`,
          });
        }
      } else {
        // Arbitrum path: WBTC → XAUt0 or PAXG via 1inch/Uniswap
        const wbtcHuman = (parseFloat(filledAmount) / 1e8).toFixed(8);
        setSession({ gardenReceiveAmount: wbtcHuman });

        await executeXautSwap({
          wbtcAmount: wbtcHuman,
          userAddress: address,
          slippage,
          outputTokenKey: outputToken,
          onApproving: () => setStatus("approving"),
          onSwapping: () => setStatus("swapping"),
          onComplete: (txHash, xautAmount) => {
            setSession({ status: "complete", dexTxHash: txHash, xautReceived: xautAmount });
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
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Swap failed";
      const finalStatus = msg.includes("refund") ? "refunding" : "failed";
      setSession({ status: finalStatus, errorMessage: msg });
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
