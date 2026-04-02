import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const workspace = process.cwd();
const profile = process.argv[2] ?? "local";
const envFilename = process.argv[3] ?? ".env.local";
const deploymentPath = path.join(workspace, "contracts", "deployments", `${profile}.json`);
const envPath = path.join(workspace, envFilename);

if (!existsSync(deploymentPath)) {
  console.error(`Missing ${deploymentPath}.`);
  process.exit(1);
}

const deployment = JSON.parse(readFileSync(deploymentPath, "utf8"));
const current = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";
const lines = new Map(
  current
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const [key, ...rest] = line.split("=");
      return [key, rest.join("=")];
    }),
);

const profileConfig = {
  local: {
    appUrl: "http://localhost:3000",
    blockExplorerUrl: "http://localhost:8545",
    chainName: "Local Base Pot",
    currencySymbol: "ETH",
    databaseUrl: "postgresql://postgres:postgres@127.0.0.1:5432/basepot?schema=public",
    rpcUrl: "http://127.0.0.1:8545",
  },
  "base-mainnet": {
    appUrl: lines.get("NEXT_PUBLIC_APP_URL") ?? "https://your-app.vercel.app",
    blockExplorerUrl: "https://basescan.org",
    chainName: "Base",
    currencySymbol: "ETH",
    databaseUrl:
      lines.get("DATABASE_URL") ??
      "postgresql://USER:PASSWORD@HOST:5432/basepot?schema=public",
    rpcUrl: lines.get("NEXT_PUBLIC_RPC_URL") ?? "https://mainnet.base.org",
  },
};

const resolved = profileConfig[profile];

if (!resolved) {
  console.error(`Unsupported deployment profile: ${profile}`);
  process.exit(1);
}

if (!lines.has("DATABASE_URL")) {
  lines.set("DATABASE_URL", resolved.databaseUrl);
}

lines.set("NEXT_PUBLIC_APP_URL", resolved.appUrl);
lines.set("NEXT_PUBLIC_BASE_APP_NAME", lines.get("NEXT_PUBLIC_BASE_APP_NAME") ?? "Base Pot");
lines.set("NEXT_PUBLIC_CHAIN_ID", String(deployment.chainId));
lines.set("NEXT_PUBLIC_CHAIN_NAME", resolved.chainName);
lines.set("NEXT_PUBLIC_CHAIN_CURRENCY_SYMBOL", resolved.currencySymbol);
lines.set("NEXT_PUBLIC_RPC_URL", resolved.rpcUrl);
lines.set("NEXT_PUBLIC_BLOCK_EXPLORER_URL", resolved.blockExplorerUrl);
lines.set("NEXT_PUBLIC_DEPLOY_BLOCK", String(deployment.deployBlock ?? 0));
lines.set("NEXT_PUBLIC_POT_CONTRACT_ADDRESS", deployment.pot);
lines.set("NEXT_PUBLIC_USDC_ADDRESS", deployment.usdc);

const nextContent = `${Array.from(lines.entries())
  .map(([key, value]) => `${key}=${value}`)
  .join("\n")}\n`;

writeFileSync(envPath, nextContent);
console.log(`Updated ${envPath} from ${deploymentPath}`);
