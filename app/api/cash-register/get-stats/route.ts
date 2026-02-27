import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const transactions = await prisma.transaction.findMany({
    select: {
      amount: true,
      direction: true,
    },
  });

  let totalIn = 0;
  let totalOut = 0;

  for (const tx of transactions) {
    if (tx.direction === "IN") {
      totalIn += tx.amount;
    } else {
      totalOut += tx.amount;
    }
  }

  const currentBalance = totalIn - totalOut;

  return NextResponse.json({
    totalIn,
    totalOut,
    currentBalance,

    // ⚠️ NOT real profit — see explanation
    profitLoss: totalIn - totalOut,
  });
}
