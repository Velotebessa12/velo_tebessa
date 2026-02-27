import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const duration = searchParams.get("duration");

    let dateFilter: Date | undefined;
    const now = new Date();

    switch (duration) {
      case "24h":
        dateFilter = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "7d":
        dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "1m":
        dateFilter = new Date();
        dateFilter.setMonth(dateFilter.getMonth() - 1);
        break;
      case "12m":
        dateFilter = new Date();
        dateFilter.setFullYear(dateFilter.getFullYear() - 1);
        break;
      default:
        dateFilter = undefined;
    }

    const where = dateFilter
      ? {
          createdAt: {
            gte: dateFilter,
          },
        }
      : {};

    const [
      // 🔹 STATS (overall)
      usersCount,
      productsCount,
      ordersCount,
      revenue,

      // 🔹 DATA (latest 6)
      users,
      products,
      orders,
    ] = await Promise.all([
      prisma.user.count({
        where: {
          ...where,
          role: "USER",
        },
      }),

      prisma.product.count({
        where,
      }),

      prisma.order.count({
        where,
      }),

      prisma.order.aggregate({
        where,
        _sum: {
          total: true,
        },
      }),

      prisma.user.findMany({
        where: {
          ...where,
          role: "USER",
        },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),

      prisma.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 6,
        include: {
          translations: true,
        },
      }),

      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 6,
        include: {
          customer: true,
          items: true,
        },
      }),
    ]);

    return NextResponse.json({
      stats: {
        totalRevenue: revenue._sum.total || 0,
        ordersCount,
        usersCount,
        productsCount,
      },
      data: {
        users,
        products,
        orders,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}