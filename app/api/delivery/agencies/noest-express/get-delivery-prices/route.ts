import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.nextUrl);
    const shippingCompany = searchParams.get("shippingCompany");

    if (!shippingCompany) {
      return NextResponse.json(
        { error: "shippingCompany is required" },
        { status: 400 }
      );
    }

    const wilayas = await prisma.wilaya.findMany({
      where: {
        shippingCompany: shippingCompany,
      },
      orderBy: {
        wilaya_id: "asc",
      },
    });

    const totalProfit = await prisma.profit.aggregate({
      _sum: {
        profit: true,
      },
      where: {
        wilaya: {
          shippingCompany: shippingCompany,
        },
      },
    });

    return NextResponse.json({
      wilayas,
      totalProfit: totalProfit._sum.profit || 0,
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}