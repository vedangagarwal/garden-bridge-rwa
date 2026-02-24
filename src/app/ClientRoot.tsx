"use client";

// WalletConnect v2 + Garden SDK access localStorage at module-load time.
// This client component lazy-loads them to prevent SSR crashes on any page.
import dynamic from "next/dynamic";
import type { ReactNode } from "react";

const Providers = dynamic(() => import("./providers").then((m) => m.Providers), {
  ssr: false,
  loading: () => (
    <div style={{ minHeight: "100vh", background: "#0a0a0a" }} />
  ),
});

export function ClientRoot({ children }: { children: ReactNode }) {
  return <Providers>{children}</Providers>;
}
