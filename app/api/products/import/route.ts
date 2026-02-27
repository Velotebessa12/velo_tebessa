import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parse } from "csv-parse/sync";


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
  return isNaN(n) || v === "" ? null : n;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return new NextResponse("CSV file required", { status: 400 });

    const text = await file.text();
    const rows = parseCSV(text);
    rows.shift(); // remove header

    const productMap = new Map<string, string>(); // csvId → real db id

    /* ============================
       PASS 1 — PRODUCTS (simple + variable)
    ============================ */
    for (const row of rows) {
      const [
        csvId,        // 0  ID
        type,         // 1  Type
        ,             // 2  Parent ID (ignored in pass 1)
        nameAr,       // 3  Name (ar)
        descAr,       // 4  Description (ar)
        nameFr,       // 5  Name (fr)
        descFr,       // 6  Description (fr)
        nameEn,       // 7  Name (en)
        descEn,       // 8  Description (en)
        buyingPrice,  // 9  Buying price
        regularPrice, // 10 Regular price
        promoPrice,   // 11 Promo price
        regularPriceText, // 12 Regular price text
        promoPriceText,   // 13 Promo price text
        stock,        // 14 Stock
        minimumStock, // 15 Minimum stock
        images,       // 16 Images
        categoryId,   // 17 Category ID
        isActive,     // 18 Is active
        youtubeUrls,  // 19 YouTube URLs
        similarIds,   // 20 Similar Product IDs
        createdAt,    // 21 Created at
      ] = row;

      if (type === "variation") continue;

      const product = await prisma.product.create({
        data: {
          // ...(csvId ? { id: csvId } : {}),
          type: "PRODUCT",
          isActive: isActive === "true",

          buyingPrice: num(buyingPrice),
          regularPrice: num(regularPrice),
          promoPrice: num(promoPrice),
          regularPriceText: regularPriceText || null,
          promoPriceText: promoPriceText || null,

          stock: num(stock),
          minimumStock: num(minimumStock),

          images: images ? images.split("|").filter(Boolean) : [],
          youtubeVideoUrls: youtubeUrls ? youtubeUrls.split("|").filter(Boolean) : [],
          similarProducts: similarIds ? similarIds.split("|").filter(Boolean) : [],

          categoryId: categoryId || null,

          ...(createdAt ? { createdAt: new Date(createdAt) } : {}),

          translations: {
            create: [
              nameAr ? { language: "ar", name: nameAr, description: descAr || null } : null,
              nameFr ? { language: "fr", name: nameFr, description: descFr || null } : null,
              nameEn ? { language: "en", name: nameEn, description: descEn || null } : null,
            ].filter(Boolean) as any,
          },
        },
      });

      if (csvId) productMap.set(csvId, product.id);
    }

    /* ============================
       PASS 2 — VARIANTS (variation rows)
    ============================ */
    for (const row of rows) {
      const [
        ,             // 0  ID
        type,         // 1  Type
        parentId,     // 2  Parent ID
        ,             // 3  Name (ar)
        ,             // 4  Description (ar)
        ,             // 5  Name (fr)
        ,             // 6  Description (fr)
        ,             // 7  Name (en)
        ,             // 8  Description (en)
        buyingPrice,  // 9  Buying price
        regularPrice, // 10 Regular price
        promoPrice,   // 11 Promo price
        ,             // 12 Regular price text
        priceText,    // 13 Promo price text (mapped to variant's priceText)
        stock,        // 14 Stock
        minimumStock, // 15 Minimum stock
        imageUrl,     // 16 Images (single for variant)
        ,             // 17 Category ID (inherited, not stored on variant)
        isActive,     // 18 Is active
      ] = row;

      if (type !== "variation") continue;

      // resolve parent — could be a real UUID already in DB or a csvId we mapped
      const resolvedParentId = productMap.get(parentId) ?? parentId;
      if (!resolvedParentId) continue;

      await prisma.productVariant.create({
        data: {
          productId: resolvedParentId,

          buyingPrice: num(buyingPrice),
          regularPrice: num(regularPrice),
          promoPrice: num(promoPrice),
          priceText: priceText || null,

          stock: num(stock) ?? 0,
          minimumStock: num(minimumStock) ?? 3,

          imageUrl: imageUrl || null,
          isActive: isActive === "true",
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return new NextResponse("Import failed", { status: 500 });
  }
}