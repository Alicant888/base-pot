import { cache } from "react";
import { parseAbiItem } from "viem";

import { isDeploymentConfigured, publicEnv } from "@/lib/env";
import { onchainPublicClient } from "@/lib/onchain-client";
import { formatUsdc } from "@/lib/utils";

export type PotActivity = {
  id: string;
  type: "CONTRIBUTION" | "FINALIZED" | "CANCELLED" | "REFUND";
  actorAddress: string;
  amount: string | null;
  occurredAt: string;
  txHash: string;
};

type SortablePotActivity = PotActivity & {
  blockNumber: number;
  logIndex: number;
};

const contributionReceivedEvent = parseAbiItem(
  "event ContributionReceived(uint256 indexed potId, address indexed contributor, uint256 amount, uint256 totalRaised)",
);

const potFinalizedEvent = parseAbiItem(
  "event PotFinalized(uint256 indexed potId, address indexed recipient, uint256 amount)",
);

const potCancelledEvent = parseAbiItem(
  "event PotCancelled(uint256 indexed potId, address indexed organizer)",
);

const refundClaimedEvent = parseAbiItem(
  "event RefundClaimed(uint256 indexed potId, address indexed contributor, uint256 amount)",
);

function resolveOccurredAt(
  timestampsByBlock: Map<string, string>,
  blockNumber: bigint | null | undefined,
) {
  return (
    (blockNumber ? timestampsByBlock.get(blockNumber.toString()) : undefined) ??
    new Date().toISOString()
  );
}

function sortActivities(left: SortablePotActivity, right: SortablePotActivity) {
  if (left.blockNumber !== right.blockNumber) {
    return right.blockNumber - left.blockNumber;
  }

  return right.logIndex - left.logIndex;
}

export const getOnchainPotActivity = cache(async (potId: number) => {
  if (!isDeploymentConfigured) {
    return {
      activities: [] as PotActivity[],
      contributorCount: 0,
    };
  }

  try {
    const contractAddress = publicEnv.NEXT_PUBLIC_POT_CONTRACT_ADDRESS as `0x${string}`;
    const targetPotId = BigInt(potId);
    const baseQuery = {
      address: contractAddress,
      fromBlock: BigInt(publicEnv.NEXT_PUBLIC_DEPLOY_BLOCK),
      args: { potId: targetPotId },
    } as const;

    const [contributionLogs, finalizedLogs, cancelledLogs, refundLogs] = await Promise.all([
      onchainPublicClient.getLogs({
        ...baseQuery,
        event: contributionReceivedEvent,
      }),
      onchainPublicClient.getLogs({
        ...baseQuery,
        event: potFinalizedEvent,
      }),
      onchainPublicClient.getLogs({
        ...baseQuery,
        event: potCancelledEvent,
      }),
      onchainPublicClient.getLogs({
        ...baseQuery,
        event: refundClaimedEvent,
      }),
    ]);

    const allLogs = [...contributionLogs, ...finalizedLogs, ...cancelledLogs, ...refundLogs];
    const uniqueBlockNumbers = [
      ...new Set(allLogs.flatMap((log) => (log.blockNumber ? [log.blockNumber] : []))),
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

    const activities: SortablePotActivity[] = [
      ...contributionLogs.flatMap((log) =>
        log.transactionHash && log.args.contributor
          ? [
              {
                id: `${log.transactionHash}-contribution-${log.logIndex ?? 0}`,
                type: "CONTRIBUTION" as const,
                actorAddress: log.args.contributor,
                amount: log.args.amount ? formatUsdc(log.args.amount) : "0",
                occurredAt: resolveOccurredAt(timestampsByBlock, log.blockNumber),
                txHash: log.transactionHash,
                blockNumber: Number(log.blockNumber ?? 0n),
                logIndex: Number(log.logIndex ?? 0),
              },
            ]
          : [],
      ),
      ...finalizedLogs.flatMap((log) =>
        log.transactionHash && log.args.recipient
          ? [
              {
                id: `${log.transactionHash}-finalized-${log.logIndex ?? 0}`,
                type: "FINALIZED" as const,
                actorAddress: log.args.recipient,
                amount: log.args.amount ? formatUsdc(log.args.amount) : null,
                occurredAt: resolveOccurredAt(timestampsByBlock, log.blockNumber),
                txHash: log.transactionHash,
                blockNumber: Number(log.blockNumber ?? 0n),
                logIndex: Number(log.logIndex ?? 0),
              },
            ]
          : [],
      ),
      ...cancelledLogs.flatMap((log) =>
        log.transactionHash && log.args.organizer
          ? [
              {
                id: `${log.transactionHash}-cancelled-${log.logIndex ?? 0}`,
                type: "CANCELLED" as const,
                actorAddress: log.args.organizer,
                amount: null,
                occurredAt: resolveOccurredAt(timestampsByBlock, log.blockNumber),
                txHash: log.transactionHash,
                blockNumber: Number(log.blockNumber ?? 0n),
                logIndex: Number(log.logIndex ?? 0),
              },
            ]
          : [],
      ),
      ...refundLogs.flatMap((log) =>
        log.transactionHash && log.args.contributor
          ? [
              {
                id: `${log.transactionHash}-refund-${log.logIndex ?? 0}`,
                type: "REFUND" as const,
                actorAddress: log.args.contributor,
                amount: log.args.amount ? formatUsdc(log.args.amount) : null,
                occurredAt: resolveOccurredAt(timestampsByBlock, log.blockNumber),
                txHash: log.transactionHash,
                blockNumber: Number(log.blockNumber ?? 0n),
                logIndex: Number(log.logIndex ?? 0),
              },
            ]
          : [],
      ),
    ]
      .sort(sortActivities)
      .slice(0, 12);

    const contributorCount = new Set(
      contributionLogs.flatMap((log) =>
        log.args.contributor ? [log.args.contributor.toLowerCase()] : [],
      ),
    ).size;

    return {
      contributorCount,
      activities: activities.map(({ blockNumber, logIndex, ...activity }) => activity),
    };
  } catch (error) {
    console.error("Failed to load onchain pot activity", { potId, error });
    return {
      activities: [] as PotActivity[],
      contributorCount: 0,
    };
  }
});
