import { create } from "zustand";
import { type BtcWalletId, getBtcWallet } from "@/lib/bitcoin/wallets";

interface BitcoinWalletState {
  walletId: BtcWalletId | null;
  address: string | null;
  connecting: boolean;
  error: string | null;
  sendingTxId: string | null;

  connect: (id: BtcWalletId) => Promise<void>;
  disconnect: () => void;
  sendBitcoin: (toAddress: string, satoshis: number) => Promise<string>;
}

export const useBitcoinWalletStore = create<BitcoinWalletState>((set, get) => ({
  walletId: null,
  address: null,
  connecting: false,
  error: null,
  sendingTxId: null,

  async connect(id) {
    set({ connecting: true, error: null });
    try {
      const wallet = getBtcWallet(id);
      const address = await wallet.connect();
      set({ walletId: id, address, connecting: false });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Connection failed";
      set({ connecting: false, error: msg });
    }
  },

  disconnect() {
    set({ walletId: null, address: null, error: null, sendingTxId: null });
  },

  async sendBitcoin(toAddress, satoshis) {
    const { walletId } = get();
    if (!walletId) throw new Error("No Bitcoin wallet connected");
    const wallet = getBtcWallet(walletId);
    set({ sendingTxId: null, error: null });
    const txid = await wallet.sendBitcoin(toAddress, satoshis);
    set({ sendingTxId: txid });
    return txid;
  },
}));
