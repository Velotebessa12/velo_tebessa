import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { error: "ProductId is required !" },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        translations: true,
        addonsAsMain: {
          include: {
            addonProduct: {
              include: {
                translations: true,
              },
            },
          },
        },
        variants: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Fetch active discounts
    const discounts = await prisma.discount.findMany({
      where: {
        isActive: true,
        OR: [{ startsAt: null }, { startsAt: { lte: new Date() } }],
        AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: new Date() } }] }],
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
          const excludedProduct = discount.excludedProducts.find(
            (p: any) => p.productId === product.id
          );

          const excludedCategory = discount.excludedCategories.find(
            (c: any) => c.categoryId === product.categoryId
          );

          if (excludedProduct || excludedCategory) continue;

          if (discount.type === "PERCENTAGE") {
            let amount = finalPrice * (discount.value / 100);

            if (discount.maxDiscount) {
              amount = Math.min(amount, discount.maxDiscount);
            }

            finalPrice = finalPrice - amount;
          }

          if (discount.type === "FIXED") {
            finalPrice = finalPrice - discount.value;
          }

          appliedDiscount = discount;
          break;
        }
      }

      return {
        ...item,
        finalPrice,
        discount: appliedDiscount,
      };
    };

    const productWithPrice = applyDiscount(product);

    const variantsWithPrice = product.variants.map((variant: any) =>
      applyDiscount(variant)
    );

    return NextResponse.json({
      product: {
        ...productWithPrice,
        variants: variantsWithPrice,
      },
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}