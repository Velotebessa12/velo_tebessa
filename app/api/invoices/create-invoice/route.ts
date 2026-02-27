import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      supplierName,
      contact,
      invoiceNumber,
      status,
      notes,
      total,
      items,
    } = body;

    // ===== 1️⃣ Basic validation =====
    if (!supplierName || !status || !Array.isArray(items) || items.length === 0) {
      throw new Error("Missing required fields");
    }

    // ===== 2️⃣ Validate items =====
    for (const item of items) {
      if (
        !item.productId ||
        typeof item.qty !== "number" ||
        item.qty <= 0 ||
        typeof item.unitPrice !== "number" ||
        item.unitPrice < 0
      ) {
        throw new Error("Invalid invoice item");
      }
    }

  

    // ===== 4️⃣ Create invoice + items =====
    const invoice = await prisma.invoice.create({
      data: {
        supplierName,
        contact,
        invoiceNumber,
        status,
        notes,
        totalAmount : total,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.qty,
            unitPrice: item.unitPrice,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({ invoice }, { status: 201 });
  } catch (error) {
    console.error("CREATE INVOICE ERROR:", error);
    return NextResponse.json(
      { error: "Invoice creation failed" },
      { status: 500 }
    );
  }
}