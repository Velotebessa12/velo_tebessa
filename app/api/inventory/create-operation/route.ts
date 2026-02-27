import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { productId, quantity, price, type, reason } = await req.json();

    // Validation
    if (!productId || !quantity || !price || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find product
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Calculate new stock
    let newStock =
      type === "IN"
        ? product.stock + quantity
        : product.stock - quantity;

    if (newStock < 0) {
      return NextResponse.json(
        { error: "Stock cannot be negative" },
        { status: 400 }
      );
    }

    // 👇 IMPORTANT CHANGE
    const totalPrice = price * quantity;

    // Use transaction to keep data safe
    const operation = await prisma.$transaction(async (tx) => {
      // Update product stock
      await tx.product.update({
        where: { id: productId },
        data: {
          stock: newStock,
        },
      });

      // Create operation record with multiplied price
      return await tx.operation.create({
        data: {
          productId,
          quantity,
          price: totalPrice,   // <-- store total value, not unit price
          type,
          stock: newStock,
          reason,
        },
      });
    });

    return NextResponse.json({ operation });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
