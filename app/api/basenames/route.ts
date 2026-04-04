import { NextResponse } from "next/server";
import { z } from "zod";

import { getBasename } from "@/lib/basenames";

const querySchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    address: url.searchParams.get("address"),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid address." }, { status: 400 });
  }

  const basename = await getBasename(parsed.data.address);
  return NextResponse.json({ basename });
}
