export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


// {
//   "orderId": "uuid",
//   "returnItems": [
//     {
//       "id": "productId",
//       "price": 53000,
//       "quantity": 2,
//       "name": "Product name",
//       "variant": "Size M",
//       "reason": "Damaged"
//     }
//   ],
//   "refundMethod": "ORIGINAL_PAYMENT",
//   "reason": "Wrong size"
// }

export async function POST(req: NextRequest) {
  try {
    const {
      orderId,
      returnItems,
      refundMethod,
      reason,
    } = await req.json();

    console.log(returnItems)

    /* ───────── VALIDATION ───────── */

    if (!orderId) {
      return NextResponse.json(
        { error: "orderId is required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(returnItems) || returnItems.length === 0) {
      return NextResponse.json(
        { error: "Return must contain items" },
        { status: 400 }
      );
    }

    if (!refundMethod) {
      return NextResponse.json(
        { error: "refundMethod is required" },
        { status: 400 }
      );
    }

    /* ───────── GET ORDER ───────── */

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { customerId: true },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    /* ───────── CALCULATE REFUND TOTAL ───────── */

    const refundTotal = returnItems.reduce((sum: number, item: any) => {
      const price = Number(item.price ?? 0);
      const quantity = Number(item.quantity ?? 0);
      return sum + price * quantity;
    }, 0);

    if (refundTotal <= 0) {
      return NextResponse.json(
        { error: "Invalid refund total" },
        { status: 400 }
      );
    }

    /* ───────── NORMALIZE ITEMS ───────── */

    const returnItemsData = returnItems
      .filter(
        (item: any) =>
          item.id &&
          item.price != null &&
          item.quantity != null
      )
      .map((item: any) => ({
        productId: item.id, // 👈 important
        name: item.name ?? "",
        variant: item.variant ?? null,
        price: Number(item.price),
        quantity: Number(item.quantity),
        total: Number(item.price) * Number(item.quantity),
        reason: item.reason ?? null,
      }));

    if (returnItemsData.length === 0) {
      return NextResponse.json(
        { error: "No valid items to process" },
        { status: 400 }
      );
    }

    /* ───────── CREATE RETURN (TRANSACTION) ───────── */

    const createdReturn = await prisma.$transaction(async (tx) => {
      const ret = await tx.return.create({
        data: {
          returnNumber: `RT-${Date.now()}`,
          refundTotal,
          refundMethod,
          reason,

          order: { connect: { id: orderId } },
          customer: { connect: { id: order.customerId! } },

          items: {
            create: returnItemsData,
          },
        },
        include: {
          items: true,
        },
      });

      return ret;
    });

    return NextResponse.json(createdReturn, { status: 201 });

  } catch (error: any) {
    console.error("Create return error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create return" },
      { status: 500 }
    );
  }
}