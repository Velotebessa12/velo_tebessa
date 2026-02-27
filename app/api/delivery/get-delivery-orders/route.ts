import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
 
  

    const orders = await prisma.order.findMany({
        where : {
            deliveryAgency : {
                not : null
            }
        }});

    return NextResponse.json({ orders });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
