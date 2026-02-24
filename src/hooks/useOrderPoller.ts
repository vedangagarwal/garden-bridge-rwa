import { useGarden } from "@gardenfi/react-hooks";
import type { OrderWithStatus } from "@gardenfi/core";

const POLL_INTERVAL = 5000;
const MAX_WAIT = 60 * 60 * 1000; // 1 hour

type PollerCallbacks = {
  onConfirming?: (current: number, required: number) => void;
  onBridging?: () => void;
};

export function useOrderPoller() {
  const { orderBook } = useGarden();

  async function pollUntilBridgeComplete(
    orderId: string,
    callbacks: PollerCallbacks = {}
  ): Promise<OrderWithStatus> {
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      async function poll() {
        if (Date.now() - startTime > MAX_WAIT) {
          reject(new Error("Swap timed out after 1 hour"));
          return;
        }

        try {
          if (!orderBook) {
            setTimeout(poll, POLL_INTERVAL);
            return;
          }

          const result = await orderBook.getOrder(orderId);
          if (!result || result.error) {
            setTimeout(poll, POLL_INTERVAL);
            return;
          }

          const order = result.val!;
          const src = order.source_swap;
          const dst = order.destination_swap;

          if (dst.redeem_tx_hash) {
            resolve(order);
            return;
          }

          if (src.refund_tx_hash) {
            reject(new Error("Order expired and was refunded."));
            return;
          }

          if (src.initiate_tx_hash) {
            if (src.current_confirmations >= src.required_confirmations) {
              callbacks.onBridging?.();
            } else {
              callbacks.onConfirming?.(
                src.current_confirmations,
                src.required_confirmations
              );
            }
          }
        } catch {
          // ignore transient errors, keep polling
        }

        setTimeout(poll, POLL_INTERVAL);
      }

      poll();
    });
  }

  return { pollUntilBridgeComplete };
}
