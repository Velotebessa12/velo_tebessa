import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
 


    const additions = await prisma.product.findMany({
        where : {
            type : "ADDITION"
        },
        include : {
         translations : true
        },
        orderBy : {
          createdAt : "desc"
        }
    });

    return NextResponse.json({ additions });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
