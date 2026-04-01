import { z } from "zod";

import { APP_NAME, ZERO_ADDRESS } from "@/lib/constants";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_BASE_APP_NAME: z.string().default(APP_NAME),
  NEXT_PUBLIC_CHAIN_ID: z.coerce.number().int().positive().default(31337),
  NEXT_PUBLIC_CHAIN_NAME: z.string().default("Local Base Pot"),
  NEXT_PUBLIC_CHAIN_CURRENCY_SYMBOL: z.string().default("ETH"),
  NEXT_PUBLIC_RPC_URL: z.string().url().default("http://127.0.0.1:8545"),
  NEXT_PUBLIC_BLOCK_EXPLORER_URL: z.string().url().optional(),
  NEXT_PUBLIC_POT_CONTRACT_ADDRESS: z.string().default(ZERO_ADDRESS),
  NEXT_PUBLIC_USDC_ADDRESS: z.string().default(ZERO_ADDRESS),
  NEXT_PUBLIC_DEPLOY_BLOCK: z.coerce.number().int().min(0).default(0),
});

const serverEnvSchema = z.object({
  DATABASE_URL: z
    .string()
    .default("postgresql://postgres:postgres@127.0.0.1:5432/basepot?schema=public"),
});

export const publicEnv = publicEnvSchema.parse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_BASE_APP_NAME: process.env.NEXT_PUBLIC_BASE_APP_NAME,
  NEXT_PUBLIC_CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID,
  NEXT_PUBLIC_CHAIN_NAME: process.env.NEXT_PUBLIC_CHAIN_NAME,
  NEXT_PUBLIC_CHAIN_CURRENCY_SYMBOL:
    process.env.NEXT_PUBLIC_CHAIN_CURRENCY_SYMBOL,
  NEXT_PUBLIC_RPC_URL: process.env.NEXT_PUBLIC_RPC_URL,
  NEXT_PUBLIC_BLOCK_EXPLORER_URL: process.env.NEXT_PUBLIC_BLOCK_EXPLORER_URL,
  NEXT_PUBLIC_POT_CONTRACT_ADDRESS:
    process.env.NEXT_PUBLIC_POT_CONTRACT_ADDRESS,
  NEXT_PUBLIC_USDC_ADDRESS: process.env.NEXT_PUBLIC_USDC_ADDRESS,
  NEXT_PUBLIC_DEPLOY_BLOCK: process.env.NEXT_PUBLIC_DEPLOY_BLOCK,
});

export const serverEnv = serverEnvSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
});

export const isDeploymentConfigured =
  publicEnv.NEXT_PUBLIC_POT_CONTRACT_ADDRESS !== ZERO_ADDRESS &&
  publicEnv.NEXT_PUBLIC_USDC_ADDRESS !== ZERO_ADDRESS;

