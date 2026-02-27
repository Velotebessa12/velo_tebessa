import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
 
   const { searchParams } = new URL(req.url);

    const orderId = searchParams.get("orderId");

    if(!orderId){
         return NextResponse.json({ error: "OrderId is required" }, { status: 400 });
    }


    const order = await prisma.order.findUnique({
        where : {
            id : orderId
        },
        include : {
          customer : true,
          items : {
            include : {
              addOns : true,
              product : {
                include : {
                  translations : true
                }
              }
            },
          }
        }
});

    return NextResponse.json({ order });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
