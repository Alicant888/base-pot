"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useMemo, useState } from "react";
import { decodeEventLog } from "viem";
import { useAccount, usePublicClient, useSwitchChain, useWriteContract } from "wagmi";
import { z } from "zod";

import { WalletPanel } from "@/components/wallet-panel";
import { targetChain } from "@/lib/chains";
import { BASE_POT_ABI } from "@/lib/contracts";
import { isDeploymentConfigured, publicEnv } from "@/lib/env";
import { parseUsdc } from "@/lib/utils";

const formSchema = z.object({
  title: z.string().trim().min(3).max(80),
  description: z.string().trim().min(3).max(240),
  goalAmount: z.string().trim().min(1),
  deadline: z.string().min(1),
  recipientAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  emoji: z.string().trim().max(8).optional(),
  suggestedContribution: z.string().trim().optional(),
});

const tomorrowIso = new Date(Date.now() + 86_400_000).toISOString().slice(0, 16);

const initialForm = {
  title: "",
  description: "",
  goalAmount: "100",
  deadline: tomorrowIso,
  recipientAddress: "",
  emoji: "*",
  suggestedContribution: "20",
};

function slugifyTitle(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function CreatePotForm() {
  const router = useRouter();
  const publicClient = usePublicClient({ chainId: targetChain.id });
  const { address, chainId, isConnected } = useAccount();
  const { switchChainAsync, isPending: isSwitching } = useSwitchChain();
  const { writeContractAsync, isPending: isWriting } = useWriteContract();

  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const sharePreview = useMemo(
    () => `/pot/${slugifyTitle(form.title || "team-pot")}-?`,
    [form.title],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!isDeploymentConfigured) {
      setError("Add deployed contract addresses to .env.local before creating a pot.");
      return;
    }

    if (!isConnected || !address) {
      setError("Connect a wallet before creating a pot.");
      return;
    }

    const parsed = formSchema.safeParse(form);

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the form fields and try again.");
      return;
    }

    try {
      if (chainId !== targetChain.id) {
        await switchChainAsync({ chainId: targetChain.id });
      }

      if (!publicClient) {
        throw new Error("The public client is not ready yet.");
      }

      const deadlineIso = new Date(parsed.data.deadline).toISOString();
      const goalAmount = parseUsdc(parsed.data.goalAmount);
      const deadlineSeconds = Math.floor(new Date(deadlineIso).getTime() / 1000);

      const hash = await writeContractAsync({
        address: publicEnv.NEXT_PUBLIC_POT_CONTRACT_ADDRESS as `0x${string}`,
        abi: BASE_POT_ABI,
        functionName: "createPot",
        chainId: targetChain.id,
        args: [goalAmount, BigInt(deadlineSeconds), parsed.data.recipientAddress as `0x${string}`],
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      const potLog = receipt.logs.find((log) => {
        try {
          const decoded = decodeEventLog({
            abi: BASE_POT_ABI,
            data: log.data,
            topics: log.topics,
          });
          return decoded.eventName === "PotCreated";
        } catch {
          return false;
        }
      });

      if (!potLog) {
        throw new Error("PotCreated event not found in the receipt.");
      }

      const decoded = decodeEventLog({
        abi: BASE_POT_ABI,
        data: potLog.data,
        topics: potLog.topics,
      });

      const potId = Number(decoded.args.potId);
      const slug = `${slugifyTitle(parsed.data.title)}-${potId}`;

      const response = await fetch("/api/pots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug,
          chainId: targetChain.id,
          onchainPotId: potId,
          txHash: hash,
          title: parsed.data.title,
          description: parsed.data.description,
          goalAmount: parsed.data.goalAmount,
          deadline: deadlineIso,
          recipientAddress: parsed.data.recipientAddress,
          organizerAddress: address,
          emoji: parsed.data.emoji,
          suggestedContribution: parsed.data.suggestedContribution,
        }),
      });

      if (!response.ok) {
        throw new Error("The onchain pot exists, but saving the share page metadata failed.");
      }

      setSuccess("Pot created. Redirecting to the shareable page...");
      startTransition(() => {
        router.push(`/pot/${slug}`);
      });
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : "The pot transaction did not complete.";
      setError(message);
    }
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
      <form
        onSubmit={handleSubmit}
        className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-panel sm:p-8"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              New Pot
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">
              Create a sharp, one-link collection page
            </h2>
          </div>
          <div className="rounded-full bg-mist px-4 py-2 text-sm font-semibold text-base">
            {targetChain.name}
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <label className="md:col-span-2">
            <span className="text-sm font-semibold">Title</span>
            <input
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-base"
              placeholder="Lisbon team trip"
            />
          </label>

          <label className="md:col-span-2">
            <span className="text-sm font-semibold">Short description</span>
            <textarea
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
              className="mt-2 min-h-28 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-base"
              placeholder="Collecting USDC for the apartment deposit and shared transfers."
            />
          </label>

          <label>
            <span className="text-sm font-semibold">Goal amount (USDC)</span>
            <input
              value={form.goalAmount}
              onChange={(event) =>
                setForm((current) => ({ ...current, goalAmount: event.target.value }))
              }
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-base"
              placeholder="200"
            />
          </label>

          <label>
            <span className="text-sm font-semibold">Deadline</span>
            <input
              type="datetime-local"
              value={form.deadline}
              onChange={(event) =>
                setForm((current) => ({ ...current, deadline: event.target.value }))
              }
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-base"
            />
          </label>

          <label>
            <span className="text-sm font-semibold">Recipient address</span>
            <input
              value={form.recipientAddress}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  recipientAddress: event.target.value,
                }))
              }
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 font-mono text-sm outline-none transition focus:border-base"
              placeholder="0x..."
            />
          </label>

          <label>
            <span className="text-sm font-semibold">Suggested contribution</span>
            <input
              value={form.suggestedContribution}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  suggestedContribution: event.target.value,
                }))
              }
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-base"
              placeholder="25"
            />
          </label>

          <label className="md:col-span-2">
            <span className="text-sm font-semibold">Emoji</span>
            <input
              value={form.emoji}
              onChange={(event) => setForm((current) => ({ ...current, emoji: event.target.value }))}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-base"
                            placeholder="*"
            />
          </label>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={isWriting || isSwitching}
            className="rounded-full bg-base px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isWriting || isSwitching ? "Submitting..." : "Create onchain pot"}
          </button>
          <span className="text-sm text-muted">Share URL preview: {sharePreview}</span>
        </div>

        {error ? <p className="mt-4 text-sm font-medium text-rose-600">{error}</p> : null}
        {success ? <p className="mt-4 text-sm font-medium text-base">{success}</p> : null}
      </form>

      <div className="space-y-6">
        <WalletPanel compact />

        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-panel">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            Flow
          </p>
          <div className="mt-4 space-y-4 text-sm text-muted">
            <p>1. Create the pot onchain and save the share metadata in Postgres.</p>
            <p>2. Post the share link into chat.</p>
            <p>3. Contributors approve USDC, contribute, then the organizer finalizes or cancels.</p>
          </div>
          {!isConnected ? (
            <p className="mt-5 text-sm text-muted">
              You can also connect from the pot page later if you want to preview the layout first.
            </p>
          ) : null}
          <Link href="/" className="mt-6 inline-flex text-sm font-semibold text-base">
            Back to landing
          </Link>
        </div>
      </div>
    </div>
  );
}


