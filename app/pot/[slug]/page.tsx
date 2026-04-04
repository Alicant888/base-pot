import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PotBottomBar } from "@/components/pot-bottom-bar";
import { PotClientIsland } from "@/components/pot-client-island";
import { PotCreatedNotice } from "@/components/pot-created-notice";
import { PotOverview, PotSidebarStatic } from "@/components/pot-static-sections";
import { getOnchainPotActivity } from "@/lib/onchain-activity";
import { getOnchainPot } from "@/lib/onchain-pot";
import { getPotBySlug } from "@/lib/pots";

type PotPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    created?: string;
  }>;
};

export async function generateMetadata({ params }: PotPageProps): Promise<Metadata> {
  const { slug } = await params;
  const pot = await getPotBySlug(slug);

  if (!pot) {
    return {
      title: "Pot not found | Base Pot",
    };
  }

  return {
    title: `${pot.title} | Base Pot`,
    description: pot.description,
  };
}

export default async function PotPage({ params, searchParams }: PotPageProps) {
  const [{ slug }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const pot = await getPotBySlug(slug);

  if (!pot) {
    notFound();
  }

  const [onchainPot, activity] = await Promise.all([
    getOnchainPot(pot.onchainPotId),
    getOnchainPotActivity(pot.onchainPotId),
  ]);

  const staticPot = {
    onchainPotId: pot.onchainPotId,
    title: pot.title,
    description: pot.description,
    goalAmount: pot.goalAmount,
    deadline: pot.deadline.toISOString(),
    recipientAddress: pot.recipientAddress,
    organizerAddress: pot.organizerAddress,
    emoji: pot.emoji,
  };

  const showCreatedNotice = resolvedSearchParams.created === "1";

  return (
    <>
      <div className="space-y-6 pb-36 xl:pb-40">
        {showCreatedNotice ? <PotCreatedNotice slug={slug} title={pot.title} /> : null}

        <div className="grid gap-8 xl:grid-cols-[1.25fr_0.75fr]">
          <div className="space-y-6">
            <PotOverview pot={staticPot} onchainPot={onchainPot} activity={activity} />
          </div>

          <div className="space-y-6">
            <PotClientIsland
              pot={{
                onchainPotId: pot.onchainPotId,
                goalAmount: pot.goalAmount,
                organizerAddress: pot.organizerAddress,
                suggestedContribution: pot.suggestedContribution,
              }}
            />
            <PotSidebarStatic pot={staticPot} onchainPot={onchainPot} activity={activity} />
          </div>
        </div>
      </div>

      <PotBottomBar slug={slug} title={pot.title} />
    </>
  );
}
