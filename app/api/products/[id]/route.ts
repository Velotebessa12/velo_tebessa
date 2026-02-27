import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Context = {
  params: Promise<{ id: string }>;
};

// GET /api/products/:id
export async function GET(req: Request, context: Context) {
  const { id } = await context.params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      translations: true,
      variants: true,
    },
  });

  if (!product) {
    return NextResponse.json(
      { error: "Product not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(product);
}

// PATCH /api/products/:id


export async function PATCH(req: Request, context: Context) {
  try {
    const { id } = await context.params
    const payload = await req.json()

    const {
      prices,
      stock,
      images,
      similarProductIds,
      youtubeVideoUrls,
      variants,
      addons,
      translations,
      categoryId,
      type,
    } = payload

    const product = await prisma.$transaction(async (tx) => {
      /* ───────── PRODUCT CORE UPDATE ───────── */
      const updatedProduct = await tx.product.update({
        where: { id },
        data: {
          // prices
          buyingPrice:
            prices?.buyingPrice !== undefined
              ? Number(prices.buyingPrice)
              : null,

          regularPrice:
            prices?.regularPrice !== undefined
              ? Number(prices.regularPrice)
              : null,

          promoPrice:
            prices?.promoPrice !== undefined
              ? Number(prices.promoPrice)
              : null,

          regularPriceText: prices?.regularPriceText ?? null,
          promoPriceText: prices?.promoPriceText ?? null,

          // stock  ✅ FIX IS HERE
          stock:
            stock?.stock !== undefined
              ? Number(stock.stock)
              : null,

          minimumStock:
            stock?.minimumStock !== undefined
              ? Number(stock.minimumStock)
              : null,

          images: images ?? [],
          similarProducts: similarProductIds ?? [],
          youtubeVideoUrls: youtubeVideoUrls ?? [],

          categoryId: categoryId ?? null,
          type,
        },
      })

      /* ───────── TRANSLATIONS ───────── */
      if (Array.isArray(translations)) {
        await tx.productTranslation.deleteMany({
          where: { productId: id },
        })

        await tx.productTranslation.createMany({
          data: translations.map((t: any) => ({
            productId: id,
            language: t.language,
            name: t.name,
            description: t.description ?? null,
          })),
        })
      }

      /* ───────── VARIANTS ───────── */
      if (Array.isArray(variants)) {
        await tx.productVariant.deleteMany({
          where: { productId: id },
        })

        await tx.productVariant.createMany({
          data: variants.map((v: any) => ({
            productId: id,
            color: v.color ?? null,
            attribute: v.attribute ?? null,

            buyingPrice:
              v.buyingPrice !== undefined
                ? Number(v.buyingPrice)
                : null,

            regularPrice:
              v.regularPrice !== undefined
                ? Number(v.regularPrice)
                : null,

            promoPrice:
              v.promoPrice !== undefined
                ? Number(v.promoPrice)
                : null,

            priceText: v.priceText ?? null,

            stock: Number(v.stock ?? 0),
            minimumStock: Number(v.minimumStock ?? 3),

            imageUrl: v.imageUrl ?? null,
            isActive: v.isActive ?? true,
          })),
        })
      }

      /* ───────── ADDONS ───────── */
      if (Array.isArray(addons)) {
        await tx.productAddon.deleteMany({
          where: { mainProductId: id },
        })

        await tx.productAddon.createMany({
          data: addons.map((a: any) => ({
            mainProductId: id,
            addonProductId: a.addonProductId,
            required: a.required ?? false,
          })),
        })
      }

      return updatedProduct
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE /api/products/:id (SAFE)
export async function DELETE(req: Request, context: Context) {
  const { id } = await context.params;

  // 1️⃣ Block if product has orders
  const orderCount = await prisma.orderItem.count({
    where: { productId: id },
  });

  if (orderCount > 0) {
    return NextResponse.json(
      {
        error:
          "This product cannot be deactivated because it has associated orders.",
      },
      { status: 409 }
    );
  }

  // 2️⃣ Soft delete instead of hard delete
  await prisma.product.update({
    where: { id },
    data: { isActive: false },
  });

  return NextResponse.json({
    success: true,
    message: "Product deactivated successfully",
  });
}
