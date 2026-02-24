import { useGarden } from "@gardenfi/react-hooks";
import { GARDEN_ASSETS } from "@/lib/garden/assets";
import type { InputTokenSymbol } from "@/config/tokens";
import type { QuoteResponse } from "@gardenfi/core";

export function useGardenBridge(inputToken: InputTokenSymbol) {
  const { swap, getQuote } = useGarden();

  const fromAsset = inputToken === "BTC" ? GARDEN_ASSETS.BTC : GARDEN_ASSETS.WBTC;
  const toAsset = GARDEN_ASSETS.WBTC_ARBITRUM;

  async function fetchGardenQuote(amountSats: number): Promise<QuoteResponse[]> {
    if (!getQuote) throw new Error("Garden not initialized");
    const result = await getQuote({ fromAsset, toAsset, amount: amountSats, isExactOut: false });
    if (!result || result.error) throw new Error(result?.error ?? "Quote failed");
    return result.val!;
  }

  async function initiateSwap(params: {
    sendAmount: string;
    receiveAmount: string;
    solverId: string;
    userAddress: `0x${string}`;
    btcRefundAddress?: string;
  }) {
    if (!swap) throw new Error("Garden not initialized");
    const result = await swap({
      fromAsset,
      toAsset,
      sendAmount: params.sendAmount,
      receiveAmount: params.receiveAmount,
      solverId: params.solverId,
      // Use connected BTC wallet address as source/refund address for BTC swaps
      sourceAddress: params.btcRefundAddress ?? params.userAddress,
      destinationAddress: params.userAddress,
    });
    if (!result || result.error) throw new Error(result?.error ?? "Swap initiation failed");
    return result.val!;
  }

  return { fetchGardenQuote, initiateSwap };
}
