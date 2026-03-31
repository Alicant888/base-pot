import { defineChain } from "viem";
import { base, baseSepolia } from "wagmi/chains";

import { publicEnv } from "@/lib/env";

export const localBasePotChain = defineChain({
  id: 31337,
  name: "Local Base Pot",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [publicEnv.NEXT_PUBLIC_RPC_URL],
    },
  },
  blockExplorers: {
    default: {
      name: "Anvil",
      url: publicEnv.NEXT_PUBLIC_BLOCK_EXPLORER_URL ?? "http://localhost:8545",
    },
  },
});

export const supportedChains = [localBasePotChain, base, baseSepolia] as const;

export const targetChain =
  publicEnv.NEXT_PUBLIC_CHAIN_ID === base.id
    ? base
    : publicEnv.NEXT_PUBLIC_CHAIN_ID === baseSepolia.id
      ? baseSepolia
      : localBasePotChain;
