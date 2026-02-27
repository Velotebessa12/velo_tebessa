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

    // remove header
    rows.shift();

    // csvId -> real productId
    const productMap = new Map<string, string>();

    /* =========================
       PASS 1 — PRODUCTS
       (simple | variable | addition)
    ========================= */

    for (const row of rows) {
      const [
        csvId,               // 0
        type,                // 1
        ,                    // 2 parentId (ignored here)
        nameAr,              // 3
        descAr,              // 4
        nameFr,              // 5
        descFr,              // 6
        nameEn,              // 7
        descEn,              // 8
        buyingPrice,         // 9
        regularPrice,        // 10
        promoPrice,          // 11
        regularPriceText,    // 12
        promoPriceText,      // 13
        stock,               // 14
        minimumStock,        // 15
        images,              // 16
        categoryId,          // 17
        isActive,            // 18
        youtubeUrls,         // 19
        similarIds,          // 20
        createdAt,           // 21
      ] = row;

      // variations are handled in pass 2
      if (type === "variation") continue;

      const productType =
        type === "addition" ? "ADDITION" : "PRODUCT";

      const product = await prisma.product.create({
        data: {
          type: productType,
          isActive: isActive === "true",

          // ✅ Product keeps prices & stock ALWAYS
          buyingPrice: num(buyingPrice),
          regularPrice: num(regularPrice),
          promoPrice: num(promoPrice),
          regularPriceText: regularPriceText || null,
          promoPriceText: promoPriceText || null,

          stock: num(stock),
          minimumStock: num(minimumStock),

          images: images ? images.split("|").filter(Boolean) : [],
          youtubeVideoUrls: youtubeUrls
            ? youtubeUrls.split("|").filter(Boolean)
            : [],
          similarProducts: similarIds
            ? similarIds.split("|").filter(Boolean)
            : [],

          categoryId: categoryId || null,

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

      if (csvId) {
        productMap.set(csvId, product.id);
      }
    }

    /* =========================
       PASS 2 — VARIANTS
       (variation only)
    ========================= */

    for (const row of rows) {
      const [
        ,              // 0
        type,           // 1
        parentId,       // 2
        , , , , , ,     // 3–8 translations (ignored)
        buyingPrice,    // 9
        regularPrice,   // 10
        promoPrice,     // 11
        ,               // 12
        priceText,      // 13
        stock,           // 14 (ignored logically)
        minimumStock,   // 15
        imageUrl,       // 16
        ,               // 17
        isActive,       // 18
      ] = row;

      if (type !== "variation") continue;

      const resolvedParentId =
        productMap.get(parentId) ?? parentId;

      if (!resolvedParentId) continue;

     
      const parentProduct = await prisma.product.findUnique({
        where: { id: resolvedParentId },
        select: { type: true },
      });

      if (!parentProduct || parentProduct.type !== "PRODUCT") {
        continue;
      }

      await prisma.productVariant.create({
        data: {
          productId: resolvedParentId,

          buyingPrice: num(buyingPrice),
          regularPrice: num(regularPrice),
          promoPrice: num(promoPrice),
          priceText: priceText || null,

          // ⚠️ Variant stock is NOT the source of truth
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