import { cache } from "react";

import { db } from "@/lib/db";
import type { CreatePotMetadataInput } from "@/lib/validation/pot";

export async function createPotMetadata(input: CreatePotMetadataInput) {
  return db.pot.create({
    data: {
      slug: input.slug,
      chainId: input.chainId,
      onchainPotId: input.onchainPotId,
      txHash: input.txHash,
      title: input.title,
      description: input.description,
      goalAmount: input.goalAmount,
      deadline: new Date(input.deadline),
      recipientAddress: input.recipientAddress,
      organizerAddress: input.organizerAddress,
      emoji: input.emoji || null,
      suggestedContribution: input.suggestedContribution || null,
    },
  });
}

export const getPotBySlug = cache(async (slug: string) => {
  return db.pot.findUnique({
    where: { slug },
  });
});

export async function getPotsByOrganizerAddress(address: string) {
  return db.pot.findMany({
    where: {
      organizerAddress: {
        equals: address,
        mode: "insensitive",
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getPotsByOnchainIds(onchainPotIds: number[]) {
  if (onchainPotIds.length === 0) {
    return [];
  }

  return db.pot.findMany({
    where: {
      onchainPotId: {
        in: onchainPotIds,
      },
    },
  });
}
