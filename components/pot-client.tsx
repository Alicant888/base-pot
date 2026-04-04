"use client";

import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import {
  useAccount,
  usePublicClient,
  useReadContract,
  useSwitchChain,
  useWriteContract,
} from "wagmi";

import { targetChain } from "@/lib/chains";
import { BASE_POT_ABI, ERC20_ABI } from "@/lib/contracts";
import { publicEnv } from "@/lib/env";
import { derivePotStatus, type PotTuple } from "@/lib/pot-state";
import { formatUsdc, parseUsdc, shortAddress } from "@/lib/utils";

type PotClientProps = {
  pot: {
    onchainPotId: number;
    goalAmount: string;
    organizerAddress: string;
    suggestedContribution: string | null;
  };
};

function summarizeActionError(caught: unknown) {
  console.error("Pot action failed", caught);
  return "Error";
}

export function PotClient({ pot }: PotClientProps) {
  const router = useRouter();
  const { address, chainId, isConnected } = useAccount();
  const publicClient = usePublicClient({ chainId: targetChain.id });
  const { switchChainAsync, isPending: isSwitching } = useSwitchChain();
  const { writeContractAsync, isPending: isWriting } = useWriteContract();

  const [contributionInput, setContributionInput] = useState(pot.suggestedContribution ?? "20");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const contractAddress = publicEnv.NEXT_PUBLIC_POT_CONTRACT_ADDRESS as `0x${string}`;
  const usdcAddress = publicEnv.NEXT_PUBLIC_USDC_ADDRESS as `0x${string}`;
  const potId = BigInt(pot.onchainPotId);

  const { data: onchainPot, refetch: refetchPot } = useReadContract({
    address: contractAddress,
    abi: BASE_POT_ABI,
    functionName: "getPot",
    args: [potId],
    chainId: targetChain.id,
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: usdcAddress,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, contractAddress] : undefined,
    chainId: targetChain.id,
    query: { enabled: Boolean(address) },
  });

  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: usdcAddress,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: targetChain.id,
    query: { enabled: Boolean(address) },
  });

  const { data: contribution, refetch: refetchContribution } = useReadContract({
    address: contractAddress,
    abi: BASE_POT_ABI,
    functionName: "contributions",
    args: address ? [potId, address] : undefined,
    chainId: targetChain.id,
    query: { enabled: Boolean(address) },
  });

  const potView = onchainPot as PotTuple | undefined;
  const status = derivePotStatus(potView);
  const expectedAmount = contributionInput.trim() ? parseUsdc(contributionInput) : 0n;
  const hasAllowance = (allowance ?? 0n) >= expectedAmount;
  const hasEnoughBalance = (balance ?? 0n) >= expectedAmount;
  const organizerAddress = (potView?.[0] ?? pot.organizerAddress) as string;
  const goalAmount = potView?.[2] ?? parseUsdc(pot.goalAmount);
  const raisedAmount = potView?.[3] ?? 0n;
  const isOrganizer = address?.toLowerCase() === organizerAddress.toLowerCase();
  const canContribute = status === "ACTIVE" || status === "FUNDED";

  async function ensureTargetChain() {
    if (chainId !== targetChain.id) {
      await switchChainAsync({ chainId: targetChain.id });
    }
  }

  async function refreshReads() {
    await Promise.all([refetchPot(), refetchAllowance(), refetchBalance(), refetchContribution()]);
  }

  function refreshServerSections() {
    startTransition(() => {
      router.refresh();
    });
  }

  async function runAction(action: () => Promise<`0x${string}`>, successText: string) {
    setError(null);
    setMessage(null);

    if (!address || !publicClient) {
      setError("Connect a wallet before sending transactions.");
      return null;
    }

    try {
      await ensureTargetChain();
      const hash = await action();
      await publicClient.waitForTransactionReceipt({ hash });
      await refreshReads();
      refreshServerSections();
      setMessage(successText);
      return hash;
    } catch (caught) {
      setError(summarizeActionError(caught));
      return null;
    }
  }

  async function handleApprove() {
    if (expectedAmount <= 0n) {
      setError("Enter a contribution amount first.");
      return;
    }

    await runAction(
      () =>
        writeContractAsync({
          address: usdcAddress,
          abi: ERC20_ABI,
          functionName: "approve",
          chainId: targetChain.id,
          args: [contractAddress, expectedAmount],
        }),
      "USDC approval confirmed.",
    );
  }

  async function handleMint() {
    if (!address) {
      setError("Connect a wallet first.");
      return;
    }

    await runAction(
      () =>
        writeContractAsync({
          address: usdcAddress,
          abi: ERC20_ABI,
          functionName: "mint",
          chainId: targetChain.id,
          args: [address, parseUsdc("500")],
        }),
      "500 mock USDC minted to your wallet.",
    );
  }

  async function handleContribute() {
    if (!address) {
      setError("Connect a wallet first.");
      return;
    }

    if (expectedAmount <= 0n) {
      setError("Enter a valid USDC amount.");
      return;
    }

    await runAction(
      () =>
        writeContractAsync({
          address: contractAddress,
          abi: BASE_POT_ABI,
          functionName: "contribute",
          chainId: targetChain.id,
          args: [potId, expectedAmount],
        }),
      "Contribution received.",
    );
  }

  async function handleFinalize() {
    if (!address) {
      setError("Connect a wallet first.");
      return;
    }

    await runAction(
      () =>
        writeContractAsync({
          address: contractAddress,
          abi: BASE_POT_ABI,
          functionName: "finalize",
          chainId: targetChain.id,
          args: [potId],
        }),
      "Pot finalized and paid out.",
    );
  }

  async function handleCancel() {
    if (!address) {
      setError("Connect a wallet first.");
      return;
    }

    await runAction(
      () =>
        writeContractAsync({
          address: contractAddress,
          abi: BASE_POT_ABI,
          functionName: "cancelPot",
          chainId: targetChain.id,
          args: [potId],
        }),
      "Pot cancelled. Contributors can now claim refunds.",
    );
  }

  async function handleRefund() {
    if (!address) {
      setError("Connect a wallet first.");
      return;
    }

    await runAction(
      () =>
        writeContractAsync({
          address: contractAddress,
          abi: BASE_POT_ABI,
          functionName: "claimRefund",
          chainId: targetChain.id,
          args: [potId],
        }),
      "Refund claimed back to your wallet.",
    );
  }

  return (
    <div className="space-y-6">

      <section className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-panel sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              Contribute
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Approve USDC, then chip in
            </h2>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted">
          <span>Status: {status}</span>
          <span>
            Raised: {formatUsdc(raisedAmount)} / {formatUsdc(goalAmount)} USDC
          </span>
        </div>

        {canContribute ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto_auto]">
            <label className="block">
              <span className="text-sm font-semibold">Contribution amount</span>
              <input
                value={contributionInput}
                onChange={(event) => setContributionInput(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-base"
                placeholder="20"
              />
            </label>
            <button
              onClick={handleApprove}
              disabled={!isConnected || expectedAmount <= 0n || isWriting || isSwitching}
              className="self-end rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold disabled:opacity-50"
            >
              {hasAllowance ? "Approved" : "Approve USDC"}
            </button>
            <button
              onClick={handleContribute}
              disabled={
                !isConnected || !hasAllowance || !hasEnoughBalance || isWriting || isSwitching
              }
              className="self-end rounded-full bg-base px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              Contribute now
            </button>
          </div>
        ) : null}`r`n        <div className="mt-5 flex flex-wrap gap-4 text-sm text-muted">`r`n          <span>Balance: {formatUsdc(balance ?? 0n)} USDC</span>`r`n          <span>Your refundable amount: {formatUsdc(contribution ?? 0n)} USDC</span>`r`n        </div>

        {targetChain.id === 31337 && (!hasEnoughBalance || balance === 0n) ? (
          <button
            onClick={handleMint}
            disabled={!isConnected || isWriting || isSwitching}
            className="mt-5 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            Mint 500 mock USDC
          </button>
        ) : null}

        {error ? <p className="mt-4 text-sm font-medium text-rose-600">{error}</p> : null}
        {message ? <p className="mt-4 text-sm font-medium text-base">{message}</p> : null}
      </section>

      <section className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-panel sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              Organizer actions
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Finalize a success or open refunds
            </h2>
          </div>
          <div className="text-sm text-muted">Organizer: {shortAddress(organizerAddress)}</div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={handleFinalize}
            disabled={!isOrganizer || status !== "FUNDED" || isWriting || isSwitching}
            className="rounded-full bg-base px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            Finalize payout
          </button>
          <button
            onClick={handleCancel}
            disabled={
              !isOrganizer ||
              !["ACTIVE", "FUNDED"].includes(status) ||
              isWriting ||
              isSwitching
            }
            className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold disabled:opacity-50"
          >
            Cancel pot
          </button>
          <button
            onClick={handleRefund}
            disabled={
              !isConnected ||
              status !== "REFUNDABLE" ||
              (contribution ?? 0n) === 0n ||
              isWriting ||
              isSwitching
            }
            className="rounded-full border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-700 disabled:opacity-50"
          >
            Claim refund
          </button>
        </div>
      </section>
    </div>
  );
}









