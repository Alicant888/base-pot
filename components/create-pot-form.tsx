"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useMemo, useState } from "react";
import { ArrowLeft, Sparkles } from "lucide-react";
import { decodeEventLog } from "viem";
import { useAccount, usePublicClient, useSwitchChain, useWriteContract } from "wagmi";
import { z } from "zod";

import { WalletPanel } from "@/components/wallet-panel";
import { targetChain } from "@/lib/chains";
import { BASE_POT_ABI } from "@/lib/contracts";
import { isDeploymentConfigured, publicEnv } from "@/lib/env";
import { safeParseUsdc } from "@/lib/utils";

const formSchema = z.object({
  title: z.string().trim().min(3).max(80),
  description: z.string().trim().min(3).max(240),
  goalAmount: z.string().trim().min(1),
  deadline: z.string().min(1),
  recipientAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  emoji: z.string().trim().max(8).optional(),
});

const tomorrowIso = new Date(Date.now() + 86_400_000).toISOString().slice(0, 16);

const initialForm = {
  title: "",
  description: "",
  goalAmount: "100",
  deadline: tomorrowIso,
  recipientAddress: "",
  emoji: "",
};

const cyrillicToLatinMap: Record<string, string> = {
  "\u0430": "a",
  "\u0431": "b",
  "\u0432": "v",
  "\u0433": "g",
  "\u0434": "d",
  "\u0435": "e",
  "\u0451": "e",
  "\u0436": "zh",
  "\u0437": "z",
  "\u0438": "i",
  "\u0439": "y",
  "\u043a": "k",
  "\u043b": "l",
  "\u043c": "m",
  "\u043d": "n",
  "\u043e": "o",
  "\u043f": "p",
  "\u0440": "r",
  "\u0441": "s",
  "\u0442": "t",
  "\u0443": "u",
  "\u0444": "f",
  "\u0445": "h",
  "\u0446": "ts",
  "\u0447": "ch",
  "\u0448": "sh",
  "\u0449": "sch",
  "\u044a": "",
  "\u044b": "y",
  "\u044c": "",
  "\u044d": "e",
  "\u044e": "yu",
  "\u044f": "ya",
  "\u0456": "i",
  "\u0457": "yi",
  "\u0454": "ye",
  "\u0491": "g",
};

function transliterateToAscii(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .split("")
    .map((character) => cyrillicToLatinMap[character] ?? character)
    .join("");
}
function slugifyTitle(title: string) {
  const normalized = transliterateToAscii(title.toLowerCase())
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return normalized || "pot";
}

function formatDeadlineDisplay(deadline: string) {
  const date = new Date(deadline);

  if (Number.isNaN(date.getTime())) {
    return deadline;
  }

  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
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
  const deadlineDisplay = useMemo(() => formatDeadlineDisplay(form.deadline), [form.deadline]);

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
      const goalAmount = safeParseUsdc(parsed.data.goalAmount);
      if (goalAmount === null || goalAmount <= 0n) {
        throw new Error("Enter a valid goal amount.");
      }
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
        }),
      });

      if (!response.ok) {
        throw new Error("The onchain pot exists, but saving the share page metadata failed.");
      }

      setSuccess("Pot created. Redirecting to the shareable page...");
      startTransition(() => {
        router.push(`/pot/${slug}?created=1`);
      });
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : "The pot transaction did not complete.";
      setError(message);
    }
  }

  const submitLabel = isWriting || isSwitching ? "Submitting..." : "Create onchain pot";

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-5">
        {!isConnected ? (
          <div className="lg:hidden">
            <WalletPanel compact />
          </div>
        ) : null}

        <form
          onSubmit={handleSubmit}
          className="rounded-[30px] border border-slate-200 bg-white/96 p-5 shadow-panel backdrop-blur sm:rounded-[36px] sm:p-8"
        >
          <section>
            <div className="flex items-center gap-2 text-sm font-semibold text-ink">
              <Sparkles className="size-4 text-base" />
              Setup
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="md:col-span-2">
                <span className="text-sm font-semibold">Title</span>
                <input
                  value={form.title}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, title: event.target.value }))
                  }
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-base"
                  placeholder="Lisbon team trip"
                />
              </label>

              <label className="md:col-span-2">
                <span className="text-sm font-semibold">Short description</span>
                <input
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, description: event.target.value }))
                  }
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-base"
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
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-base"
                  placeholder="200"
                />
              </label>

              <label className="min-w-0">
                <span className="text-sm font-semibold">Deadline</span>
                <span className="relative mt-2 block overflow-hidden rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink transition focus-within:border-base">
                  <span className="block overflow-hidden text-ellipsis whitespace-nowrap pr-8">
                    {deadlineDisplay}
                  </span>
                  <input
                    type="datetime-local"
                    value={form.deadline}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, deadline: event.target.value }))
                    }
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  />
                </span>
              </label>

              <label className="md:col-span-2">
                <span className="text-sm font-semibold">Recipient address</span>
                <input
                  value={form.recipientAddress}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      recipientAddress: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-mono text-sm outline-none transition focus:border-base"
                  placeholder="0x..."
                />
              </label>
            </div>
          </section>


          <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="submit"
              disabled={isWriting || isSwitching}
              className="inline-flex items-center justify-center rounded-full bg-base px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(0,82,255,0.22)] disabled:opacity-60"
            >
              {submitLabel}
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-ink sm:justify-start"
            >
              <ArrowLeft className="size-4" />
              Back
            </Link>
          </div>

          {error ? <p className="mt-4 text-sm font-medium text-rose-600">{error}</p> : null}
          {success ? <p className="mt-4 text-sm font-medium text-base">{success}</p> : null}
        </form>
      </div>

      <aside className="hidden space-y-6 lg:block">
        <WalletPanel compact />

        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-panel">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Flow</p>
          <div className="mt-4 space-y-4 text-sm leading-6 text-muted">
            <p>1. Create the pot onchain and save the share metadata.</p>
            <p>2. Share the same link wherever your group already talks.</p>
            <p>3. Contributors fund it, then the organizer finalizes or refunds.</p>
          </div>
          {!isConnected ? (
            <p className="mt-5 text-sm leading-6 text-muted">
              You can still preview the layout first, but a wallet is required before the pot is
              created.
            </p>
          ) : null}
          <Link href="/" className="mt-6 inline-flex text-sm font-semibold text-base">
            Back to landing
          </Link>
        </div>
      </aside>
    </div>
  );
}



