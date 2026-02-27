import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Context = {
  params: Promise<{ id: string }>;
};

/* =========================
   GET /api/categories/:id
   ========================= */
export async function GET(req: Request, context: Context) {
  try {
    const { id } = await context.params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        translations: true,
        products: true,
        discounts: true,
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/* =========================
   PATCH /api/categories/:id
   ========================= */
export async function PATCH(req: Request, context: Context) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const data: any = {};

    if (body.slug !== undefined) data.slug = body.slug;
    if (body.imageUrl !== undefined) data.imageUrl = body.imageUrl;

    const updatedCategory = await prisma.category.update({
      where: { id },
      data,
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/* =========================
   DELETE /api/categories/:id
   ========================= */
export async function DELETE(req: Request, context: Context) {
  try {
    const { id } = await context.params;

    // 1️⃣ Delete category translations
    await prisma.categoryTranslation.deleteMany({
      where: { categoryId: id },
    });

    // 2️⃣ Delete discount relations (pivot table)
    await prisma.discountCategory.deleteMany({
      where: { categoryId: id },
    });

    // 3️⃣ Disconnect category from products (if relation table exists)
    await prisma.product.updateMany({
      where: { categoryId: id },
      data: { categoryId: null },
    });

    // 4️⃣ Finally delete the category itself
    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Category and all related data deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}