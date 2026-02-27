import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json()

    /* ───────── VALIDATION ───────── */
    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      )
    }

    const result = await prisma.$transaction(async (tx) => {
      /* 1️⃣ GET ORDER WITH ITEMS */
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          items: true,
        },
      })

      if (!order) {
        throw new Error("ORDER_NOT_FOUND")
      }

      if (order.status === "RETURNED") {
        throw new Error("ORDER_ALREADY_RETURNED")
      }

   

      /* 2️⃣ RESTORE PRODUCT STOCK */
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        })
      }

      /* 3️⃣ MARK ORDER AS RETURNED */
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: "RETURNED",
        },
      })

      /* 4️⃣ RECORD DELIVERY LOSS (OPTIONAL TRANSACTION) */
      if (order.shippingPrice && order.shippingPrice > 0) {
        await tx.transaction.create({
          data: {
            type: "RETURN",
            direction: "OUT",
            amount: Number(order.shippingPrice),
            description: `Delivery return loss for order ${order.id}`,
          },
        })
      }

      return updatedOrder
    })

    return NextResponse.json({
      success: true,
      order: result,
    })
  } catch (error: any) {
    console.error(error)

    const errorMap: Record<string, string> = {
      ORDER_NOT_FOUND: "Order not found",
      ORDER_ALREADY_RETURNED: "Order already returned",
      ORDER_ALREADY_CONFIRMED: "Confirmed orders cannot be returned",
    }

    if (errorMap[error.message]) {
      return NextResponse.json(
        { error: errorMap[error.message] },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}