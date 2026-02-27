import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Context = {
  params: Promise<{ id: string }>;
};

/* =========================
   GET /api/customers/:id
   ========================= */
export async function GET(req: Request, context: Context) {
  try {
    const { id } = await context.params;

    const customer = await prisma.user.findUnique({
      where: { id },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(customer);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/* =========================
   PATCH /api/customers/:id
   ========================= */
export async function PATCH(req: Request, context: Context) {
  try {
    const { id } = await context.params;
    const data = await req.json();

    const customer = await prisma.user.findUnique({
      where: { id },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    const updatedCustomer = await prisma.user.update({
      where: { id },
      data: data,
      include : {
        customerOrders : true
      }
    });

    return NextResponse.json(updatedCustomer);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/* =========================
   DELETE /api/customers/:id
   (soft delete / deactivate)
   ========================= */
export async function DELETE(req: Request, context: Context) {
  try {
    const { id } = await context.params;

    // Optional safety check: block if customer has orders
    const orderCount = await prisma.order.count({
      where: { customerId: id },
    });

    if (orderCount > 0) {
      return NextResponse.json(
        {
          error:
            "This customer cannot be deactivated because they have associated orders.",
        },
        { status: 409 }
      );
    }

    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      message: "Customer deactivated successfully",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}