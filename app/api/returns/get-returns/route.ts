import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
 


    const returns = await prisma.return.findMany({
        include : {
         items : true,
         customer : true,
        },
        orderBy : {
          createdAt : "desc"
        }
    });

    return NextResponse.json({ returns });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
