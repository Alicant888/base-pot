import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const workspace = process.cwd();
const deploymentPath = path.join(workspace, "contracts", "deployments", "local.json");
const envPath = path.join(workspace, ".env.local");

if (!existsSync(deploymentPath)) {
  console.error("Missing contracts/deployments/local.json. Run the deploy script first.");
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

if (!lines.has("DATABASE_URL")) {
  lines.set(
    "DATABASE_URL",
    "postgresql://postgres:postgres@127.0.0.1:5432/basepot?schema=public",
  );
}
lines.set("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
lines.set("NEXT_PUBLIC_CHAIN_ID", String(deployment.chainId));
lines.set("NEXT_PUBLIC_CHAIN_NAME", deployment.chainId === 31337 ? "Local Base Pot" : "Base");
lines.set("NEXT_PUBLIC_CHAIN_CURRENCY_SYMBOL", "ETH");
lines.set("NEXT_PUBLIC_RPC_URL", "http://127.0.0.1:8545");
lines.set("NEXT_PUBLIC_DEPLOY_BLOCK", "0");
lines.set("NEXT_PUBLIC_POT_CONTRACT_ADDRESS", deployment.pot);
lines.set("NEXT_PUBLIC_USDC_ADDRESS", deployment.usdc);

const nextContent = `${Array.from(lines.entries())
  .map(([key, value]) => `${key}=${value}`)
  .join("\n")}\n`;

writeFileSync(envPath, nextContent);
console.log(`Updated ${envPath}`);

