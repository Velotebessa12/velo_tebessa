import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const deliveryPersonId = searchParams.get("deliveryPersonId");

  


    // ✅ build where condition dynamically
    const whereCondition: any = {
      // status: "PENDING",
    };

    if (deliveryPersonId) {
      // case 1: specific delivery person
      whereCondition.deliveryPersonId = deliveryPersonId;
    } else {
      // case 2: any assigned delivery person
      whereCondition.deliveryPersonId = {
        not: null,
      };
    }

    const pendingDeliveries = await prisma.order.findMany({
      where: whereCondition,
      include: {
        customer: true,
        items: {
          include: {
            product: {
              include: {
                translations: true,
              },
            },
          },
        },
        deliveryPerson: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

 

    return NextResponse.json({ pendingDeliveries });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}
