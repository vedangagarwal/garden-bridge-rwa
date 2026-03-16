import { useWalletClient, usePublicClient } from "wagmi";
import { parseUnits } from "viem";
import { fetchLiFiEvmQuote } from "@/lib/dex/lifi";
import { useTokenApproval } from "./useTokenApproval";
import { TOKENS, OUTPUT_TOKENS } from "@/config/tokens";
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
    if (outputTokenConfig.network !== "arbitrum") {
      throw new Error("executeDexSwap called with non-Arbitrum token");
    }
    const outputAddress = outputTokenConfig.address as `0x${string}`;
    const outputDecimals = outputTokenConfig.decimals;

    const wbtcBigInt = parseUnits(params.wbtcAmount, 8);
    const lifiSlippage = (params.slippage / 100).toFixed(4);

    params.onApproving();

    // Get LiFi EVM quote: WBTC → output token on Arbitrum
    const { rawQuote, amountOutHuman } = await fetchLiFiEvmQuote(
      wbtcBigInt,
      outputAddress,
      outputDecimals,
      params.userAddress,
      lifiSlippage
    );

    const txReq = rawQuote.transactionRequest!;

    // Approve WBTC to LiFi's router contract
    await ensureApproval(
      TOKENS.WBTC.address,
      txReq.to as `0x${string}`,
      wbtcBigInt,
      params.userAddress
    );

    params.onSwapping();

    const txHash = await walletClient.sendTransaction({
      to: txReq.to as `0x${string}`,
      data: txReq.data as `0x${string}`,
      value: BigInt(txReq.value ?? "0"),
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
    const outputReceived = parseOutputFromLogs(
      receipt.logs,
      params.userAddress,
      outputAddress,
      outputDecimals
    );

    params.onComplete(txHash, outputReceived || amountOutHuman);
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
