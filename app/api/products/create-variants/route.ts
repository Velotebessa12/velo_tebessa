import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST( req: NextRequest) {
  try {
    const body = await req.json();
    const { variants } = body;

    if (!variants || !Array.isArray(variants)) {
      return NextResponse.json(
        { error: "Variants array is required" },
        { status: 400 }
      );
    }

    const createdVariants = await prisma.productVariant.createMany({
      data: variants.map((v) => ({
        productId: params.productId,

        color: v.color || null,
        size: v.size || null,
        material: v.material || null,

        price: v.regularPrice,
        priceText: v.promoPrice || null,

        stock: v.manageStock ? v.quantity : 0,
        minimumStock: 3,

        images: v.image ? [v.image] : [],

        sku: v.sku || `SKU-${crypto.randomUUID()}`,
        isActive: v.status === "active",
      })),
    });

    // OPTIONAL: mark product as having variants
    await prisma.product.update({
      where: { id: params.productId },
      data: { hasVariants: true },
    });

    return NextResponse.json({ success: true, createdVariants });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create variants" },
      { status: 500 }
    );
  }
}
