import { useWalletClient, usePublicClient } from "wagmi";
import { parseUnits, maxUint256 } from "viem";

const ERC20_ABI = [
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

export function useTokenApproval() {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  async function ensureApproval(
    tokenAddress: `0x${string}`,
    spender: `0x${string}`,
    amount: bigint,
    owner: `0x${string}`
  ): Promise<void> {
    if (!walletClient || !publicClient) throw new Error("Wallet not connected");

    const allowance = (await publicClient.readContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: "allowance",
      args: [owner, spender],
    })) as bigint;

    if (allowance >= amount) return;

    const hash = await walletClient.writeContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [spender, maxUint256],
    });

    await publicClient.waitForTransactionReceipt({ hash });
  }

  return { ensureApproval };
}
