import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { message: "Order id is required" },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id },
    });

    console.log(order)

    if (!order) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 }
      );
    }

    const transaction = await prisma.transaction.create({
      data: {
        description: `Delivery confirmed for order ${order.id}`,
        amount: order.total,
        type: "SALE",
        direction: "IN",
      },
    });

    return NextResponse.json({ transaction }, { status: 201 });

  } catch (error) {
    console.error("Push transaction error:", error);

    return NextResponse.json(
      { message: "Failed to create transaction" },
      { status: 500 }
    );
  }
}