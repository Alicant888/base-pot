import { z } from "zod";

const addressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/);

export const createPotMetadataSchema = z.object({
  slug: z.string().min(3).max(80),
  chainId: z.number().int().positive(),
  onchainPotId: z.number().int().nonnegative(),
  txHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  title: z.string().trim().min(3).max(80),
  description: z.string().trim().min(8).max(240),
  goalAmount: z.string().trim().min(1),
  deadline: z.string().datetime(),
  recipientAddress: addressSchema,
  organizerAddress: addressSchema,
  emoji: z.string().trim().max(8).optional().or(z.literal("")),
  suggestedContribution: z.string().trim().optional(),
});

export type CreatePotMetadataInput = z.infer<typeof createPotMetadataSchema>;
