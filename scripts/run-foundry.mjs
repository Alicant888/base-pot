import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";

const workspace = process.cwd();
const foundryRoot = path.join(workspace, ".tools", "foundry");
const forgePath = path.join(foundryRoot, "forge.exe");
const anvilPath = path.join(foundryRoot, "anvil.exe");

if (!existsSync(foundryRoot)) {
  console.error(
    "Foundry is not installed locally yet. Install it into .tools/foundry first.",
  );
  process.exit(1);
}

const [mode] = process.argv.slice(2);

const baseEnv = {
  ...process.env,
  ANVIL_PRIVATE_KEY:
    process.env.ANVIL_PRIVATE_KEY ??
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
};

let command = forgePath;
let args = [];

if (mode === "build") {
  args = ["build"];
} else if (mode === "test") {
  args = ["test", "-vv"];
} else if (mode === "deploy-local") {
  args = [
    "script",
    "contracts/script/DeployLocal.s.sol:DeployLocal",
    "--rpc-url",
    process.env.NEXT_PUBLIC_RPC_URL ?? "http://127.0.0.1:8545",
    "--broadcast",
  ];
} else if (mode === "anvil") {
  command = anvilPath;
  args = ["--host", "127.0.0.1", "--port", "8545"];
} else {
  console.error(`Unknown Foundry mode: ${mode}`);
  process.exit(1);
}

const child = spawn(command, args, {
  stdio: "inherit",
  cwd: workspace,
  env: baseEnv,
});

child.on("exit", (code) => {
  process.exit(code ?? 1);
});
