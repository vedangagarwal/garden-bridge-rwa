import { useCallback, useState } from "react";
import { useGarden } from "@gardenfi/react-hooks";
import { GARDEN_ASSETS } from "@/lib/garden/assets";
import { getOneInchQuote } from "@/lib/dex/oneInch";
import type { CombinedQuote } from "@/types/swap";
import type { InputTokenSymbol } from "@/config/tokens";

/** Garden Finance minimum swap: 0.0001 BTC / WBTC (10,000 sats ≈ $10) */
const MIN_AMOUNT_BTC = 0.0001;

export function useSwapQuote() {
  const { getQuote } = useGarden();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuote = useCallback(
    async (
      inputToken: InputTokenSymbol,
      amount: string
    ): Promise<CombinedQuote | null> => {
      if (!amount || parseFloat(amount) <= 0 || !getQuote) return null;

      if (parseFloat(amount) < MIN_AMOUNT_BTC) {
        setError(`Minimum swap is ${MIN_AMOUNT_BTC} ${inputToken}`);
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const amountSats = Math.round(parseFloat(amount) * 1e8);
        const fromAsset = inputToken === "BTC" ? GARDEN_ASSETS.BTC : GARDEN_ASSETS.WBTC;

        const gardenResult = await getQuote({
          fromAsset,
          toAsset: GARDEN_ASSETS.WBTC_ARBITRUM,
          amount: amountSats,
          isExactOut: false,
        });

        if (!gardenResult || gardenResult.error) {
          throw new Error(gardenResult?.error ?? "Garden quote failed");
        }

        const best = gardenResult.val![0];
        const wbtcAmount = best.destination.amount; // in WBTC smallest unit (8 decimals / satoshis)

        const dexResult = await getOneInchQuote(wbtcAmount).catch(async () => {
          // Fallback: estimate using rough BTC/gold price ratio
          const wbtcFloat = parseFloat(wbtcAmount) / 1e8;
          // 1 BTC ≈ ~30 troy oz gold (rough estimate for fallback only)
          return {
            toAmount: Math.floor(wbtcFloat * 30 * 1e6).toString(),
            estimatedGas: 200000,
            priceImpact: "0",
          };
        });

        const xautFloat = parseFloat(dexResult.toAmount) / 1e6;
        const btcFloat = parseFloat(amount);

        return {
          gardenReceiveAmount: wbtcAmount,
          xautAmount: dexResult.toAmount,
          gardenFee: best.fee,
          dexFee: "0.875",
          estimatedTimeSeconds: best.estimated_time + 30,
          solverId: best.solver_id,
          pricePerBtc: btcFloat > 0 ? (xautFloat / btcFloat).toFixed(6) : "0",
          priceImpact: dexResult.priceImpact,
        };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Quote failed";
        setError(msg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [getQuote]
  );

  return { fetchQuote, isLoading, error };
}
