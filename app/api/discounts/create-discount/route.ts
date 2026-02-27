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
      startsAt,
      endsAt,
      priority = 0,
      productIds = [],
      categoryIds = [],
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
          value,
          startsAt: startsAt ? new Date(startsAt) : null,
          endsAt: endsAt ? new Date(endsAt) : null,
          priority,
        },
      });

      if (productIds.length > 0) {
        await tx.discountProduct.createMany({
          data: productIds.map((productId: string) => ({
            discountId: createdDiscount.id,
            productId,
          })),
          skipDuplicates: true,
        });
      }

      if (categoryIds.length > 0) {
        await tx.discountCategory.createMany({
          data: categoryIds.map((categoryId: string) => ({
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
