import { useWalletClient, usePublicClient } from "wagmi";
import { parseUnits } from "viem";
import { getOneInchSwapCalldata } from "@/lib/dex/oneInch";
import { buildUniswapSwapCalldata, UNISWAP_FEE_TIER } from "@/lib/dex/uniswap";
import { useTokenApproval } from "./useTokenApproval";
import { TOKENS } from "@/config/tokens";
import { CONTRACTS } from "@/config/contracts";

const TRANSFER_EVENT_TOPIC =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

export function useDexSwap() {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { ensureApproval } = useTokenApproval();

  async function executeXautSwap(params: {
    wbtcAmount: string;
    userAddress: `0x${string}`;
    slippage: number;
    onApproving: () => void;
    onSwapping: () => void;
    onComplete: (txHash: `0x${string}`, xautAmount: string) => void;
  }): Promise<void> {
    if (!walletClient || !publicClient) throw new Error("Wallet not connected");

    const wbtcBigInt = parseUnits(params.wbtcAmount, 8);

    params.onApproving();

    // Try 1inch first, fall back to Uniswap V3
    let txHash: `0x${string}`;
    let xautReceived = "0";

    try {
      await ensureApproval(
        TOKENS.WBTC.address,
        CONTRACTS.ONE_INCH_ROUTER,
        wbtcBigInt,
        params.userAddress
      );

      params.onSwapping();

      const swapData = await getOneInchSwapCalldata({
        wbtcAmount: wbtcBigInt.toString(),
        fromAddress: params.userAddress,
        slippage: params.slippage,
      });

      txHash = await walletClient.sendTransaction({
        to: swapData.tx.to,
        data: swapData.tx.data,
        value: BigInt(swapData.tx.value ?? 0),
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      xautReceived = parseXautFromLogs(receipt.logs, params.userAddress);
    } catch {
      // Fallback to Uniswap V3
      await ensureApproval(
        TOKENS.WBTC.address,
        CONTRACTS.UNISWAP_SWAP_ROUTER_02,
        wbtcBigInt,
        params.userAddress
      );

      params.onSwapping();

      const amountOutMin = (wbtcBigInt * BigInt(Math.floor((1 - params.slippage / 100) * 1000))) / BigInt(1000);
      const calldata = buildUniswapSwapCalldata({
        amountIn: wbtcBigInt,
        amountOutMinimum: amountOutMin,
        recipient: params.userAddress,
      });

      txHash = await walletClient.sendTransaction({
        to: CONTRACTS.UNISWAP_SWAP_ROUTER_02,
        data: calldata,
        value: BigInt(0),
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      xautReceived = parseXautFromLogs(receipt.logs, params.userAddress);
    }

    params.onComplete(txHash!, xautReceived);
  }

  return { executeXautSwap };
}

function parseXautFromLogs(logs: readonly { topics: readonly string[]; data: string; address: string }[], recipient: string): string {
  const xautAddress = TOKENS.XAUT.address.toLowerCase();
  const recipientPadded = recipient.toLowerCase().replace("0x", "").padStart(64, "0");

  for (const log of logs) {
    if (
      log.address.toLowerCase() === xautAddress &&
      log.topics[0]?.toLowerCase() === TRANSFER_EVENT_TOPIC &&
      log.topics[2]?.toLowerCase().includes(recipientPadded.slice(-40))
    ) {
      const amount = BigInt(log.data);
      return (Number(amount) / 1e6).toFixed(6);
    }
  }
  return "0";
}
