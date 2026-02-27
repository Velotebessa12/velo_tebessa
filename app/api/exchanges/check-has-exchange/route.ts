import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const exchangeCount = await prisma.exchange.count({
      where: {
        customerId: userId,
        status : "APPROVED"
      },
    });

    console.log(exchangeCount > 0)

    return NextResponse.json({
      hasExchange: exchangeCount > 0,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}