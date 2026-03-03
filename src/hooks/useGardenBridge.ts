import { useGarden } from "@gardenfi/react-hooks";
import { useWallet } from "@solana/wallet-adapter-react";
import { GARDEN_ASSETS } from "@/lib/garden/assets";
import type { InputTokenSymbol, OutputTokenKey } from "@/config/tokens";
import type { QuoteResponse } from "@gardenfi/core";

export function useGardenBridge(inputToken: InputTokenSymbol, outputToken: OutputTokenKey = "XAUT") {
  const { swap, getQuote } = useGarden();
  const { publicKey } = useWallet();

  const fromAsset = inputToken === "BTC" ? GARDEN_ASSETS.BTC : GARDEN_ASSETS.WBTC;
  const isSolana = outputToken === "TSLAX";
  const toAsset = isSolana ? GARDEN_ASSETS.SOLANA_USDC : GARDEN_ASSETS.WBTC_ARBITRUM;

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
    // For Solana path, destination is the Solana wallet public key (base58)
    const destinationAddress = isSolana
      ? (publicKey?.toString() ?? params.userAddress)
      : params.userAddress;
    const result = await swap({
      fromAsset,
      toAsset,
      sendAmount: params.sendAmount,
      receiveAmount: params.receiveAmount,
      solverId: params.solverId,
      sourceAddress: params.btcRefundAddress ?? params.userAddress,
      destinationAddress,
    });
    if (!result || result.error) throw new Error(result?.error ?? "Swap initiation failed");
    return result.val!;
  }

  return { fetchGardenQuote, initiateSwap };
}
