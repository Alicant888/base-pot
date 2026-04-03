import type { ReactNode } from "react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { cookieToInitialState } from "wagmi";

import { AppFrame } from "@/components/app-frame";
import { Providers } from "@/components/providers";
import { getConfig } from "@/lib/wagmi";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Base Pot",
  description: "One-link USDC collection pots on Base.",
  icons: {
    icon: "/brand/favicon.png",
    shortcut: "/brand/favicon.png",
    apple: "/brand/favicon.png",
  },
  other: {
    "base:app_id": "69ce02b12cecb99f8ef27a40",
  },
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
          <AppFrame>{children}</AppFrame>
        </Providers>
      </body>
    </html>
  );
}
