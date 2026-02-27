import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAgencyStatus, mapNoestStatusToOrderStatus } from "@/data";
import { OrderStatus } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customerId } = body;

    if (!customerId) {
      return NextResponse.json(
        { error: "customerId is required" },
        { status: 400 }
      );
    }

    // 1️⃣ Get ONLY this customer's orders that can still change
    const orders = await prisma.order.findMany({
      where: {
        customerId,
        trackingId: { not: null },
        status: {
          notIn: ["DELIVERED", "CANCELED", "RETURNED"],
        },
      },
    });

    let updatedCount = 0;

    // Status priority to prevent downgrade
    const statusPriority: Record<OrderStatus, number> = {
      PENDING: 1,
      PREPARING: 2,
      SHIPPED: 3,
      IN_TRANSIT: 4,
      AT_OFFICE: 5,
      OUT_FOR_DELIVERY: 6,
      DELIVERED: 7,
      RETURNED: 8,
      CANCELED: 9,
    };

    for (const order of orders) {
      const agencyStatus = await getAgencyStatus(order.trackingId!);
      const mappedStatus = mapNoestStatusToOrderStatus(agencyStatus);

      // Ignore invalid or unchanged status
      if (!mappedStatus || mappedStatus === order.status) continue;

      // Prevent status downgrade
      if (
        statusPriority[mappedStatus] <
        statusPriority[order.status]
      ) {
        continue;
      }

      await prisma.$transaction(async (tx) => {
        // 2️⃣ Update order
        await tx.order.update({
          where: { id: order.id },
          data: {
            status: mappedStatus,
            deliveredAt:
              mappedStatus === "DELIVERED" && !order.deliveredAt
                ? new Date()
                : order.deliveredAt,
          },
        });

        // 3️⃣ Sync invoice state
        if (mappedStatus === "DELIVERED") {
          await tx.invoice.updateMany({
            where: {
              orderId: order.id,
              status: "PENDING",
            },
            data: { status: "RECEIVED" },
          });
        }

        if (mappedStatus === "CANCELED" || mappedStatus === "RETURNED") {
          await tx.invoice.updateMany({
            where: {
              orderId: order.id,
              status: "PENDING",
            },
            data: { status: "CANCELLED" },
          });
        }
      });

      updatedCount++;
    }

    return NextResponse.json({
      synced: true,
      updatedOrders: updatedCount,
    });
  } catch (error) {
    console.error("Order sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync order statuses" },
      { status: 500 }
    );
  }
}
