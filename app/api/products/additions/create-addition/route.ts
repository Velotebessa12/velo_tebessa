import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // 🔥 Pricing (same logic as product)
    const buyingPrice = Number(formData.get("buyingPrice"));
    const regularPrice = Number(formData.get("regularPrice"));

    const promoRaw = formData.get("promoPrice");
    const promoPrice =
      promoRaw !== null && promoRaw !== "null"
        ? Number(promoRaw)
        : null;

    const stock = Number(formData.get("stock"));
    const priceText = formData.get("priceText") as string | null;

    const translationsRaw = formData.get("translations") as string;
    const addonsRaw = formData.get("addons") as string;
    const images = formData.getAll("images") as File[];

    // ✅ Validation
    if (
      Number.isNaN(regularPrice) ||
      Number.isNaN(stock) ||
      images.length === 0
    ) {
      return NextResponse.json(
        { error: "Missing or invalid required fields" },
        { status: 400 }
      );
    }

    // Upload images
    const uploadedUrls = await Promise.all(
      images.map((img) => uploadToCloudinary(img))
    );

    let translations: any[] = [];
    let addons: any[] = [];

    try {
      translations = translationsRaw ? JSON.parse(translationsRaw) : [];
      addons = addonsRaw ? JSON.parse(addonsRaw) : [];
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON format" },
        { status: 400 }
      );
    }

    translations = translations.filter(
      (t: any) => t.name && t.name.trim() !== ""
    );

    if (!translations.length) {
      return NextResponse.json(
        { error: "At least one translation is required" },
        { status: 400 }
      );
    }

    // ✅ Create ADDITION product
    const product = await prisma.product.create({
      data: {
        buyingPrice,
        regularPrice,
        promoPrice,
        regularPriceText : priceText || undefined,
        stock,
        type: "ADDITION",
        images: uploadedUrls,

        translations: {
          create: translations.map((t: any) => ({
            language: t.language,
            name: t.name,
          })),
        },

        addonsAsMain: {
          create: addons.map((a: any) => ({
            addonProductId: a.addonProductId,
            required: a.required || false,
          })),
        },
      },

      include: {
        translations: true,
        addonsAsMain: true,
      },
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
