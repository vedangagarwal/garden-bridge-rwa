import { AnchorProvider } from "@coral-xyz/anchor";
import { Connection, PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";
import type { SignerWalletAdapter } from "@solana/wallet-adapter-base";
import { SOLANA_RPC } from "./config";

/**
 * Wraps a @solana/wallet-adapter SignerWalletAdapter into an AnchorProvider
 * so Garden Finance can use it for the Solana path.
 */
export function buildAnchorProvider(adapter: SignerWalletAdapter): AnchorProvider {
  const connection = new Connection(SOLANA_RPC, "confirmed");

  const anchorWallet = {
    publicKey: new PublicKey(adapter.publicKey!.toBytes()),
    signTransaction: async <T extends Transaction | VersionedTransaction>(tx: T): Promise<T> =>
      adapter.signTransaction(tx),
    signAllTransactions: async <T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]> =>
      adapter.signAllTransactions(txs),
  };

  return new AnchorProvider(connection, anchorWallet, { commitment: "confirmed" });
}
