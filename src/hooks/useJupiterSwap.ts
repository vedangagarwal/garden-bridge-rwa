import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { VersionedTransaction } from "@solana/web3.js";
import { fetchJupiterQuote, fetchJupiterSwapTransaction } from "@/lib/dex/jupiter";
import { TSLAX_MINT, TSLAX_DECIMALS, USDG_MINT, USDG_DECIMALS } from "@/lib/solana/config";
import type { OutputTokenKey } from "@/config/tokens";

function getMintAndDecimals(outputTokenKey: OutputTokenKey): { mint: string; decimals: number } {
  if (outputTokenKey === "USDG") return { mint: USDG_MINT, decimals: USDG_DECIMALS };
  return { mint: TSLAX_MINT, decimals: TSLAX_DECIMALS };
}

export function useJupiterSwap() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  async function executeJupiterSwap(
    usdcAmountRaw: bigint,
    outputTokenKey: OutputTokenKey = "TSLAX"
  ): Promise<{ signature: string; outputAmount: string }> {
    if (!publicKey) throw new Error("Solana wallet not connected");

    const { mint, decimals } = getMintAndDecimals(outputTokenKey);
    const quote = await fetchJupiterQuote(usdcAmountRaw, mint, decimals);

    const swapTxBase64 = await fetchJupiterSwapTransaction(
      quote.rawQuote,
      publicKey.toString()
    );

    // Decode base64 to Uint8Array without relying on Buffer polyfill
    const binaryStr = atob(swapTxBase64);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }

    const tx = VersionedTransaction.deserialize(bytes);
    const signature = await sendTransaction(tx, connection);
    await connection.confirmTransaction(signature, "confirmed");

    return { signature, outputAmount: quote.amountOutHuman };
  }

  return { executeJupiterSwap };
}
