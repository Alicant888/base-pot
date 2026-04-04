import { cache } from "react";
import { type Address, namehash, toCoinType } from "viem";
import { base, baseSepolia } from "wagmi/chains";

import { targetChain } from "@/lib/chains";
import { onchainPublicClient } from "@/lib/onchain-client";

const basenameResolverAbi = [
  {
    type: "function",
    name: "name",
    stateMutability: "view",
    inputs: [{ name: "node", type: "bytes32" }],
    outputs: [{ name: "", type: "string" }],
  },
] as const;

const resolverByChainId: Partial<Record<number, Address>> = {
  [base.id]: "0x426fA03fB86E510d0Dd9F70335Cf102a98b10875",
  [baseSepolia.id]: "0x85C87e548091f204C2d0350b39ce1874f02197c6",
};

function isAddress(value: string): value is Address {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}

function getSupportedBasenameChainId() {
  if (targetChain.id === base.id || targetChain.id === baseSepolia.id) {
    return targetChain.id;
  }

  return null;
}

function getReverseNode(address: Address, chainId: number) {
  const reverseLabel = toCoinType(chainId).toString(16).toUpperCase();
  return namehash(`${address.toLowerCase().slice(2)}.${reverseLabel}.reverse`);
}

export const getBasename = cache(async (address: string) => {
  if (!isAddress(address)) {
    return null;
  }

  const chainId = getSupportedBasenameChainId();
  if (!chainId) {
    return null;
  }

  const resolverAddress = resolverByChainId[chainId];
  if (!resolverAddress) {
    return null;
  }

  try {
    const basename = await onchainPublicClient.readContract({
      abi: basenameResolverAbi,
      address: resolverAddress,
      functionName: "name",
      args: [getReverseNode(address, chainId)],
    });

    return basename ? basename.trim() : null;
  } catch (error) {
    console.error("Failed to resolve basename", { address, chainId, error });
    return null;
  }
});

export async function getBasenameMap(addresses: string[]) {
  const uniqueAddresses = [...new Set(addresses.filter(isAddress).map((address) => address.toLowerCase()))];

  const entries = await Promise.all(
    uniqueAddresses.map(async (address) => [address, await getBasename(address)] as const),
  );

  return new Map(entries);
}
