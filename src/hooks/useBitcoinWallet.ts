"use client";

import { useEffect, useState } from "react";
import { useBitcoinWalletStore } from "@/store/bitcoinWalletStore";
import { getBtcWallet, type BtcWalletId } from "@/lib/bitcoin/wallets";

export function useBitcoinWallet() {
  const store = useBitcoinWalletStore();
  const [btcBalanceSats, setBtcBalanceSats] = useState<number | null>(null);

  // Poll BTC balance every 15s when wallet is connected
  useEffect(() => {
    if (!store.walletId || !store.address) {
      setBtcBalanceSats(null);
      return;
    }
    let cancelled = false;
    const wallet = getBtcWallet(store.walletId);

    async function fetchBalance() {
      try {
        const sats = await wallet.getBalance(store.address!);
        if (!cancelled) setBtcBalanceSats(sats);
      } catch {
        // ignore — balance just stays null
      }
    }

    fetchBalance();
    const interval = setInterval(fetchBalance, 15000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [store.walletId, store.address]);

  function truncateAddress(addr: string) {
    return addr.slice(0, 6) + "..." + addr.slice(-4);
  }

  /** e.g. "0.00423100" */
  const btcBalanceBtc =
    btcBalanceSats !== null ? (btcBalanceSats / 1e8).toFixed(8) : null;

  async function connect(id: BtcWalletId) {
    await store.connect(id);
  }

  async function sendBitcoin(toAddress: string, satoshis: number) {
    return store.sendBitcoin(toAddress, satoshis);
  }

  return {
    walletId: store.walletId,
    address: store.address,
    connecting: store.connecting,
    error: store.error,
    sendingTxId: store.sendingTxId,
    isConnected: !!store.address,
    btcBalanceSats,
    btcBalanceBtc,
    connect,
    disconnect: store.disconnect,
    sendBitcoin,
    truncateAddress,
  };
}
