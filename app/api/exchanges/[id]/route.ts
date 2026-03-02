import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Context = {
  params: Promise<{ id: string }>;
};

/* =========================
   GET /api/exchanges/:id
   ========================= */
export async function GET(req: Request, context: Context) {
  try {
    const { id } = await context.params;

    const exchange = await prisma.exchange.findUnique({
      where: { id },
      include: {
        order: true,
        items: true,
      },
    });

    if (!exchange) {
      return NextResponse.json(
        { error: "Exchange not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(exchange);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/* =========================
   PATCH /api/exchanges/:id
   (update status or data)
   ========================= */
export async function PATCH(req: Request, context: Context) {
  try {
    const { id } = await context.params;
    const data = await req.json();

    const exchange = await prisma.exchange.findUnique({
      where: { id },
    });

    if (!exchange) {
      return NextResponse.json(
        { error: "Exchange not found" },
        { status: 404 }
      );
    }

    const updatedExchange = await prisma.exchange.update({
      where: { id },
      data,
      include : {
        items : {
          include : {
            product : true
          }
        },
        customer : true,
        order : true
      }
    });

    return NextResponse.json(updatedExchange);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/* =========================
   DELETE /api/exchanges/:id
   (soft delete / cancel)
   ========================= */
export async function DELETE(req: Request, context: Context) {
  try {
    const { id } = await context.params;

    const exchange = await prisma.exchange.findUnique({
      where: { id },
    });

    if (!exchange) {
      return NextResponse.json(
        { error: "Exchange not found" },
        { status: 404 }
      );
    }

    // await prisma.exchange.update({
    //   where: { id },
    //   data: {
    //     isActive: false,
    //   },
    // });

    return NextResponse.json({
      success: true,
      message: "Exchange cancelled successfully",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}