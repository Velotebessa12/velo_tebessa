import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const slug = searchParams.get("slug");
    const searchQuery = searchParams.get("query");
    const price = searchParams.get("price");
    const sort = searchParams.get("sort");

    let categoryId: string | undefined = undefined;

    // If slug provided → find category id
    if (slug) {
      const category = await prisma.category.findUnique({
        where: { slug },
      });

      if (!category) {
        return NextResponse.json({ products: [] });
      }

      categoryId = category.id;
    }

    // Build dynamic filters
    const where: any = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    // SEARCH BY NAME INSIDE TRANSLATIONS
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
      where.price = {
        lte: Number(price),
      };
    }

    // Build sorting logic
    let orderBy: any = { createdAt: "desc" }; // default sorting

    if (sort) {
      switch (sort) {
        case "price_asc":
          orderBy = { price: "asc" };
          break;

        case "price_desc":
          orderBy = { price: "desc" };
          break;

        case "name_asc":
          orderBy = {
            translations: {
              _min: {
                name: "asc",
              },
            },
          };
          break;

        case "name_desc":
          orderBy = {
            translations: {
              _max: {
                name: "desc",
              },
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
      where : {
        ...where,
        type : "PRODUCT",
        isActive : true
      },
      orderBy,
      include: {
        translations: true,
      },
    });

    return NextResponse.json({ products });

  } catch (error) {
    console.error("Get products error:", error);

    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}
