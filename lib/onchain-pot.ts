import { cache } from "react";

import { BASE_POT_ABI } from "@/lib/contracts";
import { isDeploymentConfigured, publicEnv } from "@/lib/env";
import { onchainPublicClient } from "@/lib/onchain-client";
import type { PotTuple } from "@/lib/pot-state";

export const getOnchainPot = cache(async (potId: number) => {
  if (!isDeploymentConfigured) {
    return undefined;
  }

  return (await onchainPublicClient.readContract({
    address: publicEnv.NEXT_PUBLIC_POT_CONTRACT_ADDRESS as `0x${string}`,
    abi: BASE_POT_ABI,
    functionName: "getPot",
    args: [BigInt(potId)],
  })) as PotTuple;
});
