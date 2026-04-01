import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

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


export async function PATCH(req: NextRequest, context: Context) {
  try {
     const { id } = await context.params;
    const body = await req.json();

    const {
      prices,
      stock,
      categoryIds,
      type,
      images,
      youtubeVideos,
      variants,
      addons,
      translations,
      similarProductIds,
      maxOrderQuantity,
    } = body;

    // ---- VALIDATION (same logic as POST) ----
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

    // ---- NORMALIZATION ----
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
      // ---- UPDATE PRODUCT ----
      const updatedProduct = await tx.product.update({
        where: { id },
        data: {
          buyingPrice: normalizedBuyingPrice,
          regularPrice: Number(prices.regularPrice),
          promoPrice: prices.promoPrice,
          regularPriceText: prices.regularPriceText,
          promoPriceText: prices.promoPriceText,

          stock: normalizedStock,
          minimumStock: normalizedMinimumStock,

          type,
          images,
          similarProducts: similarProductIds,
          maxOrderQuantity,

          // ✅ categories (replace)
          categories: {
            set: categoryIds.map((id: any) => ({ id })),
          },
        },
      });

      // ---- TRANSLATIONS (replace) ----
      await tx.productTranslation.deleteMany({
        where: { productId: id },
      });

      await tx.productTranslation.createMany({
        data: validTranslations.map((t: any) => ({
          productId: id,
          language: t.language,
          name: t.name,
          description: t.description || null,
        })),
      });

      // ---- YOUTUBE VIDEOS (replace) ----
      await tx.productYouTubeVideo.deleteMany({
        where: { productId: id },
      });

      if (youtubeVideos?.length) {
        await tx.productYouTubeVideo.createMany({
          data: youtubeVideos.map((u: any) => ({
            productId: id,
            title: u.title,
            url: u.url,
          })),
        });
      }

      // ---- VARIANTS (replace) ----
      await tx.productVariant.deleteMany({
        where: { productId: id },
      });

      if (normalizedVariants.length > 0) {
        await tx.productVariant.createMany({
          data: normalizedVariants.map((v: any) => ({
            ...v,
            productId: id,
          })),
        });
      }

      // ---- ADDONS (replace) ----
      await tx.productAddon.deleteMany({
        where: { mainProductId: id },
      });

      if (addons?.length) {
        await tx.productAddon.createMany({
          data: addons.map((a: any) => ({
            mainProductId: id,
            addonProductId: a.addonProductId,
            required: a.required || false,
          })),
        });
      }

      // ---- STOCK OPERATION (optional but recommended) ----
      if (normalizedStock > 0) {
        await tx.operation.create({
          data: {
            productId: id,
            quantity: normalizedStock,
            type: "IN",
            price: normalizedBuyingPrice * normalizedStock,
            stock: normalizedStock,
            reason: "Stock updated via product edit",
          },
        });
      }

      return updatedProduct;
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
