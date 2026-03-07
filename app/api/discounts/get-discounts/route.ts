import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const discounts = await prisma.discount.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        excludedProducts: {
          include: {
            product: true,
          },
        },
        excludedCategories: {
          include: {
            category: true,
          },
        },
      },
    });

    return NextResponse.json({discounts});
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to fetch discounts" },
      { status: 500 }
    );
  }
}