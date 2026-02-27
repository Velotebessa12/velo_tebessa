import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Context = {
  params: Promise<{ id: string }>;
};

/* =========================
   GET /api/cash-register/transactions/:id
   ========================= */
export async function GET(req: Request, context: Context) {
  try {
    const { id } = await context.params;

    const transaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(transaction);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/* =========================
   PATCH /api/cash-register/transactions/:id
   ========================= */
export async function PATCH(req: Request, context: Context) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const transaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    const data: any = {};

    if (body.description !== undefined)
      data.description = body.description;

    if (body.amount !== undefined)
      data.amount = Number(body.amount);

    if (body.type !== undefined)
      data.type = body.type;

    if (body.direction !== undefined)
      data.direction = body.direction;

    const updatedTransaction = await prisma.transaction.update({
      where: { id },
      data,
    });

    return NextResponse.json(updatedTransaction);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/* =========================
   DELETE /api/cash-register/transactions/:id
   ========================= */
export async function DELETE(req: Request, context: Context) {
  try {
    const { id } = await context.params;

    await prisma.transaction.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}