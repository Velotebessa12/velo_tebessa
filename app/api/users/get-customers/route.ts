import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const slug = searchParams.get("slug");
    const searchQuery = searchParams.get("searchQuery");
    const price = searchParams.get("price");
// use for new users or old
  

    const customers = await prisma.user.findMany({
      where : {
        role : "USER"
      },
      include : {
        customerOrders : true
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ customers });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
