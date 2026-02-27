import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  try {
 
   const { orderId , status } = await req.json()
    


    const order = await prisma.order.update({
        where : {
            id : orderId
        },
        data : {
            status
        }
    })

    return NextResponse.json({ order });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
