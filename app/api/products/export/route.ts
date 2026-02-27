import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: {
          include: { translations: true },
        },
        translations: true,
        variants: true,
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
      "Category ID",
      "Is active",
      "YouTube URLs",
      "Similar Product IDs",
      "Created at",
    ];

    const rows: string[] = [];

    for (const product of products) {
      const ar = t(product.translations, "ar");
      const fr = t(product.translations, "fr");
      const en = t(product.translations, "en");

      const images = product.images.join("|");
      const youtubeUrls = product.youtubeVideoUrls.join("|");
      const similarIds = product.similarProducts.join("|");

      const hasVariants = product.variants.length > 0;
      const wcType = hasVariants ? "variable" : "simple";

      /* ============================
         SIMPLE / VARIABLE (parent)
      ============================ */
      rows.push(
        [
          product.id,
          wcType,
          "",                               // no parent
          q(ar?.name ?? ""),
          q(ar?.description ?? ""),
          q(fr?.name ?? ""),
          q(fr?.description ?? ""),
          q(en?.name ?? ""),
          q(en?.description ?? ""),
          hasVariants ? "" : (product.buyingPrice ?? ""),
          hasVariants ? "" : (product.regularPrice ?? ""),
          hasVariants ? "" : (product.promoPrice ?? ""),
          hasVariants ? "" : q(product.regularPriceText ?? ""),
          hasVariants ? "" : q(product.promoPriceText ?? ""),
          hasVariants ? "" : (product.stock ?? ""),
          hasVariants ? "" : (product.minimumStock ?? ""),
          q(images),
          product.categoryId ?? "",
          product.isActive,
          q(youtubeUrls),
          q(similarIds),
          product.createdAt.toISOString(),
        ].join(","),
      );

      /* ============================
         VARIATIONS
      ============================ */
      for (const v of product.variants) {
        rows.push(
          [
            v.id,
            "variation",
            product.id,                     // parent
            "", "", "", "", "", "",          // no translations on variants
            v.buyingPrice ?? "",
            v.regularPrice ?? "",
            v.promoPrice ?? "",
            "",                             // no regularPriceText on variants
            q(v.priceText ?? ""),
            v.stock ?? "",
            v.minimumStock ?? "",
            q(v.imageUrl ?? ""),
            product.categoryId ?? "",       // inherit from parent
            v.isActive,
            "", "",                         // no youtube/similar on variants
            v.createdAt.toISOString(),
          ].join(","),
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

function t(translations: { language: string; name: string; description?: string | null }[], lang: string) {
  return translations.find(x => x.language === lang);
}

function q(v: string | null | undefined): string {
  if (!v) return '""';
  return `"${v.replace(/"/g, '""')}"`;
}