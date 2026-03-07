import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Context = {
  params: Promise<{ id: string }>;
};

/* =========================
   GET /api/wilayas/:id
   ========================= */
export async function GET(req: Request, context: Context) {
  try {
    const { id } = await context.params;

    const wilaya = await prisma.wilaya.findUnique({
      where: { wilaya_id: Number(id) },
    });

    if (!wilaya) {
      return NextResponse.json(
        { error: "Wilaya not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(wilaya);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/* =========================
   PATCH /api/wilayas/:id
   ========================= */
export async function PATCH(req: Request, context: Context) {
  try {
    const { id } = await context.params;
    const data = await req.json();

    const wilaya = await prisma.wilaya.findUnique({
      where: { wilaya_id: Number(id) },
    });

    if (!wilaya) {
      return NextResponse.json(
        { error: "Wilaya not found" },
        { status: 404 }
      );
    }

    const updatedWilaya = await prisma.wilaya.update({
      where: { wilaya_id: Number(id) },
      data: data,
    });

    return NextResponse.json(updatedWilaya);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/* =========================
   DELETE /api/wilayas/:id
   ========================= */
export async function DELETE(req: Request, context: Context) {
  try {
    const { id } = await context.params;

    const wilaya = await prisma.wilaya.findUnique({
      where: { wilaya_id: Number(id) },
    });

    if (!wilaya) {
      return NextResponse.json(
        { error: "Wilaya not found" },
        { status: 404 }
      );
    }

    await prisma.wilaya.delete({
      where: { wilaya_id: Number(id) },
    });

    return NextResponse.json({
      success: true,
      message: "Wilaya deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}