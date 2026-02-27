import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const products = await prisma.product.findMany({
      include: {
        translations: true,
        variants: true, // future-proof
      },
    });

    // 1️⃣ Total inventory value (ONLY products without variants)
    const stockPrice = products.reduce((total, product) => {
      if (
        product.variants.length > 0 || // variants handle stock separately
        product.buyingPrice == null ||
        product.stock == null
      ) {
        return total;
      }

      return total + product.buyingPrice * product.stock;
    }, 0);

    // 2️⃣ Low stock products (stock < minimumStock)
    const lowStockProducts = products.filter(
      (p) =>
        p.stock != null &&
        p.minimumStock != null &&
        p.stock > 0 &&
        p.stock < p.minimumStock
    );

    // 3️⃣ Out of stock products
    const outOfStockProducts = products.filter(
      (p) => p.stock === 0
    );

    // 4️⃣ Total operations
    const totalOperations = products.length;

    return NextResponse.json({
      stats: {
        stockPrice,
        totalOperations,
        totalProducts: products.length,
        lowStockCount: lowStockProducts.length,
        outOfStockCount: outOfStockProducts.length,
      },

      data: {
        lowStockProducts,
        outOfStockProducts,
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}