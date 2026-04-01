import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const slug = searchParams.get("slug");

    const now = new Date();

    // ✅ fetch discounts once
    const discounts = await prisma.discount.findMany({
      where: {
        isActive: true,
        AND: [
          { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
          { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
        ],
      },
      include: {
        excludedProducts: true,
        excludedCategories: true,
      },
    });

    const applyDiscount = (item: any) => {
      let finalPrice = item.promoPrice ?? item.regularPrice;
      let appliedDiscount = null;

      if (!item.promoPrice) {
        for (const discount of discounts) {
          const isExcludedProduct = discount.excludedProducts.some(
            (p: any) => p.productId === item.id
          );

          const isExcludedCategory = discount.excludedCategories.some(
            (c: any) => c.categoryId === item.categoryId
          );

          if (isExcludedProduct || isExcludedCategory) continue;

          if (discount.type === "PERCENTAGE") {
            let amount = finalPrice * (discount.value / 100);

            if (discount.maxDiscount) {
              amount = Math.min(amount, discount.maxDiscount);
            }

            finalPrice -= amount;
          } else if (discount.type === "FIXED") {
            finalPrice -= discount.value;
          }

          appliedDiscount = discount;
          break;
        }
      }

      return {
        ...item,
        finalPrice: Math.max(0, finalPrice),
        discount: appliedDiscount,
      };
    };

    let products: any[] = [];

    // ─────────────────────────────────────────────
    // 1️⃣ CASE: productId → similarProducts
    // ─────────────────────────────────────────────
    if (productId) {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { similarProducts: true },
      });

      if (product?.similarProducts?.length) {
        products = await prisma.product.findMany({
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
      }
    }

    // ─────────────────────────────────────────────
    // 2️⃣ FALLBACK: category slug
    // ─────────────────────────────────────────────
    if (!products.length && slug) {
      const category = await prisma.category.findUnique({
        where: { slug },
        select: { id: true },
      });

      if (category) {
        products = await prisma.product.findMany({
          where: {
            categories: {
    some: {
      id: category.id,
    },
  },
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
      }
    }

    // ✅ APPLY DISCOUNTS HERE
    const productsWithPrices = products.map((p) => applyDiscount(p));

    return NextResponse.json({ products: productsWithPrices });

  } catch (error) {
    console.error("Get similar products error:", error);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}