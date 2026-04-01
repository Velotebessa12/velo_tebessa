import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        categories: {
          include: { translations: true },
        },
        translations: true,
        variants: true,
        youtubeVideos: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const headers = [
      "ID",
      "Type",
      "Parent ID",

      "Name (ar)",
      "Description (ar)",
      "Name (fr)",
      "Description (fr)",
      "Name (en)",
      "Description (en)",

      "Buying price",
      "Regular price",
      "Promo price",
      "Regular price text",
      "Promo price text",

      "Stock",
      "Minimum stock",

      "Images",
      "Category IDs",
      "Is active",

      "YouTube URLs",
      "Similar Product IDs",

      "Max Order Quantity",
      "Created at",
    ];

    const rows: string[] = [];

    for (const product of products) {
      const ar = t(product.translations, "ar");
      const fr = t(product.translations, "fr");
      const en = t(product.translations, "en");

      const images = product.images.join("|");

      // ✅ FIXED youtubeVideos relation
      const youtubeUrls = product.youtubeVideos
        .map((y) => y.url)
        .join("|");

      const similarIds = (product.similarProducts || []).join("|");

      // ✅ categories array
      const categoryIds = product.categories.map((c) => c.id).join("|");

      const hasVariants = product.variants.length > 0;

      let wcType: string;
      if (product.type === "ADDITION") {
        wcType = "addition";
      } else if (hasVariants) {
        wcType = "variable";
      } else {
        wcType = "simple";
      }

      /* ============================
         PARENT PRODUCT
      ============================ */
      rows.push(
        [
          product.id,
          wcType,
          "",

          q(ar?.name),
          q(ar?.description),
          q(fr?.name),
          q(fr?.description),
          q(en?.name),
          q(en?.description),

          hasVariants ? "" : product.buyingPrice ?? "",
          hasVariants ? "" : product.regularPrice ?? "",
          hasVariants ? "" : product.promoPrice ?? "",
          hasVariants ? "" : q(product.regularPriceText),
          hasVariants ? "" : q(product.promoPriceText),

          hasVariants ? "" : product.stock ?? "",
          hasVariants ? "" : product.minimumStock ?? "",

          q(images),
          q(categoryIds),
          product.isActive,

          q(youtubeUrls),
          q(similarIds),

          product.maxOrderQuantity ?? "",
          product.createdAt.toISOString(),
        ].join(",")
      );

      /* ============================
         VARIANTS
      ============================ */
      for (const v of product.variants) {
        rows.push(
          [
            v.id,
            "variation",
            product.id,

            "", "", "", "", "", "",

            v.buyingPrice ?? "",
            v.regularPrice ?? "",
            v.promoPrice ?? "",
            "",
            q(v.priceText),

            v.stock ?? "",
            v.minimumStock ?? "",

            q(v.imageUrl),
            q(categoryIds),
            v.isActive,

            "",
            "",

            "",
            v.createdAt.toISOString(),
          ].join(",")
        );
      }
    }

    const csv = [headers.join(","), ...rows].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="products-export.csv"`,
      },
    });
  } catch (e) {
    console.error(e);
    return new NextResponse("Export failed", { status: 500 });
  }
}

/* ---------------- HELPERS ---------------- */

function t(
  translations: { language: string; name: string; description?: string | null }[],
  lang: string
) {
  return translations.find((x) => x.language === lang);
}

function q(v: string | null | undefined): string {
  if (!v) return '""';
  return `"${v.replace(/"/g, '""')}"`;
}