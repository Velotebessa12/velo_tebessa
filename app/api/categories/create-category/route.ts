import { prisma } from "@/lib/prisma";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const slug = formData.get("slug") as string;
    const imageUrl = formData.get("image") as string;
    const translationsRaw = formData.get("translations") as string;

    if (!slug || !imageUrl || !translationsRaw) {
      return NextResponse.json(
        { error: "Slug, image, and translations are required" },
        { status: 400 }
      );
    }

    // Parse translations
    let translations: any[] = [];
    try {
      translations = JSON.parse(translationsRaw);
    } catch {
      return NextResponse.json(
        { error: "Invalid translations JSON" },
        { status: 400 }
      );
    }

    // Filter invalid translations
    translations = translations.filter(
      (t) => t.language && t.name && t.name.trim() !== ""
    );

    if (translations.length === 0) {
      return NextResponse.json(
        { error: "At least one valid translation is required" },
        { status: 400 }
      );
    }


    

    // Create category with translations
    const category = await prisma.category.create({
      data: {
        slug,
        imageUrl,

        translations: {
          create: translations.map((t) => ({
            language: t.language,
            name: t.name,
            description: t.description || null,
          })),
        },
      },
      include: {
        translations: true,
      },
    });

    return NextResponse.json({ category });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
