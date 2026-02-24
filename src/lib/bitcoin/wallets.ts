/* eslint-disable @typescript-eslint/no-explicit-any */

export type BtcWalletId = "unisat" | "okx" | "phantom" | "xverse";

export interface BtcWalletAdapter {
  id: BtcWalletId;
  name: string;
  /** SVG / PNG data-URL or external URL */
  icon: string;
  isInstalled(): boolean;
  connect(): Promise<string>;
  sendBitcoin(toAddress: string, satoshis: number): Promise<string>;
  getAddress(): Promise<string>;
  /** Returns confirmed + unconfirmed balance in satoshis */
  getBalance(address: string): Promise<number>;
}

/** Fetch balance from mempool.space — works for any wallet / address type */
async function fetchBalanceFromMempool(address: string): Promise<number> {
  const res = await fetch(`https://mempool.space/api/address/${address}`);
  const data = await res.json();
  const chain = data.chain_stats;
  const mempool = data.mempool_stats;
  return (
    chain.funded_txo_sum - chain.spent_txo_sum +
    mempool.funded_txo_sum - mempool.spent_txo_sum
  );
}

// ─── Unisat ─────────────────────────────────────────────────────────────────

const unisatAdapter: BtcWalletAdapter = {
  id: "unisat",
  name: "Unisat",
  icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23f7931a'/%3E%3Ctext x='50' y='68' text-anchor='middle' font-family='Arial Black,Arial' font-weight='900' font-size='54' fill='white'%3EU%3C/text%3E%3C/svg%3E",

  isInstalled() {
    return typeof window !== "undefined" && !!(window as any).unisat;
  },

  async connect() {
    const unisat = (window as any).unisat;
    const accounts: string[] = await unisat.requestAccounts();
    return accounts[0];
  },

  async getAddress() {
    const unisat = (window as any).unisat;
    const accounts: string[] = await unisat.getAccounts();
    return accounts[0];
  },

  async sendBitcoin(toAddress, satoshis) {
    const unisat = (window as any).unisat;
    const txid: string = await unisat.sendBitcoin(toAddress, satoshis);
    return txid;
  },

  async getBalance(address) {
    try {
      const bal = await (window as any).unisat.getBalance();
      return bal.total as number;
    } catch {
      return fetchBalanceFromMempool(address);
    }
  },
};

// ─── OKX Wallet ─────────────────────────────────────────────────────────────

const okxAdapter: BtcWalletAdapter = {
  id: "okx",
  name: "OKX Wallet",
  icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='18' fill='%23000'/%3E%3Ctext x='50' y='66' text-anchor='middle' font-family='Arial Black,Arial' font-weight='900' font-size='26' fill='white'%3EOKX%3C/text%3E%3C/svg%3E",

  isInstalled() {
    return (
      typeof window !== "undefined" &&
      !!(window as any).okxwallet?.bitcoin
    );
  },

  async connect() {
    const btc = (window as any).okxwallet.bitcoin;
    const result = await btc.connect();
    return result.address as string;
  },

  async getAddress() {
    const btc = (window as any).okxwallet.bitcoin;
    const accounts = await btc.getAccounts();
    return accounts[0] as string;
  },

  async sendBitcoin(toAddress, satoshis) {
    const btc = (window as any).okxwallet.bitcoin;
    const txid: string = await btc.sendBitcoin(toAddress, satoshis);
    return txid;
  },

  async getBalance(address) {
    try {
      const bal = await (window as any).okxwallet.bitcoin.getBalance();
      return (bal.total ?? bal.confirmed) as number;
    } catch {
      return fetchBalanceFromMempool(address);
    }
  },
};

// ─── Phantom (Bitcoin) ───────────────────────────────────────────────────────

const phantomAdapter: BtcWalletAdapter = {
  id: "phantom",
  name: "Phantom",
  icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%234e44ce'/%3E%3Ctext x='50' y='68' text-anchor='middle' font-family='Arial Black,Arial' font-weight='900' font-size='54' fill='white'%3EP%3C/text%3E%3C/svg%3E",

  isInstalled() {
    return (
      typeof window !== "undefined" &&
      !!(window as any).phantom?.bitcoin
    );
  },

  async connect() {
    const btc = (window as any).phantom.bitcoin;
    const accounts = await btc.requestAccounts();
    const nativeSegwit = accounts.find(
      (a: any) => a.addressType === "p2wpkh"
    );
    return (nativeSegwit ?? accounts[0]).address as string;
  },

  async getAddress() {
    const btc = (window as any).phantom.bitcoin;
    const accounts = await btc.requestAccounts();
    const nativeSegwit = accounts.find(
      (a: any) => a.addressType === "p2wpkh"
    );
    return (nativeSegwit ?? accounts[0]).address as string;
  },

  async sendBitcoin(toAddress, satoshis) {
    const btc = (window as any).phantom.bitcoin;
    const txid: string = await btc.sendBitcoin(toAddress, satoshis);
    return txid;
  },

  async getBalance(address) {
    // Phantom Bitcoin doesn't expose getBalance — use mempool.space
    return fetchBalanceFromMempool(address);
  },
};

// ─── Xverse ──────────────────────────────────────────────────────────────────

const xverseAdapter: BtcWalletAdapter = {
  id: "xverse",
  name: "Xverse",
  icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='18' fill='%23181818'/%3E%3Ctext x='50' y='68' text-anchor='middle' font-family='Arial Black,Arial' font-weight='900' font-size='46' fill='%23ee7b30'%3EX%3C/text%3E%3C/svg%3E",

  isInstalled() {
    return (
      typeof window !== "undefined" &&
      !!(window as any).XverseProviders?.BitcoinProvider
    );
  },

  async connect() {
    const { default: Wallet, AddressPurpose } = await import("sats-connect");
    return new Promise((resolve, reject) => {
      Wallet.request("getAccounts", {
        purposes: [AddressPurpose.Payment],
        message: "GardenFi needs your Bitcoin payment address",
      }).then((response: any) => {
        if (response.status === "success") {
          const payment = response.result.find(
            (a: any) => a.purpose === AddressPurpose.Payment
          );
          resolve((payment ?? response.result[0]).address as string);
        } else {
          reject(new Error(response.error?.message ?? "Xverse connection failed"));
        }
      });
    });
  },

  async getAddress() {
    return this.connect();
  },

  async sendBitcoin(toAddress, satoshis) {
    const { default: Wallet } = await import("sats-connect");
    return new Promise((resolve, reject) => {
      Wallet.request("sendTransfer", {
        recipients: [{ address: toAddress, amount: satoshis }],
      }).then((response: any) => {
        if (response.status === "success") {
          resolve(response.result.txid as string);
        } else {
          reject(new Error(response.error?.message ?? "Xverse send failed"));
        }
      });
    });
  },

  async getBalance(address) {
    return fetchBalanceFromMempool(address);
  },
};

// ─── Registry ────────────────────────────────────────────────────────────────

export const BTC_WALLETS: BtcWalletAdapter[] = [
  unisatAdapter,
  okxAdapter,
  phantomAdapter,
  xverseAdapter,
];

export function getBtcWallet(id: BtcWalletId): BtcWalletAdapter {
  const w = BTC_WALLETS.find((w) => w.id === id);
  if (!w) throw new Error(`Unknown BTC wallet: ${id}`);
  return w;
}
