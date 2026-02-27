import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
 
  

    const deliveryPersons = await prisma.user.findMany({
        where : {
            role : "DELIVERY"
        },
        include : {
          deliveryOrders : true
        },
        orderBy : {
          createdAt : "desc"
        }
});

    return NextResponse.json({ deliveryPersons });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
