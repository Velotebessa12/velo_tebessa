import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const wilayaId = Number(searchParams.get("wilayaId"));
    const deliveryType = searchParams.get("deliveryType"); 
    // home | stopdesk
    const shippingCompany = searchParams.get("shippingCompany"); 
    // noest-express | dhd-express
    const isReturn = searchParams.get("isReturn") === "true";

    /* ───────── VALIDATION ───────── */

    if (!wilayaId || !deliveryType || !shippingCompany) {
      return NextResponse.json(
        { error: "wilayaId, deliveryType and shippingCompany are required" },
        { status: 400 }
      );
    }

    if (!["home", "stopdesk"].includes(deliveryType)) {
      return NextResponse.json(
        { error: "Invalid deliveryType" },
        { status: 400 }
      );
    }

    if (!["noest-express", "dhd-express"].includes(shippingCompany)) {
      return NextResponse.json(
        { error: "Invalid shippingCompany" },
        { status: 400 }
      );
    }

    /* ───────── FETCH WILAYA ───────── */

    const wilaya = await prisma.wilaya.findUnique({
      where: { wilaya_id: wilayaId },
    });

    if (!wilaya) {
      return NextResponse.json(
        { error: "Wilaya not found" },
        { status: 404 }
      );
    }

    /* ───────── CHECK COMPANY ───────── */
    if (wilaya.shippingCompany !== shippingCompany) {
      return NextResponse.json(
        {
          error: `Shipping company ${shippingCompany} not available for this wilaya`,
        },
        { status: 400 }
      );
    }

    /* ───────── PRICE LOGIC ───────── */

    let shippingPrice = 0;

    if (isReturn) {
      shippingPrice =
        deliveryType === "home"
          ? wilaya.return_tarif
          : wilaya.return_stopdesk;
    } else {
      shippingPrice =
        deliveryType === "home"
          ? wilaya.delivery_tarif
          : wilaya.delivery_stopdesk;
    }

    return NextResponse.json({
      wilayaId,
      deliveryType,
      shippingCompany,
      isReturn,
      shippingPrice,
    });
  } catch (error) {
    console.error("Get shipping price error:", error);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}