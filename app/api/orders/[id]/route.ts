import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

type Context = {
  params: Promise<{ id: string }>
}

/* =========================
   GET /api/orders/:id
   ========================= */
export async function GET(req: Request, context: Context) {
  try {
    const { id } = await context.params

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        customer: true,
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

/* =========================
   PATCH /api/orders/:id
   ========================= */
export async function PATCH(req: Request, context: Context) {
  try {
    const { id } = await context.params
    const data = await req.json()

    const order = await prisma.order.findUnique({
      where: { id },
    })

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data,
    })

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

/* =========================
   DELETE /api/orders/:id
   (hard delete with items)
   ========================= */
export async function DELETE(req: Request, context: Context) {
  try {
    const { id } = await context.params

    const order = await prisma.order.findUnique({
      where: { id },
    })

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    // Delete order + items safely
    await prisma.$transaction([
      prisma.orderItem.deleteMany({
        where: { orderId: id },
      }),
      prisma.order.delete({
        where: { id },
      }),
    ])

    return NextResponse.json({
      success: true,
      message: "Order deleted successfully",
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}