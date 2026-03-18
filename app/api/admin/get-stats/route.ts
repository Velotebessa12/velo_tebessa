import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  // Build date filter — applied to orders, users, transactions, etc.
  const dateFilter =
    startDate && endDate
      ? {
          gte: new Date(`${startDate}T00:00:00.000Z`),
          lte: new Date(`${endDate}T23:59:59.999Z`),
        }
      : undefined;

  const orderDateFilter = dateFilter ? { createdAt: dateFilter } : {};
  const userDateFilter = dateFilter ? { createdAt: dateFilter } : {};

  // ─────────────────────────────────────────────
  // 1. PRODUCTS & CUSTOMERS
  // ─────────────────────────────────────────────
  const [totalProducts, totalCustomers, newCustomers] = await Promise.all([
    prisma.product.count({ where: { isActive: true } }),

    prisma.user.count({ where: { role: "USER" } }),

    prisma.user.count({
      where: {
        role: "USER",
        ...userDateFilter,
      },
    }),
  ]);

  // ─────────────────────────────────────────────
  // 2. ORDERS & RETOUR / DELIVERY STATUS
  // ─────────────────────────────────────────────
  const [
    allOrders,
    returnedOrders,
    // Orders grouped by wilaya for retour rate per wilaya
    ordersByWilaya,
    returnsByWilaya,
  ] = await Promise.all([
    prisma.order.findMany({
      where: orderDateFilter,
      select: {
        id: true,
        status: true,
        wilaya: true,
        total: true,
        createdAt: true,
      },
    }),

    prisma.order.count({
      where: {
        ...orderDateFilter,
        status: "RETURNED",
      },
    }),

    // Count all orders per wilaya
    prisma.order.groupBy({
      by: ["wilaya"],
      where: orderDateFilter,
      _count: { id: true },
    }),

    // Count returned orders per wilaya
    prisma.order.groupBy({
      by: ["wilaya"],
      where: {
        ...orderDateFilter,
        status: "RETURNED",
      },
      _count: { id: true },
    }),
  ]);

  const totalOrders = allOrders.length;
  const retourRate =
    totalOrders > 0
      ? parseFloat(((returnedOrders / totalOrders) * 100).toFixed(1))
      : 0;

  // Retour rate per wilaya
  const returnsByWilayaMap: Record<string, number> = {};
  returnsByWilaya.forEach((r) => {
    returnsByWilayaMap[r.wilaya] = r._count.id;
  });

  const retourByWilaya = ordersByWilaya
    .map((w) => {
      const returned = returnsByWilayaMap[w.wilaya] || 0;
      const total = w._count.id;
      return {
        wilaya: w.wilaya,
        total,
        returned,
        rate: parseFloat(((returned / total) * 100).toFixed(1)),
      };
    })
    .sort((a, b) => b.rate - a.rate); // highest retour first

  // ─────────────────────────────────────────────
  // 3. CONFIRMATION TEAM PERFORMANCE
  //    Workers/Managers who handle orders (WORKER role)
  //    We track: orders assigned to each worker vs confirmed (not CANCELED)
  // ─────────────────────────────────────────────

  // Fetch all orders with their customer info for confirmation tracking.
  // "Confirmation" = order moved from PENDING → any status != CANCELED.
  // We use deliveryPersonId as "assigned agent" but confirmation agents are
  // typically WORKER role users. Since the schema has no "confirmedBy" field,
  // we compute confirmation rate per delivery person as a proxy.
  // If you have a confirmationAgentId field, replace deliveryPersonId below.

  const [ordersWithAgent, workers] = await Promise.all([
    prisma.order.findMany({
      where: {
        ...orderDateFilter,
        deliveryPersonId: { not: null },
      },
      select: {
        deliveryPersonId: true,
        status: true,
      },
    }),

    prisma.user.findMany({
      where: { role: { in: ["WORKER", "DELIVERY"] } },
      select: { id: true, name: true },
    }),
  ]);

  // Build per-agent stats
  const agentMap: Record<
    string,
    { name: string; total: number; confirmed: number }
  > = {};
  workers.forEach((w) => {
    agentMap[w.id] = { name: w.name || w.id, total: 0, confirmed: 0 };
  });

  ordersWithAgent.forEach((o) => {
    if (!o.deliveryPersonId) return;
    if (!agentMap[o.deliveryPersonId]) {
      agentMap[o.deliveryPersonId] = {
        name: o.deliveryPersonId,
        total: 0,
        confirmed: 0,
      };
    }
    agentMap[o.deliveryPersonId].total++;
    if (o.status !== "CANCELED" && o.status !== "PENDING") {
      agentMap[o.deliveryPersonId].confirmed++;
    }
  });

  const teamStats = Object.values(agentMap)
    .filter((a) => a.total > 0)
    .map((a) => ({
      name: a.name,
      total: a.total,
      confirmed: a.confirmed,
      rate: parseFloat(((a.confirmed / a.total) * 100).toFixed(1)),
    }))
    .sort((a, b) => b.rate - a.rate);

  // Global confirmation rate
  const totalAssigned = teamStats.reduce((s, a) => s + a.total, 0);
  const totalConfirmed = teamStats.reduce((s, a) => s + a.confirmed, 0);
  const globalConfirmationRate =
    totalAssigned > 0
      ? parseFloat(((totalConfirmed / totalAssigned) * 100).toFixed(1))
      : 0;

  // ─────────────────────────────────────────────
  // 4. FINANCIAL STATS
  // ─────────────────────────────────────────────
  const [
    transactions,
    deliveredOrdersRevenue,
    pendingOrders,
  ] = await Promise.all([
    // All transactions in range (expenses, sales, returns)
    prisma.transaction.findMany({
      where: dateFilter ? { createdAt: dateFilter } : {},
      select: {
        type: true,
        direction: true,
        amount: true,
      },
    }),

    // La caisse = sum of DELIVERED orders
    prisma.order.aggregate({
      where: {
        ...orderDateFilter,
        status: "DELIVERED",
      },
      _sum: { total: true },
    }),

    // Pending revenue = orders not yet delivered/canceled
    prisma.order.aggregate({
      where: {
        ...orderDateFilter,
        status: {
          in: ["PENDING", "PREPARING", "SHIPPED", "IN_TRANSIT", "AT_OFFICE", "OUT_FOR_DELIVERY"],
        },
      },
      _sum: { total: true },
    }),
  ]);

  // La caisse = all IN transactions (sales, deliveries)
  const caisse = deliveredOrdersRevenue._sum.total || 0;

  // Expenses = OUT transactions of type EXPENSE
  const expenses = transactions
    .filter((t) => t.type === "EXPENSE" && t.direction === "OUT")
    .reduce((s, t) => s + t.amount, 0);

  // Return losses
  const returnLosses = transactions
    .filter((t) => t.type === "RETURN_LOSS" && t.direction === "OUT")
    .reduce((s, t) => s + t.amount, 0);

  // Pending profit = sum of orders still in transit
  const pendingRevenue = pendingOrders._sum.total || 0;

  // Net profit = caisse - expenses - returnLosses
  const netProfit = caisse - expenses - returnLosses;

  // ─────────────────────────────────────────────
  // RESPONSE
  // ─────────────────────────────────────────────
  return NextResponse.json({
    // Section 1
    products: {
      total: totalProducts,
      customers: totalCustomers,
      newCustomers,
    },

    // Section 2
    delivery: {
      totalOrders,
      returned: returnedOrders,
      retourRate,
      byWilaya: retourByWilaya,
    },

    // Section 3
    confirmation: {
      globalRate: globalConfirmationRate,
      totalOrders: totalAssigned,
      totalConfirmed,
      team: teamStats,
    },

    // Section 4
    finances: {
      caisse: Math.round(caisse),
      expenses: Math.round(expenses),
      pendingRevenue: Math.round(pendingRevenue),
      returnLosses: Math.round(returnLosses),
      netProfit: Math.round(netProfit),
    },
  });
}