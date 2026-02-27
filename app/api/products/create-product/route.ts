import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      prices,
      stock,
      categoryId,
      type,
      images,
      youtubeVideoUrls,
      variants,
      addons,
      translations,
     similarProductIds
    } = body;

    // ---- VALIDATION ----
    if (!prices?.regularPrice || !stock?.stock || !images?.length) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const validTranslations = translations.filter(
      (t: any) => t.name && t.name.trim()
    );

    if (validTranslations.length === 0) {
      return NextResponse.json(
        { error: "At least one translation is required" },
        { status: 400 }
      );
    }

    // ---- NORMALIZE VARIANTS ----
    const normalizedVariants = (variants || []).map((v: any) => ({
      isActive: Boolean(v.isActive),
      stock: Number(v.stock ?? 0),
      buyingPrice: Number(v.buyingPrice),
      regularPrice: Number(v.regularPrice),
      promoPrice:
        v.promoPrice !== null && v.promoPrice !== undefined
          ? Number(v.promoPrice)
          : null,
      color: v.color || null,
      attribute: v.attribute || null,
      imageUrl: v.imageUrl || null,
    }));

    const normalizedStock = Number(stock?.stock ?? 0);
const normalizedMinimumStock = Number(stock?.minimumStock ?? 0);
const normalizedBuyingPrice = Number(prices?.buyingPrice ?? 0);

    const product = await prisma.$transaction(async (tx) => {
  const product = await tx.product.create({
    data: {
      buyingPrice: normalizedBuyingPrice,
      regularPrice: Number(prices.regularPrice),
      promoPrice: prices.promoPrice,
      regularPriceText: prices.regularPriceText,
      promoPriceText: prices.promoPriceText,

      stock: normalizedStock,
      minimumStock: normalizedMinimumStock,

      type,
      categoryId: categoryId || undefined,

      similarProducts: similarProductIds,
      images,
      youtubeVideoUrls: youtubeVideoUrls ?? [],

      translations: {
        create: validTranslations.map((t: any) => ({
          language: t.language,
          name: t.name,
          description: t.description || null,
        })),
      },

      addonsAsMain: {
        create: (addons || []).map((a: any) => ({
          addonProductId: a.addonProductId,
          required: a.required || false,
        })),
      },
    },
  });

  // ✅ Variants
  if (normalizedVariants.length > 0) {
    await tx.productVariant.createMany({
      data: normalizedVariants.map((v : any) => ({
        ...v,
        productId: product.id,
      })),
    });
  }

  // ✅ Inventory operation (FIXED)
  if (normalizedStock > 0) {
    await tx.operation.create({
      data: {
        productId: product.id,
        quantity: normalizedStock, // ✅ Int
        type: "IN",
        price: normalizedBuyingPrice * normalizedStock, // ✅ number
        stock: normalizedStock, // ✅ Int
        reason: "Initial stock on product creation",
      },
    });
  }

  return product;
});

    return NextResponse.json({ product });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}