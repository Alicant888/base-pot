import { createPublicClient, http } from "viem";

import { targetChain } from "@/lib/chains";
import { publicEnv } from "@/lib/env";

export const onchainPublicClient = createPublicClient({
  chain: targetChain,
  transport: http(publicEnv.NEXT_PUBLIC_RPC_URL),
});
