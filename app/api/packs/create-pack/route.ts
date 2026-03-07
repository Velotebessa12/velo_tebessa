import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      translations,
      imageUrl,
      regularPrice,
      promoPrice,
      regularPriceText,
      promoPriceText,
    } = body;

    if (!regularPrice || !translations?.length) {
      return NextResponse.json(
        { error: "regularPrice and at least one translation are required" },
        { status: 400 }
      );
    }

    const pack = await prisma.pack.create({
      data: {
        imageUrl:         imageUrl ?? null,
        regularPrice:     parseFloat(regularPrice),
        promoPrice:       promoPrice ? parseFloat(promoPrice) : null,
        regularPriceText: regularPriceText ?? null,
        promoPriceText:   promoPriceText ?? null,
        translations: {
          create: translations.map((t: { language: string; name: string; description?: string }) => ({
            language:    t.language,
            name:        t.name,
            description: t.description ?? null,
          })),
        },
      },
      include: {
        translations: true,
      },
    });

    return NextResponse.json(pack, { status: 201 });
  } catch (err) {
    console.error("[POST /api/packs/create]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}