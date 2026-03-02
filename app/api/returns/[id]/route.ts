import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Context = {
  params: Promise<{ id: string }>;
};

/* =========================
   GET /api/returns/:id
   ========================= */
export async function GET(req: Request, context: Context) {
  try {
    const { id } = await context.params;

    const returnRequest = await prisma.return.findUnique({
      where: { id },
      include: {
        order: true,
        items: true,
      },
    });

    if (!returnRequest) {
      return NextResponse.json(
        { error: "Return not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(returnRequest);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/* =========================
   PATCH /api/returns/:id
   (update status or data)
   ========================= */
export async function PATCH(req: Request, context: Context) {
  try {
    const { id } = await context.params;
    const data = await req.json();

    const returnRequest = await prisma.return.findUnique({
      where: { id },
    });

    if (!returnRequest) {
      return NextResponse.json(
        { error: "Return not found" },
        { status: 404 }
      );
    }

    const updatedReturn = await prisma.return.update({
      where: { id },
      data,
      include: {
        order: true,
        items: true,
      },
    });

    return NextResponse.json(updatedReturn);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/* =========================
   DELETE /api/returns/:id
   (soft delete / cancel)
   ========================= */
export async function DELETE(req: Request, context: Context) {
  try {
    const { id } = await context.params;

    const returnRequest = await prisma.return.findUnique({
      where: { id },
    });

    if (!returnRequest) {
      return NextResponse.json(
        { error: "Return not found" },
        { status: 404 }
      );
    }

    // await prisma.return.update({
    //   where: { id },
    //   data: {
    //     isActive: false, // or status: "CANCELLED"
    //   },
    // });

    return NextResponse.json({
      success: true,
      message: "Return cancelled successfully",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}