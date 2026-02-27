import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const slug = searchParams.get("slug");

    // ─────────────────────────────────────────────
    // 1️⃣ CASE: productId → use similarProducts
    // ─────────────────────────────────────────────
    if (productId) {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: {
          similarProducts: true,
        },
      });

      if (product?.similarProducts?.length) {
        const products = await prisma.product.findMany({
          where: {
            id: {
              in: product.similarProducts,
              not: productId,
            },
            isActive: true,
            type: "PRODUCT",
          },
          include: {
            translations: true,
          },
          take: 8,
        });

        return NextResponse.json({ products });
      }
      // ⚠️ if no similarProducts → fallback to category
    }

    // ─────────────────────────────────────────────
    // 2️⃣ FALLBACK: category slug
    // ─────────────────────────────────────────────
    if (!slug) {
      return NextResponse.json({ products: [] });
    }

    const category = await prisma.category.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!category) {
      return NextResponse.json({ products: [] });
    }

    const products = await prisma.product.findMany({
      where: {
        categoryId: category.id,
        isActive: true,
        type: "PRODUCT",
        ...(productId && {
          id: { not: productId },
        }),
      },
      include: {
        translations: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 8,
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Get similar products error:", error);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}