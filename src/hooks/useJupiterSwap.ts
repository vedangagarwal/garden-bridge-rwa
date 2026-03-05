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
 * Poll getSignatureStatus every 2 s for up to 3 minutes.
 *
 * Why not use connection.confirmTransaction(sig, commitment)?
 * That API has a hardcoded 30-second timeout and throws
 * "Transaction was not confirmed in 30.00 seconds" even when the
 * transaction has simply not yet propagated — causing false failures.
 */
async function pollForConfirmation(
  connection: import("@solana/web3.js").Connection,
  signature: string
): Promise<void> {
  const POLL_INTERVAL_MS = 2_000;
  const MAX_ATTEMPTS = 90; // 90 × 2 s = 3 minutes

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const { value } = await connection.getSignatureStatus(signature, {
      searchTransactionHistory: true,
    });

    if (value !== null) {
      // Transaction found — check for on-chain errors
      if (value.err) {
        throw new Error(
          `Jupiter transaction rejected on-chain: ${JSON.stringify(value.err)}`
        );
      }
      // Accepted statuses
      if (
        value.confirmationStatus === "confirmed" ||
        value.confirmationStatus === "finalized"
      ) {
        return; // ✓ success
      }
    }

    // Not yet confirmed — wait before next poll (skip wait on last attempt)
    if (attempt < MAX_ATTEMPTS - 1) {
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    }
  }

  throw new Error(
    `Jupiter swap transaction was not confirmed after 3 minutes.\n` +
      `Check signature on Solscan: ${signature}`
  );
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

    // Decode base64 → Uint8Array (no Buffer polyfill needed)
    const binaryStr = atob(swapTxBase64);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }

    const tx = VersionedTransaction.deserialize(bytes);

    // Send with automatic retry on transient RPC drops
    const signature = await sendTransaction(tx, connection, {
      skipPreflight: false,
      maxRetries: 3,
    });

    // Poll until confirmed (up to 3 min) — avoids the 30-second timeout of the legacy API
    await pollForConfirmation(connection, signature);

    return { signature, outputAmount: quote.amountOutHuman };
  }

  return { executeJupiterSwap };
}
