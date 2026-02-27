import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {

    const images = await prisma.image.findMany({
      orderBy : {
        createdAt : "desc"
      }
    });

    return NextResponse.json({ images });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
