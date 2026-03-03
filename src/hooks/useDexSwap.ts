import { useWalletClient, usePublicClient } from "wagmi";
import { parseUnits } from "viem";
import { getOneInchSwapCalldata } from "@/lib/dex/oneInch";
import { buildUniswapSwapCalldata, UNISWAP_FEE_TIER } from "@/lib/dex/uniswap";
import { useTokenApproval } from "./useTokenApproval";
import { TOKENS, OUTPUT_TOKENS } from "@/config/tokens";
import { CONTRACTS } from "@/config/contracts";
import type { OutputTokenKey } from "@/config/tokens";

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
    outputTokenKey?: OutputTokenKey;
    onApproving: () => void;
    onSwapping: () => void;
    onComplete: (txHash: `0x${string}`, outputAmount: string) => void;
  }): Promise<void> {
    if (!walletClient || !publicClient) throw new Error("Wallet not connected");

    const tokenKey = params.outputTokenKey ?? "XAUT";
    const outputTokenConfig = OUTPUT_TOKENS[tokenKey];
    // Only Arbitrum tokens are valid here
    if (outputTokenConfig.network !== "arbitrum") {
      throw new Error("executeDexSwap called with non-Arbitrum token");
    }
    const outputAddress = outputTokenConfig.address as `0x${string}`;
    const outputDecimals = outputTokenConfig.decimals;

    const wbtcBigInt = parseUnits(params.wbtcAmount, 8);

    params.onApproving();

    let txHash: `0x${string}`;
    let outputReceived = "0";

    try {
      // Try 1inch first
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
        outputAddress,
      });

      txHash = await walletClient.sendTransaction({
        to: swapData.tx.to,
        data: swapData.tx.data,
        value: BigInt(swapData.tx.value ?? 0),
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      outputReceived = parseOutputFromLogs(receipt.logs, params.userAddress, outputAddress, outputDecimals);
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
        tokenOut: outputAddress,
      });

      txHash = await walletClient.sendTransaction({
        to: CONTRACTS.UNISWAP_SWAP_ROUTER_02,
        data: calldata,
        value: BigInt(0),
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      outputReceived = parseOutputFromLogs(receipt.logs, params.userAddress, outputAddress, outputDecimals);
    }

    params.onComplete(txHash!, outputReceived);
  }

  return { executeXautSwap };
}

function parseOutputFromLogs(
  logs: readonly { topics: readonly string[]; data: string; address: string }[],
  recipient: string,
  outputAddress: string,
  decimals: number
): string {
  const targetAddress = outputAddress.toLowerCase();
  const recipientPadded = recipient.toLowerCase().replace("0x", "").padStart(64, "0");

  for (const log of logs) {
    if (
      log.address.toLowerCase() === targetAddress &&
      log.topics[0]?.toLowerCase() === TRANSFER_EVENT_TOPIC &&
      log.topics[2]?.toLowerCase().includes(recipientPadded.slice(-40))
    ) {
      const amount = BigInt(log.data);
      return (Number(amount) / 10 ** decimals).toFixed(Math.min(decimals, 8));
    }
  }
  return "0";
}
