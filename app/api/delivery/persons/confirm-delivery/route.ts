import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { orderId, deliveryPersonId } = await req.json()

    /* ───────── VALIDATION ───────── */
    if (!orderId || !deliveryPersonId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const result = await prisma.$transaction(async (tx) => {
      /* 1️⃣ GET ORDER */
      const order = await tx.order.findUnique({
        where: { id: orderId },
      })

      if (!order) {
        throw new Error("ORDER_NOT_FOUND")
      }

   
      const shippingPrice = Number(order.shippingPrice)

      /* 2️⃣ UPDATE DELIVERY PERSON BALANCE */
      await tx.user.update({
        where: { id: deliveryPersonId },
        data: {
          pendingBalance: {
            increment: shippingPrice,
          },
        },
      })

      /* 3️⃣ CREATE SALE TRANSACTION */
      const transaction = await tx.transaction.create({
        data: {
          description: `Delivery confirmed for order ${order.id}`,
          amount: order.total,
          type: "SALE",
          direction: "IN",
        },
      })

      /* 4️⃣ UPDATE ORDER STATUS */
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: "DELIVERED",
          deliveryPersonId,
          deliveredAt: new Date(),
        },
      })

      return { updatedOrder, transaction }
    })

    return NextResponse.json({
      success: true,
      order: result.updatedOrder,
      transaction: result.transaction,
    })
  } catch (error: any) {
    console.error(error)

    if (error.message === "ORDER_NOT_FOUND") {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    if (error.message === "ORDER_ALREADY_DELIVERED") {
      return NextResponse.json(
        { error: "Order already delivered" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}