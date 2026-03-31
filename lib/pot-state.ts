export type PotStatus =
  | "ACTIVE"
  | "FUNDED"
  | "FINALIZED"
  | "CANCELLED"
  | "EXPIRED"
  | "REFUNDABLE";

export type PotTuple = readonly [
  organizer: `0x${string}`,
  recipient: `0x${string}`,
  goalAmount: bigint,
  raisedAmount: bigint,
  deadline: bigint,
  cancelled: boolean,
  finalized: boolean,
];

export function derivePotStatus(pot: PotTuple | undefined) {
  if (!pot) {
    return "ACTIVE" as const;
  }

  const [, , goalAmount, raisedAmount, deadline, cancelled, finalized] = pot;
  const now = Math.floor(Date.now() / 1000);

  if (finalized) {
    return "FINALIZED" as const;
  }

  if (cancelled) {
    return raisedAmount > 0n ? ("REFUNDABLE" as const) : ("CANCELLED" as const);
  }

  if (now >= Number(deadline) && raisedAmount < goalAmount) {
    return raisedAmount > 0n ? ("REFUNDABLE" as const) : ("EXPIRED" as const);
  }

  if (raisedAmount >= goalAmount) {
    return "FUNDED" as const;
  }

  return "ACTIVE" as const;
}
