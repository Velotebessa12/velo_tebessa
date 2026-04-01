import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parse } from "csv-parse/sync";

/* =========================
   Helpers
========================= */

function parseCSV(text: string): string[][] {
  return parse(text, {
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true,
    trim: true,
  });
}

function num(v?: string) {
  const n = Number(v);
  return v === "" || v === undefined || Number.isNaN(n) ? null : n;
}

/* =========================
   POST /api/products/import
========================= */

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new NextResponse("CSV file required", { status: 400 });
    }

    const text = await file.text();
    const rows = parseCSV(text);

    rows.shift(); // remove header

    const productMap = new Map<string, string>();

    /* =========================
       PASS 1 — PRODUCTS
    ========================= */

    for (const row of rows) {
      const [
        csvId,
        type,
        ,
        nameAr,
        descAr,
        nameFr,
        descFr,
        nameEn,
        descEn,
        buyingPrice,
        regularPrice,
        promoPrice,
        regularPriceText,
        promoPriceText,
        stock,
        minimumStock,
        images,
        categoryIds, // ✅ updated
        isActive,
        youtubeUrls,
        similarIds,
        maxOrderQuantity,
        createdAt,
      ] = row;

      if (type === "variation") continue;

      const normalizedStock = Number(stock ?? 0);
      const normalizedBuyingPrice = Number(buyingPrice ?? 0);

      const product = await prisma.product.create({
        data: {
          type: type === "addition" ? "ADDITION" : "PRODUCT",
          isActive: isActive === "true",

          buyingPrice: num(buyingPrice),
          regularPrice: num(regularPrice),
          promoPrice: num(promoPrice),
          regularPriceText: regularPriceText || null,
          promoPriceText: promoPriceText || null,

          stock: normalizedStock,
          minimumStock: num(minimumStock),

          images: images ? images.split("|").filter(Boolean) : [],

          // ✅ categories relation
          categories: categoryIds
            ? {
                connect: categoryIds
                  .split("|")
                  .filter(Boolean)
                  .map((id) => ({ id })),
              }
            : undefined,

          // ✅ youtubeVideos relation
          youtubeVideos: youtubeUrls
            ? {
                create: youtubeUrls
                  .split("|")
                  .filter(Boolean)
                  .map((url) => ({
                    title: "",
                    url,
                  })),
              }
            : undefined,

          similarProducts: similarIds
            ? similarIds.split("|").filter(Boolean)
            : [],

          maxOrderQuantity: num(maxOrderQuantity),

          ...(createdAt
            ? { createdAt: new Date(createdAt) }
            : {}),

          translations: {
            create: [
              nameAr
                ? { language: "ar", name: nameAr, description: descAr || null }
                : null,
              nameFr
                ? { language: "fr", name: nameFr, description: descFr || null }
                : null,
              nameEn
                ? { language: "en", name: nameEn, description: descEn || null }
                : null,
            ].filter(Boolean) as any,
          },
        },
      });

      // ✅ inventory operation
      if (normalizedStock > 0) {
        await prisma.operation.create({
          data: {
            productId: product.id,
            quantity: normalizedStock,
            type: "IN",
            price: normalizedBuyingPrice * normalizedStock,
            stock: normalizedStock,
            reason: "Initial stock via import",
          },
        });
      }

      if (csvId) {
        productMap.set(csvId, product.id);
      }
    }

    /* =========================
       PASS 2 — VARIANTS
    ========================= */

    for (const row of rows) {
      const [
        ,
        type,
        parentId,
        ,
        ,
        ,
        ,
        ,
        ,
        buyingPrice,
        regularPrice,
        promoPrice,
        ,
        priceText,
        stock,
        minimumStock,
        imageUrl,
        ,
        isActive,
      ] = row;

      if (type !== "variation") continue;

      const resolvedParentId =
        productMap.get(parentId) ?? parentId;

      if (!resolvedParentId) continue;

      const parentProduct = await prisma.product.findUnique({
        where: { id: resolvedParentId },
        select: { type: true },
      });

      if (!parentProduct || parentProduct.type !== "PRODUCT") continue;

      await prisma.productVariant.create({
        data: {
          productId: resolvedParentId,

          buyingPrice: num(buyingPrice),
          regularPrice: num(regularPrice),
          promoPrice: num(promoPrice),
          priceText: priceText || null,

          stock: num(stock) ?? 0,
          minimumStock: num(minimumStock) ?? 0,

          imageUrl: imageUrl || null,
          isActive: isActive === "true",
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return new NextResponse("Import failed", { status: 500 });
  }
}