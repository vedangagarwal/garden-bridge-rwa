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
 * Key design decisions:
 * 1. No searchTransactionHistory — public RPC can 403 on that param.
 * 2. Transient RPC errors (403, 429, network blip) are caught per-attempt
 *    and retried — a single RPC hiccup must not kill the whole swap.
 * 3. Only genuine on-chain execution errors or a 3-minute timeout throw.
 */
async function pollForConfirmation(
  connection: import("@solana/web3.js").Connection,
  signature: string
): Promise<void> {
  const POLL_INTERVAL_MS = 2_000;
  const MAX_ATTEMPTS = 90; // 90 × 2 s = 3 minutes
  let consecutiveErrors = 0;
  const MAX_CONSECUTIVE_ERRORS = 10; // give up only after 10 consecutive RPC failures (~20 s)

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      // No searchTransactionHistory — public RPC returns 403 for that option
      const { value } = await connection.getSignatureStatus(signature);
      consecutiveErrors = 0; // reset on success

      if (value !== null) {
        // Transaction found on-chain — check for execution errors
        if (value.err) {
          throw new Error(
            `Jupiter transaction rejected on-chain: ${JSON.stringify(value.err)}`
          );
        }
        if (
          value.confirmationStatus === "confirmed" ||
          value.confirmationStatus === "finalized"
        ) {
          return; // ✓ confirmed
        }
        // "processed" — keep polling until confirmed/finalized
      }
      // null = not visible yet — keep polling
    } catch (rpcErr: unknown) {
      // Distinguish permanent on-chain errors from transient RPC errors
      const msg = rpcErr instanceof Error ? rpcErr.message : String(rpcErr);
      if (msg.startsWith("Jupiter transaction rejected on-chain:")) {
        throw rpcErr; // real on-chain failure — surface immediately
      }
      // Transient error (403, 429, network blip) — log and keep polling
      consecutiveErrors++;
      console.warn(
        `[Jupiter] RPC poll attempt ${attempt + 1} failed (${consecutiveErrors} consecutive): ${msg}`
      );
      if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
        throw new Error(
          `RPC unavailable after ${MAX_CONSECUTIVE_ERRORS} consecutive errors. ` +
          `Last error: ${msg}. ` +
          `Check signature on Solscan: ${signature}`
        );
      }
    }

    // Wait before next attempt (skip on last)
    if (attempt < MAX_ATTEMPTS - 1) {
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    }
  }

  throw new Error(
    `Jupiter swap was not confirmed after 3 minutes. ` +
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

    // skipPreflight:true — Jupiter already simulated this tx; skipping avoids
    // a redundant public-RPC preflight that can itself 403 or add latency.
    const signature = await sendTransaction(tx, connection, {
      skipPreflight: true,
      maxRetries: 3,
    });

    // Poll until confirmed — swallows transient RPC errors, throws only on
    // genuine on-chain rejection or 3-minute timeout.
    await pollForConfirmation(connection, signature);

    return { signature, outputAmount: quote.amountOutHuman };
  }

  return { executeJupiterSwap };
}
