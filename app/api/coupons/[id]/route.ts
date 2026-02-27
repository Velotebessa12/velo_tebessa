import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Context = {
  params: Promise<{ id: string }>;
};

/* =========================
   GET /api/coupons/:id
   ========================= */
export async function GET(req: Request, context: Context) {
  try {
    const { id } = await context.params;

    const coupon = await prisma.coupon.findUnique({
      where: { id },
    });

    if (!coupon) {
      return NextResponse.json(
        { error: "Coupon not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(coupon);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/* =========================
   PATCH /api/coupons/:id
   ========================= */
export async function PATCH(req: Request, context: Context) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const data: any = {};

    if (body.code !== undefined) data.code = body.code;
    if (body.type !== undefined) data.type = body.type;
    if (body.value !== undefined) data.value = Number(body.value);

    if (body.maxDiscount !== undefined) {
      data.maxDiscount =
        body.maxDiscount === "" ? null : Number(body.maxDiscount);
    }

    if (body.minAmount !== undefined) {
      data.minAmount =
        body.minAmount === "" ? null : Number(body.minAmount);
    }

    // ✅ SAFE DATE HANDLING (THIS FIXES YOUR ERROR)
    if (body.expirationDate !== undefined) {
      if (!body.expirationDate) {
        // empty string / null → remove expiration
        data.expiresAt = null;
      } else {
        const parsed = new Date(body.expirationDate);

        if (isNaN(parsed.getTime())) {
          return NextResponse.json(
            { error: "Invalid expiration date" },
            { status: 400 }
          );
        }

        data.expiresAt = parsed; // ✅ valid Date object
      }
    }

    if (body.scope !== undefined) data.scope = body.scope;

    if (body.usageLimit !== undefined) {
      data.usageLimit =
        body.usageLimit === "" ? null : Number(body.usageLimit);
    }

    if (body.isActive !== undefined) data.isActive = body.isActive;

    const updatedCoupon = await prisma.coupon.update({
      where: { id },
      data,
    });

    return NextResponse.json(updatedCoupon);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/* =========================
   DELETE /api/coupons/:id
   (soft delete / deactivate)
   ========================= */
export async function DELETE(req: Request, context: Context) {
  try {
    const { id } = await context.params;

    await prisma.coupon.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      message: "Coupon deactivated successfully",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}