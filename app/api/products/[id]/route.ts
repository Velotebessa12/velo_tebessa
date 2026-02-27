import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Context = {
  params: Promise<{ id: string }>;
};

// GET /api/products/:id
export async function GET(req: Request, context: Context) {
  const { id } = await context.params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      translations: true,
      variants: true,
    },
  });

  if (!product) {
    return NextResponse.json(
      { error: "Product not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(product);
}

// PATCH /api/products/:id
export async function PATCH(req: Request, context: Context) {
  const { id } = await context.params;

  const formData = await req.formData();

  // Convert FormData → plain object
  const data: Record<string, any> = {};

  formData.forEach((value, key) => {
    // Handle numbers
    if (key.includes("Price")) {
      data[key] = value === "" ? null : Number(value);
    } else {
      data[key] = value;
    }
  });

  const product = await prisma.product.update({
    where: { id },
    data,
  });

  return NextResponse.json(product);
}

// DELETE /api/products/:id (SAFE)
export async function DELETE(req: Request, context: Context) {
  const { id } = await context.params;

  // 1️⃣ Block if product has orders
  const orderCount = await prisma.orderItem.count({
    where: { productId: id },
  });

  if (orderCount > 0) {
    return NextResponse.json(
      {
        error:
          "This product cannot be deactivated because it has associated orders.",
      },
      { status: 409 }
    );
  }

  // 2️⃣ Soft delete instead of hard delete
  await prisma.product.update({
    where: { id },
    data: { isActive: false },
  });

  return NextResponse.json({
    success: true,
    message: "Product deactivated successfully",
  });
}
