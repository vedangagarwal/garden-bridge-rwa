import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClientRoot } from "./ClientRoot";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GardenFi — Swap to Gold",
  description: "Swap BTC to XAUt (Tether Gold) on Arbitrum via Garden Finance",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ClientRoot>{children}</ClientRoot>
      </body>
    </html>
  );
}
