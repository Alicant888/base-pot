# Base Pot Context

## What This Project Is

Base Pot is a local MVP for one-link USDC collection pots on Base.

Core flow:

1. Create a pot
2. Generate a shareable link
3. Open the same link in Base App or a normal browser
4. Approve USDC and contribute
5. Finalize a funded pot or claim refunds after cancellation/failed expiry

This is intentionally a narrow MVP, not a social product, not a split-bill platform, and not a multi-chain app.

## Current Product Scope

Must keep working:

- create pot flow
- shareable `/pot/[slug]` page
- Base Account plus injected wallet support
- USDC approve + contribute
- finalize
- cancel
- refund
- local Anvil + Foundry development flow

Out of scope unless explicitly requested:

- multi-token support
- multi-chain support
- custodial backend
- heavy indexing backend
- gamification
- notifications backend
- profiles, feeds, admin panels

## Tech Stack

- Next.js 15 App Router
- React + TypeScript
- Tailwind CSS
- wagmi + viem + @tanstack/react-query
- @base-org/account
- Prisma + SQLite
- Solidity + Foundry
- pnpm

## Important Architecture Decisions

### Pot Page Rendering

The `/pot/[slug]` route uses a split rendering model:

- Prisma + SQLite store share metadata keyed by slug.
- The latest onchain pot snapshot is fetched on the server.
- Recent activity is derived from onchain contract events on the server.
- Interactive wallet actions live in a lazy client island.
- After successful writes, the client calls `router.refresh()` to refresh server-rendered sections.

This split is intentional and should be preserved unless there is a strong reason to change it.

### Bundle Optimization

The pot page was explicitly optimized to reduce bundle size.

Latest verified production measurement:

- `/pot/[slug]` route size: `1.55 kB`
- `/pot/[slug]` first load JS: `104 kB`

Earlier it was much larger, so avoid moving static pot content back into a large client component.

### Wallet Strategy

The app supports:

- Base Account
- injected browser wallets

Guidelines:

- Base Account should be additive, not a requirement
- normal browser wallets must still work
- wrong-network handling must remain clear
- capability checks should stay lightweight and not inflate initial bundle size

### Activity Model

Recent pot activity is onchain-derived.

- Do not reintroduce client-posted activity as the source of truth
- `POST /api/pots/[slug]/activity` is deprecated and currently returns `410`

## Important Files

### Product and routing

- [app/page.tsx](D:/Cursor/BASE/Pot/app/page.tsx)
- [app/create/page.tsx](D:/Cursor/BASE/Pot/app/create/page.tsx)
- [app/pot/[slug]/page.tsx](D:/Cursor/BASE/Pot/app/pot/[slug]/page.tsx)

### Pot page

- [components/pot-static-sections.tsx](D:/Cursor/BASE/Pot/components/pot-static-sections.tsx)
- [components/pot-client.tsx](D:/Cursor/BASE/Pot/components/pot-client.tsx)
- [components/pot-client-island.tsx](D:/Cursor/BASE/Pot/components/pot-client-island.tsx)

### Wallet and web3 config

- [components/wallet-panel.tsx](D:/Cursor/BASE/Pot/components/wallet-panel.tsx)
- [components/providers.tsx](D:/Cursor/BASE/Pot/components/providers.tsx)
- [lib/wagmi.ts](D:/Cursor/BASE/Pot/lib/wagmi.ts)
- [lib/base-account.ts](D:/Cursor/BASE/Pot/lib/base-account.ts)
- [next.config.ts](D:/Cursor/BASE/Pot/next.config.ts)

### Onchain read model

- [lib/onchain-client.ts](D:/Cursor/BASE/Pot/lib/onchain-client.ts)
- [lib/onchain-pot.ts](D:/Cursor/BASE/Pot/lib/onchain-pot.ts)
- [lib/onchain-activity.ts](D:/Cursor/BASE/Pot/lib/onchain-activity.ts)
- [lib/pot-state.ts](D:/Cursor/BASE/Pot/lib/pot-state.ts)

### Metadata and persistence

- [app/api/pots/route.ts](D:/Cursor/BASE/Pot/app/api/pots/route.ts)
- [lib/pots.ts](D:/Cursor/BASE/Pot/lib/pots.ts)
- [prisma/schema.prisma](D:/Cursor/BASE/Pot/prisma/schema.prisma)

### Contracts

- [contracts/src/BasePot.sol](D:/Cursor/BASE/Pot/contracts/src/BasePot.sol)
- [contracts/src/MockUSDC.sol](D:/Cursor/BASE/Pot/contracts/src/MockUSDC.sol)
- [contracts/test/BasePot.t.sol](D:/Cursor/BASE/Pot/contracts/test/BasePot.t.sol)

## Local Dev Workflow

Install:

```bash
corepack pnpm install
corepack pnpm prisma:generate
```

Run local chain:

```bash
node scripts/run-foundry.mjs anvil
```

Deploy contracts locally:

```bash
node scripts/run-foundry.mjs deploy-local
corepack pnpm sync:deployment
```

Prepare SQLite:

```bash
set DATABASE_URL=file:./dev.db
corepack pnpm prisma:push
```

Run app:

```bash
corepack pnpm dev
```

## Validation Commands

Use these after meaningful changes:

```bash
corepack pnpm exec tsc --noEmit
corepack pnpm lint
corepack pnpm build
node scripts/run-foundry.mjs build
node scripts/run-foundry.mjs test
```

## Current Caveats

- `prisma migrate dev` was unreliable in this sandboxed environment, so the fast local path uses `prisma:push`
- optional wagmi connector peers are aliased out in `next.config.ts`
- the remaining known build warning is about the flat ESLint config not explicitly registering the Next ESLint plugin
- full Base App validation still needs a real Base-accessible deployment like Base Sepolia

## Change Guidance

When making changes, prefer these rules:

- preserve the standard web app flow, not Base-App-only behavior
- keep the same pot URL working in both Base App and browser wallets
- do not expand scope unless requested
- prefer small, demo-ready, working improvements over abstract architecture work
- keep the pot page share-ready and action-oriented
- avoid moving static display sections into big client components
- if changing contracts, keep the design simple and testable

## Source Docs

For fuller background, also see:

- [Prompt.md](D:/Cursor/BASE/Pot/Prompt.md)
- [README.md](D:/Cursor/BASE/Pot/README.md)
