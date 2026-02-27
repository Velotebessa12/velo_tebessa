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
      "Parent",

      "Name (ar)",
      "Description (ar)",
      "Name (fr)",
      "Description (fr)",
      "Name (en)",
      "Description (en)",

      "Regular price",
      "Sale price",
      "Regular price text",
      "Promo price text",
      "Buying price",

      "Stock",
      "Low stock amount",
      "Stock status",

      "Categories",
      "Images",

      "Is active",
      "YouTube video",

      "Created at",
      "Updated at",
    ];

    const rows: string[] = [];

    for (const product of products) {
      const ar = t(product.translations, "ar");
      const fr = t(product.translations, "fr");
      const en = t(product.translations, "en");

      const category =
        t(product.category?.translations ?? [], "fr")?.name ?? "";

      const images = product.images.join("|");

      /* ============================
         SIMPLE PRODUCT
      ============================ */
      if (product.variants.length === 0) {
        rows.push(
          [
            product.id,
            "simple",
            "",

            q(ar?.name ?? ""),
            q(ar?.description ?? ""),
            q(fr?.name ?? ""),
            q(fr?.description ?? ""),
            q(en?.name ?? ""),
            q(en?.description ?? ""),

            product.regularPrice ?? "",
            product.promoPrice ?? "",
            q(product.regularPriceText ?? ""),
            q(product.promoPriceText ?? ""),
            product.buyingPrice ?? "",

            product.stock ?? "",
            product.minimumStock ?? "",
            product.stock && product.stock > 0 ? "instock" : "outofstock",

            q(category),
            q(images),

            product.isActive ? "1" : "0",
            q(product.youtubeVideoUrl ?? ""),

            product.createdAt.toISOString(),
            product.updatedAt.toISOString(),
          ].join(","),
        );
      } else {

      /* ============================
         VARIABLE PRODUCT (PARENT)
      ============================ */
        rows.push(
          [
            product.id,
            "variable",
            "",

            q(ar?.name ?? ""),
            q(ar?.description ?? ""),
            q(fr?.name ?? ""),
            q(fr?.description ?? ""),
            q(en?.name ?? ""),
            q(en?.description ?? ""),

            "",
            "",
            "",
            "",
            "",

            "",
            "",
            "",

            q(category),
            q(images),

            product.isActive ? "1" : "0",
            q(product.youtubeVideoUrl ?? ""),

            product.createdAt.toISOString(),
            product.updatedAt.toISOString(),
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
              product.id,

              "",
              "",
              "",
              "",
              "",
              "",

              v.regularPrice ?? "",
              v.promoPrice ?? "",
              "",
              q(v.priceText ?? ""),
              v.buyingPrice ?? "",

              v.stock ?? "",
              v.minimumStock ?? "",
              v.stock > 0 ? "instock" : "outofstock",

              q(category),
              q(v.imageUrl ?? ""),

              v.isActive ? "1" : "0",
              "",

              v.createdAt.toISOString(),
              v.updatedAt.toISOString(),
            ].join(","),
          );
        }
      }
    }

    const csv = [headers.join(","), ...rows].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="products-full-export.csv"`,
      },
    });
  } catch (e) {
    console.error(e);
    return new NextResponse("Export failed", { status: 500 });
  }
}

/* ============================
   HELPERS
============================ */
function t(translations: any[], { lang }: string) {
  return translations?.find((x) => x.language === { lang });
}

function q(v: string) {
  return `"${v.replace(/"/g, '""')}"`;
}
