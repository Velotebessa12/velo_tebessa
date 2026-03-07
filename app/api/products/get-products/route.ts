import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const slug = searchParams.get("slug");
    const searchQuery = searchParams.get("query");
    const price = searchParams.get("price");
    const sort = searchParams.get("sort");
    const type = searchParams.get("type") || "PRODUCT";

    let categoryId: string | undefined = undefined;

    // Find category from slug
    if (slug) {
      const category = await prisma.category.findUnique({
        where: { slug },
      });

      if (!category) {
        return NextResponse.json({ products: [] });
      }

      categoryId = category.id;
    }

    const where: any = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (searchQuery) {
      where.translations = {
        some: {
          name: {
            contains: searchQuery,
            mode: "insensitive",
          },
        },
      };
    }

    if (price) {
      where.regularPrice = {
        lte: Number(price),
      };
    }

    let orderBy: any = { createdAt: "desc" };

    if (sort) {
      switch (sort) {
        case "price_asc":
          orderBy = { regularPrice: "asc" };
          break;

        case "price_desc":
          orderBy = { regularPrice: "desc" };
          break;

        case "name_asc":
          orderBy = {
            translations: {
              _min: { name: "asc" },
            },
          };
          break;

        case "name_desc":
          orderBy = {
            translations: {
              _max: { name: "desc" },
            },
          };
          break;

        case "newest":
          orderBy = { createdAt: "desc" };
          break;

        case "oldest":
          orderBy = { createdAt: "asc" };
          break;
      }
    }

    const products = await prisma.product.findMany({
      where: {
        ...where,
        type,
        isActive: true,
      },
      orderBy,
      include: {
        translations: true,
      },
    });

    // Fetch active discounts
    const discounts = await prisma.discount.findMany({
      where: {
        isActive: true,
        OR: [
          { startsAt: null },
          { startsAt: { lte: new Date() } }
        ],
        AND: [
          {
            OR: [
              { endsAt: null },
              { endsAt: { gte: new Date() } }
            ]
          }
        ]
      },
      include: {
        excludedProducts: true,
        excludedCategories: true
      }
    });

    // Calculate final price
    const productsWithPrice = products.map((product: any) => {
      let finalPrice = product.promoPrice ?? product.regularPrice;
      let appliedDiscount = null;

      // If promo exists → ignore discounts
      if (!product.promoPrice) {
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
        ...product,
        finalPrice,
        discount: appliedDiscount
      };
    });

    return NextResponse.json({ products: productsWithPrice });

  } catch (error) {
    console.error("Get products error:", error);

    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}