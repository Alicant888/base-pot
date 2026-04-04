import { cookieStorage, createConfig, createStorage, http } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { baseAccount, injected, walletConnect } from "wagmi/connectors";

import { BUILDER_CODE_DATA_SUFFIX } from "@/lib/builder-code";
import { localBasePotChain, supportedChains } from "@/lib/chains";
import { publicEnv, publicRpcUrls } from "@/lib/env";
import { createRpcTransport } from "@/lib/rpc";

const targetChainTransport = createRpcTransport(publicRpcUrls);

export function getConfig() {
  return createConfig({
    chains: supportedChains,
    connectors: [
      baseAccount({
        appName: publicEnv.NEXT_PUBLIC_BASE_APP_NAME,
      }),
      ...(publicEnv.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
        ? [
            walletConnect({
              projectId: publicEnv.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
              metadata: {
                name: publicEnv.NEXT_PUBLIC_BASE_APP_NAME,
                description: "One-link USDC collection pots on Base.",
                url: publicEnv.NEXT_PUBLIC_APP_URL,
                icons: [`${publicEnv.NEXT_PUBLIC_APP_URL}/brand/logo.png`],
              },
              showQrModal: true,
            }),
          ]
        : []),
      injected(),
    ],
    multiInjectedProviderDiscovery: false,
    ssr: true,
    storage: createStorage({
      storage: cookieStorage,
    }),
    transports: {
      [localBasePotChain.id]:
        publicEnv.NEXT_PUBLIC_CHAIN_ID === localBasePotChain.id
          ? targetChainTransport
          : http(publicEnv.NEXT_PUBLIC_RPC_URL),
      [base.id]: publicEnv.NEXT_PUBLIC_CHAIN_ID === base.id ? targetChainTransport : http(),
      [baseSepolia.id]:
        publicEnv.NEXT_PUBLIC_CHAIN_ID === baseSepolia.id ? targetChainTransport : http(),
    },
    dataSuffix: BUILDER_CODE_DATA_SUFFIX,
  });
}

declare module "wagmi" {
  interface Register {
    config: ReturnType<typeof getConfig>;
  }
}
