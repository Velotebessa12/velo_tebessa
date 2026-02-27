import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {

    const operations = await prisma.operation.findMany({
      orderBy : {
        createdAt : "desc"
      }
    });

    return NextResponse.json({ operations });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
