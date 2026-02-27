import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json()

    const {
      prices,
      stock,
      images,
      translations,
      addons = [],
    } = payload

    /* ───────── VALIDATION ───────── */
    if (
      !prices ||
      prices.regularPrice === undefined ||
      !stock ||
      stock.stock === undefined ||
      !Array.isArray(images) ||
      images.length === 0
    ) {
      return NextResponse.json(
        { error: "Missing or invalid required fields" },
        { status: 400 }
      )
    }

    const cleanTranslations = (translations || []).filter(
      (t: any) => t.name && t.name.trim() !== ""
    )

    if (!cleanTranslations.length) {
      return NextResponse.json(
        { error: "At least one translation is required" },
        { status: 400 }
      )
    }

    /* ───────── CREATE ADDITION PRODUCT ───────── */
    const product = await prisma.product.create({
      data: {
        // prices
        buyingPrice:
          prices.buyingPrice !== undefined
            ? Number(prices.buyingPrice)
            : null,

        regularPrice: Number(prices.regularPrice),

        promoPrice:
          prices.promoPrice !== null && prices.promoPrice !== undefined
            ? Number(prices.promoPrice)
            : null,

        regularPriceText: prices.regularPriceText ?? null,
        promoPriceText: prices.promoPriceText ?? null,

        // stock
        stock: Number(stock.stock),
        minimumStock:
          stock.minimumStock !== undefined
            ? Number(stock.minimumStock)
            : null,

        images,
        type: "ADDITION",

        translations: {
          create: cleanTranslations.map((t: any) => ({
            language: t.language,
            name: t.name,
          })),
        },

        addonsAsMain: {
          create: addons.map((a: any) => ({
            addonProductId: a.addonProductId,
            required: a.required ?? false,
          })),
        },
      },

      include: {
        translations: true,
        addonsAsMain: true,
      },
    })

    return NextResponse.json({ product })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}