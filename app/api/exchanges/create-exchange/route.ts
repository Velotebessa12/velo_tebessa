export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const {
      orderId,
      returningItems,
      newCartItems,
      reason,
    } = await req.json();

    /* ───────── VALIDATION ───────── */

    if (!orderId) {
      return NextResponse.json(
        { error: "orderId is required" },
        { status: 400 }
      );
    }

    if (
      (!Array.isArray(returningItems) || returningItems.length === 0) &&
      (!Array.isArray(newCartItems) || newCartItems.length === 0)
    ) {
      return NextResponse.json(
        { error: "Exchange must contain items" },
        { status: 400 }
      );
    }

    /* ───────── GET ORDER ───────── */

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { customerId: true },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    /* ───────── CALCULATE TOTALS (SAFE) ───────── */

    const returnedTotal = Array.isArray(returningItems)
      ? returningItems.reduce((sum: number, item: any) => {
          const price = Number(item.price ?? 0);
          const quantity = Number(item.quantity ?? 0);
          return sum + price * quantity;
        }, 0)
      : 0;

    const newTotal = Array.isArray(newCartItems)
      ? newCartItems.reduce((sum: number, item: any) => {
          const price = Number(item.price ?? 0);
          const quantity = Number(item.quantity ?? 0);
          return sum + price * quantity;
        }, 0)
      : 0;

    const difference = newTotal - returnedTotal;

    /* ───────── NORMALIZE ITEMS ───────── */

    const returnedItemsData = (returningItems || [])
      .filter(
        (item: any) =>
          item.productId &&
          item.price != null &&
          item.quantity != null
      )
      .map((item: any) => ({
        productId: item.productId,
        type: "RETURNED",
        name: item.name ?? "",
        variant: item.variant ?? null,
        price: Number(item.price),
        quantity: Number(item.quantity),
        total: Number(item.price) * Number(item.quantity),
      }));

    const newItemsData = (newCartItems || [])
      .filter(
        (item: any) =>
          item.productId &&
          item.price != null &&
          item.quantity != null
      )
      .map((item: any) => ({
        productId: item.productId,
        type: "NEW",
        name: item.name ?? "",
        variant: item.variant ?? null,
        price: Number(item.price),
        quantity: Number(item.quantity),
        total: Number(item.price) * Number(item.quantity),
      }));

    if (returnedItemsData.length === 0 && newItemsData.length === 0) {
      return NextResponse.json(
        { error: "No valid items to process" },
        { status: 400 }
      );
    }

    /* ───────── CREATE EXCHANGE ───────── */

    const exchange = await prisma.exchange.create({
      data: {
        exchangeNumber: `EX-${Date.now()}`,
        reason,

        order: {
          connect: { id: orderId },
        },

        customer: {
          connect: { id: order.customerId },
        },

        returnedTotal,
        newTotal,
        difference,

        items: {
          create: [...returnedItemsData, ...newItemsData],
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(exchange, { status: 201 });
  } catch (error: any) {
    console.error("Create exchange error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create exchange" },
      { status: 500 }
    );
  }
}