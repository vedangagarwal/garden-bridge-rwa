import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { VersionedTransaction } from "@solana/web3.js";
import { fetchJupiterQuote, fetchJupiterSwapTransaction } from "@/lib/dex/jupiter";
import { TSLAX_MINT, TSLAX_DECIMALS, USDG_MINT, USDG_DECIMALS } from "@/lib/solana/config";
import type { OutputTokenKey } from "@/config/tokens";

function getMintAndDecimals(outputTokenKey: OutputTokenKey): { mint: string; decimals: number } {
  if (outputTokenKey === "USDG") return { mint: USDG_MINT, decimals: USDG_DECIMALS };
  return { mint: TSLAX_MINT, decimals: TSLAX_DECIMALS };
}

/**
 * Poll getSignatureStatus until confirmed/finalized or the blockhash expires.
 * This avoids the hardcoded 30-second timeout of the legacy confirmTransaction(sig, commitment) API.
 */
async function waitForConfirmation(
  connection: import("@solana/web3.js").Connection,
  signature: string,
  blockhash: string,
  lastValidBlockHeight: number
): Promise<void> {
  while (true) {
    // Check if the blockhash has expired (transaction can no longer land)
    const currentHeight = await connection.getBlockHeight("confirmed");
    if (currentHeight > lastValidBlockHeight) {
      // One last check — maybe it landed in the final blocks
      const status = await connection.getSignatureStatus(signature);
      if (
        status?.value?.confirmationStatus === "confirmed" ||
        status?.value?.confirmationStatus === "finalized"
      ) {
        if (status.value.err) {
          throw new Error(`Transaction rejected on-chain: ${JSON.stringify(status.value.err)}`);
        }
        return; // confirmed!
      }
      throw new Error(
        `Transaction expired (blockhash no longer valid). ` +
        `Check signature ${signature} on Solscan to see if it landed.`
      );
    }

    // Poll signature status
    const status = await connection.getSignatureStatus(signature, {
      searchTransactionHistory: true,
    });

    const confirmationStatus = status?.value?.confirmationStatus;
    if (confirmationStatus === "confirmed" || confirmationStatus === "finalized") {
      if (status?.value?.err) {
        throw new Error(`Transaction rejected on-chain: ${JSON.stringify(status.value.err)}`);
      }
      return; // success!
    }

    // Wait 2 seconds before polling again
    await new Promise((r) => setTimeout(r, 2000));
  }
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

    // Get a fresh blockhash BEFORE sending — used to track expiry for confirmation.
    // We use "finalized" so lastValidBlockHeight is conservative (~150 blocks ≈ 1 min).
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("finalized");

    const signature = await sendTransaction(tx, connection, {
      skipPreflight: false,
      maxRetries: 3,
    });

    // Use polling-based confirmation instead of the legacy 30-second-timeout API
    await waitForConfirmation(connection, signature, blockhash, lastValidBlockHeight);

    return { signature, outputAmount: quote.amountOutHuman };
  }

  return { executeJupiterSwap };
}
