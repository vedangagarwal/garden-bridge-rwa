import { useCallback, useState } from "react";
import { useGarden } from "@gardenfi/react-hooks";
import { GARDEN_ASSETS } from "@/lib/garden/assets";
import { getOneInchQuote } from "@/lib/dex/oneInch";
import { fetchLiFiQuote } from "@/lib/dex/lifi";
import { OUTPUT_TOKENS } from "@/config/tokens";
import { TSLAX_MINT, TSLAX_DECIMALS, USDG_MINT, USDG_DECIMALS } from "@/lib/solana/config";
import type { CombinedQuote } from "@/types/swap";
import type { InputTokenSymbol, OutputTokenKey } from "@/config/tokens";

/** Garden Finance minimum swap: 0.0001 BTC / WBTC (10,000 sats ≈ $10) */
const MIN_AMOUNT_BTC = 0.0001;

/** Solana output tokens — preview AND actual swap both use LiFi */
const SOLANA_TOKENS = new Set<OutputTokenKey>(["TSLAX", "USDG"]);

/**
 * Throwaway address used when fetching a LiFi preview quote.
 * LiFi needs fromAddress to build the tx, but for display purposes any
 * valid base58 Solana address is fine. The real address is used when
 * executeLiFiSwap() is called during the actual swap.
 */
const LIFI_QUOTE_DUMMY_ADDRESS = "11111111111111111111111111111111";

function getSolanaMintAndDecimals(outputToken: OutputTokenKey): { mint: string; decimals: number } {
  if (outputToken === "USDG") return { mint: USDG_MINT, decimals: USDG_DECIMALS };
  return { mint: TSLAX_MINT, decimals: TSLAX_DECIMALS };
}

export function useSwapQuote() {
  const { getQuote } = useGarden();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuote = useCallback(
    async (
      inputToken: InputTokenSymbol,
      amount: string,
      outputToken: OutputTokenKey = "XAUT"
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
        const fromAsset =
          inputToken === "BTC" ? GARDEN_ASSETS.BTC : GARDEN_ASSETS.WBTC;
        const isSolana = SOLANA_TOKENS.has(outputToken);
        const toAsset = isSolana
          ? GARDEN_ASSETS.SOLANA_USDC
          : GARDEN_ASSETS.WBTC_ARBITRUM;

        const gardenResult = await getQuote({
          fromAsset,
          toAsset,
          amount: amountSats,
          isExactOut: false,
          options: { affiliateFee: 30 },
        });

        if (!gardenResult || gardenResult.error) {
          throw new Error(gardenResult?.error ?? "Garden quote failed");
        }

        const best = gardenResult.val![0];
        // intermediateAmount: WBTC in satoshis (Arbitrum path) OR USDC in raw units (Solana path)
        const intermediateAmount = best.destination.amount;

        let xautAmount: string;
        let pricePerBtc: string;
        let priceImpact = "0";
        let dexQuote: unknown = undefined;

        if (isSolana) {
          // LiFi used for preview quote — same API as the real swap
          const { mint, decimals } = getSolanaMintAndDecimals(outputToken);
          const usdcBigInt = BigInt(Math.round(parseFloat(intermediateAmount)));
          const lifiResult = await fetchLiFiQuote(
            usdcBigInt,
            mint,
            decimals,
            LIFI_QUOTE_DUMMY_ADDRESS
          );
          // rawQuote.estimate.toAmount is the raw output in smallest token units
          xautAmount = lifiResult.rawQuote.estimate?.toAmount ?? "0";
          dexQuote = lifiResult.rawQuote;
          priceImpact = "0"; // LiFi doesn't expose a price-impact % directly
          const outFloat = parseFloat(lifiResult.amountOutHuman);
          const btcFloat = parseFloat(amount);
          pricePerBtc = btcFloat > 0 ? (outFloat / btcFloat).toFixed(6) : "0";
        } else {
          // 1inch: WBTC → XAUt0 or PAXG
          const outputConfig = OUTPUT_TOKENS[outputToken as "XAUT" | "PAXG"];
          const outputAddress = outputConfig.address;
          const outputDecimals = outputConfig.decimals;

          const dexResult = await getOneInchQuote(
            intermediateAmount,
            outputAddress
          ).catch(() => {
            const wbtcFloat = parseFloat(intermediateAmount) / 1e8;
            return {
              toAmount: Math.floor(
                wbtcFloat * 30 * 10 ** outputDecimals
              ).toString(),
              estimatedGas: 200000,
              priceImpact: "0",
            };
          });

          xautAmount = dexResult.toAmount;
          priceImpact = dexResult.priceImpact;
          const outFloat = parseFloat(dexResult.toAmount) / 10 ** outputDecimals;
          const btcFloat = parseFloat(amount);
          pricePerBtc = btcFloat > 0 ? (outFloat / btcFloat).toFixed(6) : "0";
        }

        return {
          gardenReceiveAmount: intermediateAmount,
          xautAmount,
          gardenFee: best.fee,
          dexFee: isSolana ? "0.35" : "0.875",  // LiFi typical fee ~0.35% on Solana
          estimatedTimeSeconds: best.estimated_time + 30,
          solverId: best.solver_id,
          pricePerBtc,
          priceImpact,
          outputToken,
          dexQuote,
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
