import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {

      const {searchParams} = new URL(req.nextUrl)
    const shippingCompany = searchParams.get("shippingCompany")

    if(!shippingCompany){
      return NextResponse.json({ error: "shippingCompany is required" }, { status: 400 });
    }



    const orders = await prisma.order.findMany({
        where : {
            shippingCompany : shippingCompany
        },
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
          }
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
