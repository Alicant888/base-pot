import { cookieStorage, createConfig, createStorage, http } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { baseAccount, injected } from "wagmi/connectors";

import { publicEnv } from "@/lib/env";
import { localBasePotChain, supportedChains } from "@/lib/chains";

export function getConfig() {
  return createConfig({
    chains: supportedChains,
    connectors: [
      baseAccount({
        appName: publicEnv.NEXT_PUBLIC_BASE_APP_NAME,
      }),
      injected(),
    ],
    multiInjectedProviderDiscovery: false,
    ssr: true,
    storage: createStorage({
      storage: cookieStorage,
    }),
    transports: {
      [localBasePotChain.id]: http(publicEnv.NEXT_PUBLIC_RPC_URL),
      [base.id]: http(),
      [baseSepolia.id]: http(),
    },
  });
}

declare module "wagmi" {
  interface Register {
    config: ReturnType<typeof getConfig>;
  }
}
