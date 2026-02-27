import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { orderId , deliveryPersonId } = await req.json();

    // Validation
    if (!orderId || !deliveryPersonId ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

  const order = await prisma.order.update({
  where: { id: orderId },
  data: {
    deliveryPersonId: deliveryPersonId,
    status: "SHIPPED", 
  },
});

await prisma.user.update({
  where : {id : deliveryPersonId},
  data : {
    pendingBalance : {
      increment : order.shippingPrice
    }
  }
})


    return NextResponse.json({ order });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
