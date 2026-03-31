import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error: "Pot activity is now derived from onchain events.",
    },
    { status: 410 },
  );
}
