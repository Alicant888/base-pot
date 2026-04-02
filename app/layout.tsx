import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { cookieToInitialState } from "wagmi";

import { Providers } from "@/components/providers";
import { getConfig } from "@/lib/wagmi";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Base Pot",
  description: "One-link USDC collection pots on Base.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const initialState = cookieToInitialState(getConfig(), (await headers()).get("cookie"));

  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <Providers initialState={initialState}>
          <div className="min-h-screen">
            <header className="border-b border-slate-200/80 bg-white/84 backdrop-blur">
              <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
                <Link href="/" className="text-lg font-semibold tracking-tight">
                  Base Pot
                </Link>
                <nav className="flex items-center gap-4 text-sm font-semibold text-muted sm:gap-6">
                  <Link href="/">Home</Link>
                  <Link href="/create">Create</Link>
                </nav>
              </div>
            </header>
            <main className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
