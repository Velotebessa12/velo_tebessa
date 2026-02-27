// create a transaction type whatever add more or lose

import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { description, amount, type , direction} = body;

    // Basic validation
    if (!description || !amount || !type || !direction) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Ensure amount is number
    const parsedAmount = Number(amount);

    if (isNaN(parsedAmount)) {
      return NextResponse.json(
        { message: "Amount must be a number" },
        { status: 400 }
      );
    }

    const transaction = await prisma.transaction.create({
      data: {
        description,
        amount: parsedAmount,
        type,
        direction
      },
    });

    return NextResponse.json({ transaction }, { status: 201 });
  } catch (error) {
    console.error("Create transaction error:", error);

    return NextResponse.json(
      { message: "Failed to create transaction" },
      { status: 500 }
    );
  }
}
