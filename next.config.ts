import type { NextConfig } from "next";

const optionalWagmiPeers = [
  "@coinbase/wallet-sdk",
  "@metamask/connect-evm",
  "@safe-global/safe-apps-provider",
  "@safe-global/safe-apps-sdk",
  "@walletconnect/ethereum-provider",
  "porto",
  "porto/internal",
] as const;

const nextConfig: NextConfig = {
  typedRoutes: true,
  webpack: (config) => {
    config.resolve ??= {};
    config.resolve.alias ??= {};

    for (const moduleName of optionalWagmiPeers) {
      config.resolve.alias[moduleName] = false;
    }

    return config;
  },
};

export default nextConfig;
