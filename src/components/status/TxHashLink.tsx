"use client";

import { ARBISCAN_BASE } from "@/config/chains";

interface TxHashLinkProps {
  hash: string;
  label?: string;
  isBitcoin?: boolean;
}

export function TxHashLink({ hash, label, isBitcoin = false }: TxHashLinkProps) {
  const href = isBitcoin
    ? `https://mempool.space/tx/${hash}`
    : `${ARBISCAN_BASE}/tx/${hash}`;

  const short = `${hash.slice(0, 6)}…${hash.slice(-4)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-xs text-[#d4af37] hover:text-[#f5c518] transition-colors font-mono"
    >
      <span>{label ?? short}</span>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path d="M1.5 8.5L8.5 1.5M8.5 1.5H3.5M8.5 1.5V6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  );
}
