import { useState, useCallback } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { SOLANA_USDC_MINT, SOLANA_USDC_DECIMALS } from "@/lib/solana/config";

export function useSolanaUsdcBalance() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState<string>("0");
  const [isLoading, setIsLoading] = useState(false);

  const fetchBalance = useCallback(async () => {
    if (!publicKey) return;
    setIsLoading(true);
    try {
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        publicKey,
        { mint: new PublicKey(SOLANA_USDC_MINT) }
      );
      if (tokenAccounts.value.length === 0) {
        setBalance("0");
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rawAmount = (tokenAccounts.value[0].account.data as any).parsed
        .info.tokenAmount.amount as string;
      const humanAmount = (
        Number(rawAmount) /
        10 ** SOLANA_USDC_DECIMALS
      ).toFixed(2);
      setBalance(humanAmount);
    } catch {
      setBalance("0");
    } finally {
      setIsLoading(false);
    }
  }, [connection, publicKey]);

  return { balance, isLoading, fetchBalance };
}
