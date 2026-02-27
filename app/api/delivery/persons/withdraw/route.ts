import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { deliveryPersonId } = await req.json();

    if (!deliveryPersonId) {
      return NextResponse.json(
        { error: "Missing deliveryPersonId" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1️⃣ Get user and pending balance
      const user = await tx.user.findUnique({
        where: { id: deliveryPersonId },
        select: { pendingBalance: true },
      });

      if (!user || user.pendingBalance <= 0) {
        throw new Error("No pending balance");
      }

      const amount = user.pendingBalance;

      // 2️⃣ Create transaction
      const transaction = await tx.transaction.create({
        data: {
          amount: amount,
          description: "Delivery payment settlement",
          direction: "IN",
          type: "DELIVERY_PAYMENT",
        },
      });

      // 3️⃣ Reset pending balance
      await tx.user.update({
        where: { id: deliveryPersonId },
        data: { pendingBalance: 0 },
      });

      return transaction;
    });

    return NextResponse.json({ transaction: result });
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}