import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function parseCSV(text: string): string[][] {
  return text
    .split("\n")
    .map(r =>
      r
        .split(",")
        .map(c => c.replace(/^"|"$/g, "").replace(/""/g, '"').trim()),
    )
    .filter(r => r.length > 1);
}

function num(v?: string) {
  const n = Number(v);
  return isNaN(n) ? null : n;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return new NextResponse("CSV file required", { status: 400 });

    const text = await file.text();
    const rows = parseCSV(text);
    rows.shift(); // remove header

    const productMap = new Map<string, string>();

    /* ============================
       PASS 1 — PRODUCTS
    ============================ */
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

        regularPrice,
        promoPrice,
        regularPriceText,
        promoPriceText,
        buyingPrice,

        stock,
        lowStock,

        ,
        categoryName,
        images,

        isActive,
        youtubeUrl,
      ] = row;

      if (type === "variation") continue;

      let categoryId: string | undefined;

      if (categoryName) {
        const slug = categoryName.toLowerCase().replace(/\s+/g, "-");

        const category = await prisma.category.upsert({
          where: { slug },
          update: {},
          create: {
            slug,
            translations: {
              create: [
                { language: "ar", name: categoryName },
                { language: "fr", name: categoryName },
                { language: "en", name: categoryName },
              ],
            },
          },
        });

        categoryId = category.id;
      }

      const product = await prisma.product.create({
        data: {
          type: "PRODUCT",
          isActive: isActive === "1",

          buyingPrice: num(buyingPrice),
          regularPrice: num(regularPrice),
          promoPrice: num(promoPrice),
          regularPriceText: regularPriceText || null,
          promoPriceText: promoPriceText || null,

          stock: num(stock),
          minimumStock: num(lowStock),

          images: images ? images.split("|") : [],
          youtubeVideoUrl: youtubeUrl || null,

          categoryId,

          translations: {
            create: [
              nameAr && { language: "ar", name: nameAr, description: descAr },
              nameFr && { language: "fr", name: nameFr, description: descFr },
              nameEn && { language: "en", name: nameEn, description: descEn },
            ].filter(Boolean) as any,
          },
        },
      });

      productMap.set(csvId, product.id);
    }

    /* ============================
       PASS 2 — VARIANTS
    ============================ */
    for (const row of rows) {
      const [
        ,
        type,
        parent,

        ,
        ,
        ,
        ,
        ,
        ,

        regularPrice,
        promoPrice,
        ,
        priceText,
        buyingPrice,

        stock,
        lowStock,

        ,
        ,
        imageUrl,
        isActive,
      ] = row;

      if (type !== "variation") continue;

      const parentId = productMap.get(parent);
      if (!parentId) continue;

      await prisma.productVariant.create({
        data: {
          productId: parentId,

          buyingPrice: num(buyingPrice),
          regularPrice: num(regularPrice),
          promoPrice: num(promoPrice),
          priceText: priceText || null,

          stock: num(stock) ?? 0,
          minimumStock: num(lowStock) ?? 3,

          imageUrl: imageUrl || null,
          isActive: isActive === "1",
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return new NextResponse("Import failed", { status: 500 });
  }
}