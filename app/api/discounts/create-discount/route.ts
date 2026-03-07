import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      name,
      description,
      type,
      value,
      customerType = "ALL",
      minimumAmount,
      maxDiscount,
      usageLimit,
      startsAt,
      endsAt,
      priority = 0,
      excludedProductIds = [],
      excludedCategoryIds = [],
    } = body;

    if (!name || !type || value == null) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const discount = await prisma.$transaction(async (tx) => {
      const createdDiscount = await tx.discount.create({
        data: {
          name,
          description,
          type,
          value: Number(value),
          customerType,
          minimumAmount: minimumAmount ? Number(minimumAmount) : null,
          maxDiscount: maxDiscount ? Number(maxDiscount) : null,
          usageLimit: usageLimit ? Number(usageLimit) : null,
          startsAt: startsAt ? new Date(startsAt) : null,
          endsAt: endsAt ? new Date(endsAt) : null,
          priority,
        },
      });

      if (excludedProductIds.length > 0) {
        await tx.discountExcludedProduct.createMany({
          data: excludedProductIds.map((productId: string) => ({
            discountId: createdDiscount.id,
            productId,
          })),
          skipDuplicates: true,
        });
      }

      if (excludedCategoryIds.length > 0) {
        await tx.discountExcludedCategory.createMany({
          data: excludedCategoryIds.map((categoryId: string) => ({
            discountId: createdDiscount.id,
            categoryId,
          })),
          skipDuplicates: true,
        });
      }

      return createdDiscount;
    });

    return NextResponse.json(discount, { status: 201 });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to create discount" },
      { status: 500 }
    );
  }
}