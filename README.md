# Base Pot

Base Pot is a local MVP for one-link USDC collections on Base.

It covers:

- create a pot with title, description, goal, deadline, recipient, and suggested amount
- generate a shareable pot page backed by Prisma + SQLite metadata and onchain activity
- connect with Base Account or a regular injected browser wallet
- approve mock USDC, contribute, finalize, cancel, and claim refunds
- run Solidity build/tests locally with Foundry

## Stack

- Next.js 15
- React + TypeScript
- Tailwind CSS
- wagmi + viem + @tanstack/react-query
- @base-org/account
- Prisma + SQLite
- Solidity + Foundry

## Project layout

- `app/` - App Router pages and API routes
- `components/` - UI, client islands, and wallet interaction components
- `lib/` - env, Prisma, wagmi, onchain helpers, and contract ABI
- `contracts/` - Solidity sources, tests, deploy script, deployments
- `scripts/` - local Foundry runner and env sync helper
- `prisma/` - Prisma schema

## Local app flow

1. Install dependencies:

```bash
corepack pnpm install
corepack pnpm prisma:generate
```

2. Copy the example env file:

```bash
copy .env.example .env.local
```

3. Start the local Base-compatible chain:

```bash
node scripts/run-foundry.mjs anvil
```

4. In another terminal, deploy the contracts:

```bash
node scripts/run-foundry.mjs deploy-local
```

5. Sync the deployed addresses into `.env.local`:

```bash
corepack pnpm sync:deployment
```

6. Push the Prisma schema to the local SQLite database:

```bash
set DATABASE_URL=file:./dev.db
corepack pnpm prisma:push
```

7. Start the app:

```bash
corepack pnpm dev
```

Open `http://localhost:3000`.

## Pot page architecture

The `/pot/[slug]` route now uses a split rendering model:

- Prisma + SQLite store only the shareable metadata and local read model for the pot slug.
- The current onchain pot snapshot is read on the server from the contract before render.
- Recent activity is derived from contract events on the server, not posted from the client.
- Wallet connect, approve, contribute, finalize, cancel, and refund actions live in a lazy client island.
- After a successful write, the client refreshes the server-rendered pot overview and activity feed.
- The legacy `POST /api/pots/[slug]/activity` route is intentionally deprecated and returns `410`.

### Latest verified build footprint

On the latest verified production build in this repo state:

- `/pot/[slug]` route size: `1.55 kB`
- `/pot/[slug]` first load JS: `104 kB`
- Previous pre-refactor measurement for the same route was `209 kB` and `443 kB`

## Contracts

- `contracts/src/MockUSDC.sol` - mock 6-decimal token with public mint for local testing
- `contracts/src/BasePot.sol` - pot creation, contributions, finalize, cancel, and refund logic

Useful commands:

```bash
node scripts/run-foundry.mjs build
node scripts/run-foundry.mjs test
```

## Deployment sync

After a local deploy, `corepack pnpm sync:deployment` reads `contracts/deployments/local.json` and updates `.env.local` with:

- `NEXT_PUBLIC_CHAIN_ID`
- `NEXT_PUBLIC_RPC_URL`
- `NEXT_PUBLIC_POT_CONTRACT_ADDRESS`
- `NEXT_PUBLIC_USDC_ADDRESS`
- `NEXT_PUBLIC_DEPLOY_BLOCK`

## Base App notes

The app is wired for both:

- local development on Anvil (`chainId=31337`)
- real Base-compatible deployment (`Base Sepolia` or `Base Mainnet`)

For full in-app Base App validation, deploy to Base Sepolia or Base Mainnet and set:

- `NEXT_PUBLIC_CHAIN_ID`
- `NEXT_PUBLIC_CHAIN_NAME`
- `NEXT_PUBLIC_RPC_URL`
- `NEXT_PUBLIC_POT_CONTRACT_ADDRESS`
- `NEXT_PUBLIC_USDC_ADDRESS`

The same `/pot/[slug]` URL works in both contexts once the app points at a real Base-accessible network.

## Validation

Validated in this workspace state with:

```bash
corepack pnpm exec tsc --noEmit
corepack pnpm lint
corepack pnpm build
node scripts/run-foundry.mjs build
node scripts/run-foundry.mjs test
```

## Notes

- Mock USDC includes a public `mint` function so local wallets can self-fund quickly.
- Pot activity on the `/pot/[slug]` page is derived from onchain contract events, and the client refreshes that server feed after successful writes.
- Optional wagmi connector peers are aliased out in `next.config.ts`, so builds stay clean while the app uses only Base Account plus the injected wallet flow.
- Base Account capability checks are loaded on demand after wallet connection instead of inflating the initial pot page bundle.
- Prisma client generation is validated. In this sandbox session, `prisma migrate dev` did not complete cleanly, so the documented local setup uses `prisma:push` for the fastest path.
- The remaining build warning is unrelated to bundle size: Next.js still reports that the current flat ESLint config does not register the Next ESLint plugin explicitly.
