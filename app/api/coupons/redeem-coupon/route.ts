import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { code, cartTotal } = body;

    if (!code || cartTotal === undefined) {
      return NextResponse.json(
        { error: "Code and cartTotal are required" },
        { status: 400 }
      );
    }

    // Find coupon
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (!coupon) {
      return NextResponse.json(
        { error: "Invalid coupon code" },
        { status: 404 }
      );
    }

    // Check active
    if (!coupon.isActive) {
      return NextResponse.json(
        { error: "This coupon is not active" },
        { status: 400 }
      );
    }

    // Check expiration
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Coupon has expired" },
        { status: 400 }
      );
    }

    // Check minimum amount
    if (coupon.minAmount && cartTotal < coupon.minAmount) {
      return NextResponse.json(
        {
          error: `Minimum order amount is ${coupon.minAmount}`,
        },
        { status: 400 }
      );
    }

    // Calculate discount
    let discount = 0;

    if (coupon.type === "PERCENTAGE") {
      discount = (cartTotal * coupon.value) / 100;
    } else {
      discount = coupon.value;
    }

    // Respect max discount limit
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }

    // Ensure discount never exceeds cart total
    if (discount > cartTotal) {
      discount = cartTotal;
    }

    const finalTotal = cartTotal - discount;

     await prisma.coupon.update({
      where: { code: code.trim().toUpperCase()},
      data : {
        usedCount : {
          increment : 1
        },
      },
    });


    return NextResponse.json({
      success: true,
      discount,
      finalTotal,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
      },
    });
    
  } catch (error) {
    console.error("Redeem Coupon Error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
