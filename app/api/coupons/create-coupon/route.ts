import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      code,
      type,
      value,
      maxDiscount,
      minAmount,
      expiresAt,
      isActive,
      usageLimit
    } = body;

    // Basic validation
    if (!code || !type || value === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate type
    if (!["PERCENTAGE", "FIXED"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid coupon type" },
        { status: 400 }
      );
    }

    // Prevent negative values
    if (value < 0) {
      return NextResponse.json(
        { error: "Value cannot be negative" },
        { status: 400 }
      );
    }

    // If percentage, value must be <= 100
    if (type === "PERCENTAGE" && value > 100) {
      return NextResponse.json(
        { error: "Percentage cannot exceed 100" },
        { status: 400 }
      );
    }

    // Check if coupon already exists
    const existing = await prisma.coupon.findUnique({
      where: { code },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Coupon code already exists" },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.trim().toUpperCase(),
        type,
        value: Number(value),
        maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
        minAmount: minAmount ? Number(minAmount) : undefined,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        isActive: isActive ?? true,
        usageLimit
      },
    });

    return NextResponse.json({ coupon }, { status: 201 });

  } catch (error) {
    console.error("Create Coupon Error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
