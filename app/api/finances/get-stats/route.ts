import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    /* =======================
       1️⃣ REVENUE (DELIVERED ORDERS)
    ======================= */
    const deliveredOrders = await prisma.order.findMany({
      where: { status: "DELIVERED" },
      select: { total: true },
    });

    const revenue = deliveredOrders.reduce(
      (sum, order) => sum + order.total,
      0
    );

    /* =======================
       2️⃣ EXPENSES (TRANSACTIONS OUT)
    ======================= */
    const expenseTransactions = await prisma.transaction.findMany({
      where: {
        direction: "OUT",
        type: {
          in: ["EXPENSE", "DELIVERY_PAYMENT", "RETURN_LOSS"],
        },
      },
      select: { amount: true },
    });

    const expenses = expenseTransactions.reduce(
      (sum, tx) => sum + tx.amount,
      0
    );

    /* =======================
       3️⃣ PROFIT
    ======================= */
    const profit = revenue - expenses;

    /* =======================
       4️⃣ CASHBOX (ALL TRANSACTIONS)
    ======================= */
    const transactions = await prisma.transaction.findMany({
      select: { amount: true, direction: true },
    });

    const cashbox = transactions.reduce((total, tx) => {
      return tx.direction === "IN"
        ? total + tx.amount
        : total - tx.amount;
    }, 0);

    /* =======================
       5️⃣ INVENTORY VALUE
       - Products without variants
       - Variants handle stock separately
    ======================= */
    const products = await prisma.product.findMany({
      include: { variants: true },
    });

    const inventoryValue = products.reduce((total, product) => {
      // Products WITH variants → skip main product stock
      if (product.variants.length > 0) {
        const variantsValue = product.variants.reduce(
          (vTotal, variant) => {
            if (
              variant.buyingPrice == null ||
              variant.stock == null
            )
              return vTotal;

            return vTotal + variant.buyingPrice * variant.stock;
          },
          0
        );

        return total + variantsValue;
      }

      // Products WITHOUT variants
      if (
        product.buyingPrice == null ||
        product.stock == null
      ) {
        return total;
      }

      return total + product.buyingPrice * product.stock;
    }, 0);

    /* =======================
       6️⃣ ZAKAT (2.5%)
    ======================= */
    const zakatableAssets = cashbox + inventoryValue;
    const zakat = zakatableAssets * 0.025;

    /* =======================
       7️⃣ ORDERS & INVOICES
    ======================= */
    const deliveredOrdersCount = deliveredOrders.length;

    const pendingInvoicesCount = await prisma.invoice.count({
      where: { status: "PENDING" },
    });

    return NextResponse.json({
        revenue,
        expenses,
        profit,
        cashbox,
        inventoryValue,
        zakatableAssets,
        zakat,
        deliveredOrders: deliveredOrdersCount,
        pendingInvoices: pendingInvoicesCount,
      });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}