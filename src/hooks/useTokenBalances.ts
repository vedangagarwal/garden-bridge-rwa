import { useAccount, usePublicClient } from "wagmi";
import { useEffect, useState } from "react";
import { TOKENS } from "@/config/tokens";

const ERC20_BALANCE_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export function useTokenBalances() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [wbtcBalance, setWbtcBalance] = useState<bigint>(BigInt(0));
  const [xautBalance, setXautBalance] = useState<bigint>(BigInt(0));

  useEffect(() => {
    if (!address || !publicClient) return;
    let cancelled = false;

    async function fetchBalances() {
      try {
        const [wbtc, xaut] = await Promise.all([
          publicClient!.readContract({
            address: TOKENS.WBTC.address,
            abi: ERC20_BALANCE_ABI,
            functionName: "balanceOf",
            args: [address!],
          }) as Promise<bigint>,
          publicClient!.readContract({
            address: TOKENS.XAUT.address,
            abi: ERC20_BALANCE_ABI,
            functionName: "balanceOf",
            args: [address!],
          }) as Promise<bigint>,
        ]);
        if (!cancelled) {
          setWbtcBalance(wbtc);
          setXautBalance(xaut);
        }
      } catch {
        // ignore
      }
    }

    fetchBalances();
    const interval = setInterval(fetchBalances, 15000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [address, publicClient]);

  return { wbtcBalance, xautBalance };
}
