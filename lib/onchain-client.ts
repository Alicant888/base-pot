import { createPublicClient } from "viem";

import { targetChain } from "@/lib/chains";
import { publicRpcUrls } from "@/lib/env";
import { createRpcTransport } from "@/lib/rpc";

export const onchainPublicClient = createPublicClient({
  chain: targetChain,
  transport: createRpcTransport(publicRpcUrls),
});
