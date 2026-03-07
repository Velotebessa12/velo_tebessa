import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
 
  

    const packs = await prisma.pack.findMany({
        include : {
            items : {
                include : {
                    product : true
                }
            },
            translations : true
        }
    });

    return NextResponse.json({ packs });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
