import { NextResponse } from "next/server";

import { createPotMetadata } from "@/lib/pots";
import { createPotMetadataSchema } from "@/lib/validation/pot";

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = createPotMetadataSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid pot payload." },
      { status: 400 },
    );
  }

  try {
    const pot = await createPotMetadata(parsed.data);
    return NextResponse.json({ pot }, { status: 201 });
  } catch (caught) {
    const message =
      caught instanceof Error ? caught.message : "Failed to store the pot metadata.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
