import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
 
   const { searchParams } = new URL(req.url);

    const customerId = searchParams.get("customerId");
    const status = searchParams.get("status");

    const where : any = {}
    if(customerId){
      where.customerId = customerId
    }

     if (status) {
      where.status = status;
    }


    const orders = await prisma.order.findMany({
        where,
        include : {
          customer : true,
          items : {
            include : {
              product : {
                include : {
                  translations : true
                }
              }
            }
          },
          exchanges : true,
          returns : true
        },
        orderBy : {
          createdAt : "desc"
        }
    });

    return NextResponse.json({ orders });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
