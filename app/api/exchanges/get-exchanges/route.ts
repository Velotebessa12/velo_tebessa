import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
  
    const exchanges = await prisma.exchange.findMany({
      orderBy : {
        createdAt : "desc"
      },
      include : {
        items : {
          include : {
            product : true
          }
        },
        customer : true,
        order : true
      }
    });

 

    return NextResponse.json({ exchanges });

  } catch (error) {
    console.error("Get exchanges error:", error);

    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}
