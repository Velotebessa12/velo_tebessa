import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
 
  

    const employees = await prisma.user.findMany({
        where : {
            role : {
                notIn : ["USER" , "DELIVERY"] 
            }
        }
});

    return NextResponse.json({ employees });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
