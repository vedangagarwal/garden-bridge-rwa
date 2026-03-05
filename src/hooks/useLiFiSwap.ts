import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { VersionedTransaction } from "@solana/web3.js";
import { fetchLiFiQuote } from "@/lib/dex/lifi";
import { TSLAX_MINT, TSLAX_DECIMALS, USDG_MINT, USDG_DECIMALS } from "@/lib/solana/config";
import type { OutputTokenKey } from "@/config/tokens";

function getMintAndDecimals(outputTokenKey: OutputTokenKey): { mint: string; decimals: number } {
  if (outputTokenKey === "USDG") return { mint: USDG_MINT, decimals: USDG_DECIMALS };
  return { mint: TSLAX_MINT, decimals: TSLAX_DECIMALS };
}

/**
 * Poll getSignatureStatus every 2 s for up to 3 minutes.
 *
 * - No searchTransactionHistory — public RPC returns 403 for that option.
 * - Per-attempt try/catch: transient 403/429/network errors are retried.
 * - Only genuine on-chain execution errors or 10 consecutive RPC failures throw.
 */
async function pollForConfirmation(
  connection: import("@solana/web3.js").Connection,
  signature: string
): Promise<void> {
  const POLL_INTERVAL_MS = 2_000;
  const MAX_ATTEMPTS = 90; // 90 × 2 s = 3 minutes
  let consecutiveErrors = 0;
  const MAX_CONSECUTIVE_ERRORS = 10;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      const { value } = await connection.getSignatureStatus(signature);
      consecutiveErrors = 0;

      if (value !== null) {
        if (value.err) {
          throw new Error(
            `LiFi transaction rejected on-chain: ${JSON.stringify(value.err)}`
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
      // null = not yet visible — keep polling
    } catch (rpcErr: unknown) {
      const msg = rpcErr instanceof Error ? rpcErr.message : String(rpcErr);
      if (msg.startsWith("LiFi transaction rejected on-chain:")) {
        throw rpcErr; // real on-chain failure — surface immediately
      }
      consecutiveErrors++;
      console.warn(
        `[LiFi] RPC poll attempt ${attempt + 1} failed (${consecutiveErrors} consecutive): ${msg}`
      );
      if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
        throw new Error(
          `RPC unavailable after ${MAX_CONSECUTIVE_ERRORS} consecutive errors. ` +
          `Last error: ${msg}. ` +
          `Check signature on Solscan: ${signature}`
        );
      }
    }

    if (attempt < MAX_ATTEMPTS - 1) {
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    }
  }

  throw new Error(
    `LiFi swap was not confirmed after 3 minutes. ` +
    `Check signature on Solscan: ${signature}`
  );
}

export function useLiFiSwap() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  async function executeLiFiSwap(
    usdcAmountRaw: bigint,
    outputTokenKey: OutputTokenKey = "TSLAX"
  ): Promise<{ signature: string; outputAmount: string }> {
    if (!publicKey) throw new Error("Solana wallet not connected");

    const { mint, decimals } = getMintAndDecimals(outputTokenKey);

    // LiFi returns the full quote + serialized transaction in one call
    const { rawQuote, amountOutHuman } = await fetchLiFiQuote(
      usdcAmountRaw,
      mint,
      decimals,
      publicKey.toString()
    );

    const txData = (rawQuote as { transactionRequest: { data: string } })
      .transactionRequest.data;

    // Decode base64 → VersionedTransaction (no Buffer polyfill needed).
    // IIFE keeps `tx` as a const so TypeScript never worries about definite assignment.
    const tx = (() => {
      try {
        const binaryStr = atob(txData);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }
        return VersionedTransaction.deserialize(bytes);
      } catch (decodeErr: unknown) {
        throw new Error(
          `Failed to decode LiFi transaction: ${decodeErr instanceof Error ? decodeErr.message : String(decodeErr)}`
        );
      }
    })();

    // skipPreflight: LiFi already simulates the tx; avoids redundant public-RPC
    // preflight that can 403 or add latency.
    const signature = await sendTransaction(tx, connection, {
      skipPreflight: true,
      maxRetries: 3,
    });

    await pollForConfirmation(connection, signature);

    return { signature, outputAmount: amountOutHuman };
  }

  return { executeLiFiSwap };
}
