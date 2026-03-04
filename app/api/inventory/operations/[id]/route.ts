import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Context = {
  params: Promise<{ id: string }>;
};

/* =========================
   GET /api/operations/:id
   ========================= */
export async function GET(req: Request, context: Context) {
  try {
    const { id } = await context.params;

    const operation = await prisma.operation.findUnique({
      where: { id },
      include: {
        product: true,
      },
    });

    if (!operation) {
      return NextResponse.json(
        { error: "Operation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(operation);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/* =========================
   PATCH /api/operations/:id
   ========================= */
export async function PATCH(req: Request, context: Context) {
  try {
    const { id } = await context.params;
    const data = await req.json();

    const operation = await prisma.operation.findUnique({
      where: { id },
    });

    if (!operation) {
      return NextResponse.json(
        { error: "Operation not found" },
        { status: 404 }
      );
    }

    const updatedOperation = await prisma.operation.update({
      where: { id },
      data,
      include: {
        product: true,
      },
    });

    return NextResponse.json(updatedOperation);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/* =========================
   DELETE /api/operations/:id
   ========================= */
export async function DELETE(req: Request, context: Context) {
  try {
    const { id } = await context.params;

    const operation = await prisma.operation.findUnique({
      where: { id },
    });

    if (!operation) {
      return NextResponse.json(
        { error: "Operation not found" },
        { status: 404 }
      );
    }

    await prisma.operation.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Operation deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}