import { NextResponse } from "next/server";
import { parseAbiItem } from "viem";
import { z } from "zod";

import { BASE_POT_ABI } from "@/lib/contracts";
import { isDeploymentConfigured, publicEnv } from "@/lib/env";
import { onchainPublicClient } from "@/lib/onchain-client";
import { getOnchainPot } from "@/lib/onchain-pot";
import {
  getPotsByOnchainIds,
  getPotsByOrganizerAddress,
  getRecentPots,
} from "@/lib/pots";
import { derivePotStatus, type PotStatus } from "@/lib/pot-state";
import { formatUsdc } from "@/lib/utils";

const querySchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
});

const contributionReceivedEvent = parseAbiItem(
  "event ContributionReceived(uint256 indexed potId, address indexed contributor, uint256 amount, uint256 totalRaised)",
);

type ContributionHistoryItem = {
  onchainPotId: number;
  contributedAmount: string;
  occurredAt: string;
  txHash: string;
  slug: string | null;
  title: string;
  description: string;
  goalAmount: string | null;
  deadline: string | null;
  status: PotStatus;
};

type KnownPotRecord = Awaited<ReturnType<typeof getRecentPots>>[number];

async function getContributedPots(address: `0x${string}`): Promise<Omit<ContributionHistoryItem, "status">[]> {
  if (!isDeploymentConfigured) {
    return [];
  }

  try {
    const logs = await onchainPublicClient.getLogs({
      address: publicEnv.NEXT_PUBLIC_POT_CONTRACT_ADDRESS as `0x${string}`,
      fromBlock: BigInt(publicEnv.NEXT_PUBLIC_DEPLOY_BLOCK),
      event: contributionReceivedEvent,
      args: { contributor: address },
    });

    if (logs.length === 0) {
      return [];
    }

    const uniqueBlockNumbers = [
      ...new Set(logs.flatMap((log) => (log.blockNumber ? [log.blockNumber] : []))),
    ];

    const blocks = await Promise.all(
      uniqueBlockNumbers.map((blockNumber) => onchainPublicClient.getBlock({ blockNumber })),
    );

    const timestampsByBlock = new Map(
      blocks.map((block) => [
        block.number.toString(),
        new Date(Number(block.timestamp) * 1000).toISOString(),
      ]),
    );

    const byPot = new Map<
      number,
      {
        totalAmount: bigint;
        occurredAt: string;
        txHash: string;
        blockNumber: number;
        logIndex: number;
      }
    >();

    for (const log of logs) {
      if (!log.args.potId || !log.transactionHash) {
        continue;
      }

      const onchainPotId = Number(log.args.potId);
      const current = byPot.get(onchainPotId);
      const nextBlockNumber = Number(log.blockNumber ?? 0n);
      const nextLogIndex = Number(log.logIndex ?? 0);
      const occurredAt =
        (log.blockNumber ? timestampsByBlock.get(log.blockNumber.toString()) : undefined) ??
        new Date().toISOString();

      if (!current) {
        byPot.set(onchainPotId, {
          totalAmount: log.args.amount ?? 0n,
          occurredAt,
          txHash: log.transactionHash,
          blockNumber: nextBlockNumber,
          logIndex: nextLogIndex,
        });
        continue;
      }

      const isNewer =
        nextBlockNumber > current.blockNumber ||
        (nextBlockNumber === current.blockNumber && nextLogIndex > current.logIndex);

      byPot.set(onchainPotId, {
        totalAmount: current.totalAmount + (log.args.amount ?? 0n),
        occurredAt: isNewer ? occurredAt : current.occurredAt,
        txHash: isNewer ? log.transactionHash : current.txHash,
        blockNumber: isNewer ? nextBlockNumber : current.blockNumber,
        logIndex: isNewer ? nextLogIndex : current.logIndex,
      });
    }

    const metadata = await getPotsByOnchainIds([...byPot.keys()]);
    const metadataByPotId = new Map(metadata.map((pot) => [pot.onchainPotId, pot]));

    return [...byPot.entries()]
      .sort((left, right) => {
        const leftValue = left[1];
        const rightValue = right[1];

        if (leftValue.blockNumber !== rightValue.blockNumber) {
          return rightValue.blockNumber - leftValue.blockNumber;
        }

        return rightValue.logIndex - leftValue.logIndex;
      })
      .map(([onchainPotId, details]) => {
        const pot = metadataByPotId.get(onchainPotId);

        return {
          onchainPotId,
          contributedAmount: formatUsdc(details.totalAmount),
          occurredAt: details.occurredAt,
          txHash: details.txHash,
          slug: pot?.slug ?? null,
          title: pot?.title ?? `Pot #${onchainPotId}`,
          description: pot?.description ?? "Metadata unavailable for this contribution.",
          goalAmount: pot?.goalAmount ?? null,
          deadline: pot?.deadline ? pot.deadline.toISOString() : null,
        };
      });
  } catch (error) {
    console.error("Failed to load contributed pots", { address, error });
    return [];
  }
}

function dedupeKnownPots(pots: KnownPotRecord[]) {
  const byPotId = new Map<number, KnownPotRecord>();

  for (const pot of pots) {
    if (!byPotId.has(pot.onchainPotId)) {
      byPotId.set(pot.onchainPotId, pot);
    }
  }

  return [...byPotId.values()];
}

async function getContributionFallbackForKnownPots(
  address: `0x${string}`,
  knownPots: KnownPotRecord[],
  existingPotIds: Set<number>,
) {
  if (!isDeploymentConfigured || knownPots.length === 0) {
    return [] as Omit<ContributionHistoryItem, "status">[];
  }

  const contractAddress = publicEnv.NEXT_PUBLIC_POT_CONTRACT_ADDRESS as `0x${string}`;

  const fallbackItems = await Promise.all(
    knownPots
      .filter((pot) => !existingPotIds.has(pot.onchainPotId))
      .map(async (pot) => {
        try {
          const amount = (await onchainPublicClient.readContract({
            address: contractAddress,
            abi: BASE_POT_ABI,
            functionName: "contributions",
            args: [BigInt(pot.onchainPotId), address],
          })) as bigint;

          if (amount <= 0n) {
            return null;
          }

          return {
            onchainPotId: pot.onchainPotId,
            contributedAmount: formatUsdc(amount),
            occurredAt: pot.updatedAt.toISOString(),
            txHash: pot.txHash,
            slug: pot.slug,
            title: pot.title,
            description: pot.description,
            goalAmount: pot.goalAmount,
            deadline: pot.deadline.toISOString(),
          } satisfies Omit<ContributionHistoryItem, "status">;
        } catch (error) {
          console.error("Failed to load fallback contribution", {
            address,
            potId: pot.onchainPotId,
            error,
          });
          return null;
        }
      }),
  );

  return fallbackItems.flatMap((item) => (item ? [item] : []));
}

async function getPotStatuses(potIds: number[]) {
  if (!isDeploymentConfigured || potIds.length === 0) {
    return new Map<number, PotStatus>();
  }

  const uniquePotIds = [...new Set(potIds)];
  const entries = await Promise.all(
    uniquePotIds.map(async (potId) => {
      const onchainPot = await getOnchainPot(potId);
      const status = derivePotStatus(onchainPot);
      return [potId, status] as const;
    }),
  );

  return new Map(entries);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = querySchema.safeParse({ address: url.searchParams.get("address") });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid wallet address." }, { status: 400 });
  }

  const address = parsed.data.address;
  const created = await getPotsByOrganizerAddress(address);
  const contributedFromLogs = await getContributedPots(address as `0x${string}`);
  const knownPots = dedupeKnownPots([...created, ...(await getRecentPots(250))]);
  const contributedFallback = await getContributionFallbackForKnownPots(
    address as `0x${string}`,
    knownPots,
    new Set(contributedFromLogs.map((item) => item.onchainPotId)),
  );

  const contributedBase = [...contributedFromLogs, ...contributedFallback].sort(
    (left, right) =>
      new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime(),
  );

  const [createdStatuses, contributedStatuses] = await Promise.all([
    getPotStatuses(created.map((pot) => pot.onchainPotId)),
    getPotStatuses(contributedBase.map((item) => item.onchainPotId)),
  ]);

  return NextResponse.json({
    created: created.map((pot) => ({
      slug: pot.slug,
      onchainPotId: pot.onchainPotId,
      title: pot.title,
      description: pot.description,
      goalAmount: pot.goalAmount,
      deadline: pot.deadline.toISOString(),
      createdAt: pot.createdAt.toISOString(),
      status: createdStatuses.get(pot.onchainPotId) ?? "ACTIVE",
    })),
    contributed: contributedBase.map((item) => ({
      ...item,
      status: contributedStatuses.get(item.onchainPotId) ?? "ACTIVE",
    })),
  });
}
