import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { VersionedTransaction } from "@solana/web3.js";
import { fetchJupiterQuote, fetchJupiterSwapTransaction } from "@/lib/dex/jupiter";
import { TSLAX_MINT, TSLAX_DECIMALS } from "@/lib/solana/config";

export function useJupiterSwap() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  async function executeJupiterSwap(
    usdcAmountRaw: bigint
  ): Promise<{ signature: string; outputAmount: string }> {
    if (!publicKey) throw new Error("Solana wallet not connected");

    const quote = await fetchJupiterQuote(usdcAmountRaw, TSLAX_MINT, TSLAX_DECIMALS);

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
